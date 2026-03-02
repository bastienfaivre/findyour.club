'use server'
import { createHash } from 'crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { changePasswordSchema } from '@/lib/schemas/user'

export type ChangePasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'WRONG_PASSWORD' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function changePassword(input: unknown): Promise<ChangePasswordResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.', code: 'VALIDATION_ERROR' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user?.passwordHash) {
    return { success: false, error: 'Account not set up.', code: 'UNAUTHORIZED' }
  }

  const currentValid = await argon2.verify(user.passwordHash, parsed.data.currentPassword)
  if (!currentValid) {
    return { success: false, error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' }
  }

  // HaveIBeenPwned check (k-anonymity — same pattern as setupPassword)
  const sha1 = createHash('sha1').update(parsed.data.password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    if (res.ok) {
      const text = await res.text()
      const isPwned = text.split('\r\n').some(l => l.split(':')[0] === suffix) ||
        text.split('\n').some(l => l.split(':')[0] === suffix)
      if (isPwned) {
        return { success: false, error: 'This password has appeared in a data breach. Please choose a different one.', code: 'PASSWORD_BREACHED' }
      }
    }
  } catch {
    // HIBP unavailable — proceed
  }

  const newHash = await argon2.hash(parsed.data.password)
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } })

  return { success: true }
}

export type RemoveTotpResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'SERVER_ERROR' }
  | { success: true }

export async function removeTotp(): Promise<RemoveTotpResult> {
  const session = await getAuthSession()
  if (!session?.user?.id || !session.user.totpVerified) {
    return { success: false, error: 'Not authenticated or TOTP not verified for this session.', code: 'UNAUTHORIZED' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: null, totpEnabled: false, pendingTotpSecret: null },
  })

  // Clear totp_verified cookie — no longer needed once TOTP is disabled
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieStore = await cookies()
  cookieStore.set('totp_verified', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    domain: process.env.COOKIE_DOMAIN,
  })

  return { success: true }
}
