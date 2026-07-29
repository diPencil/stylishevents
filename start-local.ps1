$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

function Stop-StylishJobs {
  Get-Job -Name "StylishEventsBackend", "StylishEventsFrontend" -ErrorAction SilentlyContinue |
    Stop-Job -ErrorAction SilentlyContinue
  Get-Job -Name "StylishEventsBackend", "StylishEventsFrontend" -ErrorAction SilentlyContinue |
    Remove-Job -Force -ErrorAction SilentlyContinue
}

Stop-StylishJobs

Write-Host ""
Write-Host "Starting Stylish Events locally..." -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:3002" -ForegroundColor Gray
Write-Host "Mode:     frontend dev server, backend API server" -ForegroundColor Gray
Write-Host ""

$backendJob = Start-Job -Name "StylishEventsBackend" -ScriptBlock {
  Set-Location $using:BackendPath
  npm.cmd run start
}

Start-Sleep -Seconds 3

$frontendJob = Start-Job -Name "StylishEventsFrontend" -ScriptBlock {
  Set-Location $using:FrontendPath
  npm.cmd run dev
}

Write-Host "Open: http://localhost:3002/admin/" -ForegroundColor Green
Write-Host "Keep this window open. Press Ctrl+C to stop both servers." -ForegroundColor Yellow
Write-Host ""

try {
  while ($true) {
    foreach ($job in @($backendJob, $frontendJob)) {
      Receive-Job -Id $job.Id -ErrorAction SilentlyContinue
      $current = Get-Job -Id $job.Id
      if ($current.State -in @("Failed", "Stopped", "Completed")) {
        Write-Host ""
        Write-Host "$($current.Name) stopped with state: $($current.State)" -ForegroundColor Red
        Receive-Job -Id $job.Id -ErrorAction SilentlyContinue
        throw "A local server stopped. Check the message above."
      }
    }
    Start-Sleep -Seconds 2
  }
}
finally {
  Stop-StylishJobs
}
