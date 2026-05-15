import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export type PMCallbacks = {
  onChunk: (text: string) => void;
  onDone: (info: { exitCode: number; ok: boolean; reason?: string }) => void;
  onError: (err: string) => void;
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
  const args = [
    '--print',
    '--verbose',
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
    activeProc = null;
    if (code === 0 && pendingSessionId && !confirmedSessionId) {
      // 첫 호출 성공 시점에 session 확정 — 이후는 --resume으로 재개
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

  // final assembled assistant message (fallback if partial events 안 옴)
  if (e['type'] === 'assistant') {
    const msg = e['message'] as Record<string, unknown> | undefined;
    const content = msg?.['content'] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block['type'] === 'text' && typeof block['text'] === 'string') {
          // partial 이벤트로 이미 chunk를 받았다면 중복 가능 — 일단 partial 우선이므로 final assistant는 무시
        }
      }
    }
    return;
  }

  // 최종 result — 메시지 종료 시그널
  if (e['type'] === 'result') {
    // onDone이 process exit으로 처리됨
    return;
  }
}
