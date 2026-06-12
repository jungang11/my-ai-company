import { watch as chokidarWatch, type FSWatcher } from 'chokidar';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { SPAWN_REQUEST_DIR, type SpawnRequest } from '@core/spawn/protocol';
import { runSubSession, type SubSessionCallback } from './runner.js';
import { runtimeRoot } from '../paths.js';

// spawn-request는 가변 상태 → runtime. packaged의 userData는 app ready 이후라야 안전 →
// 호출 시점 lazy 평가 (startSpawnWatcher/spawnRequestDir 모두 ready 후 호출).
function spawnDirPath(): string {
  return resolve(runtimeRoot(), SPAWN_REQUEST_DIR);
}

let watcher: FSWatcher | null = null;

export function startSpawnWatcher(cb: SubSessionCallback): void {
  if (watcher) return;
  const spawnDir = spawnDirPath();
  mkdirSync(spawnDir, { recursive: true });

  watcher = chokidarWatch(spawnDir, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  });

  watcher.on('add', (path) => {
    handleAdded(path, cb);
  });
  watcher.on('error', (err) => {
    console.error('[spawn-watcher] error:', err);
  });
  watcher.on('ready', () => {
    console.log('[spawn-watcher] ready, watching:', spawnDir);
  });
}

function handleAdded(path: string, cb: SubSessionCallback): void {
  if (!path.endsWith('.json')) return;
  try {
    const raw = readFileSync(path, 'utf-8');
    const req = JSON.parse(raw) as SpawnRequest;
    if (!req.id || !req.employeeId || !req.prompt) {
      console.warn('[spawn-watcher] 잘못된 SpawnRequest 형식, 무시:', path);
      return;
    }
    try {
      unlinkSync(path);
    } catch {
      /* ignore */
    }
    try {
      runSubSession(req, cb);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[spawn-watcher] runSubSession 거절:', path, msg);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[spawn-watcher] 처리 실패:', path, msg);
  }
}

export async function stopSpawnWatcher(): Promise<void> {
  if (watcher) {
    await watcher.close();
    watcher = null;
  }
}

export function spawnRequestDir(): string {
  const spawnDir = spawnDirPath();
  if (!existsSync(spawnDir)) mkdirSync(spawnDir, { recursive: true });
  return spawnDir;
}
