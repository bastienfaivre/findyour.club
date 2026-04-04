'use server'
import { randomBytes } from 'crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { resetPasswordSchema } from '@/lib/schemas/user'
import { decodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { isPasswordBreached } from '@/lib/password-validation'
import { setSessionCookie, setTotpVerifiedCookie } from '@/lib/server/cookie-utils'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export type ResetPasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function resetPassword(input: unknown, lang?: string): Promise<ResetPasswordResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  // Guard: only allow reset for users who already have a password (prevents bypassing setup flow)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, totpEnabled: true },
  })

  if (!existingUser?.passwordHash) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? t.errors.validationError
    return { success: false, error: firstError, code: 'VALIDATION_ERROR' }
  }

  const { password } = parsed.data

  // HaveIBeenPwned check (k-anonymity — only first 5 chars of SHA-1 sent)
  if (await isPasswordBreached(password)) {
    return {
      success: false,
      error: 'This password has appeared in a data breach. Please choose a different password.',
      code: 'PASSWORD_BREACHED',
    }
  }

  const passwordHash = await argon2.hash(password)
  const sessionToken = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          magicToken: null,
          magicTokenExp: null,
        },
      }),
      // Invalidate all existing sessions (force re-login on other devices)
      prisma.session.deleteMany({ where: { userId } }),
      // Create a fresh session for this device
      prisma.session.create({ data: { sessionToken, userId, expires } }),
    ])
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  await setSessionCookie(sessionToken, expires)

  if (!existingUser.totpEnabled) {
    await setTotpVerifiedCookie(userId)
  }

  cookieStore.delete(SETUP_COOKIE_NAME)

  redirect('/')
}
