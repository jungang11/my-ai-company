// docs/benchmark.md S1~S11 시나리오 — TS 상수로 정착. 분기마다 사장 조정 시 양쪽 동기화.
// BenchmarkPanel + BenchmarkMatrix가 공유.

export type BenchmarkCategory =
  | '단순'
  | '코드'
  | '분석'
  | '검증'
  | '회의'
  | '함정'
  | '직접답'
  | '분기';

export type BenchmarkScenario = {
  id: string;
  label: string;
  category: BenchmarkCategory;
  expected: string;
  message: string;
  hint?: string;
};

export const SCENARIOS: readonly BenchmarkScenario[] = [
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

export const CATEGORY_COLOR: Record<BenchmarkCategory, string> = {
  단순: 'bg-slate-900/50 ring-slate-700',
  코드: 'bg-sky-950/30 ring-sky-800/60',
  분석: 'bg-emerald-950/30 ring-emerald-800/60',
  검증: 'bg-rose-950/30 ring-rose-800/60',
  회의: 'bg-amber-950/30 ring-amber-800/60',
  함정: 'bg-violet-950/30 ring-violet-800/60',
  직접답: 'bg-slate-900/50 ring-slate-700',
  분기: 'bg-orange-950/30 ring-orange-800/60',
};

export function benchmarkKey(scenarioId: string, catalogId: string): string {
  return `${scenarioId}::${catalogId}`;
}
