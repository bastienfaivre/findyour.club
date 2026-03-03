import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'OPERATOR') {
    redirect('/auth/login')
  }

  // Enforce TOTP challenge for operators with 2FA enrolled but not yet verified
  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect('/auth/totp')
  }

  return <>{children}</>
}
