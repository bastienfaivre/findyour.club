import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { cookies, headers } from 'next/headers'
import { getAuthSession } from '@/server/auth'
import { getWebAuthnConfig, encodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'
import { getWebAuthnCredentialsByUser } from '@/lib/server/webauthn-queries'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST() {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (checkRateLimit(`passkey-reg:${ip}`, { windowMs: 10 * 60 * 1000, maxAttempts: 10 })) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.totpEnabled && !session.user.totpVerified) {
    return NextResponse.json({ error: 'TOTP verification required' }, { status: 403 })
  }

  const { rpID, rpName } = getWebAuthnConfig()

  const existingCredentials = await getWebAuthnCredentialsByUser(session.user.id)

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: session.user.email ?? session.user.id,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map(c => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, encodeChallengeCookie(options.challenge), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
    domain: process.env.COOKIE_DOMAIN,
  })

  return NextResponse.json(options)
}
