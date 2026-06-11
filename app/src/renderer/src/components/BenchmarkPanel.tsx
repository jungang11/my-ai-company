import { useEffect, useMemo, useState } from 'react';
import type { BenchmarkResult, BenchmarkResults, BenchmarkScore } from '../../../shared/ipc';
import {
  SCENARIOS,
  CATEGORY_COLOR,
  benchmarkKey,
  type BenchmarkScenario,
} from '../state/benchmarks';

type Props = {
  onClose: () => void;
  onSend: (text: string) => void;
  catalogId: string; // 점수 기록 시 어느 catalog 기준인지 보존
};

const SCORE_LABEL: Record<BenchmarkScore, string> = {
  pass: '✅',
  partial: '△',
  fail: '✗',
};

const SCORE_COLOR: Record<BenchmarkScore, string> = {
  pass: 'bg-emerald-700/40 text-emerald-200 ring-emerald-600/60',
  partial: 'bg-amber-700/40 text-amber-200 ring-amber-600/60',
  fail: 'bg-rose-700/40 text-rose-200 ring-rose-600/60',
};

const resultKey = benchmarkKey;

export function BenchmarkPanel({ onClose, onSend, catalogId }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [results, setResults] = useState<BenchmarkResults>({ results: {} });

  useEffect(() => {
    window.api
      .fetchBenchmarkResults()
      .then(setResults)
      .catch(() => {});
  }, []);

  async function setScore(scenarioId: string, score: BenchmarkScore) {
    const result: BenchmarkResult = {
      scenarioId,
      score,
      catalogId,
      ts: Date.now(),
    };
    try {
      const updated = await window.api.setBenchmarkScore(result);
      setResults(updated);
    } catch (e) {
      console.error('[BenchmarkPanel] setScore failed:', e);
    }
  }

  function pick(s: BenchmarkScenario) {
    onSend(s.message);
    onClose();
  }

  function latestScore(scenarioId: string): BenchmarkResult | undefined {
    const arr = results.results[resultKey(scenarioId, catalogId)];
    return arr && arr.length > 0 ? arr[arr.length - 1] : undefined;
  }

  function history(scenarioId: string): BenchmarkResult[] {
    return results.results[resultKey(scenarioId, catalogId)] ?? [];
  }

  // 현 catalog 기준 합계 — 가장 최근 평가만.
  const summary = useMemo(() => {
    let pass = 0;
    let partial = 0;
    let fail = 0;
    let scored = 0;
    for (const s of SCENARIOS) {
      const arr = results.results[resultKey(s.id, catalogId)];
      if (!arr || arr.length === 0) continue;
      const latest = arr[arr.length - 1];
      scored += 1;
      if (latest.score === 'pass') pass += 1;
      else if (latest.score === 'partial') partial += 1;
      else if (latest.score === 'fail') fail += 1;
    }
    return { pass, partial, fail, scored, total: SCENARIOS.length };
  }, [results, catalogId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div>
            <div className="text-sm font-medium text-slate-100">
              시연 시나리오{' '}
              <span className="text-[10px] text-slate-500">
                · catalog "{catalogId}" 기준 {summary.scored}/{summary.total} 평가됨
                {summary.scored > 0 &&
                  ` (✅ ${summary.pass} / △ ${summary.partial} / ✗ ${summary.fail})`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              docs/benchmark.md S1~S11 — 카드 클릭 → PM 전송. ✅/△/✗ 버튼으로 평가 저장 (workspace/benchmark-results.json).
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

        <section className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SCENARIOS.map((s) => {
              const latest = latestScore(s.id);
              const hist = history(s.id);
              return (
                <div
                  key={s.id}
                  className={`rounded-lg p-3 ring-1 transition ${CATEGORY_COLOR[s.category]}`}
                >
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    className="block w-full text-left hover:opacity-90"
                    title="클릭 → PM 채팅에 메시지 자동 전송"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-100">{s.id}</span>
                        <span className="text-xs text-slate-200">{s.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">→ {s.expected}</span>
                    </div>
                    <div className="mt-2 line-clamp-2 text-[11px] text-slate-300">{s.message}</div>
                    {s.hint && (
                      <div className="mt-1.5 text-[10px] text-amber-300/80">{s.hint}</div>
                    )}
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-700/40 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {(['pass', 'partial', 'fail'] as const).map((sc) => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setScore(s.id, sc)}
                            className={`rounded px-1.5 py-0.5 text-[10px] ring-1 transition ${
                              latest?.score === sc
                                ? SCORE_COLOR[sc]
                                : 'bg-slate-900/40 text-slate-500 ring-slate-700 hover:text-slate-200'
                            }`}
                          >
                            {SCORE_LABEL[sc]}
                          </button>
                        ))}
                      </div>
                      {hist.length > 0 && (
                        <div
                          className="flex items-center gap-0.5"
                          title={`평가 history (오래된 → 최근, 최대 10개): ${hist
                            .map(
                              (h) =>
                                `${SCORE_LABEL[h.score]} ${new Date(h.ts).toLocaleString()}${
                                  h.model ? ` [${h.model}]` : ''
                                }`,
                            )
                            .join(' / ')}`}
                        >
                          {hist.slice(-5).map((h, i) => (
                            <span
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                h.score === 'pass'
                                  ? 'bg-emerald-500'
                                  : h.score === 'partial'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {latest && (
                      <span
                        className="text-[9px] text-slate-500"
                        title={new Date(latest.ts).toLocaleString()}
                      >
                        {hist.length}회 평가
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
          합격: 11개 중 9개+ ✅. 분기 S9/S11은 분기 관리 모달에서 직접 진행 권장.
        </footer>
      </div>
    </div>
  );
}
