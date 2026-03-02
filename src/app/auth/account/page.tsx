import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { ChangePasswordForm } from '@/components/app/auth/ChangePasswordForm'
import { ManageTotpSection } from '@/components/app/auth/ManageTotpSection'

export default async function AccountPage() {
  const session = await getAuthSession()

  if (!session?.user) redirect('/auth/login')
  if (session.user.totpEnabled && !session.user.totpVerified) redirect('/auth/totp')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-lg mx-auto space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <span className="font-medium">{session.user.email}</span>
          </p>
        </div>

        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">Change Password</h2>
          </div>
          <ChangePasswordForm />
        </section>

        <section className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
          </div>
          <ManageTotpSection totpEnabled={session.user.totpEnabled} />
        </section>
      </div>
    </div>
  )
}
