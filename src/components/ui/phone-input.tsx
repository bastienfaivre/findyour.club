'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  parsePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js'
import { cn } from '@/lib/utils'
import { countryCodeToFlag } from '@/lib/country'
import { CountryFlag } from '@/components/ui/country-flag'
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

type CountryEntry = { code: CountryCode; name: string; dial: string; flag: string }

function buildCountryList(): CountryEntry[] {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  return countryCodes
    .map((code) => ({
      code,
      name: regionNames.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`,
      flag: countryCodeToFlag(code),
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
    flag: countryCodeToFlag(code),
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

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCountry = e.target.value as CountryCode
      setCountry(newCountry)
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
    },
    [value, onChange],
  )

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
      <div className="relative flex items-center gap-1 rounded-l-md border border-input bg-muted/50 px-2 text-sm dark:bg-input/30">
        <CountryFlag code={country} className="h-3.5 w-auto" />
        <span className="text-muted-foreground text-xs">{callingCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
        <select
          value={country}
          onChange={handleCountryChange}
          disabled={disabled}
          aria-label="Country code"
          className="absolute inset-0 cursor-pointer opacity-0"
          suppressHydrationWarning
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code} suppressHydrationWarning>
              {c.flag} {c.name} ({c.dial})
            </option>
          ))}
        </select>
      </div>

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
