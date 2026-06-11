# 유사 오케스트레이터 landscape (조사: 2026-06-11)

> 목적: payroll-os 오픈소스 공개 시 포지셔닝 확정 + 경쟁 툴에서 배울 패턴 수집.
> star 수는 조사 시점 웹 자료 기준 추정 — 변동함. 출처는 문서 하단.

## 요약 표

| 툴 | 조율 패턴 | 인증 | Windows | star(추정) |
|---|---|---|---|---|
| oh-my-claudecode (OMC) | Claude Code 플러그인 — 19 agents + 39 skills, teams-first, Claude/Gemini/Codex 멀티모델 | Claude Code 구독 OAuth 승계 (플러그인) | 플러그인은 OK, tmux 기반 omc-teams는 Unix 전제 | ~34k |
| oh-my-codex (OMX) | Codex CLI orchestration layer — async Claude 위임, autopilot/TDD/리뷰 워크플로우, 영속 state | Codex CLI OAuth 승계 | CLI layer라 OK | 미확인 |
| oh-my-hermes (OMH) | Claude Code + Codex CLI 통합 — `.omh/handoff/` 핸드오프 문서, expert team 라우팅, DualForge(양쪽 실행 후 병합) | 양쪽 CLI OAuth 승계 | CLI layer, tmux 기능 일부 Unix 전제 | 미확인 |
| Conductor (Melty Labs) | 워크스페이스 = git worktree, 병렬 Claude Code/Codex/Cursor + 대시보드 diff 리뷰/머지 | **구독 BYO (OAuth 그대로)** — 우리와 동일 철학 | **X (Mac 전용)** | closed-source |
| Vibe Kanban (BloopAI) | kanban 태스크 보드 → 태스크별 worktree에서 10+ 에이전트 실행, 시각 리뷰 | 각 CLI 인증 승계 | O (크로스플랫폼, Rust+Node 웹 UI) | ~26.8k (회사 셧다운, 커뮤니티 유지) |
| Claude Squad | tmux 세션 + git worktree 터미널 TUI, 멀티 CLI(Claude/Codex/Aider/Amp) | 각 CLI 인증 승계 | **X native** (tmux 필수 → WSL) | ~5.8k |
| Multiclaude (dlorenc) | supervisor/worker 팀 모델 (Go) — "긴 prompt 주고 자리 비우기"에 강점 | Claude CLI 승계 | Go binary — 동작 추정, 미검증 | 미확인 |
| Gas Town (Steve Yegge) | Mayor(조정자)/Polecats(일회성 워커)/Witness(stuck 감지·복구)/Deacon(상시 감독)/Refinery(머지 큐). git-backed 상태 영속 | Claude CLI 등 승계 | 미검증 (Unix 지향) | 미확인 |
| 공식 Agent Teams | 팀 리드 세션 + 상호 통신하는 teammates (실험, 2026-02) | 공식 | **락아웃** (TmuxBackend가 Unix tmux 전제) | — |

## 툴별: 배울 점 1 / 우리가 더 잘하는 점 1

### oh-my-claudecode (OMC)
- **배울 점**: skill + agent 카탈로그의 체계화 (인덱스/레퍼런스 문서 자동 로드). 우리 `docs/skills/` 시스템의 본격판 — 공개 시 skill 문서 포맷을 OMC 스타일로 표준화할 가치.
- **더 잘하는 점**: GUI 모니터링. OMC는 터미널 안에서 끝남 — 직원이 일하는 걸 "보는" 경험(픽셀 사무실 + 카드 + 사용량 패널)이 없다.

### oh-my-codex (OMX)
- **배울 점**: Codex 쪽 **비동기 위임 + 영속 state** 패턴 (no timeouts). 우리 codex 직원(qa-1)의 single-use 토큰/장시간 작업 안정화에 직접 참고.
- **더 잘하는 점**: 멀티 vendor 동시 운용 — OMX는 Codex 중심에 Claude를 위임 대상으로 둠. 우리는 catalog로 양방향 swap.

