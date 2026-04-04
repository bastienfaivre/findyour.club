'use server'
import argon2 from 'argon2'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { changePasswordSchema } from '@/lib/schemas/user'
import { profileSchema } from '@/lib/schemas/profile'
import { isPasswordBreached } from '@/lib/password-validation'
import { clearTotpVerifiedCookie, clearAllAuthCookies } from '@/lib/server/cookie-utils'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

// ─── Profile ──────────────────────────────────────────────────────────────────

export type UpdateProfileResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' }
  | { success: true }

export async function updateProfile(input: unknown, lang?: string): Promise<UpdateProfileResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? t.errors.validationError, code: 'VALIDATION_ERROR' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      preferredLanguage: parsed.data.preferredLanguage,
    },
  })

  return { success: true }
}

export type ChangePasswordResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'WRONG_PASSWORD' | 'PASSWORD_BREACHED' | 'SERVER_ERROR' }
  | { success: true }

export async function changePassword(input: unknown, lang?: string): Promise<ChangePasswordResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? t.errors.validationError, code: 'VALIDATION_ERROR' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })
  if (!user?.passwordHash) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const currentValid = await argon2.verify(user.passwordHash, parsed.data.currentPassword)
  if (!currentValid) {
    return { success: false, error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' }
  }

  // HaveIBeenPwned check (k-anonymity — same pattern as setupPassword)
  if (await isPasswordBreached(parsed.data.password)) {
    return { success: false, error: 'This password has appeared in a data breach. Please choose a different one.', code: 'PASSWORD_BREACHED' }
  }

  const newHash = await argon2.hash(parsed.data.password)
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } })

  return { success: true }
}

export type RemoveTotpResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'SERVER_ERROR' }
  | { success: true }

export async function removeTotp(lang?: string): Promise<RemoveTotpResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const session = await getAuthSession()
  if (!session?.user?.id || !session.user.totpVerified) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: null, totpEnabled: false, pendingTotpSecret: null },
  })

  // Clear totp_verified cookie — no longer needed once TOTP is disabled
  await clearTotpVerifiedCookie()

  return { success: true }
}

// ─── Account Deletion ──────────────────────────────────────────────────────

export type AccountDeletionInfo = {
  /** Clubs where the user is the sole OWNER — these will be deleted */
  soleOwnerClubs: { id: string; name: string }[]
  /** Clubs where the user is an EDITOR or co-OWNER — only membership removed */
  otherClubs: { id: string; name: string }[]
}

export async function getAccountDeletionInfo(): Promise<AccountDeletionInfo | null> {
  const session = await getAuthSession()
  if (!session?.user?.id) return null

  const memberships = await prisma.clubMembership.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    select: {
      role: true,
      club: { select: { id: true, name: true } },
    },
  })

  const ownedClubs = memberships.filter((m) => m.role === 'OWNER')
  const otherClubs = memberships.filter((m) => m.role !== 'OWNER').map((m) => m.club)

  // Batch: count other owners for all owned clubs in parallel
  const ownerCounts = await Promise.all(
    ownedClubs.map((m) =>
      prisma.clubMembership.count({
        where: { clubId: m.club.id, role: 'OWNER', status: 'ACTIVE', userId: { not: session.user.id } },
      }),
    ),
  )

  const soleOwnerClubs: { id: string; name: string }[] = []
  ownedClubs.forEach((m, i) => {
    if (ownerCounts[i] === 0) {
      soleOwnerClubs.push(m.club)
    } else {
      otherClubs.push(m.club)
    }
  })

  return { soleOwnerClubs, otherClubs }
}

export type DeleteAccountResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteAccount(lang?: string): Promise<DeleteAccountResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated }
  }

  const userId = session.user.id

  // Block deletion if the user is the sole owner of any club
  const ownedMemberships = await prisma.clubMembership.findMany({
    where: { userId, role: 'OWNER', status: 'ACTIVE' },
    select: { clubId: true },
  })

  if (ownedMemberships.length > 0) {
    const ownerCounts = await Promise.all(
      ownedMemberships.map(({ clubId }) =>
        prisma.clubMembership.count({
          where: { clubId, role: 'OWNER', status: 'ACTIVE', userId: { not: userId } },
        }),
      ),
    )
    const hasSoleOwnerClub = ownedMemberships.some((_, i) => ownerCounts[i] === 0)
    if (hasSoleOwnerClub) {
      return { success: false, error: 'Please delete or transfer ownership of your clubs before deleting your account.' }
    }
  }

  // Delete the user (cascade handles: accounts, sessions, passkeys, memberships, read cursors)
  // SupportMessage.senderId → SET NULL (preserves messages, anonymizes sender)
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } })
    })
  } catch {
    return { success: false, error: t.errors.serverError }
  }

  // 3. Clear session cookies
  await clearAllAuthCookies()

  return { success: true }
}
