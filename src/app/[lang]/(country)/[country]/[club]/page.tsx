// Club public site placeholder — full implementation in Epic 3 (Public Platform Site & Discovery)
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { resolveUILang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/translations'
import { isValidCountry } from '@/lib/country'
import { getAuthSession } from '@/server/auth'
import { getClubBySlug, getClubOwnership } from '@/lib/server/club-queries'

export default async function ClubPage({
  params,
}: {
  params: Promise<{ lang: string; country: string; club: string }>
}) {
  const { lang, country, club: slug } = await params
  const t = getTranslations(resolveUILang(lang))

  if (!isValidCountry(country)) notFound()

  const session = await getAuthSession()

  // Check if the current user is an OWNER to show the Settings link
  let isOwner = false
  if (session?.user?.id) {
    const clubRecord = await getClubBySlug(slug, country)
    if (clubRecord) {
      isOwner = !!(await getClubOwnership(session.user.id, clubRecord.id))
    }
  }

  return (
    <div>
      <h1>Club: {slug}</h1>
      <p>Country: {country}</p>
      <p>TODO: Implement in Epic 3</p>
      {isOwner && (
        <Link href={`/${lang}/${country}/${slug}/settings`} className="underline text-sm">
          {t.club.settings}
        </Link>
      )}
    </div>
  )
}
