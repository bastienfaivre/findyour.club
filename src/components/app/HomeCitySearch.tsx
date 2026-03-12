'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { LocationTypeahead } from '@/components/app/admin/LocationTypeahead'
import { Button } from '@/components/ui/button'
import type { LocationInput } from '@/lib/schemas/application'

interface HomeCitySearchProps {
  lang: string
  placeholder: string
  buttonLabel: string
}

export function HomeCitySearch({ lang, placeholder, buttonLabel }: HomeCitySearchProps) {
  const router = useRouter()
  const [location, setLocation] = useState<LocationInput | null>(null)

  function navigate() {
    if (!location) return
    const params = new URLSearchParams({
      country: 'ch',
      location: location.swisstopoId,
      locationName: location.name,
    })
    if (location.cantonCode) {
      params.set('locationCanton', location.cantonCode)
    }
    router.push(`/${lang}/search?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 max-w-sm mx-auto">
      <div className="flex-1">
        <LocationTypeahead
          id="home-city-search"
          value={location}
          country="ch"
          locale={lang}
          placeholder={placeholder}
          onChange={setLocation}
        />
      </div>
      <Button size="sm" onClick={navigate} disabled={!location}>
        <Search className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  )
}
