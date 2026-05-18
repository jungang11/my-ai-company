# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-18 — Phase 1 + Phase 2 본질 시연 통과 직후.

---

## 한 줄 요약

**Phase 1 + Phase 2 코드 완성 + 사장 본질 시연 통과**. PM이 Task tool로 sub-agent (utility-1) spawn → 결과 통합 보고 → 사장 채팅에 markdown 렌더링까지 한 사이클 동작. Phase 3 (Codex/Gemini/Figma MCP) 진입 가능.

---

## 누적 commit (push 가능 단위, origin 보다 20+ ahead)

```
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

### A. Phase 3 진입 (다양화)
`docs/phase3-plan.md` draft 작성됨. 6 PR 분해:
- PR1 다중 CLI 백엔드 추상화
- PR2 dev-codex (OpenAI Codex CLI)
- PR3 dev-gemini (Google Gemini CLI)
- PR4 Figma MCP + designer-1 직군
- PR5 직원별 누적 사용량/비용 그래프 (UsagePanel)
- PR6 workspace/sessions 영속 read (PR2.5 흡수)

사장 결정 안건 4개 §끝.

### B. Phase 2 잔여 polish
- workspace/sessions 영속 read (Phase 3 PR6 당김)
- UsagePanel (Phase 3 PR5 당김)
- 토큰 최적화 2차

### C. 시연 시나리오 확장
- "회의:" prefix 시연
- 동시 다중 spawn (병렬 작업) 시연
- 직원 토글 시연

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

1. `README.md` + `CLAUDE.md` + 이 `docs/PROGRESS.md` 읽기. 필요 시 `docs/models.md`, `docs/phase{1,2,3}-plan.md`.
2. 메모리 자동 로드 (`~/.claude/projects/.../memory/MEMORY.md`).
3. 마지막 commit `477fd48` 위에서 시작.
4. 사장 다음 지시 대기:
   - "Phase 3 가자" → `docs/phase3-plan.md` 검토 + PR1 (다중 CLI 백엔드 추상화) 시작.
   - "시연 한 번 더" → `npm run dev` + PROGRESS의 시연 시나리오 안내.
   - 다른 안건 → 작은 단위로 분해 후 진행.
