'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ALLOWED_IMAGE_TYPES } from '@/lib/r2'
import type { Translations } from '@/lib/i18n/translations/types'

type UploadResult =
  | { success: true; data: { uploadUrl: string; key: string } }
  | { success: false; error: string; [key: string]: unknown }

type SimpleResult =
  | { success: true; [key: string]: unknown }
  | { success: false; error: string; [key: string]: unknown }

export interface LogoActions {
  upload: (clubId: string, contentType: string) => Promise<UploadResult>
  persist: (clubId: string, key: string, alt: string) => Promise<SimpleResult>
  remove: (clubId: string) => Promise<SimpleResult>
  updateAlt: (clubId: string, alt: string) => Promise<SimpleResult>
}

const DEFAULT_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

interface LogoUploadProps {
  clubId: string
  logoUrl: string | null
  logoAlt: string | null
  maxImageSizeBytes?: number
  translations: Translations['club']['admin']['clubProfile']['logo']
  actions: LogoActions
}

export function LogoUpload({ clubId, logoUrl, logoAlt, maxImageSizeBytes = DEFAULT_MAX_IMAGE_SIZE_BYTES, translations: t, actions }: LogoUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [altText, setAltText] = useState(logoAlt ?? '')
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      toast.error(t.errorType)
      return
    }
    if (file.size > maxImageSizeBytes) {
      toast.error(t.errorSize.replace('{sizeMb}', String(maxImageSizeBytes / (1024 * 1024))))
      return
    }

    setUploading(true)
    try {
      const result = await actions.upload(clubId, file.type)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Upload directly to R2
      const uploadResponse = await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!uploadResponse.ok) {
        toast.error(t.errorUpload)
        return
      }

      // Persist in DB
      const persistResult = await actions.persist(clubId, result.data.key, altText || file.name)
      if (!persistResult.success) {
        toast.error(persistResult.error)
        return
      }

      router.refresh()
    } catch {
      toast.error(t.errorUpload)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await actions.remove(clubId)
      if (result.success) {
        setAltText('')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleAltBlur = () => {
    if (logoUrl && altText !== (logoAlt ?? '')) {
      startTransition(async () => {
        await actions.updateAlt(clubId, altText)
        router.refresh()
      })
    }
  }

  const isLoading = isPending || uploading

  return (
    <div className="space-y-3">
      <Label>{t.title}</Label>

      <div className="flex items-start gap-4">
        {logoUrl && (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Image
              src={logoUrl}
              alt={logoAlt ?? ''}
              width={80}
              height={80}
              className="max-h-full max-w-full object-contain"
              sizes="80px"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="min-h-[44px] min-w-[44px]"
            >
              {uploading ? t.uploading : t.change}
            </Button>
            {logoUrl && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="min-h-[44px] min-w-[44px] text-destructive"
                  >
                    {t.remove}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.remove}</AlertDialogTitle>
                    <AlertDialogDescription>{t.remove}?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t.confirm}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {logoUrl && (
        <div className="space-y-2">
          <Label htmlFor="logoAlt">{t.altLabel}</Label>
          <Input
            id="logoAlt"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleAltBlur}
            placeholder={t.altPlaceholder}
          />
        </div>
      )}
    </div>
  )
}
