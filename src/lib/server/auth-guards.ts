import { type Session } from 'next-auth'
import { getAuthSession } from '@/server/auth'

export type ActionError = { success: false; error: string; code: 'UNAUTHORIZED' }

/**
 * Verify that the current session belongs to an OPERATOR user.
 * Returns the session on success, or a standard error result on failure.
 */
export async function requireOperator(): Promise<{ session: Session } | { error: ActionError }> {
  const session = await getAuthSession()
  if (!session?.user || session.user.role !== 'OPERATOR') {
    return { error: { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' } }
  }
  return { session }
}
