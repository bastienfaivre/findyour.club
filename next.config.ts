import type { NextConfig } from 'next'

function r2RemotePattern(): { protocol: 'https'; hostname: string } | null {
  const url = process.env.R2_PUBLIC_URL
  if (!url) return null
  try {
    const { hostname } = new URL(url)
    return { protocol: 'https', hostname }
  } catch {
    return null
  }
}

const r2Pattern = r2RemotePattern()

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'picsum.photos' },
      ...(r2Pattern ? [r2Pattern] : []),
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
