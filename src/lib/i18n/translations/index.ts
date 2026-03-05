import type { SupportedLanguage } from '../index'
import type { Translations } from './types'
import { fr } from './fr'
import { de } from './de'
import { it } from './it'
import { en } from './en'

export type { Translations } from './types'

const translations: Record<SupportedLanguage, Translations> = { fr, de, it, en }

export function getTranslations(lang: SupportedLanguage): Translations {
  return translations[lang]
}
