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
import { getEmployee, listEmployees, setActive, toPublic } from './employee/manager.js';
import { wireQuartersHandlers } from './quarters/handlers.js';
import { loadHistoricalSessions, persistSubSession } from './sessions/historical.js';
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
  onSubAgentStarted: (info) => {
    // started 시점에 startedAt 별도 보관 — persist 시 사용.
    pendingSubStarts.set(info.taskId, {
      employeeId: info.subagentType,
      prompt: info.prompt,
      startedAt: info.startedAt,
    });
    if (!mainWindow) return;
    const emp = getEmployee(info.subagentType);
    const payload: RosterUpdatePayload = {
      kind: 'started',
      sessionId: info.taskId,
      employeeId: info.subagentType,
      employeeName: emp?.name ?? info.subagentType,
      role: emp?.role ?? '?',
      prompt: info.prompt,
      startedAt: info.startedAt,
      ...(emp?.model ? { model: emp.model } : {}),
    };
    mainWindow.webContents.send(IPC.rosterUpdate, payload);
  },
  onSubAgentDone: (info) => {
    const metrics = {
      inputTokens: info.inputTokens,
      outputTokens: info.outputTokens,
      cacheReadTokens: info.cacheReadTokens,
      cacheCreationTokens: info.cacheCreationTokens,
      costUsd: 0,
    };

    // 영속화 (앱 재시작 후 historical 복원용)
    const pending = pendingSubStarts.get(info.taskId);
    if (pending) {
      pendingSubStarts.delete(info.taskId);
      const emp = getEmployee(info.subagentType);
      try {
        persistSubSession({
          sessionId: info.taskId,
          employeeId: info.subagentType,
          employeeName: emp?.name ?? info.subagentType,
          role: emp?.role ?? '?',
          prompt: pending.prompt,
          output: info.output,
          metrics,
          startedAt: pending.startedAt,
          endedAt: info.endedAt,
          exitCode: 0,
        });
      } catch (err) {
        console.warn('[sessions] persist 실패:', err);
      }
    }

    if (!mainWindow) return;
    // 1) output 전체를 한 chunk로 먼저 보냄 (카드 미리보기 + 모달에 표시)
    const chunkPayload: RosterUpdatePayload = {
      kind: 'chunk',
      sessionId: info.taskId,
      text: info.output,
    };
    mainWindow.webContents.send(IPC.rosterUpdate, chunkPayload);
    // 2) done emit (metrics 포함)
    const donePayload: RosterUpdatePayload = {
      kind: 'done',
      sessionId: info.taskId,
      exitCode: 0,
      endedAt: info.endedAt,
      metrics,
    };
    mainWindow.webContents.send(IPC.rosterUpdate, donePayload);
  },
};

/** Task tool sub-agent의 started~done 사이 메타데이터 보관 — done 시 persist에 사용. */
const pendingSubStarts = new Map<
  string,
  { employeeId: string; prompt: string; startedAt: number }
>();

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
        ...(update.employee.model ? { model: update.employee.model } : {}),
      };
    } else if (update.kind === 'chunk') {
      payload = { kind: 'chunk', sessionId: update.sessionId, text: update.text };
    } else {
      payload = {
        kind: 'done',
        sessionId: update.sessionId,
        exitCode: update.exitCode,
        endedAt: update.endedAt,
        metrics: update.metrics,
      };
      // sub 세션이 정상 종료되면 PM에 자동 시스템 메시지 주입 — 결과를 inline으로 포함.
      // PM은 Read 도구를 가지지 않아도 결과를 받음 (도구 차단 + 강제 spawn 패턴).
      // PM이 busy면 큐에 적재, idle 되면 자동 flush.
      if (update.exitCode === 0) {
        const employeeLabel = `${update.employee.name} (${update.employee.id}, ${update.employee.role})`;
        const sysMsg =
          `[system 알림: sub 직원 작업 완료]\n` +
          `직원: ${employeeLabel}\n` +
          `sessionId: ${update.sessionId}\n` +
          `일감: ${update.prompt}\n\n` +
          `=== 결과 ===\n${update.output.trim() || '(빈 응답)'}\n=== 결과 끝 ===\n\n` +
          `위 결과를 사장이 처음 시킨 일감 맥락에 맞춰 1~3문장으로 요약해 \"사장님, ${update.employee.name} 작업 결과: ...\" 식으로 채팅창에 보고해. ` +
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
  ipcMain.handle(IPC.rosterHistorical, (): RosterUpdatePayload[] => {
    return loadHistoricalSessions();
  });

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
    wireQuartersHandlers(pmCallbacks);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOffice();
      mainWindow?.webContents.once('did-finish-load', () => {
        wirePM();
        wireSpawnWatcher();
        wireEmployeeRegistry();
        wireQuartersHandlers(pmCallbacks);
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
