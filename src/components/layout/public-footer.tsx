import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

export interface PublicFooterProps {
  lang: string
}

export function PublicFooter({ lang }: PublicFooterProps) {
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)
  const year = new Date().getFullYear().toString()

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link
            href={`/${lang}/privacy`}
            className="hover:text-foreground"
          >
            {t.layout.privacy}
          </Link>
          <Link
            href={`/${lang}/terms`}
            className="hover:text-foreground"
          >
            {t.layout.terms}
          </Link>
          <span>
            {t.layout.copyright.replace('{year}', year)}
          </span>
        </div>
        <ThemeToggle translations={t.theme} />
      </div>
    </footer>
  )
}
