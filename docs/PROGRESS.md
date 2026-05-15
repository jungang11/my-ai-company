# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-15 PR6.5 commit 직후.

---

## 한 줄 요약

Phase 1의 본질 시나리오까지 **80% 진행**. 사장 → PM → dev sub 세션 spawn → 작업 완료까지 동작. 남은 한 단계는 **PM이 sub 결과를 read해서 사장에게 보고**하는 PR7.

---

## 누적 commit (Phase 0 + Phase 1)

| 단계 | 커밋 | 내용 |
|---|---|---|
| Phase 0 | `109b3e3` | payroll-os 컨셉 + Phase 0 산출 (README, CLAUDE.md, kickoff.md, docs/) |
| Phase 0 | `543869c` | Phase 1 계획을 PM 중심 본질로 재설계 |
| PR1 | `8ca1c7c` | 빈 Electron 앱 + "Hello, boss" |
| PR2 | `e8974f5` | 직원 정의 + 보드 파서 (vitest 4/4) |
| PR3 | `de154a1` | 사장-PM 채팅 패널 (Tailwind v4) |
| PR4 | `c3c9893` | PTY 매니저 + ring buffer (vitest 14/14) |
| PR5a | `e12c46f` | PM echo stub + PTY/IPC 인프라 |
| PR5b | `34cbd04` | PM = Claude Code CLI 실제 연결 (stream-json, --resume) |
| PR6 | `9bac44e` | PM이 sub 세션 spawn 프로토콜 + 직원 카드 UI |
| PR6.5 | `54d451f` | 하단 statusbar (model · ctx · token · cost · 5h reset) |

---

## 지금 동작하는 시나리오

1. 사장이 `cd app && npm run dev` → Electron 창 뜸.
2. **좌측 사이드바**: "직원 roster" — 작업 중 / 최근 종료 카드 목록.
3. **중앙 PM 채팅방**: 사장 ↔ PM(Claude Opus 4.7) 직통 채팅. streaming으로 응답이 한 버블에 점진 누적. `--resume`으로 컨텍스트 유지.
4. **하단 statusbar**: project · branch · model · ctx % · 누적 token · cost · 5h reset.
5. 사장이 "dev-1에게 X 시켜봐" → PM이 `workspace/spawn-request/<uuid>.json` 작성 → chokidar watcher가 잡아 → sub Claude (dev-1) 세션 spawn → 좌측 사이드바에 김개발 카드 emerald 깜빡이로 등장 → 작업 종료 시 slate(done)로 전환 + 결과 마지막 200자 미리보기.
6. sub 출력은 `workspace/sessions/<id>/output.log`에, 종료 시 `workspace/sessions/<id>/done` JSON 마커 생성.

---

## 남은 본질 단계 — PR7

**PM이 sub 결과를 read해서 사장에게 보고** 단계가 빠짐. 현재는 PM이 spawn-request만 던지고 "결과는 workspace/sessions/<id>/에서 확인하세요" 같은 안내까지만 함.

### PR7 구현 가이드

**완료 기준**: 사장 → PM → dev → PM → 사장 한 사이클이 30초 데모로 시연된다.

예: 사장 "README 단어수 세줘" → PM이 dev-1에게 spawn-request → dev-1이 `wc -w README.md` 실행 → PM이 `output.log` + `done` 마커 read → PM이 "README는 N개 단어입니다" 채팅 응답.

**현재 PM 시스템 프롬프트** (`core/employees/pm.json`)에 **read 흐름 추가** 필요:
- "spawn-request를 보낸 직후, `workspace/sessions/<id>/done` 마커가 생길 때까지 polling으로 기다려라. 마커가 생기면 같은 폴더의 `output.log`를 read해서 그 결과를 요약해 사장에게 답해라."
- 또는 더 능동적: app이 done 마커 감지 시 PM에게 IPC로 알림을 보냄 → PM이 그 시그널 받고 read.

**두 갈래 선택지** (사장이 PR7 시작 시 결정):

| 안 | 메커니즘 | 장점 | 단점 |
|---|---|---|---|
| A. PM 폴링 | PM이 Bash로 done 파일 존재 polling | 단순, 코드 변경 최소 | PM이 polling 동안 다른 작업 못함, 사장 응답 지연 |
| B. app이 PM에 재진입 | done 마커 감지 시 app이 PM에 stream-json 입력 자동 주입 ("dev-1 작업 끝났어, 결과 읽어봐") | PM이 비동기적으로 알림 받음, 자연스러움 | --print 모드는 stdin 종료 후 exit이라 재진입은 새 turn(--resume) — 매번 새 process spawn, multi-step 시퀀스가 명령 chain됨 |

**현재 인프라가 B에 가깝게 셋업되어 있음** (`sendToPM`이 새 turn마다 child_process spawn + --resume). app이 done 감지 시 자동으로 "sub <id> 결과 확인하고 사장에게 보고해" 메시지를 sendToPM에 던지면 됨.

권장 출발점: **B안**, `app/src/main/spawn/runner.ts`의 `onExit`에서 일정 시간 후 `sendToPM("[system] sub-<id> 완료. output.log 읽고 사장에게 결과 보고.")` 자동 호출.

---

## 환경 / 셋업

- Windows 11 + PowerShell 기본. Bash는 git bash.
- Node 20.12.2, npm 10.5.0.
- `claude` CLI는 `C:\Users\robocare\.local\bin\claude.exe`로 PATH 등록됨. Claude Max OAuth 인증 사용.
- `app/` (Electron + React + Tailwind v4 + node-pty prebuilt + chokidar v5).
- `core/` (standalone Node + vitest, GUI 독립).
- `references/`는 .gitignore (학습 자료 4개 repo clone).
- `.claude/settings.local.json`은 .gitignore. `defaultMode: bypassPermissions` + Skill/Bash/Read/Write/Edit 등 all allow.

---

## 어떻게 새 세션에서 이어가나

1. `README.md` + `CLAUDE.md` + 이 `docs/PROGRESS.md` 3개 읽기 (필요 시 `docs/architecture-decision.md`).
2. 메모리 5개 자동 로드 (글로벌 `~/.claude/projects/.../memory/MEMORY.md`).
3. 마지막 commit `54d451f` 위에서 시작.
4. 사장에게 "PR7 들어갈까요? B안(app이 done 감지 시 PM에 자동 재진입)이 기존 인프라에 맞음" 한 줄로 통보.
5. 사장 OK 받으면 `app/src/main/spawn/runner.ts` 의 `proc.on('exit', ...)` 에 done 마커 작성 직후 sendToPM 호출 추가 + PM 시스템 프롬프트 한 줄 수정.
