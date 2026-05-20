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
  overrides: Record<string, CatalogOverride>;
};
