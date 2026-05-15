import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RateLimitInfo, StatusInit, StatusSnapshot } from '../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

export function readProjectName(): string {
  const pkgPath = resolve(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string };
      if (pkg.name) return pkg.name;
    } catch {
      /* fallthrough */
    }
  }
  return basename(projectRoot);
}

export function readBranch(): string {
  try {
    const out = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() || '(detached)';
  } catch {
    return '(no git)';
  }
}

export function getStatusInit(): StatusInit {
  return {
    projectName: readProjectName(),
    branch: readBranch(),
  };
}

/**
 * stream-json output을 라인 단위로 받아 누적된 StatusSnapshot을 유지하는 클래스.
 * PM과 sub 세션 각각 인스턴스를 별도로 유지하거나, 글로벌 누적용으로 하나만 둘 수도.
 */
export class StatusTracker {
  private model = '';
  private contextWindow = 1_000_000;
  private totalInput = 0;
  private totalOutput = 0;
  private totalCost = 0;
  private lastInput = 0;
  private lastOutput = 0;
  private lastCacheCreation = 0;
  private lastCacheRead = 0;
  private rateLimits = new Map<string, RateLimitInfo>();

  constructor(public source: string) {}

  ingest(event: Record<string, unknown>): void {
    const type = event['type'];

    if (type === 'system' && event['subtype'] === 'init') {
      if (typeof event['model'] === 'string') this.model = event['model'];
      return;
    }

    if (type === 'rate_limit_event') {
      const info = event['rate_limit_info'] as Record<string, unknown> | undefined;
      if (info) {
        const rateLimitType = String(info['rateLimitType'] ?? 'unknown');
        const status = String(info['status'] ?? 'unknown');
        const resetsAt = typeof info['resetsAt'] === 'number' ? info['resetsAt'] : 0;
        this.rateLimits.set(rateLimitType, {
          type: rateLimitType,
          status,
          resetsAtMs: resetsAt * 1000, // claude는 epoch seconds로 줌
        });
      }
      return;
    }

    if (type === 'result') {
      const usage = event['usage'] as Record<string, unknown> | undefined;
      const modelUsage = event['modelUsage'] as Record<string, unknown> | undefined;
      const cost = typeof event['total_cost_usd'] === 'number' ? event['total_cost_usd'] : 0;

      if (usage) {
        const input = num(usage['input_tokens']);
        const output = num(usage['output_tokens']);
        const cacheCreate = num(usage['cache_creation_input_tokens']);
        const cacheRead = num(usage['cache_read_input_tokens']);
        this.lastInput = input;
        this.lastOutput = output;
        this.lastCacheCreation = cacheCreate;
        this.lastCacheRead = cacheRead;
        this.totalInput += input + cacheCreate;
        this.totalOutput += output;
      }

      this.totalCost += cost;

      if (modelUsage) {
        for (const [modelId, info] of Object.entries(modelUsage)) {
          const inf = info as Record<string, unknown>;
          if (typeof inf['contextWindow'] === 'number') {
            this.contextWindow = inf['contextWindow'];
          }
          if (!this.model && modelId) this.model = modelId;
        }
      }
      return;
    }
  }

  snapshot(): StatusSnapshot {
    return {
      model: this.model,
      lastInputTokens: this.lastInput,
      lastOutputTokens: this.lastOutput,
      lastCacheCreationTokens: this.lastCacheCreation,
      lastCacheReadTokens: this.lastCacheRead,
      totalInputTokens: this.totalInput,
      totalOutputTokens: this.totalOutput,
      totalCostUsd: this.totalCost,
      contextWindow: this.contextWindow,
      rateLimits: [...this.rateLimits.values()],
      source: this.source,
      updatedAtMs: Date.now(),
    };
  }
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}
