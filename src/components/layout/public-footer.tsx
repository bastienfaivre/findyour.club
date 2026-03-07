import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PoweredByBanner } from '@/components/app/club-site/PoweredByBanner'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export interface PublicFooterProps {
  lang: string
  showPoweredBy?: boolean
}

export function PublicFooter({ lang, showPoweredBy }: PublicFooterProps) {
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold">{t.layout.platformLinks}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href={`/${lang}/about`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/support`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.nav.support}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-sm font-semibold">{t.layout.legalLinks}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.layout.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/terms`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {t.layout.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Theme toggle */}
          <div>
            <ThemeToggle translations={t.theme} />
          </div>
        </div>

        {showPoweredBy && (
          <div className="mt-8 border-t pt-6">
            <PoweredByBanner lang={lang} />
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            {t.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  )
}
