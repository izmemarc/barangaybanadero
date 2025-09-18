const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const inputDir = path.join(__dirname, '../public');
const outputDir = path.join(__dirname, '../public/optimized');
const supportedFormats = ['.jpg', '.jpeg', '.png'];
const svgFormats = ['.svg'];

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to optimize raster images (JPG, PNG)
async function optimizeRasterImage(inputPath, outputPath, format) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing ${path.basename(inputPath)} (${metadata.width}x${metadata.height})`);
    
    let pipeline = image;
    
    // Resize if image is too large (max 1920px width)
    if (metadata.width > 1920) {
      pipeline = pipeline.resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Convert to WebP with quality optimization
    if (format === 'webp') {
      await pipeline
        .webp({ 
          quality: 85,
          effort: 6,
          smartSubsample: true
        })
        .toFile(outputPath);
    }
    // Optimize original format
    else if (format === 'jpg') {
      await pipeline
        .jpeg({ 
          quality: 85,
          progressive: true,
          mozjpeg: true
        })
        .toFile(outputPath);
    }
    else if (format === 'png') {
      await pipeline
        .png({ 
          quality: 85,
          compressionLevel: 9,
          progressive: true
        })
        .toFile(outputPath);
    }
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ Optimized ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${savings}% smaller)`);
    
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
  }
}

// Function to optimize SVG files
async function optimizeSVG(inputPath, outputPath) {
  try {
    const svgContent = fs.readFileSync(inputPath, 'utf8');
    
    // Basic SVG optimization (remove unnecessary whitespace, comments)
    const optimized = svgContent
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
    
    fs.writeFileSync(outputPath, optimized);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ Optimized SVG ${path.basename(inputPath)}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${savings}% smaller)`);
    
  } catch (error) {
    console.error(`Error processing SVG ${inputPath}:`, error.message);
  }
}

// Main optimization function
async function optimizeImages() {
  console.log('🚀 Starting image optimization...\n');
  
  const files = fs.readdirSync(inputDir);
  let processedCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();
    const nameWithoutExt = path.basename(file, ext);
    
    // Skip if not an image file
    if (![...supportedFormats, ...svgFormats].includes(ext)) {
      continue;
    }
    
    // Process SVG files
    if (svgFormats.includes(ext)) {
      const outputPath = path.join(outputDir, file);
      await optimizeSVG(inputPath, outputPath);
      processedCount++;
    }
    // Process raster images
    else if (supportedFormats.includes(ext)) {
      // Create WebP version
      const webpOutputPath = path.join(outputDir, `${nameWithoutExt}.webp`);
      await optimizeRasterImage(inputPath, webpOutputPath, 'webp');
      
      // Create optimized original format version
      const optimizedOutputPath = path.join(outputDir, file);
      const format = ext === '.jpg' || ext === '.jpeg' ? 'jpg' : 'png';
      await optimizeRasterImage(inputPath, optimizedOutputPath, format);
      
      processedCount++;
    }
  }
  
  console.log(`\n✨ Optimization complete! Processed ${processedCount} images.`);
  console.log(`📁 Optimized images saved to: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the optimized images in the /public/optimized folder');
  console.log('2. Replace original images with optimized versions');
  console.log('3. Update your components to use WebP format with fallbacks');
}

// Run the optimization
optimizeImages().catch(console.error);
