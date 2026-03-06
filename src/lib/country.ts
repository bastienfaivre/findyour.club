// src/lib/country.ts
// To add a new country:
//   1. Add its code to SUPPORTED_COUNTRIES
//   2. Add entries to COUNTRY_NAMES for every SupportedLanguage
//   3. Add a location provider in src/app/api/locations/route.ts (currently only 'ch' is handled)
import type { SupportedLanguage } from '@/lib/i18n'

export const SUPPORTED_COUNTRIES = ['ch'] as const
export type Country = (typeof SUPPORTED_COUNTRIES)[number]

export function isValidCountry(country: string): country is Country {
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(country)
}

export const COUNTRY_NAMES: Record<SupportedLanguage, Record<Country, string>> = {
  en: { ch: 'Switzerland' },
  fr: { ch: 'Suisse' },
  de: { ch: 'Schweiz' },
  it: { ch: 'Svizzera' },
}

export function getCountryName(country: Country, lang: string): string {
  return (COUNTRY_NAMES as Record<string, Record<Country, string>>)[lang]?.[country] ?? COUNTRY_NAMES.en[country]
}
