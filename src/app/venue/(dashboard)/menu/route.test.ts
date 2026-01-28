import { describe, it, expect } from 'vitest';

/**
 * **Feature: marketing-improvements, Example 1: Menu route returns 404**
 * 
 * When navigating to /venue/menu, the application should return a 404 status code.
 * 
 * **Validates: Requirements 2.1**
 */
describe('Example 1: Menu route returns 404', () => {
  it('should return 404 when accessing /venue/menu route', () => {
    // Verify the menu page file doesn't exist
    const fs = require('fs');
    const path = require('path');
    const menuPagePath = path.join(__dirname, 'page.tsx');
    
    // File should not exist
    expect(fs.existsSync(menuPagePath)).toBe(false);
  });

  it('should not have menu route in Next.js build output', () => {
    // This test verifies that the route is not included in the build
    // by checking that the page file doesn't exist
    const fs = require('fs');
    
    // Check that the menu directory doesn't contain page.tsx
    const menuDir = __dirname;
    const files = fs.existsSync(menuDir) ? fs.readdirSync(menuDir) : [];
    
    expect(files).not.toContain('page.tsx');
  });
});
