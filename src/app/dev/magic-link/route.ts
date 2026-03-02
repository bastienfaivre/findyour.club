// DEV-ONLY route — returns 404 in production
import { createHash, randomBytes } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

/**
 * GET /dev/magic-link?email=<email>
 *
 * Generates a fresh magic link token for the given user and immediately
 * redirects to /auth/magic-link?token=... so you can test the full first-login flow.
 *
 * Usage:
 *   https://localhost:3000/dev/magic-link?email=admin@ski-club-valais.ch
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  const email = request.nextUrl.searchParams.get('email')
  if (!email) {
    return new NextResponse('Missing ?email= parameter', { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    return new NextResponse(`No user found with email: ${email}`, { status: 404 })
  }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const exp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { magicToken: tokenHash, magicTokenExp: exp },
  })

  return NextResponse.redirect(new URL(`/auth/magic-link?token=${rawToken}`, request.url))
}
