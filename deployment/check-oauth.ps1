Write-Host "Checking OAuth Token Health..." -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "server-config.txt"

if (Test-Path $ConfigFile) {
    $Config = Get-Content $ConfigFile
    $ServerIP = $Config[0].Trim()
    
    Write-Host "Checking production token..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "https://banaderolegazpi.online/api/oauth/health" -Method Get -ErrorAction SilentlyContinue
    
    if ($response.valid) {
        Write-Host "✅ OAuth token is VALID" -ForegroundColor Green
        Write-Host "Expires: $($response.expiresAt)" -ForegroundColor Gray
    } else {
        Write-Host "❌ OAuth token is INVALID or EXPIRED" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Yellow
        Write-Host "`nTo fix:" -ForegroundColor Cyan
        Write-Host "1. Visit: https://banaderolegazpi.online/api/oauth/setup" -ForegroundColor White
        Write-Host "2. Follow the authorization link" -ForegroundColor White
        Write-Host "3. Copy the new refresh token" -ForegroundColor White
        Write-Host "4. Update .env.local" -ForegroundColor White
        Write-Host "5. Redeploy with .\deploy.ps1" -ForegroundColor White
    }
} else {
    Write-Host "Config file not found" -ForegroundColor Red
}

Read-Host "`nPress Enter to exit"
