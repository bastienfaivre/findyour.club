import type { Metadata } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
  const url = `${BASE_URL}${path}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: lang,
    },
    alternates: {
      canonical: url,
    },
    robots: 'index, follow',
  }
}

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
  const url = `${BASE_URL}${path}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: lang,
    },
    alternates: {
      canonical: url,
    },
    robots: 'index, follow',
  }
}

type ClubMetadataOptions = {
  clubName: string
  clubDescription: string
  clubLogoUrl?: string | null
  clubSlug: string
  country: string
  lang: string
  activityTypeLabel?: string | null
}

type ClubJsonLdOptions = ClubMetadataOptions & {
  countryName: string
}

export function generateClubMetadata({
  clubName,
  clubDescription,
  clubLogoUrl,
  clubSlug,
  country,
  lang,
  activityTypeLabel,
}: ClubMetadataOptions): Metadata {
  const title = activityTypeLabel
    ? `${clubName} — ${activityTypeLabel}`
    : clubName
  const description = clubDescription.length > 160
    ? clubDescription.slice(0, 157) + '...'
    : clubDescription
  const url = `${BASE_URL}/${lang}/${country}/${clubSlug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: lang,
      ...(clubLogoUrl ? { images: [{ url: clubLogoUrl }] } : {}),
    },
    alternates: {
      canonical: url,
    },
    robots: 'index, follow',
  }
}

export function generateClubJsonLd({
  clubName,
  clubDescription,
  clubLogoUrl,
  clubSlug,
  country,
  lang,
  countryName,
}: ClubJsonLdOptions): Record<string, unknown> {
  const url = `${BASE_URL}/${lang}/${country}/${clubSlug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: clubName,
    url,
    ...(clubLogoUrl ? { logo: clubLogoUrl } : {}),
    description: clubDescription,
    areaServed: {
      '@type': 'Country',
      name: countryName,
    },
  }
}
