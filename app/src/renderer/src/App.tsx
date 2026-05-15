import { useEffect } from 'react';
import { useState } from 'react';
import { Chat } from './components/Chat';
import { newMessage, type ChatMessage } from './state/chat-store';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!window.api) {
      console.error(
        '[payroll-os] window.api 없음 — preload 로드 실패. preload 출력 경로/format 확인.',
      );
      setMessages((prev) => [
        ...prev,
        newMessage('pm', '[preload 로드 실패: window.api undefined. DevTools 콘솔 참고.]'),
      ]);
      return;
    }

    const offData = window.api.onPMOutput(({ text }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'pm' && last.streaming) {
          // 현재 streaming 중인 PM 버블에 chunk 누적
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
        // 새 PM 응답 시작
        return [...prev, newMessage('pm', text, true)];
      });
    });

    const offExit = window.api.onPMExit(({ exitCode }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== 'pm') return prev;
        const closed: ChatMessage = {
          ...last,
          streaming: false,
          ...(exitCode !== 0 ? { text: `${last.text || ''}\n[exit ${exitCode}]` } : {}),
        };
        return [...prev.slice(0, -1), closed];
      });
    });

    return () => {
      offData();
      offExit();
    };
  }, []);

  async function send(text: string) {
    setMessages((prev) => [...prev, newMessage('boss', text)]);
    try {
      await window.api.sendToPM(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, newMessage('pm', `[전송 실패: ${msg}]`)]);
    }
  }

  return (
    <main className="mx-auto flex h-full max-w-3xl flex-col bg-slate-900 ring-1 ring-slate-800">
      <Chat messages={messages} onSend={send} />
    </main>
  );
}
