import { useEffect } from 'react';
import type { EmployeeRow } from '../state/employee-store';

type Props = {
  row: EmployeeRow | null;
  onClose: () => void;
};

const STATUS_BADGE: Record<EmployeeRow['status'], string> = {
  working: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
  done: 'bg-slate-700/40 text-slate-300 ring-slate-600',
  failed: 'bg-rose-500/20 text-rose-300 ring-rose-500/40',
};

function formatDuration(startedAt: number, endedAt?: number): string {
  const ms = (endedAt ?? Date.now()) - startedAt;
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function SubSessionDetail({ row, onClose }: Props) {
  useEffect(() => {
    if (!row) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-medium text-slate-100">{row.name}</div>
            <div className="text-xs text-slate-500">· {row.role}</div>
            <div className="text-[10px] text-slate-600">({row.employeeId})</div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${STATUS_BADGE[row.status]}`}
            >
              {row.status === 'working' ? '작업 중' : row.status === 'done' ? '완료' : '실패'}
              {' · '}
              {formatDuration(row.startedAt, row.endedAt)}
              {row.exitCode !== undefined ? ` · exit ${row.exitCode}` : ''}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              닫기 (Esc)
            </button>
          </div>
        </header>

        <section className="border-b border-slate-800 px-5 py-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">사장이 시킨 일감</div>
          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{row.prompt}</div>
        </section>

        {(row.model || row.metrics) && (
          <section className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-800 px-5 py-2 text-[11px] text-slate-400">
            {row.model && (
              <span>
                <span className="text-slate-500">model</span>{' '}
                <span className="text-emerald-400">
                  {row.model.replace('claude-', '').replace('-20251001', '')}
                </span>
              </span>
            )}
            {row.metrics && (
              <>
                <span>
                  <span className="text-slate-500">tok</span>{' '}
                  ↑{formatTokens(row.metrics.inputTokens)} ↓
                  {formatTokens(row.metrics.outputTokens)}
                </span>
                <span title="cache_read / cache_creation">
                  <span className="text-slate-500">cache</span> R
                  {formatTokens(row.metrics.cacheReadTokens)} / C
                  {formatTokens(row.metrics.cacheCreationTokens)}
                </span>
                <span>
                  <span className="text-slate-500">cost</span>{' '}
                  ${row.metrics.costUsd.toFixed(4)}
                </span>
              </>
            )}
          </section>
        )}

        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-2 text-[10px] uppercase tracking-wide text-slate-500">
            output.log · sessionId {row.sessionId}
          </div>
          <pre className="flex-1 overflow-y-auto whitespace-pre-wrap break-words px-5 py-3 font-mono text-xs leading-relaxed text-slate-200">
            {row.output || '(아직 출력 없음)'}
          </pre>
        </section>
      </div>
    </div>
  );
}
