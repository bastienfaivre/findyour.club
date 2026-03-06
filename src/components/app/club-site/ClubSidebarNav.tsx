'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Translations } from '@/lib/i18n/translations'

type PageLink = {
  id: string
  slug: string
  label: string
  isAnchor: boolean
  position: number
}

export type ClubSidebarNavProps = {
  club: {
    name: string
    slug: string
    logoUrl: string | null
    logoAlt: string | null
  }
  location: string | null
  pages: PageLink[]
  clubBase: string
  currentPath: string
  isAdmin: boolean
  t: Translations['clubSite']
}

function ClubLogo({ name, logoUrl, logoAlt, size }: { name: string; logoUrl: string | null; logoAlt: string | null; size: 'sm' | 'lg' }) {
  const sizeClasses = size === 'sm' ? 'h-10 w-10' : 'h-24 w-24'
  const textClasses = size === 'sm' ? 'text-sm' : 'text-4xl'

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={logoAlt ?? name}
        width={size === 'sm' ? 40 : 96}
        height={size === 'sm' ? 40 : 96}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`flex ${sizeClasses} items-center justify-center rounded-full bg-primary text-primary-foreground ${textClasses} font-bold`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function NavLinks({ club, location, pages, clubBase, currentPath, isAdmin, t, onNavigate }: ClubSidebarNavProps & { onNavigate?: () => void }) {
  const isHomeCurrent = currentPath === clubBase || currentPath === `${clubBase}/`

  const navItems = [
    { href: clubBase, label: t.home, isCurrent: isHomeCurrent },
    ...pages.map(page => ({
      href: `${clubBase}/${page.slug}`,
      label: page.label,
      isCurrent: currentPath === `${clubBase}/${page.slug}`,
    })),
    { href: `${clubBase}/contact`, label: t.contact, isCurrent: currentPath === `${clubBase}/contact` },
  ]

  return (
    <div className="flex flex-col gap-1">
      <Link
        href={clubBase}
        className="flex items-center gap-3 px-3 py-2 mb-4"
        onClick={onNavigate}
      >
        <ClubLogo name={club.name} logoUrl={club.logoUrl} logoAlt={club.logoAlt} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold leading-tight">{club.name}</span>
          {location && (
            <span className="text-xs text-muted-foreground truncate">{location}</span>
          )}
        </div>
      </Link>

      <nav aria-label={t.navigation}>
        <ul className="flex flex-col gap-0.5">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={item.isCurrent ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-sm min-h-[44px] flex items-center transition-colors hover:bg-accent ${
                  item.isCurrent
                    ? 'font-medium border-l-2 border-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {isAdmin && (
        <div className="mt-auto pt-4">
          <Link href={`${clubBase}?edit=true`} onClick={onNavigate}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              {t.editSite}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export function ClubSidebarNav(props: ClubSidebarNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[240px] md:flex-shrink-0 md:flex-col md:border-r md:p-4 md:h-screen md:sticky md:top-0">
        <NavLinks {...props} />
      </aside>

      {/* Mobile hamburger + Sheet drawer */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={props.t.menu}
              aria-expanded={open}
              className="h-11 w-11"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-4">
            <SheetTitle className="sr-only">{props.t.navigation}</SheetTitle>
            <NavLinks {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
