#!/bin/bash

# Barangay Website Update Script
# Run this after uploading new barangay-website.zip via WinSCP

echo "🔄 Updating Barangay Bañadero Website..."

# Look for ZIP file
echo "📂 Looking for updated ZIP file..."
if [ -f "barangay-website.zip" ]; then
    ZIP_PATH="barangay-website.zip"
elif [ -f "/root/barangay-website.zip" ]; then
    ZIP_PATH="/root/barangay-website.zip"
elif [ -f "/home/$USER/barangay-website.zip" ]; then
    ZIP_PATH="/home/$USER/barangay-website.zip"
else
    echo "❌ ZIP file not found! Please upload barangay-website.zip first"
    exit 1
fi

# Stop the application
echo "⏹️ Stopping application..."
pm2 stop barangay-website

# Backup current version
echo "💾 Creating backup..."
sudo mv /var/www/barangay-website /var/www/barangay-website-backup-$(date +%Y%m%d-%H%M%S)

# Create fresh directory and extract new version
echo "📦 Extracting new version..."
sudo mkdir -p /var/www/barangay-website
cd /var/www/barangay-website
sudo unzip -o "$ZIP_PATH"

# Move files to correct location if needed
echo "📁 Organizing files..."
if [ -f "package.json" ]; then
    echo "✅ Files extracted correctly"
elif [ -d "barangay-website-main" ]; then
    echo "📁 Moving files from barangay-website-main"
    sudo mv barangay-website-main/* .
    sudo rmdir barangay-website-main
elif [ "$(find . -name "package.json" -type f | wc -l)" -gt 0 ]; then
    # Find package.json and move everything to root
    PACKAGE_DIR=$(find . -name "package.json" -type f | head -1 | xargs dirname)
    if [ "$PACKAGE_DIR" != "." ]; then
        echo "📁 Moving files from $PACKAGE_DIR"
        sudo mv "$PACKAGE_DIR"/* .
        sudo rmdir "$PACKAGE_DIR" 2>/dev/null || true
    fi
else
    echo "❌ No package.json found after extraction!"
    ls -la
    exit 1
fi

# Set permissions
sudo chown -R $USER:$USER /var/www/barangay-website

# Ensure uploads directory exists with proper permissions
echo "📁 Setting up uploads directory..."
sudo mkdir -p /var/www/barangay-website/public/uploads
sudo chown -R $USER:$USER /var/www/barangay-website/public/uploads
sudo chmod -R 755 /var/www/barangay-website/public/uploads

# Install dependencies and build
echo "📦 Installing dependencies..."
cd /var/www/barangay-website
pnpm install

# Rebuild Sharp for production environment
echo "🖼️ Rebuilding Sharp for production..."
npm rebuild sharp

echo "🔨 Building application..."
pnpm build

# Restart application
echo "🚀 Starting application..."
pm2 start barangay-website

echo ""
echo "🎉 UPDATE COMPLETE!"
echo "🌐 Your website has been updated!"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs barangay-website"
