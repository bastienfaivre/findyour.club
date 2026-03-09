'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import { buildOperatorMessageEmailHtml, buildForceOfflineEmailHtml } from '@/lib/email-templates'
import { slugRegex } from '@/lib/schemas/application'
import { isReservedSlug } from '@/lib/slug'
import { upsertSwissLocation } from '@/lib/server/location'
import { deleteObject, extractR2Key, generateUploadUrl, getPublicUrl, ALLOWED_IMAGE_TYPES } from '@/lib/r2'
import type { ClubEditableFields } from '@/lib/schemas/club'

export type { ClubEditableFields } from '@/lib/schemas/club'

export type ModerationActionResult =
  | { success: true }
  | { success: false; error: string; code: string }

export async function sendSupportMessage(clubId: string, body: string): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmed = body.trim()
    if (!trimmed) {
      return { success: false, error: 'Message is required.', code: 'VALIDATION' }
    }
    if (trimmed.length > 2000) {
      return { success: false, error: 'Message must be 2000 characters or less.', code: 'VALIDATION' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true, email: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    await prisma.supportMessage.create({
      data: { clubId: club.id, senderId: session.user.id, senderRole: 'OPERATOR', body: trimmed },
    })

    // Also update operator's own read cursor so their message doesn't appear as unread to them
    await prisma.conversationReadCursor.upsert({
      where: { clubId_userId: { clubId: club.id, userId: session.user.id } },
      update: { lastReadAt: new Date() },
      create: { clubId: club.id, userId: session.user.id, lastReadAt: new Date() },
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

    revalidatePath('/[lang]/admin', 'layout')
    revalidatePath('/[lang]/(dashboard)', 'layout')

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
      select: { id: true, name: true, email: true, slug: true, country: true, forceOffline: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    if (club.forceOffline) {
      return { success: false, error: 'Club is already offline.', code: 'ALREADY_OFFLINE' }
    }

    await prisma.$transaction([
      prisma.club.update({
        where: { id: club.id },
        data: { forceOffline: true },
      }),
      prisma.supportMessage.create({
        data: { clubId: club.id, senderId: session.user.id, senderRole: 'OPERATOR', body: trimmed },
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

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath(`/[lang]/[country]`, 'page')
    revalidatePath(`/[lang]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

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

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath(`/[lang]/[country]`, 'page')
    revalidatePath(`/[lang]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function updateClubFields(
  clubId: string,
  fields: ClubEditableFields,
): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmedSlug = fields.slug.trim()
    if (!trimmedSlug) {
      return { success: false, error: 'A URL slug is required.', code: 'SLUG_REQUIRED' }
    }
    if (trimmedSlug.length > 60) {
      return { success: false, error: 'Slug must be 60 characters or less.', code: 'SLUG_INVALID' }
    }
    if (!slugRegex.test(trimmedSlug)) {
      return { success: false, error: 'Only lowercase letters, numbers, and hyphens allowed.', code: 'SLUG_INVALID' }
    }
    if (isReservedSlug(trimmedSlug)) {
      return { success: false, error: 'This slug is reserved and cannot be used.', code: 'SLUG_CONFLICT' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, slug: true, country: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    // Check slug uniqueness if changed
    if (trimmedSlug !== club.slug || fields.country !== club.country) {
      const conflict = await prisma.club.findFirst({
        where: { slug: trimmedSlug, country: fields.country, id: { not: clubId } },
        select: { id: true },
      })
      if (conflict) {
        return { success: false, error: 'This slug is already taken.', code: 'SLUG_CONFLICT' }
      }
    }

    // Resolve location
    let resolvedLocationId: string | null = null
    if (fields.location) {
      const { locationId } = await upsertSwissLocation({
        swisstopoId: fields.location.swisstopoId,
        plz: fields.location.plz,
        cantonCode: fields.location.cantonCode,
        displayName: fields.location.name,
      })
      resolvedLocationId = locationId
    }

    await prisma.club.update({
      where: { id: clubId },
      data: {
        name: fields.name.trim(),
        email: fields.email.trim(),
        country: fields.country,
        slug: trimmedSlug,
        description: fields.description.trim() || null,
        schedule: fields.schedule?.trim() || null,
        howToJoin: fields.howToJoin?.trim() || null,
        contactPhone: fields.contactPhone?.trim() || null,
        contactAddress: fields.contactAddress?.trim() || null,
        externalWebsiteUrl: fields.externalWebsiteUrl?.trim() || null,
        activityType: fields.activityType,
        locationId: resolvedLocationId,
      },
    })

    revalidatePath(`/[lang]/${fields.country}/[club]`, 'page')
    revalidatePath(`/[lang]/[country]`, 'page')
    revalidatePath(`/[lang]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorDeleteClubLogo(
  clubId: string,
): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, slug: true, country: true, logoUrl: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    if (club.logoUrl) {
      try { await deleteObject(extractR2Key(club.logoUrl)) } catch { /* best-effort R2 cleanup */ }
    }

    await prisma.club.update({
      where: { id: clubId },
      data: { logoUrl: null, logoAlt: null },
    })

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorUploadClubLogo(
  clubId: string,
  contentType: string,
): Promise<
  | { success: true; data: { uploadUrl: string; key: string; publicUrl: string } }
  | { success: false; error: string; code: string }
> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
      return { success: false, error: 'Invalid file type.', code: 'INVALID_TYPE' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1]
    const { uploadUrl, key } = await generateUploadUrl(club.id, ext)
    const publicUrl = getPublicUrl(key)

    return { success: true, data: { uploadUrl, key, publicUrl } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorPersistClubLogo(
  clubId: string,
  key: string,
  alt: string,
): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, slug: true, country: true, logoUrl: true },
    })
    if (!club) {
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
    }

    if (!key.startsWith(`${club.id}/`)) {
      return { success: false, error: 'Invalid file key.', code: 'INVALID_KEY' }
    }

    if (club.logoUrl) {
      try { await deleteObject(extractR2Key(club.logoUrl)) } catch { /* best-effort R2 cleanup */ }
    }

    await prisma.club.update({
      where: { id: clubId },
      data: { logoUrl: getPublicUrl(key), logoAlt: alt.slice(0, 500) },
    })

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorUpdateClubLogoAlt(
  clubId: string,
  alt: string,
): Promise<ModerationActionResult> {
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
      where: { id: clubId },
      data: { logoAlt: alt.slice(0, 500) },
    })

    revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorDeleteClubPhoto(
  clubId: string,
  photoId: string,
): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const photo = await prisma.clubPhoto.findFirst({
      where: { id: photoId, clubId },
    })
    if (!photo) {
      return { success: false, error: 'Photo not found.', code: 'NOT_FOUND' }
    }

    try { await deleteObject(extractR2Key(photo.url)) } catch { /* best-effort R2 cleanup */ }
    await prisma.clubPhoto.delete({ where: { id: photoId, clubId } })

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { slug: true, country: true },
    })
    if (club) {
      revalidatePath(`/[lang]/${club.country}/[club]`, 'page')
    }
    revalidatePath('/[lang]/admin', 'layout')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function operatorDeleteClub(clubId: string): Promise<ModerationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
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
      return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
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
    revalidatePath('/[lang]/admin', 'layout')
    revalidatePath('/[lang]/search', 'page')

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
