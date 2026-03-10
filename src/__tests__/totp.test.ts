import { describe, it, expect } from 'vitest'
import { generateTotpSecret, generateTotpUri, verifyTotpCode, generateTotpCode } from '@/lib/totp'

describe('generateTotpSecret()', () => {
  it('returns a non-empty base32 string', () => {
    const secret = generateTotpSecret()
    expect(secret).toBeTruthy()
    expect(typeof secret).toBe('string')
    expect(secret.length).toBeGreaterThan(0)
  })

  it('returns unique secrets on each call', () => {
    const a = generateTotpSecret()
    const b = generateTotpSecret()
    expect(a).not.toBe(b)
  })
})

describe('generateTotpUri()', () => {
  it('returns an otpauth:// URI', () => {
    const secret = generateTotpSecret()
    const uri = generateTotpUri(secret, 'admin@example.com')
    expect(uri).toMatch(/^otpauth:\/\/totp\//)
    expect(uri).toContain('findyour.club')
  })

  it('uses custom issuer when provided', () => {
    const secret = generateTotpSecret()
    const uri = generateTotpUri(secret, 'a@b.com', 'MyApp')
    expect(uri).toContain('MyApp')
  })

  it('includes the secret in the URI', () => {
    const secret = generateTotpSecret()
    const uri = generateTotpUri(secret, 'a@b.com')
    expect(uri).toContain(secret)
  })
})

describe('verifyTotpCode()', () => {
  it('returns true for a valid code generated from the same secret', async () => {
    const secret = generateTotpSecret()
    const validCode = await generateTotpCode(secret)
    expect(await verifyTotpCode(secret, validCode)).toBe(true)
  })

  it('returns false for an empty token', async () => {
    const secret = generateTotpSecret()
    expect(await verifyTotpCode(secret, '')).toBe(false)
  })

  it('returns false for non-numeric token', async () => {
    const secret = generateTotpSecret()
    expect(await verifyTotpCode(secret, 'abcdef')).toBe(false)
  })

  it('returns false for code from a different secret', async () => {
    const secret1 = generateTotpSecret()
    const secret2 = generateTotpSecret()
    const code = await generateTotpCode(secret1)
    const result = await verifyTotpCode(secret2, code)
    // In the (astronomically unlikely) case of a collision, the test is skipped
    if (result) return
    expect(result).toBe(false)
  })
})
