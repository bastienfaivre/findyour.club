const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Reject tokens older than 5 minutes to prevent replay attacks.
// Matches Cloudflare's default widget expiry. The widget's onExpire handler
// automatically refreshes the token, so users filling long forms get a fresh one.
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000

interface TurnstileResponse {
  success: boolean
  challenge_ts?: string
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set — rejecting token')
    return false
  }

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })

  if (!res.ok) return false

  const data = (await res.json()) as TurnstileResponse
  if (!data.success) return false

  // Validate challenge freshness to prevent token replay
  if (data.challenge_ts) {
    const challengeTime = new Date(data.challenge_ts).getTime()
    if (Number.isNaN(challengeTime) || Date.now() - challengeTime > MAX_TOKEN_AGE_MS) {
      return false
    }
  }

  return true
}
