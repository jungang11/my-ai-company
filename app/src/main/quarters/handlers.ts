import { ipcMain } from 'electron';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  archiveQuarter,
  listArchivedQuarters,
  loadCurrentQuarter,
  newQuarterId,
  saveCurrentQuarter,
} from '@core/quarters/storage';
import type { QuarterMeta } from '@core/quarters/types';
import { IPC } from '../../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../../..');

function ensureCurrent(): QuarterMeta {
  let cur = loadCurrentQuarter(projectRoot);
  if (!cur) {
    cur = {
      quarterId: newQuarterId(),
      title: 'Untitled',
      startedAt: Date.now(),
      sessionIds: [],
    };
    saveCurrentQuarter(projectRoot, cur);
  }
  return cur;
}

export function wireQuartersHandlers(): void {
  ipcMain.handle(IPC.quartersCurrent, (): QuarterMeta => ensureCurrent());

  ipcMain.handle(
    IPC.quartersStart,
    (_evt, args: { title: string; description?: string }): QuarterMeta => {
      const prev = loadCurrentQuarter(projectRoot);
      if (prev) {
        archiveQuarter(projectRoot, { ...prev, endedAt: Date.now() });
      }
      const next: QuarterMeta = {
        quarterId: newQuarterId(),
        title: args.title.trim() || 'Untitled',
        ...(args.description?.trim() ? { description: args.description.trim() } : {}),
        startedAt: Date.now(),
        sessionIds: [],
      };
      saveCurrentQuarter(projectRoot, next);
      return next;
    },
  );

  ipcMain.handle(IPC.quartersList, (): QuarterMeta[] => listArchivedQuarters(projectRoot));
}
