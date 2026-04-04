'use server'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { type UserRole } from '@/generated/prisma/client'
import { loginSchema } from '@/lib/schemas/user'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'
import { getNumberSetting } from '@/lib/server/platform-settings'
import { setSessionCookie, setTotpVerifiedCookie } from '@/lib/server/cookie-utils'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export type LoginResult =
  | { success: false; error: string; code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'SERVER_ERROR' }
  | { success: true; totpEnabled: boolean; role: UserRole; firstClubId: string | null }

/**
 * Authenticates a user with email/password and creates a database session directly.
 *
 * next-auth v4 does not support CredentialsProvider with database session strategy
 * (signIn('credentials') throws UnsupportedStrategyError). We bypass the next-auth
 * signIn flow and create the session manually — identical to what enrollTotp() does.
 */
export async function loginWithCredentials(input: unknown, lang?: string): Promise<LoginResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  // Rate-limit by IP to prevent password brute-force attacks
  const headersList = await headers()
  // x-forwarded-for is set by Nginx; relies on correct proxy configuration in production
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rateLimitKey = `login:${ip}`

  const maxAttempts = await getNumberSetting('rate.login_attempts_per_hour')
  if (checkRateLimit(rateLimitKey, { windowMs: 3_600_000, maxAttempts })) {
    return { success: false, error: t.errors.tooManyAttempts, code: 'RATE_LIMITED' }
  }

  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: t.errors.invalidCredentials, code: 'VALIDATION_ERROR' }
  }

  // Per-email rate limit — prevents brute-force even if attacker spoofs x-forwarded-for
  const emailRateLimitKey = `login:email:${parsed.data.email.toLowerCase()}`
  if (checkRateLimit(emailRateLimitKey, { windowMs: 3_600_000, maxAttempts: 10 })) {
    return { success: false, error: t.errors.tooManyAttempts, code: 'RATE_LIMITED' }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true, role: true, passwordHash: true, totpEnabled: true,
      memberships: { where: { status: 'ACTIVE' }, select: { clubId: true }, take: 1, orderBy: { joinedAt: 'asc' } },
    },
  })

  if (!user || !user.passwordHash) {
    return { success: false, error: t.errors.invalidCredentials, code: 'INVALID_CREDENTIALS' }
  }

  const valid = await argon2.verify(user.passwordHash, parsed.data.password)
  if (!valid) {
    return { success: false, error: t.errors.invalidCredentials, code: 'INVALID_CREDENTIALS' }
  }

  // Clear rate limits on successful credential verification
  clearRateLimit(rateLimitKey)
  clearRateLimit(emailRateLimitKey)

  // Create a database session directly (same pattern as setupPassword)
  const sessionToken = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  try {
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } })
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  await setSessionCookie(sessionToken, expires)

  // If TOTP is not enrolled, mark the session as verified immediately
  if (!user.totpEnabled) {
    await setTotpVerifiedCookie(user.id)
  }

  const firstClubId = user.memberships[0]?.clubId ?? null
  return { success: true, totpEnabled: user.totpEnabled, role: user.role, firstClubId }
}
