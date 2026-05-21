import { useMemo } from 'react';
import type { EmployeeProfile } from '../../../shared/ipc';
import type { EmployeeRow } from '../state/employee-store';
import { CatalogSwitcher } from './CatalogSwitcher';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeProfileRow, type EmployeeUsage } from './EmployeeProfile';

type Props = {
  rows: EmployeeRow[];
  profiles: EmployeeProfile[];
  onToggle: (id: string, next: boolean) => void;
  onOpenSession?: (row: EmployeeRow) => void;
  onOpenUsage?: () => void;
  onOpenOffice?: () => void;
  onOpenQuarter?: () => void;
  onOpenBenchmark?: () => void;
  onCatalogChange?: (activeId: string) => void;
};

export function EmployeeRoster({
  rows,
  profiles,
  onToggle,
  onOpenSession,
  onOpenUsage,
  onOpenOffice,
  onOpenQuarter,
  onOpenBenchmark,
  onCatalogChange,
}: Props) {
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
            .map((r) => (
              <EmployeeCard key={r.sessionId} row={r} onOpen={onOpenSession} compact />
            ))
        )}
      </section>

      <div className="mt-auto flex flex-col gap-2">
        <CatalogSwitcher onChange={onCatalogChange} />
        {onOpenQuarter && (
          <button
            type="button"
            onClick={onOpenQuarter}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-amber-500/60 hover:text-amber-200"
          >
            분기 관리 →
          </button>
        )}
        {onOpenBenchmark && (
          <button
            type="button"
            onClick={onOpenBenchmark}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-sky-500/60 hover:text-sky-200"
          >
            시연 시나리오 →
          </button>
        )}
        {onOpenOffice && (
          <button
            type="button"
            onClick={onOpenOffice}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-300"
          >
            사무실 둘러보기 →
          </button>
        )}
        {onOpenUsage && (
          <button
            type="button"
            onClick={onOpenUsage}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300"
          >
            전체 사용량 보기 →
          </button>
        )}
      </div>
    </aside>
  );
}
