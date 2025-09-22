/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable automatic redirects and ensure proper host binding
  trailingSlash: false,
  poweredByHeader: false,
  // Ensure the app doesn't redirect to localhost
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      // Cache static assets with long expiration
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images with long expiration
      {
        source: '/:path*\\.(jpg|jpeg|png|gif|ico|svg|webp|avif)',
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
      // Cache CSS and JS files
      {
        source: '/:path*\\.(css|js)',
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
      // Cache fonts
      {
        source: '/:path*\\.(woff|woff2|eot|ttf|otf)',
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
      // Short cache for HTML pages
      {
        source: '/:path*\\.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'Expires',
            value: new Date(Date.now() + 3600 * 1000).toUTCString(),
          },
        ],
      },
    ]
  },
}

export default nextConfig
