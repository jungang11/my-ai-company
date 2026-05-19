import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { QuarterMeta } from './types.js';

const CURRENT_FILE = 'current.json';

function ensureDir(rootDir: string): string {
  const dir = path.join(rootDir, 'workspace', 'quarters');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function newQuarterId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Date.now().toString(36);
  return `${date}-${suffix}`;
}

export function loadCurrentQuarter(rootDir: string): QuarterMeta | null {
  const file = path.join(ensureDir(rootDir), CURRENT_FILE);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as QuarterMeta;
  } catch {
    return null;
  }
}

export function saveCurrentQuarter(rootDir: string, q: QuarterMeta): void {
  const file = path.join(ensureDir(rootDir), CURRENT_FILE);
  writeFileSync(file, JSON.stringify(q, null, 2), 'utf8');
}

// 종료된 분기를 `<quarterId>.json`로 보존. current.json은 호출자가 덮어쓰거나 비움.
export function archiveQuarter(rootDir: string, q: QuarterMeta): void {
  const file = path.join(ensureDir(rootDir), `${q.quarterId}.json`);
  writeFileSync(file, JSON.stringify(q, null, 2), 'utf8');
}

// sub-agent done 시 main에서 호출 — 현 분기에 sessionId 누적 (중복 skip).
export function appendSessionToCurrent(rootDir: string, sessionId: string): void {
  const cur = loadCurrentQuarter(rootDir);
  if (!cur) return;
  if (cur.sessionIds.includes(sessionId)) return;
  cur.sessionIds.push(sessionId);
  saveCurrentQuarter(rootDir, cur);
}

export function listArchivedQuarters(rootDir: string): QuarterMeta[] {
  const dir = ensureDir(rootDir);
  const result: QuarterMeta[] = [];
  for (const f of readdirSync(dir)) {
    if (f === CURRENT_FILE || !f.endsWith('.json')) continue;
    try {
      result.push(JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as QuarterMeta);
    } catch {
      // 손상된 archive는 skip — write-after-read 패턴이라 손상 드물 것
    }
  }
  return result.sort((a, b) => b.startedAt - a.startedAt);
}
