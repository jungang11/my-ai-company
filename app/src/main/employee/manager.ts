import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');
const EMPLOYEES_DIR = resolve(projectRoot, 'core/employees');

export type EmployeeEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export type EmployeeProfile = {
  id: string;
  name: string;
  role: string;
  cliBackend: string;
  model?: string;
  effort?: EmployeeEffort;
  shortDescription?: string;
  systemPrompt: string;
  active: boolean;
};

/**
 * core/employees/*.json 전부를 결정적 순서로 read. prompt cache hit 보존을 위해
 * 파일명 + id 두 단계 정렬.
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
    .filter((x): x is EmployeeProfile => x !== null);
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

export function getEmployee(id: string): EmployeeProfile | null {
  const path = resolve(EMPLOYEES_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as EmployeeProfile;
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
