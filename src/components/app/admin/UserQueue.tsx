'use client'

import { useState, useMemo } from 'react'
import { List, FileSearch, Users as UsersIcon, SearchX, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Translations } from '@/lib/i18n/translations/types'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import { UserDetail } from './UserDetail'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type UserListItem = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  preferredLanguage: string | null
  role: string
  memberships: {
    role: string
    club: { id: string; name: string }
  }[]
}

type RoleFilter = '__all__' | 'OPERATOR' | 'CLUB_ADMIN'

const ALL = '__all__'

interface UserQueueProps {
  users: UserListItem[]
  translations: Translations
  locale: string
}

export function UserQueue({ users, translations: t, locale }: UserQueueProps) {
  const { selectedUserId: selectedId, setSelectedUserId: setSelectedId } = useAdminSelection()
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>(selectedId ? 'detail' : 'list')

  const [filterRole, setFilterRole] = useState<RoleFilter>(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(20)

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return users.filter((user) => {
      if (filterRole !== ALL && user.role !== filterRole) return false
      if (query) {
        const firstName = (user.firstName ?? '').toLowerCase()
        const lastName = (user.lastName ?? '').toLowerCase()
        const email = user.email.toLowerCase()
        if (!firstName.includes(query) && !lastName.includes(query) && !email.includes(query)) return false
      }
      return true
    })
  }, [users, filterRole, searchQuery])

  const paginatedUsers = filteredUsers.slice(0, pageSize)
  const hasMore = filteredUsers.length > pageSize

  const selectedUser = filteredUsers.find((u) => u.id === selectedId) ?? null

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setActiveTab('detail')
  }

  const tu = t.admin.users

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <UsersIcon className="size-10 mb-3 opacity-50" />
        <p>{tu.noUsers}</p>
      </div>
    )
  }

  const filtersBlock = (
    <div className="rounded-xl border p-4 space-y-4 mb-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPageSize(20) }}
          placeholder={t.admin.searchPlaceholder}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={filterRole} onValueChange={(v) => setFilterRole(v as RoleFilter)}>
          <SelectTrigger aria-label={tu.role} className="w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{tu.role}</SelectItem>
            <SelectItem value="OPERATOR">{tu.operator}</SelectItem>
            <SelectItem value="CLUB_ADMIN">{tu.clubAdmin}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const listBlock = (
    <div className="space-y-2">
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <SearchX className="size-8 mb-2 opacity-50" />
          <p className="text-sm">{tu.noUsers}</p>
        </div>
      ) : (
        <>
          {paginatedUsers.map((user) => {
            const hasName = user.firstName || user.lastName
            const displayName = hasName
              ? [user.firstName, user.lastName].filter(Boolean).join(' ')
              : user.email
            const managedCount = user.memberships.length

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className={cn(
                  'w-full text-left rounded-lg border p-3 transition-colors',
                  selectedId === user.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{displayName}</p>
                    {hasName && (
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    )}
                  </div>
                  {managedCount > 0 && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{managedCount} {managedCount === 1 ? 'club' : 'clubs'}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {user.role === 'OPERATOR' ? (
                    <Badge variant="secondary" className="text-xs">{tu.operator}</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">{tu.clubAdmin}</Badge>
                  )}
                </div>
              </button>
            )
          })}
          <div className="rounded-xl border p-4 flex flex-col items-center gap-2 mt-4">
            {hasMore && (
              <Button variant="outline" className="w-full" onClick={() => setPageSize((s) => s + 20)}>
                {t.admin.showMore}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {t.admin.showingCount.replace('{shown}', String(paginatedUsers.length)).replace('{total}', String(filteredUsers.length))}
            </p>
          </div>
        </>
      )}
    </div>
  )

  const detailBlock = selectedUser ? (
    <UserDetail
      key={selectedUser.id}
      user={selectedUser}
      translations={t}
      locale={locale}
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-48 text-sm text-muted-foreground">
      <FileSearch className="size-8 mb-2 opacity-40" />
      {tu.selectUser}
    </div>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      {/* Narrow: tabbed */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'detail')} className="flex flex-col flex-1 min-h-0 @[56rem]:hidden">
        <div className="rounded-xl border p-4">
          <TabsList>
            <TabsTrigger value="list">
              <List />
              {tu.title}
            </TabsTrigger>
            <TabsTrigger value="detail">
              <FileSearch />
              {tu.role}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="list" className="overflow-y-auto max-w-2xl">
          {filtersBlock}
          {listBlock}
        </TabsContent>
        <TabsContent value="detail" className="overflow-y-auto">
          {detailBlock}
        </TabsContent>
      </Tabs>

      {/* Wide: side-by-side */}
      <div className="hidden @[56rem]:flex gap-4 flex-1 min-h-0">
        <div className="w-full max-w-2xl min-w-0 overflow-y-auto">
          {filtersBlock}
          {listBlock}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          {detailBlock}
        </div>
      </div>
    </div>
  )
}
