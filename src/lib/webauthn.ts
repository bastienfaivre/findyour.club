import { encrypt, decrypt } from '@/lib/crypto'

export function getWebAuthnConfig() {
  return {
    rpID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    rpName: process.env.WEBAUTHN_RP_NAME ?? 'Clashware',
    origin: process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000',
  }
}

/** Encrypt a challenge string for storage in an HttpOnly cookie */
export function encodeChallengeCookie(challenge: string): string {
  const { ciphertext, iv } = encrypt(challenge)
  return Buffer.from(JSON.stringify({ ciphertext, iv })).toString('base64')
}

/** Decode and recover the challenge from the cookie value. Returns null if tampered. */
export function decodeChallengeCookie(value: string): string | null {
  try {
    const { ciphertext, iv } = JSON.parse(Buffer.from(value, 'base64').toString('utf8'))
    return decrypt(ciphertext, iv)
  } catch {
    return null
  }
}

export const PASSKEY_CHALLENGE_COOKIE = 'passkey_challenge'
