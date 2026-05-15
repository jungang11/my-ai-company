export const IPC = {
  pmSend: 'pm:send',
  pmOutput: 'pm:output',
  pmExit: 'pm:exit',
  rosterUpdate: 'roster:update',
} as const;

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
