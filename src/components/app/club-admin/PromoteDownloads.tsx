'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PromoteTranslations = {
  badge: string
  badgeDescription: string
  qrCard: string
  qrCardDescription: string
  download: string
}

export function PromoteDownloads({
  clubId,
  translations: t,
}: {
  clubId: string
  translations: PromoteTranslations
}) {
  const items = [
    {
      title: t.badge,
      description: t.badgeDescription,
      href: `/api/club/${clubId}/badge`,
      filename: 'badge.png',
    },
    {
      title: t.qrCard,
      description: t.qrCardDescription,
      href: `/api/club/${clubId}/qr-card`,
      filename: 'qr-card.png',
    },
  ]

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div
          key={item.href}
          className="rounded-lg border bg-card p-6 text-card-foreground space-y-3"
        >
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <Button asChild variant="outline" size="sm">
            <a href={item.href} download={item.filename}>
              <Download className="mr-2 h-4 w-4" />
              {t.download}
            </a>
          </Button>
        </div>
      ))}
    </div>
  )
}
