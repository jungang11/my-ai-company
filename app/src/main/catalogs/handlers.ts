import { ipcMain } from 'electron';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getActiveCatalogId,
  listCatalogs,
  setActiveCatalogId,
} from '@core/catalogs/loader';
import type { Catalog } from '@core/catalogs/types';
import { IPC } from '../../shared/ipc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

export function wireCatalogsHandlers(): void {
  ipcMain.handle(IPC.catalogsList, (): Catalog[] => listCatalogs(projectRoot));
  ipcMain.handle(IPC.catalogsActive, (): string => getActiveCatalogId(projectRoot));
  ipcMain.handle(IPC.catalogsSetActive, (_evt, id: string): string => {
    setActiveCatalogId(projectRoot, id);
    return id;
  });
}
