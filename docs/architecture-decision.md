# Architecture Decision (Phase 1)

Phase 0 리서치 후 채택 결정. 각 결정은 단호하게 한 줄. 근거 1~3줄.

---

## 1. 기술 스택

**결정**: **Electron + TypeScript** (메인/렌더러 모두 TS). Node 백엔드는 Electron main process 내에 인하우스. 별도 Python/Rust 백엔드 없음.

**근거**:
- Electron은 emdash가 PTY/xterm/IPC 풀스택을 이미 입증한 길. Tauri는 Rust 학습곡선 + Windows MSVC 빌드 셋업 비용이 Phase 1 마일스톤을 늦춤.
- TS는 4개 reference 중 3개(emdash/clideck/cmux-team)의 공통 분모. 외부 패턴 차용 시 마찰 최소.
- 사장 환경이 Windows 11이라 Unix 전용 도구(tmux 등)는 처음부터 배제.

---

## 2. GUI 베이스

**결정**: **emdash 패턴을 가장 많이 참고**. Electron main(`src/main/`) + preload IPC bridge + renderer(React + xterm.js + Tailwind) 구조 차용.

**근거**: 27개 CLI를 동시에 띄우면서 PTY 출력 스트리밍과 상태를 안정적으로 관리하는 구조의 prior art가 그대로 우리에게 필요. xterm.js는 사실상 PTY UI의 표준.

**주의**: emdash 코드 통째 복붙 금지. 구조와 어휘만 본 후 재구현. 라이센스 NOTICE는 Phase 1에서 직원 PTY 모듈 구현 시 파일별로 출처 명기.

---

## 3. CLI subprocess 관리

**결정**: **`node-pty`로 직접 spawn**. PTY ring buffer + 구독 모델. 상태 감지는 시작은 `onData`/`onExit` + idle 타임아웃(N초 무출력 → idle).

**근거**:
- tmux 의존(cmux-team) 회피 — Windows에서 동작 안 함. ConPTY 경로는 `node-pty`가 알아서 처리.
- ring buffer + subscribe(emdash 패턴)는 늦게 붙는 UI나 재연결 시에도 이력을 잃지 않음 — 직원 카드 다시 열면 그동안 로그 보임.
- OTLP 기반 상태 감지(clideck)는 Phase 2 옵션. Phase 1엔 출력 정지 N초로 충분.

---

## 4. 세션 간 라우팅 (인수인계)

**결정**: **파일 기반 인수인계** — `workspace/handoff/<from>__<to>__<timestamp>.md` 마크다운 + `chokidar fs.watch`로 감지. LLM 라우터는 Phase 2 이후.

**근거**:
- cmux-team의 done 마커 + `fs.watch` 패턴이 우리 "공유 상태는 파일로" 원칙(CLAUDE.md)과 완전 일치.
- 직원(CLI)들이 어차피 파일 읽고 쓰는 게 본업이라 별도 IPC API 안 만듦.
- clideck의 LLM autopilot은 우아하지만, Phase 1엔 사장이 게시판으로 직접 분배하는 게 더 단순하고 디버깅 가능.

---

## 5. 공유 게시판/메시징

**결정**: **파일 기반(마크다운)으로 시작**. `workspace/board.md`(칸반), `workspace/chat/<channel>.md`(채팅), `workspace/handoff/`(인수인계), `workspace/standup/<date>.md`. SQLite는 Phase 3 사용량/비용 추적이 들어올 때 도입.

**근거**:
- README의 디렉토리 구조와 일치. 직원 메타포가 "파일을 책상에 두고 일한다"임.
- SQLite를 처음부터 넣으면 직원 CLI들이 그걸 못 읽음(SQL 모름) → 결국 파일로 변환해야 함. 그럴 거면 처음부터 파일.
- 사장이 손으로 게시판/채팅을 편집할 수 있어야 함(머신리더블 + 휴먼에디터블 = 마크다운).

---

## 6. Phase 1에서 안 가져올 것 (의도적 제외)

| 항목 | 출처 | 이유 |
|---|---|---|
| LLM 라우터 (autopilot) | clideck | 사장이 직접 분배. 직원이 1명뿐인 Phase 1 MVP에 라우팅 불필요 |
| YAML 워크플로우 정의 | conductor | "회사 절차"를 코드화하려면 Phase 2 협업이 먼저 작동해야 함 |
| 멀티 계정 토큰풀 분산 | cmux-team | Claude Max 1구좌만으로 충분. Phase 3 이후 |
| Git worktree per agent | emdash | 직원 1명이라 격리 불필요. Phase 2에 직원 2명 되면 도입 |
| SSH/원격 직원 | emdash | 로컬 데스크톱 only (README 비-목표) |
| 체크포인트/Resume | conductor | 세션 영속화는 Phase 2 이후. Phase 1엔 앱 재시작 = 직원 다시 출근 |
| 픽셀 사무실 | 우리 로드맵 | Phase 4. 사장이 재밌어 보여도 그건 나중 (CLAUDE.md) |
| 웹 대시보드 | conductor | 데스크톱 앱 컨셉. 외부 브라우저 안 띄움 |
| SQLite | (자체) | 파일로 시작. 사용량 추적 들어올 때(Phase 3) 도입 |

---

## 채택 결정 요약 (한 줄씩)

1. 스택 = **Electron + TypeScript** (Node 백엔드 인하우스).
2. GUI 베이스 = **emdash 차용** (React + xterm.js + node-pty + IPC).
3. subprocess = **node-pty 직접, ring buffer + subscribe**.
4. 라우팅 = **파일 기반 핸드오프 + chokidar fs.watch**.
5. 보드 = **파일(마크다운). SQLite는 Phase 3.**
6. 제외 = 위 표 9개 항목.
