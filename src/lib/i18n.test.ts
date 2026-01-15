import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import enMessages from '../../messages/en.json';
import idMessages from '../../messages/id.json';
import ruMessages from '../../messages/ru.json';

/**
 * Property-based tests for i18n completeness
 * 
 * These tests verify that all translation keys exist in all language files.
 * 
 * **Feature: tip-payment-ui-redesign**
 */

/**
 * **Feature: tip-payment-ui-redesign, Property 6: Complete i18n Coverage**
 * 
 * *For any* static text element on Payment_Page or Success_Page, 
 * a corresponding translation key should exist in all three language files (en.json, ru.json, id.json).
 * 
 * **Validates: Requirements 3.1**
 */
describe('Property 6: Complete i18n Coverage', () => {
  // Helper function to get all nested keys from an object
  function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  // Get all keys from each language file
  const enKeys = getAllKeys(enMessages);
  const ruKeys = getAllKeys(ruMessages);
  const idKeys = getAllKeys(idMessages);

  it('should have all English keys present in Russian translations', () => {
    const missingInRussian = enKeys.filter(key => !ruKeys.includes(key));
    
    expect(missingInRussian).toEqual([]);
  });

  it('should have all English keys present in Indonesian translations', () => {
    const missingInIndonesian = enKeys.filter(key => !idKeys.includes(key));
    
    expect(missingInIndonesian).toEqual([]);
  });

  it('should have all Russian keys present in English translations', () => {
    const missingInEnglish = ruKeys.filter(key => !enKeys.includes(key));
    
    expect(missingInEnglish).toEqual([]);
  });

  it('should have all Indonesian keys present in English translations', () => {
    const missingInEnglish = idKeys.filter(key => !enKeys.includes(key));
    
    expect(missingInEnglish).toEqual([]);
  });

  it('should have exact same key structure across all three languages', () => {
    // All three should have the same number of keys
    expect(enKeys.length).toBe(ruKeys.length);
    expect(enKeys.length).toBe(idKeys.length);
    
    // All keys should match
    const sortedEnKeys = [...enKeys].sort();
    const sortedRuKeys = [...ruKeys].sort();
    const sortedIdKeys = [...idKeys].sort();
    
    expect(sortedEnKeys).toEqual(sortedRuKeys);
    expect(sortedEnKeys).toEqual(sortedIdKeys);
  });

  /**
   * Property test: For any randomly selected key path from English,
   * the same key should exist in Russian and Indonesian
   */
  it('should have matching keys for any random key selection', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...enKeys),
        (randomKey) => {
          // The randomly selected English key should exist in all languages
          expect(ruKeys).toContain(randomKey);
          expect(idKeys).toContain(randomKey);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any subset of keys, all should exist in all languages
   */
  it('should have all keys from any subset present in all languages', () => {
    fc.assert(
      fc.property(
        fc.subarray(enKeys, { minLength: 1, maxLength: 10 }),
        (keySubset) => {
          // Every key in the subset should exist in all three languages
          keySubset.forEach(key => {
            expect(enKeys).toContain(key);
            expect(ruKeys).toContain(key);
            expect(idKeys).toContain(key);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Specific tests for tip-related keys that were added in tasks 2.1-2.3
  describe('Tip-specific translation keys', () => {
    const tipKeys = [
      'guest.tip.staffSelection.heading',
      'guest.tip.staffSelection.selectStaff',
      'guest.tip.tipAmount.heading',
      'guest.tip.tipAmount.amountLabel',
      'guest.tip.tipAmount.presetAmounts',
      'guest.tip.tipAmount.customAmount',
      'guest.tip.tipAmount.enterAmount',
      'guest.tip.tipAmount.experienceLabel',
      'guest.tip.tipAmount.experienceOptions.poor',
      'guest.tip.tipAmount.experienceOptions.okay',
      'guest.tip.tipAmount.experienceOptions.good',
      'guest.tip.tipAmount.experienceOptions.great',
      'guest.tip.tipAmount.experienceOptions.excellent',
      'guest.tip.tipAmount.messageLabel',
      'guest.tip.tipAmount.messagePlaceholder',
      'guest.tip.tipAmount.characterCount',
      'guest.tip.tipAmount.continueButton',
      'guest.tip.tipAmount.minAmount',
    ];

    it('should have all tip-specific keys in English', () => {
      tipKeys.forEach(key => {
        expect(enKeys).toContain(key);
      });
    });

    it('should have all tip-specific keys in Russian', () => {
      tipKeys.forEach(key => {
        expect(ruKeys).toContain(key);
      });
    });

    it('should have all tip-specific keys in Indonesian', () => {
      tipKeys.forEach(key => {
        expect(idKeys).toContain(key);
      });
    });
  });

  // Helper function to get value by key path
  function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Property test: For any key, the value should be a non-empty string
   */
  it('should have non-empty string values for all keys in all languages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...enKeys),
        (key) => {
          const enValue = getValueByPath(enMessages, key);
          const ruValue = getValueByPath(ruMessages, key);
          const idValue = getValueByPath(idMessages, key);

          // All values should be strings
          expect(typeof enValue).toBe('string');
          expect(typeof ruValue).toBe('string');
          expect(typeof idValue).toBe('string');

          // All values should be non-empty
          expect(enValue.length).toBeGreaterThan(0);
          expect(ruValue.length).toBeGreaterThan(0);
          expect(idValue.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
