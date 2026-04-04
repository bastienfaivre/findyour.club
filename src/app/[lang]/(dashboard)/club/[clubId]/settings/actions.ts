'use server'

import { createHash, randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import { buildInvitationEmailHtml } from '@/lib/email-templates'
import { deleteObject, extractR2Key } from '@/lib/r2'
import { z } from 'zod'
import { getNumberSetting } from '@/lib/server/platform-settings'
import { checkRateLimit } from '@/lib/rate-limit'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import type { Translations } from '@/lib/i18n/translations'

const inviteSchema = z.object({ email: z.string().email() })

function getT(lang?: string): Translations {
  return getTranslations(resolveUILang(lang ?? 'en'))
}

export type InviteEditorResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'ALREADY_MEMBER' | 'SERVER_ERROR' }

export async function inviteEditor(
  clubId: string,
  _prevState: InviteEditorResult | null,
  formData: FormData,
  lang?: string,
): Promise<InviteEditorResult> {
  const t = getT(lang)
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  })
  if (!club) return { success: false, error: t.errors.clubNotFound, code: 'UNAUTHORIZED' }

  // Verify caller is OWNER of this club
  const callerOwnership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerOwnership) {
    return { success: false, error: 'Only club owners can invite editors.', code: 'FORBIDDEN' }
  }

  // Rate limit invitations
  const maxInvites = await getNumberSetting('rate.invitations_per_hour')
  if (checkRateLimit(`invite:${session.user.id}:${club.id}`, { windowMs: 3_600_000, maxAttempts: maxInvites })) {
    return { success: false, error: 'Too many invitations. Please wait before sending another.', code: 'VALIDATION_ERROR' }
  }

  // Enforce max editors limit
  const maxEditors = await getNumberSetting('limit.max_editors_per_club')
  const editorCount = await prisma.clubMembership.count({
    where: { clubId: club.id, role: 'EDITOR', status: { in: ['ACTIVE', 'PENDING'] } },
  })
  if (editorCount >= maxEditors) {
    return { success: false, error: `Maximum of ${maxEditors} editor(s) reached.`, code: 'VALIDATION_ERROR' }
  }

  // Validate email
  const parsed = inviteSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { success: false, error: 'Invalid email address.', code: 'VALIDATION_ERROR' }
  }
  const { email } = parsed.data

  // Check existing membership
  const existingMember = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      preferredLanguage: true,
      memberships: {
        where: { clubId: club.id, status: { in: ['ACTIVE', 'PENDING'] } },
        select: { id: true, status: true },
      },
    },
  })
  if (existingMember) {
    const isActive = existingMember.memberships.some(m => m.status === 'ACTIVE')
    if (isActive) {
      return { success: false, error: 'This person is already a member.', code: 'ALREADY_MEMBER' }
    }
    const isPending = existingMember.memberships.some(m => m.status === 'PENDING')
    if (isPending) {
      const validInvitation = await prisma.invitation.findFirst({
        where: { email, clubId: club.id, expiresAt: { gt: new Date() } },
        select: { id: true },
      })
      if (validInvitation) {
        return { success: false, error: 'This person already has a pending invite.', code: 'ALREADY_MEMBER' }
      }
      // Invitation expired → clean up stale PENDING membership and any expired invitation records
      await prisma.$transaction([
        prisma.clubMembership.deleteMany({ where: { userId: existingMember.id, clubId: club.id, status: 'PENDING' } }),
        prisma.invitation.deleteMany({ where: { email, clubId: club.id } }),
      ])
    }
  }

  // Find or create user
  const user = existingMember ?? await prisma.user.create({
    data: { email, role: 'CLUB_ADMIN' },
    select: { id: true },
  })

  // Generate invite token (raw stored nowhere — only hash stored)
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Atomically create PENDING membership and invitation record
  await prisma.$transaction([
    prisma.clubMembership.create({
      data: {
        userId: user.id,
        clubId: club.id,
        role: 'EDITOR',
        status: 'PENDING',
        invitedBy: session.user.id,
      },
    }),
    prisma.invitation.create({
      data: { email, clubId: club.id, tokenHash, expiresAt },
    }),
  ])

  // Compose accept URL
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const acceptUrl = `${baseUrl}/auth/invite/accept?token=${rawToken}`

  try {
    // Use the recipient's preferred language if they exist, otherwise use the sender's
    let recipientLangRaw: string | null | undefined = existingMember?.preferredLanguage
    if (!recipientLangRaw) {
      const sender = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferredLanguage: true },
      })
      recipientLangRaw = sender?.preferredLanguage
    }
    const emailLang = resolveUILang(recipientLangRaw ?? 'en')
    const emailT = getTranslations(emailLang).emails.invitation

    await sendEmail({
      to: email,
      subject: emailT.subject.replace('{clubName}', club.name),
      html: buildInvitationEmailHtml({ clubName: club.name, acceptUrl, lang: emailLang }),
    })
  } catch {
    // Rollback: delete both records so the owner can retry
    await prisma.$transaction([
      prisma.invitation.deleteMany({ where: { tokenHash } }),
      prisma.clubMembership.deleteMany({
        where: { userId: user.id, clubId: club.id, status: 'PENDING' },
      }),
    ])
    return { success: false, error: t.errors.emailFailed, code: 'SERVER_ERROR' }
  }

  return { success: true }
}

