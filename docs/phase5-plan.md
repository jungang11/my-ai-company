# Phase 5 — 분기 게임 사이클 (Plan)

> 사장이 회사를 게임처럼 운영. 카이로 (Game Dev Story / Manga Works) 분기 사이클 패턴을 payroll-os에 도입.
> 작성 시점: 2026-05-19 — Phase 4 완성 + 퍼포먼스 라운드 + Phase 5 PR1~2 polish 후.
> 상태: **draft, 사장 검토 대기**.

---

## 컨셉

사장 게임 사이클:
1. **분기 시작** — 사장이 분기 목표 설정 ("이번 분기: payroll-os Phase 6 인공지능 직원 추가"). 한 줄~한 단락.
2. **일감 흐름** — 사장이 평소처럼 PM에 메시지. PM은 분기 목표 인지 + 일감을 분기에 매핑.
3. **진척 시각화** — 사무실 화이트보드에 분기 목표 + 진척 표시. 직원 책상 위에 분기 누적 기여.
4. **분기 회고** — 사장이 "회고:" 명령 → PM이 분기 동안의 일감/직원별 기여/달성도 보고. planner-1 위임 + qa-1 평가.
5. **다음 분기** — 회고 끝에 사장이 다음 분기 목표 설정.

카이로 분기 ≠ 시간 단위(7일/30일). **사장이 선언**할 때 시작 + 종료. 본인 페이스.

---

## 데이터 model

**원칙**: 파일 기반 (CLAUDE.md 원칙 5 — 공유 상태는 파일로). SQLite 미도입 (sessions/done JSON로 충분).

```
workspace/
├── quarters/
│   ├── current.json          # 현재 분기 메타 (목표/시작 시점/적용된 sub-session ID 목록)
│   ├── 2026-Q2.json          # 종료된 분기 archive
│   ├── 2026-Q1.json
│   └── ...
├── sessions/<taskId>/done    # 기존 — 여기에 quarterId 필드 추가
```

### `current.json` 스키마
```json
{
  "quarterId": "2026-Q3",
  "title": "Phase 6 인공지능 직원 추가",
  "description": "ChatGPT/Gemini CLI 직원 도입 + 멀티 모델 비교 시연",
  "startedAt": 1716123456789,
  "sessionIds": ["taskId-1", "taskId-2", ...],
  "manualNotes": ""    // 사장이 분기 중 메모할 수 있는 영역
}
```

### `2026-Q2.json` (종료 분기) 스키마
```json
{
  "quarterId": "2026-Q2",
  "title": "...",
  "startedAt": ...,
  "endedAt": ...,
  "sessionIds": [...],
  "retrospective": "PM이 회고 시 생성한 통합 보고 (markdown)",
  "metrics": {
    "totalSpawns": 42,
    "totalTokens": 1200000,
    "byEmployee": { "dev-1": { "spawns": 12, "tokens": 300000 }, ... }
  }
}
```

### sessions/<id>/done JSON 확장
기존 metrics 외에 `quarterId` 필드 추가 — 어느 분기에 속한 작업인지.

---

## PR 분해 (작은 단위 우선)

### PR1 — `core/quarters` 모듈 + `workspace/quarters/current.json` (S)
- `core/quarters/storage.ts`: load/save 분기 파일
- `app/src/main/quarters.ts`: IPC handler (currentQuarter / startQuarter / endQuarter)
- preload + 타입 (`shared/ipc.ts`에 QuarterMeta 추가)
- 기본 분기 자동 생성 (앱 처음 시작 시 "Untitled Q1" default)

### PR2 — 분기 시작/종료 UI (M)
- header에 현 분기 표시 (`Q3 · Phase 6 인공지능 직원…`)
- "분기 시작" 버튼 → 모달 (title/description 입력)
- "분기 회고" 버튼 → PM에게 `회고: <quarterId>` 자동 메시지 → planner-1 + qa-1 spawn → 통합 보고
- 회고 완료 시 자동으로 archive + 새 분기 시작 모달

