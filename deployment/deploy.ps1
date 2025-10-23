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

Write-Host "Ensuring uploads directory exists..." -ForegroundColor Yellow
if (!(Test-Path "public/uploads")) {
    New-Item -ItemType Directory -Path "public/uploads" -Force | Out-Null
}
if (!(Test-Path "public/uploads/.gitkeep")) {
    "# Uploads directory" | Out-File "public/uploads/.gitkeep" -Encoding UTF8
}

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
        
        Write-Host "Backing up uploaded files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && mkdir -p /tmp/barangay-uploads-backup && cp -r public/uploads/* /tmp/barangay-uploads-backup/ 2>/dev/null || true"
        
        Write-Host "Cleaning old files and caches..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && rm -rf app components contexts hooks lib public *.json *.ts *.mjs node_modules .next .turbo"
        
        Write-Host "Extracting new files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && unzip -o -q deploy.zip && rm deploy.zip"
        
        Write-Host "Checking and installing build tools and Sharp dependencies..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "apt-get update -qq && apt-get install -y -qq python3 make g++ build-essential libvips-dev libvips-tools 2>&1 | tail -10"
        
        Write-Host "Verifying libvips (required by Sharp)..." -ForegroundColor Cyan
        $libvipsCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "ldconfig -p | grep libvips"
        if ([string]::IsNullOrEmpty($libvipsCheck)) {
            Write-Host "  libvips not found, installing..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "apt-get install -y libvips42 2>&1 | tail -5"
        } else {
            Write-Host "  libvips is installed" -ForegroundColor Green
        }
        
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
        
        Write-Host "Setting up uploads directory..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && mkdir -p public/uploads && chmod 755 public/uploads"
        
        Write-Host "Restoring uploaded files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cp -r /tmp/barangay-uploads-backup/* /root/barangay-website/public/uploads/ 2>/dev/null || true && rm -rf /tmp/barangay-uploads-backup"
        $restoredCount = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "ls -1 /root/barangay-website/public/uploads/*.webp 2>/dev/null | wc -l"
        if ($restoredCount -gt 0) {
            Write-Host "  Restored $restoredCount uploaded file(s)" -ForegroundColor Green
        } else {
            Write-Host "  No previous uploads to restore" -ForegroundColor Cyan
        }
        
        Write-Host "Fixing Sharp library for production..." -ForegroundColor Yellow
        Write-Host "  - Removing existing Sharp..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm uninstall sharp"
        
        Write-Host "  - Installing Sharp with platform-specific build..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --cpu=x64 --os=linux --libc=glibc sharp --legacy-peer-deps 2>&1 | tail -10"
        
        Write-Host "  - Verifying Sharp installation..." -ForegroundColor Cyan
        $sharpCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && node -e `"const sharp = require('sharp'); console.log('Sharp version:', sharp.versions.sharp);`" 2>&1"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Sharp installed successfully: $sharpCheck" -ForegroundColor Green
        } else {
            Write-Host "  Sharp installation may have issues: $sharpCheck" -ForegroundColor Yellow
            Write-Host "  Trying alternative installation method..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm install --ignore-scripts=false sharp --legacy-peer-deps && npm rebuild sharp"
        }
        
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
        Write-Host "  - Updating nginx config with correct paths..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -f /etc/nginx/sites-enabled/* && sudo cp /root/barangay-website/nginx.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/"
        
        Write-Host "  - Testing nginx configuration..." -ForegroundColor Cyan
        $nginxTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t 2>&1"
        if ($nginxTest -match "test is successful") {
            Write-Host "  - Nginx config is valid, reloading..." -ForegroundColor Green
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl reload nginx"
        } else {
            Write-Host "  - Nginx config test failed:" -ForegroundColor Red
            Write-Host "    $nginxTest" -ForegroundColor Yellow
            Write-Host "  - Attempting to restore previous config..." -ForegroundColor Yellow
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl reload nginx"
        }
        
        Write-Host "Setting proper permissions for nginx to access files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo chmod 755 /root && sudo chmod -R 755 /root/barangay-website/public"
        Write-Host "  Permissions set successfully!" -ForegroundColor Green
        
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
            
            Write-Host "`nTesting upload functionality..." -ForegroundColor Yellow
            $uploadTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/admin/upload/health"
            if ($uploadTest -eq "200") {
                Write-Host "Upload API is accessible! HTTP Status: $uploadTest" -ForegroundColor Green
            } else {
                Write-Host "Upload API test failed! HTTP Status: $uploadTest" -ForegroundColor Red
            }
            
            $sharpTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/admin/test-sharp"
            if ($sharpTest -eq "200") {
                Write-Host "Sharp library is working! HTTP Status: $sharpTest" -ForegroundColor Green
            } else {
                Write-Host "Sharp library test failed! HTTP Status: $sharpTest" -ForegroundColor Red
                Write-Host "Upload images may not work correctly" -ForegroundColor Yellow
            }
            
            Write-Host "`nChecking uploaded files..." -ForegroundColor Yellow
            $filesTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -s http://localhost:3001/api/admin/upload/test | head -20"
            Write-Host "$filesTest" -ForegroundColor Cyan
            
            Write-Host "`nTesting if uploaded files are accessible..." -ForegroundColor Yellow
            $testFile = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "ls /root/barangay-website/public/uploads/*.webp 2>/dev/null | head -1"
            if (![string]::IsNullOrEmpty($testFile)) {
                $fileName = Split-Path $testFile -Leaf
                $fileAccessTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -s -o /dev/null -w '%{http_code}' https://banaderolegazpi.online/uploads/$fileName"
                if ($fileAccessTest -eq "200") {
                    Write-Host "Uploaded files are accessible! HTTP Status: $fileAccessTest" -ForegroundColor Green
                } else {
                    Write-Host "WARNING: Uploaded files return HTTP $fileAccessTest" -ForegroundColor Yellow
                    Write-Host "This may cause broken image display" -ForegroundColor Yellow
                }
            } else {
                Write-Host "No uploaded files found yet" -ForegroundColor Cyan
            }
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
