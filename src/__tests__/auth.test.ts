import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- module mocks must be declared before any imports ---
vi.mock('next-auth', () => ({ default: vi.fn(() => vi.fn()) }))
vi.mock('@auth/prisma-adapter', () => ({ PrismaAdapter: vi.fn(() => ({})) }))
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({ get: vi.fn() })) }))
vi.mock('@/server/db', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))

import { prisma } from '@/server/db'
import { authOptions } from '@/server/auth'

describe('session callback', () => {
  const sessionCb = authOptions.callbacks!.session!

  beforeEach(() => vi.clearAllMocks())

  it('propagates role and totpEnabled from DB lookup', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: 'CLUB_ADMIN', totpEnabled: true,
    } as never)
    const session = { user: { email: 'a@b.com' }, expires: '' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sessionCb({ session: session as never, user: { id: 'u1' } as never, token: {} as never, newSession: undefined, trigger: 'update' }) as any
    expect(result.user.role).toBe('CLUB_ADMIN')
    expect(result.user.totpEnabled).toBe(true)
  })

  it('sets clubId and clubRole to null at login (no club context yet)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: 'CLUB_ADMIN', totpEnabled: false,
    } as never)
    const session = { user: { email: 'a@b.com' }, expires: '' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sessionCb({ session: session as never, user: { id: 'u1' } as never, token: {} as never, newSession: undefined, trigger: 'update' }) as any
    expect(result.user.clubId).toBeNull()
    expect(result.user.clubRole).toBeNull()
  })

  it('sets totpVerified=false when totpEnabled=true', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: 'CLUB_ADMIN', totpEnabled: true,
    } as never)
    const session = { user: { email: 'a@b.com' }, expires: '' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sessionCb({ session: session as never, user: { id: 'u1' } as never, token: {} as never, newSession: undefined, trigger: 'update' }) as any
    expect(result.user.totpVerified).toBe(false)
  })

  it('sets totpVerified=true when totpEnabled=false', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: 'CLUB_ADMIN', totpEnabled: false,
    } as never)
    const session = { user: { email: 'a@b.com' }, expires: '' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sessionCb({ session: session as never, user: { id: 'u1' } as never, token: {} as never, newSession: undefined, trigger: 'update' }) as any
    expect(result.user.totpVerified).toBe(true)
  })
})
