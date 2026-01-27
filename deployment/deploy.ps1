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
Compress-Archive -Path "app", "components", "hooks", "lib", "public", ".env.local", "*.json", "*.mjs", "deployment/nginx-http.conf", "deployment/nginx-https.conf", "deployment/setup-ssl.sh" -DestinationPath $Archive -Force -ErrorAction SilentlyContinue

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
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && rm -rf app components hooks lib public *.json *.ts *.mjs node_modules .next .turbo"
        
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
        
        Write-Host "Building application (this may take 2-3 minutes)..." -ForegroundColor Yellow
        $buildResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && NODE_OPTIONS='--max-old-space-size=3072' npm run build 2>&1"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nBuild failed! Showing last 30 lines of output:" -ForegroundColor Red
            $buildResult | Select-Object -Last 30 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
            Write-Host "`nDeployment aborted due to build failure." -ForegroundColor Red
            Read-Host "`nPress Enter to exit"
            exit 1
        }
        
        Write-Host "Build completed successfully!" -ForegroundColor Green
        
        Write-Host "Pruning devDependencies to save space..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && npm prune --production --legacy-peer-deps"
        Write-Host "  DevDependencies removed (build artifacts retained)" -ForegroundColor Green
        
        Write-Host "Opening firewall ports..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 22/tcp"
        Write-Host "  - Firewall configured" -ForegroundColor Green
        
        Write-Host "Configuring nginx (HTTP-only first)..." -ForegroundColor Yellow
        Write-Host "  - Cleaning old nginx configs..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo rm -f /etc/nginx/sites-enabled/* && sudo rm -f /etc/nginx/sites-available/barangay-website"
        
        Write-Host "  - Installing HTTP-only config..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /root/barangay-website/nginx-http.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/barangay-website"
        
        Write-Host "  - Verifying config file contents..." -ForegroundColor Cyan
        $configCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "head -20 /etc/nginx/sites-enabled/barangay-website"
        Write-Host "    First 20 lines of active config:" -ForegroundColor Gray
        Write-Host $configCheck -ForegroundColor Gray
        
        Write-Host "  - Testing nginx configuration..." -ForegroundColor Cyan
        $nginxTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t 2>&1"
        Write-Host "    Nginx test output: $nginxTest" -ForegroundColor Gray
        
        if ($nginxTest -match "test is successful") {
            Write-Host "  - Nginx config is valid, starting nginx..." -ForegroundColor Green
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl restart nginx && sudo systemctl enable nginx"
            
            Write-Host "  - Verifying nginx is running..." -ForegroundColor Cyan
            $nginxStatus = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl is-active nginx"
            if ($nginxStatus -match "active") {
                Write-Host "  - Nginx is running successfully!" -ForegroundColor Green
                
                Write-Host "  - Testing HTTP access..." -ForegroundColor Cyan
                $httpTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "curl -s -o /dev/null -w '%{http_code}' http://localhost:80"
                Write-Host "    HTTP Status: $httpTest" -ForegroundColor Gray
            } else {
                Write-Host "  - Warning: Nginx may not be running properly" -ForegroundColor Yellow
                $nginxStatusFull = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl status nginx --no-pager -l"
                Write-Host "    Status: $nginxStatusFull" -ForegroundColor Gray
            }
        } else {
            Write-Host "  - Nginx config test failed:" -ForegroundColor Red
            Write-Host "    $nginxTest" -ForegroundColor Yellow
            Write-Host "  - This should not happen with HTTP config. Checking what config is active..." -ForegroundColor Yellow
            $activeConfig = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "ls -la /etc/nginx/sites-enabled/ && cat /etc/nginx/sites-enabled/barangay-website | grep -E 'listen|ssl_certificate'"
            Write-Host "    Active config info: $activeConfig" -ForegroundColor Gray
        }
        
        Write-Host "Setting up SSL certificates..." -ForegroundColor Yellow
        Write-Host "  - Stopping nginx temporarily for SSL setup..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl stop nginx"
        
        Write-Host "  - Attempting to obtain SSL certificate..." -ForegroundColor Cyan
        $sslResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "chmod +x /root/barangay-website/setup-ssl.sh && /root/barangay-website/setup-ssl.sh 2>&1"
        
        Write-Host "  - Checking if SSL certificates were created..." -ForegroundColor Cyan
        $sslCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "test -f /etc/letsencrypt/live/banaderolegazpi.online/fullchain.pem && echo 'SSL_EXISTS' || echo 'SSL_MISSING'"
        
        if ($sslCheck -match "SSL_EXISTS") {
            Write-Host "  - SSL certificates found, switching to HTTPS config..." -ForegroundColor Green
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /root/barangay-website/nginx-https.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/"
            
            Write-Host "  - Ensuring correct port (3001) in nginx config..." -ForegroundColor Cyan
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's|http://127.0.0.1:3000|http://127.0.0.1:3001|g' /etc/nginx/sites-available/barangay-website"
            
            Write-Host "  - Testing HTTPS nginx config..." -ForegroundColor Cyan
            $httpsTest = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo nginx -t 2>&1"
            if ($httpsTest -match "test is successful") {
                Write-Host "  - HTTPS config valid, starting nginx with SSL..." -ForegroundColor Green
                echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl start nginx"
                Write-Host "  - HTTPS enabled successfully!" -ForegroundColor Green
            } else {
                Write-Host "  - HTTPS config test failed, reverting to HTTP..." -ForegroundColor Yellow
                echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /root/barangay-website/nginx-http.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/ && sudo systemctl start nginx"
            }
        } else {
            Write-Host "  - SSL certificates not found, using HTTP-only config" -ForegroundColor Yellow
            Write-Host "  - Ensuring HTTP config is active..." -ForegroundColor Cyan
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo cp /root/barangay-website/nginx-http.conf /etc/nginx/sites-available/barangay-website && sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/"
            
            Write-Host "  - Ensuring correct port (3001) in nginx config..." -ForegroundColor Cyan
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo sed -i 's|http://127.0.0.1:3000|http://127.0.0.1:3001|g' /etc/nginx/sites-available/barangay-website"
            
            echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl start nginx"
            Write-Host "  - Site will be accessible via HTTP only" -ForegroundColor Yellow
            Write-Host "  - To setup SSL later, run: ssh root@${ServerIP} 'systemctl stop nginx && certbot certonly --standalone -d banaderolegazpi.online -d www.banaderolegazpi.online && systemctl start nginx'" -ForegroundColor Cyan
        }
        
        Write-Host "Setting proper permissions for nginx to access files..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo chmod 755 /root && sudo chmod -R 755 /root/barangay-website/public"
        Write-Host "  Permissions set successfully!" -ForegroundColor Green
        
        Write-Host "Checking for .env.local file..." -ForegroundColor Yellow
        $envCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "test -f /root/barangay-website/.env.local && echo 'EXISTS' || echo 'MISSING'"
        if ($envCheck -match "MISSING") {
            Write-Host "  WARNING: .env.local file not found on server!" -ForegroundColor Red
            Write-Host "  Create /root/barangay-website/.env.local with the following variables:" -ForegroundColor Yellow
            Write-Host "    - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
            Write-Host "    - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
            Write-Host "    - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
            Write-Host "    - GOOGLE_CLIENT_ID" -ForegroundColor Cyan
            Write-Host "    - GOOGLE_CLIENT_SECRET" -ForegroundColor Cyan
            Write-Host "    - GOOGLE_REFRESH_TOKEN" -ForegroundColor Cyan
            Write-Host "    - Template IDs (BARANGAY_TEMPLATE_ID, etc.)" -ForegroundColor Cyan
            Write-Host "    - PHILSMS_API_TOKEN (for SMS notifications)" -ForegroundColor Cyan
            Write-Host "    - PHILSMS_NOTIFICATION_NUMBER (for SMS notifications)" -ForegroundColor Cyan
            Write-Host "    - PHILSMS_SENDER_ID (optional, defaults to PhilSMS)" -ForegroundColor Cyan
        } else {
            Write-Host "  .env.local found" -ForegroundColor Green
            Write-Host "  Checking for SMS configuration..." -ForegroundColor Cyan
            $smsCheck = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "grep -q 'PHILSMS_API_TOKEN' /root/barangay-website/.env.local && echo 'SMS_CONFIGURED' || echo 'SMS_MISSING'"
            if ($smsCheck -match "SMS_MISSING") {
                Write-Host "    WARNING: SMS notification variables not found in .env.local" -ForegroundColor Yellow
                Write-Host "    Add these lines to enable SMS notifications:" -ForegroundColor Yellow
                Write-Host "      PHILSMS_API_TOKEN=your-token" -ForegroundColor Cyan
                Write-Host "      PHILSMS_NOTIFICATION_NUMBER=639XXXXXXXXX" -ForegroundColor Cyan
                Write-Host "      PHILSMS_SENDER_ID=YourSenderID" -ForegroundColor Cyan
            } else {
                Write-Host "    SMS configuration found" -ForegroundColor Green
            }
        }
        
        Write-Host "Clearing PM2 logs and stopping old instance..." -ForegroundColor Yellow
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "pm2 stop barangay-website > /dev/null 2>&1; pm2 delete barangay-website > /dev/null 2>&1; pm2 flush > /dev/null 2>&1"
        
        Write-Host "Starting application with PM2..." -ForegroundColor Yellow
        $startResult = echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "cd /root/barangay-website && HOSTNAME=0.0.0.0 PORT=3001 ADMIN_PASSWORD='`$2b`$10`$xXCCrkJAX7zbODYyN47Nnev9/dTKZE7001IQW4Cn/heZd9szAn8w.' pm2 start npm --name barangay-website -- start 2>&1 && pm2 save > /dev/null"
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
        
        # Restart nginx to clear any proxy caches
        Write-Host "Restarting nginx to clear proxy cache..." -ForegroundColor Cyan
        echo y | plink -ssh -pw "$Password" "${Username}@${ServerIP}" "sudo systemctl restart nginx"
        
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
