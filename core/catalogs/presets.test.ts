import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { listCatalogs } from './loader.js';
import { isCatalogStale } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

const catalogs = listCatalogs(repoRoot);
const byId = new Map(catalogs.map((c) => [c.id, c]));
const employeeIds = new Set(
  readdirSync(resolve(repoRoot, 'core/employees'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, '')),
);

describe('catalog presets (2026-06-11 인건비표)', () => {
  it('preset 4종이 모두 로드된다', () => {
    expect([...byId.keys()].sort()).toEqual([
      'claude-only',
      'gpt-only',
      'mix-optimal',
      'pm-claude-rest-gpt',
    ]);
  });

  it('override 직원 id가 전부 core/employees에 실존한다', () => {
    for (const c of catalogs) {
      for (const empId of Object.keys(c.overrides)) {
        expect(employeeIds.has(empId), `${c.id}의 override ${empId}`).toBe(true);
      }
    }
  });

  it('주력 mix-optimal — PM fable-5 윈도우 + Codex는 qa-1 단일', () => {
    const mix = byId.get('mix-optimal')!;
    expect(mix.overrides['pm']).toMatchObject({ vendor: 'anthropic', model: 'claude-fable-5' });
    expect(mix.overrides['dev-1']).toMatchObject({ vendor: 'anthropic', model: 'claude-sonnet-4-6' });
    expect(mix.overrides['planner-1']).toMatchObject({ vendor: 'anthropic', model: 'claude-sonnet-4-6' });
    const openaiIds = Object.entries(mix.overrides)
      .filter(([, ov]) => ov.vendor === 'openai')
      .map(([id]) => id);
    expect(openaiIds).toEqual(['qa-1']);
    expect(mix.validUntil).toBe('2026-06-22'); // Fable 5 윈도우 종료일
  });

  it('ChatGPT Pro 전제 preset 2종은 assumes + validUntil로 stale 판단 가능', () => {
    for (const id of ['pm-claude-rest-gpt', 'gpt-only']) {
      const c = byId.get(id)!;
      expect(c.assumes ?? []).toContain('ChatGPT Pro');
      expect(c.validUntil).toBeTruthy();
    }
  });

  it('claude-only는 만료 없음 (Max 5x 전제 fallback)', () => {
    const c = byId.get('claude-only')!;
    expect(c.validUntil).toBeUndefined();
    for (const ov of Object.values(c.overrides)) {
      expect(ov.vendor).toBe('anthropic');
    }
  });
});

describe('isCatalogStale', () => {
  it('validUntil 없으면 false', () => {
    expect(isCatalogStale({})).toBe(false);
  });

  it('validUntil 당일까지는 유효, 다음날부터 stale', () => {
    const c = { validUntil: '2026-06-22' };
    expect(isCatalogStale(c, new Date(2026, 5, 22))).toBe(false);
    expect(isCatalogStale(c, new Date(2026, 5, 23))).toBe(true);
    expect(isCatalogStale(c, new Date(2026, 5, 11))).toBe(false);
  });
});
