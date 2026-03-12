'use client'

import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { useSearchState } from '@/components/app/SearchStateContext'

interface SearchBackTitleProps {
  title: string
  lang: string
  defaultCountry: string
}

export function SearchBackTitle({ title, lang, defaultCountry }: SearchBackTitleProps) {
  const { searchQuery } = useSearchState()
  const backHref = searchQuery
    ? `/${lang}/search?${searchQuery}`
    : `/${lang}/search?country=${defaultCountry}`
  return <AdminPageTitle title={title} backHref={backHref} />
}
