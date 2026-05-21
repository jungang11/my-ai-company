import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type Score = 'pass' | 'partial' | 'fail';

export type BenchmarkResult = {
  scenarioId: string;
  score: Score;
  catalogId: string;
  ts: number;
  note?: string;
};

export type BenchmarkResults = {
  /** scenarioId + catalogId → 최근 평가만 보존. 히스토리 별도 안건. */
  results: Record<string, BenchmarkResult>;
};

const FILE = 'benchmark-results.json';

function workspaceDir(rootDir: string): string {
  const dir = path.join(rootDir, 'workspace');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function fileKey(scenarioId: string, catalogId: string): string {
  return `${scenarioId}::${catalogId}`;
}

export function loadResults(rootDir: string): BenchmarkResults {
  const file = path.join(workspaceDir(rootDir), FILE);
  if (!existsSync(file)) return { results: {} };
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as BenchmarkResults;
  } catch {
    return { results: {} };
  }
}

export function saveResult(rootDir: string, result: BenchmarkResult): BenchmarkResults {
  const file = path.join(workspaceDir(rootDir), FILE);
  const data = loadResults(rootDir);
  data.results[fileKey(result.scenarioId, result.catalogId)] = result;
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  return data;
}
