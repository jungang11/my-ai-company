# 출근 경로 + packaged 리소스 전략 plan

> 사장 비전 (2026-06-11): "터미널처럼 앱이 열린 경로가 중요 — 프로젝트마다 지침이 다르니
> 어떤 경로의 어떤 프로젝트인지 인식". 패키징 spike(`783c8c5`)에서 확인된 경로 문제와 본체 동일.
> 상태: approved (Fable 설계, 2026-06-12). PR-A부터 Opus 위임으로 진행.

## 진단: projectRoot 하나가 세 역할을 혼용

`resolve(__dirname, '../../..')` 가 8개 main 파일에서 세 가지 다른 의미로 쓰임:

| 역할 | 내용 | 사용처 | packaged에서의 정답 |
|---|---|---|---|
| **appResources** | 읽기 전용 앱 자산: `core/employees`, `core/catalogs` | manager.ts, catalogs/handlers, pm-runner(PM_DEF_PATH), benchmarks(시나리오) | `process.resourcesPath` (extraResources 동봉) |
| **runtime** | 가변 상태: `workspace/*` (sessions/quarters/active-catalog/benchmark-results/spawn-request) | sessions/historical, spawn/{runner,watcher}, quarters/benchmarks/catalogs handlers의 workspace 부분 | `app.getPath('userData')/workspace` |
| **workDir** | **작업 대상** — PM/직원이 일하는 프로젝트 (사장이 선택) | pm-runner cwd/--add-dir, spawn/runner cwd/-C/--add-dir, status.ts(projectName/branch) | 사장 선택 + 영속 (기본: 마지막 선택) |

dev 모드에선 셋 다 repo root로 수렴 → 지금까지 문제가 안 보였던 이유.

## 함정 2개 (설계 근거)

1. **`.claude/agents` 는 cwd 기준** — Task tool 직원 정의는 claude CLI가 cwd의 `.claude/agents/`에서
   읽는다. workDir을 다른 프로젝트로 바꾸면 직원 5명이 사라져 PM 위임이 깨짐.
   → **앱 시작 시 직원 정의를 `~/.claude/agents/`로 sync** (글로벌 agent는 모든 cwd에서 유효).
   이름 충돌 리스크는 감수 (dev-1 등 — PM subagent_type 참조와 일치해야 하므로 prefix 불가).
2. **active 토글이 employees JSON을 직접 수정** — packaged resources는 읽기 전용(Program Files).
   → active 상태를 `runtime/employee-active.json` overlay로 분리 (base JSON 불변).

## 부수 효과 (공짜로 얻는 것)

- workDir의 CLAUDE.md/AGENTS.md를 claude/codex CLI가 cwd 기준으로 자동 로드 → **프로젝트별 지침 적용 공짜**.
- status.ts가 workDir 기준 projectName/branch 표시 → 사장 비전의 "codex statusline" 그대로.
- 두 PC 장부 분리(상태 동기화 안 함) 원칙과 자연 정합 — runtime은 머신별 userData.

## PR 분해

### PR-A — paths 모듈 + 치환 (동작 불변, Opus 위임)
- `app/src/main/paths.ts` 신설: `appResourcesRoot()` / `runtimeRoot()` / `getWorkDir()`.
  dev에선 셋 다 기존과 동일 경로 반환 (`app.isPackaged` 분기는 모듈 안에만).
  workDir은 `runtime/work-dir.json` 영속, 기본값 = appResourcesRoot (현행 동작 유지).
- 8개 파일의 `projectRoot`를 역할별로 치환. **이 PR에서 동작 변화 0** — 순수 의미 분리.

### PR-B — 출근 경로 UI + 전환 동작
- StatusBar 좌측 project/branch 영역 클릭 → 폴더 선택 dialog + 최근 경로 목록.
- workDir 변경 시: PM 세션 reset(세션은 cwd 종속) + PM에 시스템 메시지("출근 경로 변경: X") + roster 정리.
- 앱 시작 시 `.claude/agents/*.md` → `~/.claude/agents/` sync (해시 비교, 변경분만).
- employee active overlay (함정 2).

### PR-C — 패키징 마무리
- electron-builder `extraResources`: core/employees, core/catalogs, .claude/agents.
- NSIS 인스톨러 + `app.setLoginItemSettings` 부팅 자동 시작 (사장 결정분).

## 의도적 제외
- 두 PC 상태 동기화 (분기 archive export/import는 별도 안건 유지).
- 다중 workDir 동시 운영 (탭/워크스페이스) — Conductor 영역, 비목표.
- worktree 격리 — landscape 안건이지만 본 plan과 독립.
