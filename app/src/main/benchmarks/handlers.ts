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

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

export function wireBenchmarksHandlers(): void {
  ipcMain.handle(IPC.benchmarksList, (): BenchmarkResults => loadResults(projectRoot));
  ipcMain.handle(
    IPC.benchmarksSetScore,
    (_evt, result: BenchmarkResult): BenchmarkResults => saveResult(projectRoot, result),
  );
}
