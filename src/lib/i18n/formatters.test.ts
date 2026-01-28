import * as fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import {
  formatDateIndonesian,
  formatTimeIndonesian,
  formatNumberIndonesian,
  formatCurrencyIDR,
  DAYS,
  MONTHS
} from './formatters'

/**
 * Feature: indonesian-i18n, Property 3: Currency Prefix Formatting
 * 
 * *For any* numeric amount formatted as currency in Indonesian locale,
 * the resulting string SHALL contain the "Rp" prefix.
 * 
 * **Validates: Requirements 1.4**
 */
describe('Property 3: Currency Prefix Formatting', () => {
  it('should always include Rp prefix for any amount', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1000000000, noNaN: true }),
        (amount) => {
          const formatted = formatCurrencyIDR(amount)
          expect(formatted.startsWith('Rp ')).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format specific amounts correctly', () => {
    expect(formatCurrencyIDR(0)).toBe('Rp 0')
    expect(formatCurrencyIDR(1000)).toBe('Rp 1.000')
    expect(formatCurrencyIDR(50000)).toBe('Rp 50.000')
    expect(formatCurrencyIDR(1000000)).toBe('Rp 1.000.000')
  })
})

/**
 * Feature: indonesian-i18n, Property 4: Indonesian Date Formatting
 * 
 * *For any* date formatted in Indonesian locale, the resulting string
 * SHALL contain valid Indonesian day names (Senin-Minggu) and month names
 * (Januari-Desember).
 * 
 * **Validates: Requirements 1.5**
 */
describe('Property 4: Indonesian Date Formatting', () => {
  // Filter out invalid dates (NaN)
  const validDateArb = fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
    .filter(d => !isNaN(d.getTime()))

  it('should always include Indonesian day name', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const formatted = formatDateIndonesian(date)
          const containsDay = DAYS.some(day => formatted.includes(day))
          expect(containsDay).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always include Indonesian month name', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const formatted = formatDateIndonesian(date)
          const containsMonth = MONTHS.some(month => formatted.includes(month))
          expect(containsMonth).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format specific dates correctly', () => {
    // Friday, December 6, 2024
    const date = new Date(2024, 11, 6)
    expect(formatDateIndonesian(date)).toBe('Jumat, 6 Desember 2024')
  })
})

/**
 * Feature: indonesian-i18n, Property 9: Thousand Separator Formatting
 * 
 * *For any* number >= 1000 formatted in Indonesian locale,
 * the resulting string SHALL use "." as the thousand separator.
 * 
 * **Validates: Requirements 6.2**
 */
describe('Property 9: Thousand Separator Formatting', () => {
  it('should use dot as thousand separator for numbers >= 1000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 999999999 }),
        (num) => {
          const formatted = formatNumberIndonesian(num)
          expect(formatted).toContain('.')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not have dot for numbers < 1000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (num) => {
          const formatted = formatNumberIndonesian(num)
          expect(formatted).not.toContain('.')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format specific numbers correctly', () => {
    expect(formatNumberIndonesian(1000)).toBe('1.000')
    expect(formatNumberIndonesian(1000000)).toBe('1.000.000')
    expect(formatNumberIndonesian(123456789)).toBe('123.456.789')
  })
})

/**
 * Feature: indonesian-i18n, Property 10: Time Format Consistency
 * 
 * *For any* time value formatted in Indonesian locale,
 * the resulting string SHALL use 24-hour format (00:00-23:59).
 * 
 * **Validates: Requirements 6.3**
 */
describe('Property 10: Time Format Consistency', () => {
  // Filter out invalid dates (NaN)
  const validDateArb = fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
    .filter(d => !isNaN(d.getTime()))

  it('should always use 24-hour format', () => {
    fc.assert(
      fc.property(
        validDateArb,
        (date) => {
          const formatted = formatTimeIndonesian(date)
          
          // Should match HH:MM pattern
          expect(formatted).toMatch(/^\d{2}:\d{2}$/)
          
          // Hours should be 00-23
          const hours = parseInt(formatted.split(':')[0])
          expect(hours).toBeGreaterThanOrEqual(0)
          expect(hours).toBeLessThanOrEqual(23)
          
          // Minutes should be 00-59
          const minutes = parseInt(formatted.split(':')[1])
          expect(minutes).toBeGreaterThanOrEqual(0)
          expect(minutes).toBeLessThanOrEqual(59)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format specific times correctly', () => {
    const morning = new Date(2024, 0, 1, 9, 5)
    expect(formatTimeIndonesian(morning)).toBe('09:05')
    
    const afternoon = new Date(2024, 0, 1, 14, 30)
    expect(formatTimeIndonesian(afternoon)).toBe('14:30')
    
    const midnight = new Date(2024, 0, 1, 0, 0)
    expect(formatTimeIndonesian(midnight)).toBe('00:00')
    
    const endOfDay = new Date(2024, 0, 1, 23, 59)
    expect(formatTimeIndonesian(endOfDay)).toBe('23:59')
  })
})
