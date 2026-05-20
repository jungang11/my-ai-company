import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Catalog } from './types.js';

const ACTIVE_FILE = 'active-catalog.json';
const DEFAULT_CATALOG_ID = 'claude-only';

function catalogsDir(rootDir: string): string {
  return path.join(rootDir, 'core', 'catalogs');
}

function workspaceDir(rootDir: string): string {
  const dir = path.join(rootDir, 'workspace');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function listCatalogs(rootDir: string): Catalog[] {
  const dir = catalogsDir(rootDir);
  if (!existsSync(dir)) return [];
  const result: Catalog[] = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    try {
      result.push(JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as Catalog);
    } catch {
      // skip 손상 파일
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

export function getCatalog(rootDir: string, id: string): Catalog | null {
  const file = path.join(catalogsDir(rootDir), `${id}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Catalog;
  } catch {
    return null;
  }
}

export function getActiveCatalogId(rootDir: string): string {
  const file = path.join(workspaceDir(rootDir), ACTIVE_FILE);
  if (!existsSync(file)) return DEFAULT_CATALOG_ID;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8')) as { id?: string };
    return data.id ?? DEFAULT_CATALOG_ID;
  } catch {
    return DEFAULT_CATALOG_ID;
  }
}

export function setActiveCatalogId(rootDir: string, id: string): void {
  const file = path.join(workspaceDir(rootDir), ACTIVE_FILE);
  writeFileSync(file, JSON.stringify({ id }, null, 2), 'utf8');
}

export function getActiveCatalog(rootDir: string): Catalog | null {
  return getCatalog(rootDir, getActiveCatalogId(rootDir));
}
