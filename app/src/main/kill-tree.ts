import { spawn, type ChildProcess } from 'node:child_process';

/**
 * Windows에서 shell:true로 spawn한 프로세스는 proc.kill()이 cmd.exe만 죽이고
 * 실제 자식(claude/codex)이 고아로 살아남음 — 2026-06-11 시연에서 앱 종료 후
 * codex 고아 2개가 2시간째 한도를 태우던 것 발견. taskkill /T /F로 트리 전체 종료.
 */
export function killTree(proc: ChildProcess): void {
  if (process.platform === 'win32' && proc.pid) {
    spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F']);
  } else {
    proc.kill();
  }
}
