/**
 * Property Test: Circular Dependency Elimination
 * 
 * Validates that there are no circular dependencies in the modified files.
 * A circular dependency occurs when module A imports module B, and module B
 * (directly or indirectly) imports module A.
 * 
 * Requirements validated: 4.2
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';

describe('Property Test: Circular Dependency Elimination', () => {
  const modifiedFiles = [
    'src/app/staff/dashboard/page.tsx',
    'src/app/staff/history/page.tsx',
    'src/app/admin/commissions/page.tsx',
    'src/app/admin/transactions/page.tsx',
    'src/app/admin/page.tsx',
    'src/components/venue/staff/staff-list.tsx',
    'src/lib/i18n/formatters.ts',
  ];

  function getImports(filePath: string): string[] {
    if (!existsSync(filePath)) {
      return [];
    }

    const content = readFileSync(filePath, 'utf-8');
    const imports: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
      if (match) {
        imports.push(match[1]);
      }
    }

    return imports;
  }

  function resolveImportPath(importPath: string, fromFile: string): string | null {
    // Skip external packages
    if (!importPath.startsWith('@/') && !importPath.startsWith('.')) {
      return null;
    }

    const baseDir = process.cwd();
    let resolvedPath: string;

    if (importPath.startsWith('@/')) {
      // Resolve @/ alias to src/
      resolvedPath = join(baseDir, 'src', importPath.slice(2));
    } else {
      // Resolve relative import
      const fromDir = dirname(join(baseDir, fromFile));
      resolvedPath = resolve(fromDir, importPath);
    }

    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (existsSync(fullPath)) {
        return fullPath.replace(baseDir + '/', '');
      }
    }

    // Try index files
    for (const ext of extensions.slice(1)) {
      const indexPath = join(resolvedPath, `index${ext}`);
      if (existsSync(indexPath)) {
        return indexPath.replace(baseDir + '/', '');
      }
    }

    return null;
  }

  function buildDependencyGraph(files: string[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const file of files) {
      const filePath = join(process.cwd(), file);
      const imports = getImports(filePath);
      const dependencies = new Set<string>();

      for (const importPath of imports) {
        const resolved = resolveImportPath(importPath, file);
        if (resolved && files.includes(resolved)) {
          dependencies.add(resolved);
        }
      }

      graph.set(file, dependencies);
    }

    return graph;
  }

  function detectCycles(graph: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(node: string, path: string[]): void {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = graph.get(node) || new Set();
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          dfs(dep, [...path]);
        } else if (recursionStack.has(dep)) {
          // Found a cycle
          const cycleStart = path.indexOf(dep);
          if (cycleStart !== -1) {
            cycles.push([...path.slice(cycleStart), dep]);
          }
        }
      }

      recursionStack.delete(node);
    }

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  it('should not have circular dependencies in modified files', () => {
    const graph = buildDependencyGraph(modifiedFiles);
    const cycles = detectCycles(graph);

    if (cycles.length > 0) {
      const cycleDescriptions = cycles.map(cycle => cycle.join(' -> ')).join('\n');
      expect(cycles).toHaveLength(0);
      throw new Error(`Found circular dependencies:\n${cycleDescriptions}`);
    }

    expect(cycles).toHaveLength(0);
  });

  it('should have formatters.ts as a leaf module (no imports)', () => {
    const formattersPath = join(process.cwd(), 'src/lib/i18n/formatters.ts');
    const imports = getImports(formattersPath);

    // formatters.ts should not import anything (pure utility module)
    expect(imports).toHaveLength(0);
  });

  it('should not have any file importing itself', () => {
    for (const file of modifiedFiles) {
      const filePath = join(process.cwd(), file);
      const imports = getImports(filePath);

      for (const importPath of imports) {
        const resolved = resolveImportPath(importPath, file);
        expect(resolved).not.toBe(file);
      }
    }
  });
});
