import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))
vi.mock('@/server/db', () => ({
  prisma: {
    application: { create: vi.fn() },
    activityType: { findUnique: vi.fn() },
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
import { submitApplication } from '@/app/[lang]/(platform)/apply/actions'

const VALID_INPUT = {
  name: 'Ski Club Valais',
  email: 'contact@skiclub.ch',
  country: 'ch' as const,
  activityTypeId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  location: {
    swisstopoId: '2117',
    plz: '1950',
    cantonCode: 'VS',
    name: 'Sion',
  },
  description: 'A ski club in Valais.',
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
    vi.mocked(prisma.activityType.findUnique).mockResolvedValue({ id: 'at-1' } as never)
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
        activityTypeId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
        locationId: 'loc-1',
        description: 'A ski club in Valais.',
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

  it('returns VALIDATION_ERROR when activityTypeId does not exist', async () => {
    vi.mocked(prisma.activityType.findUnique).mockResolvedValue(null)

    const result = await submitApplication(VALID_INPUT)

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
})
