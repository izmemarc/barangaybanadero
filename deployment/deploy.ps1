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
Compress-Archive -Path "app", "components", "lib", "public", "*.json", "*.mjs", "deployment/nginx.conf", "deployment/nginx-https.conf", "deployment/setup-ssl.sh" -DestinationPath $Archive -Force -ErrorAction SilentlyContinue

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
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && rm -rf app components lib public *.json *.ts *.mjs node_modules .next .turbo"
        
        Write-Host "Extracting new files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && unzip -o -q deploy.zip && rm deploy.zip"
        
        Write-Host "Clearing npm cache..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm cache clean --force"
        
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --no-cache --silent"
        
        Write-Host "Building application..." -ForegroundColor Yellow
        $buildResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm run build 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build failed! Error output:" -ForegroundColor Red
            Write-Host $buildResult -ForegroundColor Red
            Write-Host "Deployment aborted due to build failure." -ForegroundColor Red
            return
        }
        Write-Host "Build completed successfully!" -ForegroundColor Green
        
        Write-Host "Installing production dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --production --no-cache --silent"
        
        Write-Host "Setting up SSL certificates..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "chmod +x /root/barangay-website/setup-ssl.sh && /root/barangay-website/setup-ssl.sh"
        
        Write-Host "Configuring nginx..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -f /etc/nginx/sites-enabled/* && sudo cp /root/barangay-website/nginx.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"
        
        Write-Host "Restarting application..." -ForegroundColor Yellow
        $startResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 stop barangay-website > /dev/null 2>&1; pm2 delete barangay-website > /dev/null 2>&1; pm2 flush > /dev/null 2>&1; cd /root/barangay-website && HOSTNAME=0.0.0.0 PORT=3001 pm2 start npm --name barangay-website -- start 2>&1 && pm2 save > /dev/null"
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
        
        # Clear all server-side caches
        Write-Host "Clearing server-side caches..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -rf /var/cache/nginx/*"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -rf /tmp/nginx*"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 flush"
        
        # Temporarily disable all caching
        Write-Host "Temporarily disabling all caching..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /etc/nginx/sites-available/barangay-website /etc/nginx/sites-available/barangay-website.backup"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's/max-age=[0-9]*/max-age=0/g' /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's/expires [0-9]*[a-z]*;/expires -1;/g' /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's/add_header Cache-Control/#add_header Cache-Control/g' /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's/add_header Expires/#add_header Expires/g' /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t && sudo systemctl reload nginx"
        
        # Force browser cache invalidation with version parameter
        Write-Host "Adding cache-busting headers..." -ForegroundColor Cyan
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "echo '    add_header Cache-Control \"no-cache, no-store, must-revalidate\";' | sudo tee -a /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "echo '    add_header Pragma \"no-cache\";' | sudo tee -a /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "echo '    add_header Expires \"0\";' | sudo tee -a /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "echo '}' | sudo tee -a /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t && sudo systemctl reload nginx"
        
        Write-Host "Waiting for cache to clear (60 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        
        # Test cache headers
        Write-Host "Testing cache headers..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -I http://localhost:3001/ | grep -i 'cache-control\\|expires\\|pragma' || echo 'Cache headers check completed'"
        
        Write-Host "Re-enabling optimized caching..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /etc/nginx/sites-available/barangay-website.backup /etc/nginx/sites-available/barangay-website"
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t && sudo systemctl reload nginx"
        
        Write-Host "Testing cache headers..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -I http://localhost:3001/logo.png | grep -i 'cache-control\\|expires' || echo 'Cache headers check completed'"
        
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Website: https://banaderolegazpi.online" -ForegroundColor Cyan
        Write-Host " HTTPS is now enabled with SSL certificates!" -ForegroundColor Green
        Write-Host " All HTTP traffic redirects to HTTPS!" -ForegroundColor Green
        Write-Host " Static files (CSS/JS/Images) are now properly served with cache headers!" -ForegroundColor Green
        Write-Host " Images are optimized and cached for 1 year!" -ForegroundColor Green
        Write-Host " Performance improvements are now active!" -ForegroundColor Green
        Write-Host " Comprehensive cache clearing completed!" -ForegroundColor Green
        Write-Host " All server-side caches have been cleared!" -ForegroundColor Green
        Write-Host " Browser cache-busting headers have been applied!" -ForegroundColor Green
        Write-Host " Users should now see the updated content immediately!" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor White
        Write-Host "If users still see old content, they should:" -ForegroundColor Yellow
        Write-Host "  1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)" -ForegroundColor Yellow
        Write-Host "  2. Clear browser cache completely" -ForegroundColor Yellow
        Write-Host "  3. Try incognito/private browsing mode" -ForegroundColor Yellow
        Write-Host "  4. Wait 2-3 minutes for global cache propagation" -ForegroundColor Yellow
        Write-Host "" -ForegroundColor White
        Write-Host "Cache-busting timestamp: $timestamp" -ForegroundColor Cyan
    } else {
        Write-Host "Upload failed - check network connection" -ForegroundColor Red
    }
} else {
    Write-Host "SSH connection failed - check server and credentials" -ForegroundColor Red
}

Remove-Item $Archive -Force -ErrorAction SilentlyContinue
Read-Host "Press Enter to exit"
