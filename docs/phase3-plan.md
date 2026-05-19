# Phase 3 작업 분해 (확정 — 부분 진행)

> 사장 결정 반영 (2026-05-18): **Codex/Gemini/Figma MCP 패스**, 나머지(PR5/PR6)만 진행.
>
> Phase 3 = 다양화 중 외부 CLI 직원 + 디자인 직원은 보류. 누적 비용 + 영속 read만 흡수. 갱신 2026-05-19.

## ✅ 진행 완료

- **PR6** (`06152cf`): `workspace/sessions/` 영속 read + 앱 재시작 시 historical 카드 복원.
- **PR5 minimal** (`cab0aa5`): 직원 명부 row에 누적 spawn/tokens inline 표시.
- **PR5 full** (`eb44de1`): `UsagePanel` 풀버전 모달 — 직원별 spawn/in/out/cache R/C/duration 카드 + emerald 막대 그래프 + 합계 footer. 좌측 사이드바 "전체 사용량 보기 →" 진입점.

**한계**: Task tool sub-agent는 PM과 합산 청구라 직원별 cost($) 분리 불가능. UsagePanel은 토큰/시간 누적까지만. cost 분리는 외부 CLI 직원(Phase 3 재개) 이후에만 유효.

## ❌ 보류 (사장 결정)

- PR1 다중 CLI 백엔드 추상화 — Codex/Gemini 없으면 의미 없음.
- PR2 dev-codex (OpenAI Codex CLI)
- PR3 dev-gemini (Google Gemini CLI)
- PR4 Figma MCP + designer-1

**재개 트리거**: 사장이 외부 CLI 구독(Codex/Gemini) 의사 표시 + Figma Dev/Full seat 확보 시. 인프라(`app/src/main/spawn/runner.ts`, `workspace/spawn-request/`, chokidar v5)는 fallback으로 이미 보존됨 — PR1부터 즉시 진입 가능.

---

## PR 분해

### PR1 — `core/app: 다중 CLI 백엔드 추상화` (M, **공통 토대**) — ❌ 보류

**완료 기준**: `cliBackend: claude-code | codex | gemini` 분기를 spawn runner에서 처리. 직원 JSON 손편집만으로 백엔드 전환 가능.

**변경 파일**:
- `app/src/main/spawn/backends/claude.ts` (현 runner 로직 추출)
- `app/src/main/spawn/backends/codex.ts` (신규) — `codex exec --json` 호출, JSONL 파싱 분기
- `app/src/main/spawn/backends/gemini.ts` (신규) — `gemini --output-format stream-json` 호출
- `app/src/main/spawn/runner.ts` — employee.cliBackend로 dispatch
- `app/src/main/status.ts` — StatusTracker가 각 백엔드의 token/cost format 차이 흡수 (또는 백엔드별 tracker)

각 백엔드의 응답 schema가 달라 별도 ingest 필요:
- Claude: `stream_event.content_block_delta.text_delta` + `result.usage`
- Codex: `item.message` + `turn.completed.usage` (`codex exec --json` JSONL)
- Gemini: `--output-format stream-json` 출력 schema (검증 필요)

---

### PR2 — `core/employees: dev-codex 신규 (Codex CLI)` (S, PR1 의존) — ❌ 보류

`dev-codex.json`: cliBackend=codex, model 미상 (codex 사양 따름), shortDescription에 \"OpenAI Codex CLI 기반 — Claude 대안. 다른 관점의 코드 작성.\"

PM 카탈로그 자동 주입으로 자동 인지. 사장이 \"회의:\" prefix로 dev-1과 dev-codex 동시 spawn하면 **다른 LLM 두 관점 비교** 가능 — 본질 차별화 강한 시연.

---

### PR3 — `core/employees: dev-gemini 신규 (Gemini CLI)` (S, PR1 의존) — ❌ 보류

`dev-gemini.json`: cliBackend=gemini. Codex와 비슷한 패턴. 사장 우선순위 낮으면 보류 가능.

---

### PR4 — `app: Figma MCP 통합` (M, **디자인 직원**) — ❌ 보류

**완료 기준**: PM 또는 dev 직원이 Figma 파일을 읽고 코드 생성. 사장이 \"이 Figma URL의 카드 컴포넌트 React로 옮겨줘\" 한 줄.

**셋업**: `claude mcp add --transport http figma https://mcp.figma.com/mcp` 한 번 실행 (또는 `.mcp.json` 프로젝트 파일에 명시).

