# Image Optimization Guide

This project has been optimized for better web performance by converting images to more efficient formats.

## What Was Done

### 1. Image Format Conversion
- **JPG/PNG → WebP**: All raster images have been converted to WebP format for better compression
- **Original Format Optimization**: Original formats have been optimized with better compression settings
- **SVG Optimization**: SVG files have been cleaned up and optimized

### 2. Performance Improvements
- **Significant size reductions**: Most images saw 50-90% size reduction
- **WebP format**: Modern browsers get WebP (30-50% smaller than JPEG)
- **Fallback support**: Older browsers still get optimized original formats
- **Responsive images**: Automatic sizing and quality optimization

### 3. Key Results
- `bg.jpg`: 618.5KB → 227.0KB (63.3% smaller in WebP)
- `captain.png`: 2423.7KB → 135.1KB (94.4% smaller in WebP)
- `logo.png`: 978.8KB → 48.9KB (95.0% smaller in WebP)

## How to Use Optimized Images

### Option 1: Use the OptimizedImage Component (Recommended)

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

// Basic usage
<OptimizedImage 
  src="/logo.png" 
  alt="Barangay Logo" 
  width={200} 
  height={200} 
/>

// With additional props
<OptimizedImage 
  src="/captain.png" 
  alt="Barangay Captain" 
  width={300} 
  height={400}
  className="rounded-lg shadow-md"
  priority={true}
/>
```

### Option 2: Manual Implementation

```tsx
<picture>
  <source srcSet="/logo.webp" type="image/webp" />
  <img src="/logo.png" alt="Barangay Logo" />
</picture>
```

## Available Scripts

### Optimize Images
```bash
pnpm run optimize-images
```
- Converts all images in `/public` to WebP and optimized formats
- Saves optimized images to `/public/optimized`
- Shows detailed compression statistics

### Replace Original Images
```bash
pnpm run replace-images
```
- Replaces original images with optimized versions
- Creates `.backup` files of originals
- Copies WebP files to public directory

## File Structure

```
public/
├── *.jpg, *.png, *.jpeg     # Optimized original formats
├── *.webp                   # WebP versions for modern browsers
├── *.svg                    # Optimized SVG files
└── *.backup                 # Backup of original files

public/optimized/            # Working directory for optimization
└── [optimized files]       # Temporary optimized files
```

## Browser Support

- **WebP**: Supported in Chrome 23+, Firefox 65+, Safari 14+, Edge 18+
- **Fallback**: All browsers get optimized original formats
- **Progressive Enhancement**: Modern browsers get better performance automatically

## Best Practices

1. **Use OptimizedImage component** for automatic format selection
2. **Set appropriate sizes** for responsive images
3. **Use priority={true}** for above-the-fold images
4. **Optimize images before adding** to the project
5. **Run optimization script** when adding new images

## Performance Impact

- **Faster page loads**: 50-90% smaller image sizes
- **Better Core Web Vitals**: Improved LCP (Largest Contentful Paint)
- **Reduced bandwidth**: Especially beneficial for mobile users
- **SEO benefits**: Better page speed scores

## Maintenance

When adding new images:
1. Add images to `/public`
2. Run `pnpm run optimize-images`
3. Run `pnpm run replace-images`
4. Use `OptimizedImage` component in your code

## Troubleshooting

### Images not loading
- Check that WebP files exist in `/public`
- Verify file paths are correct
- Ensure fallback images are available

### Large file sizes
- Re-run optimization script
- Check if images are already optimized
- Consider further compression settings

### Browser compatibility
- WebP fallback should work automatically
- Check browser developer tools for format being served
- Test in different browsers
