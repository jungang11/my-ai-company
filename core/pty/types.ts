export type SessionId = string;

export type SessionEvent =
  | { kind: 'data'; sessionId: SessionId; data: string }
  | { kind: 'exit'; sessionId: SessionId; exitCode: number; signal?: number };

export type SpawnOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  cols?: number;
  rows?: number;
};

export type SubscribeOptions = {
  /** ring buffer의 기존 스냅샷을 첫 콜로 받을지 (default true) */
  replay?: boolean;
};

export type Unsubscribe = () => void;

export type Session = {
  id: SessionId;
  command: string;
  args: readonly string[];
  startedAt: number;
};
