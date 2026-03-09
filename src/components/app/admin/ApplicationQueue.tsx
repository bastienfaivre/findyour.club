'use client'

import { useState, useMemo } from 'react'
import { List, FileSearch, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Application, Location, SwissLocation, SwissLocationTranslation } from '@/generated/prisma/client'
import type { Translations } from '@/lib/i18n/translations/types'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import { ApplicationDetail } from './ApplicationDetail'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type ApplicationWithRelations = Application & {
  location: (Location & {
    swissLocation: (SwissLocation & {
      translations: SwissLocationTranslation[]
    }) | null
  }) | null
}

import type { ActivityTypeOption, CountryOption, CantonOption } from './types'
export type { ActivityTypeOption, CountryOption, CantonOption } from './types'

const ALL = '__all__'

interface ApplicationQueueProps {
  applications: ApplicationWithRelations[]
  activityTypes: ActivityTypeOption[]
  countries: CountryOption[]
  cantons: CantonOption[]
  translations: Translations
  locale: string
}

export function ApplicationQueue({ applications, activityTypes, countries, cantons, translations: t, locale }: ApplicationQueueProps) {
  const { selectedApplicationId: selectedId, setSelectedApplicationId: setSelectedId } = useAdminSelection()
  const [visibleIds, setVisibleIds] = useState<Set<string>>(
    new Set(applications.map((a) => a.id))
  )
  const [activeTab, setActiveTab] = useState<'list' | 'review'>(selectedId ? 'review' : 'list')

  // Filter state
  const [filterCountry, setFilterCountry] = useState<string>(ALL)
  const [filterCanton, setFilterCanton] = useState<string>(ALL)
  const [filterActivity, setFilterActivity] = useState<string>(ALL)

  const visibleApplications = applications.filter((a) => visibleIds.has(a.id))

  // Apply client-side filters
  const filteredApplications = useMemo(() => {
    return visibleApplications.filter((app) => {
      if (filterCountry !== ALL && app.country !== filterCountry) return false
      if (filterCanton !== ALL && app.location?.swissLocation?.cantonCode !== filterCanton) return false
      if (filterActivity !== ALL && app.activityType !== filterActivity) return false
      return true
    })
  }, [visibleApplications, filterCountry, filterCanton, filterActivity])

  const selectedApplication = filteredApplications.find((a) => a.id === selectedId) ?? null

  // Show canton filter only when filtering on a country that has cantons (ch)
  const showCantonFilter = filterCountry === 'ch' || (filterCountry === ALL && visibleApplications.some((a) => a.country === 'ch'))

  // Derive available filter options from visible applications
  const availableCountries = useMemo(() => {
    const codes = new Set(visibleApplications.map((a) => a.country))
    return countries.filter((c) => codes.has(c.code))
  }, [visibleApplications, countries])

  const availableCantons = useMemo(() => {
    const codes = new Set<string>()
    for (const app of visibleApplications) {
      if (filterCountry !== ALL && app.country !== filterCountry) continue
      const code = app.location?.swissLocation?.cantonCode
      if (code) codes.add(code)
    }
    return cantons.filter((c) => codes.has(c.code))
  }, [visibleApplications, cantons, filterCountry])

  const availableActivities = useMemo(() => {
    const slugs = new Set<string>()
    for (const app of visibleApplications) {
      if (app.activityType) slugs.add(app.activityType)
    }
    return activityTypes.filter((at) => slugs.has(at.slug))
  }, [visibleApplications, activityTypes])

  const hasFilters = filterCountry !== ALL || filterCanton !== ALL || filterActivity !== ALL

  const handleCountryChange = (v: string) => {
    setFilterCountry(v)
    // Reset canton when country changes
    setFilterCanton(ALL)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setActiveTab('review')
  }

  const handleActionComplete = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setSelectedId(null)
    setActiveTab('list')
  }

  const ta = t.admin.applications
  const td = t.directory

  if (visibleApplications.length === 0) {
    return <p className="text-muted-foreground">{ta.empty}</p>
  }

  const activeCountryLabel = availableCountries.find((c) => c.code === filterCountry)?.label
  const activeCantonName = availableCantons.find((c) => c.code === filterCanton)?.name
  const activeActivityName = availableActivities.find((a) => a.slug === filterActivity)?.name

  const filtersBlock = (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-2">
        <Select value={filterCountry} onValueChange={handleCountryChange}>
          <SelectTrigger aria-label={ta.country} className="w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{ta.allCountries}</SelectItem>
            {availableCountries.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCantonFilter && availableCantons.length > 0 && (
          <Select value={filterCanton} onValueChange={setFilterCanton}>
            <SelectTrigger aria-label={td.filterCanton} className="w-auto min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{td.allCantons}</SelectItem>
              {availableCantons.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeCountryLabel && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => handleCountryChange(ALL)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCountryChange(ALL) } }}
            >
              {activeCountryLabel}
              <X className="size-3" />
            </Badge>
          )}
          {activeCantonName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => setFilterCanton(ALL)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilterCanton(ALL) } }}
            >
              {activeCantonName}
              <X className="size-3" />
            </Badge>
          )}
          {activeActivityName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => setFilterActivity(ALL)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilterActivity(ALL) } }}
            >
              {activeActivityName}
              <X className="size-3" />
            </Badge>
          )}
          <button
            type="button"
            onClick={() => { setFilterCountry(ALL); setFilterCanton(ALL); setFilterActivity(ALL) }}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {td.resetFilters}
          </button>
        </div>
      )}
    </div>
  )

  const listBlock = (
    <div className="space-y-2">
      {filteredApplications.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{td.noResults}</p>
      ) : (
        filteredApplications.map((app) => {
          const activityLabel = app.activityType
            ? (t.activityTypes[app.activityType] ?? app.activityType)
            : app.otherDescription ?? null
          const date = new Date(app.submittedAt).toLocaleDateString(locale)

          return (
            <button
              key={app.id}
              type="button"
              onClick={() => handleSelect(app.id)}
              className={cn(
                'w-full text-left rounded-lg border p-3 transition-colors',
                selectedId === app.id
                  ? 'border-primary bg-accent'
                  : 'hover:bg-muted/50'
              )}
            >
              <p className="font-medium truncate">{app.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {activityLabel && (
                  <Badge variant="secondary" className="text-xs">{activityLabel}</Badge>
                )}
                <span className="text-xs text-muted-foreground">{app.country.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{date}</span>
              </div>
            </button>
          )
        })
      )}
    </div>
  )

  const detailBlock = selectedApplication ? (
    <ApplicationDetail
      key={selectedApplication.id}
      application={selectedApplication}
      activityTypes={activityTypes}
      countries={countries}
      translations={t}
      locale={locale}
      onActionComplete={handleActionComplete}
    />
  ) : (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      {ta.selectApplication}
    </div>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      {/* Narrow: tabbed */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'review')} className="flex flex-col flex-1 min-h-0 @[56rem]:hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <List />
            {ta.title}
          </TabsTrigger>
          <TabsTrigger value="review">
            <FileSearch />
            {ta.reviewTab}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="overflow-y-auto max-w-xl">
          {filtersBlock}
          {listBlock}
        </TabsContent>
        <TabsContent value="review" className="overflow-y-auto">
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
