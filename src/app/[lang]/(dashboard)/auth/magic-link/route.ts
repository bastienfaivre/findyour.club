import { type NextRequest, NextResponse } from 'next/server'
import { verifyMagicLinkToken } from './actions'
import { encodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'

/**
 * GET /auth/magic-link?token=<raw_token>
 *
 * Verifies the token and, on success, sets the setup_session cookie and
 * redirects to the appropriate page. Errors redirect to /auth/error with a code.
 *
 * Handles both first-time setup (new account) and password reset (existing account):
 * - New account (no password): sets setup cookie, redirects to /auth/setup
 * - Password reset (has password): sets setup cookie, redirects to /auth/reset-password
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.url

  const result = await verifyMagicLinkToken(token)

  if (!result.success) {
    const errorCode = result.code === 'TOKEN_EXPIRED' ? 'TokenExpired' : 'TokenInvalid'
    return NextResponse.redirect(new URL(`/auth/error?error=${errorCode}`, baseUrl))
  }

  const dest = result.alreadyConfigured ? '/auth/reset-password' : '/auth/setup'

  const isProduction = process.env.NODE_ENV === 'production'
  const response = NextResponse.redirect(new URL(dest, baseUrl))
  response.cookies.set(SETUP_COOKIE_NAME, encodeSetupCookie(result.userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  })

  return response
}
