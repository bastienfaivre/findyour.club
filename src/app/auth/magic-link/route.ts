import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicLinkToken } from './actions'
import { encodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { getAuthSession } from '@/server/auth'

/**
 * GET /auth/magic-link?token=<raw_token>
 *
 * Verifies the token and, on success, sets the setup_session cookie and
 * redirects to /auth/setup. Errors redirect to /auth/error with a code.
 *
 * A Route Handler is used (not a Server Component + Server Action) because
 * Next.js only allows cookies() mutation in Route Handlers or Server Actions
 * invoked from Client Components.
 *
 * Uses the canonical Route Handler cookie pattern: set cookies directly on the
 * NextResponse object rather than via cookies() from next/headers, which relies
 * on Next.js internals merging mutations into an independently-created response.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''

  const result = await verifyMagicLinkToken(token)

  if (!result.success) {
    const errorCode = result.code === 'TOKEN_EXPIRED' ? 'TokenExpired' : 'TokenInvalid'
    return NextResponse.redirect(new URL(`/auth/error?error=${errorCode}`, request.url))
  }

  // If the user already completed setup (has a password), the magic link is a re-use
  // after initial onboarding. Session check only matters here: first-time users never
  // have a session, so calling getAuthSession() unconditionally would always return null.
  if (result.alreadyConfigured) {
    const session = await getAuthSession()
    const dest = session?.user?.id ? '/' : '/auth/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const response = NextResponse.redirect(new URL('/auth/setup', request.url))
  response.cookies.set(SETUP_COOKIE_NAME, encodeSetupCookie(result.userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  })

  return response
}
