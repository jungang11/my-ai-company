import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StatusTracker } from '../status.js';
import type { StatusSnapshot } from '../../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type PMDef = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
};

const PM_DEF_PATH = resolve(__dirname, '../../../core/employees/pm.json');
const pmDef = JSON.parse(readFileSync(PM_DEF_PATH, 'utf-8')) as PMDef;
const projectRoot = resolve(__dirname, '../../..');

/**
 * 첫 호출은 `--session-id <new-uuid>`로 새 세션 생성, 이후는 `--resume <id>`로 재개.
 * 같은 ID로 `--session-id`를 두 번 주면 claude가 "already in use" 에러를 냄.
 * confirmedSessionId는 성공적 exit 후에만 설정 — 첫 호출이 실패하면 다음에 다시 시도.
 */
let confirmedSessionId: string | null = null;
let pendingSessionId: string | null = null;
let activeProc: ChildProcessWithoutNullStreams | null = null;

// 세션 누적 status — PM은 앱 lifecycle 동안 하나의 ongoing conversation.
const pmStatus = new StatusTracker('pm');

export function getPMStatusSnapshot(): StatusSnapshot {
  return pmStatus.snapshot();
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

  // --bare는 OAuth/Keychain 인증을 차단하므로 사용 불가 (Claude Max 인증 필요).
  // --verbose는 --print + stream-json 조합의 필수 flag.
  // --permission-mode bypassPermissions: --print 모드는 권한 prompt에 응답 불가 →
  // Write/Bash 등 도구 사용이 막혀버림. 개인 머신/sandbox 없음 컨셉이라 bypass.
  const args = [
    '--print',
    '--verbose',
    '--permission-mode',
    'bypassPermissions',
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--include-partial-messages',
    ...nextSessionArgs(),
    '--append-system-prompt',
    pmDef.systemPrompt,
    '--add-dir',
    projectRoot,
  ];

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
