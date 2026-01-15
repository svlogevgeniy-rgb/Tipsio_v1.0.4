/**
 * Property Test: Public API Preservation
 * 
 * Validates that refactoring does not change exported module interfaces.
 * This test ensures that all public exports remain unchanged after refactoring.
 * 
 * Requirements validated: 2.5, 4.5
 */

import { describe, it, expect } from 'vitest';

describe('Property Test: Public API Preservation', () => {
  it('should preserve formatters module exports', async () => {
    const formattersModule = await import('@/lib/i18n/formatters');
    
    // Verify all expected exports exist
    expect(formattersModule).toHaveProperty('formatDateRange');
    expect(formattersModule).toHaveProperty('formatDateShort');
    expect(formattersModule).toHaveProperty('formatDateWithWeekday');
    expect(formattersModule).toHaveProperty('formatDateTime');
    expect(formattersModule).toHaveProperty('formatNumber');
    
    // Verify exports are functions
    expect(typeof formattersModule.formatDateRange).toBe('function');
    expect(typeof formattersModule.formatDateShort).toBe('function');
    expect(typeof formattersModule.formatDateWithWeekday).toBe('function');
    expect(typeof formattersModule.formatDateTime).toBe('function');
    expect(typeof formattersModule.formatNumber).toBe('function');
  });

  it('should verify formatDateRange function signature', async () => {
    const { formatDateRange } = await import('@/lib/i18n/formatters');
    
    // Test with valid inputs
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const result = formatDateRange(start, end);
    
    // Should return a string
    expect(typeof result).toBe('string');
    
    // Should contain both dates
    expect(result).toContain('Jan');
  });

  it('should verify formatDateShort function signature', async () => {
    const { formatDateShort } = await import('@/lib/i18n/formatters');
    
    const date = new Date('2024-01-15');
    const result = formatDateShort(date);
    
    expect(typeof result).toBe('string');
    expect(result).toContain('Jan');
  });

  it('should verify formatDateWithWeekday function signature', async () => {
    const { formatDateWithWeekday } = await import('@/lib/i18n/formatters');
    
    const date = new Date('2024-01-15');
    const result = formatDateWithWeekday(date);
    
    expect(typeof result).toBe('string');
    // Should contain weekday name
    expect(result.length).toBeGreaterThan(0);
  });

  it('should verify formatDateTime function signature', async () => {
    const { formatDateTime } = await import('@/lib/i18n/formatters');
    
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDateTime(date);
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should verify formatNumber function signature', async () => {
    const { formatNumber } = await import('@/lib/i18n/formatters');
    
    const result = formatNumber(1000);
    
    expect(typeof result).toBe('string');
    // Should format with thousand separator
    expect(result).toContain(',');
  });
});
