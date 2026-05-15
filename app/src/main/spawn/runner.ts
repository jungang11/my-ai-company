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

const __dirname = dirname(fileURLToPath(import.meta.url));
// __dirname = app/out/main → ../../.. = project root
const projectRoot = resolve(__dirname, '../../..');

type EmployeeDef = {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  cliBackend: string;
};

export type SubSessionUpdate =
  | { kind: 'started'; sessionId: string; employee: EmployeeDef; prompt: string; startedAt: number }
  | { kind: 'chunk'; sessionId: string; text: string }
  | { kind: 'done'; sessionId: string; exitCode: number; endedAt: number };

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
  const sessionDir = ensureSessionDir(req.id);
  const outputPath = resolve(sessionDir, OUTPUT_LOG_NAME);
  const donePath = resolve(sessionDir, DONE_MARKER_NAME);

  writeFileSync(outputPath, '', 'utf-8');

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
    '--append-system-prompt',
    employee.systemPrompt,
    '--add-dir',
    projectRoot,
  ];

  const proc = spawn('claude', args, {
    cwd: projectRoot,
    env: process.env,
    shell: process.platform === 'win32',
  }) as ChildProcessWithoutNullStreams;

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
      handleLine(line, req.id, outputPath, cb);
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
    active.delete(req.id);
    const exitCode = code ?? -1;
    writeFileSync(
      donePath,
      JSON.stringify({ exitCode, endedAt: new Date().toISOString() }, null, 2),
      'utf-8',
    );
    cb({ kind: 'done', sessionId: req.id, exitCode, endedAt: Date.now() });
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
): void {
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return;
  }
  if (typeof event !== 'object' || event === null) return;
  const e = event as Record<string, unknown>;

  if (e['type'] === 'stream_event') {
    const inner = e['event'] as Record<string, unknown> | undefined;
    if (inner?.['type'] === 'content_block_delta') {
      const delta = inner['delta'] as Record<string, unknown> | undefined;
      if (delta?.['type'] === 'text_delta' && typeof delta['text'] === 'string') {
        const text = delta['text'];
        appendFileSync(outputPath, text, 'utf-8');
        cb({ kind: 'chunk', sessionId, text });
      }
    }
  }
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
