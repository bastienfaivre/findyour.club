'use server'
import { randomBytes, createHash } from 'crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db'
import { resetPasswordSchema } from '@/lib/schemas/user'
import { decodeSetupCookie, SETUP_COOKIE_NAME, encodeTotpVerifiedCookie } from '@/lib/setup-cookie'
import { SESSION_COOKIE_NAME } from '@/server/auth'

export type ResetPasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function resetPassword(input: unknown): Promise<ResetPasswordResult> {
  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    return { success: false, error: 'Session expired. Please request a new reset link.', code: 'UNAUTHORIZED' }
  }

  // Guard: only allow reset for users who already have a password (prevents bypassing setup flow)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, totpEnabled: true },
  })

  if (!existingUser?.passwordHash) {
    return { success: false, error: 'Account not configured. Please use the setup link instead.', code: 'UNAUTHORIZED' }
  }

  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { success: false, error: firstError, code: 'VALIDATION_ERROR' }
  }

  const { password } = parsed.data

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
  } catch {
    // HIBP unavailable — proceed
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
    return { success: false, error: 'Failed to reset password. Please try again.', code: 'SERVER_ERROR' }
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

  if (!existingUser.totpEnabled) {
    cookieStore.set('totp_verified', encodeTotpVerifiedCookie(userId), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      domain: process.env.COOKIE_DOMAIN,
    })
  }

  cookieStore.delete(SETUP_COOKIE_NAME)

  redirect('/')
}
