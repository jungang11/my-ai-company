# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-18 PR8d 직후. **회사 시간 commit (push 보류)** 상태.

---

## 한 줄 요약

Phase 1의 **본질 시나리오 + 회사 구조** 완성. 사장 → PM(Opus 4.7) → 알아서 spawn-request → sub(dev-1/dev-arch/planner-1/qa-1) → done → PM 자동 보고 한 사이클 코드 OK. 남은 건 **시연 검증** + **토큰 최적화 라운드**.

---

## 누적 commit (push 가능 단위)

| 시점 | 단계 | 커밋 | 내용 |
|---|---|---|---|
| Phase 0 | 컨셉 | `109b3e3`, `543869c` | README/CLAUDE.md/kickoff.md + Phase 1 계획 |
| Phase 1 | PR1 | `8ca1c7c` | 빈 Electron + "Hello, boss" |
| Phase 1 | PR2 | `e8974f5` | 직원 정의 + 보드 파서 |
| Phase 1 | PR3 | `de154a1` | 사장-PM 채팅 패널 (Tailwind v4) |
| Phase 1 | PR4 | `c3c9893` | PTY 매니저 + ring buffer |
| Phase 1 | PR5a | `e12c46f` | PM echo stub + PTY/IPC 인프라 |
| Phase 1 | PR5b | `34cbd04` | PM = Claude Code CLI 실제 연결 |
| Phase 1 | PR6 | `9bac44e` | PM이 sub 세션 spawn 프로토콜 + 직원 카드 UI |
| Phase 1 | PR6.5 | `54d451f` | 하단 statusbar |
| Phase 1 | 인수인계 | `85556a7` | PROGRESS.md 신규 |
| **Phase 1** | **PR7** | **`bc8242a`** | **PM이 sub 결과 read해서 자동 보고 (본질 한 사이클)** |
| Phase 1 | PR8a | `35b0483` | 직원 스키마 확장 + planner-1/qa-1 신규 + docs/models.md |
| Phase 1 | PR8b | `2b07552` | PM 자율 분배 + 카탈로그 자동 주입 + JSON live-reload |
| Phase 1 | PR8c | `9ca0f91` | models.md 리서치 기반 전면 갱신 |
| Phase 1 | PR8d | `7e4cd20` | effort max→xhigh + dev-arch 신규 |

origin push 기준: 마지막 push 후 누적된 commit 다수. **회사 GitHub Desktop 로그인 중이라 personal repo push 권한 없음. 퇴근 후 personal로 swap → 한 번에 push.**

---

## 지금 동작하는 시나리오

1. `cd app && npm run dev` → Electron 창.
2. **좌측 사이드바**: 직원 roster (작업 중/최근 종료).
3. **중앙 채팅**: 사장 ↔ PM(Opus 4.7, xhigh) 직통. streaming 응답이 한 버블에 누적, `--resume`으로 컨텍스트 유지.
4. **하단 statusbar**: project · branch · model · ctx · token · cost · 5h reset.
5. 사장이 일감 던지면 PM이 **자율 판단**:
   - 짧은 질문 → 직접 답
   - 한 단위 작업 → 단일 sub에 spawn-request 작성 (Write 도구)
   - 병렬 가능 → 여러 sub 동시 spawn
   - 어려운 코딩 → dev-arch에 위임
6. sub Claude가 spawn → 출력은 `workspace/sessions/<id>/output.log`에 append.
7. sub exit → `done` 마커 생성 → app이 PM에 자동 시스템 메시지 주입.
8. PM이 output.log Read → 사장에게 "X 직원 결과 보고드립니다: ..." 채팅 응답.

---

## 회사 구조 (PR8 결과)

| 직군 | 이름 | 모델 | effort | 역할 |
|---|---|---|---|---|
| PM | 박PM | claude-opus-4-7 | xhigh | 사장 직통, 자율 분배, 통합 보고 |
| 개발자 (일상) | 김개발 (dev-1) | claude-opus-4-6 | xhigh | 일상 코드 작성·리팩토링 |
| 개발자 (어려움) | 박아키 (dev-arch) | claude-opus-4-7 | xhigh | 아키텍처/race/security/디버깅 finalize |
| 기획자 | 이기획 (planner-1) | claude-opus-4-7 | xhigh | 분석·리서치·문서 |
| QA | 정검증 (qa-1) | claude-sonnet-4-6 | high | 검증·리뷰·회귀 |

