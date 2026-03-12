import { describe, it, expect } from 'vitest'
import { loginSchema, setupPasswordSchema, totpVerifySchema } from '@/lib/schemas/user'

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'admin@club.ch', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('setupPasswordSchema', () => {
  const PROFILE = { firstName: 'Jean', lastName: 'Dupont', phone: '', preferredLanguage: 'fr' as const }

  it('accepts a strong matching password', () => {
    const result = setupPasswordSchema.safeParse({
      ...PROFILE,
      password: 'Str0ng!Password#2',
      confirmPassword: 'Str0ng!Password#2',
    })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 12 characters', () => {
    const result = setupPasswordSchema.safeParse({ ...PROFILE, password: 'Short1!', confirmPassword: 'Short1!' })
    expect(result.success).toBe(false)
  })

  it('rejects password missing uppercase', () => {
    const result = setupPasswordSchema.safeParse({ ...PROFILE, password: 'alllower1!abcdef', confirmPassword: 'alllower1!abcdef' })
    expect(result.success).toBe(false)
  })

  it('rejects password missing number', () => {
    const result = setupPasswordSchema.safeParse({ ...PROFILE, password: 'NoNumbers!here!', confirmPassword: 'NoNumbers!here!' })
    expect(result.success).toBe(false)
  })

  it('rejects password missing special character', () => {
    const result = setupPasswordSchema.safeParse({ ...PROFILE, password: 'NoSpecial123456', confirmPassword: 'NoSpecial123456' })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = setupPasswordSchema.safeParse({
      ...PROFILE,
      password: 'Str0ng!Password#2',
      confirmPassword: 'Different!Pass#9',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map(i => i.path.join('.'))
      expect(paths).toContain('confirmPassword')
    }
  })
})

describe('totpVerifySchema', () => {
  it('accepts a 6-digit code', () => {
    const result = totpVerifySchema.safeParse({ code: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejects codes shorter than 6 digits', () => {
    const result = totpVerifySchema.safeParse({ code: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects codes longer than 6 digits', () => {
    const result = totpVerifySchema.safeParse({ code: '1234567' })
    expect(result.success).toBe(false)
  })

  it('rejects non-digit codes', () => {
    const result = totpVerifySchema.safeParse({ code: 'abcdef' })
    expect(result.success).toBe(false)
  })
})
