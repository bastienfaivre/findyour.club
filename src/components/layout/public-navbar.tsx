import Link from 'next/link'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import { MobileNavMenu } from '@/components/layout/mobile-nav-menu'
import { NavLink } from '@/components/layout/nav-link'
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
      <div className="mx-auto flex h-16 max-w-[1000px] items-center gap-8 px-6 lg:px-8">
        <Link
          href={titleHref}
          className="shrink-0 text-base font-bold"
        >
          {title}
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right section */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher currentLang={lang} />
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex flex-1 justify-end lg:hidden">
          <MobileNavMenu
            navItems={navItems}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
            lang={lang}
            translations={translations}
          />
        </div>
      </div>
    </nav>
  )
}
