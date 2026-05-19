import { ipcMain } from 'electron';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  appendSessionToCurrent,
  archiveQuarter,
  listArchivedQuarters,
  loadCurrentQuarter,
  newQuarterId,
  saveCurrentQuarter,
} from '@core/quarters/storage';
import type { QuarterMeta } from '@core/quarters/types';
import { IPC } from '../../shared/ipc.js';
import { enqueueSystemMessage, type PMCallbacks } from '../employee/pm-runner.js';

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

// main이 sub-agent done 시 호출 — 현 분기 sessionIds 누적.
export function recordSessionInQuarter(sessionId: string): void {
  try {
    appendSessionToCurrent(projectRoot, sessionId);
  } catch (err) {
    console.warn('[quarters] session 누적 실패:', err);
  }
}

export function wireQuartersHandlers(pmCallbacks: PMCallbacks): void {
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

      // PM에 분기 변경 통지 (시스템 메시지 — busy 시 큐 적재, idle 시 flush).
      const sysMsg =
        `[system 알림: 분기 시작]\n` +
        `새 분기: "${next.title}"\n` +
        (next.description ? `목표: ${next.description}\n` : '') +
        `quarterId: ${next.quarterId}\n\n` +
        `다음 일감부터 이 분기 목표와의 align을 응답에 1줄 정도 언급해. 단순 일감은 생략 OK. ` +
        `이 메시지는 app이 자동 주입한 신호다 — 사장에게 짧게 "분기 '${next.title}' 인지함" 한 줄로 응답하면 끝.`;
      enqueueSystemMessage(sysMsg, pmCallbacks);

      return next;
    },
  );

  ipcMain.handle(IPC.quartersList, (): QuarterMeta[] => listArchivedQuarters(projectRoot));
}
