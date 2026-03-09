import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'

interface AccountLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { lang } = await params
  const session = await getAuthSession()

  if (!session?.user) {
    redirect(`/${lang}/auth/login`)
  }

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  return <>{children}</>
}
