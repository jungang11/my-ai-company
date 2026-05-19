# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-05-19 — Phase 5 PR1~14 + 퍼포먼스 PR4~5 + audio-design skill research-complete (사장 시연 대기).

---

## 한 줄 요약

**Phase 1/2/3 부분/4(PR2.9까지) + Phase 5 시작(PR1~2) + 퍼포먼스 라운드(PR1~3, 시스템 프롬프트 강화 + benchmark)**. 사장 코스: 게임 polish → 업무 퍼포먼스 강화로 전환. PM 시스템 프롬프트에 위임 결정 표 + case 예시 + sanity check 추가, 직원 5명 .md에 자체 검증 강제 + 결과 형식 통일. `docs/benchmark.md` 시연 시나리오 8개 — 사장이 직접 시연해 정확도 측정 필요. 다음 라운드는 사장 시연 결과 → 회귀 보정 / PR4 메트릭 추적 / Phase 5 후속 비전 중 결정 대기.

---

## 누적 commit (push 가능 단위, origin 보다 74 ahead)

```
ab9c0c3 app+core: PR13/PR14/퍼포먼스 PR5 묶음 (Zones rose / 사장 자리 / planner+qa 회고 가이드)
5762d97 app: Phase 5 PR12 — 회고 모드 시각 cue 분리 (회의 emerald / 회고 rose)
7aeae31 core: PM 시스템 프롬프트 sanity check 패턴 강화 (퍼포먼스 PR4)
febe016 docs: benchmark.md 확장 — 분기 사이클 시연 시나리오 S9~S11
47d4bce docs+app: audio-design skill research-complete + Phase 5 PR11 화이트보드 pulse
ee39c42 app: Phase 5 PR10 — 회의 모드 풍선 정밀화 (실제 일감 풍선 우선)
58e79bf core+app: Phase 5 PR9 — 회고 결과 영속화 (분기 archive에 retrospective)
87109e1 app: '최근 종료' EmployeeCard compact 모드
d7299e3 docs: PROGRESS.md sync — Phase 5 PR1~8 완성 반영
67e0677 app: Phase 5 PR8 — QuarterPanel 분기 archive history 섹션
26de49a app: Phase 5 PR7 — UsagePanel 분기 scope 토글 (전체/현 분기)
5eccb29 core+app: Phase 5 PR6 — 회고: prefix 자동 처리 (분기 정보 augment + meetingMode)
5f363e0 core+app: Phase 5 PR5 — 직원 분기 누적 + sessionIds 자동 append
02bdda4 app: Phase 5 PR4 — 사무실 화이트보드에 분기 목표 + 진척 bar
aa10c67 core+app: Phase 5 PR3 — PM 분기 인지 + 분기 시작 시 자동 시스템 메시지
ce531a7 app: Phase 5 PR2 — 분기 시작 UI (StatusBar 표시 + QuarterPanel 모달)
76e3948 core+app: Phase 5 PR1 — quarters 인프라 (storage + IPC + preload, UI는 PR2)
b61708a docs: Phase 5 분기 게임 사이클 plan (draft, 사장 검토 대기)
8614399 docs: PROGRESS.md sync — Phase 5 PR1~2 + 퍼포먼스 라운드 PR1~3 반영
fc65c8d docs: benchmark.md — 직원 퍼포먼스 검증 시연 시나리오 (퍼포먼스 PR3)
7465e12 core: 직원 5명 .claude/agents 강화 — 자체 검증 + 결과 형식 통일 (퍼포먼스 PR2)
8c043eb core: PM 시스템 프롬프트 강화 — 위임 결정 표 + case 예시 + sanity check (퍼포먼스 PR1)
d759313 app: Phase 5 PR2 — 직원 성장 (이름표 Lv 표시, spawn/tokens 누적)
465fb02 app: Phase 5 PR1 — sub-agent ↔ 풍선 텍스트 연동 (일감 실시간 표시)
5b4bd50 docs: PROGRESS/README/CLAUDE.md/skill sync — Phase 4 PR2.6~2.9 반영
9101ce1 app: Phase 4 PR2.9 — 시간 흐름 overlay (아침/낮/노을/밤 자동 + 수동 토글)
b045bc8 app: Phase 4 PR2.8 — 사장 캐릭터 추가 (white suit, 입구 옆 default)
e874d39 app: Phase 4 PR2.7 — walk cycle (회의실 이동 시 어깨 bobbing+rotate)
9fdf467 app: Phase 4 PR2.6 — 회의 모드 머리 위 말풍선 (PM 발언 / 나머지 청취)
e717c16 docs: README/CLAUDE.md sync — Phase 4 도장 + skill 시스템 원칙
48dd1bd docs: PROGRESS.md sync — Phase 4 픽셀 사무실 진입 + skill 시스템 반영
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
- ✅ **PR2.5** (`54bd9c2`) — skill 본문 stable 도장 + 1차/PR2.1~2.4 회고 정리
- ✅ **PR2.6** (`9fdf467`) — 회의 모드 머리 위 말풍선: PM `💬` 발언 / 나머지 `···` 청취 (animate-pulse)
- ✅ **PR2.7** (`e874d39`) — walk cycle: meetingMode 전환 700ms 동안 어깨 bobbing+rotate (CSS keyframe, sprite sheet 도입 보류)
- ✅ **PR2.8** (`b045bc8`) — 사장 캐릭터 (white suit/gray hair) 입구 옆 default, 회의 모드 시 회의실 합류
- ✅ **PR2.9** (`9101ce1`) — 시간 흐름 overlay: 시스템 시간 자동(1분 polling) + manual override 토글 (🌅 아침/☀ 낮/🌇 노을/🌙 밤, mix-blend multiply)

### G. Phase 5 시작 (2026-05-19) — 사장 "F로 가자" 일괄 OK
- ✅ **PR1** (`465fb02`) — sub-agent ↔ 풍선 텍스트 연동. roster.row.prompt 첫 줄 16자 truncate → 사무실 캐릭터 머리 위 풍선 실시간 표시 (회의 모드는 💬/··· 풍선 우선)
- ✅ **PR2** (`d759313`) — 직원 성장. roster 누적 spawn/tokens → 5단계 Lv 이름표 옆 표시. PM 고정 Lv5, Boss undefined

### H. 퍼포먼스 라운드 (2026-05-19) — 사장 "퍼포먼스가 더 잘나와야해" 코스 전환
Phase 5 게임 polish 잠시 멈춤 + 업무 퀄리티 강화로 전환.

**진단 결과**:
- Task tool model enum 한계 (dev-1/dev-arch/planner-1 셋 다 'opus') — 시스템 프롬프트가 유일 차별화 수단
- effort Task tool에 전달 안 됨 — sub-agent default
- 사장 시연 부족 — utility-1만 검증됨, dev/planner/qa 결과 미평가
- PM 위임 기준 모호 — dev-1 vs dev-arch 경계 추상
- 직원 자체 검증 약함 — typecheck/test 강제 X

**구현**:
- ✅ **PR1** (`8c043eb`) — PM 시스템 프롬프트 강화: 위임 결정 표 + case 예시 6개 + sanity check + 절대 금지 (2200→3360자)
- ✅ **PR2** (`7465e12`) — 직원 5명 .claude/agents/*.md 강화: 결과 형식 통일 + 짐작 금지 강제 + 자기 영역 회부
- ✅ **PR3** (`fc65c8d`) — `docs/benchmark.md` 시연 시나리오 8개 (5직군 + 회의 + 함정 + PM 직접 답)

**다음 단계**: 사장이 benchmark.md 시나리오 직접 시연 → 정확도 점수 → 회귀 보정 또는 PR4 (UsagePanel 평가 메트릭 컬럼).

### I. Phase 5 분기 게임 사이클 PR1~14 + 퍼포먼스 PR4~5 + audio skill (2026-05-19)

사장 OK "쭉 진행" 반복으로 일괄 자율. typecheck/build 모두 통과. 사장 직접 시연 미진행:

**Phase 5 PR1~14**:
- ✅ PR1 (`76e3948`) — `core/quarters/` 인프라
- ✅ PR2 (`ce531a7`) — StatusBar 분기 표시 + QuarterPanel 모달
- ✅ PR3 (`aa10c67`) — PM 분기 인지 + 자동 시스템 메시지
- ✅ PR4 (`02bdda4`) — Whiteboard 분기 title + 진척 bar
- ✅ PR5 (`5f363e0`) — sessionIds 자동 append + 이름표 분기 건수
- ✅ PR6 (`5eccb29`) — `회고:` prefix + 분기 정보 augment + PM 회고 모드
- ✅ PR7 (`26de49a`) — UsagePanel scope 토글
- ✅ PR8 (`67e0677`) — QuarterPanel archive history
- ✅ PR9 (`58e79bf`) — 회고 결과 영속화 (archive retrospective 자동)
- ✅ PR10 (`ee39c42`) — 회의 모드 실제 일감 풍선 우선
- ✅ PR11 (`47d4bce`) — 분기 변경 시 Whiteboard 3초 amber pulse cue
- ✅ PR12 (`5762d97`) — 회고 모드 시각 cue 분리 (회의 emerald / 회고 rose)
- ✅ PR13 (`ab9c0c3`) — Zones 회고 색 분리
- ✅ PR14 (`ab9c0c3`) — 사장 캐릭터 회의 자리 정밀화 (PM과 대면)

**퍼포먼스 라운드 PR4~5**:
- ✅ PR4 (`7aeae31`) — PM sanity check 패턴 (hedging/검증 누락/형식/위임 mismatch/raw forward/자기 점검)
- ✅ PR5 (`ab9c0c3`) — planner-1/qa-1 .md에 회고 모드 가이드 (결과 형식/짐작 금지/분기 정보 인용)

**skill 시스템 2번째 영역**:
- ✅ audio-design skill (`47d4bce`) — agent 리서치 645줄, status research-complete. Phase 6+ 도입 안건.

기타: `87109e1` EmployeeCard compact (사장 피드백), `febe016` benchmark.md S9~S11 분기 사이클 시나리오 확장.

### J. 다음 라운드 후보 (사장 결정 안건)
- **사장 시연** — `docs/benchmark.md` S1~S11 + 분기 사이클(시작/회고/archive) 흐름 검증
- **audio 실제 도입** — 사장 audio 패스 결정. 다음 사장 결정 변경 시 PR1~3 도입.
- **외부 CLI 재개** — Codex/Gemini/Figma 구독 시점에 phase3-plan PR1부터
- **push 일괄 처리** — personal swap 후 75+ commit push
- **시연 자동화 도구** — benchmark 클릭 한 번 spawn (큰 PR)
- **Phase 6 비전** — 사장 통보 시

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
3. 마지막 commit `ab9c0c3` 위에서 시작. 워킹트리 clean 확인.
4. 사장 다음 지시 대기:
   - **시각 영역 작업** → 해당 `docs/skills/<name>.md` 먼저 읽고 패턴 따름. 없으면 작은 PR 후 사장 검토 → 깊이 필요하면 skill 신규.
   - "Phase 4 더 가자" → 회의 말풍선 / walk cycle / 사장 캐릭터 / 시간 흐름 중 사장 통보.
   - "Codex/Gemini 들어왔어" → `docs/phase3-plan.md` PR1(다중 CLI 백엔드 추상화)부터.
   - "시연 검증 결과" → C 섹션의 시연 시나리오 안내.
   - "push 가능" → personal GitHub Desktop swap 확인 후 일괄 push (74개).
   - "benchmark 시연 결과" → `docs/benchmark.md` 점수 정리 + 회귀 시 시스템 프롬프트 보정.
   - 다른 안건 → 작은 단위로 분해 후 진행.
