// src/lib/country.ts
const SUPPORTED_COUNTRIES = ['ch', 'fr', 'de'] as const
export type Country = typeof SUPPORTED_COUNTRIES[number]

export function isValidCountry(country: string): country is Country {
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(country)
}
