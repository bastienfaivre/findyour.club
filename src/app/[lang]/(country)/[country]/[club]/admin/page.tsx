import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { ClubProfileForm } from '@/components/app/club-admin/ClubProfileForm'

interface AdminPageProps {
  params: Promise<{ lang: string; country: string; club: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { lang, country, club: slug } = await params
  const uiLang = resolveUILang(lang)
  const t = getTranslations(uiLang)

  return (
    <ClubProfileForm
      country={country}
      slug={slug}
      translations={t.club.admin}
    />
  )
}
