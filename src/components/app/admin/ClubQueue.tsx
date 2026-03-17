'use client'

import { useState, useMemo } from 'react'
import { List, FileSearch, Building2 as Building2Icon, SearchX, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Translations } from '@/lib/i18n/translations/types'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import { ClubDetail } from './ClubDetail'
import type { ActivityTypeOption, CountryOption } from './types'
import { Badge } from '@/components/ui/badge'
import { RemovableFilterBadge } from '@/components/ui/removable-filter-badge'
import { ClubAvatar } from '@/components/app/ClubAvatar'
import { FreshnessBadge } from '@/components/app/directory/FreshnessBadge'
import { CountryFlag, CantonFlag } from '@/components/ui/country-flag'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type ClubListItem = {
  id: string
  name: string
  slug: string
  country: string
  logoUrl: string | null
  logoAlt: string | null
  email: string
  description: string | null
  schedule: string | null
  howToJoin: string | null
  contactPhone: string | null
  contactAddress: string | null
  externalWebsiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  xUrl: string | null
  tiktokUrl: string | null
  discordUrl: string | null
  youtubeUrl: string | null
  whatsappUrl: string | null
  telegramUrl: string | null
  githubUrl: string | null
  isPublished: boolean
  forceOffline: boolean
  activityType: string | null
  location: {
    swissLocation: {
      swisstopoId: string
      plz: string
      cantonCode: string
      translations: { name: string }[]
    } | null
  } | null
  lastVerifiedAt: Date | null
  photos: { id: string; url: string; alt: string; position: number }[]
  members: {
    role: string
    user: { id: string; firstName: string | null; lastName: string | null; email: string | null }
  }[]
}

export type { ActivityTypeOption, CountryOption } from './types'

type StatusFilter = '__all__' | 'online' | 'offline' | 'moderated'

const ALL = '__all__'

interface ClubQueueProps {
  clubs: ClubListItem[]
  activityTypes: ActivityTypeOption[]
  countries: CountryOption[]
  translations: Translations
  locale: string
}

