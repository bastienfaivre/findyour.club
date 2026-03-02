import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: vi.fn(),
}))

import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'

describe('TotpEnrollmentBanner logic', () => {
  it('returns null when no session exists', () => {
    const result = TotpEnrollmentBanner({ session: null })
    expect(result).toBeNull()
  })

  it('returns null when totpEnabled is true', () => {
    const result = TotpEnrollmentBanner({
      session: {
        user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: true, totpVerified: true, clubId: null, clubRole: null, email: '' },
        expires: '',
      } as never,
    })
    expect(result).toBeNull()
  })

  it('returns null when role is OPERATOR (not CLUB_ADMIN)', () => {
    const result = TotpEnrollmentBanner({
      session: {
        user: { id: 'u1', role: 'OPERATOR', totpEnabled: false, totpVerified: false, clubId: null, clubRole: null, email: '' },
        expires: '',
      } as never,
    })
    expect(result).toBeNull()
  })

  it('returns a banner element when CLUB_ADMIN has totpEnabled=false', () => {
    const result = TotpEnrollmentBanner({
      session: {
        user: { id: 'u1', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: false, clubId: 'c1', clubRole: 'OWNER', email: '' },
        expires: '',
      } as never,
    })
    expect(result).not.toBeNull()
  })
})
