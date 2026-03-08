'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadLogo, persistLogo, deleteLogo, updateLogoAlt } from '@/app/[lang]/(country)/[country]/[club]/admin/actions'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/r2'
import type { Translations } from '@/lib/i18n/translations/types'

interface LogoUploadProps {
  lang: string
  country: string
  slug: string
  logoUrl: string | null
  logoAlt: string | null
  translations: Translations['club']['admin']['clubProfile']['logo']
}

export function LogoUpload({ lang, country, slug, logoUrl, logoAlt, translations: t }: LogoUploadProps) {
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
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(t.errorSize)
      return
    }

    setUploading(true)
    try {
      const result = await uploadLogo(lang, country, slug, file.type)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Upload directly to R2
      await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // Persist in DB
      const persistResult = await persistLogo(lang, country, slug, result.data.key, altText || file.name)
      if (!persistResult.success) {
        toast.error(persistResult.error)
        return
      }

      router.refresh()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLogo(lang, country, slug)
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
        await updateLogoAlt(lang, country, slug, altText)
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
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={logoUrl}
              alt={logoAlt ?? ''}
              fill
              className="object-cover"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="min-h-[44px] min-w-[44px] text-destructive"
              >
                {t.remove}
              </Button>
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
