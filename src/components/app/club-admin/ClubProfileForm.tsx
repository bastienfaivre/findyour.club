'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'
import { saveClubProfile, type SaveClubProfileResult } from '@/app/[lang]/(dashboard)/club/[clubId]/actions'
import { useAdminDirty } from './AdminDirtyContext'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useAutosave } from '@/hooks/use-autosave'
import { SaveBar } from './SaveBar'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { LogoUpload, type LogoActions } from './LogoUpload'
import { uploadLogo, persistLogo, deleteLogo } from '@/app/[lang]/(dashboard)/club/[clubId]/actions'
// import { PhotoGallery } from './PhotoGallery' // photos disabled temporarily
import { ProfilePreview } from './ProfilePreview'
import { FormSection } from './FormSection'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Pencil, Eye, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HelpTip } from '@/components/ui/help-tip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import { VerificationCountdown } from './VerificationCountdown'
import type { Translations } from '@/lib/i18n/translations/types'
import { SocialLinksFieldset } from '@/components/app/SocialLinksFieldset'
import { WelcomeBanner } from './WelcomeBanner'

export interface ClubPhoto {
  id: string
  url: string
  alt: string
  position: number
}

export interface ClubProfileData {
  name: string
  email: string
  description: string
  schedule: string
  howToJoin: string
  contactPhone: string | null
  contactAddress: string | null
  externalWebsiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  xUrl: string | null
  tiktokUrl: string | null
  discordUrl: string | null
  youtubeUrl: string | null
  whatsappUrl: string | null
  telegramUrl: string | null
  githubUrl: string | null
  logoUrl: string | null
  logoAlt: string | null
  photos: ClubPhoto[]
}

interface ClubProfileFormProps {
  clubId: string
  translations: Translations['club']['admin']
  clubSiteTranslations: {
    contactCta: string
    visitWebsite: string
    goToPhoto: string
    closeLightbox: string
    description: string
    schedule: string
    howToJoin: string
    contactInfo: string
    email: string
    phone: string
    address: string
    photos: string
  }
  initialData: ClubProfileData
  activityType?: string | null
  activityTypeLabel?: string | null
  country?: string | null
  countryName?: string | null
  cantonCode?: string | null
  locationName?: string | null
  maxPhotos: number
  maxImageSizeBytes: number
  lastVerifiedAt: Date | null
  confirmAction: (clubId: string) => Promise<{ success: boolean; data?: { verifiedAt: string }; error?: string }>
}

