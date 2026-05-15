import { afterEach, describe, expect, it } from 'vitest';
import { PTYManager } from './manager.js';
import type { SessionEvent } from './types.js';

function waitForExit(timeoutMs = 5000): Promise<{ events: SessionEvent[]; exit?: SessionEvent }> {
  return new Promise((resolve, reject) => {
    const events: SessionEvent[] = [];
    let settled = false;
    const collector = (e: SessionEvent) => {
      events.push(e);
      if (e.kind === 'exit' && !settled) {
        settled = true;
        resolve({ events, exit: e });
      }
    };
    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`timeout after ${timeoutMs}ms; events=${events.length}`));
      }
    }, timeoutMs);
    // expose collector via closure
    (waitForExit as unknown as { collector: typeof collector }).collector = collector;
  });
}

const isWin = process.platform === 'win32';
const echoCmd = isWin
  ? { cmd: 'cmd.exe', args: ['/c', 'echo hello-pty'] }
  : { cmd: 'sh', args: ['-c', 'echo hello-pty'] };

describe('PTYManager', () => {
  const m = new PTYManager();

  afterEach(() => {
    for (const s of m.list()) {
      try {
        m.kill(s.id);
      } catch {
        /* ignore */
      }
    }
  });

  it('echo 프로세스 spawn → 출력 캡처 + exit', async () => {
    const events: SessionEvent[] = [];

    const done = new Promise<SessionEvent>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('exit timeout')), 5000);
      m.spawn('s1', echoCmd.cmd, echoCmd.args);
      m.subscribe('s1', (e) => {
        events.push(e);
        if (e.kind === 'exit') {
          clearTimeout(timer);
          resolve(e);
        }
      });
    });

    const exit = await done;
    expect(exit.kind).toBe('exit');

    const combined = events
      .filter((e): e is Extract<SessionEvent, { kind: 'data' }> => e.kind === 'data')
      .map((e) => e.data)
      .join('');
    expect(combined).toMatch(/hello-pty/);
  });

  it('list/has — spawn 직후 등록되고 exit 후 제거', async () => {
    const exited = new Promise<void>((resolve) => {
      m.spawn('s2', echoCmd.cmd, echoCmd.args);
      expect(m.has('s2')).toBe(true);
      expect(m.list().map((s) => s.id)).toContain('s2');
      m.subscribe('s2', (e) => {
        if (e.kind === 'exit') resolve();
      });
    });
    await exited;
    // exit 핸들러가 entries.delete 한 직후라 race 방지를 위해 한 tick 양보
    await new Promise((r) => setTimeout(r, 50));
    expect(m.has('s2')).toBe(false);
  });

  it('subscribe replay: 늦게 붙어도 이력 받음', async () => {
    m.spawn('s3', echoCmd.cmd, echoCmd.args);
    // 출력이 ring buffer에 쌓일 시간 확보
    await new Promise((r) => setTimeout(r, 800));

    const late: string[] = [];
    m.subscribe('s3', (e) => {
      if (e.kind === 'data') late.push(e.data);
    });

    expect(late.join('')).toMatch(/hello-pty/);
  });

  it('중복 spawn은 에러', () => {
    m.spawn('s4', echoCmd.cmd, echoCmd.args);
    expect(() => m.spawn('s4', echoCmd.cmd, echoCmd.args)).toThrow(/already exists/);
  });

  it('없는 session에 write/subscribe하면 에러', () => {
    expect(() => m.write('missing', 'x')).toThrow(/not found/);
    expect(() => m.subscribe('missing', () => undefined)).toThrow(/not found/);
  });
});
