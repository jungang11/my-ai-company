# 모델 카탈로그 (적재적소 매핑)

> 사장이 직원 JSON의 `model`/`effort` 필드를 채울 때 참고하는 single source of truth.
> 외부 가격/스펙/벤치마크는 변동하므로 이 문서가 ground truth — 직원 JSON을 여기 기준으로 튜닝.
>
> 갱신: 2026-05-18. 출처는 문서 하단.

## ⚠️ Task tool 패턴 도입 후 모델 매핑 한계 (2026-05-18 추가)

Phase 2에서 PM의 sub 직원 spawn을 **Claude Code의 Task tool**로 전환(파일 watcher 패턴 보조). 이로 인해 모델 매핑에 한계가 생김:

- Claude Code Task tool의 `model` 파라미터는 **`sonnet` / `opus` / `haiku` enum**으로 hardcoded.
- 즉 `.claude/agents/<id>.md`의 frontmatter에 `model: opus`만 지정 가능. **`opus-4-6` vs `opus-4-7` 세분화 불가능**.
- 우리 `core/employees/<id>.json`의 `model: claude-opus-4-6` 같은 세분화 필드는 **Phase 3 외부 CLI 직원(Codex/Gemini)에서만 의미** — 그것들은 file-watcher 패턴으로 별도 process spawn하면서 `--model` flag 직접 전달.

PM(메인 process)은 `core/employees/pm.json`의 `model` 그대로 적용(`claude-opus-4-7`). sub-agent는 Task tool enum 한도.

dev-1과 dev-arch 둘 다 `opus` (Task tool 한도) → 실질적 model 차이는 없음. 단 description/system prompt 차이로 PM이 라우팅 결정 — 어려운 작업은 dev-arch에 분배. 시연상 차별화 유지.

향후 Anthropic이 Task tool model에 full model id 지원하면 그때 dev-1/dev-arch 분리 의미 복원.

---

## 1. 모델 카탈로그 (실측 벤치마크 + 가격)

| Model ID | SWE-bench Verified | SWE-bench Pro | GPQA | MMMLU | Tau2 Retail | 가격 in/out (per 1M) |
|---|---|---|---|---|---|---|
| `claude-opus-4-7` | **87.6%** | **64.3%** | ~89% | ~89% | 90%대 | 비공개(Sonnet 5x 추정) |
| `claude-opus-4-6` | 80.8% | 53.4% | 87% | 87% | 88% | 비공개 |
| `claude-sonnet-4-6` | 79.6% | — | **89.9%** | **89.3%** | 91.7% | $3 / $15 |
| `claude-haiku-4-5-20251001` | 73.3% | — | — | 83.0% | 83.2% | **$1 / $5** |

**핵심 발견**:
- **Opus 4.7은 Opus 4.6 대비 SWE-bench Verified가 +7pt**. 코딩에서 단순 incremental이 아닌 step-change.
- **Sonnet 4.6의 SWE-bench(79.6%)가 Opus 4.6(80.8%)에 거의 동등**. 일반 코딩에서 Sonnet으로 충분.
- Sonnet 4.6은 **Opus 대비 약 2배 속도**, **3-5배 저렴**.
- Haiku 4.5는 **80~120 tokens/sec**, Sonnet 대비 **8배 저렴**. 대량 단순 작업에 압도적 가성비.

---

## 2. Anthropic 공식 권장 사용 사례 (인용)

> "**Claude Opus 4.7** — Long-horizon agentic coding, large-scale refactoring, complex systems engineering, advanced research, multi-hour autonomous tasks." (가장 capable한 모델, Opus 4.6 대비 step-change 향상)
>
> "**Claude Sonnet 4.6** — Code generation, data analysis, content creation, visual understanding, agentic tool use." (frontier intelligence at scale)
>
> "**Claude Haiku 4.5** — Real-time applications, high-volume intelligent processing, cost-sensitive deployments needing strong reasoning, **sub-agent tasks**." (near-frontier 성능 + 최저가)

Anthropic은 두 가지 시작 전략을 제시:
- **Option 1**: Haiku부터 시작해 capability 부족 시만 upgrade (cost-sensitive)
- **Option 2**: Opus 4.7로 시작해 prompt 최적화 후 다운그레이드 (quality-first)

사장 정책 "분석/구현은 max 위주" = **Option 2** 노선.

---

## 3. effort 레벨 가이드

claude CLI `--effort <low|medium|high|xhigh|max>`.

