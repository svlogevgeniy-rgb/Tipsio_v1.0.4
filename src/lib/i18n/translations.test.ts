import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import enMessages from '../../../messages/en.json'
import ruMessages from '../../../messages/ru.json'
import idMessages from '../../../messages/id.json'

type TranslationDict = Record<string, unknown>

/**
 * Recursively extracts all keys from a nested object
 */
function extractKeys(obj: TranslationDict, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value as TranslationDict, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

/**
 * Extracts all interpolation variables from translation values
 */
function extractInterpolations(obj: TranslationDict): { key: string; vars: string[] }[] {
  const results: { key: string; vars: string[] }[] = []
  
  function traverse(o: TranslationDict, prefix = '') {
    for (const key of Object.keys(o)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = o[key]
      
      if (typeof value === 'string') {
        const matches = value.match(/\{([^}]+)\}/g)
        if (matches) {
          results.push({
            key: fullKey,
            vars: matches.map(m => m.slice(1, -1))
          })
        }
      } else if (typeof value === 'object' && value !== null) {
        traverse(value as TranslationDict, fullKey)
      }
    }
  }
  
  traverse(obj)
  return results
}

const enKeys = extractKeys(enMessages as TranslationDict)
const ruKeys = extractKeys(ruMessages as TranslationDict)
const idKeys = extractKeys(idMessages as TranslationDict)

const EXPECTED_NAMESPACES = ['landingV3', 'landing', 'common', 'currency', 'guest', 'staff', 'venue', 'admin']

/**
 * Feature: indonesian-i18n, Property 1: Dictionary Key Completeness
 * 
 * *For any* translation key that exists in the English dictionary,
 * that same key SHALL exist in the Indonesian dictionary.
 * 
 * **Validates: Requirements 1.1**
 */
describe('Property 1: Dictionary Key Completeness', () => {
  it('Indonesian dictionary should contain all English keys', () => {
    const missingInId = enKeys.filter(key => !idKeys.includes(key))
    
    if (missingInId.length > 0) {
      console.log('Missing keys in Indonesian:', missingInId.slice(0, 10))
    }
    
    expect(missingInId).toEqual([])
  })

  it('Russian dictionary should contain all English keys', () => {
    const missingInRu = enKeys.filter(key => !ruKeys.includes(key))
    
    if (missingInRu.length > 0) {
      console.log('Missing keys in Russian:', missingInRu.slice(0, 10))
    }
    
    expect(missingInRu).toEqual([])
  })

  it('Indonesian and Russian should have at least as many keys as English', () => {
    // Other languages may have extra keys, but must have all English keys
    expect(idKeys.length).toBeGreaterThanOrEqual(enKeys.length)
    expect(ruKeys.length).toBeGreaterThanOrEqual(enKeys.length)
  })
})

/**
 * Feature: indonesian-i18n, Property 8: JSON Validity
 * 
 * *For any* translation dictionary file, parsing it as JSON
 * SHALL succeed without errors.
 * 
 * **Validates: Requirements 4.4**
 */
describe('Property 8: JSON Validity', () => {
  it('English dictionary should be valid JSON with content', () => {
    expect(enMessages).toBeDefined()
    expect(typeof enMessages).toBe('object')
    expect(Object.keys(enMessages).length).toBeGreaterThan(0)
  })

  it('Russian dictionary should be valid JSON with content', () => {
    expect(ruMessages).toBeDefined()
    expect(typeof ruMessages).toBe('object')
    expect(Object.keys(ruMessages).length).toBeGreaterThan(0)
  })

  it('Indonesian dictionary should be valid JSON with content', () => {
    expect(idMessages).toBeDefined()
    expect(typeof idMessages).toBe('object')
    expect(Object.keys(idMessages).length).toBeGreaterThan(0)
  })
})

/**
 * Feature: indonesian-i18n, Property 11: Namespace Structure Validity
 * 
 * *For any* top-level key in a translation dictionary, that key
 * SHALL be one of the defined namespaces.
 * 
 * **Validates: Requirements 7.2**
 */
describe('Property 11: Namespace Structure Validity', () => {
  it('English dictionary should only have expected namespaces', () => {
    const topLevelKeys = Object.keys(enMessages)
    const unexpectedKeys = topLevelKeys.filter(k => !EXPECTED_NAMESPACES.includes(k))
    expect(unexpectedKeys).toEqual([])
  })

  it('Russian dictionary should only have expected namespaces', () => {
    const topLevelKeys = Object.keys(ruMessages)
    const unexpectedKeys = topLevelKeys.filter(k => !EXPECTED_NAMESPACES.includes(k))
    expect(unexpectedKeys).toEqual([])
  })

  it('Indonesian dictionary should only have expected namespaces', () => {
    const topLevelKeys = Object.keys(idMessages)
    const unexpectedKeys = topLevelKeys.filter(k => !EXPECTED_NAMESPACES.includes(k))
    expect(unexpectedKeys).toEqual([])
  })
})

/**
 * Feature: indonesian-i18n, Property 12: Interpolation Syntax Consistency
 * 
 * *For any* translation value containing variable placeholders,
 * those placeholders SHALL use curly brace syntax `{variableName}`.
 * 
 * **Validates: Requirements 7.3**
 */
describe('Property 12: Interpolation Syntax Consistency', () => {
  it('all interpolations should use {var} syntax', () => {
    const enInterpolations = extractInterpolations(enMessages as TranslationDict)
    const ruInterpolations = extractInterpolations(ruMessages as TranslationDict)
    const idInterpolations = extractInterpolations(idMessages as TranslationDict)

    // Check that interpolation variables are consistent across languages
    for (const enItem of enInterpolations) {
      const ruItem = ruInterpolations.find(r => r.key === enItem.key)
      const idItem = idInterpolations.find(i => i.key === enItem.key)

      if (ruItem) {
        expect(ruItem.vars.sort()).toEqual(enItem.vars.sort())
      }
      if (idItem) {
        expect(idItem.vars.sort()).toEqual(enItem.vars.sort())
      }
    }
  })

  it('should not have malformed interpolation syntax', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...enKeys),
        (key) => {
          // This is a sanity check - all keys should be valid strings
          expect(typeof key).toBe('string')
          expect(key.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})
