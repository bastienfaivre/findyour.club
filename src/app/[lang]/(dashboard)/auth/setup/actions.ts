'use server'
import { randomBytes } from 'crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { setupPasswordSchema } from '@/lib/schemas/user'
import { decodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { isPasswordBreached } from '@/lib/password-validation'
import { setSessionCookie, setTotpVerifiedCookie } from '@/lib/server/cookie-utils'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export type SetupPasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'ALREADY_CONFIGURED' | 'VALIDATION_ERROR' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function setupPassword(input: unknown, lang?: string): Promise<SetupPasswordResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  // Validate setup session cookie
  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  // Guard: reject if a password is already set (prevents setup_session replay after completion)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true, firstName: true },
  })
  if (existingUser?.passwordHash) {
    return { success: false, error: 'Password already configured for this account.', code: 'ALREADY_CONFIGURED' }
  }

  // Profile already populated (e.g. from application approval) — don't overwrite
  const profileLocked = !!existingUser?.firstName

  // Validate input
  const parsed = setupPasswordSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? t.errors.validationError
    return { success: false, error: firstError, code: 'VALIDATION_ERROR' }
  }

  const { firstName, lastName, phone, preferredLanguage, password } = parsed.data

  // HaveIBeenPwned check (k-anonymity — only first 5 chars of SHA-1 sent)
  if (await isPasswordBreached(password)) {
    return {
      success: false,
      error: 'This password has appeared in a data breach. Please choose a different password.',
      code: 'PASSWORD_BREACHED',
    }
  }

  // Hash with argon2 (default: argon2id)
  const passwordHash = await argon2.hash(password)

  // Atomic transaction: store password hash, create session, activate any PENDING memberships,
  // and clean up any pending invitations for this email.
  // updateMany/deleteMany are no-ops when no matching records exist.
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
          // Only update profile fields for new editors (not pre-filled from approval)
          ...(!profileLocked && {
            firstName,
            lastName,
            phone: phone || null,
            preferredLanguage,
          }),
        },
      }),
      prisma.session.create({ data: { sessionToken, userId, expires } }),
      prisma.clubMembership.updateMany({
        where: { userId, status: 'PENDING' },
        data: { status: 'ACTIVE', joinedAt: new Date() },
      }),
      prisma.invitation.deleteMany({
        where: { email: existingUser?.email ?? '' },
      }),
    ])
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  await setSessionCookie(sessionToken, expires)

  // totpEnabled is false at this point — mark as verified immediately
  await setTotpVerifiedCookie(userId)

  // Clear the setup_session cookie — user is now fully authenticated
  cookieStore.delete(SETUP_COOKIE_NAME)

  // Redirect to the user's first club profile page (if they have one)
  const firstMembership = await prisma.clubMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
    select: { clubId: true },
    orderBy: { joinedAt: 'desc' },
  })

  const langPrefix = lang ? `/${lang}` : ''
  redirect(firstMembership ? `${langPrefix}/club/${firstMembership.clubId}` : `${langPrefix}/`)
}