| Level | 권장 작업 | Anthropic/커뮤니티 입장 |
|---|---|---|
| `low` | 분류·추출·포맷팅·짧은 요약·routing | xhigh는 trivial 작업에 토큰 낭비 |
| `medium` | 평범한 코드 작성·짧은 분석·cost-sensitive | high 아래로 내릴 땐 이 단계 |
| `high` | 디버깅·중간 리팩토링·심도 있는 분석 | "intelligence-sensitive 작업의 minimum" |
| **`xhigh`** | **agentic 코딩·multi-step reasoning·tool-heavy 작업** | **Claude Code의 신 default (4.7 출시 후)**. 4.7에서 가장 권장 |
| `max` | 아키텍처 설계·subtle race condition·security review | **"트랩"** — 실측에선 xhigh와 quality 거의 동등하면서 토큰만 2~3배. 진짜 어려운 경우에만 |

**Boris Cherny (Anthropic) 발언**: "Claude Code의 default가 xhigh로 변경. 4.7은 더 깊게 생각해서 4.6보다 토큰 사용량 더 큼. effort/budget/brevity prompt로 관리하라."

**Towards AI 실측 결과**: "Max는 트랩이다. Low는 조용히 Opus 4.6을 죽인다." 12개 코딩 문제로 5개 effort 비교 결과, max는 xhigh 대비 quality 향상은 미미하면서 토큰만 2.7배.

---

## 4. 직군별 매핑 (Phase 1 채택 — 실측 근거)

| 직군 | 모델 | effort | 사유 (벤치마크 + 사례 근거) |
|---|---|---|---|
| **PM** (pm) | `claude-opus-4-7` | **xhigh** (max 승격은 어려운 일감만) | 사장 직통 + 분할 결정 + 통합 보고. 컨텍스트 끌고가는 long-horizon agentic — 4.7이 직격타. max는 토큰 트랩이라 xhigh가 sweet spot. |
| **개발자** (dev-*) | `claude-opus-4-6` (or 4.7) | xhigh | 코딩이 본업이라 SWE-bench 점수 중요. 4.6도 80.8%로 강력 + 비용 절감. 어려운 작업·아키텍처는 4.7로 승격. **검토**: 4.7로 일괄 올리면 quality +7pt, 비용 증가 감수할 가치는 사장 판단. |
| **기획자** (planner-*) | `claude-opus-4-7` | xhigh | 분석/리서치/문서화 — 긴 추론 + 1M context 필요. 4.7의 GPQA/MMMLU 강세가 분석에 직격. |
| **QA** (qa-*) | `claude-sonnet-4-6` | **high** (반복) | 검증/리뷰는 반복 작업이라 비용 효율 우선. Sonnet 4.6 SWE-bench 79.6%로 Opus 4.6와 거의 동등. high면 충분, max는 낭비. |
| **잡일** (utility-*) | `claude-haiku-4-5-20251001` | low~medium | 분류/요약/routing/lookup. Haiku 4.5 자체가 sub-agent 권장 모델로 공식 명시. |

**참고**: Anthropic이 권장하는 **"Advisor Strategy"** = Opus를 senior advisor로 두고 Sonnet/Haiku를 executor로 페어링하면 비용 11% 절감 + quality 향상. 우리 구조(PM=Opus 4.7 advisor, sub=Opus 4.6/Sonnet/Haiku executor)가 정확히 그 패턴.

---

## 5. 모델 선택 의사결정 트리 (PM이 일감 받으면 거치는 흐름)

```
일감 분석
  │
  ├─ 단순 한 줄 질문/요약/분류
  │     → Haiku 4.5 + low (또는 PM 본인이 직접 답)
  │
  ├─ 평범한 코드 작성 (한 함수, 짧은 리팩토링)
  │     → Sonnet 4.6 + high (dev-1 spawn)
  │
  ├─ 본격 코딩 (큰 리팩토링, 모듈 추가, 디버깅)
  │     → Opus 4.6 + xhigh (dev-1)
  │
  ├─ 어려운 코딩 (아키텍처, race condition, security)
  │     → Opus 4.7 + xhigh (또는 max로 승격, dev-1 또는 신규 dev-arch)
  │
  ├─ 분석/리서치/문서 작성 (긴 자료, 멀티스텝 reasoning)
  │     → Opus 4.7 + xhigh (planner-1)
  │
  └─ 검증/리뷰 (코드/문서 PR 점검)
        → Sonnet 4.6 + high (qa-1)
```

---

## 6. 토큰 최적화 (Phase 1 마무리 라운드)

### Prompt Cache 최대화 (가장 큰 효과)

Anthropic prompt caching은 **공식적으로 가장 큰 비용 절감 수단**. cached read는 fresh input의 약 1/10 비용.

