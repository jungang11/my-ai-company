import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Chat } from './components/Chat';
import { EmployeeRoster } from './components/EmployeeRoster';
import { PixelOffice } from './components/PixelOffice';
import { QuarterPanel } from './components/QuarterPanel';
import { StatusBar } from './components/StatusBar';
import { SubSessionDetail } from './components/SubSessionDetail';
import { UsagePanel } from './components/UsagePanel';
import { newMessage, type ChatMessage } from './state/chat-store';
import type { EmployeeRow } from './state/employee-store';
import type {
  EmployeeProfile,
  QuarterMeta,
  RosterUpdatePayload,
  StatusInit,
  StatusSnapshot,
} from '../../shared/ipc';

/**
 * 한 RosterUpdatePayload(started/chunk/done)를 roster state에 반영.
 * 실시간 onRosterUpdate와 앱 시작 historical 복원이 같은 reducer 재사용.
 */
function applyRosterUpdate(
  setRoster: Dispatch<SetStateAction<EmployeeRow[]>>,
  update: RosterUpdatePayload,
): void {
  setRoster((prev) => {
    if (update.kind === 'started') {
      // 이미 있는 sessionId면 (historical 중복 등) 갱신만.
      const idx = prev.findIndex((r) => r.sessionId === update.sessionId);
      if (idx >= 0) return prev;
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
            ...(r.model ? {} : update.metrics.model ? { model: update.metrics.model } : {}),
          }
        : r,
    );
  });
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roster, setRoster] = useState<EmployeeRow[]>([]);
  const [statusInit, setStatusInit] = useState<StatusInit | null>(null);
  const [status, setStatus] = useState<StatusSnapshot | null>(null);
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [pmPending, setPmPending] = useState(false);
  const [meetingMode, setMeetingMode] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [officeOpen, setOfficeOpen] = useState(false);
  const [quarterOpen, setQuarterOpen] = useState(false);
  const [currentQuarter, setCurrentQuarter] = useState<QuarterMeta | null>(null);

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
    window.api.fetchCurrentQuarter().then(setCurrentQuarter).catch((err) => {
      console.error('[payroll-os] fetchCurrentQuarter failed:', err);
    });
    // 앱 시작 시 workspace/sessions의 done 마커 있는 과거 세션을 historical 카드로 복원.
    window.api
      .fetchHistoricalRoster()
      .then((payloads) => {
        for (const p of payloads) {
          applyRosterUpdate(setRoster, p);
        }
      })
      .catch((err) => {
        console.error('[payroll-os] fetchHistoricalRoster failed:', err);
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
      applyRosterUpdate(setRoster, update);
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

  // 직전 PM 응답 중 "회고:" 사장 메시지 직후 PM 메시지를 회고로 캡처.
  // 새 분기 시작 시 archive에 retrospective 필드로 저장하기 위함.
  function captureLatestRetrospective(): string | undefined {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== 'boss') continue;
      const t = m.text.trim();
      if (t.startsWith('회고:') || t.startsWith('회고 ')) {
        for (let j = i + 1; j < messages.length; j++) {
          if (messages[j].role === 'pm') return messages[j].text.trim() || undefined;
        }
        return undefined;
      }
      // 다른 사장 메시지를 만나면 회고 응답 X
      return undefined;
    }
    return undefined;
  }

  function buildRetrospectiveContext(): string {
    if (!currentQuarter) return '';
    const set = new Set(currentQuarter.sessionIds);
    const byEmployee: Record<string, number> = {};
    for (const r of roster) {
      if (set.has(r.sessionId)) {
        byEmployee[r.employeeId] = (byEmployee[r.employeeId] ?? 0) + 1;
      }
    }
    const dist = Object.entries(byEmployee)
      .map(([k, v]) => `${k} ${v}건`)
      .join(', ');
    const desc = currentQuarter.description ? `description: ${currentQuarter.description}\n` : '';
    const distStr = dist ? ` (직원별: ${dist})` : '';
    return (
      `\n\n[app 자동 첨부: 현 분기 정보]\n` +
      `quarterId: ${currentQuarter.quarterId}\n` +
      `title: ${currentQuarter.title}\n` +
      desc +
      `누적 일감: ${currentQuarter.sessionIds.length}건${distStr}`
    );
  }

  async function send(text: string) {
    const trimmed = text.trim();
    const isMeeting = trimmed.startsWith('회의:') || trimmed.startsWith('회의 ');
    const isRetro = trimmed.startsWith('회고:') || trimmed.startsWith('회고 ');
    setMessages((prev) => [...prev, newMessage('boss', text)]);
    setPmPending(true);
    setMeetingMode(isMeeting || isRetro);
    const payload = isRetro ? text + buildRetrospectiveContext() : text;
    try {
      await window.api.sendToPM(payload);
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
          onOpenUsage={() => setUsageOpen(true)}
          onOpenOffice={() => setOfficeOpen(true)}
          onOpenQuarter={() => setQuarterOpen(true)}
        />
        <div className="flex flex-1 flex-col ring-1 ring-slate-800">
          <Chat messages={messages} onSend={send} pending={pmPending} />
        </div>
      </div>
      <StatusBar init={statusInit} status={status} quarter={currentQuarter} />
      <SubSessionDetail row={selectedRow} onClose={() => setSelectedSessionId(null)} />
      {usageOpen && (
        <UsagePanel
          rows={roster}
          profiles={profiles}
          quarter={currentQuarter}
          onClose={() => setUsageOpen(false)}
        />
      )}
      {officeOpen && (
        <PixelOffice
          pmPending={pmPending}
          meetingMode={meetingMode}
          roster={roster}
          profiles={profiles}
          quarter={currentQuarter}
          onClose={() => setOfficeOpen(false)}
          onSend={send}
        />
      )}
      {quarterOpen && (
        <QuarterPanel
          current={currentQuarter}
          onClose={() => setQuarterOpen(false)}
          onStart={(next) => setCurrentQuarter(next)}
          captureRetro={captureLatestRetrospective}
        />
      )}
    </main>
  );
}
