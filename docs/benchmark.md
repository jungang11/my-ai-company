# Benchmark — payroll-os 직원 퍼포먼스 검증 시나리오

> 사장이 정해진 일감을 PM에게 보내 직원 결과를 평가하는 시연용 문서.
> 시스템 프롬프트 변경 (`core/employees/pm.json`, `.claude/agents/*.md`) 후 정확도 회귀 점검에 사용.
> 갱신 시점: 2026-05-19 — 퍼포먼스 라운드 (PR1 PM 강화 + PR2 직원 5명 강화) 직후.

---

## 사용법

1. `cd app && npm run dev` 띄움.
2. 아래 시나리오 순서대로 PM 채팅창에 메시지 보냄.
3. 사무실 모달(좌측 사이드바 "사무실 둘러보기 →") 열어 어느 직원이 spawn되는지 + 풍선 텍스트 확인.
4. PM 응답을 "기대 결과" 컬럼과 비교 → 점수 (✅ 완전 일치 / △ 부분 일치 / ✗ 잘못).
5. 시나리오당 1~2분.
6. 결과를 `docs/benchmark-results.md`(생성 안 해도 됨)에 또는 메모에 기록.

---

## S1 — utility-1 (단순 lookup, Haiku)

**메시지**:
```
README.md 단어 수랑 줄 수 알려줘
```

**기대 직원**: utility-1 (사무실에서 막내, slate)

**기대 결과**:
- 한 줄 또는 한 단락
- "줄 수: X, 단어 수: Y" 같이 명확한 숫자
- 부연 설명 X
- PM이 "막내 작업 결과: ..." 식 통합 보고

**평가 기준**:
- ✅ utility-1 spawn 확인 (사이드바 카드 등장)
- ✅ 숫자 정확 (`wc -lw README.md` 실측과 일치)
- ✅ 5초 안에 완료
- ✗ dev-1/dev-arch에 위임 → 잘못된 위임

---

## S2 — dev-1 (일상 코드)

**메시지**:
```
core/employees/pm.json의 effort 필드를 "high"로 바꿔줘. 변경 후 JSON valid한지 검증해줘.
```

**기대 직원**: dev-1 (김개발, blue)

**기대 결과**:
- 변경 파일 + 라인 한 줄
- `node -e "JSON.parse(...)"` 같은 검증 결과 인용
- 회귀 위험 한 줄 (PM이 다음 spawn할 때 effort 적용 여부)

**평가 기준**:
- ✅ dev-1 spawn (dev-arch는 X — 1 파일 단순 변경)
- ✅ JSON valid 검증 실제 돌림
- ✅ 결과 짧고 명확
- ✗ 옵션 늘어놓기 / 짐작 / 검증 단계 누락

> **검증 후 사장이 변경 revert 권장** (effort 그대로 xhigh 유지):
> `git checkout core/employees/pm.json`

---

## S3 — dev-arch (아키텍처)

**메시지**:
```
PixelOffice가 100명 직원까지 확장됐을 때 좌석 배치를 어떻게 가야 할지 아키텍처 관점에서 분석해줘. SEATS 상수 유지 vs 동적 생성 vs SQLite 도입 비교.
```

**기대 직원**: dev-arch (박아키, violet) — "아키텍처 관점"이라 명시

**기대 결과**:
- 추천 1개 + 근거 한 줄
- 영향 범위 명시 (어떤 파일/모듈 갈아엎는지)
- 회귀 위험 + 완화책
- 사장 confirm 안건 명시 (큰 결정이면)

**평가 기준**:
- ✅ dev-arch spawn (dev-1은 X)
- ✅ 옵션 비교 표 또는 추천 1개
- ✅ 영향 범위 grep으로 확인 후 보고
- ✗ 추상 / 짐작 / 옵션만 늘어놓고 결정 X

---

## S4 — planner-1 (외부 리서치)

**메시지**:
```
Electron 33 → 34 마이그레이션 시 breaking change가 있는지 리서치해줘. 출처 URL 1~3개 인용.
```

