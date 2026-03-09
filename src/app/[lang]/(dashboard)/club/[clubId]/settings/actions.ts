'use server'

import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const inviteSchema = z.object({ email: z.string().email() })

export type InviteEditorResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'ALREADY_MEMBER' | 'SERVER_ERROR' }

export async function inviteEditor(
  clubId: string,
  _prevState: InviteEditorResult | null,
  formData: FormData,
): Promise<InviteEditorResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true },
  })
  if (!club) return { success: false, error: 'Club not found.', code: 'UNAUTHORIZED' }

  // Verify caller is OWNER of this club
  const callerOwnership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!callerOwnership) {
    return { success: false, error: 'Only club owners can invite editors.', code: 'FORBIDDEN' }
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
    await sendEmail({
      to: email,
      subject: `You've been invited to co-manage ${club.name}`,
      html: `
        <p>You have been invited to co-manage <strong>${club.name}</strong> as an Editor.</p>
        <p><a href="${acceptUrl}">Accept invitation</a></p>
        <p>This link expires in 7 days. If you did not expect this, you can safely ignore this email.</p>
      `,
    })
  } catch {
    // Rollback: delete both records so the owner can retry
    await prisma.$transaction([
      prisma.invitation.deleteMany({ where: { tokenHash } }),
      prisma.clubMembership.deleteMany({
        where: { userId: user.id, clubId: club.id, status: 'PENDING' },
      }),
    ])
    return { success: false, error: 'Failed to send the invitation email. Please try again.', code: 'SERVER_ERROR' }
  }

  return { success: true }
}

export type TransferOwnershipResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'PENDING_MEMBER' | 'SERVER_ERROR' }

export async function transferOwnership(
  clubId: string,
  targetMembershipId: string,
): Promise<TransferOwnershipResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) return { success: false, error: 'Club not found.', code: 'UNAUTHORIZED' }

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
    return { success: false, error: 'Failed to transfer ownership. Please try again.', code: 'SERVER_ERROR' }
  }

  return { success: true }
}

export type RevokeAccessResult =
  | { success: true }
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'LAST_OWNER' | 'SERVER_ERROR' }

export async function revokeAccess(
  clubId: string,
  targetMembershipId: string,
): Promise<RevokeAccessResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  })
  if (!club) return { success: false, error: 'Club not found.', code: 'UNAUTHORIZED' }

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
    return { success: false, error: 'Failed to revoke access. Please try again.', code: 'SERVER_ERROR' }
  }

  return { success: true }
}
