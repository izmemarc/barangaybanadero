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

Write-Host "Clearing local caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue

Write-Host "Creating archive..." -ForegroundColor Yellow
$Archive = "deploy.zip"
Compress-Archive -Path "app", "components", "contexts", "hooks", "lib", "public", "*.json", "*.mjs", "deployment/nginx.conf", "deployment/nginx-https.conf", "deployment/setup-ssl.sh" -DestinationPath $Archive -Force -ErrorAction SilentlyContinue

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
        
        Write-Host "Cleaning old files and caches..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && rm -rf app components contexts hooks lib public *.json *.ts *.mjs node_modules .next .turbo"
        
        Write-Host "Extracting new files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && unzip -o -q deploy.zip && rm deploy.zip"
        
        Write-Host "Checking and installing build tools..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "apt-get update -qq && apt-get install -y -qq python3 make g++ build-essential 2>&1 | tail -5"
        
        Write-Host "Clearing npm cache..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "rm -rf /root/.npm && mkdir -p /root/.npm && npm cache clean --force"
        
        Write-Host "Installing dependencies (please wait, this takes 2-3 minutes)..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --legacy-peer-deps --no-audit --no-fund"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nInstallation failed!" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        
        Write-Host "Building application (this may take 1-2 minutes)..." -ForegroundColor Yellow
        $buildResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm run build 2>&1"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nBuild failed! Showing last 30 lines of output:" -ForegroundColor Red
            $buildResult | Select-Object -Last 30 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
            Write-Host "`nDeployment aborted due to build failure." -ForegroundColor Red
            Read-Host "`nPress Enter to exit"
            exit 1
        }
        
        Write-Host "Build completed successfully!" -ForegroundColor Green
        
        Write-Host "Installing production dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --production --legacy-peer-deps --no-audit --no-fund"
        
        Write-Host "Setting up SSL certificates..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "chmod +x /root/barangay-website/setup-ssl.sh && /root/barangay-website/setup-ssl.sh"
        
        Write-Host "Configuring nginx..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -f /etc/nginx/sites-enabled/* && sudo cp /root/barangay-website/nginx.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"
        
        Write-Host "Restarting application..." -ForegroundColor Yellow
        $startResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 stop barangay-website > /dev/null 2>&1; pm2 delete barangay-website > /dev/null 2>&1; pm2 flush > /dev/null 2>&1; cd /root/barangay-website && HOSTNAME=0.0.0.0 PORT=3001 ADMIN_PASSWORD='`$2b`$10`$xXCCrkJAX7zbODYyN47Nnev9/dTKZE7001IQW4Cn/heZd9szAn8w.' pm2 start npm --name barangay-website -- start 2>&1 && pm2 save > /dev/null"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to start application! Error output:" -ForegroundColor Red
            Write-Host $startResult -ForegroundColor Red
            Write-Host "Trying alternative start method..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && pm2 start package.json --name barangay-website 2>&1"
        }
        
        Write-Host "Verifying deployment..." -ForegroundColor Yellow
        $verifyResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sleep 5 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3001"
        if ($verifyResult -ne "200") {
            Write-Host "Application verification failed! HTTP Status: $verifyResult" -ForegroundColor Red
            Write-Host "Checking PM2 status..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 status"
            Write-Host "Checking application logs..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 logs barangay-website --lines 20"
        } else {
            Write-Host "Application is running successfully! HTTP Status: $verifyResult" -ForegroundColor Green
        }
        
        Write-Host "Forcing comprehensive cache update for all users..." -ForegroundColor Yellow
        
        # Clear server-side caches
        Write-Host "Clearing server-side caches..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 flush"
        
        Write-Host "`nDeployment complete!" -ForegroundColor Green
        Write-Host "Website: https://banaderolegazpi.online" -ForegroundColor Cyan
        Write-Host "`nIf users see old content, they should hard refresh (Ctrl+F5)" -ForegroundColor Yellow
    } else {
        Write-Host "Upload failed - check network connection" -ForegroundColor Red
    }
} else {
    Write-Host "SSH connection failed - check server and credentials" -ForegroundColor Red
}

Remove-Item $Archive -Force -ErrorAction SilentlyContinue
Read-Host "Press Enter to exit"
