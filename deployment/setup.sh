#!/bin/bash

# Barangay Website Auto Setup Script
# Run this after uploading barangay-website.zip via WinSCP

echo "🚀 Setting up Barangay Bañadero Website..."

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install required software
echo "📦 Installing Node.js, pnpm, nginx, unzip..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs unzip nginx
sudo npm install -g pnpm

# Look for ZIP file
echo "📂 Looking for ZIP file..."
if [ -f "barangay-website.zip" ]; then
    echo "✅ Found ZIP file in current directory"
    ZIP_PATH="barangay-website.zip"
elif [ -f "/root/barangay-website.zip" ]; then
    echo "✅ Found ZIP file in /root/"
    ZIP_PATH="/root/barangay-website.zip"
elif [ -f "/home/$USER/barangay-website.zip" ]; then
    echo "✅ Found ZIP file in home directory"
    ZIP_PATH="/home/$USER/barangay-website.zip"
else
    echo "❌ ZIP file not found! Please upload barangay-website.zip first"
    exit 1
fi

# Clean up old installation and extract fresh
echo "🧹 Cleaning up old installation..."
sudo rm -rf /var/www/barangay-website
sudo mkdir -p /var/www/barangay-website

echo "📦 Extracting project directly to destination..."
echo "ZIP file path: $ZIP_PATH"
echo "Checking ZIP file permissions:"
ls -la "$ZIP_PATH"
cd /var/www/barangay-website
sudo unzip -o "$ZIP_PATH"

# Verify extraction
echo "📁 Verifying extraction..."
if [ -f "package.json" ]; then
    echo "✅ Files extracted correctly - package.json found!"
    echo "Project structure:"
    ls -la | head -10
else
    echo "❌ Extraction failed - no package.json found!"
    echo "Contents of /var/www/barangay-website:"
    ls -la
    echo "Trying alternative extraction method..."
    
    # Alternative: extract to temp and move
    cd /var/www
    sudo rm -rf barangay-website
    sudo mkdir temp_extract
    echo "Trying alternative extraction with full path: $ZIP_PATH"
    sudo unzip -o "$ZIP_PATH" -d temp_extract
    
    if [ -f "temp_extract/package.json" ]; then
        sudo mv temp_extract barangay-website
        echo "✅ Alternative extraction successful!"
    else
        echo "❌ Both extraction methods failed!"
        echo "Contents of temp_extract:"
        ls -la temp_extract/
        exit 1
    fi
fi

# Set permissions
sudo chown -R $USER:$USER /var/www/barangay-website

# Create uploads directory with proper permissions
echo "📁 Setting up uploads directory..."
sudo mkdir -p /var/www/barangay-website/public/uploads
sudo chown -R $USER:$USER /var/www/barangay-website/public/uploads
sudo chmod -R 755 /var/www/barangay-website/public/uploads

# Install dependencies and build
echo "📦 Installing dependencies..."
cd /var/www/barangay-website
pnpm install

echo "🔨 Building application..."
pnpm build

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/barangay-website > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/barangay-website /etc/nginx/sites-enabled/

# Test and start Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw --force enable

# Clean up any existing PM2 processes and install fresh
echo "🧹 Cleaning up old PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "⚙️ Setting up fresh PM2..."
sudo npm install -g pm2
pm2 start "pnpm start" --name "barangay-website"
pm2 save
pm2 startup

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "✅ Your Barangay Bañadero website is now live!"
echo "🌐 Visit: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo ""
echo "📊 Management commands:"
echo "pm2 status                    # Check app status"
echo "pm2 restart barangay-website  # Restart app"
echo "pm2 logs barangay-website     # View logs"
echo ""
echo "🔧 Server setup complete!"
