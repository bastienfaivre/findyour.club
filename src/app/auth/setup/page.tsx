import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decodeSetupCookie, SETUP_COOKIE_NAME } from '@/lib/setup-cookie'
import { SetupPasswordForm } from '@/components/app/auth/SetupPasswordForm'
import { getAuthSession } from '@/server/auth'

export default async function SetupPage() {
  // Already authenticated — account setup is complete; send user home.
  const session = await getAuthSession()
  if (session?.user?.id) {
    redirect('/')
  }

  const cookieStore = await cookies()
  const setupCookie = cookieStore.get(SETUP_COOKIE_NAME)
  const userId = setupCookie ? decodeSetupCookie(setupCookie.value) : null

  if (!userId) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Set Your Password</h1>
          <p className="text-muted-foreground text-sm">
            Create a strong password to secure your account.
          </p>
        </div>
        <SetupPasswordForm />
      </div>
    </div>
  )
}
