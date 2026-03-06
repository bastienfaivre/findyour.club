'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Application, ActivityType, Location, SwissLocation, SwissLocationTranslation } from '@/generated/prisma/client'
import type { Translations } from '@/lib/i18n/translations/types'
import { approveApplication, rejectApplication } from '@/app/[lang]/admin/(protected)/applications/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export type ApplicationWithRelations = Application & {
  activityType: ActivityType | null
  location: (Location & {
    swissLocation: (SwissLocation & {
      translations: SwissLocationTranslation[]
    }) | null
  }) | null
}

interface ApplicationQueueItemProps {
  application: ApplicationWithRelations
  translations: Translations
  locale: string
  onRemove: (id: string) => void
}

const ERROR_CODE_MAP: Record<string, keyof Translations['admin']['applications']['errors']> = {
  NOT_FOUND: 'notFound',
  ALREADY_REVIEWED: 'alreadyReviewed',
  UNAUTHORIZED: 'unauthorized',
  SLUG_REQUIRED: 'slugRequired',
  SLUG_INVALID: 'slugInvalid',
  SLUG_CONFLICT: 'slugConflict',
  EMAIL_FAILED: 'emailFailed',
}

function resolveErrorMessage(t: Translations, code: string, fallback: string): string {
  const key = ERROR_CODE_MAP[code]
  return key ? t.admin.applications.errors[key] : fallback
}

export function ApplicationQueueItem({ application, translations: t, locale, onRemove }: ApplicationQueueItemProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [slug, setSlug] = useState(application.desiredSlug ?? '')
  const [approvePopoverOpen, setApprovePopoverOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  const activityTypeLabel = application.activityType
    ? (t.activityTypes[application.activityType.slug] ?? application.activityType.name)
    : application.otherDescription ?? null

  const swissLoc = application.location?.swissLocation
  const locTranslation = swissLoc?.translations[0]?.name
  const locationName = locTranslation
    ? (swissLoc?.plz ? `${locTranslation} (${swissLoc.plz})` : locTranslation)
    : null

  const descriptionTruncated = application.description.length > 120
  const displayDescription = expanded
    ? application.description
    : application.description.slice(0, 120) + (descriptionTruncated ? '…' : '')

  const submittedDate = new Date(application.submittedAt).toLocaleDateString(locale)

  const handleApprove = () => {
    setError(null)
    setAction('approve')
    setApprovePopoverOpen(false)
    startTransition(async () => {
      const result = await approveApplication(application.id, slug)
      if (result.success) {
        toast.success(t.admin.applications.approvedWithEmail.replace('{email}', application.email))
        setFadingOut(true)
        setTimeout(() => {
          onRemove(application.id)
          router.refresh()
        }, 300)
      } else {
        setError(resolveErrorMessage(t, result.code, result.error))
        setAction(null)
      }
    })
  }

  const handleReject = () => {
    setError(null)
    setAction('reject')
    setRejectDialogOpen(false)
    startTransition(async () => {
      const result = await rejectApplication(application.id, rejectReason || undefined)
      if (result.success) {
        toast.success(t.admin.applications.rejected)
        setFadingOut(true)
        setTimeout(() => {
          onRemove(application.id)
          router.refresh()
        }, 300)
      } else {
        setError(resolveErrorMessage(t, result.code, result.error))
        setAction(null)
      }
    })
  }

  const slugInputId = `slug-${application.id}`
  const rejectReasonId = `reject-reason-${application.id}`

  return (
    <Card className={cn(
      'transition-opacity duration-300',
      fadingOut && 'opacity-0'
    )}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold">{application.name}</span>
              {activityTypeLabel && <Badge variant="secondary">{activityTypeLabel}</Badge>}
            </div>

            <div>
              <button
                type="button"
                className="text-sm text-left"
                onClick={() => descriptionTruncated && setExpanded(!expanded)}
              >
                {displayDescription}
                {descriptionTruncated && (
                  <span className="ml-1 text-muted-foreground underline">
                    {expanded ? t.admin.applications.showLess : t.admin.applications.showMore}
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{t.admin.applications.email}: {application.email}</span>
              <span>{t.admin.applications.country}: {application.country.toUpperCase()}</span>
              {locationName && (
                <span>{t.admin.applications.location}: {locationName}</span>
              )}
              {application.desiredSlug && (
                <span>{t.admin.applications.desiredSlug}: /{application.desiredSlug}</span>
              )}
              <span>{t.admin.applications.submittedAt}: {submittedDate}</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Popover open={approvePopoverOpen} onOpenChange={setApprovePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  disabled={isPending}
                  aria-label={`${t.admin.applications.approve} ${application.name}`}
                >
                  {isPending && action === 'approve' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t.admin.applications.approve}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <p className="text-sm mb-4">
                  {t.admin.applications.approveConfirm.replace('{name}', application.name)}
                </p>
                <div className="space-y-2 mb-4">
                  <Label htmlFor={slugInputId}>{t.admin.applications.desiredSlug}</Label>
                  <Input
                    id={slugInputId}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t.admin.applications.desiredSlug}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setApprovePopoverOpen(false)}>
                    {t.admin.applications.keepReviewing}
                  </Button>
                  <Button size="sm" onClick={handleApprove} disabled={!slug.trim()}>
                    {t.admin.applications.confirmApprove}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  disabled={isPending}
                  aria-label={`${t.admin.applications.reject} ${application.name}`}
                >
                  {isPending && action === 'reject' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t.admin.applications.reject}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.admin.applications.rejectTitle}</DialogTitle>
                  <DialogDescription>{t.admin.applications.rejectDescription}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor={rejectReasonId}>{t.admin.applications.rejectReason}</Label>
                  <Textarea
                    id={rejectReasonId}
                    placeholder={t.admin.applications.rejectReasonPlaceholder}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={1000}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
                    {t.admin.applications.keepReviewing}
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    {t.admin.applications.confirmReject}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
