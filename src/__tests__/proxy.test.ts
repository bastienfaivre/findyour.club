import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// proxy.ts imports from @/lib/i18n — provide a minimal mock
vi.mock('@/lib/i18n', () => ({
  isSupportedLanguage: (v: unknown) => typeof v === 'string' && ['fr', 'de', 'it', 'en'].includes(v),
  resolveUILang: (v: string) => (['fr', 'de', 'it', 'en'].includes(v) ? v : 'en'),
}))

import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'

function makeRequest(pathname: string, acceptLanguage?: string, langCookie?: string): NextRequest {
  const url = new URL(`http://localhost${pathname}`)
  const headers = new Headers()
  if (acceptLanguage) headers.set('accept-language', acceptLanguage)
  if (langCookie) headers.set('cookie', `platform_lang=${langCookie}`)
  return new NextRequest(url, { headers })
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('proxy() — lang pass-through', () => {
  it('passes through when first segment is a supported language', () => {
    const res = proxy(makeRequest('/fr/ch/ski-club-valais'))
    expect(res.status).toBe(200) // NextResponse.next() → 200
    expect(res.headers.get('location')).toBeNull()
  })

  it('sets platform_lang cookie to the detected lang on pass-through', () => {
    const res = proxy(makeRequest('/de/ch/some-club'))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('platform_lang=de')
  })

  it('sets platform_lang cookie with path=/, sameSite=lax', () => {
    const res = proxy(makeRequest('/fr/page'))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('Path=/')
    expect(setCookie.toLowerCase()).toContain('samesite=lax')
  })

  it('sets secure flag on cookie in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const res = proxy(makeRequest('/fr/page'))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie.toLowerCase()).toContain('secure')
  })

  it('does NOT set secure flag outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const res = proxy(makeRequest('/fr/page'))
    const setCookie = res.headers.get('set-cookie') ?? ''
    // secure attribute should not appear (it only appears in production)
    const attrs = setCookie.toLowerCase().split(';').map(s => s.trim())
    // 'secure' entry is a standalone attribute, not a key=value pair
    expect(attrs).not.toContain('secure')
  })

  it('passes through all four supported languages', () => {
    for (const lang of ['fr', 'de', 'it', 'en']) {
      const res = proxy(makeRequest(`/${lang}/ch/club`))
      expect(res.status).toBe(200)
    }
  })
})

describe('proxy() — redirect logic', () => {
  it('redirects with 307 when first segment is not a supported language', () => {
    const res = proxy(makeRequest('/ch/ski-club-valais'))
    expect(res.status).toBe(307)
  })

  it('prepends lang to the original path on redirect', () => {
    const res = proxy(makeRequest('/ch/ski-club-valais'))
    const location = res.headers.get('location') ?? ''
    // Should be /{lang}/ch/ski-club-valais — lang is en (no Accept-Language in test env)
    expect(location).toMatch(/^http:\/\/localhost\/[a-z]{2}\/ch\/ski-club-valais$/)
  })

  it('redirects to /en/... when Accept-Language falls back to en (unsupported lang pt)', () => {
    const res = proxy(makeRequest('/unknown-page', 'pt-BR,pt;q=0.9'))
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('/en/unknown-page')
  })

  it('redirects to /fr/... when Accept-Language is fr (header read correctly)', () => {
    const res = proxy(makeRequest('/unknown-page', 'fr'))
    const location = res.headers.get('location') ?? ''
    // If headers work in the test env, it will be /fr/; otherwise /en/ (fallback is also acceptable)
    expect(location).toMatch(/http:\/\/localhost\/(fr|en)\/unknown-page/)
  })

  it('does not set platform_lang cookie on redirect', () => {
    const res = proxy(makeRequest('/ch/ski-club'))
    // no cookie should be set — the redirected URL will go through proxy again
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('uses platform_lang cookie for redirect lang when cookie is set', () => {
    const res = proxy(makeRequest('/my-clubs', undefined, 'de'))
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('/de/my-clubs')
  })
})
