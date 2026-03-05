import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))

import { prisma } from '@/server/db'
import { verifyMagicLinkToken } from '@/app/[lang]/auth/magic-link/actions'

describe('verifyMagicLinkToken()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns TOKEN_INVALID for empty token', async () => {
    const result = await verifyMagicLinkToken('')
    expect(result).toMatchObject({ success: false, code: 'TOKEN_INVALID' })
  })

  it('returns TOKEN_INVALID when token hash not found in DB', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const result = await verifyMagicLinkToken('raw-token-xyz')
    expect(result).toMatchObject({ success: false, code: 'TOKEN_INVALID' })
  })

  it('returns TOKEN_EXPIRED when token TTL has passed (first-time user)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      passwordHash: null,
      magicTokenExp: new Date(Date.now() - 1000),
    } as never)
    const result = await verifyMagicLinkToken('raw-token-xyz')
    expect(result).toMatchObject({ success: false, code: 'TOKEN_EXPIRED' })
  })

  it('returns TOKEN_EXPIRED when magicTokenExp is null (first-time user)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      passwordHash: null,
      magicTokenExp: null,
    } as never)
    const result = await verifyMagicLinkToken('raw-token-xyz')
    expect(result).toMatchObject({ success: false, code: 'TOKEN_EXPIRED' })
  })

  it('returns success with alreadyConfigured=false on a valid first-time token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      passwordHash: null,
      magicTokenExp: new Date(Date.now() + 60 * 60 * 1000),
    } as never)
    const result = await verifyMagicLinkToken('raw-token-valid')
    expect(result).toMatchObject({ success: true, userId: 'u1', alreadyConfigured: false })
  })

  it('returns success with alreadyConfigured=true even when token is expired', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      passwordHash: '$existing_hash',
      magicTokenExp: new Date(Date.now() - 1000), // expired — irrelevant for already-configured users
    } as never)
    const result = await verifyMagicLinkToken('raw-token-stale')
    expect(result).toMatchObject({ success: true, userId: 'u1', alreadyConfigured: true })
  })

  it('does NOT modify the user record (magic token cleared only after password setup)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u1',
      passwordHash: null,
      magicTokenExp: new Date(Date.now() + 60 * 60 * 1000),
    } as never)
    await verifyMagicLinkToken('raw-token-valid')
    expect((prisma.user as Record<string, unknown>).update).toBeUndefined()
  })
})
