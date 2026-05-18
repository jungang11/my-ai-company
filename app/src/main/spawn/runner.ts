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
import { StatusTracker } from '../status.js';
import type { SubSessionMetrics } from '../../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// __dirname = app/out/main → ../../.. = project root
const projectRoot = resolve(__dirname, '../../..');

type EmployeeDef = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  cliBackend: string;
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
  const path = resolve(projectRoot, 'core/employees', `${employeeId}.json`);
  if (!existsSync(path)) {
    throw new Error(`employee 정의 없음: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf-8')) as EmployeeDef;
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

export function killSub(sessionId: string): void {
  const proc = active.get(sessionId);
  if (proc) {
    proc.kill();
    active.delete(sessionId);
  }
}

export function killAllSubs(): void {
  for (const [, proc] of active) {
    try {
      proc.kill();
    } catch {
      /* ignore */
    }
  }
  active.clear();
}
