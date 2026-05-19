# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-19 — Phase 4 픽셀 사무실 PR2.1~2.5 통과 + skill 시스템 도입.

---

## 한 줄 요약

**Phase 1 + Phase 2 본질 시연 통과 + Phase 3 부분 진행 완료 + Phase 4 픽셀 사무실(카이로 톤) PR2.4까지 통과 + skill 시스템 정착**. PM이 Task tool로 sub-agent spawn → 결과 통합 보고 → 사장 채팅에 markdown 렌더링 + 우측 사무실 모달에서 직원 6명 책상/회의/휴게실 시각화. `회의:` prefix 시 직원들이 회의 테이블 둘레로 transition. Phase 3 PR1~4(Codex/Gemini/Figma)는 사장 결정 보류. 다음 라운드는 push 일괄 / Phase 4 추가(말풍선·walk cycle·시간 흐름) / Phase 5 비전 중 결정 대기.

---

## 누적 commit (push 가능 단위, origin 보다 41 ahead)

```
54bd9c2 docs: pixel-office-design skill stable + PR2.1~2.4 회고 (Phase 4 PR2.5)
6ef4561 app: Phase 4 PR2.4 — 회의 prefix 시 직원 회의 테이블 이동 visual
dd3a0e2 app: Phase 4 PR2.3 — 회의실/휴게실 zone + 회의 테이블/화이트보드/소파/식수기
8bab430 app: Phase 4 PR2.2 — 6직군 책상 배치 + 셔츠 6색 + roster.working 매핑
e01dec6 app: Phase 4 PR2.1 — 카이로 톤 비례/책상 디테일/컴포넌트 분리 (skill 적용)
97a15b7 docs: pixel-office-design skill 본문 채움 (리서치 결과 반영)
6f72f2d docs: skills/ 시스템 + pixel-office-design 스켈레톤 (Phase 4 inception)
176c3bb app: 사무실 카이로 톤 1차 갈아엎기 — top-down + 책상 detail + 풍선
e86dda2 app: Phase 4 PR1 — 픽셀 사무실 골격 + PM 캐릭터 (idle/working)
86e844c docs: PROGRESS.md sync — docs 라운드 + UsagePanel 풀 반영
0d0f7cc docs: phase3-plan — PR5 풀버전 완료 반영 + 사장 결정 안건 제거
fe99395 docs: CLAUDE.md — Phase 0/첫 메시지 섹션 제거 + 시행착오 학습 반영
b34b029 docs: README — Phase 1/2/3 체크박스 + 실제 디렉토리 + 6직군 표 반영
eb44de1 app: UsagePanel 풀버전 — 직원별 누적 표 + 막대 그래프 (Phase 3 PR5 full)
ef3fc57 docs: PROGRESS.md sync — PR5/PR6/polish 라운드 반영
d02accd app: UX polish — 회의 prefix hint + timestamp + 5h amber
25f8c3e docs: Phase 3 plan 갱신
cab0aa5 app: 직원 명부 누적 spawn/tokens (Phase 3 PR5 minimal)
06152cf core+app: sub session 영속화 + historical 복원 (Phase 3 PR6)
7f0ad9f docs: PROGRESS.md 최종 sync
477fd48 docs: Phase 2 시연 통과 docs sync (models.md/phase2-plan.md)
3a73d7f app: sub session 카드 시각화 (Task tool 이벤트 캡처) + UX
3c97140 core+app: Task tool 패턴 도입 + UX 안정화 (Phase 2 fix 라운드)
118c274 docs: PROGRESS.md Phase 3 draft 위치
e5244e9 docs: Phase 3 plan draft (사장 검토 대기)
be5afb4 docs: Phase 2 완료 도장
e280e63 app: Phase 2 PR3 직원별 cost 추적
84c63cc app: Phase 2 PR2 sub session 상세 모달
4ffd182 app: Phase 2 PR1 C2 직원 명부 UI + active 토글
f909475 core+app: Phase 2 PR1 C1 직원 manager + active filter
deab92f core: PM 시스템 프롬프트에 "회의:" prefix 흡수 (PR8.5)
64bb556 docs: Phase 2 plan draft
da26a2e core: utility-1 (Haiku 4.5) 신규 (PR10)
cd7a50f perf: 토큰 최적화 1차 (PR9)
2a67d47 docs: Phase 1 인수인계
7e4cd20 core: effort xhigh + dev-arch (PR8d)
9ca0f91 docs: models.md 리서치 갱신 (PR8c)
2b07552 core+app: PM 자율 분배 + 카탈로그 (PR8b)
35b0483 core+docs: 직원 스키마 + planner/qa (PR8a)
bc8242a core+app: PM sub 결과 read 자동 보고 (PR7)
```

origin은 `85556a7`까지 push 됨. **회사 GitHub Desktop 로그인이라 personal repo push 권한 없음** (어제 patch-to-tc 케이스에서 403 확인). 퇴근 후 personal로 swap → 일괄 push.

---

## architecture 결정 (Phase 2 시연 후) — 중요

