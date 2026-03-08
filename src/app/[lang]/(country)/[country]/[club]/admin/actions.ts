'use server'

import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getClubBySlug, getClubActiveMembership } from '@/lib/server/club-queries'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'
import { generateUploadUrl, deleteObject, getPublicUrl, ALLOWED_IMAGE_TYPES } from '@/lib/r2'

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// ── Auth guard helper ──

type AuthGuardError = { ok: false; result: { success: false; error: string; code: string } }
type AuthGuardSuccess = { ok: true; club: { id: string; name: string }; membership: { id: string; role: string } }

async function authGuard(country: string, slug: string): Promise<AuthGuardError | AuthGuardSuccess> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { ok: false, result: { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' } }
  }

  const club = await getClubBySlug(slug, country)
  if (!club) {
    return { ok: false, result: { success: false, error: 'Club not found.', code: 'NOT_FOUND' } }
  }

  const membership = await getClubActiveMembership(session.user.id, club.id)
  if (!membership) {
    return { ok: false, result: { success: false, error: 'Not a member of this club.', code: 'FORBIDDEN' } }
  }

  return { ok: true, club, membership }
}

// ── Toggle Publish ──

export type TogglePublishResult = ActionResult<{ isPublished: boolean }>

export async function togglePublish(
  lang: string,
  country: string,
  slug: string,
): Promise<TogglePublishResult> {
  const guard = await authGuard(country, slug)
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
    revalidatePath(`/${lang}/${country}/${slug}`)
    revalidatePath(`/${lang}/${country}/${slug}/admin`)
  }

  return result
}

// ── Mark Operator Message as Read ──

export async function markOperatorMessageAsRead(
  messageId: string,
  lang: string,
  country: string,
  slug: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  const message = await prisma.operatorMessage.findFirst({
    where: { id: messageId, clubId: guard.club.id, readAt: null },
  })
  if (!message) {
    return { success: false, error: 'Message not found.', code: 'NOT_FOUND' }
  }

  await prisma.operatorMessage.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  })

  revalidatePath(`/${lang}/${country}/${slug}/admin`)

  return { success: true, data: undefined }
}

// ── Save Club Profile (text fields) ──

export type SaveClubProfileResult = ActionResult<{ savedAt: string }>

export async function saveClubProfile(
  lang: string,
  country: string,
  slug: string,
  input: ClubProfileSaveInput,
): Promise<SaveClubProfileResult> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  const parsed = clubProfileSaveSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.', code: 'VALIDATION_ERROR' }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      schedule: parsed.data.schedule,
      howToJoin: parsed.data.howToJoin,
      contactPhone: parsed.data.contactPhone,
      contactAddress: parsed.data.contactAddress,
      externalWebsiteUrl: parsed.data.externalWebsiteUrl || null,
    },
  })

  const savedAt = new Date().toISOString()
  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: { savedAt } }
}

// ── Presigned Upload URL ──

export type PresignedUrlResult = ActionResult<{ uploadUrl: string; key: string; publicUrl: string }>

export async function getPresignedUploadUrl(
  lang: string,
  country: string,
  slug: string,
  contentType: string,
): Promise<PresignedUrlResult> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', code: 'INVALID_TYPE' }
  }

  const photoCount = await prisma.clubPhoto.count({ where: { clubId: guard.club.id } })
  if (photoCount >= 10) {
    return { success: false, error: 'Maximum 10 photos reached.', code: 'MAX_PHOTOS' }
  }

  const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1]
  const { uploadUrl, key } = await generateUploadUrl(guard.club.id, ext)
  const publicUrl = getPublicUrl(key)

  return { success: true, data: { uploadUrl, key, publicUrl } }
}

// ── Create Club Photo (after client upload) ──

export type CreatePhotoResult = ActionResult<{ id: string; url: string; position: number }>

