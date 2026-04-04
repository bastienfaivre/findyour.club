'use server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export type DeletePasskeyResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' }
  | { success: true }

export async function deletePasskey(credentialId: string, lang?: string): Promise<DeletePasskeyResult> {
  const t = getTranslations(resolveUILang(lang ?? 'en'))
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: t.errors.notAuthenticated, code: 'UNAUTHORIZED' }
  }

  // Compound where clause: only delete if the credential belongs to the authenticated user
  let deleted: { count: number }
  try {
    deleted = await prisma.webauthnCredential.deleteMany({
      where: { credentialId, userId: session.user.id },
    })
  } catch {
    return { success: false, error: t.errors.serverError, code: 'SERVER_ERROR' }
  }

  if (deleted.count === 0) {
    return { success: false, error: t.errors.notFound, code: 'NOT_FOUND' }
  }

  return { success: true }
}
