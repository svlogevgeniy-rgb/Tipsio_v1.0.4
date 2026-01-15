import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * **Feature: marketing-improvements, Property 3: Navigation menu exclusion**
 * 
 * *For any* navigation component in the venue dashboard, there should be no navigation items
 * with href="/venue/menu" or labelKey="menu".
 * 
 * **Validates: Requirements 2.3**
 */
describe('Property 3: Navigation menu exclusion', () => {
  it('should not have menu navigation item in venue dashboard', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Import the layout file to check navigation items
        // This is a static analysis test
        const layoutContent = require('fs').readFileSync(
          require('path').join(__dirname, 'layout.tsx'),
          'utf-8'
        );

        // Verify no menu navigation item exists
        expect(layoutContent).not.toContain('href: "/venue/menu"');
        expect(layoutContent).not.toContain('labelKey: "menu"');
        
        // Verify UtensilsCrossed icon is not imported (menu icon)
        expect(layoutContent).not.toContain('UtensilsCrossed');
      }),
      { numRuns: 100 }
    );
  });

  it('should not include menu in NavKey type', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const layoutContent = require('fs').readFileSync(
          require('path').join(__dirname, 'layout.tsx'),
          'utf-8'
        );

        // Check that NavKey type doesn't include "menu"
        const navKeyMatch = layoutContent.match(/type NavKey = ([^;]+);/);
        if (navKeyMatch) {
          const navKeyType = navKeyMatch[1];
          expect(navKeyType).not.toContain('"menu"');
        }
      }),
      { numRuns: 100 }
    );
  });
});
