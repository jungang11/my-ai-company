# Phase 1 작업 분해

## 핵심 시나리오 (Phase 1 종료 조건)

**사장이 그리는 흐름:**

1. 앱 켜면 **PM 세션이 자동 spawn**. Claude Opus 4.7 기반. 사장과 직통 채팅창.
2. 사장이 채팅창에 "X 해줘" → **PM이 알아서 계획 세움** (몇 세션 쓸지, 무슨 일감 나눌지).
3. PM이 필요한 만큼 **sub 세션을 spawn**해 일감 분배.
4. PM이 sub 세션들의 **출력을 모니터링**.
5. PM이 결과를 **사장에게 채팅창으로 직통 보고**.

이게 30초 데모로 시연되면 Phase 1 done.
보드/픽셀 사무실은 부차. **세션 간 출력 공유 + PM의 오케스트레이션이 본질.**

---

## PR 분해 (7개, ✅ = 완료)

### ✅ PR1 — `app: 빈 Electron 앱 + "Hello, boss"` (S)
완료. 커밋 `8ca1c7c`.

### ✅ PR2 — `core: 직원 정의 + 보드 파서` (S)
완료. 커밋 `e8974f5`. `Employee` 타입 + `dev-1.json` + `parseBoard()` + vitest 4/4.

---

### ✅ PR3 — `app: 사장-PM 채팅 패널 (정적 UI)` (M)
완료. 커밋 `de154a1`. Tailwind v4 + Chat/MessageBubble/MessageInput.

### ✅ PR4 — `core: PTY 매니저 + ring buffer + subscribe` (M)
완료. 커밋 `c3c9893`. `@homebridge/node-pty-prebuilt-multiarch` (정식 node-pty는 Windows native build 실패). vitest 14/14.

### ✅ PR5a — `app: PM echo stub + PTY/IPC 인프라` (M)
완료. 커밋 `e12c46f`. externalizeDepsPlugin, @core alias, contextBridge.

### ✅ PR5b — `app: PM = Claude Code CLI 실제 연결` (M)
완료. 커밋 `34cbd04`. child_process + `claude --print --verbose --input-format stream-json --output-format stream-json --include-partial-messages --session-id/--resume --permission-mode bypassPermissions`. streaming chunk 한 버블에 누적.

### ✅ PR6 — `core/app: PM이 sub 세션 spawn 요청 프로토콜 + 직원 카드 UI` (M)
완료. 커밋 `9bac44e`. chokidar v5 watcher + spawn/runner + EmployeeRoster/Card. 검증: PM이 `workspace/spawn-request/<uuid>.json` 작성 → dev-1 5~6s에 pwd 완료.

### ✅ PR6.5 — `app: 하단 statusbar` (S)
완료. 커밋 `54d451f`. project · branch · model · ctx · token · cost · 5h reset. stream-json result/rate_limit_event 파싱.

---

### PR3 — `app: 사장-PM 채팅 패널 (정적 UI)` (M) — *완료, 위 ✅ 참조*

**완료 기준**: 앱을 켜면 화면 중앙에 채팅 패널이 있고, 하단 입력창에 메시지 치면 로컬 state에 사장 메시지가 추가되어 표시된다. PM 응답은 아직 mock.

**변경 파일**:
- `app/src/renderer/src/components/Chat.tsx`
- `app/src/renderer/src/components/MessageBubble.tsx`
- `app/src/renderer/src/components/MessageInput.tsx`
- `app/src/renderer/src/state/chat-store.ts` — `{role: 'boss'|'pm', text, ts}[]`
- `app/src/renderer/src/App.tsx` — Hello, boss를 Chat으로 교체
- `app/package.json` — Tailwind 추가 (`tailwindcss@^4`, `@tailwindcss/vite`)
- `app/postcss.config.mjs` or vite plugin 설정
- `app/src/renderer/src/index.css`

**ref**: `references/emdash/src/renderer/` — Tailwind + Radix 패턴.

---

### PR4 — `core: PTY 매니저 + ring buffer + subscribe` (M)

**완료 기준**: `core/pty/manager.ts`가 `spawn(id, cmd, args)` / `write(id, data)` / `kill(id)` / `subscribe(id, cb)` 4개 API 제공. ring buffer 64KB. vitest로 echo 프로세스 spawn → 출력 캡처 통과.

**변경 파일**:
- `core/pty/manager.ts`
- `core/pty/ring-buffer.ts`
- `core/pty/types.ts`
- `core/pty/manager.test.ts`
- `core/package.json` — `node-pty` 의존성

**ref**: `references/emdash/src/main/core/pty/controller.ts` — 구독 모델.

---

### PR5 — `app: PM 세션 자동 spawn + 사장-PM 직통 채팅` (M)

**완료 기준**: 앱 켜면 PM 세션(Claude Code CLI)이 자동 spawn. 채팅 입력창에 메시지 치면 PM stdin에 주입되고, PM 출력이 채팅 패널에 흐른다. 한 세션 데모 — sub 세션은 아직 없음.

**변경 파일**:
- `app/src/main/employee/spawn-pm.ts` — 앱 시작 시 PM 자동 spawn
- `app/src/preload/index.ts` — `window.api.sendToPM(text)` / `onPMOutput(cb)`
- `app/src/renderer/src/components/Chat.tsx` — IPC 연결
- `core/employees/pm.json` — PM 정의 (Claude Opus 4.7 시스템 프롬프트: "너는 회사의 PM. 사장 지시를 받아 일감을 쪼개고 직원 세션을 spawn해 일을 시킨다…")

