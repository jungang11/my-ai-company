import type { SubSessionMetrics } from '../../../shared/ipc';

export type EmployeeStatus = 'working' | 'done' | 'failed';

export type EmployeeRow = {
  sessionId: string;
  employeeId: string;
  name: string;
  role: string;
  model?: string;
  prompt: string;
  status: EmployeeStatus;
  startedAt: number;
  endedAt?: number;
  exitCode?: number;
  /** 누적 chunk text (작업 결과 미리보기) */
  output: string;
  /** done 시점에 최종 metrics. working 중에는 undefined. */
  metrics?: SubSessionMetrics;
};
