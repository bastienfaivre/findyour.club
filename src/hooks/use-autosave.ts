'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

const AUTOSAVE_INTERVAL_MS = 30_000

function readDraft<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
  }
  return null
}

/**
 * Periodically saves form data to localStorage when dirty.
 * On mount, checks for a saved draft and exposes it for restoration.
 */
export function useAutosave<T>(key: string, { isDirty, getCurrentValues }: {
  isDirty: boolean
  getCurrentValues: () => T
}) {
  const [draft, setDraft] = useState<T | null>(() => readDraft<T>(key))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Autosave interval when form is dirty
  useEffect(() => {
    if (isDirty) {
      intervalRef.current = setInterval(() => {
        try {
          localStorage.setItem(key, JSON.stringify(getCurrentValues()))
        } catch {
          // localStorage full or unavailable — silently ignore
        }
      }, AUTOSAVE_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isDirty, key, getCurrentValues])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key)
    setDraft(null)
  }, [key])

  const dismissDraft = useCallback(() => {
    setDraft(null)
    localStorage.removeItem(key)
  }, [key])

  return { draft, clearDraft, dismissDraft }
}
