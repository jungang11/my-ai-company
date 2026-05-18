# Phase 3 작업 분해 (Draft)

> 사장 검토 후 확정. Phase 2 시연 검증 통과 이후 진입.
>
> Phase 3 = **다양화** (README 로드맵). 코딩 백엔드(Codex/Gemini) + 디자인 직원(Figma MCP) + 누적 비용 가시화.

---

## 사전 안건 (사장 결정 필요)

1. **Codex CLI 구독** — 사장 ChatGPT Plus/Pro 또는 Codex 액세스 있는지 확인 필요.
2. **Gemini CLI 구독** — Google AI Studio/Vertex 액세스.
3. **Figma 플랜** — Starter/View/Collab seat은 월 6 tool call 제한. Dev/Full seat이면 분당 rate limit 정도라 실용적. 사장 현재 플랜?
4. **우선순위** — 세 백엔드 다 들어갈 필요 없을 수도. 한두 개로 시작 후 가치 보고 확장. **권장**: Codex(또는 Figma) 먼저, Gemini는 vibe check.

---

## PR 분해 (가설, 사장 우선순위 조정 권장)

### PR1 — `core/app: 다중 CLI 백엔드 추상화` (M, **공통 토대**)

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

### PR2 — `core/employees: dev-codex 신규 (Codex CLI)` (S, PR1 의존)

`dev-codex.json`: cliBackend=codex, model 미상 (codex 사양 따름), shortDescription에 \"OpenAI Codex CLI 기반 — Claude 대안. 다른 관점의 코드 작성.\"

PM 카탈로그 자동 주입으로 자동 인지. 사장이 \"회의:\" prefix로 dev-1과 dev-codex 동시 spawn하면 **다른 LLM 두 관점 비교** 가능 — 본질 차별화 강한 시연.

---

### PR3 — `core/employees: dev-gemini 신규 (Gemini CLI)` (S, PR1 의존)

`dev-gemini.json`: cliBackend=gemini. Codex와 비슷한 패턴. 사장 우선순위 낮으면 보류 가능.

---

### PR4 — `app: Figma MCP 통합` (M, **디자인 직원**)

**완료 기준**: PM 또는 dev 직원이 Figma 파일을 읽고 코드 생성. 사장이 \"이 Figma URL의 카드 컴포넌트 React로 옮겨줘\" 한 줄.

**셋업**: `claude mcp add --transport http figma https://mcp.figma.com/mcp` 한 번 실행 (또는 `.mcp.json` 프로젝트 파일에 명시).

**변경 파일**:
- `.mcp.json` (프로젝트 루트) — figma MCP 서버 정의. git tracked.
- `app/src/main/employee/pm-runner.ts` + `spawn/runner.ts` — claude args에 `--mcp-config <path>` 추가 (이미 활성 MCP면 불필요, 확인 후).
- `core/employees/designer-1.json` (신규, 디자이너 직군): model opus-4-7, Figma 일감 전담.
- `docs/models.md` — Figma plan 제약 (월 6 tool call vs Dev/Full seat) 명시.

---

### PR5 — `app: 직원별 누적 사용량/비용 그래프` (M)

Phase 2 PR3에서 단건 metrics만 표시. PR5에서 **누적**:
- 직원 명부 row에 누적 cost 표시 (예: `dev-1 · $1.23 누적`)
- 별도 **UsagePanel** 컴포넌트 — 막대 그래프 (Recharts 또는 단순 div bar). 일자별 또는 직원별.
- main에 직원별 누적 store (메모리 또는 SQLite — Phase 1에서 \"SQLite는 Phase 3 사용량 추적 들어올 때\"라 했던 시점 도래).

**SQLite 도입 여부**: 메모리 누적은 앱 재시작 시 초기화. 영속화 위해선 SQLite 또는 `workspace/usage.jsonl` append-only log. 후자가 \"파일로 통신\" 원칙에 부합.

권장: `workspace/usage.jsonl` (append-only). SQLite는 보류 — 1인 사용 + 일감 빈도 보면 jsonl로 충분.

---

### PR6 — `app: workspace/sessions 영속 read (PR2.5 흡수)` (S)

앱 시작 시 `workspace/sessions/` scan → done 마커 있는 디렉토리 → EmployeeRow 배열 초기화. 사장이 앱 재시작 후에도 과거 sub 결과 모달에서 확인 가능.

**변경 파일**:
- `app/src/main/sessions/historical.ts` (신규) — scan + parse
- IPC `fetchHistoricalSessions`
- preload + App.tsx 시작 시 fetch → roster initial state

Phase 2 보류했던 PR2.5를 Phase 3 PR6으로 흡수.

---

## 의도적으로 Phase 3에서 빼는 것

- ~~채널별 채팅~~ (Phase 2 PR5 보류 그대로) — 사장↔PM 직통이 본질, escape hatch 불필요.
- ~~픽셀 사무실~~ — Phase 4. 현 시점 모든 본질 작업 끝나면 가도 됨.
- ~~SQLite 도입~~ — usage.jsonl로 우회. 필요성 입증되면 그때.
- ~~워크플로우 YAML (conductor 패턴)~~ — PM 자율 분배가 동적 워크플로우 역할. 정적 YAML은 본질에 안 맞음.

---

## Phase 3 종료 도장

**최소 셋트**: PR1 + (PR2 or PR4) + PR6.
**Full 셋트**: PR1 + PR2 + PR3 + PR4 + PR5 + PR6.

사장 우선순위 따라 PR2/PR3/PR4 중 1~3개 선택.

---

## 사장 결정 안건 (Draft 검토용)

1. **Phase 3 진입 시점** — Phase 2 시연 검증 통과 직후?
2. **백엔드 우선순위**: Codex 먼저 vs Figma 먼저 vs 둘 다 vs Gemini도?
3. **누적 비용 추적 (PR5)** Phase 3 안에 vs 별도 라운드?
4. **PR6 영속 read** Phase 3 PR6 vs 시연 검증 시 즉시 (먼저 진입)?

---

## 출처 (Phase 3 백엔드 리서치)

- [OpenAI Codex CLI — Reference](https://developers.openai.com/codex/cli/reference) (codex exec --json JSONL, spawn_agent 도구)
- [OpenAI Codex CLI — Non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [Gemini CLI — geminicli.com](https://geminicli.com/docs/get-started/) (`--output-format stream-json`, `--resume`)
- [Gemini CLI — GitHub](https://github.com/google-gemini/gemini-cli)
- [Figma MCP Server — Claude Code 셋업](https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server)
- [Figma MCP Server — Remote 설치](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
