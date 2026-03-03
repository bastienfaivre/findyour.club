import { type NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { cookies } from 'next/headers'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getWebAuthnConfig, decodeChallengeCookie, PASSKEY_CHALLENGE_COOKIE } from '@/lib/webauthn'

export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.totpEnabled && !session.user.totpVerified) {
    return NextResponse.json({ error: 'TOTP verification required' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const challengeCookie = cookieStore.get(PASSKEY_CHALLENGE_COOKIE)
  if (!challengeCookie) {
    return NextResponse.json({ error: 'No challenge found' }, { status: 400 })
  }

  const expectedChallenge = decodeChallengeCookie(challengeCookie.value)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 })
  }

  // Clear challenge cookie immediately (single-use)
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE, '', { maxAge: 0, path: '/' })

  const { rpID, origin } = getWebAuthnConfig()
  const body: RegistrationResponseJSON = await request.json()

  // .catch() converts throws (malformed attestation, unexpected format, etc.) into a clean 400
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  }).catch(() => null)

  if (!verification || !verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

  try {
    await prisma.webauthnCredential.create({
      data: {
        userId: session.user.id,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: BigInt(credential.counter),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: body.response.transports ?? [],
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to save credential.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
