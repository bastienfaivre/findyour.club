import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildClubAdminUrl } from '@/lib/url'

describe('buildClubAdminUrl()', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns an http URL in development using the request host', () => {
    expect(buildClubAdminUrl('localhost:3000', 'fr', 'ch', 'ski-club-valais')).toBe('http://localhost:3000/fr/ch/ski-club-valais')
  })

  it('returns an https URL in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(buildClubAdminUrl('yourplatform.com', 'fr', 'ch', 'ski-club-valais')).toBe('https://yourplatform.com/fr/ch/ski-club-valais')
  })

  it('preserves port number from host', () => {
    expect(buildClubAdminUrl('localhost:3000', 'fr', 'ch', 'football-club')).toBe('http://localhost:3000/fr/ch/football-club')
  })

  it('correctly builds URL for different lang, country and slug combinations', () => {
    expect(buildClubAdminUrl('localhost:3000', 'de', 'ch', 'basketball-club-bern')).toBe('http://localhost:3000/de/ch/basketball-club-bern')
  })

  it('falls back to empty host when headers return null (produces protocol-relative-style path)', () => {
    expect(buildClubAdminUrl('', 'fr', 'ch', 'ski-club-valais')).toBe('http:///fr/ch/ski-club-valais')
  })
})
