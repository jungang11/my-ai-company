---
name: karpathy-coding-discipline
description: Andrej Karpathy 류 LLM 코딩 4원칙 (Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution) — PR 단위 self-review 체크리스트
status: stable
applies_to: 모든 코드 작업 (PR 생성 전/후), CLAUDE.md 작업 원칙 6 보강
last_updated: 2026-05-19
imported_from: multica-ai/andrej-karpathy-skills (MIT, Forrest Chang)
---

# Karpathy Coding Discipline

> Andrej Karpathy의 [LLM coding pitfalls 관찰](https://x.com/karpathy/status/2015883857489522876)에서 파생된 4원칙. multica-ai/andrej-karpathy-skills (MIT, Forrest Chang)의 [`karpathy-guidelines/SKILL.md`](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md) 압축 + 한국어화 + payroll-os 컨셉 적용.

---

## 핵심 통찰

> **"Don't tell it what to do, give it success criteria and watch it go."**

LLM은 단계별 명령보다 측정 가능한 결과(verifiable outcomes)로 더 잘 일한다. 4원칙은 그 방향을 강제하는 self-review 체크리스트.

**Trade-off**: 속도보다 신중함을 우선. 작업 복잡도에 따라 선택적 적용 — 1줄 fix에 4원칙 다 돌릴 필요 X, 4+ 파일 architecture 변경에는 필수.

---

## 4원칙

### 1. Think Before Coding (생각 먼저, 코드 나중)

**원칙**: 침묵의 가정 금지. 모호하면 짐작 말고 물어봐라. 진짜 모호하면 해석들 명시.

**체크리스트**:
- [ ] 사용자 의도 자기 말로 한 줄 재진술 가능한가?
- [ ] 모르는 영역(파일 위치/API 동작/타입)을 grep/read로 직접 확인했는가?
- [ ] 짐작한 게 있다면 사장 응답에 "추정: X" 명시했는가?

**payroll-os 적용**: 작업 시작 전 grep/Read 전수 + 영향 범위 사전 매핑. 사용자 전역 규칙 "사전 분석 강화"와 직결.

⚠️ **payroll-os 사장 스타일 조정**: 원작은 "If multiple interpretations exist, present them" — 우리 사장은 "옵션 A/B/C 나열 금지" 명시. **진짜 본인이 결정 못 할 만큼 모호할 때만** 옵션 제시 (보통은 본인 결정 통보 + 근거 한 줄).

---

### 2. Simplicity First (단순함 우선)

**원칙**: 요청된 것만. 추측성 기능 / 단발 사용 추상화 / 미래 대비 코드 X. "이 코드 의미 있게 더 짧아질 수 있나?" — 그렇다면 단순화.

**체크리스트**:
- [ ] 추가한 줄이 요청 범위 안인가? (요청 안 한 abstraction 0)
- [ ] 200줄이 50줄로 줄 수 있는가? (있으면 다시 써)
- [ ] 단발 사용 helper를 만들었나? (인라인이 더 단순)
- [ ] feature flag / backwards-compat shim 박았나? (지금 바꿔도 되는 코드면 직접 변경)

**payroll-os 적용**: 시스템 프롬프트 CLAUDE.md "Don't add features beyond what the task requires" 그대로. 사장 "추천 1개 + 근거 한 줄"과 정합.

---

### 3. Surgical Changes (수술적 변경)

**원칙**: 요청한 부분만. 인접 코드 개선/관계없는 리팩토링/dead code 정리 금지(명시 요청 시만). 수술 부위만, 봉합도 깨끗하게.

**체크리스트**:
- [ ] 변경 파일이 요청 범위와 일치하나?
- [ ] 변경하면서 인접 코드 "개선" 욕구 누른 적 있나?
- [ ] 본인이 만든 unused import만 제거했나? (기존 dead code는 그대로)
- [ ] commit message에 "변경 1, 변경 2" 외 다른 scope 안 끼웠나?

**payroll-os 적용**: 사용자 전역 규칙 "작은 단위로 자주 commit" + "한 번에 한 가지만" — 본 원칙과 정확히 정합.

---

### 4. Goal-Driven Execution (목표 기반 실행)

**원칙**: 작업을 검증 가능한 성공 기준으로 변환. "Add validation" → "Write tests for invalid inputs, then make them pass". 다단계 작업은 explicit verification checkpoint 포함.

**체크리스트**:
- [ ] 이 변경이 "성공"했음을 어떻게 측정하나? (typecheck? test? grep? 시연?)
- [ ] 검증 step을 본인이 직접 돌렸나? (사용자가 돌리게 떠넘기지 X)
- [ ] 다단계라면 각 step 후 verification checkpoint 박았나?
- [ ] 보고 시 검증 결과 인용했나? ("npm run typecheck → 통과")

**payroll-os 적용**: 사용자 전역 규칙 "수정 후 검증 강화" + 직원 .claude/agents/*.md "자체 검증 강제(typecheck/grep)" 와 정합. 회의/회고 prefix도 본질은 "성공 기준 측정"의 한 형태.

---

## PR self-review 체크리스트 (요약)

PR 만들기 직전 한 번 돌려라:

```
[ ] 1. Think — 사용자 의도 한 줄 재진술. 짐작 0.
[ ] 2. Simplicity — 추가 줄이 요청 범위 안. 단발 추상화 X.
[ ] 3. Surgical — 인접 코드 개선 욕구 누름. 본인 unused만 제거.
[ ] 4. Goal-Driven — 검증 step 본인이 돌림. 결과 인용 가능.
```

위 4개 다 ✅면 PR commit + 사장 보고. 하나라도 ✗면 코드 돌아가 다시.

---

## payroll-os 적용 예시

### 좋은 예 — Phase 5 PR1 (`76e3948`) quarters 인프라

- **Think**: phase5-plan.md에서 분기 사이클 컨셉 + 데이터 model 명시. 짐작 0.
- **Simplicity**: SQLite 미도입, 파일 기반 JSON. PR1엔 UI X, storage + IPC만.
- **Surgical**: `core/quarters/` 신규 + `app/src/main/quarters/` + IPC 채널 3개. 다른 모듈 안 건드림.
- **Goal-Driven**: `node -e "JSON.parse(...)"`로 storage round-trip 검증 + typecheck 통과 인용.

### 나쁜 예 (가상) — "분기 시작 모달 만들어줘"에 PR1+PR2+PR3 묶음

- **Surgical 위반**: 한 PR에 인프라 + UI + PM 시스템 프롬프트 변경 다 박음 → 회귀 추적 어려움.
- **Goal-Driven 위반**: 검증 단계 누락 (분기 시작 → 직원 spawn → 회고 → archive 전체 사이클 검증 X).

해결: PR1/PR2/PR3 분리, 각 PR 후 사장 검증.

---

## 라이센스 / 출처

- 원본: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (MIT, Forrest Chang)
- 본 문서는 원작 `karpathy-guidelines/SKILL.md` + `EXAMPLES.md`의 4원칙을 한국어 압축 + payroll-os 컨셉 적용 예시 추가. **원작 verbatim X** — 변형/요약/현지화 포함.
- 출처 인용:
  - [`SKILL.md`](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md)
  - [`README.md`](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/README.md)
  - [Andrej Karpathy LLM coding pitfalls tweet](https://x.com/karpathy/status/2015883857489522876)
  - [DeepWiki: The Four Principles](https://deepwiki.com/forrestchang/andrej-karpathy-skills/3-the-four-principles)

NOTICE: MIT 라이센스라 변형/배포 OK이지만 작성자 명시 + 원본 link 유지 의무.

---

## 알려진 한계

- payroll-os 사장 "옵션 나열 금지" vs 원작 "present multiple interpretations" 충돌 — Think Before Coding에 조정 명시함.
- 4원칙은 추상 — 실제 적용은 PR 단위에서 판단. PR 직전 self-review 1분짜리 ritual로 정착 권장.

## 다음 라운드 후보

- 각 직원 `.claude/agents/*.md`에 self-review 체크리스트 4줄 임베드 (sub-agent들도 4원칙 강제 적용)
- CLAUDE.md 작업 원칙 8번 신규: "PR self-review 4원칙 (`docs/skills/karpathy-coding-discipline.md`)"
