import Link from 'next/link'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-[52px] items-center justify-between px-10">
          <Link
            href={`/${lang}`}
            className="text-[15px] font-extrabold tracking-tight"
          >
            Clashware
          </Link>
          <nav className="flex items-center gap-7">
            <Link
              href={`/${lang}/about`}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              {t.nav.about}
            </Link>
            <Link
              href={`/${lang}/support`}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              {t.nav.support}
            </Link>
            <LanguageSwitcher currentLang={lang} />
            <Link
              href={`/${lang}/apply`}
              className="rounded-[7px] bg-primary px-4 py-[7px] text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {t.nav.apply} →
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="flex items-center justify-between px-10 py-4">
          <span className="text-xs text-muted-foreground">
            © Clashware · Civic infrastructure, not SaaS
          </span>
          <span className="flex gap-4 text-xs text-muted-foreground">
            <Link href={`/${lang}/about`} className="hover:text-foreground">
              {t.nav.about}
            </Link>
            <Link href={`/${lang}/support`} className="hover:text-foreground">
              {t.nav.support}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
