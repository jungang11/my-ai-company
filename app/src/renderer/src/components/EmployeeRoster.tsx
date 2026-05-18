import { useMemo } from 'react';
import type { EmployeeProfile } from '../../../shared/ipc';
import type { EmployeeRow } from '../state/employee-store';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeProfileRow, type EmployeeUsage } from './EmployeeProfile';

type Props = {
  rows: EmployeeRow[];
  profiles: EmployeeProfile[];
  onToggle: (id: string, next: boolean) => void;
  onOpenSession?: (row: EmployeeRow) => void;
};

export function EmployeeRoster({ rows, profiles, onToggle, onOpenSession }: Props) {
  const working = rows.filter((r) => r.status === 'working');
  const finished = rows.filter((r) => r.status !== 'working');
  const activeCount = profiles.filter((p) => p.active).length;

  // 직원별 누적 spawn 횟수 + 토큰 합산. PR5 minimal.
  const usageByEmployee = useMemo(() => {
    const map = new Map<string, EmployeeUsage>();
    for (const r of rows) {
      if (!r.metrics) continue;
      const cur = map.get(r.employeeId) ?? { spawns: 0, totalTokens: 0 };
      cur.spawns += 1;
      cur.totalTokens += r.metrics.inputTokens + r.metrics.outputTokens;
      map.set(r.employeeId, cur);
    }
    return map;
  }, [rows]);

  return (
    <aside className="flex w-72 flex-col gap-3 overflow-y-auto border-r border-slate-800 bg-slate-950/60 p-3">
      <header>
        <div className="text-sm font-medium text-slate-100">직원 roster</div>
        <div className="text-xs text-slate-500">PM이 부른 sub 세션</div>
      </header>

      <section className="space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          직원 명부 ({activeCount}/{profiles.length} 활성)
        </div>
        {profiles.length === 0 ? (
          <div className="text-xs text-slate-600">로딩 중…</div>
        ) : (
          profiles.map((p) => (
            <EmployeeProfileRow
              key={p.id}
              profile={p}
              onToggle={onToggle}
              usage={usageByEmployee.get(p.id)}
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-emerald-400/80">
          작업 중 ({working.length})
        </div>
        {working.length === 0 ? (
          <div className="text-xs text-slate-600">없음</div>
        ) : (
          working.map((r) => <EmployeeCard key={r.sessionId} row={r} onOpen={onOpenSession} />)
        )}
      </section>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          최근 종료 ({finished.length})
        </div>
        {finished.length === 0 ? (
          <div className="text-xs text-slate-600">없음</div>
        ) : (
          finished
            .slice(-6)
            .reverse()
            .map((r) => <EmployeeCard key={r.sessionId} row={r} onOpen={onOpenSession} />)
        )}
      </section>
    </aside>
  );
}
