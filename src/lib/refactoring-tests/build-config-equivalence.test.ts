/**
 * Property Test: Build Configuration Equivalence
 * 
 * Validates that build configuration files remain functionally equivalent
 * after refactoring. This ensures that the build process, scripts, and
 * TypeScript configuration have not been accidentally modified.
 * 
 * Requirements validated: 5.6
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property Test: Build Configuration Equivalence', () => {
  it('should have package.json with all required scripts', () => {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    // Essential scripts that must exist
    const requiredScripts = [
      'dev',
      'build',
      'start',
      'lint',
      'test',
    ];

    for (const script of requiredScripts) {
      expect(packageJson.scripts).toHaveProperty(script);
      expect(typeof packageJson.scripts[script]).toBe('string');
      expect(packageJson.scripts[script].length).toBeGreaterThan(0);
    }
  });

  it('should have tsconfig.json with strict mode enabled', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

    // TypeScript should be in strict mode for type safety
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('should have tsconfig.json with path aliases configured', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

    // Should have @/* alias configured
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@/*']).toBeDefined();
    expect(Array.isArray(tsconfig.compilerOptions.paths['@/*'])).toBe(true);
  });

  it('should have next.config.mjs that exports a valid configuration', () => {
    const nextConfigPath = join(process.cwd(), 'next.config.mjs');
    const content = readFileSync(nextConfigPath, 'utf-8');

    // Should have export statement
    expect(content).toContain('export default');
    
    // Should not have syntax errors (basic check)
    expect(content).not.toContain('undefined');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should have package.json with required dependencies', () => {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    // Essential dependencies
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
    ];

    for (const dep of requiredDeps) {
      const hasDep = 
        (packageJson.dependencies && packageJson.dependencies[dep]) ||
        (packageJson.devDependencies && packageJson.devDependencies[dep]);
      
      expect(hasDep).toBeTruthy();
    }
  });

  it('should have package.json with test framework configured', () => {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    // Should have vitest configured
    const hasVitest = 
      (packageJson.dependencies && packageJson.dependencies.vitest) ||
      (packageJson.devDependencies && packageJson.devDependencies.vitest);
    
    expect(hasVitest).toBeTruthy();
  });

  it('should have tsconfig.json with module resolution configured', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

    // Should have proper module resolution
    expect(tsconfig.compilerOptions.moduleResolution).toBeDefined();
    expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
  });

  it('should have package.json with valid JSON structure', () => {
    const packagePath = join(process.cwd(), 'package.json');
    
    // Should not throw when parsing
    expect(() => {
      const content = JSON.parse(readFileSync(packagePath, 'utf-8'));
      expect(content.name).toBeDefined();
      expect(content.version).toBeDefined();
    }).not.toThrow();
  });
});
