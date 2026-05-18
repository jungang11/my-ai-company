import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  IPC,
  type EmployeeProfile,
  type PMExitPayload,
  type PMOutputPayload,
  type RosterUpdatePayload,
  type StatusInit,
  type StatusSnapshot,
} from '../shared/ipc.js';
import { enqueueSystemMessage, killPM, sendToPM, type PMCallbacks } from './employee/pm-runner.js';
import { listEmployees, setActive, toPublic } from './employee/manager.js';
import { killAllSubs } from './spawn/runner.js';
import { startSpawnWatcher, stopSpawnWatcher } from './spawn/watcher.js';
import { getStatusInit } from './status.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

// PM 응답을 renderer로 흘려보내는 콜백 집합. wirePM에서 사장의 ipcMain.handle을 통해 호출되거나,
// wireSpawnWatcher가 sub 직원 done 시 enqueueSystemMessage로 자동 트리거할 때 동일 콜백을 재사용.
const pmCallbacks: PMCallbacks = {
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
};

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
      // sub 세션이 정상 종료되면 PM에 자동 시스템 메시지 주입 — output.log 읽어 사장에게 보고.
      // PM이 busy면 큐에 적재, idle 되면 자동 flush.
      if (update.exitCode === 0) {
        const sysMsg =
          `[system 알림: sub 직원 작업 완료]\n` +
          `sessionId: ${update.sessionId}\n` +
          `결과 파일: workspace/sessions/${update.sessionId}/output.log\n` +
          `done 마커: workspace/sessions/${update.sessionId}/done\n\n` +
          `위 output.log를 Read 도구로 읽어서, 사장이 시킨 일감의 결과를 한국어로 1~3문장 요약 보고해. ` +
          `사장이 직접 보낸 메시지가 아니라 app이 자동 주입한 신호다.`;
        enqueueSystemMessage(sysMsg, pmCallbacks);
      }
    }
    mainWindow.webContents.send(IPC.rosterUpdate, payload);
  });
}

function wirePM(): void {
  ipcMain.handle(IPC.pmSend, (_evt, text: string) => {
    sendToPM(text, pmCallbacks);
  });

  ipcMain.handle(IPC.statusInit, () => {
    const init: StatusInit = getStatusInit();
    return init;
  });
}

function wireEmployeeRegistry(): void {
  ipcMain.handle(IPC.employeeList, (): EmployeeProfile[] => {
    return listEmployees().map(toPublic);
  });

  ipcMain.handle(
    IPC.employeeToggle,
    (_evt, id: string, active: boolean): EmployeeProfile | null => {
      try {
        const updated = setActive(id, active);
        if (!updated) return null;
        const publicProfile = toPublic(updated);
        // 다른 창/리스너 알림 (현재는 단일 창이지만 future-proof)
        mainWindow?.webContents.send(IPC.employeeChanged, publicProfile);
        return publicProfile;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(msg);
      }
    },
  );
}

app.whenReady().then(() => {
  createOffice();

  // renderer가 준비된 뒤에 PM 출근 + sub 직원 watcher 시작
  mainWindow?.webContents.once('did-finish-load', () => {
    wirePM();
    wireSpawnWatcher();
    wireEmployeeRegistry();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOffice();
      mainWindow?.webContents.once('did-finish-load', () => {
        wirePM();
        wireSpawnWatcher();
        wireEmployeeRegistry();
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
