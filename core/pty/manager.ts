import { spawn as ptySpawn, type IPty } from '@homebridge/node-pty-prebuilt-multiarch';
import { RingBuffer } from './ring-buffer.js';
import type {
  Session,
  SessionEvent,
  SessionId,
  SpawnOptions,
  SubscribeOptions,
  Unsubscribe,
} from './types.js';

const RING_BYTES = 64 * 1024;

type Entry = {
  session: Session;
  pty: IPty;
  buffer: RingBuffer;
  listeners: Set<(e: SessionEvent) => void>;
};

export class PTYManager {
  private entries = new Map<SessionId, Entry>();

  spawn(
    id: SessionId,
    command: string,
    args: readonly string[] = [],
    opts: SpawnOptions = {},
  ): Session {
    if (this.entries.has(id)) {
      throw new Error(`session ${id} already exists`);
    }

    const pty = ptySpawn(command, [...args], {
      name: 'xterm-color',
      cwd: opts.cwd ?? process.cwd(),
      env: opts.env ?? process.env,
      cols: opts.cols ?? 80,
      rows: opts.rows ?? 24,
    });

    const session: Session = {
      id,
      command,
      args,
      startedAt: Date.now(),
    };
    const buffer = new RingBuffer(RING_BYTES);
    const listeners = new Set<(e: SessionEvent) => void>();
    const entry: Entry = { session, pty, buffer, listeners };

    pty.onData((data) => {
      buffer.write(data);
      for (const cb of listeners) {
        cb({ kind: 'data', sessionId: id, data });
      }
    });

    pty.onExit(({ exitCode, signal }) => {
      for (const cb of listeners) {
        cb({
          kind: 'exit',
          sessionId: id,
          exitCode,
          ...(signal !== undefined ? { signal } : {}),
        });
      }
      this.entries.delete(id);
    });

    this.entries.set(id, entry);
    return session;
  }

  write(id: SessionId, data: string): void {
    const entry = this.requireEntry(id);
    entry.pty.write(data);
  }

  kill(id: SessionId): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.pty.kill();
  }

  subscribe(
    id: SessionId,
    cb: (e: SessionEvent) => void,
    opts: SubscribeOptions = {},
  ): Unsubscribe {
    const entry = this.requireEntry(id);
    if (opts.replay !== false) {
      const snapshot = entry.buffer.snapshot();
      if (snapshot) {
        cb({ kind: 'data', sessionId: id, data: snapshot });
      }
    }
    entry.listeners.add(cb);
    return () => {
      entry.listeners.delete(cb);
    };
  }

  list(): Session[] {
    return [...this.entries.values()].map((e) => e.session);
  }

  has(id: SessionId): boolean {
    return this.entries.has(id);
  }

  private requireEntry(id: SessionId): Entry {
    const e = this.entries.get(id);
    if (!e) throw new Error(`session ${id} not found`);
    return e;
  }
}
