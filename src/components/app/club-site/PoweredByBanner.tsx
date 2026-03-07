import Link from 'next/link'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'

interface PoweredByBannerProps {
  lang: string
}

export function PoweredByBanner({ lang }: PoweredByBannerProps) {
  const t = getTranslations(resolveUILang(lang))

  return (
    <div className="border-t py-4 text-center">
      <Link
        href={`/${lang}/`}
        className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        aria-label={t.clubSite.poweredByAriaLabel}
      >
        {t.clubSite.poweredBy}
      </Link>
    </div>
  )
}