**PM의 sub spawn은 Claude Code의 Task tool 사용**. 이전 file-watcher + Write 패턴은 PM에게 unnatural해서 PM이 시스템 프롬프트 무시하고 "Read/Bash 없으니 못 함" 합리화로 회귀. 사장 통찰("Claude Code 대용인데 Claude Code 켜라고?" + ECC 리서치 요청) 반영해 정통 패턴으로 전환.

- **`.claude/agents/<id>.md`** (5직군 정의): YAML frontmatter (name/description/tools/model) + 시스템 프롬프트.
- **PM args**: `--tools "Task,Write"` — Task가 메인. Write는 외부 CLI 직원(Phase 3 Codex/Gemini) 파일 watcher 메커니즘용 fallback.
- **PM args**: `--system-prompt` (--append 아님) — claude default agent 가이드 완전 대체. PM의 "도구 부족" 합리화 패턴 차단.
- **이벤트 캡처**: PM의 stream-json에서 claude가 emit하는 dedicated 이벤트 (`system.subtype=task_started`, `user` with `tool_use_result`)를 캡처해서 GUI 사이드바 카드로 변환.
- **모델 한계**: Task tool model은 `sonnet/opus/haiku` enum이라 `opus-4-6` vs `opus-4-7` 세분화 불가능. 외부 CLI 직원에서만 model 세분화 유의미.

---

## 지금 동작하는 시나리오

1. `cd app && npm run dev` → Electron 창.
2. **좌측 사이드바**:
   - **직원 명부 (6/6 활성)** — 6명 카드 + 체크박스 토글 (PM은 disabled).
   - **작업 중** / **최근 종료** — PM이 Task tool로 spawn한 sub-agent 카드.
3. **중앙 PM 채팅**:
   - 사장 ↔ PM(Opus 4.7) 직통. `--system-prompt` + `--tools "Task,Write"`.
   - PM이 자율 분배: 사장이 일감 던지면 PM이 직접 답 vs Task tool spawn 판단.
   - `회의:` prefix → PM이 다수 직원에 동시 spawn.
   - **react-markdown** 렌더링 (header/list/table/code/strong/em).
   - 메시지 보내면 입력창 위 banner "⏳ PM 응답 준비 중..." (첫 chunk 시 사라짐).
4. **하단 statusbar**: project · branch · model · ctx %(마지막 turn 점유) · tok 누적 · cache hit% (R/C) · cost · 5h reset.
5. sub 종료 → 좌측 카드 "최근 종료"로 → 클릭하면 모달에 **markdown 렌더링된 전체 output** + model/tok/cache/cost 메타.

---

## 회사 구조 (활성 토글로 가변)

| 직군 | 이름 | 모델 (`.claude/agents/`) | 역할 |
|---|---|---|---|
| PM | 박PM | `claude-opus-4-7` (xhigh) | 사장 직통, Task tool로 분배, 통합 보고 (항상 활성) |
| 개발자 (일상) | 김개발 (dev-1) | `opus` | 일상 코드 작성·리팩토링 |
| 개발자 (어려움) | 박아키 (dev-arch) | `opus` | 아키텍처/race/security/디버깅 finalize |
| 기획자 | 이기획 (planner-1) | `opus` | 분석·리서치·문서 (+WebSearch) |
| QA | 정검증 (qa-1) | `sonnet` | 검증·리뷰·회귀 |
| 잡일 | 막내 (utility-1) | `haiku` | 분류·추출·포맷·짧은 요약·lookup |

자세한 매핑 근거 + 모델 한계: `docs/models.md`.

---

## 시연 검증 통과 사례 (2026-05-18)

- 사장: "README.md의 단어 수와 줄 수를 동시에 알려줘" (직원 이름 거론 X)
- PM: 자율로 utility-1 선택 → Task tool 호출
- 좌측 막내 카드 등장 (working) → 5초 → "최근 종료" 전환
- PM 통합 보고 ("줄 수: 28, 단어 수: 103") + markdown 렌더링
- 사장 검증 질문 ("직접 했어?") → PM이 "utility-1에 위임, 그 결과 보고" 정확 답변
- 카드 클릭 → 모달에 utility-1의 raw output (markdown) + duration 5s + tokens

---

## 남은 라운드 후보 (사장 결정 안건)

### A. Phase 3 부분 진행 완료 (사장 결정 2026-05-18)
- ❌ PR1 다중 CLI 백엔드 / PR2 Codex / PR3 Gemini / PR4 Figma MCP — 모두 보류 (사장 외부 CLI 구독 시점에 재개).
- ✅ PR5 minimal 직원 명부 row 누적 표시 (`cab0aa5`).
- ✅ PR5 full UsagePanel 풀버전 (`eb44de1`) — 직원별 spawn/in/out/cache R/C/duration + emerald 막대 그래프 + 합계 footer + Esc/배경 dismiss. 좌측 사이드바 "전체 사용량 보기 →" 진입점.
- ✅ PR6 workspace/sessions 영속 read (`06152cf`).

### B. UX polish 완료 (`d02accd`)
- 회의: prefix 안내 hint (입력창 placeholder)
- 메시지 timestamp (HH:mm)
- 5h reset 임박(<30분) 시 amber 강조

