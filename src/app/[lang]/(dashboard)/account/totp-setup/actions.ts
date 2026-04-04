'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { totpVerifySchema } from '@/lib/schemas/user'
import { verifyTotpCode } from '@/lib/totp'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'
import { isSupportedLanguage, PLATFORM_FALLBACK_LANG, resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { setTotpVerifiedCookie } from '@/lib/server/cookie-utils'

export type EnrollTotpResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'TOTP_INVALID' | 'SERVER_ERROR' | 'RATE_LIMITED' }
  | { success: true }

/**
 * Verify the user's TOTP code and mark the account as enrolled (or re-enrolled).
 * Only accessible from a logged-in session. For re-enrollment (totpEnabled already true),
 * the user must have already passed the TOTP challenge (totpVerified=true) to prevent
 * an attacker with a stolen session token from replacing the TOTP secret.
 */
export async function enrollTotp(input: unknown, lang?: string): Promise<EnrollTotpResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  // Rate-limit enrollment attempts per IP — same policy as the TOTP challenge (5/10 min).
  // Prevents an attacker with a stolen session token from brute-forcing the pending TOTP secret.
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (checkRateLimit(`totp-enroll:${ip}`)) {
    return { success: false, error: t.errors.tooManyAttempts, code: 'RATE_LIMITED' }
  }

  const session = await getAuthSession()
  const userId = session?.user?.id ?? null

  if (!userId) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  // Re-enrollment guard: if TOTP is already enrolled, the user must have verified it
  // before they can replace their secret. Blocks half-authenticated attackers.
  // session is non-null here — userId guard above ensures session.user.id exists.
  if (session!.user.totpEnabled && !session!.user.totpVerified) {
    return { success: false, error: t.errors.unauthorized, code: 'UNAUTHORIZED' }
  }

  const parsed = totpVerifySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: t.errors.validationError, code: 'VALIDATION_ERROR' }
  }

  // Retrieve the pending TOTP secret from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingTotpSecret: true },
  })

  if (!user?.pendingTotpSecret) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const valid = await verifyTotpCode(user.pendingTotpSecret, parsed.data.code)
  if (!valid) {
    return { success: false, error: t.errors.validationError, code: 'TOTP_INVALID' }
  }

  // Mark TOTP as enrolled and clear the pending secret
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: user.pendingTotpSecret,
        totpEnabled: true,
        pendingTotpSecret: null,
      },
    })
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  // Clear rate limit on success
  clearRateLimit(`totp-enroll:${ip}`)

  // Mark TOTP as verified — user just proved possession of the device
  await setTotpVerifiedCookie(userId)

  const cookieStore = await cookies()
  const langValue = cookieStore.get('platform_lang')?.value
  const redirectLang = isSupportedLanguage(langValue) ? langValue : PLATFORM_FALLBACK_LANG
  redirect(`/${redirectLang}/account`)
}

/**
 * Store the generated TOTP secret in DB so it's available to enrollTotp().
 * Guards against the unauthenticated server-action vector: every exported function
 * in a 'use server' file is an HTTP endpoint, so we verify the session matches userId.
 */
export async function storePendingTotpSecret(userId: string, secret: string): Promise<void> {
  const session = await getAuthSession()
  if (!session?.user?.id || session.user.id !== userId) return
  await prisma.user.update({
    where: { id: userId },
    data: { pendingTotpSecret: secret },
  })
}
