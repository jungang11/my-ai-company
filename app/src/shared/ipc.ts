export const IPC = {
  pmSend: 'pm:send',
  pmOutput: 'pm:output',
  pmExit: 'pm:exit',
  rosterUpdate: 'roster:update',
  statusUpdate: 'status:update',
  statusInit: 'status:init',
  employeeList: 'employee:list',
  employeeToggle: 'employee:toggle',
  employeeChanged: 'employee:changed',
  rosterHistorical: 'roster:historical',
  quartersCurrent: 'quarters:current',
  quartersStart: 'quarters:start',
  quartersList: 'quarters:list',
  catalogsList: 'catalogs:list',
  catalogsActive: 'catalogs:active',
  catalogsSetActive: 'catalogs:setActive',
  benchmarksList: 'benchmarks:list',
  benchmarksSetScore: 'benchmarks:setScore',
} as const;

export type BenchmarkScore = 'pass' | 'partial' | 'fail';

export type BenchmarkResult = {
  scenarioId: string;
  score: BenchmarkScore;
  catalogId: string;
  ts: number;
  note?: string;
};

export type BenchmarkResults = {
  /** key=scenarioId::catalogId → 평가 history (최근 N개, 가장 최근이 array 끝). */
  results: Record<string, BenchmarkResult[]>;
};

export type CatalogOverride = {
  vendor?: Vendor;
  model?: string;
  effort?: EmployeeEffort;
  fallbackModel?: string;
};

export type Catalog = {
  id: string;
  name: string;
  description: string;
  overrides: Record<string, CatalogOverride>;
};

export type QuarterMeta = {
  quarterId: string;
  title: string;
  description?: string;
  startedAt: number;
  endedAt?: number;
  sessionIds: string[];
  manualNotes?: string;
  retrospective?: string;
};

export type EmployeeEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/** Model vendor — 한 직원이 어느 vendor의 모델로 spawn되는지. cliBackend(어느 CLI)와는 별개 추적 dimension. */
export type Vendor = 'anthropic' | 'openai';

export type EmployeeProfile = {
  id: string;
  name: string;
  role: string;
  cliBackend: string;
  vendor?: Vendor; // default 'anthropic' (생략 시 anthropic)
  model?: string;
  effort?: EmployeeEffort;
  shortDescription?: string;
  active: boolean;
};

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
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
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

export type SubSessionMetrics = {
  model?: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
};

export type RosterUpdatePayload =
  | {
      kind: 'started';
      sessionId: string;
      employeeId: string;
      employeeName: string;
      role: string;
      prompt: string;
      startedAt: number;
      model?: string;
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
      metrics: SubSessionMetrics;
    };
