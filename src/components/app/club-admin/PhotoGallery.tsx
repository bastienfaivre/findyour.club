'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  getPresignedUploadUrl,
  createClubPhoto,
  deleteClubPhoto,
} from '@/app/[lang]/(dashboard)/club/[clubId]/actions'
import { ALLOWED_IMAGE_TYPES } from '@/lib/r2'
import type { ClubPhoto } from './ClubProfileForm'
import type { Translations } from '@/lib/i18n/translations/types'

interface PhotoGalleryProps {
  clubId: string
  clubName: string
  photos: ClubPhoto[]
  maxPhotos: number
  maxImageSizeBytes: number
  translations: Translations['club']['admin']['clubProfile']['photos']
}

export function PhotoGallery({ clubId, clubName, photos, maxPhotos, maxImageSizeBytes, translations: t }: PhotoGalleryProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [uploadingCount, setUploadingCount] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const atLimit = photos.length >= maxPhotos
  const sizeMb = maxImageSizeBytes / (1024 * 1024)

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    // Client-side validation
    const validFiles: File[] = []
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        toast.error(`${file.name}: ${t.errorType}`)
        continue
      }
      if (file.size > maxImageSizeBytes) {
        toast.error(`${file.name}: ${t.errorSize.replace('{sizeMb}', String(sizeMb))}`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setUploadingCount(validFiles.length)

    for (const file of validFiles) {
      try {
        const urlResult = await getPresignedUploadUrl(clubId, file.type)
        if (!urlResult.success) {
          toast.error(urlResult.error)
          continue
        }

        // Upload directly to R2
        const uploadResponse = await fetch(urlResult.data.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        if (!uploadResponse.ok) {
          toast.error(`${file.name}: ${t.errorUpload}`)
          continue
        }

        // Create DB record
        const createResult = await createClubPhoto(clubId, urlResult.data.key, `${clubName} showcase image`)
        if (!createResult.success) {
          toast.error(createResult.error)
        }
      } catch {
        toast.error(`${file.name}: ${t.errorUpload}`)
      } finally {
        setUploadingCount((c) => c - 1)
      }
    }

    router.refresh()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = (photoId: string) => {
    startTransition(async () => {
      const result = await deleteClubPhoto(clubId, photoId)
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const isLoading = isPending || uploadingCount > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t.title}</Label>
        <span className="text-xs text-muted-foreground">{photos.length} / {maxPhotos}</span>
      </div>

      {/* Thumbnail grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {confirmDeleteId === photo.id ? (
                <button
                  type="button"
                  onClick={() => { setConfirmDeleteId(null); handleDelete(photo.id) }}
                  onBlur={() => setConfirmDeleteId(null)}
                  disabled={isLoading}
                  className="absolute right-1 top-1 rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground ring-2 ring-ring"
                  autoFocus
                >
                  {t.deleteConfirm}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(photo.id)}
                  disabled={isLoading}
                  className="absolute right-1 top-1 flex h-11 w-11 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t.delete}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {atLimit ? (
        <p className="text-sm text-muted-foreground">{t.maxReached.replace('{max}', String(maxPhotos))}</p>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => !isLoading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
        >
          {uploadingCount > 0 ? (
            <p className="text-sm text-muted-foreground">{t.uploading} ({uploadingCount})</p>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" className="min-h-[44px] min-w-[44px]" disabled={isLoading}>
                {t.add}
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.constraints.replace('{max}', String(maxPhotos)).replace('{sizeMb}', String(sizeMb))}
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
    </div>
  )
}
