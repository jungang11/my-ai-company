import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StatusTracker } from '../status.js';
import type { StatusSnapshot } from '../../shared/ipc.js';
import { listEmployees } from './manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type PMDef = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  model?: string;
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
};

const projectRoot = resolve(__dirname, '../../..');
const PM_DEF_PATH = resolve(projectRoot, 'core/employees/pm.json');

/**
 * PM 정의를 매 호출마다 read해서 시스템 프롬프트 튜닝 시 dev 재시작 없이 반영.
 */
function loadPMDef(): PMDef {
  return JSON.parse(readFileSync(PM_DEF_PATH, 'utf-8')) as PMDef;
}

/**
 * pm.json 제외한 모든 core/employees/*.json 중 active=true만 PM 카탈로그에 노출.
 * 사장이 비활성 토글하면 PM이 다음 spawn에서 그 직원을 모르게 됨 → spawn 거절 시도 방지.
 *
 * 결정적 순서: manager.listEmployees() 가 파일명 + id 두 단계 정렬을 보장 → prompt cache hit.
 */
function loadCatalog(): string {
  const entries = listEmployees().filter((e) => e.id !== 'pm' && e.active);

  if (entries.length === 0) return '';

  const lines = entries.map((e) => {
    const head = `- **${e.id}** (${e.name}, ${e.role}` + (e.model ? `, ${e.model}` : '') + (e.effort ? `, effort=${e.effort}` : '') + ')';
    const desc = e.shortDescription ? `\n  ${e.shortDescription}` : '';
    return head + desc;
  });

  return [
    '',
    '=== 현재 회사 직원 명부 (자동 생성) ===',
    '아래 직원 중 일감에 적합한 한 명 또는 여러 명을 골라 spawn-request로 위임.',
    '자세한 시스템 프롬프트는 `core/employees/<id>.json` Read.',
    '',
    ...lines,
  ].join('\n');
}

/**
 * 첫 호출은 `--session-id <new-uuid>`로 새 세션 생성, 이후는 `--resume <id>`로 재개.
 * 같은 ID로 `--session-id`를 두 번 주면 claude가 "already in use" 에러를 냄.
 * confirmedSessionId는 성공적 exit 후에만 설정 — 첫 호출이 실패하면 다음에 다시 시도.
 */
let confirmedSessionId: string | null = null;
let pendingSessionId: string | null = null;
let activeProc: ChildProcessWithoutNullStreams | null = null;

/**
 * PM이 다른 메시지에 응답 중일 때 시스템(app-originated) 메시지가 들어오면
 * 이 큐에 쌓아두고 PM이 idle 되는 즉시 순서대로 flush.
 * 예: sub 세션 done 신호 — PM busy면 다음 idle에 자동 read.
 */
const systemQueue: Array<{ text: string; cb: PMCallbacks }> = [];

// 세션 누적 status — PM은 앱 lifecycle 동안 하나의 ongoing conversation.
const pmStatus = new StatusTracker('pm');

export function getPMStatusSnapshot(): StatusSnapshot {
  return pmStatus.snapshot();
}

/**
 * app이 자동 트리거하는 시스템 메시지용 진입점. PM이 busy면 큐에 적재 후
 * 다음 idle 시점에 자동으로 sendToPM 호출. 사장이 직접 보낸 메시지가 아님 —
 * renderer의 사장 boss 버블은 안 만들어지고, PM 응답만 채팅창에 등장.
 */
export function enqueueSystemMessage(text: string, cb: PMCallbacks): void {
  if (!activeProc) {
    sendToPM(text, cb);
    return;
  }
  systemQueue.push({ text, cb });
}

export type PMCallbacks = {
  onChunk: (text: string) => void;
  onDone: (info: { exitCode: number; ok: boolean; reason?: string }) => void;
  onError: (err: string) => void;
  onStatus: (snapshot: StatusSnapshot) => void;
};

function nextSessionArgs(): string[] {
  if (confirmedSessionId) {
    return ['--resume', confirmedSessionId];
  }
  pendingSessionId = randomUUID();
  return ['--session-id', pendingSessionId];
}

export function isPMBusy(): boolean {
  return activeProc !== null;
}

