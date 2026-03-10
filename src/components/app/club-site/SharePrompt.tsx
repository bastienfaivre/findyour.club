'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type SharePromptProps = {
  clubName: string
  clubUrl: string
  translations: {
    sharePrompt: string
    shareButton: string
    linkCopied: string
  }
}

export function SharePrompt({ clubName, clubUrl, translations: t }: SharePromptProps) {
  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: clubName, url: clubUrl })
      } catch {
        // User cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(clubUrl)
      toast.success(t.linkCopied)
    }
  }

  return (
    <div className="mt-12 flex items-center justify-between rounded-lg border bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">{t.sharePrompt}</p>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        {t.shareButton}
      </Button>
    </div>
  )
}
