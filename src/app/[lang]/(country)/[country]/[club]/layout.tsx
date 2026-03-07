import { notFound } from 'next/navigation'
import { getClubPublicData } from '@/lib/server/club-queries'
import { getAuthSession } from '@/server/auth'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { TotpEnrollmentBanner } from '@/components/app/auth/TotpEnrollmentBanner'
import { PublicLayout } from '@/components/layout/public-layout'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { lang, country, club: slug } = await params

  const club = await getClubPublicData(slug, country)
  if (!club) notFound()

  const session = await getAuthSession()
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  const clubBase = `/${lang}/${country}/${slug}`

  const navItems = [
    { label: t.clubSite.home, href: clubBase },
    ...club.pages.map((page) => ({
      label: page.label,
      href: `${clubBase}/${page.slug}`,
    })),
    { label: t.clubSite.contact, href: `${clubBase}/contact` },
  ]

  return (
    <>
      {session && (
        <TotpEnrollmentBanner session={session} lang={lang} t={t.auth.banner} />
      )}
      <PublicLayout
        skipToContentLabel={t.layout.skipToContent}
        navbarProps={{
          title: club.name,
          titleHref: clubBase,
          navItems,
          ctaLabel: t.clubSite.contactCta,
          ctaHref: `${clubBase}/contact`,
          lang,
          translations: t.layout,
        }}
        footerProps={{
          lang,
          showPoweredBy: true,
        }}
      >
        {children}
      </PublicLayout>
    </>
  )
}
