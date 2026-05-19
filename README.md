# payroll-os

> AI agents you employ. Stop paying, they quit.

개인용 AI 오케스트레이터. 본인이 가진 AI 구독들(Claude Max, ChatGPT, Gemini, Figma 등)을 "직원"으로 추상화하고, 사장처럼 일을 분배·조율하는 데스크톱 앱.

## 한 줄 컨셉

> "내 컴퓨터는 사무실, 내가 켠 CLI들은 직원들, 나는 사장."

## 왜 만드는가

지금은 채팅 세션을 옮겨다니면서 직접 복붙으로 결과물을 전달하고 있음. 이걸 자동화해서 직원들끼리 알아서 협업하게 하고, 사장(나)은 게시판과 채팅방만 보면 되는 구조로 만들고 싶음.

## 핵심 메타포

| 현실 세계 | payroll-os | 구현 |
|---|---|---|
| 구독 결제 | 고용 계약 | `core/employees/<id>.json` |
| 결제 중단 | 직원 퇴사 (비활성화) | 좌측 명부 체크박스 토글 |
| 구독료 | 인건비 | UsagePanel 직원별 토큰/duration 누적 |
| 출근 | CLI 세션 spawn | PM child_process / sub-agent Task tool |
| 퇴근 | CLI 세션 종료 | exit 후 카드 "최근 종료"로 이동 |
| 인수인계 / 게시판 / 슬랙 | (PM 단일 채팅으로 회수) | Phase 2 시연 후 board/chat/handoff 디렉토리 제거 |
| 작업 로그 | 영속 디렉토리 | `workspace/sessions/<taskId>/{output.log, done}` |

> 초안에는 `workspace/board.md` 칸반 + `workspace/chat/` 채널 + `workspace/handoff/` 마크다운으로 직원 간 통신을 명시했으나, Phase 2 본질 시연 후 **PM의 Task tool 호출 + 단일 채팅**으로 회수. 사장이 보는 GUI는 PM 채팅 + 좌측 사이드바 카드 + 하단 statusbar 3종.

## 직원 직급 (실제 회사 구조)

| 직군 | 이름 | 모델 | 역할 |
|---|---|---|---|
| PM | 박PM | `claude-opus-4-7` (xhigh) | 사장 직통, Task tool로 분배 + 통합 보고 (항상 활성) |
| 개발자 (일상) | 김개발 (dev-1) | `opus` | 일상 코드 작성·리팩토링 |
| 개발자 (어려움) | 박아키 (dev-arch) | `opus` | 아키텍처·race·security |
| 기획자 | 이기획 (planner-1) | `opus` | 분석·리서치·문서 |
| QA | 정검증 (qa-1) | `sonnet` | 검증·리뷰·회귀 |
| 잡일 | 막내 (utility-1) | `haiku` | 분류·추출·포맷·짧은 요약 |

직군 정의는 `core/employees/<id>.json` (메타데이터) + `.claude/agents/<id>.md` (claude의 정통 sub-agent 정의). 좌측 명부에서 PM 외 5명은 활성/비활성 토글 가능. Task tool model 한계로 `opus-4-6`/`opus-4-7` 세분화는 sub-agent에서 불가능 — 외부 CLI 백엔드(Codex/Gemini) 도입 시에만 유효 (Phase 3 보류).

## 핵심 제약

1. **Anthropic API 직접 호출 금지.** Claude Max $100은 Claude Code CLI subprocess 호출로만 사용. 2026년 3월 leak 이후 정책 변경으로 서드파티 하네스에서 직접 API를 찌르려면 종량제 결제가 필요해짐.
2. **모든 직원은 CLI subprocess.** API 키 다루는 부분 없음. 직원 = 본인 컴퓨터에 설치된 CLI 도구의 인스턴스.
3. **공유 상태는 파일로.** 직원들은 어차피 파일 읽고 쓰는 게 본업이라, 별도 API 만들지 말고 마크다운/SQLite로 통신.
4. **GUI는 모니터링용.** 직원들이 일하는 걸 보는 창이지, 직원들이 GUI를 거쳐서 일하는 게 아님.

