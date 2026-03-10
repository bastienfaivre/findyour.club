'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type PageTitleState = {
  title: string
  backHref: string | null
}

const PageTitleContext = createContext<{
  state: PageTitleState
  setState: (state: PageTitleState) => void
}>({ state: { title: '', backHref: null }, setState: () => {} })

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PageTitleState>({ title: '', backHref: null })
  return (
    <PageTitleContext.Provider value={{ state, setState }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  return useContext(PageTitleContext)
}

/** Drop this component into any page to set the top bar title. Renders nothing. */
export function AdminPageTitle({ title, backHref }: { title: string; backHref?: string }) {
  const { setState } = usePageTitle()
  useEffect(() => {
    setState({ title, backHref: backHref ?? null })
    return () => setState({ title: '', backHref: null })
  }, [title, backHref, setState])
  return null
}

export function PageTitleDisplay() {
  const { state: { title, backHref } } = usePageTitle()
  return (
    <span className="flex items-center gap-2 min-w-0" aria-live="polite" aria-atomic="true">
      {title && backHref && (
        <Link href={backHref} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
      {title && <span className="text-sm font-medium truncate">{title}</span>}
    </span>
  )
}
