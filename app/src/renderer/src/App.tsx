import { useEffect, useState } from 'react';
import { Chat } from './components/Chat';
import { EmployeeRoster } from './components/EmployeeRoster';
import { newMessage, type ChatMessage } from './state/chat-store';
import type { EmployeeRow } from './state/employee-store';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roster, setRoster] = useState<EmployeeRow[]>([]);

  useEffect(() => {
    if (!window.api) {
      console.error('[payroll-os] window.api 없음 — preload 로드 실패.');
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
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
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

    const offRoster = window.api.onRosterUpdate((update) => {
      setRoster((prev) => {
        if (update.kind === 'started') {
          const row: EmployeeRow = {
            sessionId: update.sessionId,
            employeeId: update.employeeId,
            name: update.employeeName,
            role: update.role,
            prompt: update.prompt,
            status: 'working',
            startedAt: update.startedAt,
            output: '',
          };
          return [...prev, row];
        }
        if (update.kind === 'chunk') {
          return prev.map((r) =>
            r.sessionId === update.sessionId ? { ...r, output: r.output + update.text } : r,
          );
        }
        // done
        return prev.map((r) =>
          r.sessionId === update.sessionId
            ? {
                ...r,
                status: update.exitCode === 0 ? 'done' : 'failed',
                endedAt: update.endedAt,
                exitCode: update.exitCode,
              }
            : r,
        );
      });
    });

    return () => {
      offData();
      offExit();
      offRoster();
    };
  }, []);

  async function send(text: string) {
    // PM 응답이 도착할 때까지 빈 placeholder 버블(streaming=true)을 미리 띄워
    // 사장이 "응답 준비 중"임을 시각적으로 인지하게 한다 — emerald 깜빡이만 보임.
    setMessages((prev) => [
      ...prev,
      newMessage('boss', text),
      newMessage('pm', '', true),
    ]);
    try {
      await window.api.sendToPM(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, newMessage('pm', `[전송 실패: ${msg}]`)]);
    }
  }

  return (
    <main className="flex h-full bg-slate-900">
      <EmployeeRoster rows={roster} />
      <div className="flex flex-1 flex-col ring-1 ring-slate-800">
        <Chat messages={messages} onSend={send} />
      </div>
    </main>
  );
}
