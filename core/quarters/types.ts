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
