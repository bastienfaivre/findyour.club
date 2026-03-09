import { type NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/server/db'
import { getWebAuthnConfig, encodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'
import { getWebAuthnCredentialsByUser } from '@/lib/server/webauthn-queries'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (checkRateLimit(`passkey-auth:${ip}`, { windowMs: 10 * 60 * 1000, maxAttempts: 10 })) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }
  const { rpID } = getWebAuthnConfig()
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email : undefined

  let allowCredentials: { id: string; transports: AuthenticatorTransportFuture[] }[] = []
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (user) {
      const credentials = await getWebAuthnCredentialsByUser(user.id)
      allowCredentials = credentials.map(c => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      }))
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
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
