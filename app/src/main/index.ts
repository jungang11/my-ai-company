import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  IPC,
  type PMExitPayload,
  type PMOutputPayload,
  type RosterUpdatePayload,
  type StatusInit,
  type StatusSnapshot,
} from '../shared/ipc.js';
import { killPM, sendToPM } from './employee/pm-runner.js';
import { killAllSubs } from './spawn/runner.js';
import { startSpawnWatcher, stopSpawnWatcher } from './spawn/watcher.js';
import { getStatusInit } from './status.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createOffice(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'payroll-os',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
  });

  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    // DevTools 자동 오픈 안 함. 필요하면 Ctrl+Shift+I 또는 F12.
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function wireSpawnWatcher(): void {
  startSpawnWatcher((update) => {
    if (!mainWindow) return;
    let payload: RosterUpdatePayload;
    if (update.kind === 'started') {
      payload = {
        kind: 'started',
        sessionId: update.sessionId,
        employeeId: update.employee.id,
        employeeName: update.employee.name,
        role: update.employee.role,
        prompt: update.prompt,
        startedAt: update.startedAt,
      };
    } else if (update.kind === 'chunk') {
      payload = { kind: 'chunk', sessionId: update.sessionId, text: update.text };
    } else {
      payload = {
        kind: 'done',
        sessionId: update.sessionId,
        exitCode: update.exitCode,
        endedAt: update.endedAt,
      };
    }
    mainWindow.webContents.send(IPC.rosterUpdate, payload);
  });
}

function wirePM(): void {
  ipcMain.handle(IPC.pmSend, (_evt, text: string) => {
    sendToPM(text, {
      onChunk: (chunk) => {
        if (!mainWindow) return;
        const payload: PMOutputPayload = { text: chunk };
        mainWindow.webContents.send(IPC.pmOutput, payload);
      },
      onError: (err) => {
        if (!mainWindow) return;
        const payload: PMOutputPayload = { text: `\n[claude stderr] ${err}\n` };
        mainWindow.webContents.send(IPC.pmOutput, payload);
      },
      onDone: ({ exitCode, ok, reason }) => {
        if (!mainWindow) return;
        if (!ok && reason) {
          const payload: PMOutputPayload = { text: `\n[PM 응답 실패: ${reason}]\n` };
          mainWindow.webContents.send(IPC.pmOutput, payload);
        }
        const payload: PMExitPayload = { exitCode };
        mainWindow.webContents.send(IPC.pmExit, payload);
      },
      onStatus: (snapshot) => {
        if (!mainWindow) return;
        const payload: StatusSnapshot = snapshot;
        mainWindow.webContents.send(IPC.statusUpdate, payload);
      },
    });
  });

  ipcMain.handle(IPC.statusInit, () => {
    const init: StatusInit = getStatusInit();
    return init;
  });
}

app.whenReady().then(() => {
  createOffice();

  // renderer가 준비된 뒤에 PM 출근 + sub 직원 watcher 시작
  mainWindow?.webContents.once('did-finish-load', () => {
    wirePM();
    wireSpawnWatcher();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOffice();
      mainWindow?.webContents.once('did-finish-load', () => {
        wirePM();
        wireSpawnWatcher();
      });
    }
  });
});

app.on('window-all-closed', async () => {
  killPM();
  killAllSubs();
  await stopSpawnWatcher();
  if (process.platform !== 'darwin') app.quit();
});
