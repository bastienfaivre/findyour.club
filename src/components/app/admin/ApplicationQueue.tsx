'use client'

import { useState } from 'react'
import type { Translations } from '@/lib/i18n/translations/types'
import { ApplicationQueueItem } from './ApplicationQueueItem'
import type { ApplicationWithRelations } from './ApplicationQueueItem'

interface ApplicationQueueProps {
  applications: ApplicationWithRelations[]
  translations: Translations
  locale: string
}

export function ApplicationQueue({ applications, translations: t, locale }: ApplicationQueueProps) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(
    new Set(applications.map((a) => a.id))
  )

  const handleRemove = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const visibleApplications = applications.filter((a) => visibleIds.has(a.id))

  if (visibleApplications.length === 0) {
    return <p className="text-muted-foreground">{t.admin.applications.empty}</p>
  }

  return (
    <div className="space-y-4">
      {visibleApplications.map((application) => (
        <ApplicationQueueItem
          key={application.id}
          application={application}
          translations={t}
          locale={locale}
          onRemove={handleRemove}
        />
      ))}
    </div>
  )
}
