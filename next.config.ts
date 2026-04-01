import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
// Add your R2 public hostname here for production, e.g.:
      // { protocol: 'https', hostname: 'pub-xxx.r2.dev' },
    ],
    // Allow image optimization to fetch from localhost (MinIO) in dev.
    // Safe because this is a self-hosted platform, not a public image proxy.
    dangerouslyAllowLocalIP: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // CSP is set dynamically in middleware.ts to include runtime R2 origins
        ],
      },
    ]
  },
}

export default nextConfig
