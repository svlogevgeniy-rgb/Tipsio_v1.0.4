'use client'

import { useTranslations as useNextIntlTranslations, useLocale as useNextIntlLocale } from 'next-intl'

export const useTranslations = useNextIntlTranslations

// Helper to get current locale
export function getLocale(): string {
  // Try to get from cookie first
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) return match[1]
  }
  return 'en' // default
}

// Hook version for React components
export const useLocale = useNextIntlLocale

// Helper to set locale cookie
export function setLocale(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`
  window.location.reload()
}
