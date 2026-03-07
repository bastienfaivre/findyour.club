import Link from 'next/link'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import { MobileNavMenu } from '@/components/layout/mobile-nav-menu'
import { NavLink } from '@/components/layout/nav-link'
import { Button } from '@/components/ui/button'
import type { Translations } from '@/lib/i18n/translations/types'

export interface PublicNavbarProps {
  title: string
  titleHref: string
  navItems: Array<{ label: string; href: string }>
  ctaLabel?: string
  ctaHref?: string
  lang: string
  translations: Translations['layout']
}

export function PublicNavbar({
  title,
  titleHref,
  navItems,
  ctaLabel,
  ctaHref,
  lang,
  translations,
}: PublicNavbarProps) {
  return (
    <nav
      aria-label={translations.mainNavigation}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
        <Link
          href={titleHref}
          className="text-[15px] font-extrabold tracking-tight"
        >
          {title}
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right section */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher currentLang={lang} />
          {ctaLabel && ctaHref && (
            <Button asChild size="sm">
              <Link href={ctaHref}>
                {ctaLabel} →
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <MobileNavMenu
          navItems={navItems}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          lang={lang}
          translations={translations}
        />
      </div>
    </nav>
  )
}
