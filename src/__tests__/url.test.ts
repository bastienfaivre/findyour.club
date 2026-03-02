import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildClubAdminUrl } from '@/lib/url'

describe('buildClubAdminUrl()', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns an http URL in development using the request host', () => {
    expect(buildClubAdminUrl('localhost:3000', 'ch', 'ski-club-valais')).toBe('http://localhost:3000/ch/ski-club-valais')
  })

  it('returns an https URL in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(buildClubAdminUrl('yourplatform.com', 'ch', 'ski-club-valais')).toBe('https://yourplatform.com/ch/ski-club-valais')
  })

  it('preserves port number from host', () => {
    expect(buildClubAdminUrl('localhost:3000', 'fr', 'football-club')).toBe('http://localhost:3000/fr/football-club')
  })

  it('correctly builds URL for different country and slug combinations', () => {
    expect(buildClubAdminUrl('localhost:3000', 'de', 'basketball-club-berlin')).toBe('http://localhost:3000/de/basketball-club-berlin')
  })

  it('falls back to empty host when headers return null (produces protocol-relative-style path)', () => {
    expect(buildClubAdminUrl('', 'ch', 'ski-club-valais')).toBe('http:///ch/ski-club-valais')
  })
})
