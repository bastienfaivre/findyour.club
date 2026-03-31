'use server'

import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getClubActiveMembership } from '@/lib/server/club-queries'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'
import { generateUploadUrl, deleteObject, extractR2Key, getPublicUrl, ALLOWED_IMAGE_TYPES, getObjectBuffer, putObject } from '@/lib/r2'
import { sanitizeSvg } from '@/lib/svg-sanitize'
import { getNumberSetting } from '@/lib/server/platform-settings'
import { checkRateLimit } from '@/lib/rate-limit'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// ── Auth guard helper ──

type AuthGuardError = { ok: false; result: { success: false; error: string; code: string } }
type AuthGuardSuccess = { ok: true; club: { id: string; name: string; slug: string; country: string }; membership: { id: string; role: string } }

async function authGuard(clubId: string, requiredRole?: 'OWNER'): Promise<AuthGuardError | AuthGuardSuccess> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { ok: false, result: { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' } }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true, slug: true, country: true },
  })
  if (!club) {
    return { ok: false, result: { success: false, error: 'Club not found.', code: 'NOT_FOUND' } }
  }

  const membership = await getClubActiveMembership(session.user.id, club.id)
  if (!membership) {
    return { ok: false, result: { success: false, error: 'Not a member of this club.', code: 'FORBIDDEN' } }
  }

  if (requiredRole && membership.role !== requiredRole) {
    return { ok: false, result: { success: false, error: 'Insufficient permissions.', code: 'FORBIDDEN' } }
  }

  return { ok: true, club, membership }
}

function revalidateClubPaths(_club: { slug: string; country: string }) {
  // Revalidate all language variants of the public club page
  revalidatePath('/[lang]/[country]/[club]', 'page')
  // Revalidate admin pages
  revalidatePath('/[lang]/admin', 'layout')
}

// ── Confirm Club Data (verification reset) ──

export type ConfirmClubDataResult = ActionResult<{ verifiedAt: string }>

export async function confirmClubData(clubId: string): Promise<ConfirmClubDataResult> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  if (checkRateLimit(`verify:${guard.club.id}`, { windowMs: 3_600_000, maxAttempts: 10 })) {
    return { success: false, error: 'Too many confirmation attempts. Please wait.', code: 'RATE_LIMITED' }
  }

  const now = new Date()
  await prisma.club.update({
    where: { id: guard.club.id },
    data: { lastVerifiedAt: now },
  })

  revalidateClubPaths(guard.club)
  // Also revalidate the dashboard layout (for banner refresh)
  revalidatePath('/[lang]/(dashboard)', 'layout')

  return { success: true, data: { verifiedAt: now.toISOString() } }
}

// ── Toggle Publish ──

export type TogglePublishResult = ActionResult<{ isPublished: boolean }>

export async function togglePublish(clubId: string): Promise<TogglePublishResult> {
  const guard = await authGuard(clubId, 'OWNER')
  if (!guard.ok) return guard.result

  const result = await prisma.$transaction(async (tx) => {
    const club = await tx.club.findUnique({
      where: { id: guard.club.id },
      select: { isPublished: true, forceOffline: true },
    })
    if (!club) return { success: false as const, error: 'Club not found.', code: 'NOT_FOUND' }

    if (club.forceOffline) {
      return { success: false as const, error: 'Your page has been taken offline by the platform.', code: 'FORCE_OFFLINE' }
    }

    const newState = !club.isPublished

    await tx.club.update({
      where: { id: guard.club.id },
      data: { isPublished: newState },
    })

    return { success: true as const, data: { isPublished: newState } }
  })

  if (result.success) {
    revalidateClubPaths(guard.club)
  }

  return result
}

// ── Send Support Message (club admin → platform) ──

