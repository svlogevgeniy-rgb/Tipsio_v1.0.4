/**
 * Property-Based Tests for Design Token System
 * 
 * Feature: admin-panel-redesign
 * These tests verify that the design token system is used correctly throughout the codebase.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Helper function to recursively find files
function findFiles(dir: string, pattern: RegExp, ignore: RegExp[] = []): string[] {
  const files: string[] = []
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      
      // Skip ignored paths
      if (ignore.some(regex => regex.test(fullPath))) {
        continue
      }
      
      if (item.isDirectory()) {
        files.push(...findFiles(fullPath, pattern, ignore))
      } else if (pattern.test(item.name)) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files
}

/**
 * Property 7: Color Token Usage
 * For any color value in components, the color should reference a design token variable
 * rather than a hardcoded value.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3
 */
describe('Property 7: Color Token Usage', () => {
  // Patterns that indicate hardcoded colors
  const hardcodedColorPatterns = [
    /#[0-9a-fA-F]{3,8}\b/g,  // Hex colors: #fff, #ffffff, #ffffffff
    /rgb\([^)]+\)/g,          // RGB: rgb(255, 255, 255)
    /rgba\([^)]+\)/g,         // RGBA: rgba(255, 255, 255, 0.5)
    /hsl\([^)]+\)/g,          // HSL: hsl(0, 0%, 100%)
    /hsla\([^)]+\)/g,         // HSLA: hsla(0, 0%, 100%, 0.5)
  ]

  // Allowed exceptions (these are legitimate uses)
  const allowedExceptions = [
    'rgb(0 0 0 / 0.05)',      // Tailwind shadow values
    'rgb(0 0 0 / 0.1)',       // Tailwind shadow values
    'hsl(var(',               // CSS variable references
    '#[truncated',            // Test file markers
    'color: #',               // Documentation examples
    'background-image: linear-gradient', // Gradients are OK
  ]

  it('should not contain hardcoded color values in component files', () => {
    const componentsDir = path.join(process.cwd(), 'src/components')
    const componentFiles = findFiles(
      componentsDir,
      /\.(tsx|ts|jsx|js)$/,
      [/\.test\./, /\.spec\./, /node_modules/]
    )

    const violations: Array<{ file: string; line: number; match: string }> = []

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Skip if line contains allowed exceptions
        if (allowedExceptions.some(exception => line.includes(exception))) {
          return
        }

        // Check for hardcoded color patterns
        hardcodedColorPatterns.forEach(pattern => {
          const matches = line.match(pattern)
          if (matches) {
            matches.forEach(match => {
              violations.push({
                file: path.relative(process.cwd(), file),
                line: index + 1,
                match
              })
            })
          }
        })
      })
    }

    if (violations.length > 0) {
      const message = violations
        .slice(0, 10) // Show first 10 violations
        .map(v => `${v.file}:${v.line} - Found hardcoded color: ${v.match}`)
        .join('\n')
      
      expect.fail(
        `Found ${violations.length} hardcoded color value(s) in component files (showing first 10):\n${message}\n\n` +
        'All colors should use design tokens (CSS variables or Tailwind classes).'
      )
    }

    expect(violations).toHaveLength(0)
  })

  it('should not contain hardcoded color values in admin panel pages', () => {
    const adminDir = path.join(process.cwd(), 'src/app/admin')
    
    // Skip if admin directory doesn't exist yet
    if (!fs.existsSync(adminDir)) {
      return
    }

    const adminFiles = findFiles(
      adminDir,
      /\.(tsx|ts|jsx|js)$/,
      [/\.test\./, /\.spec\./, /node_modules/]
    )

    const violations: Array<{ file: string; line: number; match: string }> = []

    for (const file of adminFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Skip if line contains allowed exceptions
        if (allowedExceptions.some(exception => line.includes(exception))) {
          return
        }

        // Check for hardcoded color patterns
        hardcodedColorPatterns.forEach(pattern => {
          const matches = line.match(pattern)
          if (matches) {
            matches.forEach(match => {
              violations.push({
                file: path.relative(process.cwd(), file),
                line: index + 1,
                match
              })
            })
          }
        })
      })
    }

    if (violations.length > 0) {
      const message = violations
        .slice(0, 10) // Show first 10 violations
        .map(v => `${v.file}:${v.line} - Found hardcoded color: ${v.match}`)
        .join('\n')
      
      expect.fail(
        `Found ${violations.length} hardcoded color value(s) in admin panel files (showing first 10):\n${message}\n\n` +
        'All colors should use design tokens (CSS variables or Tailwind classes).'
      )
    }

    expect(violations).toHaveLength(0)
  })

  it('should use CSS variables for all color definitions in globals.css', () => {
    const globalsPath = path.join(process.cwd(), 'src/app/globals.css')
    const content = fs.readFileSync(globalsPath, 'utf-8')

    // Extract all color variable definitions
    const colorVarPattern = /--[\w-]+:\s*([^;]+);/g
    const matches = [...content.matchAll(colorVarPattern)]

    const invalidDefinitions: string[] = []

    matches.forEach(match => {
      const value = match[1].trim()
      
      // Color variables should be HSL values (e.g., "0 0% 100%")
      // or references to other variables (e.g., "hsl(var(--other))")
      const isValidHSL = /^\d+\s+\d+%\s+\d+%$/.test(value)
      const isVarReference = value.includes('var(')
      const isPixelValue = value.endsWith('px') // Border radius values
      
      if (!isValidHSL && !isVarReference && !isPixelValue) {
        invalidDefinitions.push(`${match[0]} (value: ${value})`)
      }
    })

    if (invalidDefinitions.length > 0) {
      expect.fail(
        `Found ${invalidDefinitions.length} invalid color variable definition(s):\n` +
        invalidDefinitions.join('\n') + '\n\n' +
        'Color variables should use HSL format (e.g., "0 0% 100%") or reference other variables.'
      )
    }

    expect(invalidDefinitions).toHaveLength(0)
  })
})

