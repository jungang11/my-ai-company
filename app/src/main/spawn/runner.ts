import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DONE_MARKER_NAME,
  OUTPUT_LOG_NAME,
  SESSIONS_DIR,
  type SpawnRequest,
} from '@core/spawn/protocol';
import { getEmployee } from '../employee/manager.js';
import { killTree } from '../kill-tree.js';
import { StatusTracker } from '../status.js';
import type { SubSessionMetrics, Vendor } from '../../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// __dirname = app/out/main → ../../.. = project root
const projectRoot = resolve(__dirname, '../../..');

type EmployeeDef = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  cliBackend: string;
  vendor?: Vendor;
  model?: string;
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  shortDescription?: string;
  active: boolean;
};

export type SubSessionUpdate =
  | {
      kind: 'started';
      sessionId: string;
      employee: EmployeeDef;
      prompt: string;
      startedAt: number;
    }
  | { kind: 'chunk'; sessionId: string; text: string }
  | {
      kind: 'done';
      sessionId: string;
      exitCode: number;
      endedAt: number;
      metrics: SubSessionMetrics;
      employee: EmployeeDef;
      prompt: string;
      /** 누적된 sub 응답 텍스트 (사장 PM에게 inline 주입용) */
      output: string;
    };

export type SubSessionCallback = (update: SubSessionUpdate) => void;

const active = new Map<string, ChildProcessWithoutNullStreams>();

function loadEmployee(employeeId: string): EmployeeDef {
  // manager.getEmployee — 활성 catalog override(vendor/model/effort) 자동 적용.
  const emp = getEmployee(employeeId);
  if (!emp) {
    throw new Error(`employee 정의 없음: ${employeeId}`);
  }
  return emp as EmployeeDef;
}

function ensureSessionDir(sessionId: string): string {
  const dir = resolve(projectRoot, SESSIONS_DIR, sessionId);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function runSubSession(req: SpawnRequest, cb: SubSessionCallback): void {
  if (active.has(req.id)) {
    return;
  }

  const employee = loadEmployee(req.employeeId);
  if (!employee.active) {
    // 비활성 직원에 spawn-request가 들어오면 거절. PM 카탈로그가 active만 노출하니
    // 일반적으론 발생하지 않지만, 사장 손편집/race로 가능 — 사일런트 무시 대신 명시.
    throw new Error(`employee ${req.employeeId} is inactive — spawn denied`);
  }

  // vendor 분기 — openai 직원은 codex CLI subprocess (PR3 stub).
  if (employee.vendor === 'openai') {
    runCodexSession(req, employee, cb);
    return;
  }

  const sessionDir = ensureSessionDir(req.id);
  const outputPath = resolve(sessionDir, OUTPUT_LOG_NAME);
  const donePath = resolve(sessionDir, DONE_MARKER_NAME);

  writeFileSync(outputPath, '', 'utf-8');

  // --exclude-dynamic-system-prompt-sections: per-machine 섹션을 user message로 옮겨 cache hit 향상.
  const args = [
    '--print',
    '--verbose',
    '--permission-mode',
    'bypassPermissions',
    '--exclude-dynamic-system-prompt-sections',
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--include-partial-messages',
    '--append-system-prompt',
    employee.systemPrompt,
    '--add-dir',
    projectRoot,
  ];
  if (employee.model) {
    args.push('--model', employee.model);
  }
  if (employee.effort) {
    args.push('--effort', employee.effort);
  }

  const proc = spawn('claude', args, {
    cwd: projectRoot,
    env: process.env,
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;

  const tracker = new StatusTracker(`sub-${req.id}`);
  let accumulatedOutput = '';
  active.set(req.id, proc);

  cb({
    kind: 'started',
    sessionId: req.id,
    employee,
    prompt: req.prompt,
    startedAt: Date.now(),
  });

  let stdoutBuf = '';

  proc.stdout.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString('utf-8');
    let nl: number;
    while ((nl = stdoutBuf.indexOf('\n')) !== -1) {
      const line = stdoutBuf.slice(0, nl).trim();
      stdoutBuf = stdoutBuf.slice(nl + 1);
      if (!line) continue;
      const text = handleLine(line, req.id, outputPath, cb, tracker);
      if (text) accumulatedOutput += text;
    }
  });

  proc.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8');
    appendFileSync(outputPath, `[stderr] ${text}`, 'utf-8');
  });

  proc.on('error', (err) => {
    appendFileSync(outputPath, `\n[runner error] ${err.message}\n`, 'utf-8');
  });

  proc.on('exit', (code) => {
    if (stdoutBuf.trim()) {
      const tailText = handleLine(stdoutBuf.trim(), req.id, outputPath, cb, tracker);
      if (tailText) accumulatedOutput += tailText;
      stdoutBuf = '';
    }
    active.delete(req.id);
    const exitCode = code ?? -1;
    const snap = tracker.snapshot();
    const metrics: SubSessionMetrics = {
      model: snap.model || undefined,
      inputTokens: snap.totalInputTokens,
      outputTokens: snap.totalOutputTokens,
      cacheReadTokens: snap.totalCacheReadTokens,
      cacheCreationTokens: snap.totalCacheCreationTokens,
      costUsd: snap.totalCostUsd,
    };
    writeFileSync(
      donePath,
      JSON.stringify({ exitCode, endedAt: new Date().toISOString(), metrics }, null, 2),
      'utf-8',
    );
    cb({
      kind: 'done',
      sessionId: req.id,
      exitCode,
      endedAt: Date.now(),
      metrics,
      employee,
      prompt: req.prompt,
      output: accumulatedOutput,
    });
  });

  const inputMsg = {
    type: 'user',
    message: { role: 'user', content: req.prompt },
  };
  proc.stdin.write(`${JSON.stringify(inputMsg)}\n`);
  proc.stdin.end();
}

