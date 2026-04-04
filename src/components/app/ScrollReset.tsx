'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Resets the scroll position of #main-content on route changes.
 * Needed because the scrollable container is an inner div (not the body),
 * so Next.js built-in scroll restoration doesn't apply.
 */
export function ScrollReset() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      document.getElementById('main-content')?.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
