'use client'

import { useState, useEffect } from 'react'
import { Rocket, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeBannerProps {
  clubId: string
  translations: {
    title: string
    description: string
    steps: string[]
    dismiss: string
  }
}

const STORAGE_KEY = 'fyc:welcome-dismissed'

export function WelcomeBanner({ clubId, translations: t }: WelcomeBannerProps) {
  const [visible, setVisible] = useState(false)

  // Reading from localStorage must happen after hydration to avoid SSR/client mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const dismissed: string[] = stored ? JSON.parse(stored) : []
      // eslint-disable-next-line react-hooks/set-state-in-effect -- must defer to avoid hydration mismatch
      if (!dismissed.includes(clubId)) setVisible(true)
    } catch { /* ignore */ }
  }, [clubId])

  function dismiss() {
    setVisible(false)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const dismissed: string[] = stored ? JSON.parse(stored) : []
      if (!dismissed.includes(clubId)) {
        dismissed.push(clubId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed))
      }
    } catch { /* ignore */ }
  }

  if (!visible) return null

  return (
    <div className="relative rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 mb-6">
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3">
        <Rocket className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
        <div className="space-y-2 pr-6">
          <p className="text-sm font-semibold">{t.title}</p>
          <p className="text-sm text-muted-foreground">{t.description}</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {t.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Button size="sm" variant="outline" onClick={dismiss} className="mt-2">
            {t.dismiss}
          </Button>
        </div>
      </div>
    </div>
  )
}
