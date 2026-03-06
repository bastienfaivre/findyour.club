'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useTransition, useEffect, useCallback } from 'react'
import { resolveUILang } from '@/lib/i18n'

const LANGS = ['fr', 'de', 'it', 'en'] as const

const LANG_LABELS: Record<string, string> = {
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  en: 'English',
}

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeLang = resolveUILang(currentLang)

  const close = useCallback(() => {
    setOpen(false)
    setFocusIndex(-1)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setFocusIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLang(newLang: string) {
    const segments = pathname.split('/')
    segments[1] = newLang
    const newPath = segments.join('/')
    setOpen(false)
    setFocusIndex(-1)
    startTransition(() => {
      router.push(newPath)
    })
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
      setFocusIndex(0)
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusIndex((i) => (i + 1) % LANGS.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusIndex((i) => (i - 1 + LANGS.length) % LANGS.length)
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusIndex >= 0) switchLang(LANGS[focusIndex])
        break
    }
  }

  // Focus the active option when focusIndex changes
  useEffect(() => {
    if (open && focusIndex >= 0) {
      const options = ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
      options?.[focusIndex]?.focus()
    }
  }, [open, focusIndex])

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen(!open)
          if (!open) setFocusIndex(0)
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground${isPending ? ' opacity-60' : ''}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="uppercase">{activeLang}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform${open ? ' rotate-180' : ''}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          onKeyDown={handleListKeyDown}
          className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border bg-background py-1 shadow-md"
        >
          {LANGS.map((lang, i) => (
            <button
              key={lang}
              role="option"
              aria-selected={lang === activeLang}
              tabIndex={i === focusIndex ? 0 : -1}
              onClick={() => switchLang(lang)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-secondary${
                lang === activeLang ? ' font-semibold' : ''
              }`}
            >
              <span className="uppercase text-muted-foreground">{lang}</span>
              <span>{LANG_LABELS[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
