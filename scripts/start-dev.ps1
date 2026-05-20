$ErrorActionPreference = 'Stop'

$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

foreach ($listener in $listeners) {
  $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue

  if (-not $process) {
    continue
  }

  $isProjectDevServer = $process.CommandLine -like "*$projectRoot*"

  if (-not $isProjectDevServer) {
    Write-Host "Port $port is already used by PID $($listener.OwningProcess), but it does not look like this project."
    Write-Host "Stop that process or set PORT to another value before running npm run dev."
    exit 1
  }

  Write-Host "Stopping existing dev server on port $port (PID $($listener.OwningProcess))..."
  Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting API server on port $port..."
& npx tsx src/index.ts
