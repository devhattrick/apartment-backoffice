import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'
import { storageService } from '../services/storage/storageService'
import { I18nContext, type Locale, type I18nContextValue } from './useI18n'
import { TH_MESSAGES } from './messages'

type TranslationParams = Record<string, string | number>

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value))
  }, template)
}

function resolveInitialLocale(): Locale {
  const storedLocale = storageService.getItem<Locale>(STORAGE_KEYS.APP_LOCALE)

  if (storedLocale === 'en' || storedLocale === 'th') {
    return storedLocale
  }

  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('th')) {
    return 'th'
  }

  return 'en'
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale())

  useEffect(() => {
    storageService.setItem(STORAGE_KEYS.APP_LOCALE, locale)
    dayjs.locale(locale)

    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, params) => {
        const translated = locale === 'th' ? TH_MESSAGES[key] ?? key : key
        return interpolate(translated, params)
      },
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
