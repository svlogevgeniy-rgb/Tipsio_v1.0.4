#!/usr/bin/env npx tsx
/**
 * Translation Validation Script
 * 
 * Validates that all translation dictionaries have consistent keys
 * and reports any missing or extra keys.
 * 
 * Usage: npx tsx scripts/validate-translations.ts
 */

import * as fs from 'fs'
import * as path from 'path'

type TranslationDict = Record<string, unknown>

interface ValidationResult {
  locale: string
  missingKeys: string[]
  extraKeys: string[]
}

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
 * Compares two sets of keys and returns missing and extra keys
 */
function compareKeys(reference: string[], target: string[]): { missing: string[]; extra: string[] } {
  const refSet = new Set(reference)
  const targetSet = new Set(target)
  
  const missing = reference.filter(k => !targetSet.has(k))
  const extra = target.filter(k => !refSet.has(k))
  
  return { missing, extra }
}

/**
 * Loads a JSON file and returns its content
 */
function loadJson(filePath: string): TranslationDict {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Main validation function
 */
function validateTranslations(): boolean {
  const messagesDir = path.join(process.cwd(), 'messages')
  
  // Load all translation files
  const enPath = path.join(messagesDir, 'en.json')
  const ruPath = path.join(messagesDir, 'ru.json')
  const idPath = path.join(messagesDir, 'id.json')
  
  console.log('🔍 Validating translation files...\n')
  
  // Check if files exist
  for (const filePath of [enPath, ruPath, idPath]) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return false
    }
  }
  
  // Load and parse JSON
  let enMessages: TranslationDict
  let ruMessages: TranslationDict
  let idMessages: TranslationDict
  
  try {
    enMessages = loadJson(enPath)
    ruMessages = loadJson(ruPath)
    idMessages = loadJson(idPath)
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error)
    return false
  }
  
  // Extract keys
  const enKeys = extractKeys(enMessages)
  const ruKeys = extractKeys(ruMessages)
  const idKeys = extractKeys(idMessages)
  
  console.log(`📊 Key counts:`)
  console.log(`   English:    ${enKeys.length} keys`)
  console.log(`   Russian:    ${ruKeys.length} keys`)
  console.log(`   Indonesian: ${idKeys.length} keys\n`)
  
  // Compare against English (reference)
  const results: ValidationResult[] = []
  
  const ruComparison = compareKeys(enKeys, ruKeys)
  results.push({
    locale: 'Russian (ru)',
    missingKeys: ruComparison.missing,
    extraKeys: ruComparison.extra
  })
  
  const idComparison = compareKeys(enKeys, idKeys)
  results.push({
    locale: 'Indonesian (id)',
    missingKeys: idComparison.missing,
    extraKeys: idComparison.extra
  })
  
  // Report results
  let hasErrors = false
  
  for (const result of results) {
    console.log(`📝 ${result.locale}:`)
    
    if (result.missingKeys.length === 0) {
      console.log(`   ✅ All English keys present`)
    } else {
      hasErrors = true
      console.log(`   ❌ Missing ${result.missingKeys.length} keys:`)
      result.missingKeys.slice(0, 10).forEach(k => console.log(`      - ${k}`))
      if (result.missingKeys.length > 10) {
        console.log(`      ... and ${result.missingKeys.length - 10} more`)
      }
    }
    
    if (result.extraKeys.length > 0) {
      console.log(`   ℹ️  Has ${result.extraKeys.length} extra keys (not in English)`)
    }
    
    console.log()
  }
  
  // Summary
  if (hasErrors) {
    console.log('❌ Validation FAILED - some keys are missing')
    return false
  } else {
    console.log('✅ Validation PASSED - all translations are complete')
    return true
  }
}

// Run validation
const success = validateTranslations()
process.exit(success ? 0 : 1)
