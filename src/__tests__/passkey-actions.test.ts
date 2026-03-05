import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    webauthnCredential: {
      deleteMany: vi.fn(),
    },
  },
}))

import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { deletePasskey } from '@/app/[lang]/auth/passkey/actions'

describe('deletePasskey()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns UNAUTHORIZED when not authenticated', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    const result = await deletePasskey('cred-1')
    expect(result).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  it('returns NOT_FOUND when credential does not belong to the authenticated user (deleteMany count 0)', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.webauthnCredential.deleteMany).mockResolvedValue({ count: 0 } as never)
    const result = await deletePasskey('other-users-cred')
    expect(result).toMatchObject({ success: false, code: 'NOT_FOUND' })
    expect(prisma.webauthnCredential.deleteMany).toHaveBeenCalledWith({
      where: { credentialId: 'other-users-cred', userId: 'u1' },
    })
  })

  it('returns SERVER_ERROR when prisma throws', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.webauthnCredential.deleteMany).mockRejectedValue(new Error('DB connection lost'))
    const result = await deletePasskey('cred-1')
    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('returns { success: true } when credential is deleted successfully', async () => {
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1' } } as never)
    vi.mocked(prisma.webauthnCredential.deleteMany).mockResolvedValue({ count: 1 } as never)
    const result = await deletePasskey('cred-1')
    expect(result).toMatchObject({ success: true })
    expect(prisma.webauthnCredential.deleteMany).toHaveBeenCalledWith({
      where: { credentialId: 'cred-1', userId: 'u1' },
    })
  })
})
