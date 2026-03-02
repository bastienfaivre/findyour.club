import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, clearRateLimit, _resetStore } from '@/lib/rate-limit'

const testConfig = { windowMs: 1000, maxAttempts: 3 }

describe('checkRateLimit()', () => {
  beforeEach(() => _resetStore())

  it('allows attempts below the threshold', () => {
    expect(checkRateLimit('ip-1', testConfig)).toBe(false)
    expect(checkRateLimit('ip-1', testConfig)).toBe(false)
    expect(checkRateLimit('ip-1', testConfig)).toBe(false)
  })

  it('blocks after reaching maxAttempts', () => {
    checkRateLimit('ip-2', testConfig)
    checkRateLimit('ip-2', testConfig)
    checkRateLimit('ip-2', testConfig)
    // 4th attempt should be blocked
    expect(checkRateLimit('ip-2', testConfig)).toBe(true)
  })

  it('isolates different IPs', () => {
    checkRateLimit('ip-a', testConfig)
    checkRateLimit('ip-a', testConfig)
    checkRateLimit('ip-a', testConfig)
    // ip-b is unaffected
    expect(checkRateLimit('ip-b', testConfig)).toBe(false)
  })

  it('slides window and allows attempts after expiry', async () => {
    const shortConfig = { windowMs: 50, maxAttempts: 2 }
    checkRateLimit('ip-3', shortConfig)
    checkRateLimit('ip-3', shortConfig)
    expect(checkRateLimit('ip-3', shortConfig)).toBe(true)

    // Wait for window to expire
    await new Promise(r => setTimeout(r, 60))

    // Should be allowed again
    expect(checkRateLimit('ip-3', shortConfig)).toBe(false)
  })
})

describe('clearRateLimit()', () => {
  beforeEach(() => _resetStore())

  it('clears attempts so the key is no longer blocked', () => {
    const cfg = { windowMs: 5000, maxAttempts: 1 }
    checkRateLimit('ip-x', cfg)
    expect(checkRateLimit('ip-x', cfg)).toBe(true)

    clearRateLimit('ip-x')
    expect(checkRateLimit('ip-x', cfg)).toBe(false)
  })
})
