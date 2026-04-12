'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Eye } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Translations } from '@/lib/i18n/translations/types'
import { extractEditableFields } from '@/lib/schemas/application'
import type { ApplicationEditableFields } from '@/lib/schemas/application'
import { approveApplication, rejectApplication, saveApplication, getApplicantClubs } from '@/app/[lang]/(dashboard)/admin/applications/actions'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import type { ApplicationWithRelations } from './ApplicationQueue'
import type { ActivityTypeOption, CountryOption } from './types'
import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'
import { ApplicantSection } from './ApplicantSection'
import { ClubInformationSection } from './ClubInformationSection'
import { ApplicationActions } from './ApplicationActions'

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
  const { setSelectedClubId } = useAdminSelection()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const ta = t.admin.applications
  const cs = t.clubSite

  // Centralized form state
  const initialFields = extractEditableFields(application)
  const [fields, setFields] = useState<ApplicationEditableFields>(initialFields)
  const [message, setMessage] = useState('')

  // Existing clubs
  const [existingClubs, setExistingClubs] = useState<{ id: string; name: string; role: string }[] | null>(null)
  useEffect(() => {
    getApplicantClubs(application.email).then(setExistingClubs)
  }, [application.email])

  const navigateToClub = (clubId: string) => {
    setSelectedClubId(clubId)
    router.push(`/${locale}/admin/clubs`)
  }

  const updateField = <K extends keyof ApplicationEditableFields>(key: K, value: ApplicationEditableFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const submittedDate = new Date(application.submittedAt).toLocaleDateString(locale)

  const canApprove = fields.name.trim() && fields.email.trim() && fields.description.trim() && fields.desiredSlug.trim() && fields.activityType !== 'other'

  const buildTrimmedFields = (): ApplicationEditableFields => ({
    applicantFirstName: fields.applicantFirstName?.trim() || null,
    applicantLastName: fields.applicantLastName?.trim() || null,
    email: fields.email.trim(),
    applicantPhone: fields.applicantPhone?.trim() || null,
    applicantPreferredLanguage: fields.applicantPreferredLanguage,
    name: fields.name.trim(),
    clubEmail: fields.clubEmail?.trim() || null,
    country: fields.country,
    activityType: fields.activityType,
    otherDescription: fields.otherDescription?.trim() || null,
    location: fields.location,
    description: fields.description.trim(),
    schedule: fields.schedule?.trim() || null,
    contactPhone: fields.contactPhone?.trim() || null,
    contactAddress: fields.contactAddress?.trim() || null,
    howToJoin: fields.howToJoin?.trim() || null,
    externalWebsiteUrl: fields.externalWebsiteUrl?.trim() || null,
    instagramUrl: fields.instagramUrl?.trim() || null,
    facebookUrl: fields.facebookUrl?.trim() || null,
    xUrl: fields.xUrl?.trim() || null,
    tiktokUrl: fields.tiktokUrl?.trim() || null,
    discordUrl: fields.discordUrl?.trim() || null,
    youtubeUrl: fields.youtubeUrl?.trim() || null,
    whatsappUrl: fields.whatsappUrl?.trim() || null,
    telegramUrl: fields.telegramUrl?.trim() || null,
    githubUrl: fields.githubUrl?.trim() || null,
    desiredSlug: fields.desiredSlug.trim(),
  })

  const handleApprove = () => {
    setError(null)
    setApproveDialogOpen(false)
    startTransition(async () => {
      const trimmedFields = buildTrimmedFields()
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

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const trimmedFields = buildTrimmedFields()
      const result = await saveApplication(application.id, trimmedFields)
      if (result.success) {
        toast.success(ta.changesSaved)
        router.refresh()
      } else {
        const key = ERROR_CODE_MAP[result.code]
        setError(key ? ta.errors[key] : result.error)
      }
    })
  }

  const formBlock = (
    <div className="space-y-4">
      {/* Read-only metadata */}
      <div className="rounded-xl border p-4">
        <span className="text-sm text-muted-foreground">{ta.submittedAt}: {submittedDate}</span>
      </div>

      {/* Editable fields */}
      <fieldset disabled={isPending} className="space-y-4">
        <ApplicantSection
          fields={fields}
          existingClubs={existingClubs}
          isPending={isPending}
          translations={t}
          updateField={updateField}
          navigateToClub={navigateToClub}
        />

        <ClubInformationSection
          fields={fields}
          activityTypes={activityTypes}
          countries={countries}
          locale={locale}
          isPending={isPending}
          translations={t}
          updateField={updateField}
        />
      </fieldset>

      <ApplicationActions
        isPending={isPending}
        canApprove={!!canApprove}
        error={error}
        message={message}
        desiredSlug={fields.desiredSlug}
        clubName={fields.name}
        approveDialogOpen={approveDialogOpen}
        rejectDialogOpen={rejectDialogOpen}
        translations={t}
        onMessageChange={setMessage}
        onSlugChange={(value) => updateField('desiredSlug', value)}
        onSave={handleSave}
        onApprove={handleApprove}
        onReject={handleReject}
        onApproveDialogOpenChange={setApproveDialogOpen}
        onRejectDialogOpenChange={setRejectDialogOpen}
      />
    </div>
  )

  const previewBlock = (
    <ProfilePreview
      formValues={{
        name: fields.name,
        email: fields.email,
        description: fields.description || '',
        schedule: fields.schedule || '',
        howToJoin: fields.howToJoin || '',
        contactPhone: fields.contactPhone || null,
        contactAddress: fields.contactAddress || null,
        externalWebsiteUrl: fields.externalWebsiteUrl || null,
        instagramUrl: fields.instagramUrl || null,
        facebookUrl: fields.facebookUrl || null,
        xUrl: fields.xUrl || null,
        tiktokUrl: fields.tiktokUrl || null,
        discordUrl: fields.discordUrl || null,
        youtubeUrl: fields.youtubeUrl || null,
        whatsappUrl: fields.whatsappUrl || null,
        telegramUrl: fields.telegramUrl || null,
        githubUrl: fields.githubUrl || null,
      }}
      logoUrl={null}
      logoAlt={null}
      activityType={fields.activityType}
      photos={[]}
      translations={{
        description: cs.description,
        schedule: cs.schedule,
        howToJoin: cs.howToJoin,
        contactInfo: cs.contactInfo,
        email: cs.email,
        phone: cs.phone,
        address: cs.address,
        visitWebsite: cs.visitWebsite,
        photos: cs.photos,
        goToPhoto: cs.goToPhoto,
        closeLightbox: cs.closeLightbox,
        contactCta: cs.contactCta,
        preview: ta.previewTab,
      }}
    />
  )

  return (
    <Tabs defaultValue="edit" className="flex flex-col h-full min-h-0">
      <div className="rounded-xl border p-4">
        <TabsList>
          <TabsTrigger value="edit">
            <Pencil />
            {ta.editTab}
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
            {ta.previewTab}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="edit" className="flex-1 min-h-0 overflow-y-auto">
        {formBlock}
      </TabsContent>
      <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto">
        {previewBlock}
      </TabsContent>
    </Tabs>
  )
}
