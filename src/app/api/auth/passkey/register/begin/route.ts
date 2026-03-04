import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { cookies } from 'next/headers'
import { getAuthSession } from '@/server/auth'
import { getWebAuthnConfig, encodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'
import { getWebAuthnCredentialsByUser } from '@/lib/server/webauthn-queries'

export async function POST() {
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
