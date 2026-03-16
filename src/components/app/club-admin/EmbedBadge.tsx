'use client'

import { useState, useCallback } from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmbedBadgeProps {
  badgeUrl: string
  clubUrl: string
  clubName: string
  labels: {
    title: string
    description: string
    copySnippet: string
    copied: string
    preview: string
  }
}

export function EmbedBadge({
  badgeUrl,
  clubUrl,
  clubName,
  labels,
}: EmbedBadgeProps) {
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [bustKey, setBustKey] = useState(0)
  const [prevBadgeUrl, setPrevBadgeUrl] = useState(badgeUrl)

  // Reset on badgeUrl change (React-idiomatic derived state pattern)
  if (prevBadgeUrl !== badgeUrl) {
    setPrevBadgeUrl(badgeUrl)
    setBustKey((k) => k + 1)
    setImageLoaded(false)
  }

  const previewSrc = `${badgeUrl}?v=${bustKey}`

  const handleImageRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [])

  const escapedName = clubName
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const snippet = `<a href="${clubUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${escapedName} is on findyour.club" height="80" /></a>`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      toast.success(labels.copied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card className="py-0 gap-0">
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-sm font-medium">{labels.title}</p>
          <p className="text-sm text-muted-foreground">{labels.description}</p>
        </div>

        {/* Badge preview — cache-bust so admins always see the latest version */}
        <div className="flex items-center justify-center rounded-md border bg-muted/30 p-4 min-h-[112px]">
          {!imageLoaded && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
              ref={handleImageRef}
              src={previewSrc}
              alt={`${clubName} is on findyour.club`}
              className={`max-w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              onLoad={() => setImageLoaded(true)}
            />
        </div>

        {/* HTML snippet */}
        <div className="relative">
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed select-all">
            {snippet}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copied ? labels.copied : labels.copySnippet}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
