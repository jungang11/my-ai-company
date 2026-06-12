import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import {
  DONE_MARKER_NAME,
  OUTPUT_LOG_NAME,
  SESSIONS_DIR,
} from '@core/spawn/protocol';
import type { RosterUpdatePayload, SubSessionMetrics } from '../../shared/ipc.js';
import { getEmployee } from '../employee/manager.js';
import { runtimeRoot } from '../paths.js';

// packaged에서 runtimeRoot()=app.getPath('userData')는 app ready 이후라야 안전 →
// 모듈 top-level 평가 대신 호출 시점 lazy 평가.
function sessionsDirPath(): string {
  return resolve(runtimeRoot(), SESSIONS_DIR);
}

type DoneMarker = {
  exitCode: number;
  endedAt: string;
  metrics?: SubSessionMetrics;
  employeeId?: string;
  employeeName?: string;
  role?: string;
  prompt?: string;
  startedAt?: string;
};

/**
 * Task tool sub-agent 또는 외부 CLI 직원의 결과를 영속화.
 * main의 onSubAgentDone 콜백에서 호출 — workspace/sessions/<taskId>/{output.log, done} 저장.
 */
export function persistSubSession(input: {
  sessionId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  prompt: string;
  output: string;
  metrics: SubSessionMetrics;
  startedAt: number;
  endedAt: number;
  exitCode: number;
}): void {
  const dir = resolve(sessionsDirPath(), input.sessionId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, OUTPUT_LOG_NAME), input.output, 'utf-8');
  const marker: DoneMarker = {
    exitCode: input.exitCode,
    endedAt: new Date(input.endedAt).toISOString(),
    metrics: input.metrics,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    role: input.role,
    prompt: input.prompt,
    startedAt: new Date(input.startedAt).toISOString(),
  };
  writeFileSync(resolve(dir, DONE_MARKER_NAME), JSON.stringify(marker, null, 2), 'utf-8');
}

/**
 * 앱 시작 시 호출 — workspace/sessions/ 디렉토리 scan해서 done 마커가 있는 세션을
 * "최근 종료" 카드로 복원할 수 있게 RosterUpdatePayload 시퀀스(started + chunk + done)로 변환.
 *
 * sorting: endedAt 오름차순(오래된 순) — renderer state에 push 시 자연스럽게 누적.
 */
export function loadHistoricalSessions(): RosterUpdatePayload[] {
  const sessionsDir = sessionsDirPath();
  if (!existsSync(sessionsDir)) return [];

  const entries = readdirSync(sessionsDir)
    .map((id) => {
      const dir = resolve(sessionsDir, id);
      try {
        const st = statSync(dir);
        if (!st.isDirectory()) return null;
      } catch {
        return null;
      }
      const donePath = resolve(dir, DONE_MARKER_NAME);
      const outPath = resolve(dir, OUTPUT_LOG_NAME);
      if (!existsSync(donePath)) return null;
      try {
        const marker = JSON.parse(readFileSync(donePath, 'utf-8')) as DoneMarker;
        const output = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : '';
        return { id, marker, output };
      } catch {
        return null;
      }
    })
    .filter((x): x is { id: string; marker: DoneMarker; output: string } => x !== null);

  // endedAt 오름차순 정렬
  entries.sort((a, b) => {
    const ta = a.marker.endedAt ? Date.parse(a.marker.endedAt) : 0;
    const tb = b.marker.endedAt ? Date.parse(b.marker.endedAt) : 0;
    return ta - tb;
  });

  const payloads: RosterUpdatePayload[] = [];
  for (const { id, marker, output } of entries) {
    const employeeId = marker.employeeId ?? 'unknown';
    const emp = getEmployee(employeeId);
    const startedAt = marker.startedAt ? Date.parse(marker.startedAt) : 0;
    const endedAt = marker.endedAt ? Date.parse(marker.endedAt) : 0;

    payloads.push({
      kind: 'started',
      sessionId: id,
      employeeId,
      employeeName: marker.employeeName ?? emp?.name ?? employeeId,
      role: marker.role ?? emp?.role ?? '?',
      prompt: marker.prompt ?? '',
      startedAt,
      ...(emp?.model ? { model: emp.model } : {}),
    });

    if (output) {
      payloads.push({ kind: 'chunk', sessionId: id, text: output });
    }

    payloads.push({
      kind: 'done',
      sessionId: id,
      exitCode: marker.exitCode ?? 0,
      endedAt,
      metrics: marker.metrics ?? {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        costUsd: 0,
      },
    });
  }

  return payloads;
}

/** workspace/sessions/ 잔여 정리 위해 만든 헬퍼 — 디버그/테스트용. */
export function appendOutputLog(sessionId: string, text: string): void {
  const dir = resolve(sessionsDirPath(), sessionId);
  mkdirSync(dir, { recursive: true });
  appendFileSync(resolve(dir, OUTPUT_LOG_NAME), text, 'utf-8');
}
