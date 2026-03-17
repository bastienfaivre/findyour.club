'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  parsePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js'
import { cn } from '@/lib/utils'
import { CountryFlag } from '@/components/ui/country-flag'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

interface PhoneInputProps {
  value: string | undefined
  onChange: (value: string) => void
  defaultCountry?: CountryCode
  placeholder?: string
  disabled?: boolean
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// Static list of country codes (deterministic, same on server and client)
const countryCodes = getCountries()

type CountryEntry = { code: CountryCode; name: string; dial: string }

function buildCountryList(): CountryEntry[] {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  return countryCodes
    .map((code) => ({
      code,
      name: regionNames.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Deterministic fallback for SSR (uses country code, not Intl.DisplayNames)
const ssrCountryList: CountryEntry[] = [...countryCodes]
  .sort()
  .map((code) => ({
    code,
    name: code,
    dial: `+${getCountryCallingCode(code)}`,
  }))

function detectCountry(e164: string): CountryCode | undefined {
  try {
    const parsed = parsePhoneNumber(e164)
    return parsed?.country
  } catch {
    return undefined
  }
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'CH',
  placeholder,
  disabled,
  id,
  ...ariaProps
}: PhoneInputProps) {
  // Use deterministic list for SSR, then switch to Intl-based names after hydration
  const [countries, setCountries] = useState<CountryEntry[]>(ssrCountryList)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration fix: SSR uses code-only names, client uses Intl.DisplayNames
    setCountries(buildCountryList())
  }, [])

  const [country, setCountry] = useState<CountryCode>(
    () => (value ? detectCountry(value) : undefined) ?? defaultCountry,
  )
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredCountries = useMemo(() => {
    if (!search) return countries
    const q = search.toLowerCase()
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dial.includes(q),
    )
  }, [countries, search])

  const nationalDisplay = useMemo(() => {
    if (!value) return ''
    try {
      const parsed = parsePhoneNumber(value)
      if (parsed) return parsed.formatNational()
    } catch { /* ignore */ }
    // Fallback: strip the country calling code prefix
    const prefix = `+${getCountryCallingCode(country)}`
    return value.startsWith(prefix) ? value.slice(prefix.length).trim() : value
  }, [value, country])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, '')
      if (!raw) {
        onChange('')
        return
      }
      const formatter = new AsYouType(country)
      formatter.input(`+${getCountryCallingCode(country)}${raw}`)
      const number = formatter.getNumber()
      onChange(number?.number?.toString() ?? '')
    },
    [country, onChange],
  )

  function selectCountry(newCountry: CountryCode) {
    setCountry(newCountry)
    setOpen(false)
    setSearch('')
    // Re-format current number with new country code
    if (value) {
      try {
        const parsed = parsePhoneNumber(value)
        if (parsed) {
          const national = parsed.nationalNumber
          const formatter = new AsYouType(newCountry)
          formatter.input(`+${getCountryCallingCode(newCountry)}${national}`)
          const number = formatter.getNumber()
          onChange(number?.number?.toString() ?? '')
          return
        }
      } catch { /* ignore */ }
    }
    onChange('')
  }

  const inputClasses = cn(
    'h-9 w-full min-w-0 rounded-md rounded-l-none border border-l-0 border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    ariaProps['aria-invalid'] &&
      'border-destructive ring-destructive/20 dark:ring-destructive/40',
  )

  const callingCode = `+${getCountryCallingCode(country)}`

  return (
    <div className="flex">
      {/* Country selector */}
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Country code"
            className="flex items-center gap-1 rounded-l-md border border-input bg-muted/50 px-2 text-sm dark:bg-input/30 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <CountryFlag code={country} className="h-3.5 w-auto" />
            <span className="text-muted-foreground text-xs">{callingCode}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            searchRef.current?.focus()
          }}
        >
          <div className="p-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => selectCountry(c.code)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                  c.code === country && 'bg-accent text-accent-foreground',
                )}
              >
                <CountryFlag code={c.code} className="h-3.5 w-auto shrink-0" />
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{c.dial}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No results</p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Number input */}
      <input
        id={id}
        type="tel"
        value={nationalDisplay}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={ariaProps['aria-invalid']}
        aria-describedby={ariaProps['aria-describedby']}
      />
    </div>
  )
}
