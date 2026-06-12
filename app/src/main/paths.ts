import { app } from 'electron';
import { dirname, join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * 경로 3역할 분리 (docs/workdir-plan.md PR-A).
 *
 * 종전엔 8개 main 파일이 각각 `resolve(__dirname, '../../..')`로 repo root 하나를
 * 잡아 appResources / runtime / workDir 세 의미를 혼용했다. dev에선 셋이 모두 repo
 * root로 수렴해 문제가 안 보였지만 packaged에선 갈라진다 (resources=Program Files
 * 읽기전용, runtime=userData 쓰기가능, workDir=사장 선택 프로젝트).
 *
 * **동작 불변 근거 (dev 모드):**
 *   __dirname = app/out/main → resolve(__dirname,'../../..') = repo root.
 *   appResourcesRoot() = 동일 repo root.
 *   runtimeRoot() = !app.isPackaged → appResourcesRoot() 그대로 = repo root.
 *   getWorkDir() = work-dir.json 없으면(현재 PR엔 쓰는 동작 없음) appResourcesRoot() = repo root.
 *   ⇒ dev에선 세 함수 모두 종전 projectRoot와 정확히 같은 경로를 반환.
 *
 * app.isPackaged 분기는 이 모듈에만 둔다 (나머지 파일은 역할 함수만 호출).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 읽기 전용 앱 자산 root (core/employees, core/catalogs). */
export function appResourcesRoot(): string {
  // packaged: extraResources(core/employees·core/catalogs)가 process.resourcesPath에 동봉됨 (PR-C).
  // dev: app/out/main → ../../.. = repo root.
  return app.isPackaged ? process.resourcesPath : resolve(__dirname, '../../..');
}

/** 가변 상태 root (workspace/* — sessions/quarters/active-catalog/benchmark-results/spawn-request). */
export function runtimeRoot(): string {
  // packaged: userData (Program Files 읽기전용 회피). dev: appResources와 동일 root.
  return app.isPackaged ? app.getPath('userData') : appResourcesRoot();
}

const WORK_DIR_FILE = 'work-dir.json';

/** work-dir.json 위치 — runtime의 workspace/ 아래에 영속. */
function workDirConfigPath(): string {
  const workspace = join(runtimeRoot(), 'workspace');
  if (!existsSync(workspace)) mkdirSync(workspace, { recursive: true });
  return join(workspace, WORK_DIR_FILE);
}

/**
 * 작업 대상 디렉토리 — PM/직원이 일하는 프로젝트 (사장이 선택, PR-B에서 UI 연결).
 * work-dir.json에 영속된 경로를 read, 없으면 appResourcesRoot() (현행 동작 유지).
 */
export function getWorkDir(): string {
  try {
    const file = workDirConfigPath();
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, 'utf8')) as { dir?: string };
      if (data.dir && existsSync(data.dir)) return data.dir;
    }
  } catch {
    /* fallthrough to default */
  }
  return appResourcesRoot();
}

/** work-dir.json 영속 (PR-B에서 UI 연결 — 지금은 함수만 제공, 호출처 없음). */
export function setWorkDir(dir: string): void {
  writeFileSync(workDirConfigPath(), JSON.stringify({ dir }, null, 2), 'utf8');
}