export async function sendClubMessage(
  clubId: string,
  body: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const maxMessages = await getNumberSetting('rate.support_messages_per_hour')
  if (checkRateLimit(`support-msg:${session.user.id}:${clubId}`, { windowMs: 3_600_000, maxAttempts: maxMessages })) {
    return { success: false, error: 'Too many messages. Please wait before sending another.', code: 'RATE_LIMITED' }
  }

  const trimmed = body.trim()
  if (!trimmed) {
    return { success: false, error: 'Message is required.', code: 'VALIDATION_ERROR' }
  }
  if (trimmed.length > 2000) {
    return { success: false, error: 'Message must be 2000 characters or less.', code: 'VALIDATION_ERROR' }
  }

  await prisma.supportMessage.create({
    data: {
      clubId: guard.club.id,
      senderId: session.user.id,
      senderRole: 'CLUB_ADMIN',
      body: trimmed,
    },
  })

  // Update sender's own read cursor
  await prisma.conversationReadCursor.upsert({
    where: { clubId_userId: { clubId: guard.club.id, userId: session.user.id } },
    update: { lastReadAt: new Date() },
    create: { clubId: guard.club.id, userId: session.user.id, lastReadAt: new Date() },
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}

// ── Mark Conversation as Read ──

export async function markConversationRead(
  clubId: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  await prisma.conversationReadCursor.upsert({
    where: { clubId_userId: { clubId: guard.club.id, userId: session.user.id } },
    update: { lastReadAt: new Date() },
    create: { clubId: guard.club.id, userId: session.user.id, lastReadAt: new Date() },
  })

  return { success: true, data: undefined }
}

// ── Save Club Profile (text fields) ──

export type SaveClubProfileResult = ActionResult<{ savedAt: string }>

export async function saveClubProfile(
  clubId: string,
  input: ClubProfileSaveInput,
): Promise<SaveClubProfileResult> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const parsed = clubProfileSaveSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.', code: 'VALIDATION_ERROR' }
  }

  // Dynamic field length limits from platform settings
  const [maxDescription, maxSchedule, maxHowToJoin] = await Promise.all([
    getNumberSetting('limit.max_description_length'),
    getNumberSetting('limit.max_schedule_length'),
    getNumberSetting('limit.max_how_to_join_length'),
  ])

  if (parsed.data.description && parsed.data.description.length > maxDescription) {
    return { success: false, error: `Description must be ${maxDescription} characters or less.`, code: 'VALIDATION_ERROR' }
  }
  if (parsed.data.schedule && parsed.data.schedule.length > maxSchedule) {
    return { success: false, error: `Schedule must be ${maxSchedule} characters or less.`, code: 'VALIDATION_ERROR' }
  }
  if (parsed.data.howToJoin && parsed.data.howToJoin.length > maxHowToJoin) {
    return { success: false, error: `How to join must be ${maxHowToJoin} characters or less.`, code: 'VALIDATION_ERROR' }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      description: parsed.data.description || null,
      schedule: parsed.data.schedule || null,
      howToJoin: parsed.data.howToJoin || null,
      contactPhone: parsed.data.contactPhone || null,
      contactAddress: parsed.data.contactAddress || null,
      externalWebsiteUrl: parsed.data.externalWebsiteUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      facebookUrl: parsed.data.facebookUrl || null,
      xUrl: parsed.data.xUrl || null,
      tiktokUrl: parsed.data.tiktokUrl || null,
      discordUrl: parsed.data.discordUrl || null,
      youtubeUrl: parsed.data.youtubeUrl || null,
      whatsappUrl: parsed.data.whatsappUrl || null,
      telegramUrl: parsed.data.telegramUrl || null,
      githubUrl: parsed.data.githubUrl || null,
      lastVerifiedAt: new Date(),
    },
  })

  const savedAt = new Date().toISOString()
  revalidateClubPaths(guard.club)

  return { success: true, data: { savedAt } }
}

// ── Presigned Upload URL ──

export type PresignedUrlResult = ActionResult<{ uploadUrl: string; key: string; publicUrl: string }>

