# Phase 2 작업 분해 (Draft)

> 사장 검토 후 확정. Phase 1 시연 검증 통과 이후 진입.

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

### PR1 — `직원 활성/비활성 토글 UI` ✅ (S, 본질 부합)

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

### PR2 — `sub session 상세 패널 (카드 클릭 → 우측 expand)` ✅ (M, UX 진화)

**완료 기준**: 좌측 직원 카드를 클릭하면 우측 채팅 패널 위에 슬라이드되거나 새 탭으로 sub session의 **전체 output.log + 메타데이터**(prompt/시간/모델/cost) 표시. 사장이 PM 보고 외에 sub의 raw 로그 확인 가능.

**변경 파일**:
- `app/src/renderer/src/components/SubSessionDetail.tsx` (신규)
- `app/src/main/spawn/runner.ts` — chunk 누적된 output을 IPC로 노출 (또는 renderer가 직접 파일 read — 파일 기반이 단순)
- `app/src/preload/index.ts` — `readSessionOutput(sessionId)` 추가
- `app/src/renderer/src/state/employee-store.ts` — 선택된 sessionId 상태
- `app/src/renderer/src/components/EmployeeCard.tsx` — onClick 핸들러

---

### PR3 — `직원별 사용량/비용 추적` ★ (M, Phase 3에서 당김, 본질 유용)

**완료 기준**: statusbar는 PM 누적 외에 sub 직원별 누적도 별도 표시. 또는 별도 패널에 직원별 cost/token 차트 (간단한 막대).

**변경 파일**:
- `app/src/main/status.ts` — StatusTracker를 PM/sub 별로 인스턴스화. 합산 + 분리 노출.
- `app/src/main/spawn/runner.ts` — 각 sub의 StatusTracker.ingest 호출
- `app/src/shared/ipc.ts` — `StatusByEmployee` 타입
- `app/src/renderer/src/components/UsagePanel.tsx` (신규) — 직원별 cost 막대

가치: 사장이 어느 직원이 비용 잡아먹는지 즉시 파악. Haiku/Sonnet/Opus 매핑 effectiveness 검증.

---

### PR4 — `회의 모드 UI` ?? (M, 본질에 가치 적음 — 사장 결정)

**완료 기준**: 채팅 입력창 옆에 "회의" 토글. 활성화 시 사장 메시지는 PM에게 가는데 PM 시스템 프롬프트 분기로 "동일 안건을 dev-1/planner-1/qa-1 등에 동시 spawn 후 각자 의견 통합" 강제. UI에서 각 직원 답을 한 화면에 나란히 또는 통합 응답.

**의문**: PM 자율 분배 모드(PR8b)면 사장이 "이 안건 여러 의견 모아줘" 한 줄로 동일 효과. 별도 UI 토글이 필요한가?

**대안**: 회의 모드 토글 대신 사장이 평소 채팅으로 "회의: <안건>" 같은 prefix 쓰면 PM이 알아서 회의 모드 수행. 시스템 프롬프트 한 줄 추가로 끝. → **PR4 자체 보류, PR8.5로 흡수**.

---

### PR5 — `채널별 채팅 뷰 (사장 ↔ 특정 직원 직통)` ?? (M, 본질 escape hatch — 사장 결정)

**완료 기준**: 좌측 사이드바에 채널 목록 (#PM 본방, #dev-1과 직통, #planner-1과 직통, ...). 사장이 채널 전환 시 메시지가 PM 거치지 않고 해당 직원에 직접.

**의문**: 본질은 사장↔PM 직통. 사장이 직원과 직접 채팅 = PM 우회 = 본질 해체.

**유용한 경우**: 디버깅용. PM이 어떻게 일감 위임하는지 사장이 직접 dev-1에게 같은 일감 던져서 비교. 또는 사장이 직접 직원 시스템 프롬프트 튜닝하면서 단발 대화.

**대안**: 채널 대신 "PM 우회 모드" 토글 — 다음 메시지를 PM이 아닌 사장이 지정한 직원에 직접. 단발성으로 사용. → 가벼운 escape hatch.

→ **PR5는 Phase 2 보류**. Phase 3 이후 필요성 재검토.

---

## Phase 2 종료 도장 (가설)

PR1+PR2+PR3 = 3개 들어가면 Phase 2 완성으로 보고 Phase 3 (Codex/Gemini CLI 직원 추가 + Figma MCP) 진입.

PR4/PR5는 Phase 2 정의에서 제외 또는 Phase 3 옵션.

---

## 사장 결정 안건 (Draft 검토용)

1. **PR4(회의 모드 UI) 보류 + PM 시스템 프롬프트로 회의 흐름 흡수** 동의?
2. **PR5(채널별 채팅) 보류** 동의? (Phase 3 이후 재검토)
3. **PR3(직원별 비용 추적)을 Phase 3 → Phase 2로 당기는 것** 동의?
4. Phase 2 진입 시점 — Phase 1 시연 검증 통과 직후 vs 토큰 최적화 2차 라운드 먼저?
