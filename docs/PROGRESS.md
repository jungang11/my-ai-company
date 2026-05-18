# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-18 Phase 2 PR1~PR3 commit 직후. **회사 시간 commit 다수, push 보류** 상태.

---

## 한 줄 요약

**Phase 1 + Phase 2 코드 모두 완성**. Phase 3 (Codex/Gemini CLI 직원 추가, Figma MCP 등) 진입 가능. 남은 건 시연 검증 + (선택) 토큰 최적화 2차.

---

## 누적 commit (push 가능 단위, 마지막 push 후)

```
e280e63 Phase 2 PR3   직원별 model/token/cost 추적
84c63cc Phase 2 PR2   sub session 상세 모달
4ffd182 Phase 2 PR1 C2 직원 명부 UI + active 토글
f909475 Phase 2 PR1 C1 직원 manager + active filter
cfc0a4c docs           Phase 2 plan 확정
deab92f Phase 1 PR8.5 PM 시스템 프롬프트 \"회의:\" prefix 흡수
64bb556 docs           Phase 2 plan draft
da26a2e Phase 1 PR10  utility-1 (Haiku 4.5) 신규
cd7a50f Phase 1 PR9   토큰 최적화 1차 (cache hit 극대화 + flag + 가시화)
2a67d47 docs           Phase 1 본질 + 회사 구조 인수인계
7e4cd20 Phase 1 PR8d  effort xhigh + dev-arch 신규
9ca0f91 Phase 1 PR8c  models.md 리서치 갱신
2b07552 Phase 1 PR8b  PM 자율 분배 + 카탈로그
35b0483 Phase 1 PR8a  직원 스키마 + planner/qa
bc8242a Phase 1 PR7   PM sub 결과 read 자동 보고
```

origin은 `85556a7`까지 push 됨 (Phase 1 PR6.5까지). 그 위 15+ commit이 회사 시간 누적분 — **퇴근 후 GitHub Desktop personal swap → 일괄 push**.

---

## 지금 동작하는 시나리오

1. `cd app && npm run dev` → Electron 창.
2. **좌측 사이드바**:
   - **직원 명부 (N/M 활성)** 섹션 — 6명 전체 + 체크박스로 active 토글. PM은 disabled.
   - 작업 중 카드 / 최근 종료 카드 — 클릭하면 **상세 모달** (전체 output, 일감 prompt, model · tok ↑↓ · cache R/C · cost).
3. **중앙 PM 채팅**:
   - 사장 ↔ PM(Opus 4.7) 직통.
   - PM 자율 분배: 사장이 일감 던지면 PM이 본인 판단으로 직접 답 / sub 단일 위임 / 동시 다수 spawn.
   - `회의:` prefix로 보내면 PM이 다수 직원에게 동시 spawn → 관점별 의견 통합 보고.
4. **하단 statusbar**: project · branch · model · ctx % · 누적 token · cache hit% · cost · 5h reset.
5. sub 완료 시 PM이 자동 시스템 메시지 받아 사장에게 결과 보고.

---

## 회사 구조 (활성 토글로 가변)

| 직군 | 이름 | 모델 | effort | 역할 |
|---|---|---|---|---|
| PM | 박PM | claude-opus-4-7 | xhigh | 사장 직통, 자율 분배, 통합 보고 (항상 활성) |
| 개발자 (일상) | 김개발 (dev-1) | claude-opus-4-6 | xhigh | 일상 코드 작성·리팩토링 |
| 개발자 (어려움) | 박아키 (dev-arch) | claude-opus-4-7 | xhigh | 아키텍처/race/security/디버깅 finalize |
| 기획자 | 이기획 (planner-1) | claude-opus-4-7 | xhigh | 분석·리서치·문서 |
| QA | 정검증 (qa-1) | claude-sonnet-4-6 | high | 검증·리뷰·회귀 |
| 잡일 | 막내 (utility-1) | claude-haiku-4-5-20251001 | low | 분류·추출·포맷·짧은 요약·lookup |

자세한 매핑 근거: `docs/models.md` (벤치마크 + Anthropic 공식 + 커뮤니티 사례 11개 link).

