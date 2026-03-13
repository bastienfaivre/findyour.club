'use server'
import { createHash } from 'crypto'
import { prisma } from '@/server/db'

export type MagicLinkResult =
  | { success: false; error: string; code: 'TOKEN_INVALID' | 'TOKEN_EXPIRED' }
  | { success: true; userId: string; alreadyConfigured: boolean }

/**
 * Pure magic-link verification — DB lookup + TTL check only.
 * Cookie setting and redirect live in the GET route handler at this same path,
 * because cookies() can only be mutated in a Route Handler or a Server Action
 * invoked from a Client Component (not directly from a Server Component).
 */
export async function verifyMagicLinkToken(rawToken: string): Promise<MagicLinkResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { success: false, error: 'Invalid or already used link.', code: 'TOKEN_INVALID' }
  }

  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const user = await prisma.user.findUnique({
    where: { magicToken: tokenHash },
    select: { id: true, magicTokenExp: true, passwordHash: true },
  })

  if (!user) {
    return { success: false, error: 'Invalid or already used link.', code: 'TOKEN_INVALID' }
  }

  if (!user.magicTokenExp || user.magicTokenExp < new Date()) {
    return { success: false, error: 'This link has expired. Please contact support.', code: 'TOKEN_EXPIRED' }
  }

  return { success: true, userId: user.id, alreadyConfigured: !!user.passwordHash }
}
