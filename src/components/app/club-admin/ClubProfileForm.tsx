'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { clubProfileSaveSchema, type ClubProfileSaveInput } from '@/lib/schemas/club'
import { saveClubProfile, type SaveClubProfileResult } from '@/app/[lang]/(country)/[country]/[club]/admin/actions'
import { useAdminDirty } from './AdminDirtyContext'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { SaveBar } from './SaveBar'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { LogoUpload } from './LogoUpload'
import { PhotoGallery } from './PhotoGallery'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Translations } from '@/lib/i18n/translations/types'

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
  logoUrl: string | null
  logoAlt: string | null
  photos: ClubPhoto[]
}

interface ClubProfileFormProps {
  lang: string
  country: string
  slug: string
  translations: Translations['club']['admin']
  initialData: ClubProfileData
}

export function ClubProfileForm({ lang, country, slug, translations: t, initialData }: ClubProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const { setIsDirty } = useAdminDirty()
  const p = t.clubProfile

  const form = useForm<ClubProfileSaveInput>({
    resolver: zodResolver(clubProfileSaveSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      schedule: initialData.schedule,
      howToJoin: initialData.howToJoin,
      contactPhone: initialData.contactPhone,
      contactAddress: initialData.contactAddress,
      externalWebsiteUrl: initialData.externalWebsiteUrl,
    },
  })

  const { register, formState: { errors, isDirty }, handleSubmit, trigger, reset } = form

  // Sync form dirty state to context for sidebar, reset on unmount
  useEffect(() => {
    setIsDirty(isDirty)
    return () => setIsDirty(false)
  }, [isDirty, setIsDirty])

  // Navigation protection
  const { showDialog, confirmNavigation, cancelNavigation } = useUnsavedChanges({ isDirty })

  const onSubmit = (data: ClubProfileSaveInput) => {
    startTransition(async () => {
      const result: SaveClubProfileResult = await saveClubProfile(lang, country, slug, data)
      if (result.success) {
        reset(data)
        toast(t.save.savedSuccessfully, {
          description: new Date(result.data.savedAt).toLocaleTimeString(),
        })
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isPending} className="space-y-6">
          <h1 className="text-2xl font-bold">{p.title}</h1>

          {/* Logo */}
          <LogoUpload
            lang={lang}
            country={country}
            slug={slug}
            logoUrl={initialData.logoUrl}
            logoAlt={initialData.logoAlt}
            translations={p.logo}
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

          {/* Contact Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{p.fields.contactEmail}</Label>
            <Input
              id="contactEmail"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">{p.fields.contactPhone}</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register('contactPhone')}
              placeholder={p.placeholders.contactPhone}
              maxLength={20}
              aria-describedby={errors.contactPhone ? 'contactPhone-error' : undefined}
              aria-invalid={!!errors.contactPhone}
            />
            {errors.contactPhone && (
              <p id="contactPhone-error" className="text-sm text-destructive">{p.validation.contactPhoneMaxLength}</p>
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
              type="url"
              {...register('externalWebsiteUrl')}
              placeholder={p.placeholders.externalWebsiteUrl}
              onBlur={() => trigger('externalWebsiteUrl')}
              aria-describedby={errors.externalWebsiteUrl ? 'externalWebsiteUrl-error' : undefined}
              aria-invalid={!!errors.externalWebsiteUrl}
            />
            {errors.externalWebsiteUrl && (
              <p id="externalWebsiteUrl-error" className="text-sm text-destructive">{p.validation.externalWebsiteUrlInvalid}</p>
            )}
          </div>

          {/* Photos */}
          <PhotoGallery
            lang={lang}
            country={country}
            slug={slug}
            photos={initialData.photos}
            translations={p.photos}
          />
        </fieldset>

        <SaveBar
          isDirty={isDirty}
          isPending={isPending}
          translations={{
            save: t.save.save,
            discard: t.save.discard,
            discardConfirmTitle: t.save.discardConfirmTitle,
            discardConfirmDescription: t.save.discardConfirmDescription,
            keepEditing: t.save.keepEditing,
          }}
          onDiscard={() => reset()}
        />
      </form>

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
    </>
  )
}
