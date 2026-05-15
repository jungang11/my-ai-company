import { useState } from 'react';
import { Chat } from './components/Chat';
import { newMessage, type ChatMessage } from './state/chat-store';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function send(text: string) {
    const bossMsg = newMessage('boss', text);
    const pmStub = newMessage(
      'pm',
      '(PR5에서 실제 PM 세션 응답으로 연결됩니다. 지금은 stub.)',
    );
    setMessages((prev) => [...prev, bossMsg, pmStub]);
  }

  return (
    <main className="mx-auto flex h-full max-w-3xl flex-col bg-slate-900 ring-1 ring-slate-800">
      <Chat messages={messages} onSend={send} />
    </main>
  );
}
