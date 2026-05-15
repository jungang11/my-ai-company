export type ChatRole = 'boss' | 'pm';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
  streaming?: boolean;
};

let counter = 0;
export function newMessage(role: ChatRole, text: string, streaming = false): ChatMessage {
  counter += 1;
  return {
    id: `${Date.now()}-${counter}`,
    role,
    text,
    ts: Date.now(),
    streaming,
  };
}
