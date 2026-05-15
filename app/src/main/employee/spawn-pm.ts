import { PTYManager } from '@core/pty/manager';

export const PM_SESSION_ID = 'pm';

/**
 * PR5a: PM은 echo stub. PowerShell loop으로 사장 stdin → "PM> ..." 형식으로 echo.
 * PR5b에서 실제 Claude Code CLI로 교체될 자리.
 */
export function spawnPM(manager: PTYManager): void {
  if (manager.has(PM_SESSION_ID)) return;

  const isWin = process.platform === 'win32';
  if (isWin) {
    manager.spawn(PM_SESSION_ID, 'powershell.exe', [
      '-NoLogo',
      '-NoProfile',
      '-Command',
      'Write-Host "[PM stub 출근 완료. 메시지를 echo로 답합니다.]"; while ($line = [Console]::In.ReadLine()) { Write-Host "PM> $line" }',
    ]);
  } else {
    manager.spawn(PM_SESSION_ID, 'sh', [
      '-c',
      'echo "[PM stub 출근 완료. 메시지를 echo로 답합니다.]"; while IFS= read -r line; do echo "PM> $line"; done',
    ]);
  }
}
