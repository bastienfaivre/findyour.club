import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { generateBadgeImage } from '@/lib/og-image'
import { VERIFICATION_CYCLE_DAYS } from '@/lib/verification'
import { checkRateLimit } from '@/lib/rate-limit'

let faviconDataUrl: string | null = null
async function getFaviconDataUrl(): Promise<string> {
  if (!faviconDataUrl) {
    const buf = await readFile(join(process.cwd(), 'public', 'apple-touch-icon.png'))
    faviconDataUrl = `data:image/png;base64,${buf.toString('base64')}`
  }
  return faviconDataUrl
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string; slug: string }> },
) {
  const { country, slug } = await params

  // Rate limit by IP: 60 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (checkRateLimit(`badge:${ip}`, { windowMs: 60_000, maxAttempts: 60 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const club = await prisma.club.findUnique({
    where: { slug_country: { slug, country } },
    select: { name: true, logoUrl: true, lastVerifiedAt: true },
  })
  if (!club) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const favicon = await getFaviconDataUrl()
  const isVerified = club.lastVerifiedAt != null &&
    (Date.now() - new Date(club.lastVerifiedAt).getTime()) < VERIFICATION_CYCLE_DAYS * 86_400_000
  const response = await generateBadgeImage({
    clubName: club.name,
    clubLogoUrl: club.logoUrl,
    faviconDataUrl: favicon,
    verified: isVerified,
  })

  // Cache for 1 day, revalidate in background for up to 7 days
  response.headers.set(
    'Cache-Control',
    'public, max-age=86400, stale-while-revalidate=604800',
  )

  return response
}
