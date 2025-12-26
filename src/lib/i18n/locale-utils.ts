import { locales, defaultLocale, type Locale } from '../../../i18n/request'

/**
 * Determines the locale from various sources following the fallback chain:
 * 1. Cookie value (NEXT_LOCALE)
 * 2. Accept-Language header
 * 3. Default locale (en)
 */
export function selectLocale(
  cookieValue: string | undefined,
  acceptLanguageHeader: string | undefined
): Locale {
  // 1. Try cookie first
  if (cookieValue && locales.includes(cookieValue as Locale)) {
    return cookieValue as Locale
  }

  // 2. Try Accept-Language header
  if (acceptLanguageHeader) {
    const preferredLocale = parseAcceptLanguage(acceptLanguageHeader)
    if (preferredLocale) {
      return preferredLocale
    }
  }

  // 3. Fall back to default
  return defaultLocale
}

/**
 * Parses Accept-Language header and returns the first matching locale
 */
export function parseAcceptLanguage(header: string): Locale | null {
  const languages = header
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';')
      const quality = qValue ? parseFloat(qValue.replace('q=', '')) : 1
      // Extract language code (first 2 chars or full code like 'id-ID')
      const langCode = code.trim().substring(0, 2).toLowerCase()
      return { code: langCode, quality }
    })
    .sort((a, b) => b.quality - a.quality)

  for (const { code } of languages) {
    if (locales.includes(code as Locale)) {
      return code as Locale
    }
  }

  return null
}

/**
 * Validates if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

/**
 * Cookie name for storing locale preference
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Sets locale cookie value (for client-side use)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=31536000;samesite=lax`
  }
}

/**
 * Gets locale cookie value (for client-side use)
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`))
  const value = match?.[1]
  
  if (value && isValidLocale(value)) {
    return value
  }
  
  return null
}