export async function getPresignedUploadUrl(
  clubId: string,
  contentType: string,
): Promise<PresignedUrlResult> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', code: 'INVALID_TYPE' }
  }

  const maxPhotos = await getNumberSetting('limit.max_photos_per_club')
  const photoCount = await prisma.clubPhoto.count({ where: { clubId: guard.club.id } })
  if (photoCount >= maxPhotos) {
    return { success: false, error: `Maximum ${maxPhotos} photos reached.`, code: 'MAX_PHOTOS' }
  }

  const maxImageTransactions = await getNumberSetting('limit.image_transactions_per_day')
  if (checkRateLimit(`r2:${guard.club.id}`, { windowMs: 86_400_000, maxAttempts: maxImageTransactions })) {
    return { success: false, error: 'Daily image transaction limit reached. Please try again tomorrow.', code: 'IMAGE_RATE_LIMITED' }
  }

  const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1]
  const { uploadUrl, key } = await generateUploadUrl(guard.club.id, ext)
  const publicUrl = getPublicUrl(key)

  return { success: true, data: { uploadUrl, key, publicUrl } }
}

// ── Create Club Photo (after client upload) ──

export type CreatePhotoResult = ActionResult<{ id: string; url: string; position: number }>

export async function createClubPhoto(
  clubId: string,
  key: string,
  alt: string,
): Promise<CreatePhotoResult> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  // Validate key belongs to this club
  if (!key.startsWith(`${guard.club.id}/`)) {
    return { success: false, error: 'Invalid file key.', code: 'INVALID_KEY' }
  }

  // Validate alt text length
  const trimmedAlt = alt.slice(0, 500)

  // Use transaction to prevent race condition in position assignment AND enforce photo limit
  const maxPhotos = await getNumberSetting('limit.max_photos_per_club')
  const photo = await prisma.$transaction(async (tx) => {
    const photoCount = await tx.clubPhoto.count({ where: { clubId: guard.club.id } })
    if (photoCount >= maxPhotos) {
      throw new Error('MAX_PHOTOS')
    }

    const maxPosition = await tx.clubPhoto.aggregate({
      where: { clubId: guard.club.id },
      _max: { position: true },
    })

    const position = (maxPosition._max.position ?? -1) + 1
    const url = getPublicUrl(key)

    await tx.club.update({
      where: { id: guard.club.id },
      data: { lastVerifiedAt: new Date() },
    })

    return tx.clubPhoto.create({
      data: {
        clubId: guard.club.id,
        url,
        alt: trimmedAlt,
        position,
      },
    })
  }).catch((e: Error) => {
    if (e.message === 'MAX_PHOTOS') return null
    throw e
  })

  if (!photo) {
    return { success: false, error: `Maximum ${maxPhotos} photos reached.`, code: 'MAX_PHOTOS' }
  }

  revalidateClubPaths(guard.club)

  return { success: true, data: { id: photo.id, url: photo.url, position: photo.position } }
}

// ── Delete Club Photo ──

