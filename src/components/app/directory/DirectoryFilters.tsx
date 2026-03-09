'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useTransition, useState, useCallback } from 'react'
import { useSearchState } from '@/components/app/SearchStateContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { countryCodeToFlag } from '@/lib/country'
import { LocationTypeahead } from '@/components/app/admin/LocationTypeahead'
import type { LocationInput } from '@/lib/schemas/application'

type DirectoryFiltersProps = {
  countries: { code: string; name: string }[]
  cantons: { code: string; name: string }[]
  activityTypes: { slug: string; name: string }[]
  lang: string
  labels: {
    filterCountry: string
    filterCanton: string
    filterCity: string
    filterActivity: string
    allCountries: string
    allCantons: string
    allActivities: string
    resetFilters: string
  }
}

const ALL = '__all__'

export function DirectoryFilters({
  countries,
  cantons,
  activityTypes,
  lang,
  labels,
}: DirectoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { setSearchQuery } = useSearchState()

  // Keep sidebar search link in sync with current filters
  useEffect(() => {
    setSearchQuery(searchParams.toString())
  }, [searchParams, setSearchQuery])

  const currentCountry = searchParams.get('country') ?? ''
  const currentCanton = searchParams.get('canton') ?? ''
  const currentActivity = searchParams.get('activity') ?? ''
  const currentLocation = searchParams.get('location') ?? ''
  const currentLocationName = searchParams.get('locationName') ?? ''
  const hasFilters = currentCountry || currentCanton || currentActivity || currentLocation

  // Restore LocationInput from URL params
  const [locationValue, setLocationValue] = useState<LocationInput | null>(() => {
    if (currentLocation && currentLocationName) {
      return { swisstopoId: currentLocation, plz: '', cantonCode: '', name: currentLocationName }
    }
    return null
  })

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== ALL) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Clear canton when country changes (cantons are country-specific)
    if (key === 'country') {
      params.delete('canton')
      params.delete('location')
      params.delete('locationName')
      setLocationValue(null)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(`/${lang}/search${qs ? `?${qs}` : ''}`)
    })
  }

  const handleLocationChange = useCallback((loc: LocationInput | null) => {
    setLocationValue(loc)
    const params = new URLSearchParams(searchParams.toString())
    if (loc) {
      params.set('location', loc.swisstopoId)
      params.set('locationName', loc.name)
      // Clear canton — city and canton are not compatible
      params.delete('canton')
    } else {
      params.delete('location')
      params.delete('locationName')
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(`/${lang}/search${qs ? `?${qs}` : ''}`)
    })
  }, [searchParams, lang, router])

  function resetFilters() {
    setLocationValue(null)
    startTransition(() => {
      router.push(`/${lang}/search`)
    })
  }

  const activeCountry = countries.find((c) => c.code === currentCountry)
  const activeCountryName = activeCountry?.name
  const activeCantonName = cantons.find((c) => c.code === currentCanton)?.name
  const activeActivityName = activityTypes.find((a) => a.slug === currentActivity)?.name

  const showCitySearch = currentCountry === 'ch'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <Select
          value={currentCountry || ALL}
          onValueChange={(v) => updateParams('country', v)}
        >
          <SelectTrigger aria-label={labels.filterCountry} className="w-full sm:w-auto sm:min-w-[140px]">
            <SelectValue placeholder={labels.allCountries} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{labels.allCountries}</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {countryCodeToFlag(c.code)} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {cantons.length > 0 && !currentLocation && (
          <Select
            value={currentCanton || ALL}
            onValueChange={(v) => updateParams('canton', v)}
          >
            <SelectTrigger aria-label={labels.filterCanton} className="w-full sm:w-auto sm:min-w-[140px]">
              <SelectValue placeholder={labels.allCantons} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{labels.allCantons}</SelectItem>
              {cantons.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showCitySearch && (
          <LocationTypeahead
            id="directory-city-search"
            value={locationValue}
            country={currentCountry}
            locale={lang}
            placeholder={labels.filterCity}
            onChange={handleLocationChange}
          />
        )}

        <Select
          value={currentActivity || ALL}
          onValueChange={(v) => updateParams('activity', v)}
        >
          <SelectTrigger aria-label={labels.filterActivity} className="w-full sm:w-auto sm:min-w-[140px]">
            <SelectValue placeholder={labels.allActivities} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{labels.allActivities}</SelectItem>
            {activityTypes.map((a) => (
              <SelectItem key={a.slug} value={a.slug}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeCountryName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => updateParams('country', ALL)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateParams('country', ALL)
                }
              }}
            >
              {activeCountry && countryCodeToFlag(activeCountry.code)} {activeCountryName}
              <X className="size-3" />
            </Badge>
          )}
          {activeCantonName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => updateParams('canton', ALL)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateParams('canton', ALL)
                }
              }}
            >
              {activeCantonName}
              <X className="size-3" />
            </Badge>
          )}
          {currentLocationName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => handleLocationChange(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleLocationChange(null)
                }
              }}
            >
              {currentLocationName}
              <X className="size-3" />
            </Badge>
          )}
          {activeActivityName && (
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1"
              role="button"
              tabIndex={0}
              onClick={() => updateParams('activity', ALL)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  updateParams('activity', ALL)
                }
              }}
            >
              {activeActivityName}
              <X className="size-3" />
            </Badge>
          )}
          <a
            href={`/${lang}/search`}
            onClick={(e) => {
              e.preventDefault()
              resetFilters()
            }}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {labels.resetFilters}
          </a>
        </div>
      )}

      {isPending && (
        <div className="h-1 w-full overflow-hidden rounded bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary/50 rounded" />
        </div>
      )}
    </div>
  )
}
