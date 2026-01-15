import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import enMessages from '../../messages/en.json'
import idMessages from '../../messages/id.json'
import ruMessages from '../../messages/ru.json'

/**
 * Property-based test for Translation Key Completeness
 * Validates: Requirements 3.4 - All translation keys must exist in all locales
 */

type TranslationObject = Record<string, unknown>

function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as TranslationObject, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('i18n Translation Completeness', () => {
  const enKeys = getAllKeys(enMessages)
  const ruKeys = getAllKeys(ruMessages)
  const idKeys = getAllKeys(idMessages)

  it('should have all English keys in Russian translations', () => {
    const missingInRu = enKeys.filter(key => !ruKeys.includes(key))
    expect(missingInRu).toEqual([])
  })

  it('should have all English keys in Indonesian translations', () => {
    const missingInId = enKeys.filter(key => !idKeys.includes(key))
    expect(missingInId).toEqual([])
  })

  it('should have all Russian keys in English translations', () => {
    const missingInEn = ruKeys.filter(key => !enKeys.includes(key))
    expect(missingInEn).toEqual([])
  })

  it('should have all Indonesian keys in English translations', () => {
    const missingInEn = idKeys.filter(key => !enKeys.includes(key))
    expect(missingInEn).toEqual([])
  })

  // Property-based test: for any randomly selected key from any locale,
  // it should exist in all other locales
  it('property: any key from one locale exists in all locales', () => {
    const allUniqueKeys = Array.from(new Set([...enKeys, ...ruKeys, ...idKeys]))
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: allUniqueKeys.length - 1 }),
        (index) => {
          const key = allUniqueKeys[index]
          const existsInEn = enKeys.includes(key)
          const existsInRu = ruKeys.includes(key)
          const existsInId = idKeys.includes(key)
          
          // If key exists in any locale, it should exist in all
          if (existsInEn || existsInRu || existsInId) {
            return existsInEn && existsInRu && existsInId
          }
          return true
        }
      ),
      { numRuns: Math.min(100, allUniqueKeys.length) }
    )
  })

  it('should have non-empty string values for all translation keys', () => {
    function checkNonEmpty(obj: TranslationObject, locale: string, prefix = ''): string[] {
      const emptyKeys: string[] = []
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          emptyKeys.push(...checkNonEmpty(value as TranslationObject, locale, fullKey))
        } else if (typeof value === 'string' && value.trim() === '') {
          emptyKeys.push(`${locale}:${fullKey}`)
        }
      }
      return emptyKeys
    }

    const emptyInEn = checkNonEmpty(enMessages, 'en')
    const emptyInRu = checkNonEmpty(ruMessages, 'ru')
    const emptyInId = checkNonEmpty(idMessages, 'id')
    
    const allEmpty = [...emptyInEn, ...emptyInRu, ...emptyInId]
    expect(allEmpty).toEqual([])
  })
})
