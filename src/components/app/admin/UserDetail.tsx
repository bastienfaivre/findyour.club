'use client'

import { useRouter } from 'next/navigation'
import type { Translations } from '@/lib/i18n/translations/types'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import type { UserListItem } from './UserQueue'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface UserDetailProps {
  user: UserListItem
  translations: Translations
  locale: string
}

export function UserDetail({ user, translations: t, locale }: UserDetailProps) {
  const { setSelectedClubId } = useAdminSelection()
  const router = useRouter()
  const tu = t.admin.users

  const navigateToClub = (clubId: string) => {
    setSelectedClubId(clubId)
    router.push(`/${locale}/admin/clubs`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{tu.firstName}</p>
            <p className="text-sm">{user.firstName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tu.lastName}</p>
            <p className="text-sm">{user.lastName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tu.email}</p>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tu.phone}</p>
            <p className="text-sm">{user.phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tu.preferredLanguage}</p>
            <p className="text-sm">{user.preferredLanguage ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tu.role}</p>
            <div className="mt-0.5">
              {user.role === 'OPERATOR' ? (
                <Badge variant="secondary">{tu.operator}</Badge>
              ) : (
                <Badge variant="secondary">{tu.clubAdmin}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium">{tu.managedClubs}</h3>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tu.noManagedClubs}</p>
        ) : (
          <div className="space-y-2">
            {user.memberships.map((membership) => (
              <button
                key={membership.club.id}
                type="button"
                onClick={() => navigateToClub(membership.club.id)}
                className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{membership.club.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {membership.role === 'OWNER' ? tu.owner : tu.editor}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
