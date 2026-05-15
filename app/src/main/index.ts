import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PTYManager } from '@core/pty/manager';
import { IPC, type PMExitPayload, type PMOutputPayload } from '../shared/ipc.js';
import { PM_SESSION_ID, spawnPM } from './employee/spawn-pm.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ptyManager = new PTYManager();
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
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function wirePM(): void {
  spawnPM(ptyManager);

  ptyManager.subscribe(PM_SESSION_ID, (event) => {
    if (!mainWindow) return;
    if (event.kind === 'data') {
      const payload: PMOutputPayload = { text: event.data };
      mainWindow.webContents.send(IPC.pmOutput, payload);
    } else if (event.kind === 'exit') {
      const payload: PMExitPayload = { exitCode: event.exitCode };
      mainWindow.webContents.send(IPC.pmExit, payload);
    }
  });

  ipcMain.handle(IPC.pmSend, (_evt, text: string) => {
    if (!ptyManager.has(PM_SESSION_ID)) {
      throw new Error('PM session not running');
    }
    // PowerShell ReadLine은 줄 단위 — 개행 보장
    const payload = text.endsWith('\n') ? text : `${text}\n`;
    ptyManager.write(PM_SESSION_ID, payload);
  });
}

app.whenReady().then(() => {
  createOffice();

  // renderer가 준비된 뒤에 PM 출근시켜야 첫 메시지가 채팅창에 도달
  mainWindow?.webContents.once('did-finish-load', () => {
    wirePM();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOffice();
      mainWindow?.webContents.once('did-finish-load', () => {
        wirePM();
      });
    }
  });
});

app.on('window-all-closed', () => {
  ptyManager.kill(PM_SESSION_ID);
  if (process.platform !== 'darwin') app.quit();
});
