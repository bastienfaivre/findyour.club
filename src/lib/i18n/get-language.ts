import { cookies } from 'next/headers'
import { PLATFORM_FALLBACK_LANG, isSupportedLanguage, type SupportedLanguage } from './index'

/**
 * Reads the platform_lang cookie set by proxy.ts.
 * Used exclusively by root layout.tsx to set <html lang>.
 * All other layouts use params.lang directly.
 */
export async function getLanguage(): Promise<SupportedLanguage> {
  const cookieStore = await cookies()
  const value = cookieStore.get('platform_lang')?.value
  return isSupportedLanguage(value) ? value : PLATFORM_FALLBACK_LANG
}
