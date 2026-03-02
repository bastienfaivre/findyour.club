import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { TotpForm } from '@/components/app/auth/TotpForm'

export default async function TotpChallengePage() {
  // Single getAuthSession() call: checks DB session + totp_verified cookie
  const session = await getAuthSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  // Already verified (totpEnabled=false or cookie set) → redirect to home
  if (session.user.totpVerified) {
    redirect('/my-clubs')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <TotpForm />
      </div>
    </div>
  )
}
