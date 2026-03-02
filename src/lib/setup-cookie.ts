// Encrypted HttpOnly cookie helpers for the magic-link → password-setup flow and TOTP verification.
// Uses AES-256-GCM from src/lib/crypto.ts with CONTACT_ENCRYPTION_KEY.
import { encrypt, decrypt } from '@/lib/crypto'

const SETUP_COOKIE_NAME = 'setup_session'
const SETUP_COOKIE_TTL_MS = 30 * 60 * 1000 // 30 minutes

interface SetupPayload {
  userId: string
  exp: number
}

export { SETUP_COOKIE_NAME }

/** Encode a setup session cookie value from a userId */
export function encodeSetupCookie(userId: string): string {
  const payload: SetupPayload = { userId, exp: Date.now() + SETUP_COOKIE_TTL_MS }
  const { ciphertext, iv } = encrypt(JSON.stringify(payload))
  return Buffer.from(JSON.stringify({ ciphertext, iv })).toString('base64')
}

/** Decode and validate a setup session cookie value. Returns userId or null if invalid/expired. */
export function decodeSetupCookie(value: string): string | null {
  try {
    const { ciphertext, iv } = JSON.parse(Buffer.from(value, 'base64').toString('utf8'))
    const payload: SetupPayload = JSON.parse(decrypt(ciphertext, iv))
    if (payload.exp < Date.now()) return null
    return payload.userId
  } catch {
    return null
  }
}

/**
 * Encode a totp_verified cookie value by encrypting the userId.
 * The cookie maxAge handles expiry — no additional TTL payload needed.
 */
export function encodeTotpVerifiedCookie(userId: string): string {
  const { ciphertext, iv } = encrypt(userId)
  return Buffer.from(JSON.stringify({ ciphertext, iv })).toString('base64')
}

/**
 * Decode a totp_verified cookie value. Returns the userId or null if tampered/invalid.
 */
export function decodeTotpVerifiedCookie(value: string): string | null {
  try {
    const { ciphertext, iv } = JSON.parse(Buffer.from(value, 'base64').toString('utf8'))
    return decrypt(ciphertext, iv)
  } catch {
    return null
  }
}
