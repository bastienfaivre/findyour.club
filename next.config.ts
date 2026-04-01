import type { NextConfig } from 'next'

/**
 * Compute R2/MinIO origins for CSP at request time (not build time)
 * so that runtime env vars in standalone mode are picked up.
 */
function getStorageOrigins(): string {
  const origins = new Set<string>()
  try { if (process.env.R2_PUBLIC_URL) origins.add(new URL(process.env.R2_PUBLIC_URL).origin) } catch { /* ignore */ }
  try { if (process.env.R2_ENDPOINT) origins.add(new URL(process.env.R2_ENDPOINT).origin) } catch { /* ignore */ }
  return [...origins].join(' ')
}

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
    const storageOrigins = getStorageOrigins()

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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: blob: https: ${storageOrigins}`.trim(),
              "font-src 'self'",
              `connect-src 'self' https://api.pwnedpasswords.com https://challenges.cloudflare.com https://map.geo.admin.ch ${storageOrigins}`.trim(),
              "frame-src https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
