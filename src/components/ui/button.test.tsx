/**
 * @vitest-environment jsdom
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { buttonVariants } from './button';

describe('Button Component', () => {
  /**
   * **Feature: landing-page-v2-improvements, Property 3: Единообразие стилей кнопок на лендинге**
   * **Валидирует: Требования 3.1, 3.2, 3.3, 3.4**
   * 
   * Для любой кнопки на лендинге, элемент должен иметь CSS классы 
   * для белого фона по умолчанию и синего фона при hover.
   */
  describe('Property 3: Landing button variant consistency', () => {
    it('should have landing variant defined', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toBeDefined();
      expect(typeof landingClasses).toBe('string');
    });

    it('should have white background in landing variant', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toContain('bg-white');
    });

    it('should have blue hover background in landing variant', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toContain('hover:bg-blue-600');
    });

    it('should have white text on hover in landing variant', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toContain('hover:text-white');
    });

    it('should have border in landing variant', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toContain('border');
    });

    it('should maintain focus-visible styles', () => {
      const landingClasses = buttonVariants({ variant: 'landing' });
      expect(landingClasses).toContain('focus-visible:');
    });

    it('should work with all size variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'sm', 'lg', 'icon'),
          (size) => {
            const classes = buttonVariants({ 
              variant: 'landing', 
              size: size as 'default' | 'sm' | 'lg' | 'icon' 
            });
            return classes.includes('bg-white') && classes.includes('hover:bg-blue-600');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('All button variants', () => {
    const allVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'landing'] as const;

    it('should generate valid class strings for all variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allVariants),
          (variant) => {
            const classes = buttonVariants({ variant });
            return typeof classes === 'string' && classes.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
