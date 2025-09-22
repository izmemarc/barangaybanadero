# Caching Configuration Guide

This document explains the comprehensive caching strategy implemented for the barangay website to improve performance and reduce server load.

## Overview

The website now implements a multi-layered caching strategy using both Next.js headers and nginx configuration to ensure optimal performance across all asset types.

## Caching Strategy

### 1. Static Assets (1 Year Cache)
**Files**: Images, CSS, JavaScript, Fonts, Next.js static files
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Expires**: Set to December 31, 2025
- **Rationale**: These files rarely change and can be cached aggressively

### 2. HTML Pages (1 Hour Cache)
**Files**: HTML pages and routes
- **Cache-Control**: `public, max-age=3600, must-revalidate`
- **Expires**: Set to 1 hour from request
- **Rationale**: HTML content may change more frequently, but still benefits from short-term caching

### 3. Dynamic Content (5 Minutes Cache)
**Files**: API responses and dynamic routes
- **Cache-Control**: `public, max-age=300`
- **Rationale**: Balance between performance and freshness for dynamic content

## Implementation Details

### Next.js Configuration (`next.config.mjs`)

```javascript
async headers() {
  return [
    // Static assets with long expiration
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    // Images with long expiration
    {
      source: '/(.*\\.(jpg|jpeg|png|gif|ico|svg|webp|avif))',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Expires',
          value: new Date(Date.now() + 31536000 * 1000).toUTCString(),
        },
      ],
    },
    // ... additional configurations
  ]
}
```

### Nginx Configuration (`deployment/nginx.conf`)

```nginx
# Cache static assets with long expiration (1 year)
location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header Expires "Thu, 31 Dec 2025 23:59:59 GMT" always;
}

# Cache CSS and JavaScript files (1 year)
location ~* \.(css|js)$ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header Expires "Thu, 31 Dec 2025 23:59:59 GMT" always;
}
```

## Cache Headers Explained

### Cache-Control Directives

- **`public`**: Allows caching by browsers and CDNs
- **`max-age=31536000`**: Cache for 1 year (31,536,000 seconds)
- **`immutable`**: Indicates the resource will never change
- **`must-revalidate`**: Forces revalidation after expiration
- **`no-cache`**: Always revalidate before serving from cache

### Expires Header

- **Purpose**: Fallback for older browsers that don't support Cache-Control
- **Format**: RFC 2822 date format (e.g., "Thu, 31 Dec 2025 23:59:59 GMT")
- **Behavior**: Browser will not request the resource until after this date

## Performance Benefits

### 1. Reduced Server Load
- **Static assets**: 99% reduction in requests after first visit
- **Bandwidth savings**: Significant reduction in data transfer
- **Server resources**: Less CPU and memory usage

### 2. Improved User Experience
- **Faster page loads**: Cached assets load instantly
- **Reduced latency**: No network requests for cached resources
- **Better Core Web Vitals**: Improved LCP, FID, and CLS scores

### 3. SEO Benefits
- **Page speed**: Better Google PageSpeed scores
- **User engagement**: Faster sites have lower bounce rates
- **Mobile performance**: Critical for mobile users with limited bandwidth

## Testing Cache Implementation

### 1. Browser Developer Tools
```bash
# Check cache headers in Network tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reload page
4. Check Response Headers for Cache-Control and Expires
```

### 2. Command Line Testing
```bash
# Test cache headers with curl
curl -I https://your-domain.com/logo.png

# Expected output:
# Cache-Control: public, max-age=31536000, immutable
# Expires: Thu, 31 Dec 2025 23:59:59 GMT
```

### 3. Online Tools
- **GTmetrix**: Check cache headers in waterfall view
- **WebPageTest**: Analyze caching behavior
- **Google PageSpeed Insights**: Verify cache optimization

## Cache Invalidation

### When to Clear Cache

1. **Static assets**: Only when files are actually updated
2. **HTML pages**: Automatically after 1 hour
3. **Dynamic content**: Automatically after 5 minutes

### Manual Cache Clearing

```bash
# Clear nginx cache (if using nginx cache)
sudo nginx -s reload

# Clear browser cache
# Ctrl+Shift+R (hard refresh)
# Or clear browser data in settings
```

## Monitoring Cache Performance

### Key Metrics to Monitor

1. **Cache Hit Ratio**: Percentage of requests served from cache
2. **Bandwidth Usage**: Reduction in data transfer
3. **Page Load Times**: Improvement in loading speed
4. **Server Load**: Reduction in CPU and memory usage

### Tools for Monitoring

- **nginx access logs**: Analyze cache hit patterns
- **Google Analytics**: Track page load times
- **Server monitoring**: CPU, memory, and bandwidth usage
- **CDN analytics**: If using a CDN service

## Best Practices

### 1. File Versioning
- Use versioned filenames for static assets
- Example: `logo-v2.png` instead of `logo.png`
- Allows aggressive caching without cache invalidation issues

### 2. Content Delivery Network (CDN)
- Consider using a CDN for global caching
- CDNs provide additional caching layers
- Reduces latency for users far from your server

### 3. Compression
- Enable gzip/brotli compression
- Works alongside caching for maximum performance
- Reduces file sizes before caching

### 4. Cache Headers Priority
- nginx headers take precedence over Next.js headers
- Ensure consistency between both configurations
- Test thoroughly after any changes

## Troubleshooting

### Common Issues

1. **Cache not working**
   - Check nginx configuration syntax
   - Verify Next.js headers are properly configured
   - Test with browser developer tools

2. **Stale content**
   - Check cache expiration times
   - Verify file modification dates
   - Clear browser cache for testing

3. **Performance not improved**
   - Monitor cache hit ratios
   - Check if assets are actually being cached
   - Verify cache headers are being sent

### Debug Commands

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx configuration
sudo nginx -s reload

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test cache headers
curl -I https://your-domain.com/static-asset.jpg
```

## Future Improvements

1. **HTTP/2 Server Push**: Push critical resources
2. **Service Workers**: Advanced client-side caching
3. **CDN Integration**: Global content delivery
4. **Cache Warming**: Pre-populate cache with popular content
5. **Analytics Integration**: Monitor cache performance metrics

This caching configuration will significantly improve your website's performance and user experience while reducing server costs and bandwidth usage.
