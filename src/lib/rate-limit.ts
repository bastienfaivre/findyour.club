// In-memory sliding window rate limiter. Resets on server restart.
// For MVP single-instance deployment. Redis deferred to post-MVP.

interface RateEntry {
  timestamps: number[]
}

const store = new Map<string, RateEntry>()

export interface RateLimitConfig {
  windowMs: number    // Window duration in ms
  maxAttempts: number // Max allowed attempts in window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 5,
}

/**
 * Check if a key (typically IP address) is rate-limited.
 * Records this attempt and returns whether it's blocked.
 */
export function checkRateLimit(key: string, config: RateLimitConfig = DEFAULT_CONFIG): boolean {
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  // Prune expired timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxAttempts) {
    store.set(key, entry)
    return true // Rate limited
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return false // Not rate limited
}

/**
 * Clear rate limit state for a key (call on successful auth).
 */
export function clearRateLimit(key: string): void {
  store.delete(key)
}

/** Exposed for testing only — no-op in production */
export function _resetStore(): void {
  if (process.env.NODE_ENV === 'production') return
  store.clear()
}
