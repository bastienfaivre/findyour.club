import { getAuthSession } from '@/server/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/app/auth/LoginForm'
import { PasskeyButton } from '@/components/app/auth/PasskeyButton'

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSession()

  // Already fully authenticated → redirect to personal homepage
  // Non-TOTP users: totpVerified is always false (no cookie), so check totpEnabled too
  if (session?.user && (!session.user.totpEnabled || session.user.totpVerified)) {
    redirect('/my-clubs')
  }

  const { callbackUrl } = await searchParams
  // Only allow relative paths to prevent open-redirect attacks
  const safeCallbackUrl = callbackUrl?.startsWith('/') ? callbackUrl : undefined

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage your club site.
          </p>
        </div>
        <LoginForm callbackUrl={safeCallbackUrl} />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <PasskeyButton />
      </div>
    </div>
  )
}