export function ClubQueue({ clubs, activityTypes, countries, translations: t, locale }: ClubQueueProps) {
  const { selectedClubId: selectedId, setSelectedClubId: setSelectedId } = useAdminSelection()
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>(selectedId ? 'detail' : 'list')

  // Filter state
  const [filterCountry, setFilterCountry] = useState<string>(ALL)
  const [filterActivity, setFilterActivity] = useState<string>(ALL)
  const [filterStatus, setFilterStatus] = useState<StatusFilter>(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(20)

  // Apply client-side filters + text search
  const filteredClubs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return clubs.filter((club) => {
      if (filterCountry !== ALL && club.country !== filterCountry) return false
      if (filterActivity !== ALL && club.activityType !== filterActivity) return false
      if (filterStatus !== ALL) {
        if (filterStatus === 'moderated' && !club.forceOffline) return false
        if (filterStatus === 'online' && (!club.isPublished || club.forceOffline)) return false
        if (filterStatus === 'offline' && (club.isPublished || club.forceOffline)) return false
      }
      if (query && !club.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [clubs, filterCountry, filterActivity, filterStatus, searchQuery])

  const paginatedClubs = filteredClubs.slice(0, pageSize)
  const hasMore = filteredClubs.length > pageSize

  const selectedClub = filteredClubs.find((c) => c.id === selectedId) ?? null

  // Derive available filter options from clubs
  const availableCountries = useMemo(() => {
    const codes = new Set(clubs.map((c) => c.country))
    return countries.filter((c) => codes.has(c.code))
  }, [clubs, countries])

  const availableActivities = useMemo(() => {
    const slugs = new Set<string>()
    for (const club of clubs) {
      if (club.activityType) slugs.add(club.activityType)
    }
    return activityTypes.filter((at) => slugs.has(at.slug))
  }, [clubs, activityTypes])

  const hasFilters = filterCountry !== ALL || filterActivity !== ALL || filterStatus !== ALL || searchQuery !== ''

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setActiveTab('detail')
  }

  const tc = t.admin.clubs
  const td = t.directory

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Building2Icon className="size-10 mb-3 opacity-50" />
        <p>{tc.noClubs}</p>
      </div>
    )
  }

  const activeCountryLabel = availableCountries.find((c) => c.code === filterCountry)?.label
  const activeActivityName = availableActivities.find((a) => a.slug === filterActivity)?.name
  const activeStatusLabel = filterStatus !== ALL
    ? (filterStatus === 'online' ? tc.online : filterStatus === 'offline' ? tc.offline : tc.moderatedOffline)
    : null

  const filtersBlock = (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPageSize(20) }}
          placeholder={t.admin.searchPlaceholder}
          aria-label={t.admin.searchPlaceholder}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger aria-label={tc.country} className="w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t.admin.applications.allCountries}</SelectItem>
            {availableCountries.map((c) => (
              <SelectItem key={c.code} value={c.code}><CountryFlag code={c.code} /> {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {availableActivities.length > 0 && (
          <Select value={filterActivity} onValueChange={setFilterActivity}>
            <SelectTrigger aria-label={td.filterActivity} className="w-auto min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{td.allActivities}</SelectItem>
              {availableActivities.map((a) => (
                <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
          <SelectTrigger aria-label={tc.status} className="w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{tc.allStatuses}</SelectItem>
            <SelectItem value="online">{tc.online}</SelectItem>
            <SelectItem value="offline">{tc.offline}</SelectItem>
            <SelectItem value="moderated">{tc.moderatedOffline}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeCountryLabel && (
            <RemovableFilterBadge onRemove={() => setFilterCountry(ALL)}>
              {activeCountryLabel}
            </RemovableFilterBadge>
          )}
          {activeActivityName && (
            <RemovableFilterBadge onRemove={() => setFilterActivity(ALL)}>
              {activeActivityName}
            </RemovableFilterBadge>
          )}
          {activeStatusLabel && (
            <RemovableFilterBadge onRemove={() => setFilterStatus(ALL)}>
              {activeStatusLabel}
            </RemovableFilterBadge>
          )}
          <button
            type="button"
            onClick={() => { setFilterCountry(ALL); setFilterActivity(ALL); setFilterStatus(ALL); setSearchQuery('') }}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {td.resetFilters}
          </button>
        </div>
      )}
    </div>
  )

  const listBlock = (
    <div className="space-y-3">
      {filteredClubs.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <SearchX className="size-8 mb-2 opacity-50" />
          <p className="text-sm">{td.noResults}</p>
        </div>
      ) : (
        <>
          {paginatedClubs.map((club) => {
            const activityLabel = club.activityType
              ? (t.activityTypes[club.activityType] ?? club.activityType)
              : null
            const locationName = club.location?.swissLocation?.translations[0]?.name ?? null
            const cantonCode = club.location?.swissLocation?.cantonCode ?? null
            const countryLabel = countries.find((c) => c.code === club.country)?.label ?? club.country
            const owner = club.members.find(m => m.role === 'OWNER')

            return (
              <button
                key={club.id}
                type="button"
                onClick={() => handleSelect(club.id)}
                className={cn(
                  'w-full text-left flex items-center gap-4 rounded-xl border p-3 transition-colors',
                  selectedId === club.id
                    ? 'border-primary bg-accent'
                    : 'hover:bg-muted/50'
                )}
              >
                <ClubAvatar name={club.name} logoUrl={club.logoUrl} logoAlt={club.logoAlt} size="lg" className="size-14 shrink-0" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-semibold truncate leading-tight">{club.name}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activityLabel && (
                      <Badge variant="secondary" className="text-xs">{activityLabel}</Badge>
                    )}
                    {club.isPublished && !club.forceOffline ? (
                      <Badge variant="success" className="text-xs">{tc.online}</Badge>
                    ) : club.forceOffline ? (
                      <Badge variant="destructive" className="text-xs">{tc.moderatedOffline}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">{tc.offline}</Badge>
                    )}
                    <FreshnessBadge
                      className="ml-auto"
                      lastVerifiedAt={club.lastVerifiedAt ?? null}
                      upToDateLabel={td.freshnessBadgeUpToDate}
                      approachingLabel={td.freshnessBadgeApproaching}
                      notVerifiedLabel={td.freshnessBadgeNotVerified}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    <CountryFlag code={club.country} /> {countryLabel}
                    {cantonCode && <>{', '}<CantonFlag code={cantonCode} /> {cantonCode.toUpperCase()}</>}
                    {locationName && <>{', '}{locationName}</>}
                    {owner && (
                      <> · {owner.user.firstName ? `${owner.user.firstName} ${owner.user.lastName}` : owner.user.email}</>
                    )}
                  </span>
                </div>
              </button>
            )
          })}
          <div className="flex flex-col items-center gap-2 pt-4">
            {hasMore && (
              <Button variant="outline" className="w-full" onClick={() => setPageSize((s) => s + 20)}>
                {t.admin.showMore}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {t.admin.showingCount.replace('{shown}', String(paginatedClubs.length)).replace('{total}', String(filteredClubs.length))}
            </p>
          </div>
        </>
      )}
    </div>
  )

  const detailBlock = selectedClub ? (
    <ClubDetail
      key={selectedClub.id}
      club={selectedClub}
      activityTypes={activityTypes}
      countries={countries}
      translations={t}
      locale={locale}
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-48 text-sm text-muted-foreground">
      <FileSearch className="size-8 mb-2 opacity-40" />
      {tc.selectClub}
    </div>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      {/* Narrow: tabbed */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'detail')} className="flex flex-col flex-1 min-h-0 @[56rem]:hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <List />
            {tc.title}
          </TabsTrigger>
          <TabsTrigger value="detail">
            <FileSearch />
            {tc.clubModeration}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="overflow-y-auto max-w-xl">
          {filtersBlock}
          {listBlock}
        </TabsContent>
        <TabsContent value="detail" className="overflow-y-auto">
          {detailBlock}
        </TabsContent>
      </Tabs>

      {/* Wide: side-by-side */}
      <div className="hidden @[56rem]:flex gap-6 flex-1 min-h-0">
        <div className="w-full max-w-xl min-w-0 overflow-y-auto">
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