**변경 파일**:
- `.mcp.json` (프로젝트 루트) — figma MCP 서버 정의. git tracked.
- `app/src/main/employee/pm-runner.ts` + `spawn/runner.ts` — claude args에 `--mcp-config <path>` 추가 (이미 활성 MCP면 불필요, 확인 후).
- `core/employees/designer-1.json` (신규, 디자이너 직군): model opus-4-7, Figma 일감 전담.
- `docs/models.md` — Figma plan 제약 (월 6 tool call vs Dev/Full seat) 명시.

---

### PR5 — `app: 직원별 누적 사용량/비용` ✅ 완료 (`cab0aa5` + `eb44de1`)

**구현**:
- **minimal** (`cab0aa5`): `EmployeeRoster`가 `rows`에서 `useMemo`로 직원별 spawn 횟수 + (input+output) 토큰 합산 → `EmployeeProfileRow` inline 표시.
- **full** (`eb44de1`): `UsagePanel` 모달 (4xl 너비 80vh). 직원별 카드 — spawn / in / out / cache R/C / duration + emerald 막대 그래프 (input+output 비율 정규화). 합계 footer + Esc/배경 dismiss. 좌측 사이드바 하단 "전체 사용량 보기 →" 버튼이 진입점.

**영속화 방식**: 별도 `workspace/usage.jsonl` 도입 X. PR6의 `workspace/sessions/<taskId>/done` JSON에 metrics 들어가 있어 historical 복원 시 자동 합산됨 — append-only log 없이도 재시작 후 누적 살아남음. SQLite는 보류 (1인 + 빈도 보면 불필요).

**한계**: Task tool sub-agent는 PM과 합산 청구 → 직원별 cost($) 분리 불가능. UsagePanel은 cost 컬럼 없이 토큰/시간만 표시. cost 분리는 외부 CLI 직원(PR1~4 재개) 이후에만 유효.

---

### PR6 — `app: workspace/sessions 영속 read (PR2.5 흡수)` ✅ 완료 (`06152cf`)

**구현**:
- `app/src/main/sessions/historical.ts`: `loadHistoricalSessions()` scan + parse → `RosterUpdatePayload[]` (started+chunk+done 시퀀스).
- 영속 write: PM에서 Task tool sub-agent done 이벤트 시 `persistSubSession()` → `workspace/sessions/<taskId>/{output.log, done}` 저장.
- IPC `rosterHistorical` 채널 + preload `fetchHistoricalRoster()`.
- `App.tsx` 시작 시 fetch → `applyRosterUpdate` reducer로 roster initial state.
- 실시간 onRosterUpdate와 historical 복원이 동일 reducer 재사용.

Phase 2 보류했던 PR2.5를 Phase 3 PR6으로 흡수해 처리.

---

## 의도적으로 Phase 3에서 빼는 것

- ~~채널별 채팅~~ (Phase 2 PR5 보류 그대로) — 사장↔PM 직통이 본질, escape hatch 불필요.
- ~~픽셀 사무실~~ — Phase 4. 현 시점 모든 본질 작업 끝나면 가도 됨.
- ~~SQLite 도입~~ — `workspace/sessions/<id>/done` JSON으로 우회 충분. usage.jsonl도 불필요. 필요성 입증되면 그때.
- ~~워크플로우 YAML (conductor 패턴)~~ — PM 자율 분배가 동적 워크플로우 역할. 정적 YAML은 본질에 안 맞음.

---

## Phase 3 종료 상태

**진행한 셋트**: PR5(minimal+full) + PR6. 외부 CLI/Figma 셋트(PR1~4)는 보류.

**Phase 3 부분 진행 도장**: 2026-05-18 사장 결정. UsagePanel 풀버전까지 commit (`eb44de1`).

다음 라운드 후보:
- Phase 4 픽셀 사무실 (재미 페이즈) — 본질 작업 정리되면 그때.
- 외부 CLI 재개 — 사장 Codex/Gemini/Figma 구독 시점에 PR1부터.
- 사장 personal 시간 검증 사항: 회의 prefix / 어려운 일감 dev-arch 위임 / 문서 일감 planner-1 / 직원 토글 / 영속 read 재시작.

---

## 출처 (Phase 3 백엔드 리서치 — 보류된 PR1~4 재개 시 참조)

- [OpenAI Codex CLI — Reference](https://developers.openai.com/codex/cli/reference) (codex exec --json JSONL, spawn_agent 도구)
- [OpenAI Codex CLI — Non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [Gemini CLI — geminicli.com](https://geminicli.com/docs/get-started/) (`--output-format stream-json`, `--resume`)
- [Gemini CLI — GitHub](https://github.com/google-gemini/gemini-cli)
- [Figma MCP Server — Claude Code 셋업](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server)
- [Figma MCP Server — Remote 설치](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