function handleLine(
  line: string,
  sessionId: string,
  outputPath: string,
  cb: SubSessionCallback,
  tracker: StatusTracker,
): string | null {
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof event !== 'object' || event === null) return null;
  const e = event as Record<string, unknown>;

  // 모든 라인은 status tracker에 ingest — model/tokens/cost/rate-limit 추출.
  tracker.ingest(e);

  if (e['type'] === 'stream_event') {
    const inner = e['event'] as Record<string, unknown> | undefined;
    if (inner?.['type'] === 'content_block_delta') {
      const delta = inner['delta'] as Record<string, unknown> | undefined;
      if (delta?.['type'] === 'text_delta' && typeof delta['text'] === 'string') {
        const text = delta['text'];
        appendFileSync(outputPath, text, 'utf-8');
        cb({ kind: 'chunk', sessionId, text });
        return text;
      }
    }
  }
  return null;
}

/**
 * Codex CLI subprocess 실 구현 (PR3b).
 *
 * 명령: `codex exec --json --color never --skip-git-repo-check
 *        --dangerously-bypass-approvals-and-sandbox -C <root> -m <model>
 *        -o <last-msg-file>` + stdin으로 systemPrompt + 일감 결합 prompt 전달.
 *
 * - --json: 진행 이벤트를 stdout에 JSONL로 출력 (progress 표시용)
 * - -o: 최종 응답 메시지를 별도 파일에 저장 (carbon copy)
 * - --dangerously-bypass-approvals-and-sandbox: 권한 prompt 없이 자율 실행 (claude의 bypassPermissions와 동일)
 *
 * 사용량 = ChatGPT Pro 구독 한도 (OAuth, API key 미사용).
 */
function runCodexSession(
  req: SpawnRequest,
  employee: EmployeeDef,
  cb: SubSessionCallback,
): void {
  const sessionDir = ensureSessionDir(req.id);
  const outputPath = resolve(sessionDir, OUTPUT_LOG_NAME);
  const donePath = resolve(sessionDir, DONE_MARKER_NAME);
  const lastMsgPath = resolve(sessionDir, 'codex-last-msg.txt');
  const startedAt = Date.now();

  writeFileSync(outputPath, '', 'utf-8');

  const combinedPrompt =
    `[직원 시스템 프롬프트]\n${employee.systemPrompt}\n\n` +
    `---\n[사장 일감]\n${req.prompt}`;

  const args = [
    'exec',
    '--json',
    '--color', 'never',
    '--skip-git-repo-check',
    '-s', 'workspace-write', // read + write 명시. --dangerously-bypass와 함께 tool 권한 확실히 부여.
    '--dangerously-bypass-approvals-and-sandbox',
    '-C', projectRoot,
    '-o', lastMsgPath,
  ];
  if (employee.model) {
    args.push('-m', employee.model);
  }

  let proc: ChildProcessWithoutNullStreams;
  try {
    proc = spawn('codex', args, {
      cwd: projectRoot,
      env: process.env,
      shell: process.platform === 'win32',
    }) as ChildProcessWithoutNullStreams;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const errOutput =
      `[Codex spawn 실패]\n${msg}\n\n` +
      `codex CLI 확인: \`codex --version\`. ChatGPT Pro OAuth: \`codex login\`.`;
    writeFileSync(outputPath, errOutput, 'utf-8');
    writeFileSync(
      donePath,
      JSON.stringify(
        { exitCode: -1, endedAt: new Date().toISOString(), metrics: emptyMetrics() },
        null,
        2,
      ),
      'utf-8',
    );
    cb({ kind: 'started', sessionId: req.id, employee, prompt: req.prompt, startedAt });
    cb({ kind: 'chunk', sessionId: req.id, text: errOutput });
    cb({
      kind: 'done',
      sessionId: req.id,
      exitCode: -1,
      endedAt: Date.now(),
      metrics: emptyMetrics(),
      employee,
      prompt: req.prompt,
      output: errOutput,
    });
    return;
  }

  let accumulatedOutput = '';
  active.set(req.id, proc);

  cb({ kind: 'started', sessionId: req.id, employee, prompt: req.prompt, startedAt });

  let stdoutBuf = '';
  proc.stdout.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString('utf-8');
    let nl: number;
    while ((nl = stdoutBuf.indexOf('\n')) !== -1) {
      const line = stdoutBuf.slice(0, nl).trim();
      stdoutBuf = stdoutBuf.slice(nl + 1);
      if (!line) continue;
      const text = handleCodexLine(line);
      if (text) {
        accumulatedOutput += text;
        appendFileSync(outputPath, text, 'utf-8');
        cb({ kind: 'chunk', sessionId: req.id, text });
      }
    }
  });

  proc.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8');
    appendFileSync(outputPath, `[stderr] ${text}`, 'utf-8');
  });

  proc.on('error', (err) => {
    appendFileSync(outputPath, `\n[codex error] ${err.message}\n`, 'utf-8');
  });

  proc.on('exit', (code) => {
    active.delete(req.id);
    // 최종 응답은 -o 파일이 정답 (stdout JSONL은 progress).
    let finalOutput = accumulatedOutput;
    if (existsSync(lastMsgPath)) {
      try {
        const last = readFileSync(lastMsgPath, 'utf-8').trim();
        if (last) finalOutput = last;
      } catch {
        /* ignore */
      }
    }
    const exitCode = code ?? -1;
    const metrics = emptyMetrics(); // codex JSON에서 토큰 추출은 PR3c 안건
    writeFileSync(
      donePath,
      JSON.stringify({ exitCode, endedAt: new Date().toISOString(), metrics }, null, 2),
      'utf-8',
    );
    cb({
      kind: 'done',
      sessionId: req.id,
      exitCode,
      endedAt: Date.now(),
      metrics,
      employee,
      prompt: req.prompt,
      output: finalOutput,
    });
  });

  proc.stdin.write(combinedPrompt);
  proc.stdin.end();
}

