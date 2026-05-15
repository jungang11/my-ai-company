import { useEffect, useRef, useState } from 'react';
import { Chat } from './components/Chat';
import { newMessage, type ChatMessage } from './state/chat-store';

const PM_BUFFER_FLUSH_MS = 120;

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const pmBuffer = useRef<string>('');
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flushPM() {
    const text = pmBuffer.current.trim();
    pmBuffer.current = '';
    flushTimer.current = null;
    if (!text) return;
    setMessages((prev) => [...prev, newMessage('pm', text)]);
  }

  useEffect(() => {
    if (!window.api) {
      console.error('[payroll-os] window.api 없음 — preload 로드 실패. preload 출력 경로/format 확인.');
      setMessages((prev) => [
        ...prev,
        newMessage('pm', '[preload 로드 실패: window.api undefined. DevTools 콘솔 참고.]'),
      ]);
      return;
    }
    const offData = window.api.onPMOutput(({ text }) => {
      pmBuffer.current += text;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flushPM, PM_BUFFER_FLUSH_MS);
    });
    const offExit = window.api.onPMExit(({ exitCode }) => {
      setMessages((prev) => [
        ...prev,
        newMessage('pm', `[PM 세션 종료 (exit ${exitCode})]`),
      ]);
    });
    return () => {
      offData();
      offExit();
      if (flushTimer.current) clearTimeout(flushTimer.current);
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
