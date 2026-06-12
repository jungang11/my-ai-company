import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getActiveCatalog } from '@core/catalogs/loader';
import type { CatalogOverride } from '@core/catalogs/types';
import type { EmployeeEffort, EmployeeProfile as PublicProfile } from '../../shared/ipc.js';
import { appResourcesRoot, runtimeRoot } from '../paths.js';

const EMPLOYEES_DIR = resolve(appResourcesRoot(), 'core/employees');

export type { EmployeeEffort };

/** 내부 full profile — systemPrompt 포함. renderer에 보낼 땐 toPublic(). */
export type EmployeeProfile = PublicProfile & { systemPrompt: string };

export function toPublic(p: EmployeeProfile): PublicProfile {
  const { systemPrompt: _omit, ...rest } = p;
  void _omit;
  return rest;
}

/**
 * 활성 catalog의 직원 id별 override를 base profile에 merge.
 * vendor / model / effort 만 override (systemPrompt는 base 그대로 — cache hit 보존).
 */
function applyCatalogOverride(base: EmployeeProfile): EmployeeProfile {
  const catalog = getActiveCatalog(appResourcesRoot(), runtimeRoot());
  if (!catalog) return base;
  const override: CatalogOverride | undefined = catalog.overrides[base.id];
  if (!override) return base;
  return {
    ...base,
    ...(override.vendor !== undefined ? { vendor: override.vendor } : {}),
    ...(override.model !== undefined ? { model: override.model } : {}),
    ...(override.effort !== undefined ? { effort: override.effort } : {}),
  };
}

/**
 * core/employees/*.json 전부를 결정적 순서로 read. prompt cache hit 보존을 위해
 * 파일명 + id 두 단계 정렬. 활성 catalog override 적용.
 */
export function listEmployees(): EmployeeProfile[] {
  const files = readdirSync(EMPLOYEES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const entries = files
    .map((f) => {
      try {
        return JSON.parse(readFileSync(resolve(EMPLOYEES_DIR, f), 'utf-8')) as EmployeeProfile;
      } catch {
        return null;
      }
    })
    .filter((x): x is EmployeeProfile => x !== null)
    .map(applyCatalogOverride);
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

export function getEmployee(id: string): EmployeeProfile | null {
  const path = resolve(EMPLOYEES_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  try {
    const base = JSON.parse(readFileSync(path, 'utf-8')) as EmployeeProfile;
    return applyCatalogOverride(base);
  } catch {
    return null;
  }
}

/**
 * 직원의 active 필드만 토글하고 JSON 디스크에 즉시 반영.
 * pm은 토글 불가 (사장 직통 PM은 항상 활성).
 */
export function setActive(id: string, active: boolean): EmployeeProfile | null {
  if (id === 'pm') {
    throw new Error('PM은 항상 활성 — 토글 불가');
  }
  const path = resolve(EMPLOYEES_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  const emp = JSON.parse(readFileSync(path, 'utf-8')) as EmployeeProfile;
  emp.active = active;
  writeFileSync(path, `${JSON.stringify(emp, null, 2)}\n`, 'utf-8');
  return emp;
}