### oh-my-hermes (OMH) — 사장 지목 3패턴 비교
- **핸드오프 문서 포맷** (`.omh/handoff/`): 세션 간 인수인계를 구조화된 마크다운으로 영속. 우리 `workspace/sessions/`는 *결과* 영속이지 *인수인계* 문서가 아님 — PM→직원 prompt에 구조화 핸드오프(컨텍스트/제약/검증 기준 섹션) 도입 여지 있음.
- **expert team 라우팅 테이블**: 일감 유형 → 도구(Claude vs Codex) 매핑. 본질이 우리 PM 시스템 프롬프트의 "위임 결정 표"와 동일 — 차이는 OMH가 *도구* 라우팅, 우리는 *직원(모델+vendor)* 라우팅. 우리 쪽이 한 단계 위 추상화라 우위. 배울 건 라우팅 테이블을 외부 파일로 빼서 사장이 편집 가능하게 하는 구조.
- **DualForge** (같은 일감 양쪽 실행 후 병합): 우리 BenchmarkPanel의 catalog별 점수 비교와 철학 동일. "회의 모드"에 dual-vendor 옵션으로 이식 가능하나, **ChatGPT Plus 한도에선 사치** — 도입해도 기본 off.
- **더 잘하는 점**: OMH는 시각화/메타포/사용량 추적 전무.

### Conductor
- **배울 점**: worktree 격리 + "diff 리뷰 → 머지" UX. 직원 산출물이 main 워킹트리를 직접 건드리는 우리 구조보다 충돌 안전.
- **더 잘하는 점**: Windows. **Conductor의 자리(구독 BYO + 데스크톱 GUI)가 Windows에 비어 있음 — 우리의 기회 맞음.** 단 Vibe Kanban이 크로스플랫폼 웹 UI로 일부 커버한다는 점은 인지할 것.

### Vibe Kanban
- **배울 점**: 태스크 중심 UX + 통합 리뷰 흐름. 우리가 Phase 1에서 회수한 board.md 칸반의 성공판.
- **더 잘하는 점**: **PM 자율 분배.** Vibe Kanban은 사람이 태스크를 만들어 에이전트에 배정 — 우리는 사장이 일감만 던지면 PM이 직원 선택까지 자율. (보스 경험: "칸반 관리자" vs "사장".)

### Claude Squad
- **배울 점**: 멀티 CLI 추상화의 단순함 (세션 = tmux pane + worktree, 끝).
- **더 잘하는 점**: Windows native + GUI. tmux 의존이 Windows 사용자를 전부 배제 — 우리는 node-pty/ConPTY로 처음부터 Windows.

### Multiclaude
- **배울 점**: supervisor가 장시간 자율 운행하는 패턴 (긴 prompt → 자리 비우기). 우리 PM은 메시지 단위 turn — 장기 일감 자율 루프는 없음.
- **더 잘하는 점**: 관찰 가능성. 자리 비운 사이 뭘 했는지 우리는 카드/로그/사용량으로 남음.

### Gas Town
- 메타포 게임이 우리와 가장 유사 (마을 vs 회사). 단 지향이 다름 — Gas Town은 *다수 병렬 규모* ("Kubernetes for coding agents"), 우리는 *1인 사장의 구독 한도 안 운용*.
- **배울 점**: **Witness 패턴** — stuck agent 감지 + 자동 복구. 우리 PM busy 큐/done 감지엔 "직원이 멈췄을 때" 회복 탄력성이 없음 (sub 무응답 시 타임아웃/재spawn 부재).
- **더 잘하는 점**: 인건비(한도) 추적. Gas Town은 자원 무한 전제 — 구독 한도가 1급 개념인 오케스트레이터는 우리뿐.

## 공식 기능 겹침 / 비겹침 표

