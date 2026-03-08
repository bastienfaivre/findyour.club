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
import type { Translations } from '@/lib/i18n/translations/types'

interface ClubProfileFormProps {
  country: string
  slug: string
  translations: Translations['club']['admin']
}

export function ClubProfileForm({ country, slug, translations: t }: ClubProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const { setIsDirty } = useAdminDirty()

  const form = useForm<ClubProfileSaveInput>({
    resolver: zodResolver(clubProfileSaveSchema),
    defaultValues: { name: '' },
  })

  const { isDirty } = form.formState

  // Sync form dirty state to context for sidebar, reset on unmount
  useEffect(() => {
    setIsDirty(isDirty)
    return () => setIsDirty(false)
  }, [isDirty, setIsDirty])

  // Navigation protection
  const { showDialog, confirmNavigation, cancelNavigation } = useUnsavedChanges({ isDirty })

  const onSubmit = (data: ClubProfileSaveInput) => {
    startTransition(async () => {
      const result: SaveClubProfileResult = await saveClubProfile(country, slug, data)
      if (result.success) {
        form.reset(data)
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={isPending}>
          <h1 className="text-2xl font-bold">{t.clubProfile.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.clubProfile.placeholder}</p>
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
          onDiscard={() => form.reset()}
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
