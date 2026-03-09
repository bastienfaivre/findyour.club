import { type NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { prisma } from '@/server/db'
import { SESSION_COOKIE_NAME } from '@/server/auth'
import { encodeTotpVerifiedCookie } from '@/lib/setup-cookie'
import { getWebAuthnConfig, decodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const challengeCookie = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)
  if (!challengeCookie) {
    return NextResponse.json({ error: 'No challenge' }, { status: 400 })
  }

  const expectedChallenge = decodeChallengeCookie(challengeCookie.value)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 })
  }

  // Clear challenge cookie (single-use)
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })

  const body: AuthenticationResponseJSON = await request.json()
  const { rpID, origin } = getWebAuthnConfig()

  const storedCredential = await prisma.webauthnCredential.findUnique({
    where: { credentialId: body.id },
    include: { user: { select: { id: true, role: true, totpEnabled: true } } },
  })

  if (!storedCredential) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 401 })
  }

  // .catch() converts throws (counter rollback, malformed payload, etc.) into a clean 400
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: storedCredential.credentialId,
      publicKey: new Uint8Array(Buffer.from(storedCredential.publicKey, 'base64')),
      counter: Number(storedCredential.counter),
      transports: storedCredential.transports as AuthenticatorTransportFuture[],
    },
  }).catch(() => null)

  if (!verification || !verification.verified) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Update counter and create session atomically (prevents counter update without session, or vice versa)
  const sessionToken = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  try {
    await prisma.$transaction(async (tx) => {
      await tx.webauthnCredential.update({
        where: { credentialId: body.id },
        data: { counter: BigInt(verification.authenticationInfo.newCounter) },
      })
      await tx.session.create({
        data: { sessionToken, userId: storedCredential.user.id, expires },
      })
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
  }

  const isProduction = process.env.NODE_ENV === 'production'
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires,
    domain: process.env.COOKIE_DOMAIN,
  })

  // Passkey = MFA-complete: set totp_verified unconditionally
  cookieStore.set('totp_verified', encodeTotpVerifiedCookie(storedCredential.user.id), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    domain: process.env.COOKIE_DOMAIN,
  })

  return NextResponse.json({ success: true, role: storedCredential.user.role })
}
