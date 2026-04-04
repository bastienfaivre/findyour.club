import { createHash } from 'crypto'

/**
 * Check whether a password has appeared in a known data breach using the
 * HaveIBeenPwned k-anonymity API. Only the first 5 characters of the SHA-1
 * hash are sent to the remote service.
 *
 * Returns `true` if the password is found in a breach, `false` otherwise.
 * If the HIBP API is unreachable, returns `false` (availability over perfect
 * security for this check).
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.slice(0, 5)
  const suffix = sha1.slice(5)

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    })
    if (res.ok) {
      const text = await res.text()
      const isPwned = text.split('\r\n').some(l => l.split(':')[0] === suffix) ||
        text.split('\n').some(l => l.split(':')[0] === suffix)
      return isPwned
    }
  } catch {
    // HIBP unavailable — proceed
  }

  return false
}
