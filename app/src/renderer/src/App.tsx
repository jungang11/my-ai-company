import { useEffect, useState } from 'react';
import { Chat } from './components/Chat';
import { EmployeeRoster } from './components/EmployeeRoster';
import { StatusBar } from './components/StatusBar';
import { SubSessionDetail } from './components/SubSessionDetail';
import { newMessage, type ChatMessage } from './state/chat-store';
import type { EmployeeRow } from './state/employee-store';
import type { EmployeeProfile, StatusInit, StatusSnapshot } from '../../shared/ipc';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roster, setRoster] = useState<EmployeeRow[]>([]);
  const [statusInit, setStatusInit] = useState<StatusInit | null>(null);
  const [status, setStatus] = useState<StatusSnapshot | null>(null);
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [pmPending, setPmPending] = useState(false);

  useEffect(() => {
    if (!window.api) {
      console.error('[payroll-os] window.api 없음 — preload 로드 실패.');
      setMessages((prev) => [
        ...prev,
        newMessage('pm', '[preload 로드 실패: window.api undefined. DevTools 콘솔 참고.]'),
      ]);
      return;
    }

    window.api.fetchStatusInit().then(setStatusInit).catch((err) => {
      console.error('[payroll-os] fetchStatusInit failed:', err);
    });
    window.api.fetchEmployees().then(setProfiles).catch((err) => {
      console.error('[payroll-os] fetchEmployees failed:', err);
    });

    const offStatus = window.api.onStatus((snap) => setStatus(snap));
    const offEmployeeChanged = window.api.onEmployeeChanged((updated) => {
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });

    const offData = window.api.onPMOutput(({ text }) => {
      setPmPending(false); // 첫 chunk 도착 = pending 해제
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'pm' && last.streaming) {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
        return [...prev, newMessage('pm', text, true)];
      });
    });

    const offExit = window.api.onPMExit(({ exitCode }) => {
      setPmPending(false);
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
            ...(update.model ? { model: update.model } : {}),
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
                metrics: update.metrics,
                // started 시점에 model 미상이었다면 done의 metrics.model로 채움
                ...(r.model ? {} : update.metrics.model ? { model: update.metrics.model } : {}),
              }
            : r,
        );
      });
    });

    return () => {
      offData();
      offExit();
      offRoster();
      offStatus();
      offEmployeeChanged();
    };
  }, []);

  async function handleToggle(id: string, next: boolean) {
    try {
      await window.api.toggleEmployee(id, next);
      // onEmployeeChanged 이벤트가 set 처리
    } catch (err) {
      console.error('[payroll-os] toggleEmployee failed:', err);
    }
  }

  async function send(text: string) {
    setMessages((prev) => [...prev, newMessage('boss', text)]);
    setPmPending(true);
    try {
      await window.api.sendToPM(text);
    } catch (err) {
      setPmPending(false);
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, newMessage('pm', `[전송 실패: ${msg}]`)]);
    }
  }

  const selectedRow = selectedSessionId
    ? roster.find((r) => r.sessionId === selectedSessionId) ?? null
    : null;

  return (
    <main className="flex h-full flex-col bg-slate-900">
      <div className="flex flex-1 overflow-hidden">
        <EmployeeRoster
          rows={roster}
          profiles={profiles}
          onToggle={handleToggle}
          onOpenSession={(row) => setSelectedSessionId(row.sessionId)}
        />
        <div className="flex flex-1 flex-col ring-1 ring-slate-800">
          <Chat messages={messages} onSend={send} pending={pmPending} />
        </div>
      </div>
      <StatusBar init={statusInit} status={status} />
      <SubSessionDetail row={selectedRow} onClose={() => setSelectedSessionId(null)} />
    </main>
  );
}
