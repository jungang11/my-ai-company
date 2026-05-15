export const IPC = {
  pmSend: 'pm:send',
  pmOutput: 'pm:output',
  pmExit: 'pm:exit',
} as const;

export type PMOutputPayload = { text: string };
export type PMExitPayload = { exitCode: number };
