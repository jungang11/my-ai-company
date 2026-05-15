export const IPC = {
  pmSend: 'pm:send',
  pmOutput: 'pm:output',
  pmExit: 'pm:exit',
  rosterUpdate: 'roster:update',
  statusUpdate: 'status:update',
  statusInit: 'status:init',
} as const;

export type StatusInit = {
  projectName: string;
  branch: string;
};

export type RateLimitInfo = {
  type: 'five_hour' | 'seven_day' | string;
  status: 'allowed' | 'limited' | string;
  resetsAtMs: number;
};

export type StatusSnapshot = {
  /** 마지막 응답의 model id (예: claude-opus-4-7) */
  model: string;
  /** 마지막 응답의 input tokens (그 turn의 input — 누적 아님) */
  lastInputTokens: number;
  lastOutputTokens: number;
  lastCacheCreationTokens: number;
  lastCacheReadTokens: number;
  /** session 누적 — 매 응답마다 더해짐 */
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  contextWindow: number;
  /** rate_limit_event 누적 (가장 최근값) */
  rateLimits: RateLimitInfo[];
  /** 어떤 세션 (pm / sub-<id>) */
  source: string;
  updatedAtMs: number;
};

export type PMOutputPayload = { text: string };
export type PMExitPayload = { exitCode: number };

export type RosterEmployeeStatus = 'working' | 'done' | 'failed';

export type RosterUpdatePayload =
  | {
      kind: 'started';
      sessionId: string;
      employeeId: string;
      employeeName: string;
      role: string;
      prompt: string;
      startedAt: number;
    }
  | {
      kind: 'chunk';
      sessionId: string;
      text: string;
    }
  | {
      kind: 'done';
      sessionId: string;
      exitCode: number;
      endedAt: number;
    };
