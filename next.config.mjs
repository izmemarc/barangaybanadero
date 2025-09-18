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
    ]
  },
}

export default nextConfig