/**
 * Property 2: Spacing Consistency
 * For any component using spacing values, all margins and padding should use values
 * from the defined spacing scale (multiples of 4px).
 * 
 * Validates: Requirements 4.1
 */
describe('Property 2: Spacing Consistency', () => {
  // Patterns to detect custom spacing values
  const customSpacingPattern = /(?:p|m|gap|space)-\[([^\]]+)\]/g

  it('should use spacing scale values in component files', () => {
    const componentsDir = path.join(process.cwd(), 'src/components')
    const componentFiles = findFiles(
      componentsDir,
      /\.(tsx|ts|jsx|js)$/,
      [/\.test\./, /\.spec\./, /node_modules/]
    )

    const violations: Array<{ file: string; line: number; match: string }> = []

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        const matches = [...line.matchAll(customSpacingPattern)]
        
        matches.forEach(match => {
          const value = match[1]
          
          // Check if it's a pixel value
          if (value.endsWith('px')) {
            const pixels = parseInt(value)
            
            // Check if it's a multiple of 4
            if (pixels % 4 !== 0) {
              violations.push({
                file: path.relative(process.cwd(), file),
                line: index + 1,
                match: match[0]
              })
            }
          }
        })
      })
    }

    if (violations.length > 0) {
      const message = violations
        .slice(0, 10) // Show first 10 violations
        .map(v => `${v.file}:${v.line} - Non-standard spacing: ${v.match}`)
        .join('\n')
      
      expect.fail(
        `Found ${violations.length} spacing value(s) not following the 4px scale (showing first 10):\n${message}\n\n` +
        'All spacing should be multiples of 4px (use Tailwind spacing scale: 1=4px, 2=8px, 3=12px, etc.).'
      )
    }

    expect(violations).toHaveLength(0)
  })

  it('should define spacing scale in tailwind config', () => {
    const configPath = path.join(process.cwd(), 'tailwind.config.ts')
    const content = fs.readFileSync(configPath, 'utf-8')

    // Check if spacing scale is defined
    expect(content).toContain('spacing:')
    
    // Check for key spacing values
    const requiredSpacingValues = ['1', '2', '3', '4', '6', '8', '12', '16']
    
    requiredSpacingValues.forEach(value => {
      expect(content).toContain(`'${value}':`)
    })
  })
})
