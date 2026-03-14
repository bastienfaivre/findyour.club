'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { resolveUILang } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LANGS = ['fr', 'de', 'it', 'en'] as const

const LANG_LABELS: Record<string, string> = {
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  en: 'English',
}

export function LanguageSwitcher({ currentLang, dropUp }: { currentLang: string; dropUp?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const activeLang = resolveUILang(currentLang)
  const { setOpenMobile } = useSidebar()

  function switchLang(newLang: string) {
    const segments = pathname.split('/')
    segments[1] = newLang
    const newPath = segments.join('/')
    // Close the mobile sidebar before navigating to avoid Radix Dialog
    // leaving a stale body scroll lock (pointer-events/overflow) behind.
    setOpenMobile(false)
    startTransition(() => {
      router.replace(newPath)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 text-muted-foreground${isPending ? ' opacity-60' : ''}`}
        >
          <span className="uppercase">{activeLang}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={dropUp ? 'top' : 'bottom'}>
        {LANGS.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => switchLang(lang)}
            className="gap-2"
          >
            <span className="uppercase text-muted-foreground">{lang}</span>
            <span>{LANG_LABELS[lang]}</span>
            {lang === activeLang && <Check className="ml-auto size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
