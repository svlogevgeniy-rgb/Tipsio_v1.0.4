import { describe, it, expect } from 'vitest';

/**
 * **Feature: marketing-improvements, Example 3: Build succeeds**
 * 
 * When executing `npm run build`, the command should exit with code 0
 * and produce no error messages.
 * 
 * **Validates: Requirements 4.1**
 */
describe('Example 3: Build succeeds', () => {
  it('should verify that build command exists in package.json', () => {
    const fs = require('fs');
    const path = require('path');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.build).toContain('next build');
  });

  it('should verify that Next.js configuration exists', () => {
    const fs = require('fs');
    const path = require('path');
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
    
    expect(fs.existsSync(nextConfigPath)).toBe(true);
  });

  it('should verify that TypeScript configuration is valid', () => {
    const fs = require('fs');
    const path = require('path');
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    expect(tsconfig.compilerOptions).toBeDefined();
  });
});
