import { ipcMain } from 'electron';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadResults,
  saveResult,
  type BenchmarkResult,
  type BenchmarkResults,
} from '@core/benchmarks/storage';
import { IPC } from '../../shared/ipc.js';
import { getEmployee } from '../employee/manager.js';
import { getPMStatusSnapshot } from '../employee/pm-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

/** 채점 시점 PM 모델 — 실측(snapshot) 우선, PM 미발화 시 catalog 기대값 fallback. */
function currentPMModel(): string | undefined {
  return getPMStatusSnapshot().model || getEmployee('pm')?.model || undefined;
}

export function wireBenchmarksHandlers(): void {
  ipcMain.handle(IPC.benchmarksList, (): BenchmarkResults => loadResults(projectRoot));
  ipcMain.handle(
    IPC.benchmarksSetScore,
    (_evt, result: BenchmarkResult): BenchmarkResults =>
      saveResult(projectRoot, { ...result, model: result.model ?? currentPMModel() }),
  );
}
