'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Pencil, Eye } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Translations } from '@/lib/i18n/translations/types'
import { extractEditableFields } from '@/lib/schemas/application'
import type { ApplicationEditableFields } from '@/lib/schemas/application'
import { approveApplication, rejectApplication } from '@/app/[lang]/(dashboard)/admin/applications/actions'
import type { ApplicationWithRelations } from './ApplicationQueue'
import type { ActivityTypeOption, CountryOption } from './types'
import { LocationTypeahead } from './LocationTypeahead'
import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ERROR_CODE_MAP: Record<string, keyof Translations['admin']['applications']['errors']> = {
  NOT_FOUND: 'notFound',
  ALREADY_REVIEWED: 'alreadyReviewed',
  UNAUTHORIZED: 'unauthorized',
  SLUG_REQUIRED: 'slugRequired',
  SLUG_INVALID: 'slugInvalid',
  SLUG_CONFLICT: 'slugConflict',
  EMAIL_FAILED: 'emailFailed',
}

interface ApplicationDetailProps {
  application: ApplicationWithRelations
  activityTypes: ActivityTypeOption[]
  countries: CountryOption[]
  translations: Translations
  locale: string
  onActionComplete: (id: string) => void
}

export function ApplicationDetail({ application, activityTypes, countries, translations: t, locale, onActionComplete }: ApplicationDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const ta = t.admin.applications
  const cs = t.clubSite

  // Centralized form state
  const initialFields = extractEditableFields(application)
  const [fields, setFields] = useState<ApplicationEditableFields>(initialFields)
  const [message, setMessage] = useState('')

  const updateField = <K extends keyof ApplicationEditableFields>(key: K, value: ApplicationEditableFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const submittedDate = new Date(application.submittedAt).toLocaleDateString(locale)

  const canApprove = fields.name.trim() && fields.email.trim() && fields.description.trim() && fields.desiredSlug.trim()

  const handleApprove = () => {
    setError(null)
    setApproveDialogOpen(false)
    startTransition(async () => {
      const trimmedFields: ApplicationEditableFields = {
        name: fields.name.trim(),
        email: fields.email.trim(),
        country: fields.country,
        activityType: fields.activityType,
        location: fields.location,
        description: fields.description.trim(),
        schedule: fields.schedule?.trim() || null,
        contactPhone: fields.contactPhone?.trim() || null,
        contactAddress: fields.contactAddress?.trim() || null,
        howToJoin: fields.howToJoin?.trim() || null,
        externalWebsiteUrl: fields.externalWebsiteUrl?.trim() || null,
        desiredSlug: fields.desiredSlug.trim(),
      }
      const result = await approveApplication(application.id, trimmedFields, message.trim() || undefined)
      if (result.success) {
        toast.success(ta.approvedWithEmail.replace('{email}', trimmedFields.email))
        onActionComplete(application.id)
        router.refresh()
      } else {
        const key = ERROR_CODE_MAP[result.code]
        setError(key ? ta.errors[key] : result.error)
      }
    })
  }

  const handleReject = () => {
    setError(null)
    setRejectDialogOpen(false)
    startTransition(async () => {
      const result = await rejectApplication(application.id, message.trim() || undefined)
      if (result.success) {
        toast.success(ta.rejectedWithEmail.replace('{email}', application.email))
        onActionComplete(application.id)
        router.refresh()
      } else {
        const key = ERROR_CODE_MAP[result.code]
        setError(key ? ta.errors[key] : result.error)
      }
    })
  }

  const formBlock = (
    <div className="space-y-6">
      {/* Read-only metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{ta.submittedAt}: {submittedDate}</span>
      </div>

      {/* Editable fields */}
      <fieldset disabled={isPending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="app-name">{ta.name} <span className="text-destructive">*</span></Label>
          <Input id="app-name" value={fields.name} onChange={(e) => updateField('name', e.target.value)} maxLength={200} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-email">{ta.email} <span className="text-destructive">*</span></Label>
          <Input id="app-email" type="email" value={fields.email} onChange={(e) => updateField('email', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-country">{ta.country}</Label>
          <Select value={fields.country} onValueChange={(v) => updateField('country', v)}>
            <SelectTrigger id="app-country" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-activityType">{ta.activityType}</Label>
          <Select value={fields.activityType ?? ''} onValueChange={(v) => updateField('activityType', v || null)}>
            <SelectTrigger id="app-activityType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((at) => (
                <SelectItem key={at.slug} value={at.slug}>{at.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-location">{ta.location}</Label>
          <LocationTypeahead
            id="app-location"
            value={fields.location}
            country={fields.country}
            locale={locale}
            placeholder={t.apply.placeholders.location}
            onChange={(loc) => updateField('location', loc)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-description">{ta.description} <span className="text-destructive">*</span></Label>
          <Textarea id="app-description" value={fields.description} onChange={(e) => updateField('description', e.target.value)} maxLength={1000} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-schedule">{ta.profileFields.schedule}</Label>
          <Textarea id="app-schedule" value={fields.schedule ?? ''} onChange={(e) => updateField('schedule', e.target.value)} maxLength={500} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-howToJoin">{ta.profileFields.howToJoin}</Label>
          <Textarea id="app-howToJoin" value={fields.howToJoin ?? ''} onChange={(e) => updateField('howToJoin', e.target.value)} maxLength={1000} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-contactPhone">{ta.profileFields.contactPhone}</Label>
          <PhoneInput
            id="app-contactPhone"
            value={fields.contactPhone ?? ''}
            onChange={(val) => updateField('contactPhone', val ?? '')}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-contactAddress">{ta.profileFields.contactAddress}</Label>
          <Textarea id="app-contactAddress" value={fields.contactAddress ?? ''} onChange={(e) => updateField('contactAddress', e.target.value)} maxLength={500} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-externalWebsiteUrl">{ta.profileFields.externalWebsiteUrl}</Label>
          <Input id="app-externalWebsiteUrl" value={fields.externalWebsiteUrl ?? ''} onChange={(e) => updateField('externalWebsiteUrl', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-slug">{ta.desiredSlug} <span className="text-destructive">*</span></Label>
          <Input id="app-slug" value={fields.desiredSlug} onChange={(e) => updateField('desiredSlug', e.target.value)} maxLength={60} />
        </div>
      </fieldset>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="app-message">{ta.operatorMessage.label}</Label>
        <Textarea
          id="app-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={ta.operatorMessage.placeholder}
          maxLength={1000}
          rows={3}
          disabled={isPending}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={() => setApproveDialogOpen(true)} disabled={isPending || !canApprove}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {ta.approve}
        </Button>
        <Button variant="destructive" onClick={() => setRejectDialogOpen(true)} disabled={isPending}>
          {ta.reject}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  const previewBlock = (
    <ProfilePreview
      formValues={{
        name: fields.name,
        email: fields.email,
        description: fields.description || null,
        schedule: fields.schedule || null,
        howToJoin: fields.howToJoin || null,
        contactPhone: fields.contactPhone || null,
        contactAddress: fields.contactAddress || null,
        externalWebsiteUrl: fields.externalWebsiteUrl || null,
      }}
      logoUrl={null}
      logoAlt={null}
      photos={[]}
      translations={{
        schedule: cs.schedule,
        howToJoin: cs.howToJoin,
        contactInfo: cs.contactInfo,
        email: cs.email,
        phone: cs.phone,
        address: cs.address,
        visitWebsite: cs.visitWebsite,
        photos: cs.photos,
        goToPhoto: cs.goToPhoto,
        contactCta: cs.contactCta,
        preview: ta.previewTab,
      }}
    />
  )

  return (
    <Tabs defaultValue="edit" className="flex flex-col h-full min-h-0">
      <TabsList className="mb-4">
        <TabsTrigger value="edit">
          <Pencil />
          {ta.editTab}
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye />
          {ta.previewTab}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="edit" className="flex-1 min-h-0 overflow-y-auto">
        {formBlock}
      </TabsContent>
      <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto">
        {previewBlock}
      </TabsContent>

      {/* Approve confirmation */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ta.approve}</DialogTitle>
            <DialogDescription>{ta.approveConfirm.replace('{name}', fields.name)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveDialogOpen(false)}>{ta.keepReviewing}</Button>
            <Button onClick={handleApprove}>{ta.confirmApprove}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ta.rejectTitle}</DialogTitle>
            <DialogDescription>{ta.rejectDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>{ta.keepReviewing}</Button>
            <Button variant="destructive" onClick={handleReject}>{ta.confirmReject}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
