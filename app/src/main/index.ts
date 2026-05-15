import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PTYManager } from '@core/pty/manager';
import { IPC, type PMExitPayload, type PMOutputPayload } from '../shared/ipc.js';
import { killPM, sendToPM } from './employee/pm-runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// PTY 매니저는 PR6의 sub 세션용. PM은 별도 stream-json child_process로.
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
    });
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
  killPM();
  for (const s of ptyManager.list()) ptyManager.kill(s.id);
  if (process.platform !== 'darwin') app.quit();
});