export type CancelInviteResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' }

export async function cancelInvite(
  clubId: string,
  membershipId: string,
  lang?: string,
): Promise<CancelInviteResult> {
  const t = getT(lang)
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) return { success: false, error: t.errors.clubNotFound, code: 'UNAUTHORIZED' }

  const callerOwnership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerOwnership) {
    return { success: false, error: 'Only club owners can cancel invitations.', code: 'FORBIDDEN' }
  }

  const membership = await prisma.clubMembership.findUnique({
    where: { id: membershipId },
    select: { id: true, userId: true, clubId: true, status: true, user: { select: { email: true } } },
  })
  if (!membership || membership.clubId !== club.id || membership.status !== 'PENDING') {
    return { success: false, error: 'Pending invitation not found.', code: 'NOT_FOUND' }
  }

  try {
    await prisma.$transaction([
      prisma.invitation.deleteMany({ where: { email: membership.user.email!, clubId: club.id } }),
      prisma.clubMembership.delete({ where: { id: membership.id } }),
    ])
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  return { success: true }
}

export type DeleteClubResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' }

export async function ownerDeleteClub(clubId: string, lang?: string): Promise<DeleteClubResult> {
  const t = getT(lang)
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
    }

    // Verify caller is an ACTIVE OWNER of this club
    const membership = await prisma.clubMembership.findFirst({
      where: { userId: session.user.id, clubId, status: 'ACTIVE', role: 'OWNER' },
      select: { id: true },
    })
    if (!membership) {
      return { success: false, error: 'Only club owners can delete a club.', code: 'FORBIDDEN' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        slug: true,
        country: true,
        logoUrl: true,
        photos: { select: { url: true } },
      },
    })
    if (!club) {
      return { success: false, error: t.errors.clubNotFound, code: 'NOT_FOUND' }
    }

    // Best-effort R2 cleanup (before transaction)
    const r2Keys: string[] = []
    if (club.logoUrl) r2Keys.push(extractR2Key(club.logoUrl))
    for (const photo of club.photos) r2Keys.push(extractR2Key(photo.url))
    await Promise.allSettled(r2Keys.map((key) => deleteObject(key)))

    // Delete club in a transaction (cascade handles photos, messages, memberships, etc.)
    await prisma.$transaction(async (tx) => {
      await tx.invitation.deleteMany({ where: { clubId: club.id } })
      await tx.club.delete({ where: { id: club.id } })
    })

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath('/[lang]/search', 'page')

    return { success: true }
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }
}

