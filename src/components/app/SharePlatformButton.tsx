'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const PLATFORM_URL = 'https://findyour.club'

type SharePlatformButtonProps = {
  label: string
  copiedMessage: string
}

export function SharePlatformButton({ label, copiedMessage }: SharePlatformButtonProps) {
  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'findyour.club', url: PLATFORM_URL })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(PLATFORM_URL)
      toast.success(copiedMessage)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="border-green-300 text-green-800 hover:bg-green-100 dark:border-green-800 dark:text-green-200 dark:hover:bg-green-900/40"
    >
      <Share2 className="mr-2 h-3.5 w-3.5" />
      {label}
    </Button>
  )
}
