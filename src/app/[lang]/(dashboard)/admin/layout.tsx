import { redirect, notFound } from 'next/navigation'
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

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  if (session.user.role !== 'OPERATOR') {
    notFound()
  }

  return <>{children}</>
}
