Write-Host "Barangay Website Deployment" -ForegroundColor Cyan

# Add error handling to prevent instant crashes
trap {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$ConfigFile = Join-Path $ScriptDir "server-config.txt"

Set-Location $ProjectDir

if (Test-Path $ConfigFile) {
    $Config = Get-Content $ConfigFile
    $ServerIP = $Config[0].Trim()
    $Username = $Config[1].Trim()
    $Password = $Config[2].Trim()
    Write-Host "Server: $ServerIP" -ForegroundColor Green
    Write-Host "Username: $Username" -ForegroundColor Green
    Write-Host "Password: [HIDDEN]" -ForegroundColor Green
} else {
    Write-Host "Config file not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Creating archive..." -ForegroundColor Yellow
$Archive = "deploy.zip"
Compress-Archive -Path "app", "components", "lib", "public", "*.json", "*.mjs", "deployment/nginx.conf" -DestinationPath $Archive -Force -ErrorAction SilentlyContinue

if (Test-Path $Archive) {
    Write-Host "Archive created: $Archive" -ForegroundColor Green
} else {
    Write-Host "Archive creation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Using PuTTY tools for automatic password authentication..." -ForegroundColor Cyan

Write-Host "Testing SSH connection..." -ForegroundColor Cyan
echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "echo 'Connection test successful'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "SSH connection working!" -ForegroundColor Green
    
    Write-Host "Creating directory on server..." -ForegroundColor Cyan
    echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "mkdir -p /root/barangay-website"
    
    Write-Host "Cleaning old archives on server..." -ForegroundColor Cyan
    echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website; rm -f deploy*.zip"
    
    Write-Host "Uploading archive..." -ForegroundColor Cyan
    pscp -pw "$Password" $Archive "${Username}@${ServerIP}:/root/barangay-website/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Upload successful!" -ForegroundColor Green
        Write-Host "Deploying application..." -ForegroundColor Cyan
        
        Write-Host "Cleaning old files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && rm -rf app components lib public *.json *.ts *.mjs node_modules"
        
        Write-Host "Extracting new files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && unzip -o -q deploy.zip && rm deploy.zip"
        
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --silent"
        
        Write-Host "Building application..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"
        
        Write-Host "Installing production dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --production --silent"
        
        Write-Host "Configuring nginx..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -f /etc/nginx/sites-enabled/* && sudo cp /root/barangay-website/nginx.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"
        
        Write-Host "Restarting application..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 stop barangay-website > /dev/null 2>&1; pm2 delete barangay-website > /dev/null 2>&1; cd /root/barangay-website && HOSTNAME=0.0.0.0 PORT=3000 pm2 start .next/standalone/server.js --name barangay-website > /dev/null && pm2 save > /dev/null"
        
        Write-Host "Verifying deployment..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"
        
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Website: http://$ServerIP" -ForegroundColor Cyan
        Write-Host "Static files (CSS/JS/Images) are now properly served!" -ForegroundColor Green
    } else {
        Write-Host "Upload failed - check network connection" -ForegroundColor Red
    }
} else {
    Write-Host "SSH connection failed - check server and credentials" -ForegroundColor Red
}

Remove-Item $Archive -Force -ErrorAction SilentlyContinue
Read-Host "Press Enter to exit"