'use server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

export type DeletePasskeyResult =
  | { success: false; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' }
  | { success: true }

export async function deletePasskey(credentialId: string): Promise<DeletePasskeyResult> {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated.', code: 'UNAUTHORIZED' }
  }

  // Compound where clause: only delete if the credential belongs to the authenticated user
  let deleted: { count: number }
  try {
    deleted = await prisma.webauthnCredential.deleteMany({
      where: { credentialId, userId: session.user.id },
    })
  } catch {
    return { success: false, error: 'Failed to delete credential.', code: 'SERVER_ERROR' }
  }

  if (deleted.count === 0) {
    return { success: false, error: 'Credential not found.', code: 'NOT_FOUND' }
  }

  return { success: true }
}
