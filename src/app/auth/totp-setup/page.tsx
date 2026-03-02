import QRCode from 'qrcode'
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { generateTotpSecret, generateTotpUri } from '@/lib/totp'
import { storePendingTotpSecret } from './actions'
import { TotpSetupForm } from '@/components/app/auth/TotpSetupForm'

export default async function TotpSetupPage() {
  // Only accessible from a logged-in session (the magic-link flow now creates a session
  // in setupPassword, so there is no setup_session cookie path here)
  const session = await getAuthSession()
  if (!session?.user) redirect('/auth/login')
  // For re-enrollment, the user must have passed the current TOTP challenge first.
  // A half-authenticated user (session exists but totpVerified=false) must complete
  // the challenge before they can replace their TOTP secret.
  if (session.user.totpEnabled && !session.user.totpVerified) redirect('/auth/totp')

  const userId = session.user.id

  // M5: Use the user's email as the TOTP label so authenticator apps show it clearly
  // L2: Reuse an existing pendingTotpSecret to prevent the two-tab race condition where
  //     opening the page twice overwrites the secret, making the first tab's QR stale.
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { pendingTotpSecret: true, email: true },
  })

  const email = dbUser?.email ?? session.user.email ?? userId
  let secret: string

  if (dbUser?.pendingTotpSecret) {
    // Reuse the in-progress secret so existing QR codes in other tabs remain valid
    secret = dbUser.pendingTotpSecret
  } else {
    secret = generateTotpSecret()
    await storePendingTotpSecret(userId, secret)
  }

  const uri = generateTotpUri(secret, email)
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Set Up Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-sm">
            Scan this QR code with an authenticator app (e.g. Google Authenticator, Authy), then
            enter the 6-digit code to complete setup.
          </p>
        </div>
        <TotpSetupForm qrDataUrl={qrDataUrl} secret={secret} />
      </div>
    </div>
  )
}
