import { notFound } from 'next/navigation'
import { isValidCountry } from '@/lib/country'
import { getClubBySlug } from '@/lib/server/club-queries'
import { getAuthSession } from '@/server/auth'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { lang, country, club: slug } = await params

  if (!isValidCountry(country)) notFound()

  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  const session = await getAuthSession()
  const t = getTranslations(resolveUILang(lang))

  return (
    <>
      {session && (
        <TotpEnrollmentBanner session={session} lang={lang} t={t.auth.banner} />
      )}
      {children}
    </>
  )
}