**기대 직원**: planner-1 (이기획, emerald) — WebSearch 도구 사용

**기대 결과**:
- 추천 1개 (마이그레이션 OK / 위험 / 보류) + 근거
- 출처 URL 1~3개 + 한 줄 발췌
- breaking change 항목 표 (있으면)

**평가 기준**:
- ✅ planner-1 spawn (utility-1/dev는 X — 외부 자료 리서치)
- ✅ 출처 URL 실제 인용 (가짜 URL 짐작 X)
- ✅ 결정형 추천 한 줄
- ✗ "옵션 A/B/C, 사장이 선택" 패턴 — planner-1은 추천 의무

---

## S5 — qa-1 (검증)

**메시지**:
```
방금 변경한 PixelOffice.tsx의 levelMap useMemo에 edge case 검토해줘. roster 빈 배열, employeeId 중복, metrics undefined 등.
```

**기대 직원**: qa-1 (정검증, rose)

**기대 결과**:
- PASS / FAIL / 부분 PASS 판정
- 발견한 문제 (있으면) 파일:라인 + 위험도 (high/medium/low)
- 회귀 위험 1~3개
- 검증 step 인용

**평가 기준**:
- ✅ qa-1 spawn (dev-arch 아님 — 검증이라 명시)
- ✅ 위험도 ranking 강제
- ✅ actionable한 점만
- ✗ "의견 늘어놓기" / "이 부분도 검토해보세요" 류 추상

---

## S6 — 회의 모드 (다수 spawn)

**메시지**:
```
회의: payroll-os Phase 5에 직원 성장 시스템(레벨/경험치) 도입 vs 분기 게임 사이클(목표/회고) 도입 — 어느 쪽이 우선인지 결정
```

**기대 직원 (동시 spawn)**:
- dev-arch (아키텍처 관점 — 변경 비용)
- planner-1 (리서치/대안 관점)
- qa-1 (리스크 관점)

**기대 결과**:
- 사무실에서 6명+사장이 회의 테이블 둘레로 walk cycle 이동
- header `● 회의 중` 배지 + PM `💬` / 나머지 `···` 풍선
- PM 통합 보고: 비교 표/bullet, 결정 한 줄

**평가 기준**:
- ✅ 3+ 명 동시 spawn (사이드바에 카드 3+개 동시 등장)
- ✅ 회의실 visual 활성 (모달 열어 확인)
- ✅ PM 결정형 통합 보고
- ✗ 1명만 spawn / dev-1만 spawn / 회의 visual 안 보임

---

## S7 — 잘못된 위임 함정 (utility-1에 아키텍처 일감)

**메시지** (PM의 위임 결정 기준 검증용):
```
이 코드베이스 아키텍처를 SQLite + Redis 도입 방향으로 분석해줘
```

**기대 동작**:
- PM이 dev-arch (또는 planner-1) spawn — utility-1 X

**평가 기준**:
- ✅ dev-arch 또는 planner-1 spawn
- ✗ utility-1 spawn — Haiku 한계로 잘못된 결과

---

## S8 — PM 직접 답해야 하는 case

**메시지**:
```
너 자신 소개해줘. 직원 명부도 같이.
```

**기대 동작**:
- PM이 Task tool 호출 없이 직접 답
- 본인 + 5명 직원 명부 + 회사 구조 설명

**평가 기준**:
- ✅ Task tool 호출 0회
- ✅ 한국어, 1~3문장 본인 + 5명 직원 표
- ✗ utility-1에 위임 / 잘못된 위임 / Task tool 안 쓰니 못 한다 답변

---

## S9 — 분기 시작 (Phase 5 분기 사이클)

**준비**:
1. 좌측 사이드바 하단 "분기 관리 →" 클릭.
2. 모달 열림 → "새 분기 시작" 폼:
   - title: `Phase 6 인공지능 직원 추가`
   - description: `Codex/Gemini/Figma 직원 도입 결정 + 멀티 모델 시연 만들기`
3. "새 분기 시작" 버튼.

