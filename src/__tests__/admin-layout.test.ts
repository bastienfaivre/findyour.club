import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(async () => null),
}))

import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import AdminLayout from '@/app/admin/(protected)/layout'

describe('AdminLayout operator guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to /auth/login when there is no session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/auth/login')
    expect(redirect).toHaveBeenCalledWith('/auth/login')
  })

  it('redirects to /auth/login when session role is CLUB_ADMIN', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'CLUB_ADMIN' } } as any)
    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/auth/login')
    expect(redirect).toHaveBeenCalledWith('/auth/login')
  })

  it('renders children when session role is OPERATOR with TOTP verified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR', totpEnabled: false, totpVerified: true } } as any)
    const result = await AdminLayout({ children: null })
    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('redirects to /auth/totp when OPERATOR has TOTP enabled but not yet verified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR', totpEnabled: true, totpVerified: false } } as any)
    await expect(AdminLayout({ children: null })).rejects.toThrow('NEXT_REDIRECT:/auth/totp')
    expect(redirect).toHaveBeenCalledWith('/auth/totp')
  })
})
