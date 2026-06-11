# 진행 현황 (세션 인수인계)

> 새 세션에서 이 파일을 처음 읽고 바로 작업 이어갈 수 있도록 한 페이지로 정리한 진행표.
> 갱신 시점: 2026-06-11 — **구독 역전 라운드** (섹션 M): 인건비표 개편 + PR5 한도 알림 + landscape.md + 패키징 spike + Fable 5 벤치 준비 + 비밀정보 위생.

## ⚠️ 구독 상황 (2026-06-11 확정 — 기존 가정 폐기)

- **Claude Max 5x ($100) 결제.** ~6/22까지 **Claude Fable 5** 사용 가능 (이후 일반 구독 제외, usage credit 종량제 전환, 복귀 미정). 6/23부터 주력 = **Opus 4.8**.
- **ChatGPT: 6/22까지 Pro → 6/23부터 Plus($20).** Codex 한도 축소 — 다발 spawn 불가, **qa-1 단일 직원**으로만 운용.
- **~6/22 = Fable 5 윈도우**: payroll-os 진척 + BenchmarkPanel에 fable-5 기준점 데이터 남기기 (6/23 이후 opus-4-8 회귀 보정의 비교 기준).
- 옛 가정("Claude 다운그레이드 + GPT Pro 유지")에 기반한 결정들 — model-routing-plan 사장 결정 3(`pm-claude-rest-gpt` 첫 시연)·4(utility=Spark), models.md 직군 매핑 표 — 는 **폐기/강등**. 현행 ground truth는 `core/catalogs/mix-optimal.json`.

---

## 한 줄 요약

**Phase 1~5 full + model-routing PR1~3·PR5(한도 알림) + BenchmarkPanel(채점 시 PM 모델 자동 기록) + 인건비표 개편 + landscape.md + electron-builder spike 통과**. 주력 catalog = 수정판 `mix-optimal`: PM=`claude-fable-5`(~6/22, 이후 opus-4-8로 수정 필요), dev-1/planner-1=sonnet(한도 보호), qa-1=codex(openai 단일), dev-arch=opus-4-8, utility=haiku. catalog에 `assumes`/`validUntil` 메타데이터 + CatalogSwitcher stale 배지. `pm-claude-rest-gpt`/`gpt-only`는 ChatGPT Pro 전제라 비상용 강등. codex 인증 token single-use 이슈 — 매 logout/login 필요할 수 있음.

---

## 누적 commit (origin은 `1435932`까지 push 완료 — 88개 적체 해소 확인 2026-06-11. 이번 라운드만 ahead)

