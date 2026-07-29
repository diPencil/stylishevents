$ErrorActionPreference = "Stop"

$frontendRoot = Split-Path -Parent $PSScriptRoot
$monorepoRoot = Split-Path -Parent $frontendRoot
$node = "C:\Program Files\nodejs\node.exe"
$pathValue = @(
  [Environment]::GetEnvironmentVariable("Path", "Machine"),
  [Environment]::GetEnvironmentVariable("Path", "User")
) -join ";"

[Environment]::SetEnvironmentVariable("PATH", $null, "Process")
[Environment]::SetEnvironmentVariable("Path", $pathValue, "Process")

function Stop-PortProcess {
  param([int] $Port)

  $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) {
    Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Stop-PortProcess -Port 3002
Stop-PortProcess -Port 5000
Start-Sleep -Seconds 1

$backend = Start-Process `
  -FilePath "cmd.exe" `
  -ArgumentList @("/k", "cd /d `"$monorepoRoot\backend`" && `"$node`" src\server.js") `
  -WindowStyle Hidden `
  -PassThru

$frontend = Start-Process `
  -FilePath "cmd.exe" `
  -ArgumentList @("/k", "cd /d `"$frontendRoot`" && `"$node`" .\node_modules\next\dist\bin\next dev -p 3002") `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Seconds 8

Write-Output "Backend PID: $($backend.Id)"
Write-Output "Frontend PID: $($frontend.Id)"
