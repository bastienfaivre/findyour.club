import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    application: { create: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  },
}))
vi.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))
vi.mock('@/lib/server/location', () => ({
  upsertSwissLocation: vi.fn(),
}))

import { headers } from 'next/headers'
import { prisma } from '@/server/db'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { upsertSwissLocation } from '@/lib/server/location'
import { submitApplication } from '@/app/[lang]/(dashboard)/apply/actions'

const VALID_INPUT = {
  name: 'Ski Club Valais',
  email: 'contact@skiclub.ch',
  country: 'ch' as const,
  activityType: 'skiing',
  location: {
    swisstopoId: '2117',
    plz: '1950',
    cantonCode: 'VS',
    name: 'Sion',
  },
  description: 'A ski club in Valais.',
  howToJoin: 'Send us an email or come to any session.',
  schedule: 'Tuesdays 19h-21h',
  contactPhone: '+41 27 123 45 67',
  contactAddress: 'Rue de la Gare 1, 1950 Sion',
  externalWebsiteUrl: 'https://skiclub-valais.ch',
  desiredSlug: 'ski-club-valais',
  turnstileToken: 'test-token',
}

function mockHeaders(ip = '127.0.0.1') {
  vi.mocked(headers).mockResolvedValue(
    new Map([['x-forwarded-for', ip]]) as never,
  )
}

describe('submitApplication()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders()
    vi.mocked(checkRateLimit).mockReturnValue(false)
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true)
    vi.mocked(upsertSwissLocation).mockResolvedValue({ locationId: 'loc-1' })
    vi.mocked(prisma.application.create).mockResolvedValue({} as never)
  })

  it('creates application on valid input (happy path)', async () => {
    const result = await submitApplication(VALID_INPUT)

    expect(result).toEqual({ success: true })
    expect(prisma.application.create).toHaveBeenCalledWith({
      data: {
        name: 'Ski Club Valais',
        email: 'contact@skiclub.ch',
        country: 'ch',
        activityType: 'skiing',
        otherDescription: null,
        locationId: 'loc-1',
        description: 'A ski club in Valais.',
        schedule: 'Tuesdays 19h-21h',
        contactPhone: '+41 27 123 45 67',
        contactAddress: 'Rue de la Gare 1, 1950 Sion',
        howToJoin: 'Send us an email or come to any session.',
        externalWebsiteUrl: 'https://skiclub-valais.ch',
        desiredSlug: 'ski-club-valais',
      },
    })
    expect(upsertSwissLocation).toHaveBeenCalledWith({
      swisstopoId: '2117',
      plz: '1950',
      cantonCode: 'VS',
      displayName: 'Sion',
    })
  })

  it('returns RATE_LIMITED when IP exceeds rate limit', async () => {
    vi.mocked(checkRateLimit).mockReturnValue(true)

    const result = await submitApplication(VALID_INPUT)

    expect(result).toMatchObject({ success: false, code: 'RATE_LIMITED' })
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR for missing required fields', async () => {
    const result = await submitApplication({ name: '' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR for invalid email', async () => {
    const result = await submitApplication({ ...VALID_INPUT, email: 'not-an-email' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
  })

  it('returns VALIDATION_ERROR for invalid desiredSlug format', async () => {
    const result = await submitApplication({ ...VALID_INPUT, desiredSlug: '--UPPER--' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('returns TURNSTILE_FAILED when token verification fails', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false)

    const result = await submitApplication(VALID_INPUT)

    expect(result).toMatchObject({ success: false, code: 'TURNSTILE_FAILED' })
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR when activityType is invalid', async () => {
    const result = await submitApplication({ ...VALID_INPUT, activityType: 'nonexistent' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('returns SERVER_ERROR when upsertSwissLocation fails', async () => {
    vi.mocked(upsertSwissLocation).mockRejectedValue(new Error('Location error'))

    const result = await submitApplication(VALID_INPUT)

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
    expect(prisma.application.create).not.toHaveBeenCalled()
  })

  it('returns SERVER_ERROR when database write fails', async () => {
    vi.mocked(prisma.application.create).mockRejectedValue(new Error('DB error'))

    const result = await submitApplication(VALID_INPUT)

    expect(result).toMatchObject({ success: false, code: 'SERVER_ERROR' })
  })

  it('calls checkRateLimit with apply: prefixed IP', async () => {
    mockHeaders('192.168.1.1')

    await submitApplication(VALID_INPUT)

    expect(checkRateLimit).toHaveBeenCalledWith('apply:192.168.1.1', { windowMs: 600000, maxAttempts: 3 })
  })

  it('uses first IP from x-forwarded-for when multiple are present', async () => {
    vi.mocked(headers).mockResolvedValue(
      new Map([['x-forwarded-for', '10.0.0.1, 10.0.0.2']]) as never,
    )

    await submitApplication(VALID_INPUT)

    expect(checkRateLimit).toHaveBeenCalledWith('apply:10.0.0.1', expect.any(Object))
  })

  it('returns VALIDATION_ERROR when howToJoin is missing', async () => {
    const { howToJoin: _, ...input } = VALID_INPUT
    const result = await submitApplication(input)

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR when howToJoin is whitespace-only', async () => {
    const result = await submitApplication({ ...VALID_INPUT, howToJoin: '   ' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR for invalid externalWebsiteUrl', async () => {
    const result = await submitApplication({ ...VALID_INPUT, externalWebsiteUrl: 'not-a-url' })

    expect(result).toMatchObject({ success: false, code: 'VALIDATION_ERROR' })
    expect(verifyTurnstileToken).not.toHaveBeenCalled()
  })

  it('accepts submission when optional profile fields are omitted', async () => {
    const { schedule: _s, contactPhone: _cp, contactAddress: _ca, externalWebsiteUrl: _ewu, ...input } = VALID_INPUT
    const result = await submitApplication(input)

    expect(result).toEqual({ success: true })
    expect(prisma.application.create).toHaveBeenCalled()
  })

  it('stores all new profile fields in the database', async () => {
    await submitApplication(VALID_INPUT)

    const createCall = vi.mocked(prisma.application.create).mock.calls[0][0]
    expect(createCall.data).toMatchObject({
      schedule: 'Tuesdays 19h-21h',
      contactPhone: '+41 27 123 45 67',
      contactAddress: 'Rue de la Gare 1, 1950 Sion',
      howToJoin: 'Send us an email or come to any session.',
      externalWebsiteUrl: 'https://skiclub-valais.ch',
    })
  })

  it('stores null for empty externalWebsiteUrl', async () => {
    const result = await submitApplication({ ...VALID_INPUT, externalWebsiteUrl: '' })

    expect(result).toEqual({ success: true })
    const createCall = vi.mocked(prisma.application.create).mock.calls[0][0]
    expect(createCall.data.externalWebsiteUrl).toBeNull()
  })
})
