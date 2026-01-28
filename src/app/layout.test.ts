import { describe, it, expect } from 'vitest';

/**
 * **Feature: marketing-improvements, Example 2: Favicon metadata present**
 * 
 * When the application HTML is rendered, the head section should contain
 * favicon configuration in the metadata.
 * 
 * **Validates: Requirements 3.1, 3.4**
 */
describe('Example 2: Favicon metadata present', () => {
  it('should have favicon configuration in layout file', () => {
    const fs = require('fs');
    const path = require('path');
    const layoutPath = path.join(__dirname, 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    
    // Check that icons configuration exists
    expect(layoutContent).toContain('icons:');
    expect(layoutContent).toContain('icon:');
  });

  it('should include SVG favicon in configuration', () => {
    const fs = require('fs');
    const path = require('path');
    const layoutPath = path.join(__dirname, 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    
    expect(layoutContent).toContain('/favicon.svg');
  });

  it('should have metadata export', () => {
    const fs = require('fs');
    const path = require('path');
    const layoutPath = path.join(__dirname, 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    
    expect(layoutContent).toContain('export const metadata');
    expect(layoutContent).toContain('Metadata');
  });

  it('should have title and description', () => {
    const fs = require('fs');
    const path = require('path');
    const layoutPath = path.join(__dirname, 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    
    expect(layoutContent).toContain('title:');
    expect(layoutContent).toContain('description:');
  });
});
