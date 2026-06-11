import type { EffortLevel } from '../employees/types.js';

export type Vendor = 'anthropic' | 'openai';

/** 직원 id별 vendor + model + effort override. systemPrompt는 base 그대로 (cache hit 보존). */
export type CatalogOverride = {
  vendor?: Vendor;
  model?: string;
  effort?: EffortLevel;
  /** vendor=openai 시 fallback model (예: spark unavailable → 5.4-mini) */
  fallbackModel?: string;
};

export type Catalog = {
  id: string;
  name: string;
  description: string;
  /** 이 preset이 전제하는 구독 (예: "Claude Max 5x", "ChatGPT Pro"). 구독 변경 시 stale 판단 근거. */
  assumes?: string[];
  /** 전제 구독/모델이 만료되는 날짜 (YYYY-MM-DD, inclusive). 지나면 UI에서 stale 표시. */
  validUntil?: string;
  overrides: Record<string, CatalogOverride>;
};

/** validUntil이 지난 preset인지. YYYY-MM-DD 문자열 비교 (로컬 날짜 기준). */
export function isCatalogStale(catalog: Pick<Catalog, 'validUntil'>, today = new Date()): boolean {
  if (!catalog.validUntil) return false;
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return catalog.validUntil < `${yyyy}-${mm}-${dd}`;
}
