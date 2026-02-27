import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow *.lvh.me subdomains (ch.lvh.me, fr.lvh.me, etc.) to load /_next/* assets in dev
  // Required because the browser origin differs from the dev server origin when using subdomains
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  // CSP and security headers will be added in later stories
}

export default nextConfig