| 영역 | 공식 Claude Code | payroll-os | 판정 |
|---|---|---|---|
| sub-agent spawn | Task tool + `.claude/agents/` | PM이 그 위에 탑승 (소비자) | 겹침 아님 — 공식 기능을 쓰는 쪽 |
| 팀 상호 통신 | Agent Teams (실험) — **tmux 전제라 Windows 락아웃** | 회의 모드 (PM 경유 통신) | 부분 겹침. **Windows에선 공식이 불가 → 우리 회의 모드가 사실상 대안** |
| GUI 모니터링 | X (터미널) | 픽셀 사무실 + 작업 카드 + UsagePanel | 비겹침 — 핵심 가치 |
| 멀티 vendor | X (Claude만) | catalog 토글 + Codex subprocess | 비겹침 — 핵심 가치 |
| 사용량/한도 | /usage 수준 | 직원별·분기별·vendor별 누적 + 임계 알림 | 비겹침 — 핵심 가치 |
| worktree 격리 | 공식 지원 | **X (단일 워킹트리)** | 공식/경쟁자 전부 가진 표준을 우리만 결여 — 공개 전 도입 검토 1순위 |
| 분기/회고 게임 사이클 | X | 분기 선언 + 회고 + archive | 비겹침 — 감성 차별화 |

겹치는 것을 다시 만들 가치 없음 → spawn/조율 저수준은 계속 공식 Task tool에 위임하고, 우리는 **그 위의 경험(메타포·시각화·한도 운용)**에 집중.

## 결론: 공개 시 포지셔닝 (한 단락)

payroll-os는 **"API 키 0개 — 이미 결제 중인 구독(OAuth)만으로 도는 Windows 데스크톱 멀티 벤더 AI 오케스트레이터"**다. 경쟁 지형에서 (1) 구독 BYO + 데스크톱 GUI라는 Conductor의 자리가 Windows에 비어 있고, (2) 공식 Agent Teams마저 tmux 전제로 Windows에서 락아웃이라 "Windows에서 멀티 에이전트를 눈으로 보며 부리는" 자리는 사실상 공석이다. 셀링 포인트는 ① API 키 0개·구독 한도가 1급 개념(직원별 인건비/분기 정산/임계 알림 — 전 경쟁자 중 유일), ② 구독=직원 메타포 + 카이로소프트풍 픽셀 사무실(감성 차별화 — Gas Town만 메타포 경쟁자인데 그쪽은 규모 지향), ③ catalog 딸깍 전환(구독 조합 변화 즉응, stale 감지 포함). 반면 **git worktree 격리는 경쟁자 전원이 갖춘 표준인데 우리만 없다** — 공개 전 도입 검토 1순위 기술 부채.

## payroll-os에 이식할 패턴 후보 (우선순위)

1. **worktree 격리** (Conductor/Vibe Kanban/Claude Squad/공식 전부 표준) — dev 직원 산출물 충돌 방지.
2. **Witness 패턴** (Gas Town) — sub 직원 stuck 감지 + 타임아웃 + 재spawn.
3. **핸드오프 문서 포맷** (OMH) — PM→직원 prompt 구조화 (컨텍스트/제약/검증 기준).
4. **라우팅 테이블 외부화** (OMH) — PM 위임 결정 표를 사장 편집 가능한 파일로.
5. DualForge식 dual-vendor 비교 (OMH) — Plus 한도 회복(또는 Pro 복귀) 시에만.

## 출처

- [oh-my-claudecode (Yeachan-Heo)](https://github.com/Yeachan-Heo/oh-my-claudecode) / [공식 사이트](https://yeachan-heo.github.io/oh-my-claudecode-website/)
- [oh-my-codex (scalarian)](https://github.com/scalarian/oh-my-codex)
- [oh-my-hermes (HERMESquant)](https://github.com/HERMESquant/oh-my-hermes)
- [Conductor](https://www.conductor.build/) / [CodePick 소개](https://codepick.dev/en/guides/conductor-build-intro)
- [Vibe Kanban (BloopAI)](https://github.com/BloopAI/vibe-kanban) / [virtuslab 리뷰](https://virtuslab.com/blog/ai/vibe-kanban)
- [Claude Squad (smtg-ai)](https://github.com/smtg-ai/claude-squad)
- [Gas Town (Steve Yegge)](https://github.com/steveyegge/gastown) / [Welcome to Gas Town (Medium)](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) / [DoltHub: A Day in Gas Town](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)
- [공식 Agent Teams docs](https://code.claude.com/docs/en/agent-teams) / [Windows tmux 락아웃 이슈 #34150](https://github.com/anthropics/claude-code/issues/34150)
- [Nimbalyst: Best Multi-Agent Coding Tools 2026](https://nimbalyst.com/blog/best-multi-agent-coding-tools-2026/)
- [awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators)
