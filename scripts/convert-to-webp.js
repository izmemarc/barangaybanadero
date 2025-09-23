const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const imageExtensions = ['.jpg', '.jpeg', '.png'];

async function convertToWebP() {
  console.log('🖼️  Converting images to WebP format...');
  
  const files = fs.readdirSync(publicDir);
  let convertedCount = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(ext)) {
      const inputPath = path.join(publicDir, file);
      const outputPath = path.join(publicDir, file.replace(ext, '.webp'));
      
      try {
        // Skip if WebP already exists
        if (fs.existsSync(outputPath)) {
          console.log(`⏭️  Skipping ${file} (WebP already exists)`);
          continue;
        }
        
        await sharp(inputPath)
          .webp({ 
            quality: 85,
            effort: 6,
            smartSubsample: true
          })
          .toFile(outputPath);
        
        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ Converted ${file} → ${path.basename(outputPath)} (${savings}% smaller)`);
        convertedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to convert ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\n🎉 Conversion complete! Converted ${convertedCount} images to WebP format.`);
}

convertToWebP().catch(console.error);
