// otplib v13 uses a functional async API (no authenticator class)
import { generateSecret as _generateSecret, generate, verify, generateURI } from 'otplib'

/**
 * Generate a new TOTP secret for a user.
 * Returns a base32-encoded secret suitable for storage and QR encoding.
 */
export function generateTotpSecret(): string {
  return _generateSecret()
}

/**
 * Build the otpauth:// URI for QR code encoding.
 */
export function generateTotpUri(secret: string, email: string, issuer = 'Clashware'): string {
  return generateURI({ secret, label: email, issuer })
}

/**
 * Verify a 6-digit TOTP code against a stored secret.
 * Returns true if valid, false if invalid or out of window.
 */
export async function verifyTotpCode(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token })
    return result.valid === true
  } catch {
    return false
  }
}

/**
 * Generate the current TOTP code for a secret.
 * Primarily used in tests to produce valid codes.
 */
export async function generateTotpCode(secret: string): Promise<string> {
  return generate({ secret })
}
