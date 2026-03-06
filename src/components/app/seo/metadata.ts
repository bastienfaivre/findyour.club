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