### C. 시연 시나리오 확장 (사장 personal 시간 검증 대기)
- "회의:" prefix → PM 동시 다수 spawn
- 어려운 일감 → dev-arch에 위임
- 문서 일감 → planner-1에 위임
- 직원 토글 → utility-1 비활성 후 단순 일감 흐름 변화
- 영속 read 재시작 — 창 닫고 다시 열어 historical 카드 살아남는지

### D. 토큰 최적화 2차 (보류)
cache_creation이 매 turn 1k 미만으로 안정. 추가 최적화 가치 미미. 새 보강 시점 도래 시 재검토.

### E. docs sync 라운드 완료 (2026-05-19)
- ✅ README.md (`b34b029`) — Phase 1/2/3 체크박스 + 실제 디렉토리 + 6직군 표
- ✅ CLAUDE.md (`fe99395`) — Phase 0 섹션 제거 + 시행착오 학습(DevTools/PM file-watcher/--system-prompt/CSP) 반영 + 환경 핵심
- ✅ docs/phase3-plan.md (`0d0f7cc`) — PR5 풀 완료 반영 + 사장 결정 안건 섹션 제거

### F. Phase 4 픽셀 사무실 진입 (2026-05-19) — 카이로소프트 톤
사장 안건 "카이로 게임 톤으로 사무실 + 리서치 빡세게 → skill 정착 → 업그레이드".

- ✅ **skill 시스템 도입** (`6f72f2d`, `97a15b7`, `54bd9c2`) — `docs/skills/README.md` + `pixel-office-design.md`. 백그라운드 agent 리서치(WebSearch, 출처 20개) → 핵심 원칙 5개 + 패턴 6개 + 라이센스 안전 영역. status: stable.
- ✅ **PR1** (`e86dda2`) — 사무실 모달 골격 + PM 1명 (정면 시점, 도트 무늬 floor)
- ✅ **1차 갈아엎기** (`176c3bb`) — top-down 시점 + 카이로 책상 detail (감 기반)
- ✅ **PR2.1** (`e01dec6`) — skill 적용: 캐릭터 비례 보정 + 책상 5종 디테일 + 컴포넌트 분리(`pixel-office/`)
- ✅ **PR2.2** (`8bab430`) — 6직군 책상 + 셔츠 6색(amber/blue/violet/emerald/rose/slate) + roster.working 자동 매핑
- ✅ **PR2.3** (`dd3a0e2`) — Zones 회의실/휴게실 + 가구 4종(MeetingTable/Whiteboard/Sofa/WaterCooler)
- ✅ **PR2.4** (`6ef4561`) — `회의:` prefix 감지 → 6명 캐릭터가 700ms transition으로 회의 테이블 둘레로 이동 + header 배지

### G. 다음 라운드 후보 (사장 결정 안건)
- **Phase 4 추가**: 회의 발언 말풍선 / walk cycle 애니메이션 (sprite sheet 도입 트리거) / 사장 캐릭터 / 시간 흐름 overlay
- **외부 CLI 재개** — Codex/Gemini/Figma 구독 시점에 phase3-plan PR1부터.
- **push 일괄 처리** — personal swap 후 41개 commit push.
- **Phase 5 비전** — 사장이 비전 통보 시 새 plan 작성.

---

## 환경 / 셋업

- Windows 11 + PowerShell. Bash는 git bash.
- Node 20.12.2, npm 10.5.0.
- `claude` CLI: `C:\Users\robocare\.local\bin\claude.exe`. Claude Max OAuth.
- `app/` Electron 33 + React 19 + Tailwind v4 + node-pty prebuilt + chokidar v5 + react-markdown.
- `core/` standalone Node + vitest.
- `.claude/agents/*.md` (5직군) — git tracked.
- `.git/config` local: `dongwon lee <ehddnjs5861@naver.com>` (personal).
- `.claude/settings.local.json` (.gitignore).

---

## 새 세션 진입 절차

1. `README.md` + `CLAUDE.md` + 이 `docs/PROGRESS.md` 읽기. 필요 시 `docs/models.md`, `docs/phase{1,2,3}-plan.md`, `docs/skills/README.md`(시각 영역).
2. 메모리 자동 로드 (`~/.claude/projects/.../memory/MEMORY.md`).
3. 마지막 commit `54bd9c2` 위에서 시작. 워킹트리 clean 확인.
4. 사장 다음 지시 대기:
   - **시각 영역 작업** → 해당 `docs/skills/<name>.md` 먼저 읽고 패턴 따름. 없으면 작은 PR 후 사장 검토 → 깊이 필요하면 skill 신규.
   - "Phase 4 더 가자" → 회의 말풍선 / walk cycle / 사장 캐릭터 / 시간 흐름 중 사장 통보.
   - "Codex/Gemini 들어왔어" → `docs/phase3-plan.md` PR1(다중 CLI 백엔드 추상화)부터.
   - "시연 검증 결과" → C 섹션의 시연 시나리오 안내.
   - "push 가능" → personal GitHub Desktop swap 확인 후 일괄 push (41개).
   - 다른 안건 → 작은 단위로 분해 후 진행.
