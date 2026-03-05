import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { lang } = await params
  const session = await getAuthSession()

  if (!session?.user) {
    redirect(`/${lang}/auth/login`)
  }

  if (session.user.role !== 'OPERATOR') {
    redirect(`/${lang}/auth/login`)
  }

  // Enforce TOTP challenge for operators with 2FA enrolled but not yet verified
  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  return <>{children}</>
}
