import { ipcMain } from 'electron';
import {
  loadResults,
  saveResult,
  type BenchmarkResult,
  type BenchmarkResults,
} from '@core/benchmarks/storage';
import { IPC } from '../../shared/ipc.js';
import { getEmployee } from '../employee/manager.js';
import { getPMStatusSnapshot } from '../employee/pm-runner.js';
import { runtimeRoot } from '../paths.js';

/** 채점 시점 PM 모델 — 실측(snapshot) 우선, PM 미발화 시 catalog 기대값 fallback. */
function currentPMModel(): string | undefined {
  return getPMStatusSnapshot().model || getEmployee('pm')?.model || undefined;
}

export function wireBenchmarksHandlers(): void {
  ipcMain.handle(IPC.benchmarksList, (): BenchmarkResults => loadResults(runtimeRoot()));
  ipcMain.handle(
    IPC.benchmarksSetScore,
    (_evt, result: BenchmarkResult): BenchmarkResults =>
      saveResult(runtimeRoot(), { ...result, model: result.model ?? currentPMModel() }),
  );
}
