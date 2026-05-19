import { useEffect, useState } from 'react';
import type { QuarterMeta } from '../../../shared/ipc';

type Props = {
  current: QuarterMeta | null;
  onClose: () => void;
  onStart: (next: QuarterMeta) => void;
  /** 직전 PM 회고 응답이 있으면 archive에 retrospective로 저장. App.tsx의 messages 기반. */
  captureRetro?: () => string | undefined;
};

function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function durationLabel(ms: number): string {
  const days = Math.floor(ms / (24 * 3600 * 1000));
  if (days >= 1) return `${days}일째`;
  const h = Math.floor(ms / 3600_000);
  if (h >= 1) return `${h}시간째`;
  return '방금 시작';
}

export function QuarterPanel({ current, onClose, onStart, captureRetro }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [archived, setArchived] = useState<QuarterMeta[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    window.api
      .listQuarters()
      .then(setArchived)
      .catch((e) => {
        console.error('[QuarterPanel] listQuarters failed:', e);
      });
  }, []);

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setErr('분기 제목을 입력해주세요');
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const previousRetro = captureRetro?.();
      const next = await window.api.startQuarter({
        title: trimmed,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(previousRetro ? { previousRetro } : {}),
      });
      onStart(next);
      // archive 목록 갱신 (직전 분기가 새로 archive됨)
      try {
        const updated = await window.api.listQuarters();
        setArchived(updated);
      } catch {
        // skip
      }
      setTitle('');
      setDescription('');
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  const sinceStart = current ? Date.now() - current.startedAt : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div>
            <div className="text-sm font-medium text-slate-100">분기 관리</div>
            <div className="text-[10px] text-slate-500">
              사장이 명시 선언으로 분기 시작/종료. 시간 자동 X (카이로식 페이스).
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            닫기 (Esc)
          </button>
        </header>

        <section className="space-y-3 border-b border-slate-800 px-5 py-4">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">현재 분기</div>
          {current ? (
            <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-medium text-amber-300">{current.title}</span>
                <span className="text-[10px] text-slate-500">{durationLabel(sinceStart)}</span>
              </div>
              {current.description && (
                <div className="mt-1 text-xs text-slate-300">{current.description}</div>
              )}
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500">
                <div>
                  <span className="text-slate-600">id</span> <span className="font-mono">{current.quarterId}</span>
                </div>
                <div>
                  <span className="text-slate-600">시작</span> {formatDate(current.startedAt)}
                </div>
                <div>
                  <span className="text-slate-600">누적 일감</span> {current.sessionIds.length}건
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">현재 분기 없음. 아래서 새로 시작.</div>
          )}
        </section>

        <section className="space-y-3 border-b border-slate-800 px-5 py-4">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">새 분기 시작</div>
          <div className="text-[10px] text-slate-500">
            현재 분기는 자동으로 archive에 보존 (workspace/quarters/&lt;quarterId&gt;.json).
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="분기 제목 (예: Phase 6 인공지능 직원 추가)"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="(선택) 분기 목표 한 단락 — PM이 일감 분배 시 참고"
            className="w-full resize-none rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
          />
          {err && <div className="text-xs text-rose-400">{err}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-md px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !title.trim()}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {pending ? '시작 중...' : '새 분기 시작'}
            </button>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">
              지난 분기 ({archived.length})
            </div>
            {archived.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                {showAll ? '접기' : '전부 보기'}
              </button>
            )}
          </div>
          {archived.length === 0 ? (
            <div className="text-xs text-slate-600">archive 없음 — 새 분기 시작 시 직전 분기가 자동 보존.</div>
          ) : (
            <div className="space-y-2">
              {(showAll ? archived : archived.slice(0, 3)).map((q) => (
                <div
                  key={q.quarterId}
                  className="rounded-md bg-slate-950/50 p-2.5 ring-1 ring-slate-800"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-200">
                      {q.title || 'Untitled'}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-500">
                      {q.sessionIds.length}건
                    </span>
                  </div>
                  {q.description && (
                    <div className="mt-0.5 truncate text-[11px] text-slate-400">
                      {q.description}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-slate-600">
                    {formatDate(q.startedAt)} → {q.endedAt ? formatDate(q.endedAt) : '진행 중'}
                  </div>
                  {q.retrospective && (
                    <div className="mt-1.5 line-clamp-2 text-[11px] text-slate-300">
                      {q.retrospective}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
