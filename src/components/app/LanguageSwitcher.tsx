'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { resolveUILang } from '@/lib/i18n'

const LANGS = ['fr', 'de', 'it', 'en'] as const

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const activeLang = resolveUILang(currentLang)

  function switchLang(newLang: string) {
    const segments = pathname.split('/')
    // segments[1] is the lang segment (pathname always starts with '/')
    segments[1] = newLang
    const newPath = segments.join('/')
    startTransition(() => {
      router.push(newPath)
    })
  }

  return (
    <div className={`flex gap-2${isPending ? ' opacity-60' : ''}`}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => switchLang(lang)}
          className={
            lang === activeLang
              ? 'text-sm font-bold underline uppercase'
              : 'text-sm font-normal opacity-70 uppercase hover:opacity-100'
          }
          aria-current={lang === activeLang ? 'true' : undefined}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
