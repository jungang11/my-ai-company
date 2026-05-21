import { useEffect, useMemo, useState } from 'react';
import type { BenchmarkResult, BenchmarkResults, BenchmarkScore } from '../../../shared/ipc';

// docs/benchmark.md S1~S11 시나리오 — TS 상수로 정착. 분기마다 사장 조정 시 양쪽 동기화.
type BenchmarkScenario = {
  id: string;
  label: string;
  category: '단순' | '코드' | '분석' | '검증' | '회의' | '함정' | '직접답' | '분기';
  expected: string; // 기대 직원
  message: string;
  hint?: string; // 평가 포인트
};

const SCENARIOS: readonly BenchmarkScenario[] = [
  {
    id: 'S1',
    label: '단순 lookup (Haiku/Spark)',
    category: '단순',
    expected: 'utility-1',
    message: 'README.md 단어 수랑 줄 수 알려줘',
    hint: 'utility-1 spawn + 5초 안. dev에 위임 시 ✗',
  },
  {
    id: 'S2',
    label: '일상 코드 (1 파일 + 자체 검증)',
    category: '코드',
    expected: 'dev-1',
    message:
      'core/employees/pm.json의 effort 필드를 "high"로 바꿔줘. 변경 후 JSON valid한지 검증해줘. (검증 후 git checkout으로 revert 권장)',
    hint: 'dev-1 + JSON valid 검증. dev-arch는 X (1 파일)',
  },
  {
    id: 'S3',
    label: '아키텍처 분석',
    category: '분석',
    expected: 'dev-arch',
    message:
      'PixelOffice가 100명 직원까지 확장됐을 때 좌석 배치를 어떻게 가야 할지 아키텍처 관점에서 분석해줘. SEATS 상수 유지 vs 동적 생성 vs SQLite 도입 비교.',
    hint: '추천 1개 + 영향 범위 + 회귀 위험. dev-arch (dev-1 X)',
  },
  {
    id: 'S4',
    label: '외부 리서치 + 출처',
    category: '분석',
    expected: 'planner-1',
    message:
      'Electron 33 → 34 마이그레이션 시 breaking change가 있는지 리서치해줘. 출처 URL 1~3개 인용.',
    hint: 'planner-1 + WebSearch + 출처 인용. 가짜 URL ✗',
  },
  {
    id: 'S5',
    label: '검증 (PASS/FAIL + 위험도)',
    category: '검증',
    expected: 'qa-1',
    message:
      '방금 변경한 PixelOffice.tsx의 levelMap useMemo에 edge case 검토해줘. roster 빈 배열, employeeId 중복, metrics undefined 등.',
    hint: 'qa-1 + PASS/부분/FAIL + 위험도 ranking',
  },
  {
    id: 'S6',
    label: '회의 모드 (다수 spawn)',
    category: '회의',
    expected: 'dev-arch + planner-1 + qa-1',
    message:
      '회의: payroll-os Phase 5에 직원 성장 시스템(레벨/경험치) 도입 vs 분기 게임 사이클(목표/회고) 도입 — 어느 쪽이 우선인지 결정',
    hint: '3+ 명 동시 spawn + 회의실 visual + 통합 보고',
  },
  {
    id: 'S7',
    label: '잘못된 위임 함정',
    category: '함정',
    expected: 'dev-arch 또는 planner-1',
    message: '이 코드베이스 아키텍처를 SQLite + Redis 도입 방향으로 분석해줘',
    hint: 'utility-1 회피 (Haiku 한계). dev-arch/planner-1 spawn 정답',
  },
  {
    id: 'S8',
    label: 'PM 직접 답 (Task tool 0회)',
    category: '직접답',
    expected: 'PM (Task tool 호출 X)',
    message: '너 자신 소개해줘. 직원 명부도 같이.',
    hint: 'PM이 Task tool 호출 X. 한 단락 + 직원 표',
  },
  {
    id: 'S9',
    label: '분기 시작',
    category: '분기',
    expected: '사장 직접 (분기 관리 모달)',
    message:
      '분기 관리 → 새 분기 시작 폼 사용 (title: "Phase 6 인공지능 직원" / description: "Codex/Gemini 직원 도입 결정")',
    hint: 'StatusBar/Whiteboard pulse/PM 응답 3개 갱신',
  },
  {
    id: 'S10',
    label: '회고: prefix (분기 회고)',
    category: '분기',
    expected: 'planner-1 + qa-1',
    message: '회고: 이 분기 동안 어떤 일감이 진행됐고 목표 달성도 어땠는지 알려줘',
    hint: '회의실 visual + 회고 단락 + 달성도 한 줄 + 다음 분기 추천',
  },
  {
    id: 'S11',
    label: '분기 archive 영속화',
    category: '분기',
    expected: '사장 직접 (새 분기 시작)',
    message:
      '분기 관리 → 새 분기 시작 (title: "다음 분기 (테스트)") → 모달 재열면 archive 카드에 직전 분기 retrospective 자동 채워짐',
    hint: 'archive 카드 retrospective preview 표시',
  },
];

const CATEGORY_COLOR: Record<BenchmarkScenario['category'], string> = {
  단순: 'bg-slate-900/50 ring-slate-700',
  코드: 'bg-sky-950/30 ring-sky-800/60',
  분석: 'bg-emerald-950/30 ring-emerald-800/60',
  검증: 'bg-rose-950/30 ring-rose-800/60',
  회의: 'bg-amber-950/30 ring-amber-800/60',
  함정: 'bg-violet-950/30 ring-violet-800/60',
  직접답: 'bg-slate-900/50 ring-slate-700',
  분기: 'bg-orange-950/30 ring-orange-800/60',
};

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

function resultKey(scenarioId: string, catalogId: string): string {
  return `${scenarioId}::${catalogId}`;
}

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
                            .map((h) => `${SCORE_LABEL[h.score]} ${new Date(h.ts).toLocaleString()}`)
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
