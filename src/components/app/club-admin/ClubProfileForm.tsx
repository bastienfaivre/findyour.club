'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'
import { saveClubProfile, type SaveClubProfileResult } from '@/app/[lang]/(dashboard)/club/[clubId]/actions'
import { useAdminDirty } from './AdminDirtyContext'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { SaveBar } from './SaveBar'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { LogoUpload, type LogoActions } from './LogoUpload'
import { uploadLogo, persistLogo, deleteLogo, updateLogoAlt } from '@/app/[lang]/(dashboard)/club/[clubId]/actions'
import { PhotoGallery } from './PhotoGallery'
import { ProfilePreview } from './ProfilePreview'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Pencil, Eye } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'
import type { Translations } from '@/lib/i18n/translations/types'
import { SOCIAL_PLATFORMS } from '@/lib/social-platforms'

export interface ClubPhoto {
  id: string
  url: string
  alt: string
  position: number
}

export interface ClubProfileData {
  name: string
  email: string
  description: string | null
  schedule: string | null
  howToJoin: string | null
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
    schedule: string
    howToJoin: string
    contactInfo: string
    email: string
    phone: string
    address: string
    photos: string
  }
  initialData: ClubProfileData
}

export function ClubProfileForm({ clubId, translations: t, clubSiteTranslations: cs, initialData }: ClubProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const { setIsDirty } = useAdminDirty()
  const p = t.clubProfile

  const logoActions: LogoActions = {
    upload: uploadLogo,
    persist: persistLogo,
    remove: deleteLogo,
    updateAlt: updateLogoAlt,
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

  const onSubmit = (data: ClubProfileSaveInput) => {
    // Normalize empty strings to null for optional nullable fields
    const normalized: ClubProfileSaveInput = {
      ...data,
      description: data.description || null,
      schedule: data.schedule || null,
      howToJoin: data.howToJoin || null,
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
        toast(t.save.savedSuccessfully, {
          description: new Date(result.data.savedAt).toLocaleTimeString(),
        })
      } else {
        toast.error(result.error)
      }
    })
  }

  const previewBlock = (
    <ProfilePreview
      formValues={watchedValues}
      logoUrl={initialData.logoUrl}
      logoAlt={initialData.logoAlt}
      photos={initialData.photos}
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
        preview: t.clubProfile.preview,
      }}
    />
  )

  const formBlock = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isPending} className="space-y-6">

        {/* Logo */}
        <LogoUpload
          clubId={clubId}
          logoUrl={initialData.logoUrl}
          logoAlt={initialData.logoAlt}
          translations={p.logo}
          actions={logoActions}
        />

        {/* Club Name */}
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{p.fields.description}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={p.placeholders.description}
            maxLength={5000}
            rows={4}
            aria-describedby={errors.description ? 'description-error' : undefined}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive">{p.validation.descriptionMaxLength}</p>
          )}
        </div>

        {/* Schedule */}
        <div className="space-y-2">
          <Label htmlFor="schedule">{p.fields.schedule}</Label>
          <Textarea
            id="schedule"
            {...register('schedule')}
            placeholder={p.placeholders.schedule}
            maxLength={2000}
            rows={3}
            aria-describedby={errors.schedule ? 'schedule-error' : undefined}
            aria-invalid={!!errors.schedule}
          />
          {errors.schedule && (
            <p id="schedule-error" className="text-sm text-destructive">{p.validation.scheduleMaxLength}</p>
          )}
        </div>

        {/* How to Join */}
        <div className="space-y-2">
          <Label htmlFor="howToJoin">{p.fields.howToJoin}</Label>
          <Textarea
            id="howToJoin"
            {...register('howToJoin')}
            placeholder={p.placeholders.howToJoin}
            maxLength={2000}
            rows={3}
            aria-describedby={errors.howToJoin ? 'howToJoin-error' : undefined}
            aria-invalid={!!errors.howToJoin}
          />
          {errors.howToJoin && (
            <p id="howToJoin-error" className="text-sm text-destructive">{p.validation.howToJoinMaxLength}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail">{p.fields.contactEmail}</Label>
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

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="contactPhone">{p.fields.contactPhone}</Label>
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

        {/* Contact Address */}
        <div className="space-y-2">
          <Label htmlFor="contactAddress">{p.fields.contactAddress}</Label>
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

        {/* External Website URL */}
        <div className="space-y-2">
          <Label htmlFor="externalWebsiteUrl">{p.fields.externalWebsiteUrl}</Label>
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

        {/* Social Media Links */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">{p.fields.socialLinks}</legend>
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <Input
                  id={platform.key}
                  {...register(platform.key)}
                  placeholder={platform.placeholder}
                  aria-label={platform.label}
                  aria-describedby={errors[platform.key] ? `${platform.key}-error` : undefined}
                  aria-invalid={!!errors[platform.key]}
                />
              </div>
            )
          })}
        </fieldset>

        {/* Photos */}
        <PhotoGallery
          clubId={clubId}
          clubName={initialData.name}
          photos={initialData.photos}
          translations={p.photos}
        />
      </fieldset>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        isValid={isValid}
        translations={{
          save: t.save.save,
          discard: t.save.discard,
          discardConfirmTitle: t.save.discardConfirmTitle,
          discardConfirmDescription: t.save.discardConfirmDescription,
          keepEditing: t.save.keepEditing,
        }}
        onDiscard={() => { reset(); setPhoneKey((k) => k + 1) }}
      />
    </form>
  )

  return (
    <div className="@container flex flex-col h-full min-h-0">
      <AdminPageTitle title={p.title} />
      {/* Narrow container: tabbed with shadcn Tabs */}
      <Tabs defaultValue="edit" className="flex flex-col flex-1 min-h-0 @[74rem]:hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">
            <Pencil />
            {p.editTab}
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
            {p.preview}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="overflow-y-auto">
          <div className="w-full max-w-xl min-w-0">{formBlock}</div>
        </TabsContent>
        <TabsContent value="preview" className="overflow-y-auto">
          <div className="w-full">{previewBlock}</div>
        </TabsContent>
      </Tabs>

      {/* Wide container: side-by-side */}
      <div className="hidden @[74rem]:flex gap-8 flex-1 min-h-0">
        <div className="w-full max-w-xl min-w-0 overflow-y-auto">
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
