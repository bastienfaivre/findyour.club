// src/lib/country.ts
// To add a new country:
//   1. Add its code to SUPPORTED_COUNTRIES
//   2. Add entries to COUNTRY_NAMES for every SupportedLanguage
//   3. Add a location provider in src/app/api/locations/route.ts (currently only 'ch' is handled)
import type { SupportedLanguage } from '@/lib/i18n'

export const SUPPORTED_COUNTRIES = ['ch'] as const
export type Country = (typeof SUPPORTED_COUNTRIES)[number]

export const COMING_SOON_COUNTRIES = ['fr', 'de', 'at', 'it'] as const
export type ComingSoonCountry = (typeof COMING_SOON_COUNTRIES)[number]

export function isValidCountry(country: string): country is Country {
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(country)
}

export const COUNTRY_NAMES: Record<SupportedLanguage, Record<Country, string>> = {
  en: { ch: 'Switzerland' },
  fr: { ch: 'Suisse' },
  de: { ch: 'Schweiz' },
  it: { ch: 'Svizzera' },
}

export const COMING_SOON_COUNTRY_NAMES: Record<SupportedLanguage, Record<ComingSoonCountry, string>> = {
  en: { fr: 'France', de: 'Germany', at: 'Austria', it: 'Italy' },
  fr: { fr: 'France', de: 'Allemagne', at: 'Autriche', it: 'Italie' },
  de: { fr: 'Frankreich', de: 'Deutschland', at: 'Österreich', it: 'Italien' },
  it: { fr: 'Francia', de: 'Germania', at: 'Austria', it: 'Italia' },
}

export function getComingSoonCountryName(country: ComingSoonCountry, lang: string): string {
  return (COMING_SOON_COUNTRY_NAMES as Record<string, Record<ComingSoonCountry, string>>)[lang]?.[country] ?? COMING_SOON_COUNTRY_NAMES.en[country]
}

export function getCountryName(country: Country, lang: string): string {
  return (COUNTRY_NAMES as Record<string, Record<Country, string>>)[lang]?.[country] ?? COUNTRY_NAMES.en[country]
}

export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}

const COUNTRY_DEFAULT_LANGUAGE: Record<string, string> = {
  ch: 'fr',
  fr: 'fr',
  de: 'de',
  it: 'it',
}

export function inferDefaultLanguage(country: string): string {
  return COUNTRY_DEFAULT_LANGUAGE[country] ?? 'en'
}
