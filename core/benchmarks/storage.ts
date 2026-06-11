import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type Score = 'pass' | 'partial' | 'fail';

export type BenchmarkResult = {
  scenarioId: string;
  score: Score;
  catalogId: string;
  ts: number;
  note?: string;
  /** 채점 시점 PM 모델 (실측 우선, 없으면 catalog 기대값). fable-5 기준점 vs opus-4-8 회귀 비교용. */
  model?: string;
};

export type BenchmarkResults = {
  /** scenarioId::catalogId → 평가 history (최근 N개). */
  results: Record<string, BenchmarkResult[]>;
};

const FILE = 'benchmark-results.json';
const HISTORY_LIMIT = 10;

function workspaceDir(rootDir: string): string {
  const dir = path.join(rootDir, 'workspace');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function fileKey(scenarioId: string, catalogId: string): string {
  return `${scenarioId}::${catalogId}`;
}

/** 이전 포맷(single result) → array 자동 migrate. */
function migrate(raw: unknown): BenchmarkResults {
  if (!raw || typeof raw !== 'object') return { results: {} };
  const obj = raw as Record<string, unknown>;
  const results = obj['results'];
  if (!results || typeof results !== 'object') return { results: {} };
  const out: Record<string, BenchmarkResult[]> = {};
  for (const [k, v] of Object.entries(results as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      out[k] = v as BenchmarkResult[];
    } else if (v && typeof v === 'object') {
      out[k] = [v as BenchmarkResult];
    }
  }
  return { results: out };
}

export function loadResults(rootDir: string): BenchmarkResults {
  const file = path.join(workspaceDir(rootDir), FILE);
  if (!existsSync(file)) return { results: {} };
  try {
    return migrate(JSON.parse(readFileSync(file, 'utf8')));
  } catch {
    return { results: {} };
  }
}

export function saveResult(rootDir: string, result: BenchmarkResult): BenchmarkResults {
  const file = path.join(workspaceDir(rootDir), FILE);
  const data = loadResults(rootDir);
  const key = fileKey(result.scenarioId, result.catalogId);
  const arr = data.results[key] ?? [];
  arr.push(result);
  // 최근 HISTORY_LIMIT개만 보존.
  data.results[key] = arr.slice(-HISTORY_LIMIT);
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  return data;
}
