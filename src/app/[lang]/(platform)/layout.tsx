import { PublicLayout } from '@/components/layout/public-layout'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <PublicLayout
      skipToContentLabel={t.layout.skipToContent}
      navbarProps={{
        title: 'Clashware',
        titleHref: `/${lang}`,
        navItems: [
          { label: t.nav.about, href: `/${lang}/about` },
          { label: t.nav.support, href: `/${lang}/support` },
        ],
        ctaLabel: t.nav.apply,
        ctaHref: `/${lang}/apply`,
        lang,
        translations: t.layout,
      }}
      footerProps={{ lang }}
    >
      {children}
    </PublicLayout>
  )
}
