# 모델 카탈로그 (적재적소 매핑)

> 사장이 직원 JSON의 `model` 필드를 채울 때 참고하는 single source of truth.
> 외부 가격/스펙 변동 시 이 문서가 ground truth — 직원 JSON을 여기 기준으로 튜닝.
>
> 갱신: 2026-05-18.

---

## 현재 사용 가능 모델 (Anthropic, Claude Code CLI 기준)

| Model ID | Alias | Context | 주특기 | 비용 감각 |
|---|---|---|---|---|
| `claude-opus-4-7` | `opus` (최신) | 1M | 추론·종합 분석·긴 계획·문서 작성. 최강. | 💸💸💸 |
| `claude-opus-4-6` | — | 1M (확장) | 코드 작성·리팩토링·tool-heavy agent 작업. | 💸💸 |
| `claude-sonnet-4-6` | `sonnet` | 200K | 일상 응답·중간 작업·균형형. Opus 대비 약 1/5 비용. | 💸 |
| `claude-haiku-4-5-20251001` | `haiku` | 200K | 분류·요약·대량 lookup·micro task. 매우 빠름. | 💲 |

(Sonnet 4.7 / Haiku 4.7 등 신모델은 발표 시 표 갱신.)

---

## effort level (claude CLI `--effort`)

| Level | 용도 |
|---|---|
| `low` | 단순 한 줄 답·분류·간단 lookup |
| `medium` | 평범한 코드 작성·짧은 분석 |
| `high` | 디버깅·중간 규모 리팩토링·심도 있는 분석 |
| `xhigh` | 어려운 reasoning·아키텍처 설계·복잡 문제 |
| `max` | 사장 디폴트. 분석/점검/구현 같은 본격 작업. |

사장 정책: **간단 잡일이 아닌 작업은 무조건 max**.

---

## 직군별 권장 매핑 (Phase 1 채택)

| 직군 | 모델 | effort | 사유 |
|---|---|---|---|
| **PM** (pm) | `claude-opus-4-7` | max | 사장과 직통 대화 + 분할 결정 + 통합 보고. 컨텍스트 끌고감, 추론력 핵심. |
| **개발자** (dev-*) | `claude-opus-4-6` | max | 코드 작성·리팩토링이 본업. 4.6이 코딩/agent 작업에 강함. |
| **기획자** (planner-*) | `claude-opus-4-7` | max | 분석/리서치/문서화. 긴 추론 + 1M context로 큰 문서 처리. |
| **QA** (qa-*) | `claude-sonnet-4-6` | high | 검증/리뷰는 반복 작업이라 비용 효율 중요. 깊이 필요 시 Opus 4.6로 승격. |
| **잡일** (utility-*) | `claude-haiku-4-5-20251001` | low~medium | 단순 분류/요약. 비용 거의 무료. |

PM이 일감 분류 후 적합한 직원에게 spawn. 직원이 본인 model로 작업.

---

## 토큰 최적화 가이드 (Phase 1 마무리 라운드)

- **prompt cache hit 극대화**: 시스템 프롬프트의 안정적 prefix를 길게 유지 (직원 카탈로그는 끝에 dynamic으로 붙이지 말고 안정적인 헤더로 고정). claude는 `cache_creation_input_tokens` / `cache_read_input_tokens`로 cache 효과 측정 가능 — statusbar에 노출 검토.
- **sub session context 분할**: PM이 본인 context에 모든 걸 짊어지지 말고, sub에는 "이 일감 + 필요한 파일 경로"만 던짐. 각 sub가 자기 작은 context로 시작.
- **`--exclude-dynamic-system-prompt-sections`**: per-machine 섹션(cwd/env/git status)을 첫 user message로 옮겨 cross-call cache 재사용 향상.
- **effort 다운그레이드**: PR review·간단 lookup 류는 `low`/`medium`.
- **모델 다운그레이드**: 단순 작업은 Sonnet/Haiku. PM이 일감 보고 자율 결정.
