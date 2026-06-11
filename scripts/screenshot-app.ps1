# 실행 중인 payroll-os 창을 PrintWindow로 캡처 (부분 가림 OK, 최소화는 X).
# 사용: .\scripts\screenshot-app.ps1 [-Out workspace\screenshot.png]
param(
  [string]$Out = 'workspace\screenshot.png'
)

Add-Type -AssemblyName System.Drawing
if (-not ('Win32Shot' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class Win32Shot {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left, Top, Right, Bottom; }

  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

  [DllImport("user32.dll")]
  public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdc, uint flags);
}
'@
}

$proc = Get-Process | Where-Object { $_.MainWindowTitle -eq 'payroll-os' } | Select-Object -First 1
if (-not $proc) {
  Write-Error "payroll-os 창을 찾을 수 없음 (앱이 떠 있고 최소화 아닌지 확인)"
  exit 1
}

$rect = New-Object Win32Shot+RECT
[Win32Shot]::GetWindowRect($proc.MainWindowHandle, [ref]$rect) | Out-Null
$w = $rect.Right - $rect.Left
$h = $rect.Bottom - $rect.Top
if ($w -le 0 -or $h -le 0) { Write-Error "창 크기 0 — 최소화 상태?"; exit 1 }

$bmp = [System.Drawing.Bitmap]::new($w, $h)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $gfx.GetHdc()
# 0x2 = PW_RENDERFULLCONTENT (Electron 같은 GPU 가속 창 캡처에 필요)
[Win32Shot]::PrintWindow($proc.MainWindowHandle, $hdc, 2) | Out-Null
$gfx.ReleaseHdc($hdc)
$gfx.Dispose()

$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$bmp.Save((Join-Path (Get-Location) $Out), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"saved: $Out (${w}x${h})"