### PR3 — PM 시스템 프롬프트 분기 인지 (S)
- pm.json에 분기 인지 섹션 추가: "현재 분기 정보는 사장 메시지 시 시스템에서 자동 inject. 일감을 분기 우선순위와 매핑해서 분배."
- App.tsx의 send 함수에서 currentQuarter context를 system 메시지로 enqueue (PM이 idle 시 흡수)
- PM은 일감 받을 때 "이 일감은 현 분기 목표와 align하나" sanity check 1줄 추가

### PR4 — 사무실 화이트보드에 분기 목표 표시 (S)
- 현 Whiteboard.tsx는 정적 dot. 갱신:
- 분기 title을 1~2줄로 표시 (텍스트 글자 sprite — 진짜 글자는 svg `<text>`로 작은 폰트)
- 진척 bar (sessionIds 개수 기반 또는 직접 percent)
- 분기 시작/회고 모달에서 사장이 입력 → 화이트보드에 반영

### PR5 — 직원 책상 위 분기 누적 (S)
- DeskSprite에 분기 누적 spawn count 작은 dot으로 표시 (책상 모서리에 점 N개)
- 또는 이름표에 "Lv N · 분기 3건"
- 분기 archive 시 reset, 새 분기 0부터

### PR6 — `회고:` prefix 자동 통합 보고 (M)
- App.tsx에서 사장 메시지 `회고:` 감지 → PM에게 "현 분기 회고 진행" 컨텍스트 + sessionIds 전체 전달
- PM이 planner-1(분기 동안의 일감 요약)+qa-1(달성도 평가) 동시 spawn
- 통합 보고 → 사장 채팅 + quarters/<id>.json의 retrospective 필드 저장
- 회고 후 archive + 새 분기 입력 모달 자동 띄움

### PR7 — UsagePanel에 분기 컬럼 (S)
- 기존 누적 → 현 분기 누적으로 변경 (또는 둘 다 표시 토글)
- 분기 archive 후 historical 분기 선택 보기 가능

### PR8 — 분기 archive 모달 (전체 분기 history) (M)
- header "분기 history" 버튼 → 모달
- 분기별 카드 (title / startedAt / endedAt / 일감 N건 / 직원별 기여 / 회고)
- 카이로 톤 (테이블 → 카드 형태)

---

## 리스크 + 대안

| 리스크 | 대안 |
|---|---|
| PM이 분기 컨텍스트 매번 받으면 토큰 증가 (cache 깨짐) | currentQuarter title만 system inject, sessionIds는 PM에 안 보냄 |
| 회고가 너무 길어지면 sub-agent 토큰 비대 | sessionIds를 N건씩 chunk 분할 + 단계별 통합 |
| 사장이 분기 종료 잊으면 무한 누적 | 90일 경과 시 header에 amber 경고 |
| 분기 데이터 손상 시 historical 잃음 | quarters/*.json은 archive only — write-after-read 패턴, current.json만 mutable |

## 의도적 제외

- **자동 분기 종료** — 사장이 명시적으로 선언. 시간 기반 자동 X (카이로식 페이스 보존).
- **직원 KPI/성과 평가** — 분기 회고로 충분. 별도 평가 시스템 X.
- **분기 목표 자동 추천** — 사장이 결정. PM이 추천 1개 정도는 가능하지만 자동 X.
- **외부 calendar 연동** — 로컬 only.

---

## 사장 결정 안건

1. **분기 단위 명명** — `2026-Q3` (calendar) vs 자유 ("payroll-os Phase 6 라운드") vs 둘 다? 권장: **자유 (사장이 title 결정, quarterId는 내부 timestamp 기반)**.
2. **PR 진행 순서** — PR1/PR2/PR3 (인프라+UI+PM) 한 묶음 vs 분리? 권장: PR1 → PR2 → PR3 순차, 각 commit 후 사장 검증.
3. **PR4~PR5 시각화 도입 시점** — PR1~3 안정화 후 vs 동시? 권장: PR1~3 후 (visual은 데이터 model 안정 위에).
4. **회고 모드 UX** — 사장이 `회고:` 메시지 보내는 방식 vs 별도 버튼? 권장: **둘 다 지원** (prefix 자동 감지 + 명시 버튼).

---

## 다음 단계

사장 검토 후:
- 안건 1~4 결정 통보 (또는 본인 추천 OK)
- PR1부터 진행 (`core/quarters` + `workspace/quarters/current.json` 인프라)
