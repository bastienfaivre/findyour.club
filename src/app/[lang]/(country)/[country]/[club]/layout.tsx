import { redirect, notFound } from 'next/navigation'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { isValidCountry } from '@/lib/country'
import { getClubBySlug } from '@/lib/server/club-queries'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { lang, country, club: slug } = await params
  const t = getTranslations(resolveUILang(lang))
  const session = await getAuthSession()

  if (!session?.user) redirect(`/${lang}/auth/login`)

  if (session.user.totpEnabled && !session.user.totpVerified) {
    redirect(`/${lang}/auth/totp`)
  }

  if (!isValidCountry(country)) notFound()

  const club = await getClubBySlug(slug, country)
  if (!club) notFound()

  const membership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId: club.id, status: 'ACTIVE' },
    select: { role: true },
  })
  if (!membership) redirect(`/${lang}/my-clubs`)

  return (
    <>
      <TotpEnrollmentBanner session={session} lang={lang} t={t.auth.banner} />
      {children}
    </>
  )
}
