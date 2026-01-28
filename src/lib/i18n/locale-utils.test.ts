import * as fc from 'fast-check'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  selectLocale,
  parseAcceptLanguage,
  isValidLocale,
  setLocaleCookie,
  getLocaleCookie,
  LOCALE_COOKIE_NAME
} from './locale-utils'
import { locales, type Locale } from '../../../i18n/request'

/**
 * Feature: indonesian-i18n, Property 5: Locale Selection Determinism
 * 
 * *For any* combination of cookie value, Accept-Language header, and default locale,
 * the locale selection function SHALL return exactly one valid locale from the
 * supported set {en, ru, id}.
 * 
 * **Validates: Requirements 2.2**
 */
describe('Property 5: Locale Selection Determinism', () => {
  // Arbitrary generators
  const validLocaleArb = fc.constantFrom(...locales)
  const invalidLocaleArb = fc.string().filter(s => !locales.includes(s as Locale))

  it('should always return a valid locale for any input combination', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }),
        fc.option(fc.string(), { nil: undefined }),
        (cookieValue, acceptLanguage) => {
          const result = selectLocale(cookieValue, acceptLanguage)
          
          // Result must be one of the valid locales
          expect(locales).toContain(result)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should prioritize cookie over Accept-Language header', () => {
    fc.assert(
      fc.property(
        validLocaleArb,
        validLocaleArb,
        (cookieLocale, headerLocale) => {
          const acceptLanguage = `${headerLocale};q=1.0`
          const result = selectLocale(cookieLocale, acceptLanguage)
          
          // Cookie should take priority
          expect(result).toBe(cookieLocale)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should use Accept-Language when cookie is invalid or missing', () => {
    fc.assert(
      fc.property(
        invalidLocaleArb,
        validLocaleArb,
        (invalidCookie, headerLocale) => {
          const acceptLanguage = `${headerLocale};q=1.0`
          const result = selectLocale(invalidCookie, acceptLanguage)
          
          // Should fall back to Accept-Language
          expect(result).toBe(headerLocale)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return default locale when both cookie and header are invalid', () => {
    fc.assert(
      fc.property(
        invalidLocaleArb,
        fc.string().filter(s => !locales.some(l => s.toLowerCase().includes(l))),
        (invalidCookie, invalidHeader) => {
          const result = selectLocale(invalidCookie, invalidHeader)
          
          // Should fall back to default (en)
          expect(result).toBe('en')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle undefined inputs gracefully', () => {
    expect(selectLocale(undefined, undefined)).toBe('en')
    expect(selectLocale(undefined, 'id;q=1.0')).toBe('id')
    expect(selectLocale('ru', undefined)).toBe('ru')
  })
})

/**
 * Feature: indonesian-i18n, Property 6: Cookie Persistence Round-Trip
 * 
 * *For any* locale selected by the user, setting and then reading the
 * NEXT_LOCALE cookie SHALL return the same locale value.
 * 
 * **Validates: Requirements 3.2**
 */
describe('Property 6: Cookie Persistence Round-Trip', () => {
  const validLocaleArb = fc.constantFrom(...locales)

  beforeEach(() => {
    // Mock document.cookie for testing
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    })
  })

  afterEach(() => {
    document.cookie = ''
  })

  it('should persist and retrieve locale correctly', () => {
    fc.assert(
      fc.property(
        validLocaleArb,
        (locale) => {
          // Clear cookie
          document.cookie = ''
          
          // Set locale
          setLocaleCookie(locale)
          
          // Verify cookie was set
          expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=${locale}`)
          
          // Read back
          const retrieved = getLocaleCookie()
          
          // Should match original
          expect(retrieved).toBe(locale)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('parseAcceptLanguage', () => {
  it('should parse Indonesian locale variants', () => {
    expect(parseAcceptLanguage('id')).toBe('id')
    expect(parseAcceptLanguage('id-ID')).toBe('id')
    expect(parseAcceptLanguage('id-ID,en;q=0.9')).toBe('id')
  })

  it('should respect quality values', () => {
    expect(parseAcceptLanguage('en;q=0.5,ru;q=0.9')).toBe('ru')
    expect(parseAcceptLanguage('id;q=0.8,en;q=0.9,ru;q=0.7')).toBe('en')
  })

  it('should return null for unsupported languages', () => {
    expect(parseAcceptLanguage('fr,de,es')).toBe(null)
  })
})

describe('isValidLocale', () => {
  it('should return true for valid locales', () => {
    expect(isValidLocale('en')).toBe(true)
    expect(isValidLocale('ru')).toBe(true)
    expect(isValidLocale('id')).toBe(true)
  })

  it('should return false for invalid locales', () => {
    expect(isValidLocale('fr')).toBe(false)
    expect(isValidLocale('de')).toBe(false)
    expect(isValidLocale('')).toBe(false)
    expect(isValidLocale('english')).toBe(false)
  })
})