export async function createClubPhoto(
  lang: string,
  country: string,
  slug: string,
  key: string,
  alt: string,
): Promise<CreatePhotoResult> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  // Validate key belongs to this club
  if (!key.startsWith(`${guard.club.id}/`)) {
    return { success: false, error: 'Invalid file key.', code: 'INVALID_KEY' }
  }

  // Use transaction to prevent race condition in position assignment
  const photo = await prisma.$transaction(async (tx) => {
    const maxPosition = await tx.clubPhoto.aggregate({
      where: { clubId: guard.club.id },
      _max: { position: true },
    })

    const position = (maxPosition._max.position ?? -1) + 1
    const url = getPublicUrl(key)

    return tx.clubPhoto.create({
      data: {
        clubId: guard.club.id,
        url,
        alt,
        position,
      },
    })
  })

  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: { id: photo.id, url: photo.url, position: photo.position } }
}

// ── Delete Club Photo ──

export async function deleteClubPhoto(
  lang: string,
  country: string,
  slug: string,
  photoId: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  const photo = await prisma.clubPhoto.findFirst({
    where: { id: photoId, clubId: guard.club.id },
  })
  if (!photo) {
    return { success: false, error: 'Photo not found.', code: 'NOT_FOUND' }
  }

  // Extract R2 key from public URL
  const publicUrlPrefix = process.env.R2_PUBLIC_URL!
  const key = photo.url.replace(`${publicUrlPrefix}/`, '')

  // Best-effort R2 deletion — always remove DB record
  try { await deleteObject(key) } catch { /* R2 cleanup failed, orphaned object is acceptable */ }
  await prisma.clubPhoto.delete({ where: { id: photoId } })

  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: undefined }
}

// ── Upload Logo ──

export type UploadLogoResult = ActionResult<{ uploadUrl: string; key: string; publicUrl: string }>

export async function uploadLogo(
  lang: string,
  country: string,
  slug: string,
  contentType: string,
): Promise<UploadLogoResult> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  if (!ALLOWED_IMAGE_TYPES.includes(contentType as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.', code: 'INVALID_TYPE' }
  }

  const ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1]
  const { uploadUrl, key } = await generateUploadUrl(guard.club.id, ext)
  const publicUrl = getPublicUrl(key)

  return { success: true, data: { uploadUrl, key, publicUrl } }
}

// ── Persist Logo (after client upload) ──

export async function persistLogo(
  lang: string,
  country: string,
  slug: string,
  key: string,
  alt: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  // Validate key belongs to this club
  if (!key.startsWith(`${guard.club.id}/`)) {
    return { success: false, error: 'Invalid file key.', code: 'INVALID_KEY' }
  }

  // Delete old logo from R2 if exists
  const club = await prisma.club.findUnique({
    where: { id: guard.club.id },
    select: { logoUrl: true },
  })
  if (club?.logoUrl) {
    const publicUrlPrefix = process.env.R2_PUBLIC_URL!
    const oldKey = club.logoUrl.replace(`${publicUrlPrefix}/`, '')
    try { await deleteObject(oldKey) } catch { /* best-effort R2 cleanup */ }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoUrl: getPublicUrl(key), logoAlt: alt },
  })

  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: undefined }
}

// ── Delete Logo ──

export async function deleteLogo(
  lang: string,
  country: string,
  slug: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  const club = await prisma.club.findUnique({
    where: { id: guard.club.id },
    select: { logoUrl: true },
  })

  if (club?.logoUrl) {
    const publicUrlPrefix = process.env.R2_PUBLIC_URL!
    const key = club.logoUrl.replace(`${publicUrlPrefix}/`, '')
    try { await deleteObject(key) } catch { /* best-effort R2 cleanup */ }
  }

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoUrl: null, logoAlt: null },
  })

  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: undefined }
}

// ── Update Logo Alt Text ──

export async function updateLogoAlt(
  lang: string,
  country: string,
  slug: string,
  alt: string,
): Promise<ActionResult<undefined>> {
  const guard = await authGuard(country, slug)
  if (!guard.ok) return guard.result

  await prisma.club.update({
    where: { id: guard.club.id },
    data: { logoAlt: alt },
  })

  revalidatePath(`/${lang}/${country}/${slug}`)

  return { success: true, data: undefined }
}
