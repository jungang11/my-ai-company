export type CLIBackend = 'claude-code' | 'codex' | 'gemini';

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export type Employee = {
  id: string;
  name: string;
  role: string;
  cliBackend: CLIBackend;
  /** Claude model id (예: claude-opus-4-7, claude-opus-4-6, claude-sonnet-4-6). 모델/매핑 근거는 docs/models.md. */
  model?: string;
  /** claude CLI --effort. 디폴트 max. */
  effort?: EffortLevel;
  /** PM 카탈로그 한 줄 요약. 사장이 자유롭게 적음. */
  shortDescription?: string;
  systemPrompt: string;
  active: boolean;
};
