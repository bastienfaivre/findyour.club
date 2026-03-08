'use server'

import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/server/auth'
import { getClubBySlug, getClubActiveMembership } from '@/lib/server/club-queries'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'

export type SaveClubProfileResult =
  | { success: true; data: { savedAt: string } }
  | { success: false; error: string; code?: string }

export async function saveClubProfile(
  country: string,
  slug: string,
  input: ClubProfileSaveInput,
): Promise<SaveClubProfileResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  const club = await getClubBySlug(slug, country)
  if (!club) {
    return { success: false, error: 'Club not found.', code: 'NOT_FOUND' }
  }

  const membership = await getClubActiveMembership(session.user.id, club.id)
  if (!membership) {
    return { success: false, error: 'Not a member of this club.', code: 'FORBIDDEN' }
  }

  const parsed = clubProfileSaveSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.', code: 'VALIDATION_ERROR' }
  }

  // Stub: actual DB update will be implemented with the profile edit form
  const savedAt = new Date().toISOString()

  revalidatePath(`/${country}/${slug}`)

  return { success: true, data: { savedAt } }
}
