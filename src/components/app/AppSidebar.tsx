'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Home,
  Search,
  Info,
  Heart,
  ClipboardList,
  FileText,
  Building2,

  LogIn,
  LogOut,
  User,
  MessageSquare,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import { useAdminDirty } from '@/components/app/club-admin/AdminDirtyContext'
import { useSearchState } from '@/components/app/SearchStateContext'
import type { Translations } from '@/lib/i18n/translations/types'

interface ClubEntry {
  id: string
  name: string
  slug: string
  country: string
  unreadMessages: number
}

export interface AppSidebarProps {
  lang: string
  isAuthenticated: boolean
  isOperator: boolean
  clubs: ClubEntry[]
  operatorUnreadMessages: number
  translations: {
    nav: Translations['nav']
    admin: Translations['admin']
    club: Translations['club']['admin']
    layout: Translations['layout']
    theme: Translations['theme']
    auth: { accountSettings: string; logout: string }
  }
  totpEnabled: boolean
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

export function AppSidebar({
  lang,
  isAuthenticated,
  isOperator,
  clubs,
  operatorUnreadMessages,
  translations: t,
  totpEnabled,
}: AppSidebarProps) {
  const { isDirty } = useAdminDirty()
  const pathname = usePathname()
  const { searchQuery } = useSearchState()
  const [dismissedClubs, setDismissedClubs] = useState<Set<string>>(new Set())
  const basePath = `/${lang}`

  const searchHref = searchQuery ? `${basePath}/search?${searchQuery}` : `${basePath}/search`

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex-row items-center justify-between border-b border-sidebar-border px-4">
        <Link href={basePath} className="text-sm font-bold truncate">
          findyour.club
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle translations={t.theme} />
          <LanguageSwitcher currentLang={lang} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Public navigation — always visible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isItemActive(pathname, basePath, true)}>
                  <Link href={basePath}>
                    <Home />
                    <span>{t.nav.home}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/search`, false)}>
                  <Link href={searchHref}>
                    <Search />
                    <span>{t.nav.search}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/about`, false)}>
                  <Link href={`${basePath}/about`}>
                    <Info />
                    <span>{t.nav.about}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/support`, false)}>
                  <Link href={`${basePath}/support`}>
                    <Heart />
                    <span>{t.nav.support}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Show "Register a Club" for visitors or authenticated users without clubs */}
              {(!isAuthenticated || (clubs.length === 0 && !isOperator)) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/apply`, false)}>
                    <Link href={`${basePath}/apply`}>
                      <ClipboardList />
                      <span>{t.nav.apply}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operator section */}
        {isOperator && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>{t.nav.platform}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/admin/applications`, false)}>
                      <Link href={`${basePath}/admin/applications`}>
                        <FileText />
                        <span>{t.admin.applications.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/admin/clubs`, false)}>
                      <Link href={`${basePath}/admin/clubs`}>
                        <Building2 />
                        <span>{t.admin.clubs.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/admin/messages`, false)}>
                      <Link href={`${basePath}/admin/messages`}>
                        <MessageSquare />
                        <span className="flex items-center gap-2">
                          {t.admin.messages.title}
                          {operatorUnreadMessages > 0 && (
                            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" aria-hidden="true" />
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Club sections */}
        {clubs.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>{t.nav.myClubs}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clubs.map((club) => {
                    const clubPath = `${basePath}/club/${club.id}`
                    const isClubActive = isItemActive(pathname, clubPath, false)
                    const hasUnread = club.unreadMessages > 0 && !dismissedClubs.has(club.id)
                    return (
                      <Collapsible key={club.id} defaultOpen={isClubActive} className="group/collapsible">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isClubActive}>
                              <Building2 />
                              <span className="truncate">{club.name}</span>
                              {hasUnread && (
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0 group-data-[state=open]/collapsible:hidden" aria-hidden="true" />
                              )}
                              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isItemActive(pathname, clubPath, true)}>
                                  <Link href={clubPath}>
                                    <span className="flex items-center gap-2">
                                      {t.club.sidebar.clubProfile}
                                      {isItemActive(pathname, clubPath, true) && isDirty && (
                                        <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                                      )}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isItemActive(pathname, `${clubPath}/promote`, false)}>
                                  <Link href={`${clubPath}/promote`}>
                                    <span>{t.club.sidebar.promote}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isItemActive(pathname, `${clubPath}/settings`, false)}>
                                  <Link href={`${clubPath}/settings`}>
                                    <span>{t.club.sidebar.settings}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isItemActive(pathname, `${clubPath}/messages`, false)}>
                                  <Link
                                    href={`${clubPath}/messages`}
                                    onClick={() => setDismissedClubs((prev) => new Set(prev).add(club.id))}
                                  >
                                    <span className="flex items-center gap-2">
                                      {t.club.sidebar.messages}
                                      {hasUnread && (
                                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" aria-hidden="true" />
                                      )}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Account / Sign In — pinned to bottom of scrollable area */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {isAuthenticated ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/account`, false)}>
                      <Link href={`${basePath}/account`}>
                        <User />
                        <span className="flex items-center gap-2">
                          {t.auth.accountSettings}
                          {!totpEnabled && (
                            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" aria-hidden="true" />
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href={`/${lang}/auth/logout`}>
                        <LogOut />
                        <span>{t.auth.logout}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isItemActive(pathname, `${basePath}/auth/login`, false)}>
                    <Link href={`${basePath}/auth/login`}>
                      <LogIn />
                      <span>{t.nav.login}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {t.layout.copyright.replace('{year}', new Date().getFullYear().toString())}
          {' · '}
          <Link href={`/${lang}/privacy`} className="hover:text-foreground">{t.layout.privacy}</Link>
          {' · '}
          <Link href={`/${lang}/terms`} className="hover:text-foreground">{t.layout.terms}</Link>
        </p>
        <p className="text-[10px] text-muted-foreground/60 hidden md:block">
          <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-mono">⌘</kbd>{' '}
          <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-mono">B</kbd>{' '}
          {t.layout.toggleSidebar}
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
