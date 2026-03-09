'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { totpVerifySchema } from '@/lib/schemas/user'
import { verifyTotpCode } from '@/lib/totp'
import { encodeTotpVerifiedCookie } from '@/lib/setup-cookie'
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit'

const POST_AUTH_REDIRECT = '/'

export type EnrollTotpResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'TOTP_INVALID' | 'SERVER_ERROR' | 'RATE_LIMITED' }
  | { success: true }

/**
 * Verify the user's TOTP code and mark the account as enrolled (or re-enrolled).
 * Only accessible from a logged-in session. For re-enrollment (totpEnabled already true),
 * the user must have already passed the TOTP challenge (totpVerified=true) to prevent
 * an attacker with a stolen session token from replacing the TOTP secret.
 */
export async function enrollTotp(input: unknown): Promise<EnrollTotpResult> {
  // Rate-limit enrollment attempts per IP — same policy as the TOTP challenge (5/10 min).
  // Prevents an attacker with a stolen session token from brute-forcing the pending TOTP secret.
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (checkRateLimit(`totp-enroll:${ip}`)) {
    return { success: false, error: 'Too many attempts. Please wait before trying again.', code: 'RATE_LIMITED' }
  }

  const session = await getAuthSession()
  const userId = session?.user?.id ?? null

  if (!userId) {
    return { success: false, error: 'Session expired. Please log in again.', code: 'UNAUTHORIZED' }
  }

  // Re-enrollment guard: if TOTP is already enrolled, the user must have verified it
  // before they can replace their secret. Blocks half-authenticated attackers.
  // session is non-null here — userId guard above ensures session.user.id exists.
  if (session!.user.totpEnabled && !session!.user.totpVerified) {
    return { success: false, error: 'Please complete the TOTP challenge before re-enrolling.', code: 'UNAUTHORIZED' }
  }

  const parsed = totpVerifySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Code must be exactly 6 digits.', code: 'VALIDATION_ERROR' }
  }

  // Retrieve the pending TOTP secret from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingTotpSecret: true },
  })

  if (!user?.pendingTotpSecret) {
    return { success: false, error: 'Setup session invalid. Please start over.', code: 'UNAUTHORIZED' }
  }

  const valid = await verifyTotpCode(user.pendingTotpSecret, parsed.data.code)
  if (!valid) {
    return { success: false, error: 'Invalid code. Please check your authenticator app and try again.', code: 'TOTP_INVALID' }
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
    return { success: false, error: 'Failed to save TOTP configuration. Please try again.', code: 'SERVER_ERROR' }
  }

  // Clear rate limit on success
  clearRateLimit(`totp-enroll:${ip}`)

  // Mark TOTP as verified — user just proved possession of the device
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieStore = await cookies()
  cookieStore.set('totp_verified', encodeTotpVerifiedCookie(userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    domain: process.env.COOKIE_DOMAIN,
  })

  redirect(POST_AUTH_REDIRECT)
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
