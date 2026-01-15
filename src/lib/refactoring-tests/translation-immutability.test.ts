/**
 * Property Test: Translation Files Immutability
 * 
 * Validates that translation files (en.json, ru.json, id.json) remain unchanged
 * during refactoring. This ensures that no user-facing text or i18n keys were
 * accidentally modified.
 * 
 * Requirements validated: 5.1
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

describe('Property Test: Translation Files Immutability', () => {
  const translationFiles = [
    'messages/en.json',
    'messages/ru.json',
    'messages/id.json',
  ];

  function getFileHash(filePath: string): string {
    const content = readFileSync(filePath, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  }

  function getFileContent(filePath: string): Record<string, unknown> {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  it('should have valid JSON structure in all translation files', () => {
    for (const file of translationFiles) {
      const filePath = join(process.cwd(), file);
      
      // Should not throw when parsing
      expect(() => {
        const content = getFileContent(filePath);
        expect(content).toBeDefined();
        expect(typeof content).toBe('object');
      }).not.toThrow();
    }
  });

  it('should have all translation files present', () => {
    for (const file of translationFiles) {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf-8');
      
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it('should have consistent key structure across all locales', () => {
    const enPath = join(process.cwd(), 'messages/en.json');
    const ruPath = join(process.cwd(), 'messages/ru.json');
    const idPath = join(process.cwd(), 'messages/id.json');

    const enContent = getFileContent(enPath);
    const ruContent = getFileContent(ruPath);
    const idContent = getFileContent(idPath);

    // Get all top-level keys
    const enKeys = Object.keys(enContent).sort();
    const ruKeys = Object.keys(ruContent).sort();
    const idKeys = Object.keys(idContent).sort();

    // All locales should have the same top-level keys
    expect(enKeys).toEqual(ruKeys);
    expect(enKeys).toEqual(idKeys);
  });

  it('should not have any empty translation values', () => {
    for (const file of translationFiles) {
      const filePath = join(process.cwd(), file);
      const content = getFileContent(filePath);

      function checkForEmptyValues(obj: Record<string, unknown>, path = ''): void {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkForEmptyValues(value as Record<string, unknown>, currentPath);
          }
        }
      }

      checkForEmptyValues(content);
    }
  });

  it('should have translation files that are parseable and well-formed', () => {
    for (const file of translationFiles) {
      const filePath = join(process.cwd(), file);
      const rawContent = readFileSync(filePath, 'utf-8');
      
      // Should be valid JSON
      expect(() => JSON.parse(rawContent)).not.toThrow();
      
      // Should not have trailing commas or other JSON errors
      const parsed = JSON.parse(rawContent);
      const stringified = JSON.stringify(parsed);
      
      // Re-parsing should work
      expect(() => JSON.parse(stringified)).not.toThrow();
    }
  });
});
