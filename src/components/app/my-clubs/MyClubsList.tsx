import Link from 'next/link'
import { buildClubAdminUrl } from '@/lib/url'
import type { ClubMemberRole } from '@/generated/prisma/client'

interface ClubEntry {
  role: ClubMemberRole
  club: { slug: string; country: string; name: string; logoUrl: string | null; logoAlt: string | null }
}

export function MyClubsList({ memberships, host, lang }: { memberships: ClubEntry[]; host: string; lang: string }) {
  return (
    <ul className="space-y-3">
      {memberships.map((m) => (
        <li key={`${m.club.country}-${m.club.slug}`}>
          <Link
            href={buildClubAdminUrl(host, lang, m.club.country, m.club.slug)}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <span className="font-medium">{m.club.name}</span>
            <span
              aria-label={`Role: ${m.role === 'OWNER' ? 'Owner' : 'Editor'}`}
              className={
                m.role === 'OWNER'
                  ? 'text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800'
                  : 'text-xs font-semibold px-2 py-1 rounded bg-zinc-100 text-zinc-700'
              }
            >
              {m.role === 'OWNER' ? 'Owner' : 'Editor'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
