# Model Routing Plan — 모델 vendor 전환 시스템

> 사장 안건 (2026-05-19): Claude Pro + GPT Pro 가정. 모델 vendor 딸깍 전환 + GPT/Codex 직군 매핑 + 토큰 사용량 추적.
> 상태: **draft**, 사장 검토 대기.

---

## 컨셉

현재 6직군이 Claude 모델에 하드코딩 (PM/dev-1/dev-arch/planner-1 = opus, qa-1 = sonnet, utility-1 = haiku). 사장이 Claude Pro로 다운그레이드 + GPT Pro 유지 시 직원 model 필드를 vendor 토글 한 번에 GPT/Codex로 swap. 토큰 사용량 임계치 도달 시 자동 권장.

**핵심 원칙**:
- 직원 메타포 보존 — 6명 직원은 그대로, model 필드만 vendor 전환.
- vendor 전환은 **사장 명시 토글** (시간 자동 X — 사장이 결정).
- 토큰 사용량은 Claude/GPT 각 vendor별 누적 추적.
- Codex CLI subprocess 패턴 (Phase 3 PR1~4에서 보류했던 외부 CLI 직원과 동일 메커니즘).

---

## GPT/Codex 모델 카탈로그 (2026-05 기준)

| 모델 | $/M input | $/M output | ctx | 강점 영역 | 출시 |
|---|---|---|---|---|---|
| **GPT-5.5** | $5 | $30 | 272K (이후 2x in / 1.5x out) | 가장 강한 reasoning, token-efficient | 2026 (frontier) |
| **GPT-5.4** | $2.50 | $15 | — | 일반 작업, 비용 효율 | 2026 |
| **GPT-5.3-Codex** | $1.75 | $14 | 400K | 코딩 특화, agent 모드 | 2026-02-24 |
| **GPT-5.3-Codex-Spark** | (preview) | (preview) | — | Codex variant, Pro 전용 research preview | 2026 (preview) |

**ChatGPT Pro 구독 한도** (2026-05):
- Plus 대비 5x 한도 (Pro $100 tier) / 20x 한도 (Pro $200 tier).
- Codex usage Plus 대비 **10x** (한정 — 2026-05-31까지 2x boost).
- GPT-5.5-Codex-Spark는 **Pro 전용 research preview** 접근.
- Plus 기준 GPT-5.5 메시지: 160/3h, thinking 3000/주.

**Codex CLI 통합**:
- `@openai/codex` npm package — Rust binary wrapped TypeScript SDK (Node 18+).
- subprocess spawn + JSONL stdin/stdout (claude CLI와 동일 패턴).
- 환경변수 `CODEX_API_KEY` 또는 OAuth ChatGPT Pro 연동.
- payroll-os `core/spawn/` watcher 패턴 그대로 재사용 가능.