## 디렉토리 구조 (실제)

```
payroll-os/
├── app/                          # Electron 33 + React 19 + Tailwind v4
│   ├── src/main/
│   │   ├── employee/             # PM 시스템 프롬프트 + pm-runner
│   │   ├── spawn/                # 외부 CLI 직원용 file-watcher fallback (Phase 3)
│   │   ├── sessions/             # sub-agent output 영속 read/write
│   │   ├── status.ts             # 토큰/cache/cost/rate limit 추적
│   │   └── index.ts
│   ├── src/preload/              # contextBridge IPC 노출
│   ├── src/renderer/             # React UI (Chat / EmployeeRoster / StatusBar / UsagePanel)
│   └── src/shared/ipc.ts         # IPC 채널 + 타입
├── core/
│   ├── employees/                # 직원 메타데이터 JSON (model/effort/시스템 프롬프트)
│   └── board/                    # Phase 1 칸반 파서 (현재 UI 미연결, 보존)
├── .claude/agents/               # claude 정통 sub-agent 정의 (PM이 Task tool로 spawn)
├── workspace/                    # 런타임 (gitignore)
│   ├── sessions/<taskId>/        # sub-agent 결과 영속화 (output.log + done JSON)
│   └── spawn-request/            # 외부 CLI 직원 fallback (Phase 3)
├── references/                   # 학습용 외부 repo (gitignore)
└── docs/                         # PROGRESS.md / models.md / phase{1,2,3}-plan.md
```

> 초안의 `core/workflows`(YAML 워크플로우)와 `core/router`(LLM autopilot)는 **회수**. PM의 Task tool 한 개로 흡수됨.

## 로드맵

### Phase 1 — 텍스트 MVP (✅ 2026-05-17)
- [x] Electron GUI 껍데기 (Tauri 거부 — Rust 학습 + Windows 빌드 비용)
- [x] CLI 세션 spawn/kill + stdout 표시 (`@homebridge/node-pty-prebuilt-multiarch`)
- [x] 직원 6명 — PM(Opus 4.7) + dev-1/dev-arch/planner-1/qa-1/utility-1
- [~] `workspace/board.md` watch + 칸반 렌더링 — **회수**. 파서(`core/board/parser.ts`)만 보존, UI 미연결. PM 채팅 단일 인터페이스로 단순화.
- [x] GUI 메시지 → PM child_process stdin 주입

### Phase 2 — 협업 (✅ 2026-05-18 본질 시연 통과)
- [x] PM이 sub-agent 자율 spawn → 결과 통합 보고. **Task tool 패턴**으로 구현 (file-watcher + Write 패턴은 PM에게 unnatural해 회귀).
- [~] 채널별 채팅 뷰 — **회수**. 단일 PM 채팅 + 좌측 sub-agent 카드로 충분.
- [x] 회의 모드 — 사장이 `회의: <안건>`으로 시작 → PM이 시스템 프롬프트로 흡수 → 다수 직원에 동시 spawn.
- [x] 직원 명부 active 토글 — 좌측 사이드바 체크박스. 비활성 시 PM 카탈로그에서 빠짐 + spawn 거절.

### Phase 3 — 다양화 (부분 진행)
- [ ] Codex CLI 직원, Gemini CLI 직원 — **사장 결정 보류** (2026-05-18). 외부 CLI 직원용 file-watcher 인프라(`app/src/main/spawn/`)는 fallback으로 보존.
- [x] 직원별 누적 사용량 추적 — 좌측 명부 row inline(spawn/tokens) + `UsagePanel` 풀버전(직원별 in/out/cache R/C/duration 막대 그래프).
- [ ] Figma MCP 디자인 직원 — **보류**.
- [x] sub-agent 영속화 — `workspace/sessions/<taskId>/{output.log, done}` 저장 + 앱 시작 시 historical 카드 복원.

