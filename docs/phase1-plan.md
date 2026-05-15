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

### PR3 — `app: 사장-PM 채팅 패널 (정적 UI)` (M)

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

- 완료: 2S (PR1, PR2)
- 남은: 5M (PR3~PR7)
- 합계 약 **2 S + 5 M**. 1~2주 작업량.

PR3~PR4는 일부 병렬 가능 (UI vs PTY 코어 분리).

---

## 의도적으로 PR3~PR7에서 빼는 것

- 사장이 board.md를 손으로 편집해 UI에 반영하는 흐름 — board는 PM이 자동 갱신하는 게 자연스러움. 손편집 watch는 Phase 1 끝나고 검토.
- LLM 라우터 (clideck autopilot) — PM이 Claude Opus라 라우팅도 본인이 함. 별도 라우터 엔진 불필요.
- YAML 워크플로우 — PM이 즉석에서 계획 짬. 정적 워크플로우 정의는 Phase 2 이후.
- 멀티 계정 / SSH / 픽셀 사무실 — Phase 1 비-목표.
