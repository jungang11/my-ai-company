# References 비교표

Phase 0 리서치 산출물. 4개 외부 repo를 정독한 결과 요약.

| 항목 | emdash | clideck | cmux-team | conductor |
|---|---|---|---|---|
| **한 줄 요약** | 27개 CLI 에이전트를 git worktree로 격리하며 병렬 실행하는 Electron 데스크톱 앱 | 멀티 CLI 세션을 LLM 라우터(autopilot)로 자동 연결하는 로컬 웹앱 | Master→Manager→Conductor→Agent 4층 계층으로 Claude Code 서브에이전트를 오케스트레이션하는 CLI/TUI 도구 | YAML로 정의한 멀티에이전트 워크플로우를 실행하는 Microsoft의 Python CLI 엔진 |
| **언어/스택** | TypeScript + Electron 40, React 19, Tailwind, Radix, MobX, SQLite(Drizzle) | Node.js (CJS) + ws + Vanilla JS + xterm.js + Tailwind | TypeScript + Bun + Ink/React(TUI) + tmux | Python 3.12 + Typer + Pydantic v2 + FastAPI + Jinja2 + asyncio |
| **GUI 방식** | Electron (xterm.js 터미널 탭, MobX 상태) | 웹 브라우저 (localhost:4000, WebSocket) | TUI(Ink+React) + 옵션 웹 대시보드(uPlot) | Web 대시보드(Cytoscape.js DAG) + Rich 터미널 UI(인간 게이트) |
| **pty 처리** | `node-pty` + `ssh2`(원격) + tmux(긴 작업 wrapping). PTY ring buffer + subscribe 모델 | `node-pty` 직접 spawn, 키 입력/출력 무가공 | tmux 멀티플렉서를 `execFile("cmux", …)`로 감쌈 (pty 직접 안 씀) | pty 없음. LLM API 호출 + script.py로 shell 명령 실행 |
| **상태 감지** | `onData`/`onExit` 핸들러 + ring buffer 구독 | **OTLP** (OpenTelemetry POST → `/v1/logs`) 로 에이전트가 working/idle 신호 발신 | **done 마커 파일** (`.team/output/<conductor>/done`) + `fs.watch` (pull-based) + PID watcher | 에이전트 실행 완료 = LLM 응답 종료. 외부 신호 없음 |
| **세션 간 라우팅** | 메모리/IPC. TaskManager가 worktree-per-agent 메타데이터 관리, 사용자가 명시적으로 라우팅 | **LLM 라우터**: 모든 에이전트 idle 시 LLM에게 `route(from,to)`/`notify_user()` 도구만 주고 호출 → 출력 verbatim PTY 주입, 엔터 자동 송신. SHA256 fingerprint로 중복 방지 | 파일 기반 (`.team/tasks/TNNN-slug/`, `.team/output/`). Manager가 done 마커 보고 다음 단계 dispatch. Master↔Manager는 HTTP proxy | YAML `routes[].when` (Jinja2 + simpleeval). 에이전트 A 출력이 템플릿 변수로 B 프롬프트에 자동 주입 |
| **라이센스** | Apache-2.0 | MIT (Or Kuntzman) | MIT (hummer98 / Yuji Yamamoto) | MIT (Microsoft) |
| **활동성** | 매우 활발 (2026-05-14 머지, 다수 컨트리뷰터, PR 2030번대) | 매우 활발 (2026-05-14 커밋, 1인 개발, v1.31.3) | 매우 활발 (2026-05-09, 1인 개발, v4.28.2, 주간 릴리스) | 활발 (2026-05-14, v0.1.16) |
| **가져올 패턴** | (a) **node-pty + ring buffer + subscribe** 모델 — 늦게 붙는 UI도 이력 받음. (b) **git worktree 격리** — 직원별 작업공간 충돌 방지(Phase 2+). (c) IPC typed RPC 구조 | (a) **출력 SHA256 fingerprint** — 중복 라우팅 방지. (b) **LLM 라우터 콘셉트** — `route`/`notify_user` 같은 좁은 tool set으로 LLM에 위임 (Phase 2+). (c) OTLP 상태 감지는 직원 내부 안 건드림 | (a) **계층 분리** Master(사용자)/Manager(이벤트루프)/Conductor(팀장)/Agent(실작업) — 우리 메타포와 직접 매핑. (b) **done 마커 + fs.watch** — pull-based 인수인계 신호. (c) **파일 기반 task state** (`.team/tasks/…`) | (a) **YAML 선언형 워크플로우** + Jinja2 prompt template (Phase 2+의 "회사 절차" 표현). (b) `for_each` / `parallel_groups` 동시성 어휘. (c) 인간 게이트(gates.human) — 사장 승인 지점 표현 |
| **안 가져올 부분** | Electron의 SSH2 원격/27 프로바이더 SDK 통합 (Linear/Jira/GitLab 등). 우리 컨셉에 불필요. Electron 자체는 사용 (Tauri 학습비용 회피) | 웹 브라우저 UI (데스크톱 앱 컨셉과 불일치). 2-tool 라우터의 단순함도 Phase 1엔 불필요 | tmux 의존 (**Windows에서 안 됨** — 사장 환경 Windows 11). 멀티계정 토큰풀 분산은 Phase 2+ | Python 백엔드 (Node 통일성), 체크포인트/Resume, Cytoscape DAG 웹 — Phase 1 오버엔지니어링. 외부 CLI 호출 약함 (우리 핵심) |

## 한 줄 핵심

- **emdash**: 데스크톱 + PTY 인프라의 정답지. **GUI 베이스로 차용**.
- **clideck**: LLM 라우터는 Phase 2 보석. Phase 1엔 사장이 게시판으로 분배.
- **cmux-team**: 계층 메타포가 우리 컨셉과 일치. **상태 감지 + 파일 IPC 패턴 차용**. tmux는 버림.
- **conductor**: 워크플로우 YAML은 Phase 2 회사 절차 표현용. 지금은 무거움.