### Phase 5 — 분기 게임 사이클 (✅ 2026-05-19 PR1~14 완성, 사장 시연 대기)
- [x] 분기 시작/종료 — 사장 명시 선언 (시간 자동 X, 카이로식 페이스)
- [x] `core/quarters/` 파일 기반 데이터 model (`workspace/quarters/current.json` + archive)
- [x] StatusBar 분기 표시 + QuarterPanel 모달 (현재 + 새 분기 시작 + archive history)
- [x] PM 시스템 프롬프트 분기 인지 + 분기 변경 시 자동 시스템 메시지
- [x] sessionIds 자동 append (`onSubAgentDone` 후) → 직원 이름표 분기 spawn 건수 표시
- [x] 화이트보드에 분기 title + 진척 bar + 분기 변경 시 3초 amber pulse cue
- [x] `회고:` prefix → 분기 정보 augment + PM이 planner-1+qa-1 동시 spawn + 통합 보고
- [x] 회고 결과 archive에 retrospective 자동 영속화
- [x] UsagePanel scope 토글 (전체/현 분기)
- [x] 회의 모드 vs 회고 모드 시각 cue 분리 (emerald / rose 배지 + Zones border)
- [x] 사장 캐릭터 회의 시 PM 대면 자리

### Phase 4 — 픽셀 사무실 (✅ 2026-05-19 PR2.9까지 통과, 카이로소프트 톤)
- [x] 직원 캐릭터 6명 + 사장 1명 SVG sprite — 셔츠 7색(PM/Engineer/Architect/Planner/QA/Utility/Boss) 식별, SD ~2 head 비례
- [x] 사무실 맵 — `pixel-office/{Character, Desk, Floor, Walls, MeetingTable, Whiteboard, Sofa, WaterCooler, Zones, TimeOverlay}.tsx`, 회의실+휴게실 zone overlay, 가구 디테일 (모니터/키보드/마우스/커피잔/포스트잇)
- [x] 상태 → 캐릭터 매핑 — `roster.working` 자동 감지 → 책상에서 ⌨️ 풍선 + 모니터 깜빡임. 비활성 직원은 opacity 0.35 흐릿
- [x] 회의 모드 — `회의:` prefix 시 6명+사장이 walk cycle(어깨 bobbing+rotate 280ms)하며 회의 테이블 둘레로 700ms transition. header `● 회의 중` 배지. PM 머리 위 `💬` 발언 풍선, 나머지 `···` 청취 풍선
- [x] 시간 흐름 — 시스템 시간 자동(1분 polling) + 사장 manual override 토글 (🌅 아침/☀ 낮/🌇 노을/🌙 밤, mix-blend multiply overlay)
- 시각 영역 가이드는 [`docs/skills/pixel-office-design.md`](docs/skills/pixel-office-design.md)에 정착 (status: stable)

## 참고 프로젝트 (`references/`)

| repo | 학습 포인트 |
|---|---|
| `generalaction/emdash` | Electron 앱 골격, 멀티 CLI 추상화 |
| `rustykuntz/clideck` | 세션 라우팅, 자동 인수인계 |
| `hummer98/cmux-team` | 직원 계층 구조, 멀티 계정 |
| `microsoft/conductor` | YAML 워크플로우 정의 |

각각 MIT/Apache 라이센스. 코드 직접 이식 시 NOTICE 파일에 출처 명기.

## 비-목표 (안 하는 것)

- 공개 배포/판매 — 개인용 학습 프로젝트
- 다중 사용자 — 1인 사장만 가정
- 클라우드 배포 — 로컬 데스크톱 only
- Anthropic API 직접 호출 — Claude Code CLI를 통한 간접 호출만

## 빠른 진입

```powershell
cd app
npm install
npm run dev
```

자세한 진행 상황 / 환경 / 시연 시나리오는 `docs/PROGRESS.md` 한 페이지로 정리되어 있음.
