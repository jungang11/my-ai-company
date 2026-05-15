# payroll-os

> AI agents you employ. Stop paying, they quit.

개인용 AI 오케스트레이터. 본인이 가진 AI 구독들(Claude Max, ChatGPT, Gemini, Figma 등)을 "직원"으로 추상화하고, 사장처럼 일을 분배·조율하는 데스크톱 앱.

## 한 줄 컨셉

> "내 컴퓨터는 사무실, 내가 켠 CLI들은 직원들, 나는 사장."

## 왜 만드는가

지금은 채팅 세션을 옮겨다니면서 직접 복붙으로 결과물을 전달하고 있음. 이걸 자동화해서 직원들끼리 알아서 협업하게 하고, 사장(나)은 게시판과 채팅방만 보면 되는 구조로 만들고 싶음.

## 핵심 메타포

| 현실 세계 | payroll-os |
|---|---|
| 구독 결제 | 고용 계약 |
| 결제 중단 | 직원 퇴사 (해당 직원 비활성화) |
| 구독료 | 인건비 |
| 출근 | CLI 세션 spawn |
| 퇴근 | CLI 세션 종료 |
| 회사 게시판 | `workspace/board.md` |
| 슬랙 | `workspace/chat/` 마크다운들 |
| 인수인계 문서 | `workspace/handoff/` |
| 스탠드업 | `workspace/standup/{date}.md` |

## 직원 직급 (참고: cmux-team의 Manager/Conductor/Agent)

- **사장 (User)** — 사람. 안건/지시만 내림.
- **PM 직원** — 사장 지시를 태스크로 쪼개서 보드에 올림. 인수인계 작성.
- **개발자/문서/기획 직원** — 실제 작업 수행.
- **리뷰어 직원** — 산출물 검수.

각 직원은 특정 CLI 백엔드(Claude Code / Codex CLI / Gemini CLI)에 매핑되고, 직원 카드에 역할(시스템 프롬프트), 활성 상태, 누적 작업 로그가 붙어있음.

## 핵심 제약

1. **Anthropic API 직접 호출 금지.** Claude Max $100은 Claude Code CLI subprocess 호출로만 사용. 2026년 3월 leak 이후 정책 변경으로 서드파티 하네스에서 직접 API를 찌르려면 종량제 결제가 필요해짐.
2. **모든 직원은 CLI subprocess.** API 키 다루는 부분 없음. 직원 = 본인 컴퓨터에 설치된 CLI 도구의 인스턴스.
3. **공유 상태는 파일로.** 직원들은 어차피 파일 읽고 쓰는 게 본업이라, 별도 API 만들지 말고 마크다운/SQLite로 통신.
4. **GUI는 모니터링용.** 직원들이 일하는 걸 보는 창이지, 직원들이 GUI를 거쳐서 일하는 게 아님.

## 디렉토리 구조

```
payroll-os/
├── app/                  # GUI (Electron 또는 Tauri)
│   ├── main/             # 메인 프로세스: CLI subprocess 관리, pty
│   ├── renderer/         # UI: 직원 카드, 보드, 채팅, 픽셀 사무실
│   └── shared/
├── core/                 # 오케스트레이션 로직 (GUI 독립)
│   ├── employees/        # 직원 정의 (역할, 모델, 시스템 프롬프트)
│   ├── workflows/        # YAML 워크플로우 (참고: microsoft/conductor)
│   ├── router/           # 인수인계 라우터 (참고: clideck autopilot)
│   └── board/            # 공유 게시판 파일 watch + 파싱
├── workspace/            # 직원들의 작업 공간 (런타임)
│   ├── board.md          # 칸반 보드
│   ├── standup/          # 일자별 스탠드업
│   ├── chat/             # 채널별 채팅
│   ├── handoff/          # 인수인계 문서
│   └── tasks/            # 태스크별 상세
├── references/           # 학습용 외부 repo (git clone, 커밋 안 함)
└── docs/
```

## 로드맵

### Phase 1 — 텍스트 MVP (게임 요소 없음)
- [ ] Electron 또는 Tauri로 GUI 껍데기
- [ ] CLI 세션 1개 spawn/kill, stdout 표시 (node-pty 또는 portable-pty)
- [ ] 직원 1명: Claude Code 기반 "개발자"
- [ ] `workspace/board.md` watch + 칸반 렌더링
- [ ] 본인이 GUI에서 메시지 보내면 직원 CLI에 주입

### Phase 2 — 협업
- [ ] 직원 2명 (PM + 개발자). 인수인계 흐름 1회 성공
- [ ] 채널별 채팅 뷰 (`#general`, `#dev`)
- [ ] 회의 모드 (사장이 안건 적으면 직원들이 의견 append)
- [ ] 라이센스/고용 상태 토글 (직원 카드의 "퇴사" 버튼)

### Phase 3 — 다양화
- [ ] Codex CLI 직원, Gemini CLI 직원 추가
- [ ] 직원별 누적 사용량/비용 추적
- [ ] Figma MCP 디자인 직원

### Phase 4 — 픽셀 사무실 (재미 페이즈)
- [ ] 직원 캐릭터 스프라이트 (idle/working/away 애니메이션)
- [ ] 사무실 맵 렌더링 (책상, 컴퓨터, 회의실)
- [ ] 상태 → 캐릭터 행동 매핑 (working = 책상에서 타이핑 애니메이션)
- [ ] 채팅하면 캐릭터 머리 위 말풍선

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