```
c19f565 chore: workspace gitignore를 deny-all + board.md 예외로 전환 (위생 라운드)
bbda5f7 core+app: benchmark 채점에 PM 모델 자동 기록 — Fable 5 기준점 준비
783c8c5 app+chore: electron-builder 패키징 spike — node-pty unpack 검증 통과
8d35c62 docs: landscape.md — 유사 오케스트레이터 8종 조사 + 공개 포지셔닝
e69ad48 app: model-routing PR5 — Claude 한도 임계 알림 (거친 휴리스틱)
133a0b7 core+app: 인건비표 개편 — Fable 5 윈도우 + ChatGPT Plus 다운그레이드 반영
─── 여기까지 2026-06-11 라운드 (미push) / 아래는 push 완료 ───
1435932 app: StatusBar 현 분기 cost 추가 (Q $X.XXXX amber)
3f34011 app: 종료 카드 1줄 압축 + 4개 cap + 더보기 토글 (사장 폴리시)
6cb2712 app: BenchmarkMatrix — catalog × scenario history grid 모달
55cdc78 app: 직원 명부 카드에 vendor chip 추가 (C/G 1글자 + tooltip)
60ea3c1 core+app: BenchmarkPanel history — 점수 누적 + 시간별 추이 (최근 10개)
4f3f54b core+app: BenchmarkPanel 점수 추적 (✅/△/✗ + 영속 + catalog별)
71a6808 app: BenchmarkPanel 모달 — 시연 시나리오 11개 클릭 spawn
1d9a85c core: karpathy 4원칙 PR self-review 직원 5명 .md 임베드 (퍼포먼스 PR6)
9fc613d app: PR3b fix — codex JSONL parser 강화 + sandbox 권한 + 인증 에러 안내
34f0d69 app: model-routing PR3b — Codex CLI 실제 spawn (stub → 실 구현)
bd3382f app: StatusBar에 catalog 표시 추가 (사장 시연 피드백)
7920e48 core+app: model-routing PR3a — vendor 분기 spawn + catalog PM 통지 (codex stub)
304fd4e chore: workspace/quarters + active-catalog.json gitignore
c1f33b3 fix: catalogs/quarters handlers projectRoot path (4→3단계)
428f7c8 core+app: model-routing PR2 — catalog preset 시스템 (4 preset + override + CatalogSwitcher UI)
5801d48 core+app: model-routing PR1 — vendor 추상화 (anthropic/openai)
672cef6 docs: karpathy 4원칙 skill + model-routing-plan draft + PROGRESS/CLAUDE.md sync
097e741 docs: Phase 5 stable 도장 — README/CLAUDE.md/phase5-plan sync + 구현 회고
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

### J. 모델 vendor 전환 + karpathy skill (2026-05-19) — 사장 안건 리서치

사장 안건: Claude Pro 다운그레이드 + GPT Pro 유지 가정. 모델 vendor 토글 + GPT/Codex 직군 매핑 + 토큰 추적.

**리서치 산출**: `docs/skills/karpathy-coding-discipline.md` (stable, MIT import) + `docs/model-routing-plan.md` (approved 2026-05-19, 사장 결정 안건 4개 통보 완료).

**사장 결정** (model-routing-plan):
1. GPT 인증 = **OAuth only** (ChatGPT Pro 구독, API key X)
2. PR 순서 = **순차** (PR1 → PR2 → ...)
3. 첫 시연 catalog = **`pm-claude-rest-gpt`** (PM Claude + 나머지 GPT)
4. utility-1 = **Spark + 5.4-mini fallback**

### K. Model Routing PR1~3 + BenchmarkPanel 자동 시연 + 점수 추적 (2026-05-19~21)

**PR1 vendor 추상화** (`5801d48`):
- `shared/ipc.ts` Vendor type + EmployeeProfile.vendor field
- `core/employees/*.json` 6개에 `"vendor": "anthropic"` 추가
- systemPrompt 무변경 → cache hit 보존

**PR2 catalog preset 시스템** (`428f7c8`):
- `core/catalogs/` + types/loader/4 JSON preset (`claude-only`/`gpt-only`/`pm-claude-rest-gpt`/`mix-optimal`)
- override 패턴: 직원 JSON 무변경 + catalog만 vendor/model/effort 덮어씀
- `workspace/active-catalog.json` 영속
- CatalogSwitcher UI (EmployeeRoster 하단 dropdown, 각 카드에 직원별 vendor chip)
- IPC 3채널 (list/active/setActive)

**bug fix** (`c1f33b3` + `304fd4e`):
- catalogs/quarters handlers projectRoot 4→3단계 ('../../../..' → '../../..'). 다른 main 파일들과 일관성
- stale `E:/Personal/workspace/quarters/` 데이터 cleanup
- workspace/quarters + active-catalog.json gitignore

**StatusBar catalog 표시** (`bd3382f`):
- `model` (마지막 응답 emerald) / `catalog` (활성 sky) / `분기` (amber) 분리
- 사장 시연 피드백: catalog 변경 즉시 인지 가능

**PR3a vendor 분기 spawn + PM 자동 통지** (`7920e48`):
- spawn/runner.ts: loadEmployee → manager.getEmployee (catalog override 자동 적용)
- runSubSession에 vendor 분기 (openai → runCodexSession)
- catalog setActive 시 PM에 enqueueSystemMessage — vendor 매핑 표 + spawn 패턴 (Task tool vs Write spawn-request)
- pm.json (5030 → 6006자): Vendor 인지 섹션

**PR3b Codex CLI 실 subprocess** (`34f0d69` + `9fc613d`):
- stub → `spawn('codex', ['exec', '--json', '--color', 'never', '--skip-git-repo-check', '-s', 'workspace-write', '--dangerously-bypass-approvals-and-sandbox', '-C', root, '-o', lastMsg])`
- stdin: 직원 systemPrompt + 사장 일감 결합
- handleCodexLine: type 필드 dispatch (thread.started/turn.started 숨김, error/turn.failed 안내, message/delta/item 추출)
- 인증 에러 패턴 감지 시 자동 안내 (codex logout → login)

**known issue**: codex 인증 토큰이 single-use refresh — 한 번 만료 후 logout/login 필요. 본인 (claude) Bash 환경에서 직접 호출은 사장 환경의 token cache 접근 X.

**퍼포먼스 PR6 karpathy 임베드** (`1d9a85c`):
- 직원 5명 .claude/agents/*.md에 PR self-review 4줄 체크리스트 (Think/Simplicity/Surgical/Goal-Driven)
- 다음 시연에서 결과 품질 ↑ (codex 환각 방지)

**BenchmarkPanel 자동 시연** (`71a6808`):
- docs/benchmark.md S1~S11 TS 상수 정착
- EmployeeRoster 하단 "시연 시나리오 →" 버튼 → 모달 → 카드 클릭 → PM 자동 전송
- 카테고리별 색 (단순/코드/분석/검증/회의/함정/직접답/분기)

**점수 추적** (`4f3f54b`):
- `core/benchmarks/storage.ts` + IPC 2채널
- 카드 옆 ✅/△/✗ 토글 + 평가 timestamp
- `workspace/benchmark-results.json` 영속 (key = scenarioId::catalogId — catalog별 분리)
- header에 합계 ("5/11 평가됨, ✅ 3 / △ 1 / ✗ 1")

### M. 구독 역전 라운드 (2026-06-11, 사장 브리핑 일괄 지시)

상단 "구독 상황" 참조. 8단계 지시 전부 완료:

- ✅ **인건비표 개편** (`133a0b7`) — 직원 JSON(dev-1/planner-1 sonnet, pm 기본 opus-4-8) + `.claude/agents` frontmatter(dev-1/planner-1 → sonnet) + catalog 4종 개편. **mix-optimal이 주력** (PM=fable-5 ~6/22 / qa-1=codex 단일). `pm-claude-rest-gpt`·`gpt-only` 비상용 강등. Catalog 타입에 `assumes`/`validUntil` + `isCatalogStale()` + CatalogSwitcher stale 배지 + `core/catalogs/presets.test.ts`. **pm-runner가 catalog override를 PM 본인에게도 적용**하게 수정 (이전엔 pm.json 직접 read라 pm override가 장식이었음 — vendor=openai override는 claude CLI 전용이라 가드).
- ✅ **PR5 한도 임계 알림** (`e69ad48`) — `app/src/main/quota-alert.ts`. 정확한 사용률(%)이 stream-json에 없어 rate_limit_event **status 전이(allowed_warning/limited)** 를 80% 임계 대용으로 사용. (type, status, reset 윈도우)당 1회 dedupe → PM enqueueSystemMessage. PR4(정밀 추적)는 후순위로 역전.
- ✅ **landscape 리서치** (`8d35c62`) — `docs/landscape.md`. OMC/OMX/OMH/Conductor/Vibe Kanban/Claude Squad/Multiclaude/Gas Town + 공식 Agent Teams. 결론: Conductor 자리(구독 BYO + GUI)가 Windows 공석 + 공식 Agent Teams는 tmux 전제로 Windows 락아웃 → 우리 포지션 유효. **worktree 격리만 전 경쟁자 표준인데 우리 결여** (도입 검토 1순위).
- ✅ **패키징 spike** (`783c8c5`) — electron-builder `--dir` 통과 + win-unpacked 부팅 7초 smoke OK. 발견: ① prebuilt-multiarch가 Electron ABI 바이너리 동봉이라 **@electron/rebuild 불필요** (`npmRebuild: false` + asarUnpack으로 충분 — 예상한 최대 난관이 무난). ② electron-builder 26.x의 @noble/hashes v2 ESM 충돌 → package.json overrides로 v1 고정. ③ **진짜 난관은 리소스 경로**: packaged 앱의 projectRoot(`../../..`)가 resources/를 가리켜 core/employees·.claude/agents·workspace 접근 불가 → extraResources + userData 이전 전략 별도 PR 필요. ④ 현재 app/src는 node-pty 미사용 (Phase 1 유산은 core/pty에만 — PM은 child_process).
- ✅ **benchmark Fable 5 준비** (`bbda5f7`) — BenchmarkResult에 `model` 자동 기록 (실측 snapshot 우선) + history tooltip 표기. `claude --model claude-fable-5` ping 검증 OK. 활성 catalog를 mix-optimal로 사전 설정 완료 — **사장이 `npm run dev` 후 BenchmarkPanel에서 S1~S11 돌리면 fable-5 기준점 적재됨**.
- ✅ **비밀정보 위생** (`c19f565`) — 히스토리 전수 스캔: 토큰 패턴(sk-ant/ghp_/Bearer 등) 0건, .env/settings.local.json 커밋 이력 없음. 유일 노출은 c1f33b3의 `workspace/quarters/current.json`(분기 메타뿐, 무해 — rewrite 불필요). gitignore를 `workspace/*` + `!workspace/board.md` deny-all로 전환 + `app/dist-builder/` + `.omc/` 추가. 공개 시 commit author personal email(naver) 노출은 의도된 identity로 판단.

### N. 다음 라운드 후보 (사장 결정 안건)
- **6/23 전환 작업** — mix-optimal에서 PM을 `claude-opus-4-8`로, **qa-1을 `gpt-5.3-codex`(Plus)로** 수정 (stale 배지가 6/23부터 자동 표시됨) + fable-5 vs opus-4-8 benchmark 비교. (qa-1은 Pro 주간 한정 `gpt-5.5`로 운용 중 — 2026-06-11 사장 지시)
- **프로젝트 경로 인식 ("출근 경로")** — 사장 비전 (2026-06-11): 터미널처럼 앱이 임의 프로젝트 폴더를 골라 PM/직원을 그 cwd로 spawn → 프로젝트별 CLAUDE.md/AGENTS.md 지침 자동 적용. StatusBar에 경로/프로젝트 표시 (codex statusline처럼). **packaged 리소스 전략 PR과 본체가 동일** (projectRoot=앱 리소스 vs workDir=작업 대상 분리)이라 묶어 진행 추천.
- **packaged 리소스 전략 PR** — extraResources(core/.claude) + workspace→userData 이전 + NSIS 인스톨러 + `app.setLoginItemSettings` 부팅 자동 시작. spike에서 경로 문제 확인됨.
- **worktree 격리 도입 검토** — landscape 결론 1순위 기술 부채.
- **PR4 vendor별 토큰 추적 + StatusBar vendor 2줄** — 사장 비전 (2026-06-11): 하단바에 Claude/GPT 각각 구독 플랜·세션 토큰·5h/7d 사용량·리셋 날짜. Claude 쪽 7d는 rate_limit_event 파싱 확장으로 즉시 가능, GPT 쪽은 codex JSONL의 token/rate limit 이벤트 스키마 확인 필요 (사장 시연 raw output 의존). 플랜 이름은 catalog assumes 연동.
- **분기 archive export/import** — 두 PC 장부 분리(동기화 안 함) 보완용 단방향 이동.
- **오픈소스 준비 잔여** — README 영문 병기 구조 + 스크린샷/GIF 슬롯 + LICENSE(MIT) + NOTICE.
- **외부 CLI 재개 — Gemini/Figma** — Codex 통합 패턴 재사용.
- **회의 발언 풍선 정밀화 / Witness 패턴(stuck 직원 감지·재spawn)** — polish 안건.

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
3. 마지막 commit 위에서 시작 (`git log --oneline -5`). 워킹트리 clean 확인. origin은 `1435932`까지 push 완료 — 이후 라운드만 미push.
4. **날짜 확인**: 6/23 이후 첫 세션이면 mix-optimal PM을 `claude-opus-4-8`로 수정 (N 섹션 "6/23 전환 작업") — CatalogSwitcher에 stale 배지 뜨는 게 신호.
5. 사장 다음 지시 대기:
   - "benchmark 시연 결과" → fable-5 기준점 vs 이후 점수 비교 (`workspace/benchmark-results.json`의 model 필드) + 회귀 시 시스템 프롬프트 보정.
   - "패키징 마저 가자" → N 섹션 packaged 리소스 전략 PR (extraResources + userData + NSIS + 자동 시작).
   - "공개 준비 가자" → landscape.md 포지셔닝 + N 섹션 오픈소스 잔여.
   - **시각 영역 작업** → 해당 `docs/skills/<name>.md` 먼저 읽고 패턴 따름.
   - "Gemini/Figma 들어왔어" → Codex 통합 패턴 재사용 (`app/src/main/spawn/`).
   - 다른 안건 → 작은 단위로 분해 후 진행.
