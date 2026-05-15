export type CLIBackend = 'claude-code' | 'codex' | 'gemini';

export type Employee = {
  id: string;
  name: string;
  role: string;
  cliBackend: CLIBackend;
  systemPrompt: string;
  active: boolean;
};
