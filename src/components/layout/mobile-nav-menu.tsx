'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import type { Translations } from '@/lib/i18n/translations/types'

export interface MobileNavMenuProps {
  navItems: Array<{ label: string; href: string }>
  ctaLabel?: string
  ctaHref?: string
  lang: string
  translations: Translations['layout']
}

export function MobileNavMenu({
  navItems,
  ctaLabel,
  ctaHref,
  lang,
  translations,
}: MobileNavMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuId = 'mobile-nav-menu'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label={translations.openMenu}
          aria-expanded={open}
          aria-controls={menuId}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" id={menuId} className="w-[280px] p-6">
        <SheetTitle className="sr-only">{translations.mainNavigation}</SheetTitle>
        <nav aria-label={translations.mainNavigation} className="flex flex-col gap-4 mt-4">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className="text-sm text-muted-foreground hover:text-foreground py-2"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
          <div className="py-2">
            <LanguageSwitcher currentLang={lang} />
          </div>
          {ctaLabel && ctaHref && (
            <SheetClose asChild>
              <Link
                href={ctaHref}
                className="rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                {ctaLabel}
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