export function sendToPM(userText: string, cb: PMCallbacks): void {
  if (activeProc) {
    cb.onError('PM이 이전 메시지에 응답 중입니다. 잠시 후 다시 시도하세요.');
    cb.onDone({ exitCode: -1, ok: false, reason: 'busy' });
    return;
  }

  // 매 호출마다 PM 정의와 직원 카탈로그를 fresh하게 read — JSON 튜닝 시 dev 재시작 불필요.
  const pmDef = loadPMDef();
  const catalog = loadCatalog();
  const composedSystemPrompt = catalog
    ? `${pmDef.systemPrompt}\n${catalog}`
    : pmDef.systemPrompt;

  // --bare는 OAuth/Keychain 인증을 차단하므로 사용 불가 (Claude Max 인증 필요).
  // --verbose는 --print + stream-json 조합의 필수 flag.
  // --permission-mode bypassPermissions: --print 모드는 권한 prompt에 응답 불가 →
  // Write/Bash 등 도구 사용이 막혀버림. 개인 머신/sandbox 없음 컨셉이라 bypass.
  // --exclude-dynamic-system-prompt-sections: cwd/env/git status 등 per-machine 섹션을
  // 첫 user message로 옮겨 prompt cache hit 향상. --append-system-prompt와 호환됨.
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
    ...nextSessionArgs(),
    '--append-system-prompt',
    composedSystemPrompt,
    '--add-dir',
    projectRoot,
  ];
  if (pmDef.model) {
    args.push('--model', pmDef.model);
  }
  if (pmDef.effort) {
    args.push('--effort', pmDef.effort);
  }

  // Windows에서 .exe 자동 해석 위해 shell:true 사용 (`where claude` → claude.exe)
  const proc = spawn('claude', args, {
    cwd: projectRoot,
    env: process.env,
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;

  activeProc = proc;

  let stdoutBuf = '';
  let stderrBuf = '';

  proc.stdout.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString('utf-8');
    let nl: number;
    while ((nl = stdoutBuf.indexOf('\n')) !== -1) {
      const line = stdoutBuf.slice(0, nl).trim();
      stdoutBuf = stdoutBuf.slice(nl + 1);
      if (!line) continue;
      handleStreamLine(line, cb);
    }
  });

  proc.stderr.on('data', (chunk: Buffer) => {
    stderrBuf += chunk.toString('utf-8');
  });

  proc.on('error', (err) => {
    cb.onError(`claude 실행 실패: ${err.message}`);
    activeProc = null;
    cb.onDone({ exitCode: -1, ok: false, reason: err.message });
  });

  proc.on('exit', (code) => {
    // exit 시점에 stdoutBuf에 newline 없는 마지막 partial line이 남아있을 수 있음 — flush
    if (stdoutBuf.trim()) {
      handleStreamLine(stdoutBuf.trim(), cb);
      stdoutBuf = '';
    }
    activeProc = null;
    if (code === 0 && pendingSessionId && !confirmedSessionId) {
      confirmedSessionId = pendingSessionId;
      pendingSessionId = null;
    }
    if (stderrBuf.trim()) cb.onError(stderrBuf.trim());
    cb.onDone({ exitCode: code ?? -1, ok: code === 0 });

    // PM이 idle 됐으니 쌓인 시스템 메시지 한 개 flush — 직렬 처리.
    if (systemQueue.length > 0) {
      const next = systemQueue.shift()!;
      setTimeout(() => sendToPM(next.text, next.cb), 100);
    }
  });

  const inputMsg = {
    type: 'user',
    message: { role: 'user', content: userText },
  };
  proc.stdin.write(`${JSON.stringify(inputMsg)}\n`);
  proc.stdin.end();
}

export function killPM(): void {
  if (activeProc) {
    activeProc.kill();
    activeProc = null;
  }
}

function handleStreamLine(line: string, cb: PMCallbacks): void {
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return; // 비-JSON 라인 무시
  }
  if (typeof event !== 'object' || event === null) return;
  const e = event as Record<string, unknown>;

  // status 누적 (model, tokens, cost, rate limit)
  pmStatus.ingest(e);

  // partial text chunks (--include-partial-messages)
  if (e['type'] === 'stream_event') {
    const inner = e['event'] as Record<string, unknown> | undefined;
    if (inner?.['type'] === 'content_block_delta') {
      const delta = inner['delta'] as Record<string, unknown> | undefined;
      if (delta?.['type'] === 'text_delta' && typeof delta['text'] === 'string') {
        cb.onChunk(delta['text']);
      }
    }
    return;
  }

  if (e['type'] === 'result' || e['type'] === 'rate_limit_event') {
    cb.onStatus(pmStatus.snapshot());
  }
}
