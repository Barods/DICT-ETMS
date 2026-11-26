$ErrorActionPreference = "Stop"

$backendPath = Join-Path $PSScriptRoot "Back-end-Template"
$frontendPath = Join-Path $PSScriptRoot "react-vite-supreme"

if (-not (Test-Path (Join-Path $backendPath "manage.py"))) {
    throw "Django backend was not found at $backendPath."
}
if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
    throw "Frontend was not found at $frontendPath."
}

function Test-ListeningPort([int]$Port) {
    return [bool](Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue)
}

function Wait-ForPort([int]$Port, $Process, [string]$ServiceName) {
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        if (Test-ListeningPort $Port) {
            Write-Host "$ServiceName is ready on port $Port."
            return
        }
        if ($Process -and $Process.HasExited) {
            throw "$ServiceName stopped during startup. Check its terminal output."
        }
        Start-Sleep -Seconds 1
    }

    throw "$ServiceName did not start listening on port $Port within 30 seconds."
}

$databaseEngine = if ($env:DB_ENGINE) { $env:DB_ENGINE.ToLowerInvariant() } else { "mysql" }
$env:DB_ENGINE = $databaseEngine
if ($databaseEngine -eq "mysql" -and -not (Test-ListeningPort 3306)) {
    throw "MySQL is not listening on port 3306. Start MySQL, or set DB_ENGINE=sqlite in this PowerShell session."
}

$python = (Get-Command python.exe -ErrorAction Stop).Source
$apiProcess = $null
if (-not (Test-ListeningPort 8000)) {
    $apiProcess = Start-Process -FilePath $python `
        -ArgumentList @("manage.py", "runserver", "127.0.0.1:8000") `
        -WorkingDirectory $backendPath `
        -PassThru
}
Wait-ForPort 8000 $apiProcess "Django API"

$frontendProcess = $null
if (-not (Test-ListeningPort 5173)) {
    $frontendProcess = Start-Process -FilePath $env:ComSpec `
        -ArgumentList @("/d", "/c", "npm run dev -- --host 127.0.0.1") `
        -WorkingDirectory $frontendPath `
        -PassThru
}
Wait-ForPort 5173 $frontendProcess "Vite frontend"

Write-Host "ETMS is available at http://localhost:5173"
