import { ipcMain } from 'electron';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getActiveCatalogId,
  getCatalog,
  listCatalogs,
  setActiveCatalogId,
} from '@core/catalogs/loader';
import type { Catalog } from '@core/catalogs/types';
import { IPC } from '../../shared/ipc.js';
import { enqueueSystemMessage, type PMCallbacks } from '../employee/pm-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

export function wireCatalogsHandlers(pmCallbacks: PMCallbacks): void {
  ipcMain.handle(IPC.catalogsList, (): Catalog[] => listCatalogs(projectRoot));
  ipcMain.handle(IPC.catalogsActive, (): string => getActiveCatalogId(projectRoot));
  ipcMain.handle(IPC.catalogsSetActive, (_evt, id: string): string => {
    setActiveCatalogId(projectRoot, id);

    // catalog 변경 시 PM에 vendor 매핑 통지 — busy 시 큐 적재.
    const catalog = getCatalog(projectRoot, id);
    if (catalog) {
      const mapping = Object.entries(catalog.overrides)
        .map(([empId, ov]) => `- ${empId}: vendor=${ov.vendor ?? '?'} model=${ov.model ?? '?'}`)
        .join('\n');
      const sysMsg =
        `[system 알림: catalog 변경]\n` +
        `새 catalog: ${catalog.name} (${id})\n` +
        `${catalog.description}\n\n` +
        `직원 vendor 매핑:\n${mapping}\n\n` +
        `spawn 패턴:\n` +
        `- vendor=anthropic 직원: 기존 Task tool spawn (claude sub-agent)\n` +
        `- vendor=openai 직원: Write 도구로 workspace/spawn-request/<uuid>.json 작성 → chokidar watcher가 잡아 codex CLI subprocess spawn\n` +
        `  형식: { "id": "<uuid>", "employeeId": "<id>", "prompt": "<일감>" }\n\n` +
        `이 메시지는 app 자동 주입. 사장에게 "catalog '${catalog.name}' 인지함" 한 줄로 응답하면 끝.`;
      enqueueSystemMessage(sysMsg, pmCallbacks);
    }

    return id;
  });
}
