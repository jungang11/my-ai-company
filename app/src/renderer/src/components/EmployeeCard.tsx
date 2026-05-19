import type { EmployeeRow } from '../state/employee-store';

const STATUS_LABEL: Record<EmployeeRow['status'], string> = {
  working: '작업 중',
  done: '완료',
  failed: '실패',
};

const STATUS_RING: Record<EmployeeRow['status'], string> = {
  working: 'ring-emerald-500/60',
  done: 'ring-slate-600',
  failed: 'ring-rose-500/60',
};

const STATUS_DOT: Record<EmployeeRow['status'], string> = {
  working: 'bg-emerald-400 animate-pulse',
  done: 'bg-slate-500',
  failed: 'bg-rose-500',
};

type Props = {
  row: EmployeeRow;
  onOpen?: (row: EmployeeRow) => void;
  /** true면 작게 (finished 카드 — prompt 1줄 + tail 숨김) */
  compact?: boolean;
};

export function EmployeeCard({ row, onOpen, compact }: Props) {
  const elapsedMs = (row.endedAt ?? Date.now()) - row.startedAt;
  const elapsed = Math.max(0, Math.round(elapsedMs / 1000));
  const tail = row.output.slice(-200).trim();

  return (
    <button
      type="button"
      onClick={() => onOpen?.(row)}
      className={`w-full cursor-pointer rounded-lg bg-slate-900 text-left text-xs ring-1 ${STATUS_RING[row.status]} shadow-sm transition hover:bg-slate-800/80 hover:ring-emerald-400/40 ${
        compact ? 'px-2 py-1.5' : 'p-3'
      }`}
      title="클릭해서 전체 로그 보기"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[row.status]}`} />
          <div className="truncate font-medium text-slate-100">{row.name}</div>
          {!compact && <div className="text-slate-500">· {row.role}</div>}
        </div>
        <div className="shrink-0 text-[10px] text-slate-500">
          {compact ? `${elapsed}s` : `${STATUS_LABEL[row.status]} ${elapsed}s`}
        </div>
      </div>
      <div className={`mt-1 text-slate-400 ${compact ? 'line-clamp-1 text-[10px]' : 'mt-2 line-clamp-2'}`}>
        {row.prompt}
      </div>
      {!compact && tail && (
        <div className="mt-2 max-h-16 overflow-hidden border-t border-slate-800 pt-2 text-[10px] text-slate-500">
          {tail}
        </div>
      )}
    </button>
  );
}
