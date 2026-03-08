'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { useAdminDirty } from './AdminDirtyContext'
import type { Translations } from '@/lib/i18n/translations/types'

export interface AdminSidebarProps {
  clubName: string
  adminBasePath: string
  publicClubPath: string
  translations: Translations['club']['admin']
}

function normalizePath(path: string) {
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function isItemActive(pathname: string, href: string, exact: boolean) {
  const normalizedPathname = normalizePath(pathname)
  const normalizedHref = normalizePath(href)
  if (exact) return normalizedPathname === normalizedHref
  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/')
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
      {label}
    </a>
  )
}

export function AdminSidebar({
  clubName,
  adminBasePath,
  publicClubPath,
  translations: t,
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false)
  const { isDirty } = useAdminDirty()
  const pathname = usePathname()
  const menuId = 'admin-sidebar-menu'

  const navItems = [
    { label: t.sidebar.clubProfile, href: adminBasePath, exact: true },
    { label: t.sidebar.settings, href: `${adminBasePath}/settings`, exact: false },
  ]

  const linkClass = (active: boolean) =>
    `block rounded-md px-3 py-2 text-sm transition-colors ${
      active
        ? 'border-l-2 border-primary font-medium text-foreground'
        : 'border-l-2 border-transparent text-muted-foreground hover:text-foreground'
    }`

  return (
    <>
      {/* Mobile hamburger */}
      <div className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.openMenu}
              aria-expanded={open}
              aria-controls={menuId}
              className="min-h-[44px] min-w-[44px]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" id={menuId} className="w-[240px] bg-card p-0 flex flex-col">
            <SheetTitle className="sr-only">{t.navigation}</SheetTitle>
            <div className="p-4">
              <p className="text-sm font-bold truncate">{clubName}</p>
            </div>
            <nav aria-label={t.navigation} className="flex-1 px-2">
              {navItems.map((item) => {
                const active = isItemActive(pathname, item.href, item.exact)
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={linkClass(active)}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {active && isDirty && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                        )}
                      </span>
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>
            <div className="border-t border-border p-4">
              <FooterLink href={publicClubPath} label={t.sidebar.viewPublicPage} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="ml-3 text-sm font-bold truncate">{clubName}</p>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <div className="p-4">
          <p className="text-sm font-bold truncate">{clubName}</p>
        </div>
        <nav aria-label={t.navigation} className="flex-1 px-2">
          {navItems.map((item) => {
            const active = isItemActive(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {active && isDirty && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-4">
          <FooterLink href={publicClubPath} label={t.sidebar.viewPublicPage} />
        </div>
      </aside>

    </>
  )
}