이 시점에서 PM은 아직 sub 세션을 못 부른다. 본인이 직접 답하는 것만 가능.

---

### PR6 — `core/app: PM이 sub 세션 spawn 요청하는 파일 프로토콜 + 직원 카드 UI` (M)

**완료 기준**: PM이 `workspace/spawn-request/<id>.json` 파일을 쓰면 (`{employeeId, prompt}`) app이 chokidar로 감지해 sub 세션을 spawn. spawn된 sub 세션은 GUI 좌측에 "직원 카드"로 표시 (id, 상태). PM은 채팅창에서 "dev 세션을 spawn해서 README 분석시켰습니다"라고 보고 가능.

**변경 파일**:
- `core/spawn/protocol.ts` — `SpawnRequest` 타입 + spawn-request 디렉토리 watch
- `app/src/main/employee/sub-spawn-watcher.ts` — chokidar로 spawn-request 디렉토리 감시 → `core/pty/manager.spawn()` 호출
- `app/src/renderer/src/components/EmployeeRoster.tsx` — 활성 직원 카드 목록
- `app/src/renderer/src/components/EmployeeCard.tsx`
- `app/src/renderer/src/state/employee-store.ts`
- `app/package.json` — `chokidar`

PM에게 줄 시스템 프롬프트 업데이트: "sub 세션이 필요하면 `workspace/spawn-request/<uuid>.json`을 작성해라. 우리 앱이 자동으로 띄운다."

---

### PR6.5 — `app: 상단/하단 statusbar (model · ctx · token · 5h · 7d · branch · project)` (S)

**완료 기준**: 사장이 한눈에 현재 세션 상태를 본다.

표시 항목:
- **project**: 현재 프로젝트 이름 (package.json name 또는 cwd basename)
- **branch**: git 현재 브랜치
- **model**: 마지막 PM 응답의 model (예: `claude-opus-4-7`)
- **ctx**: 누적 input_tokens / contextWindow → 퍼센트 (예: `30k / 1M (3%)`)
- **token**: 누적 input/output/cache
- **cost**: 누적 total_cost_usd
- **5h reset**: rate_limit_event.rate_limit_info.resetsAt (5시간 limit reset 시각, status 'allowed' or 'limited')
- **7d reset**: 7일 limit이 있을 경우 (없으면 표시 생략)

데이터 소스: PM/sub 응답의 stream-json 마지막 result 이벤트 + rate_limit_event. main에서 추출해서 IPC로 송신.

**변경 파일**:
- `app/src/shared/ipc.ts` — `StatusSnapshot` 타입 + 채널
- `app/src/main/employee/pm-runner.ts` — stream-json 파싱에서 status 추출 후 callback
- `app/src/main/spawn/runner.ts` — 동일
- `app/src/main/status.ts` — git branch / project 가져오기 + 마지막 status cache
- `app/src/main/index.ts` — wireStatus, IPC 송신
- `app/src/preload/index.ts` — `onStatus`
- `app/src/renderer/src/components/StatusBar.tsx` — 하단 footer 한 줄
- `app/src/renderer/src/state/status-store.ts`
- `app/src/renderer/src/App.tsx` — StatusBar 통합

---

### PR7 — `core/app: PM이 sub 세션 출력을 파일로 read + 본질 데모` (M)

**완료 기준**:
- sub 세션 출력이 `workspace/sessions/<sessionId>/output.log`에 append됨 (`core/pty/manager`에서 자동 기록).
- PM은 이 파일을 read해서 sub 진행 상황을 본다.
- sub 세션이 종료되면 `workspace/sessions/<sessionId>/done` 마커 파일이 생성됨.
- **데모 시나리오**: 사장이 PM에게 "README 단어 수 세줘" → PM이 spawn-request 작성 → dev 세션 spawn → dev가 `wc -w README.md` 실행 → PM이 output.log read → PM이 사장에게 "README는 N개 단어입니다" 채팅 답변.

**변경 파일**:
- `core/pty/manager.ts` — 출력을 ring buffer + file 둘 다에 기록
- `core/sessions/log-writer.ts` — `workspace/sessions/<id>/output.log` append + `done` 마커
- `core/spawn/protocol.ts` — done 마커 위치 정의
- `workspace/.gitkeep` 또는 폴더 생성 로직

**ref**: `references/cmux-team` — `.team/output/<conductor>/done` 마커 + `fs.watch` 패턴.

---

## 작업량 합계

- ✅ 완료: 3S + 5M (PR1, PR2, PR3, PR4, PR5a, PR5b, PR6, PR6.5)
- 🟡 남은: **1M (PR7)** — 본질 시나리오 완성.

## 다음 한 가지

PR7 — PM이 `workspace/sessions/<id>/output.log` + `done` 마커를 read해서 사장에게 보고. 이게 들어가야 사장 → PM → dev → PM → 사장 한 사이클 완성. 자세한 시작점은 `docs/PROGRESS.md` 참조.

---

## 의도적으로 PR3~PR7에서 빼는 것

- 사장이 board.md를 손으로 편집해 UI에 반영하는 흐름 — board는 PM이 자동 갱신하는 게 자연스러움. 손편집 watch는 Phase 1 끝나고 검토.
- LLM 라우터 (clideck autopilot) — PM이 Claude Opus라 라우팅도 본인이 함. 별도 라우터 엔진 불필요.
- YAML 워크플로우 — PM이 즉석에서 계획 짬. 정적 워크플로우 정의는 Phase 2 이후.
- 멀티 계정 / SSH / 픽셀 사무실 — Phase 1 비-목표.
