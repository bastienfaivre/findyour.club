// src/lib/country.ts
const SUPPORTED_COUNTRIES = ['ch', 'fr', 'de'] as const
export type Country = typeof SUPPORTED_COUNTRIES[number]

export function getCountryFromHost(host: string): Country | null {
  const subdomain = host.split('.')[0]
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(subdomain)
    ? (subdomain as Country)
    : null
}