export function ClubProfileForm({ clubId, translations: t, clubSiteTranslations: cs, initialData, activityType, activityTypeLabel, country, countryName, cantonCode, locationName, maxPhotos: _maxPhotos, maxImageSizeBytes, lastVerifiedAt, confirmAction }: ClubProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isConfirming, startConfirmTransition] = useTransition()
  const { setIsDirty } = useAdminDirty()
  const p = t.clubProfile

  const logoActions: LogoActions = {
    upload: uploadLogo,
    persist: persistLogo,
    remove: deleteLogo,
  }

  const form = useForm<ClubProfileSaveInput>({
    resolver: zodResolver(clubProfileSaveSchema),
    mode: 'onTouched',
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      description: initialData.description,
      schedule: initialData.schedule,
      howToJoin: initialData.howToJoin,
      contactPhone: initialData.contactPhone,
      contactAddress: initialData.contactAddress,
      externalWebsiteUrl: initialData.externalWebsiteUrl,
      instagramUrl: initialData.instagramUrl,
      facebookUrl: initialData.facebookUrl,
      xUrl: initialData.xUrl,
      tiktokUrl: initialData.tiktokUrl,
      discordUrl: initialData.discordUrl,
      youtubeUrl: initialData.youtubeUrl,
      whatsappUrl: initialData.whatsappUrl,
      telegramUrl: initialData.telegramUrl,
      githubUrl: initialData.githubUrl ?? '',
    },
  })

  const { register, formState: { errors, isDirty, isValid }, handleSubmit, reset, watch, control } = form
  const [phoneKey, setPhoneKey] = useState(0)

  // eslint-disable-next-line react-hooks/incompatible-library -- watch() is intentionally used for live preview
  const watchedValues = watch()

  // Sync form dirty state to context for sidebar, reset on unmount
  useEffect(() => {
    setIsDirty(isDirty)
    return () => setIsDirty(false)
  }, [isDirty, setIsDirty])

  // Navigation protection
  const { showDialog, confirmNavigation, cancelNavigation } = useUnsavedChanges({ isDirty })

  // Autosave to localStorage
  const getValues = form.getValues
  const { draft, clearDraft, dismissDraft } = useAutosave<ClubProfileSaveInput>(
    `club-profile-draft-${clubId}`,
    { isDirty, getCurrentValues: getValues },
  )

  const onSubmit = (data: ClubProfileSaveInput) => {
    // Normalize empty strings to null for optional nullable fields
    const normalized: ClubProfileSaveInput = {
      ...data,
      contactPhone: data.contactPhone || null,
      contactAddress: data.contactAddress || null,
      externalWebsiteUrl: data.externalWebsiteUrl || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      xUrl: data.xUrl || null,
      tiktokUrl: data.tiktokUrl || null,
      discordUrl: data.discordUrl || null,
      youtubeUrl: data.youtubeUrl || null,
      whatsappUrl: data.whatsappUrl || null,
      telegramUrl: data.telegramUrl || null,
      githubUrl: data.githubUrl || null,
    }
    startTransition(async () => {
      const result: SaveClubProfileResult = await saveClubProfile(clubId, normalized)
      if (result.success) {
        reset(normalized)
        clearDraft()
        toast(t.save.savedSuccessfully, {
          description: new Date(result.data.savedAt).toLocaleTimeString(),
        })
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleConfirmUpToDate() {
    startConfirmTransition(async () => {
      const result = await confirmAction(clubId)
      if (result.success) {
        toast(t.settings.verification.confirmSuccess)
      } else {
        toast.error(result.error ?? 'An error occurred.')
      }
    })
  }

  const previewBlock = (
    <ProfilePreview
      formValues={watchedValues}
      logoUrl={initialData.logoUrl}
      logoAlt={initialData.logoAlt}
      activityType={activityType}
      activityTypeLabel={activityTypeLabel}
      country={country}
      countryName={countryName}
      cantonCode={cantonCode}
      locationName={locationName}
      photos={[] /* photos disabled temporarily */}
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
        preview: t.clubProfile.preview,
      }}
    />
  )

  // Section completeness checks (based on watched live values + initial media data)
  const sectionsFilled = {
    identity: !!watchedValues.name,
    about: !!watchedValues.description && !!watchedValues.schedule && !!watchedValues.howToJoin,
    contact: !!watchedValues.email,
    social: !!(watchedValues.instagramUrl || watchedValues.facebookUrl || watchedValues.xUrl || watchedValues.tiktokUrl || watchedValues.discordUrl || watchedValues.youtubeUrl || watchedValues.whatsappUrl || watchedValues.telegramUrl || watchedValues.githubUrl),
    media: !!initialData.logoUrl, // photos disabled temporarily
  }
  const filledCount = Object.values(sectionsFilled).filter(Boolean).length
  const totalCount = Object.keys(sectionsFilled).length

  const formBlock = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WelcomeBanner clubId={clubId} translations={t.welcome} />

      {draft && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 tint-amber p-4 dark:border-amber-900 dark:tint-amber">
          <RotateCcw className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="flex-1 text-sm text-amber-800 dark:text-amber-300">{t.save.draftFound}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => {
              reset(draft)
              dismissDraft()
            }}
          >
            {t.save.draftRestore}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0"
            onClick={dismissDraft}
          >
            {t.save.draftDiscard}
          </Button>
        </div>
      )}

      {lastVerifiedAt && (
        <div className="mb-4">
          <VerificationCountdown lastVerifiedAt={lastVerifiedAt} t={t.settings.verification.countdown} />
        </div>
      )}

      {/* Completeness indicator */}
      <div className="mb-4 rounded-xl border p-4 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${(filledCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {p.completeness.label.replace('{filled}', String(filledCount)).replace('{total}', String(totalCount))}
        </span>
      </div>

      <fieldset disabled={isPending} className="space-y-4">

        {/* Section: Identity — Logo & Name */}
        <FormSection title={p.sections.identity} filled={sectionsFilled.identity}>
          <div className="space-y-2">
            <Label htmlFor="name">{p.fields.name} <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={p.placeholders.name}
              maxLength={200}
              aria-required="true"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">{p.validation.nameRequired}</p>
            )}
          </div>
        </FormSection>

        {/* Section: About — Description, Schedule, How to Join */}
        <FormSection title={p.sections.about} filled={sectionsFilled.about}>
          <div className="space-y-2">
            <Label htmlFor="description">{p.fields.description} <span className="text-destructive">*</span></Label>
            <p className="text-sm text-muted-foreground">{p.helpers.description}</p>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={p.placeholders.description}
              maxLength={5000}
              rows={4}
              aria-required="true"
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description.type === 'too_big' ? p.validation.descriptionMaxLength : p.validation.descriptionRequired}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">{p.fields.schedule} <span className="text-destructive">*</span></Label>
            <p className="text-sm text-muted-foreground">{p.helpers.schedule}</p>
            <Textarea
              id="schedule"
              {...register('schedule')}
              placeholder={p.placeholders.schedule}
              maxLength={2000}
              rows={3}
              aria-required="true"
              aria-describedby={errors.schedule ? 'schedule-error' : undefined}
              aria-invalid={!!errors.schedule}
            />
            {errors.schedule && (
              <p id="schedule-error" className="text-sm text-destructive">
                {errors.schedule.type === 'too_big' ? p.validation.scheduleMaxLength : p.validation.scheduleRequired}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="howToJoin">{p.fields.howToJoin} <span className="text-destructive">*</span></Label>
            <p className="text-sm text-muted-foreground">{p.helpers.howToJoin}</p>
            <Textarea
              id="howToJoin"
              {...register('howToJoin')}
              placeholder={p.placeholders.howToJoin}
              maxLength={2000}
              rows={3}
              aria-required="true"
              aria-describedby={errors.howToJoin ? 'howToJoin-error' : undefined}
              aria-invalid={!!errors.howToJoin}
            />
            {errors.howToJoin && (
              <p id="howToJoin-error" className="text-sm text-destructive">
                {errors.howToJoin.type === 'too_big' ? p.validation.howToJoinMaxLength : p.validation.howToJoinRequired}
              </p>
            )}
          </div>
        </FormSection>

        {/* Section: Contact */}
        <FormSection title={p.sections.contact} filled={sectionsFilled.contact}>
          <div className="space-y-2">
            <span className="flex items-center gap-1.5">
              <Label htmlFor="contactEmail">{p.fields.contactEmail}</Label>
              <HelpTip content={p.tips.contactEmail} />
            </span>
            <Input
              id="contactEmail"
              type="email"
              {...register('email')}
              placeholder={p.placeholders.contactEmail}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">{p.validation.emailInvalid}</p>
            )}
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5">
              <Label htmlFor="contactPhone">{p.fields.contactPhone}</Label>
              <HelpTip content={p.tips.contactPhone} />
            </span>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  key={phoneKey}
                  id="contactPhone"
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(val ?? '')}
                  placeholder={p.placeholders.contactPhone}
                  disabled={isPending}
                  aria-describedby={errors.contactPhone ? 'contactPhone-error' : undefined}
                  aria-invalid={!!errors.contactPhone}
                />
              )}
            />
            {errors.contactPhone && (
              <p id="contactPhone-error" className="text-sm text-destructive">{p.validation.contactPhoneInvalid}</p>
            )}
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5">
              <Label htmlFor="contactAddress">{p.fields.contactAddress}</Label>
              <HelpTip content={p.tips.contactAddress} />
            </span>
            <Textarea
              id="contactAddress"
              {...register('contactAddress')}
              placeholder={p.placeholders.contactAddress}
              maxLength={500}
              rows={2}
              aria-describedby={errors.contactAddress ? 'contactAddress-error' : undefined}
              aria-invalid={!!errors.contactAddress}
            />
            {errors.contactAddress && (
              <p id="contactAddress-error" className="text-sm text-destructive">{p.validation.contactAddressMaxLength}</p>
            )}
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5">
              <Label htmlFor="externalWebsiteUrl">{p.fields.externalWebsiteUrl}</Label>
              <HelpTip content={p.tips.externalWebsiteUrl} />
            </span>
            <Input
              id="externalWebsiteUrl"
              {...register('externalWebsiteUrl')}
              placeholder={p.placeholders.externalWebsiteUrl}
              aria-describedby={errors.externalWebsiteUrl ? 'externalWebsiteUrl-error' : undefined}
              aria-invalid={!!errors.externalWebsiteUrl}
            />
            {errors.externalWebsiteUrl && (
              <p id="externalWebsiteUrl-error" className="text-sm text-destructive">{p.validation.externalWebsiteUrlInvalid}</p>
            )}
          </div>
        </FormSection>

        {/* Section: Social Media */}
        <FormSection title={p.sections.social} filled={sectionsFilled.social}>
          <SocialLinksFieldset
            label={p.fields.socialLinks}
            labelExtra={<HelpTip content={p.tips.socialLinks} />}
            renderInput={(platform) => (
              <Input
                id={platform.key}
                {...register(platform.key)}
                placeholder={platform.placeholder}
                aria-label={platform.label}
                aria-describedby={errors[platform.key] ? `${platform.key}-error` : undefined}
                aria-invalid={!!errors[platform.key]}
              />
            )}
          />
        </FormSection>

        {/* Section: Logo & Photos */}
        <FormSection title={p.sections.media} filled={sectionsFilled.media}>
          <LogoUpload
            clubId={clubId}
            clubName={initialData.name}
            logoUrl={initialData.logoUrl}
            logoAlt={initialData.logoAlt}
            maxImageSizeBytes={maxImageSizeBytes}
            translations={p.logo}
            actions={logoActions}
          />

          {/* TODO: re-enable when photo feature is ready
          <PhotoGallery
            clubId={clubId}
            clubName={initialData.name}
            photos={initialData.photos}
            maxPhotos={maxPhotos}
            maxImageSizeBytes={maxImageSizeBytes}
            translations={p.photos}
          />
          */}
        </FormSection>

      </fieldset>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        isValid={isValid}
        isConfirming={isConfirming}
        translations={{
          save: t.save.save,
          discard: t.save.discard,
          discardConfirmTitle: t.save.discardConfirmTitle,
          discardConfirmDescription: t.save.discardConfirmDescription,
          keepEditing: t.save.keepEditing,
          confirmUpToDate: t.settings.verification.confirmButton,
        }}
        onDiscard={() => { reset(); setPhoneKey((k) => k + 1) }}
        onConfirmUpToDate={handleConfirmUpToDate}
      />
    </form>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      <AdminPageTitle title={p.title} />
      {/* Narrow container: tabbed with shadcn Tabs */}
      <Tabs defaultValue="edit" className="flex flex-col flex-1 min-h-0 @[74rem]:hidden">
        <div className="rounded-xl border p-4">
          <TabsList>
            <TabsTrigger value="edit">
              <Pencil />
              {p.editTab}
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye />
              {p.preview}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="edit" className="overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-2xl min-w-0">{formBlock}</div>
        </TabsContent>
        <TabsContent value="preview" className="overflow-y-auto overflow-x-hidden">
          <div className="w-full">{previewBlock}</div>
        </TabsContent>
      </Tabs>

      {/* Wide container: side-by-side */}
      <div className="hidden @[74rem]:flex gap-4 flex-1 min-h-0">
        <div className="w-full max-w-2xl min-w-0 overflow-y-auto">
          {formBlock}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          {previewBlock}
        </div>
      </div>

      <UnsavedChangesDialog
        open={showDialog}
        variant="leave"
        translations={{
          leaveConfirmTitle: t.save.leaveConfirmTitle,
          leaveConfirmDescription: t.save.leaveConfirmDescription,
          stay: t.save.stay,
          leave: t.save.leave,
        }}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </div>
  )
}