- **시스템 프롬프트의 안정적 prefix 보존**: 직원 시스템 프롬프트 + 카탈로그가 cache hit되도록 안정적 헤더로 유지. PM의 카탈로그가 매번 dynamic으로 재생성되면 cache 무효화 — `loadCatalog()`가 결정적(deterministic) 결과 내도록 보장.
- 한 Reddit 사용자 실측: Sonnet의 cache read 13.2M tokens — effective cost 압도적 절감.

### Context 분할 (sub session pattern)

PM이 본인 context에 모든 걸 짊어지지 말고, sub session에 "이 일감 + 필요 파일 경로만" 던지면 각 sub가 자기 context로 시작 → 토큰 효율.

### `--exclude-dynamic-system-prompt-sections`

per-machine 섹션(cwd/env/git status)을 첫 user message로 옮겨 cross-call cache 재사용 향상. claude CLI flag 직접 지원.

### Sonnet 안전망

"Sonnet is Enough" 트랩 회피: Sonnet으로 코딩 진행 중에도 **어려운 결정/architecture/edge case는 Opus advisor에 위임**. 그게 advisor strategy 핵심.

### 모델 다운그레이드 적기

PM이 일감 보고 "이건 Haiku로도 가능"이면 망설이지 말고 Haiku spawn. PM 본인이 Opus라 결정 quality는 유지.

### Effort 다운그레이드

- 분류/추출/포맷: `low`
- 일상 코드: `high` 또는 `medium`
- 본격 작업: `xhigh` (max는 evals로 quality gap 입증된 경우만)

---

## 7. 사장 정책과 권장의 갭 (검토 안건)

| 사장 초기 정책 | 리서치 후 권장 | 조정 안 |
|---|---|---|
| "거의 max" | 디폴트 **xhigh** (max는 토큰 2.7x 트랩) | PM/dev/planner의 `effort`를 `xhigh`로 변경, max는 architecture/security 일감일 때 PM이 spawn-request에서 직접 명시 |
| "코딩 위주는 Opus 4.6" | Opus 4.7이 SWE-bench +7pt — 사장 학습 프로젝트라 quality-first면 4.7 권장 | dev-1을 4.7로 올리거나, dev-1(4.6 일상)/dev-arch(4.7 어려움) 분리 |
| "기획/리서치는 Opus 4.7" | 그대로 OK (공식 권장 일치) | 변경 없음 |
| "간단은 Sonnet" | 더 단순한 건 **Haiku 4.5**가 더 합리 (8x 저렴 + sub-agent 공식 권장) | utility-* 직군 추가 검토 |

**권장 액션**: 일단 dev-1과 PM의 `effort`를 `max` → `xhigh`로 내림 (PR8c 작업). dev-1 모델은 4.6 유지 (벤치마크/비용 균형), 어려운 일감 발생 시 dev-arch(4.7) 직원 신규 생성하는 방식이 깔끔.

---

## 출처

- [Anthropic — Choosing the right model](https://platform.claude.com/docs/en/docs/about-claude/models/choosing-a-model)
- [Anthropic — Introducing Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)
- [llm-stats — Claude Opus 4.7 Launch](https://llm-stats.com/blog/research/claude-opus-4-7-launch) (SWE-bench Verified 87.6 / Pro 64.3)
- [SWE-Bench Verified Leaderboard](https://llm-stats.com/benchmarks/swe-bench-verified)
- [artificialanalysis.ai — Sonnet 4.6 vs Haiku 4.5](https://artificialanalysis.ai/models/comparisons/claude-sonnet-4-6-vs-claude-4-5-haiku)
- [Vellum — Claude Opus 4.7 Benchmarks Explained](https://www.vellum.ai/blog/claude-opus-4-7-benchmarks-explained)
- [Verdent — Opus 4.7 vs 4.6 Agentic Coding](https://www.verdent.ai/guides/claude-opus-4-7-vs-4-6-coding-agents)
- [MindStudio — Claude Code Effort Levels Explained](https://www.mindstudio.ai/blog/claude-code-effort-levels-explained)
- [Towards AI — I Tested All 5 Effort Levels (max is a trap)](https://pub.towardsai.net/i-tested-all-5-effort-levels-of-claude-opus-4-7-2f335c626786)
- [zenn.dev — Sonnet is Enough trap & cost optimization](https://zenn.dev/orectic/articles/claude-code-opus-sonnet-cost-optimization?locale=en)
- [MindStudio — Advisor Strategy (Opus + Sonnet pair)](https://www.mindstudio.ai/blog/claude-code-advisor-strategy-opus-sonnet-haiku)
- [systemprompt.io — Reduce Claude Code costs 60%](https://systemprompt.io/guides/claude-code-cost-optimisation)
