import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from '@/server/auth'
import { encodeTotpVerifiedCookie } from '@/lib/setup-cookie'

function baseCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
  }
}

/**
 * Set the session cookie with the given token and expiry.
 */
export async function setSessionCookie(sessionToken: string, expires: Date): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    ...baseCookieOptions(),
    expires,
  })
}

/**
 * Set the totp_verified cookie for the given user.
 */
export async function setTotpVerifiedCookie(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('totp_verified', encodeTotpVerifiedCookie(userId), {
    ...baseCookieOptions(),
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

/**
 * Clear the totp_verified cookie (e.g. when TOTP is disabled).
 */
export async function clearTotpVerifiedCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('totp_verified', '', {
    ...baseCookieOptions(),
    maxAge: 0,
  })
}

/**
 * Clear all auth-related cookies (session + totp_verified).
 * Used during account deletion.
 */
export async function clearAllAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const opts = { ...baseCookieOptions(), maxAge: 0 }
  cookieStore.set('next-auth.session-token', '', opts)
  cookieStore.set('__Secure-next-auth.session-token', '', opts)
  cookieStore.set('totp_verified', '', opts)
}
