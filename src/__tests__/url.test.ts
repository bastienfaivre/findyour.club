import { describe, it, expect } from 'vitest'
import { buildClubAdminUrl } from '@/lib/url'

describe('buildClubAdminUrl()', () => {
  it('returns a relative admin URL with lang and clubId', () => {
    expect(buildClubAdminUrl('fr', 'club-123')).toBe('/fr/club/club-123')
  })

  it('works for different language codes', () => {
    expect(buildClubAdminUrl('de', 'club-456')).toBe('/de/club/club-456')
  })

  it('handles UUID-style club IDs', () => {
    expect(buildClubAdminUrl('en', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('/en/club/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  })
})
