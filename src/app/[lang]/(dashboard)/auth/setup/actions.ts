'use server'
import { randomBytes, createHash } from 'crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { setupPasswordSchema } from '@/lib/schemas/user'
import { decodeSetupCookie, SETUP_COOKIE_NAME, encodeTotpVerifiedCookie } from '@/lib/setup-cookie'
import { SESSION_COOKIE_NAME } from '@/server/auth'

const POST_AUTH_REDIRECT = '/'

export type SetupPasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'ALREADY_CONFIGURED' | 'VALIDATION_ERROR' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function setupPassword(input: unknown): Promise<SetupPasswordResult> {
  // Validate setup session cookie
  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    return { success: false, error: 'Session expired. Please request a new setup link.', code: 'UNAUTHORIZED' }
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
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: firstError, code: 'VALIDATION_ERROR' }
  }

  const { firstName, lastName, phone, preferredLanguage, password } = parsed.data

  // HaveIBeenPwned check (k-anonymity — only first 5 chars of SHA-1 sent)
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    if (res.ok) {
      const text = await res.text()
      const isPwned = text.split('\r\n').some(line => line.split(':')[0] === suffix) ||
        text.split('\n').some(line => line.split(':')[0] === suffix)
      if (isPwned) {
        return {
          success: false,
          error: 'This password has appeared in a data breach. Please choose a different password.',
          code: 'PASSWORD_BREACHED',
        }
      }
    }
    // If HIBP unreachable, allow setup to proceed (availability > perfect security for this check)
  } catch {
    // HIBP unavailable — proceed
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
    return { success: false, error: 'Failed to complete account setup. Please try again.', code: 'SERVER_ERROR' }
  }

  const isProduction = process.env.NODE_ENV === 'production'

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires,
    domain: process.env.COOKIE_DOMAIN,
  })

  // totpEnabled is false at this point — mark as verified immediately
  cookieStore.set('totp_verified', encodeTotpVerifiedCookie(userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    domain: process.env.COOKIE_DOMAIN,
  })

  // Clear the setup_session cookie — user is now fully authenticated
  cookieStore.delete(SETUP_COOKIE_NAME)

  redirect(POST_AUTH_REDIRECT)
}
