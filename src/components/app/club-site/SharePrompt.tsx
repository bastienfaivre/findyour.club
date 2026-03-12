'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeaderAction } from '@/components/app/admin/AdminPageTitle'

type SharePromptProps = {
  clubName: string
  clubUrl: string
  translations: {
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
    <PageHeaderAction>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        {t.shareButton}
      </Button>
    </PageHeaderAction>
  )
}
