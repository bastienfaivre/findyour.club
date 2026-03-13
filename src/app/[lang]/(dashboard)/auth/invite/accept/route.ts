import { createHash } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { encodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.url
  const rawToken = request.nextUrl.searchParams.get('token') ?? ''
  if (!rawToken) {
    return NextResponse.redirect(new URL('/auth/error?error=InviteExpired', baseUrl))
  }
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const invitation = await prisma.invitation.findUnique({ where: { tokenHash } })

  if (!invitation || invitation.expiresAt < new Date()) {
    // Delete expired invitation to keep table clean
    if (invitation) await prisma.invitation.delete({ where: { tokenHash } })
    // Invitation already consumed or expired — redirect to home if authenticated,
    // or to login if not (so they end up there after login).
    const session = await getAuthSession()
    if (session?.user?.id) {
      return NextResponse.redirect(new URL('/', baseUrl))
    }
    return NextResponse.redirect(new URL('/auth/login', baseUrl))
  }

  // Find the invited user by email
  const invitedUser = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true, passwordHash: true },
  })

  if (!invitedUser) {
    // Should not happen (user created during inviteEditor), but guard anyway
    return NextResponse.redirect(new URL('/auth/error?error=InviteExpired', baseUrl))
  }

  const session = await getAuthSession()

  if (session?.user?.id === invitedUser.id) {
    // Authenticated as the invited user → activate immediately
    await prisma.$transaction([
      prisma.clubMembership.updateMany({
        where: { userId: invitedUser.id, clubId: invitation.clubId, status: 'PENDING' },
        data: { status: 'ACTIVE', joinedAt: new Date() },
      }),
      prisma.invitation.delete({ where: { tokenHash } }),
    ])
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  if (session) {
    // Logged in as a DIFFERENT user — don't activate, show mismatch error
    return NextResponse.redirect(new URL('/auth/error?error=InviteEmailMismatch', baseUrl))
  }

  // Unauthenticated path: if user already has a password, redirect to login so they can
  // authenticate — invitation stays intact and will be accepted on next visit.
  // Pass the original accept URL as callbackUrl so the user lands back here after login.
  if (invitedUser.passwordHash) {
    const callbackUrl = encodeURIComponent(`/auth/invite/accept?token=${rawToken}`)
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, baseUrl))
  }

  // First-time user: leave invitation intact (it will be cleaned up in setupPassword once
  // the user completes account setup), set setup cookie, and redirect to /auth/setup.
  // This allows the user to close and re-open the link before finishing setup.
  const isProduction = process.env.NODE_ENV === 'production'
  const response = NextResponse.redirect(new URL('/auth/setup', baseUrl))
  response.cookies.set(SETUP_COOKIE_NAME, encodeSetupCookie(invitedUser.id), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  })

  return response
}