---

## 시연 검증 시나리오 (Phase 1+2 종료 판정)

| 시나리오 | 검증 항목 |
|---|---|
| "안녕, 뭐 할 수 있어?" | PM 직접 답. 카탈로그 자동 주입으로 직원 명부 인지. |
| "README 단어 수만 알려줘" | PM → dev-1 또는 utility-1 spawn → done → PM 보고. |
| "README의 단어 수와 줄 수를 동시에 알려줘" | PM이 **동시 여러 spawn** 결정. 두 카드 동시 working. |
| "보드 파서에 .eml 지원 추가하려고 하는데 어떻게 해야 할까" | PM이 **dev-arch에 분석 위임** (아키텍처 일감). |
| "지금까지 작업한 거 정리해서 docs/handoff.md 만들어줘" | PM이 **planner-1에 위임**. |
| `회의: 보드 파서를 어떻게 진화시킬까?` | PM이 dev-1/planner-1/qa-1에 **동시 spawn** + 관점별 의견 통합. |
| utility-1 토글 off → 단순 일감 보내기 | PM 카탈로그에서 utility-1 빠짐 → PM이 본인 처리 또는 dev에 보냄. |
| sub 카드 클릭 | 모달에 metadata + model · tok · cost · 전체 output. |

7개 중 5+ 성공하면 Phase 1+2 종료 도장.

---

## 남은 라운드

### 1. 시연 검증 (사장 personal 시간)
위 시나리오 → 실패 시 PM 시스템 프롬프트 튜닝 (JSON live-reload, dev 재시작 불필요).

### 2. 토큰 최적화 2차 (선택)
- statusbar의 cache hit% 보고 효과 평가.
- 직원 시스템 프롬프트를 cache 친화적 prefix로 더 안정화.
- sub session prompt에서 불필요한 동적 부분 trim.

### 3. Phase 3 진입 (사장 결정 대기)
**`docs/phase3-plan.md` draft 작성됨** (`e5244e9`). 사장 결정 안건 4개 §끝:
- 진입 시점 (시연 직후?)
- 백엔드 우선순위 (Codex/Figma/Gemini 중 어느 거 먼저?)
- 누적 비용(PR5) Phase 3에 vs 별도
- 영속 read(PR6) 우선순위 — 시연 안전망으로 먼저 vs Phase 3 안에서

PR 후보: 다중 CLI 백엔드 추상화, dev-codex, dev-gemini, Figma MCP+designer-1, 누적 cost panel, sessions 영속 read.

---

## 환경 / 셋업

- Windows 11 + PowerShell. Bash는 git bash.
- Node 20.12.2, npm 10.5.0.
- `claude` CLI: `C:\Users\robocare\.local\bin\claude.exe`. Claude Max OAuth.
- `app/` Electron 33 + React 19 + Tailwind v4 + node-pty prebuilt + chokidar v5.
- `core/` standalone Node + vitest. 직원 정의 + PTY + spawn protocol + parser.
- `.git/config` local: `dongwon lee <ehddnjs5861@naver.com>` (personal). 회사 global과 분리.
- `.claude/settings.local.json` (.gitignore) — 회사 swap으로 minimal일 수 있음. 권한 막힘 시 `defaultMode: bypassPermissions` 또는 specific allow 추가.

---

## 새 세션 진입 절차

1. `README.md` + `CLAUDE.md` + 이 `docs/PROGRESS.md` + (필요시) `docs/models.md` / `docs/phase1-plan.md` / `docs/phase2-plan.md` / `docs/phase3-plan.md` 읽기.
2. 메모리 자동 로드 (`~/.claude/projects/.../memory/MEMORY.md`).
3. 마지막 commit `e280e63` 위에서 시작.
4. 사장 다음 지시 대기:
   - "시연하자" → `npm run dev` 띄우고 위 시나리오 안내.
   - "Phase 3 가자" → `docs/phase3-plan.md` draft 시작 (현재 미작성).
   - 새 직군/기능 → core/employees/ 또는 PR1~PR3 패턴 따라 작은 단위.