export async function deleteClubPhoto(
  clubId: string,
  photoId: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const photo = await prisma.clubPhoto.findFirst({
    where: { id: photoId, clubId: guard.club.id },
  })
  if (!photo) {
    return { success: false, error: 'Photo not found.', code: 'NOT_FOUND' }
  }

  const maxImageTransactions = await getNumberSetting('limit.image_transactions_per_day')
  if (checkRateLimit(`r2:${guard.club.id}`, { windowMs: 86_400_000, maxAttempts: maxImageTransactions })) {
    return { success: false, error: 'Daily image transaction limit reached. Please try again tomorrow.', code: 'IMAGE_RATE_LIMITED' }
  }

  // Best-effort R2 deletion — always remove DB record
  try { await deleteObject(extractR2Key(photo.url)) } catch { /* R2 cleanup failed, orphaned object is acceptable */ }
  await prisma.$transaction(async (tx) => {
    await tx.clubPhoto.delete({ where: { id: photoId, clubId: guard.club.id } })
    await tx.club.update({ where: { id: guard.club.id }, data: { lastVerifiedAt: new Date() } })
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}

// ── Set Main Photo ──

export async function setMainPhoto(
  clubId: string,
  photoId: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const photo = await prisma.clubPhoto.findFirst({
    where: { id: photoId, clubId: guard.club.id },
  })
  if (!photo) {
    return { success: false, error: 'Photo not found.', code: 'NOT_FOUND' }
  }

  // Move the selected photo to position 0, shift others up
  await prisma.$transaction(async (tx) => {
    // Get all photos ordered by current position
    const allPhotos = await tx.clubPhoto.findMany({
      where: { clubId: guard.club.id },
      orderBy: { position: 'asc' },
      select: { id: true },
    })

    // Build new order: selected photo first, then the rest in their current order
    const reordered = [photoId, ...allPhotos.map((p) => p.id).filter((id) => id !== photoId)]

    for (let i = 0; i < reordered.length; i++) {
      await tx.clubPhoto.update({
        where: { id: reordered[i], clubId: guard.club.id },
        data: { position: i },
      })
    }
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}

// ── Upload Logo ──

export type UploadLogoResult = ActionResult<{ uploadUrl: string; key: string; publicUrl: string }>

export async function uploadLogo(
  clubId: string,
  contentType: string,
): Promise<UploadLogoResult> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed.', code: 'INVALID_TYPE' }
  }

  const maxImageTransactions = await getNumberSetting('limit.image_transactions_per_day')
  if (checkRateLimit(`r2:${guard.club.id}`, { windowMs: 86_400_000, maxAttempts: maxImageTransactions })) {
    return { success: false, error: 'Daily image transaction limit reached. Please try again tomorrow.', code: 'IMAGE_RATE_LIMITED' }
  }

  const ext = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/svg+xml' ? 'svg' : contentType.split('/')[1]
  const { uploadUrl, key } = await generateUploadUrl(guard.club.id, ext)
  const publicUrl = getPublicUrl(key)

  return { success: true, data: { uploadUrl, key, publicUrl } }
}

// ── Persist Logo (after client upload) ──

export async function persistLogo(
  clubId: string,
  key: string,
  alt: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  // Validate key belongs to this club
  if (!key.startsWith(`${guard.club.id}/`)) {
    return { success: false, error: 'Invalid file key.', code: 'INVALID_KEY' }
  }

  // Validate alt text length
  const trimmedAlt = alt.slice(0, 500)

  // Sanitize SVG uploads
  if (key.endsWith('.svg')) {
    const raw = await getObjectBuffer(key)
    const sanitized = sanitizeSvg(raw.toString('utf-8'))
    await putObject(key, Buffer.from(sanitized, 'utf-8'), 'image/svg+xml')
  }

  // Delete old logo from R2 if exists
  const club = await prisma.club.findUnique({
    where: { id: guard.club.id },
    select: { logoUrl: true },
  })
  if (club?.logoUrl) {
    try { await deleteObject(extractR2Key(club.logoUrl)) } catch { /* best-effort R2 cleanup */ }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoUrl: getPublicUrl(key), logoAlt: trimmedAlt, lastVerifiedAt: new Date() },
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}

// ── Delete Logo ──

export async function deleteLogo(clubId: string): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const club = await prisma.club.findUnique({
    where: { id: guard.club.id },
    select: { logoUrl: true },
  })

  if (club?.logoUrl) {
    const maxImageTransactions = await getNumberSetting('limit.image_transactions_per_day')
    if (checkRateLimit(`r2:${guard.club.id}`, { windowMs: 86_400_000, maxAttempts: maxImageTransactions })) {
      return { success: false, error: 'Daily image transaction limit reached. Please try again tomorrow.', code: 'IMAGE_RATE_LIMITED' }
    }
    try { await deleteObject(extractR2Key(club.logoUrl)) } catch { /* best-effort R2 cleanup */ }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoUrl: null, logoAlt: null, lastVerifiedAt: new Date() },
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}

// ── Update Logo Alt Text ──

export async function updateLogoAlt(
  clubId: string,
  alt: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(clubId)
  if (!guard.ok) return guard.result

  const trimmedAlt = alt.slice(0, 500)

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoAlt: trimmedAlt },
  })

  revalidateClubPaths(guard.club)

  return { success: true, data: undefined }
}