자세한 매핑 근거와 벤치마크는 `docs/models.md`.

---

## 시연 검증 시나리오 (Phase 1 종료 판정)

`npm run dev` 후 사장이 던질 일감 예시 — 검증 항목별:

| 시나리오 | 검증 항목 |
|---|---|
| "안녕, 뭐 할 수 있어?" | PM 직접 답 (sub 안 부름). 카탈로그 자동 주입으로 본인 회사 직원 명단 알고 있는지. |
| "README에서 단어 수만 알려줘" | PM → dev-1 spawn → done → PM 보고. 한 사이클. |
| "README의 단어 수와 줄 수를 동시에 알려줘" | PM이 **동시 여러 spawn** 결정. 두 sub 카드 동시 작업 중. 둘 다 끝나면 통합 보고. |
| "보드 파서에 .eml 지원 추가하려고 하는데 어떻게 해야 할까" | PM이 **dev-arch에 분석 위임** (아키텍처 일감). dev-1엔 안 보냄. |
| "지금까지 작업한 거 정리해서 docs/handoff.md 만들어줘" | PM이 **planner-1에 위임**. |

위 5개 중 **3개 이상 성공**하면 Phase 1 종료 도장.

---

## 남은 라운드 (Phase 1 마무리 또는 Phase 2 진입 전)

### 1. 시연 검증 (사장 personal 시간)
위 5개 시나리오 돌려보고 결과 확인. 실패한 케이스는 PM 시스템 프롬프트 튜닝 (JSON live-reload라 dev 재시작 불필요).

### 2. 토큰 최적화 라운드
`docs/models.md §6` 참조. 우선순위:
- **Prompt cache hit 극대화**: `loadCatalog()`가 결정적 결과를 내도록 보장 (현재 readdirSync 결과 순서가 OS-dependent — 알파벳 정렬 강제).
- **`--exclude-dynamic-system-prompt-sections`** flag 추가 검토 (PM/sub args에).
- **statusbar에 cache_read_input_tokens 노출** — cache hit rate 가시화.

### 3. 후속 직군 추가 검토 (사장 결정)
- design-reviewer (Figma MCP 연동) — Phase 3 로드맵
- utility-1 (Haiku 4.5) — 단순 분류/요약 잡일용 sub-agent

---

## 환경 / 셋업

- Windows 11 + PowerShell 기본. Bash는 git bash.
- Node 20.12.2, npm 10.5.0.
- `claude` CLI: `C:\Users\robocare\.local\bin\claude.exe`. Claude Max OAuth.
- `app/` Electron + React 19 + Tailwind v4 + node-pty prebuilt + chokidar v5.
- `core/` standalone Node + vitest. 직원 정의 + PTY + spawn protocol + parser.
- `references/` (.gitignore) 학습 자료.
- `.claude/settings.local.json` (.gitignore) — `defaultMode: bypassPermissions` 설정 권장. 현재 세션 시작 시 minimal 상태일 수 있음.
- `.git/config` local override: `dongwon lee <ehddnjs5861@naver.com>` 박혀 있음 — 회사 global 설정과 분리. 이 repo commit은 항상 personal author로 찍힘.

---

## 새 세션 진입 절차

1. `README.md` + `CLAUDE.md` + `docs/PROGRESS.md`(이 파일) + `docs/models.md` 읽기.
2. 메모리 자동 로드 (글로벌 `~/.claude/projects/.../memory/MEMORY.md`).
3. 마지막 commit `7e4cd20` 위에서 시작.
4. 사장 다음 지시 대기. 보통 흐름:
   - "시연 한 번 해보자" → `npm run dev` 띄우고 위 5개 시나리오 안내
   - "토큰 최적화 들어가자" → §남은 라운드 1번 항목
   - 새 직군/일감 추가 → core/employees/ 새 JSON