출처: [openai.com/api/pricing](https://openai.com/api/pricing/), [GPT-5.5 in ChatGPT](https://help.openai.com/en/articles/11909943-gpt-5-in-chatgpt), [Codex CLI](https://developers.openai.com/codex/cli), [@openai/codex npm](https://www.npmjs.com/package/@openai/codex), [GPT-5.3-Codex blog](https://openai.com/index/introducing-gpt-5-3-codex/).

---

## 직군 매핑 (Claude 6직군 ↔ GPT/Codex 6직군)

| 직원 | 현 Claude | 추천 GPT/Codex | 근거 |
|---|---|---|---|
| PM (박PM) | claude-opus-4-7 xhigh | **GPT-5.5** (reasoning high) | 사장 직통, 자율 분배에 reasoning 깊이 critical. GPT-5.5가 GPT-5.4보다 token-efficient라 Pro 한도 안에서 운용 OK. |
| dev-1 (김개발) | claude-opus | **GPT-5.3-Codex** | 일상 코드, Codex 특화 + 비용 효율 ($1.75/$14). |
| dev-arch (박아키) | claude-opus | **GPT-5.5** 또는 **GPT-5.3-Codex** max-reasoning | 아키텍처 추론 critical. 비용 trade-off — Codex max로 ↑, 정말 깊은 추론 필요시 GPT-5.5. |
| planner-1 (이기획) | claude-opus + WebSearch | **GPT-5.5** (with browse) | 외부 리서치 + 긴 추론. browse 도구 통합 필요. |
| qa-1 (정검증) | claude-sonnet-4 | **GPT-5.4** 또는 **GPT-5.3-Codex** | 검증 작업, 비용 효율 우선. |
| utility-1 (막내) | claude-haiku-4-5 | **GPT-5.3-Codex-Spark** (Pro 전용 preview) | 가장 저렴, 단순 잡일. preview라 fallback 필요 시 GPT-5.4-mini. |

**충돌 영역**:
- Codex는 코딩 특화라 planner-1(리서치/문서) / utility-1(단순 lookup)엔 over-spec일 수 있음 → GPT-5.4 류 일반 모델이 더 적합.
- Claude haiku 같은 초경량 vendor neutral 등가물 없음 — Spark가 preview라 정식 출시 후 재평가.

---

## 토큰 사용량 추적 설계

현재 `StatusBar` + `UsagePanel`은 Claude 누적만. GPT/Codex 도입 시 vendor별 분리 필요.

### 데이터 model
```ts
// shared/ipc.ts 확장
export type VendorUsage = {
  vendor: 'anthropic' | 'openai';
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
  /** 구독 한도 대비 사용률 (0~1). 임계치 0.8 이상 시 사장 알림 */
  quotaUsedRatio?: number;
};

export type StatusSnapshot = {
  // 기존 필드 +
  anthropic: VendorUsage;
  openai: VendorUsage;
};
```

### 한도 추적
- **Anthropic**: 기존 `rate_limit_event` (5h / 7d) 그대로.
- **OpenAI**: ChatGPT Pro는 weekly cap (Codex 10x Plus). API 호출 시 헤더 `x-ratelimit-*` 파싱 또는 [Usage API](https://platform.openai.com/usage) polling.

### 임계 알림
- 한 vendor의 quotaUsedRatio ≥ 0.8 시 PM이 사장에게 시스템 알림 (enqueueSystemMessage):
  ```
  [system 알림: Claude 한도 80% 도달]
  남은 5h reset: 1h 23m
  GPT 한도: 30% — 전환 권장? (분기 관리에서 vendor 토글)
  ```
- 사장이 명시 토글 후 직원 model 일괄 swap.

### UI 변경
- **StatusBar**: `cache hit%` 옆에 vendor 두 줄 (Anthropic / OpenAI 각각 cost + ratio).
- **UsagePanel scope**: 기존 (전체 / 현 분기) + (vendor: all / anthropic / openai) 추가 dimension.
- **header**: vendor 토글 chip 2개. 둘 다 active면 mixed (직원별 vendor catalog 따름).

---

## 전환 UI 설계

### 옵션 A — header 토글 chip
- StatusBar 옆에 `[Anthropic ✓] [OpenAI ⌀]` chip. 클릭 시 vendor catalog swap.
- 단순. 다만 직원별 mix(예: PM만 Claude + 나머지 GPT) 표현 어려움.

### 옵션 B — 직원별 vendor 필드 (모달)
- "직원 명부" 카드 클릭 → 모달에서 vendor + model 선택.
- 세밀하지만 사장 부담 ↑ (사장은 PM 짓 싫어함).

### 옵션 C — catalog preset (추천)
- 사장이 사전 정의된 catalog 골라 일괄 적용:
  - `claude-only`: 현재 default
  - `gpt-only`: 6명 다 GPT/Codex
  - `pm-claude-rest-gpt`: PM만 Claude (사장 직통은 정확도 critical), 나머지 GPT (비용)
  - `mix-optimal`: 사장이 분기마다 조정
- header에 catalog 선택 dropdown. preset 적용 시 모든 직원 model 필드 swap.

**추천**: 옵션 C — preset 기반 + 사장이 명시 catalog 선택. 사장 결정 부담 적고 mix 표현 가능.

---

## PR 분해 (자율 진행 가능)

### PR1 — vendor 추상화 (S)
- `shared/ipc.ts`에 `Vendor = 'anthropic' | 'openai'` 추가
- `core/employees/*.json`에 `vendor` field 추가 (default `anthropic`)
- `.claude/agents/*.md` frontmatter는 Claude 전용 — GPT 직원은 별도 spawn 메커니즘 필요 (PR3)

### PR2 — catalog preset 시스템 (M)
- `core/catalogs/` 신규 — preset JSON 파일들
- catalog preset switcher UI (StatusBar 또는 header)
- 선택 시 모든 직원 model + vendor 일괄 swap

### PR3 — Codex CLI subprocess spawn (M)
- `@openai/codex` 의존성 추가
- `core/spawn/` watcher에 Codex 직원 분기 추가
- PM이 GPT 직원에 위임 시 `Write` 도구로 `workspace/spawn-request/<uuid>.json` (Phase 3 fallback 패턴) 또는 직접 codex CLI spawn
- 단순화: PR3 minimal은 Codex 1명만 (예: gpt-codex-1) 도입 → 동작 확인 후 확장

### PR4 — vendor별 토큰 추적 (M)
- `core/usage/` 신규 모듈 — vendor별 누적
- StatusBar 두 vendor 줄
- UsagePanel scope에 vendor dimension 추가

### PR5 — 임계 알림 (S)
- quotaUsedRatio ≥ 0.8 시 PM에 enqueueSystemMessage
- 사장에게 "vendor X 한도 80%, Y로 전환 권장" 짧은 보고

### PR6 — preset catalog 정착 (S)
- 4개 preset JSON 정의 (claude-only / gpt-only / pm-claude-rest-gpt / mix-optimal)
- 사장이 분기마다 토글하는 UX 흐름

---

## 리스크 + 대안

| 리스크 | 대안 |
|---|---|
| Codex CLI OAuth (ChatGPT Pro 연동)이 Electron에서 동작 X | API key fallback (`CODEX_API_KEY` env), 사장이 .env에 박음 |
| GPT 모델 응답 형식이 Claude와 달라 PM 통합 보고 깨짐 | vendor-aware parser + 각 vendor용 시스템 프롬프트 catalog |
| OpenAI usage API polling이 너무 무거움 | 헤더 기반 rate limit 추적 + 24h 1회 usage API sync |
| Spark가 preview라 갑자기 종료 | utility-1 GPT 매핑은 GPT-5.4-mini fallback 준비 |
| PM 자율 분배가 vendor 인지 X → 잘못된 위임 | PM 시스템 프롬프트에 vendor 인지 섹션 추가 (분기 인지 패턴과 동일) |

---

## 의도적 제외

- **vendor 자동 전환** — 사장 명시 토글만. 자동 fallback X (예측 못 한 모델 swap 위험).
- **모델 router LLM** — 비용 대비 가치 약함. preset catalog가 더 단순.
- **다른 vendor (Gemini, DeepSeek 등)** — Phase 3 plan에서 Gemini 보류. GPT/Codex 도입 후 사장 결정.
- **OpenAI Realtime / Voice 모델** — 본 plan은 코딩 직원 중심. Voice는 별도 안건.

---

## 사장 결정 안건

1. **GPT 인증 방식** — Codex CLI OAuth (ChatGPT Pro 로그인) vs API key (`CODEX_API_KEY` env). 추천: **둘 다 지원, OAuth 우선 + API key fallback**.
2. **PR 진행 순서** — PR1/2 (인프라+preset) 먼저 → PR3 (실제 Codex spawn)? 또는 PR1/3 동시? 추천: **순차** (인프라 안정 후 spawn).
3. **첫 시연 catalog** — `pm-claude-rest-gpt` (PM만 Claude)? `gpt-only` (전부 GPT)? 추천: **mix preset 사장이 결정 후 진입**.
4. **utility-1 GPT 매핑** — Spark preview vs GPT-5.4-mini stable. 추천: **Spark 우선 + Spark unavailable 시 5.4-mini fallback**.

---

## 다음 단계

사장 검토 후:
- 안건 1~4 결정 통보 (또는 본인 추천 OK)
- PR1부터 진행 (vendor 추상화 — `shared/ipc.ts` + `core/employees/*.json` field 추가)

## 출처

- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [Introducing GPT-5.5](https://openai.com/index/introducing-gpt-5-5/)
- [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)
- [GPT-5.5 in ChatGPT](https://help.openai.com/en/articles/11909943-gpt-5-in-chatgpt)
- [About ChatGPT Pro tiers](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)
- [Codex Pricing (ChatGPT)](https://chatgpt.com/codex/pricing/)
- [Codex CLI Reference](https://developers.openai.com/codex/cli)
- [@openai/codex npm](https://www.npmjs.com/package/@openai/codex)
- [Codex SDK](https://developers.openai.com/codex/sdk)
- [GPT-5.3 Codex API Pricing](https://pricepertoken.com/pricing-page/model/openai-gpt-5.3-codex)
- [DevTk.AI: OpenAI API Pricing Guide 2026](https://devtk.ai/en/blog/openai-api-pricing-guide-2026/)
- [Non-interactive mode — Codex](https://developers.openai.com/codex/noninteractive)
