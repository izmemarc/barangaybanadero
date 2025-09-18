const fs = require('fs');
const path = require('path');

// Configuration
const optimizedDir = path.join(__dirname, '../public/optimized');
const publicDir = path.join(__dirname, '../public');

// Function to replace original images with optimized versions
function replaceImages() {
  console.log('🔄 Replacing original images with optimized versions...\n');
  
  const optimizedFiles = fs.readdirSync(optimizedDir);
  let replacedCount = 0;
  
  for (const file of optimizedFiles) {
    const optimizedPath = path.join(optimizedDir, file);
    const originalPath = path.join(publicDir, file);
    
    // Skip if it's a WebP file (we'll keep both formats)
    if (file.endsWith('.webp')) {
      continue;
    }
    
    // Skip if original file doesn't exist
    if (!fs.existsSync(originalPath)) {
      console.log(`⚠️  Original file not found: ${file}`);
      continue;
    }
    
    try {
      // Backup original file
      const backupPath = path.join(publicDir, `${file}.backup`);
      fs.copyFileSync(originalPath, backupPath);
      
      // Replace with optimized version
      fs.copyFileSync(optimizedPath, originalPath);
      
      const originalSize = fs.statSync(backupPath).size;
      const optimizedSize = fs.statSync(originalPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ Replaced ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${savings}% smaller)`);
      replacedCount++;
      
    } catch (error) {
      console.error(`Error replacing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✨ Replacement complete! Replaced ${replacedCount} images.`);
  console.log('📁 Original files backed up with .backup extension');
  console.log('💡 You can now use the OptimizedImage component in your React components');
}

// Run the replacement
replaceImages();
