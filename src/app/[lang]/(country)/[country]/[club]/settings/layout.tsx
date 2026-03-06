import { redirect } from 'next/navigation'
import { getAuthSession } from '@/server/auth'

interface SettingsLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { lang } = await params
  const session = await getAuthSession()

  if (!session?.user) redirect(`/${lang}/auth/login`)

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  return <>{children}</>
}
