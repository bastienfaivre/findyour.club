import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db'
import { SESSION_COOKIE_NAME } from '@/server/auth'

/**
 * GET /{lang}/auth/logout
 * Deletes the database session, clears auth cookies, redirects to home.
 * Works with sessions created by loginWithCredentials() and setupPassword().
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (sessionToken) {
    // deleteMany won't throw if the session is already gone
    await prisma.session.deleteMany({ where: { sessionToken } }).catch(() => {})
  }

  const response = NextResponse.redirect(new URL(`/${lang}/`, request.url))
  response.cookies.delete(SESSION_COOKIE_NAME)
  response.cookies.delete('totp_verified')
  response.cookies.delete('setup_session')
  return response
}
