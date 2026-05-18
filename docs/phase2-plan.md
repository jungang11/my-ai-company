# Phase 2 작업 분해 (확정)

> 사장 결정 반영(2026-05-18). Phase 1 시연 검증 통과 이후 진입.
>
> 확정 항목:
> - PR4(회의 모드 UI) 보류 → PM 시스템 프롬프트 `회의:` prefix로 흡수(`deab92f` PR8.5).
> - PR5(채널별 채팅) 보류 — Phase 3+에서 재검토.
> - PR3(직원별 비용 추적) Phase 3 → **Phase 2로 당김**.
> - Phase 2 진입 시점: Phase 1 시연 검증 직후 (토큰 최적화 2차는 PR9에서 1차 끝났음, 추가는 시연 후 효과 보고 결정).

---

## Phase 2 위치 (README 로드맵 → 본질 정신 반영)

README 원안 Phase 2:
- ~~직원 2명 인수인계~~ — **Phase 1에서 5+직군 + PM 자율 분배로 이미 완료** (PR7, PR8).
- 채널별 채팅 뷰 (#general, #dev) — *재해석 필요*
- 회의 모드 — *PM 자율 분배에 이미 부분 포함*
- 직원 카드 활성/비활성 토글

Phase 1에서 진화된 본질:
- **사장 ↔ PM 직통이 메인 인터페이스**. 채널/회의 모드는 그 위의 보조.
- PM이 자율 분배 (Advisor Strategy). 사장이 마이크로매니지 안 함.
- sub session 출력은 사이드바 카드 미리보기 + 카드 클릭 expand (확장 검토).

---

## 사전 안건 (Phase 2 진입 전 결정)

| 안건 | 결정 |
|---|---|
| Phase 1 시연 검증 (PROGRESS.md 5케이스) | 통과 필수 |
| 토큰 최적화 2차 (cache 친화 prefix 강화 등) | 선택. 시연 후 cache hit% 보고 결정 |
| README Phase 2 항목 중 일부 보류 가능성 | 본 draft에서 항목별 ★/??/✅로 표시 |

---

## PR 분해 (가설, 사장 조정 권장)

### ✅ PR1 — `직원 활성/비활성 토글 UI` (M, 2 commit: `f909475` C1 + `4ffd182` C2)

**완료 기준**: 직원 카드에 toggle button. 클릭 시 `core/employees/<id>.json`의 `active` 필드를 true↔false로 갱신. PM 카탈로그 자동 주입(PR8b)이 active=true만 포함하도록 filter. 비활성 직원은 spawn 시도해도 runner가 거절.

**변경 파일**:
- `app/src/main/employee/employee-store.ts` (신규) — JSON 읽기/쓰기 + active 토글 API
- `app/src/shared/ipc.ts` — `employee:toggle` 채널 추가
- `app/src/main/employee/pm-runner.ts` — loadCatalog에 `active === true` filter
- `app/src/main/spawn/runner.ts` — loadEmployee 후 active 체크
- `app/src/renderer/src/components/EmployeeCard.tsx` — toggle 버튼 + active 상태 시각화
- `app/src/renderer/src/components/EmployeeRoster.tsx` — 전체 직원 명단 (작업중/종료 외에 비활성 섹션 추가)

핵심 본질: **사장이 비용 제어**. utility-1 active=true면 단순 작업 자동 라우팅, false면 PM이 본인 처리.

---

### ✅ PR2 — `sub session 상세 모달 (카드 클릭)` (M, `84c63cc`)

모달 형식으로 결정 (드로어/expand 대안 → floating 중앙 + ESC/배경 dismiss). source of truth는 메모리 EmployeeRow.output (현 세션 한정 — 영속 history는 PR2.5 후보).

**완료 기준**: 좌측 직원 카드를 클릭하면 우측 채팅 패널 위에 슬라이드되거나 새 탭으로 sub session의 **전체 output.log + 메타데이터**(prompt/시간/모델/cost) 표시. 사장이 PM 보고 외에 sub의 raw 로그 확인 가능.

**변경 파일**:
- `app/src/renderer/src/components/SubSessionDetail.tsx` (신규)
- `app/src/main/spawn/runner.ts` — chunk 누적된 output을 IPC로 노출 (또는 renderer가 직접 파일 read — 파일 기반이 단순)
- `app/src/preload/index.ts` — `readSessionOutput(sessionId)` 추가
- `app/src/renderer/src/state/employee-store.ts` — 선택된 sessionId 상태
- `app/src/renderer/src/components/EmployeeCard.tsx` — onClick 핸들러

---

### ✅ PR3 — `직원별 model/token/cost 추적` (M, `e280e63`)

sub 직원별 StatusTracker. RosterUpdate.started에 model 포함, done에 metrics(input/output/cache/cost) 포함. 카드 모달에 한 줄로 표시. PM 누적은 기존 statusbar 유지. 별도 UsagePanel은 보류 (카드 모달에서 충분).

**완료 기준**: statusbar는 PM 누적 외에 sub 직원별 누적도 별도 표시. 또는 별도 패널에 직원별 cost/token 차트 (간단한 막대).

**변경 파일**:
- `app/src/main/status.ts` — StatusTracker를 PM/sub 별로 인스턴스화. 합산 + 분리 노출.
- `app/src/main/spawn/runner.ts` — 각 sub의 StatusTracker.ingest 호출
- `app/src/shared/ipc.ts` — `StatusByEmployee` 타입
- `app/src/renderer/src/components/UsagePanel.tsx` (신규) — 직원별 cost 막대

가치: 사장이 어느 직원이 비용 잡아먹는지 즉시 파악. Haiku/Sonnet/Opus 매핑 effectiveness 검증.

---

### ~~PR4 — 회의 모드 UI~~ → 보류 (PR8.5로 흡수, `deab92f`)

PM 시스템 프롬프트에 `회의:` prefix 처리 추가 완료. 사장이 `회의: <안건>` 식으로 한 줄 보내면 PM이 다수 직원에게 동시 spawn → 관점별 의견 → 통합 보고. 별도 UI 불필요.

### ~~PR5 — 채널별 채팅 뷰~~ → 보류

본질(사장↔PM 직통) escape hatch라 Phase 3+에서 재검토. 사장이 디버깅용으로 직원과 직접 대화하고 싶을 때 PM 우회 모드 단발 토글로 대체할 수도 있으나, 그때 가서 결정.

---

## Phase 2 종료 도장 — ✅ 달성 + 시연 통과

PR1 + PR2 + PR3 모두 commit. 더 나아가 시연 검증 통과 (2026-05-18, 회사 시간):

- 사장 → "README.md의 단어 수와 줄 수를 동시에 알려줘" (직원 이름 거론 X)
- PM이 자율로 utility-1 선택 → Task tool로 sub-agent spawn
- 좌측 사이드바 막내 카드 등장 → 5초 작업 → "최근 종료" 전환
- PM이 통합 보고 ("줄 수: 28, 단어 수: 103")
- 카드 클릭 → 모달에 markdown 렌더링된 전체 output + 메타데이터

본질 차별화 시연 완료. 30초 데모 가능 상태.

## 추가 fix 라운드 (Phase 2 안에 흡수)

시연 과정에서 발견한 본질 문제 해결:

- **Task tool 패턴 도입** (`3c97140`): file-watcher + Write 패턴이 PM에게 unnatural → claude의 정통 Task tool + `.claude/agents/*.md` 정의로 전환. PM 시스템 프롬프트 강화로도 안 풀리던 \"도구 없어 못 함\" 패턴 정면 해결. file-watcher는 외부 CLI 직원(Codex/Gemini, Phase 3) fallback으로 보존.
- **react-markdown 도입** (`3c97140`): MessageBubble + SubSessionDetail에서 markdown 정상 렌더링.
- **statusbar ctx 정정** (`3a73d7f`): cache_read 포함 계산.
- **사이드바 카드 시각화** (`3a73d7f`): Task tool의 `task_started`/`tool_use_result` dedicated 이벤트 캡처해 RosterUpdate emit.

## 남은 후보

- **PR2.5**: workspace/sessions/<id>/output.log 영속 read — 앱 재시작 후에도 과거 sub 결과 모달에서 볼 수 있게. Task tool은 자체 session 기록 없으니 우리가 별도 file write 필요.
- **UsagePanel**: 직원별 누적 cost 그래프 (현재는 카드 단건 metrics만). Phase 3 진입 후 가치 보고 결정.
