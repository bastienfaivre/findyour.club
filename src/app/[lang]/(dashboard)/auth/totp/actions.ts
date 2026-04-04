'use server'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { prisma } from '@/server/db'
import { totpVerifySchema } from '@/lib/schemas/user'
import { verifyTotpCode } from '@/lib/totp'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'
import { isSupportedLanguage, PLATFORM_FALLBACK_LANG, resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { setTotpVerifiedCookie } from '@/lib/server/cookie-utils'

export type TotpChallengeResult =
  | { success: false; error: string; code: 'UNAUTHENTICATED' | 'VALIDATION_ERROR' | 'TOTP_INVALID' | 'RATE_LIMITED' | 'TOTP_NOT_CONFIGURED' }
  | { success: true }

export async function verifyTotpChallenge(input: unknown, lang?: string): Promise<TotpChallengeResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const headersList = await headers()
  // x-forwarded-for is set by Nginx; relies on correct proxy configuration in production
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const ipRateLimitKey = `totp:${ip}`

  // Rate limit by IP first (before session lookup to protect against enumeration)
  if (checkRateLimit(ipRateLimitKey)) {
    return {
      success: false,
      error: t.errors.tooManyAttempts,
      code: 'RATE_LIMITED',
    }
  }

  // Use getServerSession (not getAuthSession) intentionally: getAuthSession also reads the
  // totp_verified cookie. Here we want the raw session — if the user is here they haven't
  // verified TOTP yet, so totp_verified would be absent/invalid regardless.
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHENTICATED' }
  }

  // Per-user rate limit — prevents brute-force even if attacker rotates IPs
  const userRateLimitKey = `totp:user:${session.user.id}`
  if (checkRateLimit(userRateLimitKey)) {
    return {
      success: false,
      error: t.errors.tooManyAttempts,
      code: 'RATE_LIMITED',
    }
  }

  const parsed = totpVerifySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: t.errors.validationError, code: 'VALIDATION_ERROR' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      totpSecret: true, role: true,
      memberships: { where: { status: 'ACTIVE' }, select: { clubId: true }, take: 1, orderBy: { joinedAt: 'asc' } },
    },
  })

  if (!user?.totpSecret) {
    return { success: false, error: 'TOTP not configured for this account.', code: 'TOTP_NOT_CONFIGURED' }
  }

  const valid = await verifyTotpCode(user.totpSecret, parsed.data.code)
  if (!valid) {
    return { success: false, error: 'Invalid code. Please try again.', code: 'TOTP_INVALID' }
  }

  // Clear rate limits on success
  clearRateLimit(ipRateLimitKey)
  clearRateLimit(userRateLimitKey)

  // Mark TOTP as verified via an encrypted HttpOnly cookie
  await setTotpVerifiedCookie(session.user.id)

  const cookieStore = await cookies()
  const langValue = cookieStore.get('platform_lang')?.value
  const redirectLang = isSupportedLanguage(langValue) ? langValue : PLATFORM_FALLBACK_LANG
  const firstClubId = user.memberships[0]?.clubId
  if (user.role === 'OPERATOR') {
    redirect(`/${redirectLang}/admin/stats`)
  } else if (firstClubId) {
    redirect(`/${redirectLang}/club/${firstClubId}`)
  } else {
    redirect(`/${redirectLang}/`)
  }
}
