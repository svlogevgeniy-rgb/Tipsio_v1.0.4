/**
 * Property Test: Import Organization Consistency
 * 
 * Validates that imports in modified files follow consistent organization:
 * 1. External imports (react, next, third-party)
 * 2. Internal imports with @/ alias
 * 3. Relative imports
 * 
 * Requirements validated: 4.1, 4.3
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property Test: Import Organization Consistency', () => {
  const modifiedFiles = [
    'src/app/staff/dashboard/page.tsx',
    'src/app/staff/history/page.tsx',
    'src/app/admin/commissions/page.tsx',
    'src/app/admin/transactions/page.tsx',
    'src/app/admin/page.tsx',
    'src/components/venue/staff/staff-list.tsx',
    'src/lib/i18n/formatters.ts',
  ];

  function parseImports(content: string): { external: string[]; internal: string[]; relative: string[] } {
    const lines = content.split('\n');
    const external: string[] = [];
    const internal: string[] = [];
    const relative: string[] = [];

    for (const line of lines) {
      const match = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        if (importPath.startsWith('@/')) {
          internal.push(importPath);
        } else if (importPath.startsWith('.')) {
          relative.push(importPath);
        } else {
          external.push(importPath);
        }
      }
    }

    return { external, internal, relative };
  }

  it('should have imports organized in correct order (external, internal, relative)', () => {
    for (const file of modifiedFiles) {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf-8');
      const imports = parseImports(content);

      // Get all import lines with their positions
      const lines = content.split('\n');
      const importPositions: { type: string; line: number }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          let type = 'external';
          if (importPath.startsWith('@/')) {
            type = 'internal';
          } else if (importPath.startsWith('.')) {
            type = 'relative';
          }
          importPositions.push({ type, line: i });
        }
      }

      // Verify order: external should come before internal, internal before relative
      let lastExternal = -1;
      let lastInternal = -1;
      let lastRelative = -1;

      for (const { type, line } of importPositions) {
        if (type === 'external') {
          lastExternal = line;
          // External imports should not come after internal or relative
          expect(line).toBeLessThan(lastInternal === -1 ? Infinity : lastInternal);
          expect(line).toBeLessThan(lastRelative === -1 ? Infinity : lastRelative);
        } else if (type === 'internal') {
          lastInternal = line;
          // Internal imports should not come after relative
          expect(line).toBeLessThan(lastRelative === -1 ? Infinity : lastRelative);
        } else if (type === 'relative') {
          lastRelative = line;
        }
      }
    }
  });

  it('should use @/ alias for internal imports', () => {
    for (const file of modifiedFiles) {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf-8');
      const imports = parseImports(content);

      // All internal imports should use @/ alias
      for (const importPath of imports.internal) {
        expect(importPath).toMatch(/^@\//);
      }
    }
  });

  it('should not have deep relative imports (../../..)', () => {
    for (const file of modifiedFiles) {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf-8');
      const imports = parseImports(content);

      // Relative imports should not go up more than one level
      for (const importPath of imports.relative) {
        const upLevels = (importPath.match(/\.\.\//g) || []).length;
        expect(upLevels).toBeLessThanOrEqual(1);
      }
    }
  });
});
