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
import AdminLayout from '@/app/[lang]/admin/(protected)/layout'

function makeParams(lang = 'en') {
  return Promise.resolve({ lang })
}

describe('AdminLayout operator guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to /{lang}/auth/login when there is no session', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null)
    await expect(AdminLayout({ children: null, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/en/auth/login')
    expect(redirect).toHaveBeenCalledWith('/en/auth/login')
  })

  it('redirects to /{lang}/auth/login when session role is CLUB_ADMIN', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'CLUB_ADMIN' } } as any)
    await expect(AdminLayout({ children: null, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/en/auth/login')
    expect(redirect).toHaveBeenCalledWith('/en/auth/login')
  })

  it('renders children when session role is OPERATOR with TOTP verified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR', totpEnabled: false, totpVerified: true } } as any)
    const result = await AdminLayout({ children: null, params: makeParams() })
    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('redirects to /{lang}/auth/totp when OPERATOR has TOTP enabled but not yet verified', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR', totpEnabled: true, totpVerified: false } } as any)
    await expect(AdminLayout({ children: null, params: makeParams() })).rejects.toThrow('NEXT_REDIRECT:/en/auth/totp')
    expect(redirect).toHaveBeenCalledWith('/en/auth/totp')
  })
})
