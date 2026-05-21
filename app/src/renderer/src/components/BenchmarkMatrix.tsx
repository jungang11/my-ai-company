import { useEffect, useMemo, useState } from 'react';
import type { BenchmarkResults, BenchmarkScore, Catalog } from '../../../shared/ipc';
import { SCENARIOS, benchmarkKey } from '../state/benchmarks';

type Props = {
  onClose: () => void;
};

const SCORE_DOT: Record<BenchmarkScore, string> = {
  pass: 'bg-emerald-500',
  partial: 'bg-amber-500',
  fail: 'bg-rose-500',
};

const SCORE_LABEL: Record<BenchmarkScore, string> = {
  pass: '✅',
  partial: '△',
  fail: '✗',
};

function summarize(scores: BenchmarkScore[]): { pass: number; partial: number; fail: number } {
  let pass = 0;
  let partial = 0;
  let fail = 0;
  for (const s of scores) {
    if (s === 'pass') pass += 1;
    else if (s === 'partial') partial += 1;
    else fail += 1;
  }
  return { pass, partial, fail };
}

export function BenchmarkMatrix({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [results, setResults] = useState<BenchmarkResults>({ results: {} });

  useEffect(() => {
    Promise.all([window.api.listCatalogs(), window.api.fetchBenchmarkResults()])
      .then(([cs, rs]) => {
        setCatalogs(cs);
        setResults(rs);
      })
      .catch((err) => console.error('[BenchmarkMatrix] init failed:', err));
  }, []);

  function cellLatest(scenarioId: string, catalogId: string) {
    const arr = results.results[benchmarkKey(scenarioId, catalogId)];
    return arr && arr.length > 0 ? arr[arr.length - 1] : undefined;
  }

  function cellHistory(scenarioId: string, catalogId: string) {
    return results.results[benchmarkKey(scenarioId, catalogId)] ?? [];
  }

  // 합계: 각 catalog별 latest 점수 분포.
  const catalogTotals = useMemo(() => {
    const out: Record<string, { pass: number; partial: number; fail: number; scored: number }> = {};
    for (const c of catalogs) {
      const latests: BenchmarkScore[] = [];
      for (const s of SCENARIOS) {
        const latest = cellLatest(s.id, c.id);
        if (latest) latests.push(latest.score);
      }
      out[c.id] = { ...summarize(latests), scored: latests.length };
    }
    return out;
  }, [results, catalogs]);

  // 합계: 각 scenario별 catalog 횡단 latest.
  const scenarioTotals = useMemo(() => {
    const out: Record<string, { pass: number; partial: number; fail: number; scored: number }> = {};
    for (const s of SCENARIOS) {
      const latests: BenchmarkScore[] = [];
      for (const c of catalogs) {
        const latest = cellLatest(s.id, c.id);
        if (latest) latests.push(latest.score);
      }
      out[s.id] = { ...summarize(latests), scored: latests.length };
    }
    return out;
  }, [results, catalogs]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div>
            <div className="text-sm font-medium text-slate-100">시연 history matrix</div>
            <div className="text-[10px] text-slate-500">
              catalog × scenario — 각 cell의 최근 평가 + history dots (최대 5개). 시스템 프롬프트
              변경 후 회귀 점검에 사용.
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
        <section className="flex-1 overflow-auto px-5 py-3">
          {catalogs.length === 0 ? (
            <div className="text-xs text-slate-500">catalog 로드 중…</div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-[11px]">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr>
                  <th className="border-b border-slate-700 px-2 py-1.5 text-left text-slate-400">
                    scenario
                  </th>
                  {catalogs.map((c) => (
                    <th
                      key={c.id}
                      className="border-b border-slate-700 px-2 py-1.5 text-left text-slate-400"
                      title={c.description}
                    >
                      <div className="truncate max-w-[150px]">{c.name}</div>
                      <div className="text-[9px] text-slate-600">{c.id}</div>
                    </th>
                  ))}
                  <th className="border-b border-slate-700 px-2 py-1.5 text-left text-slate-400">
                    합계
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s) => {
                  const total = scenarioTotals[s.id] ?? {
                    pass: 0,
                    partial: 0,
                    fail: 0,
                    scored: 0,
                  };
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="border-b border-slate-800 px-2 py-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-100">{s.id}</span>
                          <span className="truncate text-slate-300">{s.label}</span>
                        </div>
                        <div className="text-[9px] text-slate-600">→ {s.expected}</div>
                      </td>
                      {catalogs.map((c) => {
                        const latest = cellLatest(s.id, c.id);
                        const hist = cellHistory(s.id, c.id);
                        return (
                          <td
                            key={c.id}
                            className="border-b border-slate-800 px-2 py-1.5"
                            title={
                              hist.length > 0
                                ? hist
                                    .map(
                                      (h) =>
                                        `${SCORE_LABEL[h.score]} ${new Date(h.ts).toLocaleString()}`,
                                    )
                                    .join('\n')
                                : '평가 없음'
                            }
                          >
                            {latest ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{SCORE_LABEL[latest.score]}</span>
                                <div className="flex gap-0.5">
                                  {hist.slice(-5).map((h, i) => (
                                    <span
                                      key={i}
                                      className={`h-1.5 w-1.5 rounded-full ${SCORE_DOT[h.score]}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-700">·</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-slate-800 px-2 py-1.5 text-slate-400">
                        {total.scored > 0
                          ? `✅${total.pass} △${total.partial} ✗${total.fail}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
                {/* 합계 row */}
                <tr className="bg-slate-950/40">
                  <td className="px-2 py-1.5 font-medium text-slate-300">합계</td>
                  {catalogs.map((c) => {
                    const t = catalogTotals[c.id] ?? {
                      pass: 0,
                      partial: 0,
                      fail: 0,
                      scored: 0,
                    };
                    return (
                      <td key={c.id} className="px-2 py-1.5 text-slate-400">
                        {t.scored > 0
                          ? `${t.scored}/${SCENARIOS.length} (✅${t.pass} △${t.partial} ✗${t.fail})`
                          : '—'}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-slate-600"></td>
                </tr>
              </tbody>
            </table>
          )}
        </section>
        <footer className="border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
          평가 입력은 "시연 시나리오" 모달에서. 본 matrix는 read-only 회귀 점검 view.
        </footer>
      </div>
    </div>
  );
}
