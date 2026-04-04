export type SupportedLanguage = 'fr' | 'de' | 'it' | 'en'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'de', 'it', 'en']

/** Fallback for any language not in SUPPORTED_LANGUAGES (e.g. 'pt' → 'en') */
export const PLATFORM_FALLBACK_LANG: SupportedLanguage = 'en'

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as string[]).includes(value)
}

/**
 * Resolves any BCP 47 language subtag to a supported UI language.
 * Unsupported languages (e.g. 'pt', 'ja') fall back to PLATFORM_FALLBACK_LANG ('en').
 */
export function resolveUILang(lang: string): SupportedLanguage {
  return isSupportedLanguage(lang) ? lang : PLATFORM_FALLBACK_LANG
}

export function plural(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
