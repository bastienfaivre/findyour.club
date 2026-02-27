// AES-256-GCM encryption for contact form submission bodies.
// Uses Node.js native 'crypto' module — no external dependency.
// CONTACT_ENCRYPTION_KEY must be exactly 32 ASCII characters.

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey
  const key = process.env.CONTACT_ENCRYPTION_KEY
  if (!key) {
    throw new Error('CONTACT_ENCRYPTION_KEY environment variable is not set')
  }
  if (Buffer.byteLength(key, 'utf8') !== KEY_LENGTH) {
    throw new Error(
      `CONTACT_ENCRYPTION_KEY must be exactly ${KEY_LENGTH} bytes (got ${Buffer.byteLength(key, 'utf8')})`
    )
  }
  cachedKey = Buffer.from(key, 'utf8')
  return cachedKey
}

export function encrypt(plaintext: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12) // GCM standard: 96-bit IV
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Store authTag appended to ciphertext (last 16 bytes are authTag)
  const combined = Buffer.concat([encrypted, authTag])
  return {
    ciphertext: combined.toString('base64'),
    iv: iv.toString('hex'),
  }
}

export function decrypt(ciphertext: string, iv: string): string {
  const combined = Buffer.from(ciphertext, 'base64')
  const authTag = combined.subarray(combined.length - 16)
  const encrypted = combined.subarray(0, combined.length - 16)
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, 'hex'))
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8')
}