**기대 동작**:
- StatusBar 하단에 `분기: Phase 6 인공지능 직…` amber 표시
- 사무실 모달 열면 화이트보드(우상)에 분기 title + 진척 bar(0%) + amber pulse cue 3초
- PM 채팅에 자동 시스템 메시지 응답: `분기 'Phase 6 인공지능 직원 추가' 인지함, 다음 일감부터 반영` 류 한 줄

**평가 기준**:
- ✅ StatusBar/화이트보드/PM 응답 3개 모두 갱신
- ✅ amber pulse 3초 cue 보임
- ✗ PM 응답 없음, 또는 길게 늘어놓음

---

## S10 — 회고: prefix (분기 회고 자동 처리)

**전제**: S9 분기 시작 후, S1~S5 일감 몇 개 보낸 상태(누적 일감 3~5건). 사무실에 직원별 분기 spawn 건수 표시되어 있음.

**메시지**:
```
회고: 이 분기 동안 어떤 일감이 진행됐고 목표 달성도 어땠는지 알려줘
```

**기대 동작**:
- App.tsx가 메시지 끝에 `[app 자동 첨부: 현 분기 정보]` 인라인 첨부
- 6명+사장이 회의 테이블로 walk cycle 이동
- header `● 회의 중` 배지 + 회의실 zone amber border
- PM이 planner-1 + qa-1 동시 Task tool spawn
- 두 직원 결과 받은 후 PM 통합 보고: 회고 한 단락 + 달성도(PASS/부분/FAIL) + 다음 분기 추천 한 줄

**평가 기준**:
- ✅ 2+ 명 동시 spawn (planner-1 + qa-1 필수)
- ✅ 회의실 visual 활성 (캐릭터 이동 + 배지)
- ✅ PM 응답이 회고 단락 + 달성도 한 줄로 정리
- ✗ 1명만 spawn / 추상 / 분기 정보 무시

---

## S11 — 분기 archive 자동 영속화

**전제**: S10 회고 메시지 + PM 응답 받음.

**준비**:
1. "분기 관리 →" 다시 클릭.
2. 새 분기 시작 — title: `다음 분기 (테스트)` 정도, "새 분기 시작".

**기대 동작**:
- 모달이 닫혔다 다시 열면 "지난 분기 (1)" 섹션에 직전 분기 카드 등장
- 카드 내용: title / description / 시작~종료 시점 / 누적 일감 N건 / **retrospective 본문 line-clamp-2 미리보기**
- retrospective preview에 S10에서 PM이 작성한 회고 단락의 첫 줄 정도

**평가 기준**:
- ✅ archive 카드에 retrospective 텍스트 자동 채워짐
- ✅ 누적 일감 N건 그대로 보존
- ✗ retrospective 빈칸 / archive 카드 없음

---

## 합격 기준

| 시나리오 | 통과 조건 |
|---|---|
| S1~S5 | ✅ 직원 매핑 정확 + 결과 형식 통일 |
| S6 회의 | 3+ 명 동시 spawn + 회의 visual |
| S7 함정 | utility-1 회피 |
| S8 직접 답 | Task tool 호출 X |
| S9 분기 시작 | StatusBar/화이트보드/PM 응답 3개 갱신 |
| S10 회고 | planner-1+qa-1 동시 spawn + 통합 보고 |
| S11 archive | retrospective 자동 영속 |

**전체 PASS**: 11개 중 9개 이상 ✅. 8개 이하면 시스템 프롬프트 또는 분기 사이클 코드 재조정.

---

## 회귀 점검 (시스템 프롬프트 변경 시)

1. `core/employees/pm.json` 또는 `.claude/agents/*.md` 변경 후
2. 본 문서 시나리오 1~3개 무작위 선택해 재시연
3. 점수 변화 추적 — 회귀 발견 시 변경 revert 또는 plus PR

---

## 다음 라운드 후보 (benchmark 자체 진화)

- 결과 점수를 UsagePanel에 메트릭 컬럼으로 추적
- 시나리오 자동화 (사장 클릭 한 번에 4~5개 일감 일괄 spawn)
- 직원별 정확도 누적 통계