export type TransferOwnershipResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'PENDING_MEMBER' | 'SERVER_ERROR' }

export async function transferOwnership(
  clubId: string,
  targetMembershipId: string,
  lang?: string,
): Promise<TransferOwnershipResult> {
  const t = getT(lang)
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) return { success: false, error: t.errors.clubNotFound, code: 'UNAUTHORIZED' }

  // Verify caller is an ACTIVE OWNER
  const callerMembership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerMembership) {
    return { success: false, error: 'Only club owners can transfer ownership.', code: 'FORBIDDEN' }
  }

  // Load target membership
  const targetMembership = await prisma.clubMembership.findUnique({
    where: { id: targetMembershipId },
    select: { id: true, userId: true, clubId: true, role: true, status: true },
  })
  if (!targetMembership) {
    return { success: false, error: 'Target membership not found.', code: 'NOT_FOUND' }
  }

  if (targetMembership.clubId !== club.id) {
    return { success: false, error: 'Target membership does not belong to this club.', code: 'FORBIDDEN' }
  }

  if (targetMembership.userId === session.user.id) {
    return { success: false, error: 'Cannot transfer ownership to yourself.', code: 'FORBIDDEN' }
  }

  if (targetMembership.role !== 'EDITOR') {
    return { success: false, error: 'Can only transfer ownership to an active Editor.', code: 'FORBIDDEN' }
  }

  if (targetMembership.status === 'PENDING') {
    return {
      success: false,
      error: 'Cannot transfer ownership to a member who has not yet accepted their invitation.',
      code: 'PENDING_MEMBER',
    }
  }

  // Atomic role swap
  try {
    await prisma.$transaction([
      prisma.clubMembership.update({
        where: { id: targetMembership.id },
        data: { role: 'OWNER' },
      }),
      prisma.clubMembership.update({
        where: { id: callerMembership.id },
        data: { role: 'EDITOR' },
      }),
    ])
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  return { success: true }
}

export type RevokeAccessResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'LAST_OWNER' | 'SERVER_ERROR' }

export async function revokeAccess(
  clubId: string,
  targetMembershipId: string,
  lang?: string,
): Promise<RevokeAccessResult> {
  const t = getT(lang)
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) return { success: false, error: t.errors.clubNotFound, code: 'UNAUTHORIZED' }

  const callerIsOwner = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerIsOwner) {
    return { success: false, error: 'Only club owners can revoke access.', code: 'FORBIDDEN' }
  }

  const targetMembership = await prisma.clubMembership.findUnique({
    where: { id: targetMembershipId },
    select: { id: true, userId: true, clubId: true, role: true, status: true },
  })
  if (!targetMembership) {
    return { success: false, error: 'Membership not found.', code: 'NOT_FOUND' }
  }

  if (targetMembership.clubId !== club.id) {
    return { success: false, error: 'Membership does not belong to this club.', code: 'FORBIDDEN' }
  }

  if (targetMembership.userId === session.user.id) {
    return { success: false, error: 'Cannot revoke your own membership.', code: 'FORBIDDEN' }
  }

  if (targetMembership.status !== 'ACTIVE') {
    return { success: false, error: 'Can only revoke active memberships.', code: 'FORBIDDEN' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (targetMembership.role === 'OWNER') {
        const activeOwnerCount = await tx.clubMembership.count({
          where: { clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
        })
        if (activeOwnerCount <= 1) {
          throw Object.assign(new Error('A club must always have at least one active Owner.'), {
            code: 'LAST_OWNER',
          })
        }
      }
      await tx.clubMembership.delete({ where: { id: targetMembership.id } })
    })
  } catch (e) {
    if (e instanceof Error && (e as Error & { code?: string }).code === 'LAST_OWNER') {
      return { success: false, error: e.message, code: 'LAST_OWNER' }
    }
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  return { success: true }
}
