# Phase 1 작업 분해

Phase 1 목표(README): **텍스트 MVP** — Electron GUI 껍데기 + CLI 1개 spawn/kill + stdout 표시 + 직원 1명(Claude Code) + `workspace/board.md` watch + 사장이 GUI에서 메시지 → CLI 주입.

이걸 6개 PR로 쪼갬. 각 PR은 작게, 한 번에 한 가지만.

---

## PR1 — `app: 빈 Electron 앱 + "Hello, boss"` (S)

**완료 기준**: `npm run dev` 치면 창이 뜨고 "Hello, boss" 텍스트가 화면에 보인다.

**변경 파일 (예상)**:
- `app/package.json`
- `app/tsconfig.json`
- `app/electron.vite.config.ts`
- `app/src/main/index.ts` — `BrowserWindow` 생성
- `app/src/preload/index.ts` — 비어있어도 됨
- `app/src/renderer/index.html`
- `app/src/renderer/src/App.tsx` — `<h1>Hello, boss</h1>`
- `app/src/renderer/src/main.tsx`
- `app/.gitignore` — `dist/`, `out/`
- `package.json`(repo 루트) — workspaces 설정 또는 그냥 `app/` 만 사용

**ref**: `references/emdash/electron.vite.config.ts`, `references/emdash/src/main/index.ts`.

---

## PR2 — `core: 직원 정의 + 보드 파일 스키마` (S)

**완료 기준**: `core/employees/dev-1.json` 1개와 `workspace/board.md` 템플릿이 정의되어 있고, `core/board/parser.ts`가 board.md를 읽어 칸반 컬럼 객체로 변환한다 (테스트 1개 통과).

**변경 파일**:
- `core/employees/dev-1.json` — `{id, name, role, cliBackend: "claude-code", systemPrompt, active}`
- `core/employees/types.ts`
- `workspace/board.md` (커밋) — `## TODO`, `## IN PROGRESS`, `## DONE` 컬럼 헤더 + 예시 카드 1개
- `core/board/parser.ts` — 정규식 또는 `remark` 기반
- `core/board/parser.test.ts`
- `package.json` — `vitest` 의존성

**ref**: `references/cmux-team/.team/` 디렉토리 구조 — 파일 기반 task state 어휘 차용.

---

## PR3 — `app: 직원 카드 + 보드 패널 (UI 정적)` (M)

**완료 기준**: 앱을 켜면 좌측에 "직원 카드"(dev-1, idle 상태) + 우측에 보드(TODO/IN PROGRESS/DONE)가 보인다. 보드는 `workspace/board.md`에서 읽어와 정적 렌더링.

**변경 파일**:
- `app/src/main/board/load.ts` — main에서 파일 읽고 IPC로 전달
- `app/src/preload/index.ts` — `window.api.loadBoard()`, `window.api.loadEmployees()`
- `app/src/renderer/src/components/EmployeeCard.tsx`
- `app/src/renderer/src/components/Board.tsx`
- `app/src/renderer/src/components/Column.tsx`
- `app/src/renderer/src/App.tsx` — 레이아웃 (`flex` 좌우 분할, Tailwind)
- `app/postcss.config.js`, `app/tailwind.config.js`

**ref**: `references/emdash/src/renderer/` — Radix + Tailwind 레이아웃 패턴.

---

## PR4 — `core: PTY 매니저 + ring buffer + subscribe` (M)

**완료 기준**: `core/pty/manager.ts`가 `spawn(employeeId, cmd, args)` / `write(id, data)` / `kill(id)` / `subscribe(id, cb)` 4개 API를 제공. ring buffer 사이즈 64KB. 단위 테스트(echo 프로세스 spawn → 출력 확인) 통과.

**변경 파일**:
- `core/pty/manager.ts`
- `core/pty/ring-buffer.ts`
- `core/pty/types.ts`
- `core/pty/manager.test.ts`
- `package.json` — `node-pty` 추가

**ref**: `references/emdash/src/main/core/pty/controller.ts` — PTY 컨트롤러 구조 (구독 모델 그대로 차용).

---

## PR5 — `app: 터미널 뷰 + 직원 spawn/kill` (M)

**완료 기준**: 직원 카드 클릭 시 우측 패널이 보드 → 터미널 뷰로 전환. "출근" 버튼 누르면 `claude` CLI가 spawn되고 xterm에 출력이 흐른다. "퇴근" 버튼으로 kill 가능.

**변경 파일**:
- `app/src/main/employee/spawn.ts` — `core/pty/manager` 호출
- `app/src/preload/index.ts` — `window.api.spawn(id)`, `window.api.kill(id)`, `window.api.subscribe(id, cb)`
- `app/src/renderer/src/components/Terminal.tsx` — xterm.js 컴포넌트
- `app/src/renderer/src/components/EmployeeCard.tsx` — 출근/퇴근 버튼
- `app/src/renderer/src/state/employee-store.ts` — 활성 직원 ID 상태
- `package.json` — `@xterm/xterm`, `@xterm/addon-fit`

**ref**: `references/emdash/src/renderer/src/components/terminal/` — xterm 어댑터 패턴.

---

## PR6 — `app: 사장 메시지 입력 → 직원 stdin 주입 + board watch` (M)

**완료 기준**:
1. 터미널 뷰 하단에 메시지 입력창이 있고, 보내면 직원 CLI의 stdin에 그대로 들어간다(엔터 자동 송신).
2. `chokidar`로 `workspace/board.md` 변경을 감지해 보드 패널이 자동 리렌더링된다.
3. 데모 시나리오: 앱 시작 → 직원 출근 → 사장이 "프로젝트 폴더에 있는 README 요약해줘" 입력 → Claude Code가 응답 → 답변 끝나면 사장이 보드의 카드를 손으로 편집 → UI에 즉시 반영.

**변경 파일**:
- `app/src/renderer/src/components/MessageInput.tsx`
- `app/src/main/board/watch.ts` — `chokidar`
- `app/src/preload/index.ts` — `window.api.onBoardChange(cb)`
- `app/src/renderer/src/components/Board.tsx` — 변경 구독
- `package.json` — `chokidar`

**ref**: `references/cmux-team/skills/cmux-team/manager/` — `fs.watch` 패턴(우린 chokidar로 추상화).

---

## 작업량 합계

- PR1: S, PR2: S, PR3: M, PR4: M, PR5: M, PR6: M
- 합계 약 **2 S + 4 M**. 1~2주 작업량.

PR 순서는 의존성 기반 직선 (1→2→3→4→5→6). PR3/4는 일부 병렬 가능(UI vs PTY 코어 분리).

---

## Phase 1 종료 조건 (데모 시나리오)

> 앱 켜기 → 직원 1명 카드 보임 → 출근 클릭 → Claude Code 터미널 시작 → 사장이 "안녕"이라고 보냄 → 응답 받음 → board.md를 vscode로 열어 카드 추가/이동 → UI에 즉시 반영 → 퇴근 클릭 → 직원 kill.

이게 영상 30초 안에 시연되면 Phase 1 done.
