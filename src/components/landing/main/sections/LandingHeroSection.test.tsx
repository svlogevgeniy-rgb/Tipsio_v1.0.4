/**
 * @vitest-environment jsdom
 */
import * as fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';

// Mock translations
vi.mock('@/i18n/client', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'hero.badge': 'Работает на Бали · Комиссия 0%',
      'hero.headlinePrefix': 'Цифровая платформа',
      'hero.headlineItalic': 'гостевого опыта,',
      'hero.headlineSuffix': 'в\u00A0которой люди',
      'hero.headlineHighlight': 'работают с\u00A0людьми',
      'hero.subheadline': 'Бесплатное подключение. Гостям вашего заведения будет удобнее, а\u00A0персоналу\u00A0— проще.',
      'hero.cta': 'Запустить бесплатно за 1 час',
    };
    return translations[key] || key;
  },
}));

// Import translations for testing
import ruTranslations from '../../../../../messages/ru.json';

describe('LandingHeroSection', () => {
  /**
   * **Feature: landing-page-v2-improvements, Property 1: Неразрывные пробелы в hero-тексте**
   * **Валидирует: Требование 1.3**
   * 
   * Для любого hero-текста на русском языке, строка должна содержать 
   * символы неразрывного пробела (\u00A0) между предлогами и следующими словами.
   */
  describe('Property 1: Non-breaking spaces in hero text', () => {
    const heroTexts = [
      ruTranslations.landingV3.hero.headlineSuffix,
      ruTranslations.landingV3.hero.headlineHighlight,
      ruTranslations.landingV3.hero.subheadline,
    ];

    // Patterns that should have non-breaking spaces
    const nbspPatterns = [
      /в\u00A0которой/,  // "в которой"
      /с\u00A0людьми/,   // "с людьми"
      /а\u00A0персоналу/, // "а персоналу"
    ];

    it('should contain non-breaking spaces in Russian hero text', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...heroTexts),
          (text) => {
            // At least one pattern should match if text contains the phrase
            const hasNbsp = nbspPatterns.some(pattern => pattern.test(text));
            const containsPhrase = text.includes('которой') || 
                                   text.includes('людьми') || 
                                   text.includes('персоналу');
            
            // If text contains the phrase, it should have nbsp
            if (containsPhrase) {
              return hasNbsp;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not have regular spaces before key words', () => {
      const allHeroText = heroTexts.join(' ');
      
      // These patterns should NOT exist (regular space instead of nbsp)
      const badPatterns = [
        /в которой/,  // regular space
        /с людьми/,   // regular space  
        /а персоналу/, // regular space
      ];

      badPatterns.forEach(pattern => {
        expect(pattern.test(allHeroText)).toBe(false);
      });
    });
  });

  /**
   * **Feature: landing-page-v2-improvements, Property 2: Trust points consistency**
   * **Валидирует: Требования 2.1, 2.2, 2.4**
   * 
   * Note: trust1 and trust2 were re-added for i18n completeness across all locales.
   * They now contain appropriate translations for each locale.
   */
  describe('Property 2: Trust points consistency across locales', () => {
    it('should have trust1 and trust2 in hero translations for i18n completeness', () => {
      const heroKeys = Object.keys(ruTranslations.landingV3.hero);
      
      // trust1 and trust2 should be present for i18n completeness
      expect(heroKeys).toContain('trust1');
      expect(heroKeys).toContain('trust2');
    });

    it('should have appropriate trust point values', () => {
      const hero = ruTranslations.landingV3.hero;
      
      // Verify trust points have meaningful content
      expect(hero.trust1).toBeTruthy();
      expect(hero.trust2).toBeTruthy();
      expect(typeof hero.trust1).toBe('string');
      expect(typeof hero.trust2).toBe('string');
    });
  });
});
