const https = require('https');
const http = require('http');

// Configuration
const TEST_URLS = [
  'http://localhost:3000/logo.png',
  'http://localhost:3000/bg.jpg',
  'http://localhost:3000/_next/static/css/app.css',
  'http://localhost:3000/_next/static/js/app.js',
];

// Function to test cache headers
function testCacheHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      const headers = res.headers;
      const cacheControl = headers['cache-control'];
      const expires = headers['expires'];
      
      resolve({
        url,
        status: res.statusCode,
        cacheControl,
        expires,
        contentType: headers['content-type'],
        contentLength: headers['content-length'],
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Function to analyze cache configuration
function analyzeCacheConfig(result) {
  const analysis = {
    url: result.url,
    hasCacheControl: !!result.cacheControl,
    hasExpires: !!result.expires,
    cacheDuration: null,
    cacheType: 'unknown',
    recommendations: [],
  };
  
  if (result.cacheControl) {
    // Parse max-age
    const maxAgeMatch = result.cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      analysis.cacheDuration = parseInt(maxAgeMatch[1]);
      
      if (analysis.cacheDuration >= 31536000) {
        analysis.cacheType = 'long-term (1 year)';
      } else if (analysis.cacheDuration >= 3600) {
        analysis.cacheType = 'medium-term (1+ hours)';
      } else if (analysis.cacheDuration >= 300) {
        analysis.cacheType = 'short-term (5+ minutes)';
      } else {
        analysis.cacheType = 'very-short-term';
      }
    }
    
    // Check for immutable
    if (result.cacheControl.includes('immutable')) {
      analysis.recommendations.push('✓ Immutable cache - good for static assets');
    }
    
    // Check for public
    if (result.cacheControl.includes('public')) {
      analysis.recommendations.push('✓ Public cache - good for CDN compatibility');
    }
    
    // Check for must-revalidate
    if (result.cacheControl.includes('must-revalidate')) {
      analysis.recommendations.push('✓ Must-revalidate - good for dynamic content');
    }
  }
  
  // File type specific recommendations
  if (result.url.includes('.png') || result.url.includes('.jpg') || result.url.includes('.webp')) {
    if (analysis.cacheDuration < 31536000) {
      analysis.recommendations.push('⚠️  Images should have 1-year cache duration');
    }
  }
  
  if (result.url.includes('.css') || result.url.includes('.js')) {
    if (analysis.cacheDuration < 31536000) {
      analysis.recommendations.push('⚠️  CSS/JS should have 1-year cache duration');
    }
  }
  
  if (result.url.includes('_next/static')) {
    if (analysis.cacheDuration < 31536000) {
      analysis.recommendations.push('⚠️  Next.js static assets should have 1-year cache duration');
    }
  }
  
  return analysis;
}

// Main test function
async function testCaching() {
  console.log('🧪 Testing Cache Headers Configuration\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const url of TEST_URLS) {
    try {
      console.log(`\n🔍 Testing: ${url}`);
      const result = await testCacheHeaders(url);
      const analysis = analyzeCacheConfig(result);
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType || 'N/A'}`);
      console.log(`   Cache-Control: ${result.cacheControl || '❌ Missing'}`);
      console.log(`   Expires: ${result.expires || '❌ Missing'}`);
      
      if (analysis.cacheDuration) {
        const days = Math.floor(analysis.cacheDuration / 86400);
        console.log(`   Cache Duration: ${days} days (${analysis.cacheType})`);
      }
      
      if (analysis.recommendations.length > 0) {
        console.log(`   Recommendations:`);
        analysis.recommendations.forEach(rec => console.log(`     ${rec}`));
      }
      
      results.push(analysis);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 CACHE CONFIGURATION SUMMARY');
  console.log('=' .repeat(60));
  
  const totalTests = results.length;
  const withCacheControl = results.filter(r => r.hasCacheControl).length;
  const withExpires = results.filter(r => r.hasExpires).length;
  const longTermCache = results.filter(r => r.cacheDuration >= 31536000).length;
  
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Cache-Control Headers: ${withCacheControl}/${totalTests} (${Math.round(withCacheControl/totalTests*100)}%)`);
  console.log(`Expires Headers: ${withExpires}/${totalTests} (${Math.round(withExpires/totalTests*100)}%)`);
  console.log(`Long-term Cache (1 year): ${longTermCache}/${totalTests} (${Math.round(longTermCache/totalTests*100)}%)`);
  
  // Overall assessment
  console.log('\n🎯 OVERALL ASSESSMENT:');
  if (withCacheControl === totalTests && longTermCache >= totalTests * 0.8) {
    console.log('✅ Excellent! Cache configuration is properly implemented.');
  } else if (withCacheControl >= totalTests * 0.8) {
    console.log('⚠️  Good! Most assets have cache headers, but some improvements needed.');
  } else {
    console.log('❌ Poor! Cache headers are missing or incorrectly configured.');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Deploy the updated nginx configuration');
  console.log('2. Restart nginx: sudo nginx -s reload');
  console.log('3. Test with live domain instead of localhost');
  console.log('4. Monitor cache hit ratios in server logs');
}

// Run the test
testCaching().catch(console.error);