/**
 * codex `--json` JSONL 한 줄에서 사용자에게 보일 텍스트만 추출.
 *
 * 알려진 이벤트 type (codex 0.131.0 시연 기반):
 * - thread.started / turn.started / turn.completed: 진행 신호, 표시 X
 * - error / turn.failed: 사장에게 명시 (인증 만료 등)
 * - assistant_message / message: 응답 텍스트
 * - item.created / message.delta: stream chunk
 * - tool_call: tool 사용 (간단 진행만)
 *
 * stderr는 별도 처리 (codex_core 로그 등).
 */
function handleCodexLine(line: string): string | null {
  // codex가 일반 plain text를 stdout에 쓸 때도 있음 (특히 stderr 미스 redirect).
  if (!line.startsWith('{')) {
    // ANSI escape / 로그 line은 표시 안 함 (시연 잡음 줄임).
    if (line.includes('ERROR') || line.includes('WARN')) return null;
    return line + '\n';
  }
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof event !== 'object' || event === null) return null;
  const e = event as Record<string, unknown>;
  const type = typeof e['type'] === 'string' ? (e['type'] as string) : '';

  // 진행 신호는 표시 X (사장 화면에 thread.started 같은 메타 노출 X).
  if (type === 'thread.started' || type === 'turn.started' || type === 'turn.completed') {
    return null;
  }

  // 에러 이벤트 — 사장에게 명시. 특히 인증 만료 패턴 자주 발생.
  if (type === 'error' || type === 'turn.failed') {
    const msg =
      (typeof e['message'] === 'string' && (e['message'] as string)) ||
      (typeof e['error'] === 'object' &&
        e['error'] !== null &&
        typeof (e['error'] as Record<string, unknown>)['message'] === 'string' &&
        ((e['error'] as Record<string, unknown>)['message'] as string)) ||
      JSON.stringify(e);
    let advice = '';
    if (msg.includes('refresh') || msg.includes('token') || msg.includes('Unauthorized')) {
      advice =
        '\n\n[fix] codex 인증 만료. powershell에서: `codex logout` → `codex login` 후 재시도.';
    }
    return `[codex error] ${msg}${advice}\n`;
  }

  // 응답 message — 다양한 필드 시도.
  if (typeof e['message'] === 'string') return `${e['message']}\n`;
  if (typeof e['content'] === 'string') return `${e['content']}\n`;
  const delta = e['delta'];
  if (typeof delta === 'string') return delta;
  if (delta && typeof delta === 'object') {
    const d = delta as Record<string, unknown>;
    if (typeof d['text'] === 'string') return d['text'] as string;
  }
  // item.created 등 nested item에 응답 들어있는 경우.
  const item = e['item'];
  if (item && typeof item === 'object') {
    const it = item as Record<string, unknown>;
    if (typeof it['text'] === 'string') return `${it['text']}\n`;
    if (typeof it['content'] === 'string') return `${it['content']}\n`;
  }

  // 알 수 없는 이벤트는 표시 X (raw JSON 노출 회피). 디버그 필요시 stderr 로그로.
  return null;
}

function emptyMetrics(): SubSessionMetrics {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    costUsd: 0,
  };
}

export function killSub(sessionId: string): void {
  const proc = active.get(sessionId);
  if (proc) {
    killTree(proc);
    active.delete(sessionId);
  }
}

export function killAllSubs(): void {
  for (const [, proc] of active) {
    try {
      killTree(proc);
    } catch {
      /* ignore */
    }
  }
  active.clear();
}
