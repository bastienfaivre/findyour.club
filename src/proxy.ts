// src/proxy.ts
// Central routing / proxy logic. All request-level rules live here.
// Auth is enforced exclusively at the layout level (no edge-layer auth guards).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isSupportedLanguage, resolveUILang } from '@/lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && isSupportedLanguage(firstSegment)) {
    // Valid lang in URL → set cookie and pass through
    const response = NextResponse.next()
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('platform_lang', firstSegment, {
      path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', secure: isProduction,
    })
    return response
  }

  // No lang (or unsupported first segment) → detect and redirect
  // Prefer the stored cookie (set on previous lang-prefixed visits) over Accept-Language
  const cookieLang = request.cookies.get('platform_lang')?.value ?? ''
  const acceptLang = request.headers.get('accept-language') ?? ''
  const acceptPreferred = acceptLang.split(',')[0]?.trim().split(/[-;]/)[0].toLowerCase() ?? ''
  const preferred = cookieLang || acceptPreferred
  const lang = resolveUILang(preferred)
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|favicon-.*\\.png|apple-touch-icon\\.png|robots\\.txt|sitemap\\.xml).*)'],
}
