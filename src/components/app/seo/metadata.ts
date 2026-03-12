import type { Metadata } from 'next'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// --- Hreflang helpers ---

/** Map our lang codes to BCP 47 locale tags for hreflang */
const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-CH',
  de: 'de-CH',
  it: 'it-CH',
  en: 'en',
}

/**
 * Build hreflang alternate links for all supported languages.
 * `pathWithoutLang` should start with "/" (e.g. "/search", "/ch/ski-club").
 * The current language's URL is used as the canonical.
 */
function buildAlternates(lang: string, pathWithoutLang: string) {
  const canonical = `${BASE_URL}/${lang}${pathWithoutLang}`
  const languages: Record<string, string> = {}
  for (const l of SUPPORTED_LANGUAGES) {
    languages[LOCALE_MAP[l] ?? l] = `${BASE_URL}/${l}${pathWithoutLang}`
  }
  // x-default points to the English version
  languages['x-default'] = `${BASE_URL}/en${pathWithoutLang}`
  return { canonical, languages }
}

// --- Platform metadata ---

type PlatformMetadataOptions = {
  title: string
  description: string
  path: string
  lang: string
}

export function generatePlatformMetadata({
  title,
  description,
  path,
  lang,
}: PlatformMetadataOptions): Metadata {
  // Extract the path portion after /{lang}
  const pathWithoutLang = path.replace(new RegExp(`^/${lang}`), '')
  const alternates = buildAlternates(lang, pathWithoutLang)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'website',
      locale: LOCALE_MAP[lang] ?? lang,
      siteName: 'findyour.club',
    },
    twitter: {
      card: 'summary_large_image',
      title: typeof title === 'string' ? title : 'findyour.club',
      description,
    },
    alternates,
    robots: 'index, follow',
  }
}

// --- Directory metadata ---

type DirectoryMetadataOptions = {
  title: string
  description: string
  path: string
  lang: string
  country: string
  filters?: Record<string, string>
}

export function generateDirectoryMetadata({
  title,
  description,
  path,
  lang,
}: DirectoryMetadataOptions): Metadata {
  const pathWithoutLang = path.replace(new RegExp(`^/${lang}`), '')
  const alternates = buildAlternates(lang, pathWithoutLang)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'website',
      locale: LOCALE_MAP[lang] ?? lang,
      siteName: 'findyour.club',
    },
    twitter: {
      card: 'summary_large_image',
      title: typeof title === 'string' ? title : 'findyour.club',
      description,
    },
    alternates,
    robots: 'index, follow',
  }
}

// --- Club metadata ---

type ClubMetadataOptions = {
  clubName: string
  clubDescription: string
  clubLogoUrl?: string | null
  clubSlug: string
  country: string
  lang: string
  activityTypeLabel?: string | null
  pageTitle?: string | null
  pageSlug?: string | null
}

export function generateClubMetadata({
  clubName,
  clubDescription,
  clubLogoUrl,
  clubSlug,
  country,
  lang,
  activityTypeLabel,
  pageTitle,
  pageSlug,
}: ClubMetadataOptions): Metadata {
  const title = pageTitle
    ? `${pageTitle} — ${clubName} — findyour.club`
    : `${clubName} — findyour.club`
  const description = clubDescription.length > 160
    ? clubDescription.slice(0, 157) + '...'
    : clubDescription

  const clubPath = `/${country}/${clubSlug}${pageSlug ? `/${pageSlug}` : ''}`
  const alternates = buildAlternates(lang, clubPath)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'website',
      locale: LOCALE_MAP[lang] ?? lang,
      siteName: 'findyour.club',
      ...(clubLogoUrl ? { images: [{ url: clubLogoUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: typeof title === 'string' ? title : clubName,
      description,
      ...(clubLogoUrl ? { images: [clubLogoUrl] } : {}),
    },
    alternates,
    robots: 'index, follow',
  }
}

// --- Category landing page metadata ---

type CategoryMetadataOptions = {
  title: string
  description: string
  lang: string
  country: string
  activity?: string
  canton?: string
}

export function generateCategoryMetadata({
  title,
  description,
  lang,
  country,
  activity,
  canton,
}: CategoryMetadataOptions): Metadata {
  let pathWithoutLang = `/${country}`
  if (canton) pathWithoutLang += `/${canton}`
  if (activity) pathWithoutLang += `/${activity}`

  const alternates = buildAlternates(lang, pathWithoutLang)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: 'website',
      locale: LOCALE_MAP[lang] ?? lang,
      siteName: 'findyour.club',
    },
    twitter: {
      card: 'summary_large_image',
      title: typeof title === 'string' ? title : 'findyour.club',
      description,
    },
    alternates,
    robots: 'index, follow',
  }
}

// --- JSON-LD Schemas ---

type ClubJsonLdOptions = ClubMetadataOptions & {
  countryName: string
  activityTypeLabel?: string | null
  locationName?: string | null
  cantonName?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  email?: string | null
  schedule?: string | null
}

/**
 * Generate JSON-LD structured data for a club page.
 * Uses SportsClub (schema.org subtype of Organization) for sports clubs,
 * with additional LocalBusiness signals for local search visibility.
 */
export function generateClubJsonLd({
  clubName,
  clubDescription,
  clubLogoUrl,
  clubSlug,
  country,
  lang,
  countryName,
  activityTypeLabel,
  locationName,
  cantonName,
  contactPhone,
  contactAddress,
  email,
}: ClubJsonLdOptions): Record<string, unknown> {
  const url = `${BASE_URL}/${lang}/${country}/${clubSlug}`

  const addressParts: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressCountry: country.toUpperCase(),
  }
  if (cantonName) addressParts.addressRegion = cantonName
  if (locationName) addressParts.addressLocality = locationName
  if (contactAddress) addressParts.streetAddress = contactAddress

  return {
    '@context': 'https://schema.org',
    '@type': ['SportsClub', 'LocalBusiness'],
    name: clubName,
    url,
    ...(clubLogoUrl ? { logo: clubLogoUrl, image: clubLogoUrl } : {}),
    description: clubDescription,
    ...(activityTypeLabel ? { sport: activityTypeLabel } : {}),
    ...(email ? { email } : {}),
    ...(contactPhone ? { telephone: contactPhone } : {}),
    address: addressParts,
    areaServed: {
      '@type': 'Country',
      name: countryName,
    },
  }
}

/**
 * Generate BreadcrumbList JSON-LD for hierarchical navigation.
 * Helps Google display breadcrumbs in search results.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate WebSite JSON-LD with SearchAction for the platform root.
 * Enables the sitelinks search box in Google search results.
 */
export function generateWebSiteJsonLd(lang: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'findyour.club',
    url: `${BASE_URL}/${lang}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${lang}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Organization JSON-LD for the platform itself.
 */
export function generatePlatformOrgJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'findyour.club',
    url: BASE_URL,
    description: 'Find your club — the open directory for sports clubs.',
  }
}

// Re-export for convenience
export { BASE_URL }
