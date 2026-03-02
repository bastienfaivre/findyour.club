import { getAuthSession } from '@/server/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/app/auth/LoginForm'

export default async function LoginPage() {
  const session = await getAuthSession()

  // Already fully authenticated → redirect to personal homepage
  // Non-TOTP users: totpVerified is always false (no cookie), so check totpEnabled too
  if (session?.user && (!session.user.totpEnabled || session.user.totpVerified)) {
    redirect('/my-clubs')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage your club site.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
