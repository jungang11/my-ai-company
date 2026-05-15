import type { EmployeeRow } from '../state/employee-store';
import { EmployeeCard } from './EmployeeCard';

export function EmployeeRoster({ rows }: { rows: EmployeeRow[] }) {
  const working = rows.filter((r) => r.status === 'working');
  const finished = rows.filter((r) => r.status !== 'working');

  return (
    <aside className="flex w-72 flex-col gap-3 overflow-y-auto border-r border-slate-800 bg-slate-950/60 p-3">
      <header>
        <div className="text-sm font-medium text-slate-100">직원 roster</div>
        <div className="text-xs text-slate-500">PM이 부른 sub 세션</div>
      </header>

      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-wide text-emerald-400/80">
          작업 중 ({working.length})
        </div>
        {working.length === 0 ? (
          <div className="text-xs text-slate-600">없음</div>
        ) : (
          working.map((r) => <EmployeeCard key={r.sessionId} row={r} />)
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
            .map((r) => <EmployeeCard key={r.sessionId} row={r} />)
        )}
      </section>
    </aside>
  );
}
