'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { LocationInput } from '@/lib/schemas/application'
import { formatLocationDisplay } from '@/lib/schemas/application'
import { Input } from '@/components/ui/input'
import type { LocationResult } from './types'

interface LocationTypeaheadProps {
  id: string
  value: LocationInput | null
  country: string
  locale: string
  placeholder: string
  onChange: (location: LocationInput | null) => void
}

export function LocationTypeahead({ id, value, country, locale, placeholder, onChange }: LocationTypeaheadProps) {
  const [query, setQuery] = useState(() =>
    value ? formatLocationDisplay(value) : ''
  )
  const [results, setResults] = useState<LocationResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectLocation = useCallback((loc: LocationResult) => {
    const locationInput: LocationInput = {
      swisstopoId: loc.swisstopoId,
      plz: loc.plz,
      cantonCode: loc.cantonCode,
      name: loc.name,
    }
    onChange(locationInput)
    setQuery(formatLocationDisplay(locationInput))
    setOpen(false)
    setResults([])
    setActiveIndex(-1)
  }, [onChange])

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations?country=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}&lang=${locale}`,
        )
        if (res.ok) {
          const data = (await res.json()) as LocationResult[]
          setResults(data)
          setOpen(data.length > 0)
          setActiveIndex(-1)
        }
      } catch {
        // silently fail — user can retry
      }
    }, 300)
  }, [locale, country])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => prev < results.length - 1 ? prev + 1 : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => prev > 0 ? prev - 1 : results.length - 1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectLocation(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [open, results, activeIndex, selectLocation])

  const listboxId = `${id}-listbox`

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        id={id}
        role="combobox"
        value={query}
        onChange={(e) => {
          const q = e.target.value
          setQuery(q)
          search(q)
          if (value) {
            onChange(null)
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!value) {
            setQuery('')
          }
        }}
        placeholder={placeholder}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {results.map((loc, index) => (
            <li
              key={`${loc.swisstopoId}-${loc.plz ?? index}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm ${
                index === activeIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectLocation(loc)
              }}
            >
              {loc.name} ({loc.cantonCode}){loc.plz ? ` — ${loc.plz}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
