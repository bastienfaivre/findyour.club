'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  isDirty: boolean
}

interface UseUnsavedChangesReturn {
  showDialog: boolean
  pendingHref: string | null
  confirmNavigation: () => void
  cancelNavigation: () => void
}

export function useUnsavedChanges({
  isDirty,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const isDirtyRef = useRef(isDirty)
  const popstatePushedRef = useRef(false)

  // Keep ref in sync so event handlers always see latest value
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  // beforeunload — handles tab close, reload, address bar navigation
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Setting returnValue triggers the native browser dialog
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Click interception — handles clicks on <a> tags within the admin layout
  useEffect(() => {
    if (!isDirty) return

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only intercept internal navigation (same-origin relative links)
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return
      // Skip external links (target="_blank")
      if (anchor.target === '_blank') return

      e.preventDefault()
      e.stopPropagation()
      setPendingHref(href)
      setShowDialog(true)
    }

    // Use capture phase to intercept before Next.js router handles the click
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isDirty])

  // popstate — handles browser back/forward buttons
  useEffect(() => {
    if (!isDirty) {
      // Reset ref when form becomes clean so a new entry is pushed next time
      popstatePushedRef.current = false
      return
    }

    const handlePopState = () => {
      if (!isDirtyRef.current) return

      // Push current URL back to prevent navigation
      window.history.pushState(null, '', window.location.href)
      setPendingHref(null)
      setShowDialog(true)
    }

    // Push one extra history entry so popstate fires before actually leaving.
    if (!popstatePushedRef.current) {
      window.history.pushState(null, '', window.location.href)
      popstatePushedRef.current = true
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty])

  const confirmNavigation = useCallback(() => {
    setShowDialog(false)
    if (pendingHref) {
      // Use Next.js router for client-side SPA navigation
      router.push(pendingHref)
    }
    setPendingHref(null)
  }, [pendingHref, router])

  const cancelNavigation = useCallback(() => {
    setShowDialog(false)
    setPendingHref(null)
  }, [])

  return { showDialog, pendingHref, confirmNavigation, cancelNavigation }
}
