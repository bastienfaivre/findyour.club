'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import { buildOperatorMessageEmailHtml, buildForceOfflineEmailHtml } from '@/lib/email-templates'

export type ModerationActionResult =
  | { success: true }
  | { success: false; error: string; code: string }

export async function sendOperatorMessage(clubId: string, message: string): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmed = message.trim()
    if (!trimmed) {
      return { success: false, error: 'Message is required.', code: 'VALIDATION' }
    }
    if (trimmed.length > 1000) {
      return { success: false, error: 'Message must be 1000 characters or less.', code: 'VALIDATION' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, email: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    await prisma.operatorMessage.create({
      data: { clubId: club.id, message: trimmed },
    })

    try {
      const html = buildOperatorMessageEmailHtml({
        clubName: club.name,
        message: trimmed,
      })
      await sendEmail({
        to: club.email,
        subject: `Message from the platform about ${club.name}`,
        html,
      })
    } catch {
      // DB record is the source of truth — email failure is non-blocking (ADR-004)
    }

    revalidatePath(`/[lang]/admin/clubs/${club.id}`, 'page')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function toggleForceOffline(clubId: string, reason: string): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmed = reason.trim()
    if (!trimmed) {
      return { success: false, error: 'A reason is required.', code: 'VALIDATION' }
    }
    if (trimmed.length > 1000) {
      return { success: false, error: 'Reason must be 1000 characters or less.', code: 'VALIDATION' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, email: true, slug: true, country: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    await prisma.$transaction([
      prisma.club.update({
        where: { id: club.id },
        data: { forceOffline: true },
      }),
      prisma.operatorMessage.create({
        data: { clubId: club.id, message: trimmed },
      }),
    ])

    try {
      const html = buildForceOfflineEmailHtml({
        clubName: club.name,
        reason: trimmed,
      })
      await sendEmail({
        to: club.email,
        subject: `Your club page has been taken offline — ${club.name}`,
        html,
      })
    } catch {
      // DB record is the source of truth — email failure is non-blocking (ADR-004)
    }

    revalidatePath(`/[lang]/${club.country}/${club.slug}`, 'page')
    revalidatePath(`/[lang]/${club.country}`, 'page')
    revalidatePath(`/[lang]`, 'page')
    revalidatePath(`/[lang]/admin/clubs/${club.id}`, 'page')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function liftForceOffline(clubId: string): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, slug: true, country: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { forceOffline: false },
    })

    revalidatePath(`/[lang]/${club.country}/${club.slug}`, 'page')
    revalidatePath(`/[lang]/${club.country}`, 'page')
    revalidatePath(`/[lang]`, 'page')
    revalidatePath(`/[lang]/admin/clubs/${club.id}`, 'page')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
