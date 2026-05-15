import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  IPC,
  type PMExitPayload,
  type PMOutputPayload,
  type RosterUpdatePayload,
} from '../shared/ipc.js';

const api = {
  sendToPM: (text: string): Promise<void> => ipcRenderer.invoke(IPC.pmSend, text),
  onPMOutput: (cb: (p: PMOutputPayload) => void): (() => void) => {
    const handler = (_evt: IpcRendererEvent, payload: PMOutputPayload) => cb(payload);
    ipcRenderer.on(IPC.pmOutput, handler);
    return () => ipcRenderer.off(IPC.pmOutput, handler);
  },
  onPMExit: (cb: (p: PMExitPayload) => void): (() => void) => {
    const handler = (_evt: IpcRendererEvent, payload: PMExitPayload) => cb(payload);
    ipcRenderer.on(IPC.pmExit, handler);
    return () => ipcRenderer.off(IPC.pmExit, handler);
  },
  onRosterUpdate: (cb: (p: RosterUpdatePayload) => void): (() => void) => {
    const handler = (_evt: IpcRendererEvent, payload: RosterUpdatePayload) => cb(payload);
    ipcRenderer.on(IPC.rosterUpdate, handler);
    return () => ipcRenderer.off(IPC.rosterUpdate, handler);
  },
};

contextBridge.exposeInMainWorld('api', api);

export type PayrollOSAPI = typeof api;
