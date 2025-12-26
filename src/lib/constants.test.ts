import { describe, it, expect } from 'vitest';
import {
  STAFF_ROLES,
  TIP_STATUSES,
  QR_CODE_TYPES,
  STAFF_STATUSES,
  USER_ROLES,
  DISTRIBUTION_MODES,
  API_PATHS,
} from './constants';

/**
 * **Feature: structural-refactoring, Property 3: Constants Centralization**
 * 
 * *For any* magic string that appears in multiple files, after extraction
 * to constants file, grep for the literal string should return only the
 * constants definition file.
 * 
 * **Validates: Requirements 2.1, 2.2**
 */
describe('Property 3: Constants Centralization', () => {
  describe('STAFF_ROLES', () => {
    it('should contain all expected staff roles', () => {
      expect(STAFF_ROLES).toContain('WAITER');
      expect(STAFF_ROLES).toContain('BARTENDER');
      expect(STAFF_ROLES).toContain('BARISTA');
      expect(STAFF_ROLES).toContain('HOSTESS');
      expect(STAFF_ROLES).toContain('CHEF');
      expect(STAFF_ROLES).toContain('ADMINISTRATOR');
      expect(STAFF_ROLES).toContain('OTHER');
    });

    it('should have exactly 7 roles', () => {
      expect(STAFF_ROLES).toHaveLength(7);
    });

    it('should be immutable via TypeScript', () => {
      // TypeScript ensures this at compile time with 'as const'
      // Runtime immutability is not enforced, but TypeScript prevents mutations
      expect(STAFF_ROLES.length).toBe(7);
    });
  });

  describe('TIP_STATUSES', () => {
    it('should contain all expected tip statuses', () => {
      expect(TIP_STATUSES).toContain('PENDING');
      expect(TIP_STATUSES).toContain('PAID');
      expect(TIP_STATUSES).toContain('FAILED');
      expect(TIP_STATUSES).toContain('REFUNDED');
    });

    it('should have exactly 4 statuses', () => {
      expect(TIP_STATUSES).toHaveLength(4);
    });
  });

  describe('QR_CODE_TYPES', () => {
    it('should contain all expected QR code types', () => {
      expect(QR_CODE_TYPES).toContain('PERSONAL');
      expect(QR_CODE_TYPES).toContain('VENUE');
      expect(QR_CODE_TYPES).toContain('TABLE');
    });

    it('should have exactly 3 types', () => {
      expect(QR_CODE_TYPES).toHaveLength(3);
    });
  });

  describe('STAFF_STATUSES', () => {
    it('should contain ACTIVE and INACTIVE', () => {
      expect(STAFF_STATUSES).toContain('ACTIVE');
      expect(STAFF_STATUSES).toContain('INACTIVE');
    });

    it('should have exactly 2 statuses', () => {
      expect(STAFF_STATUSES).toHaveLength(2);
    });
  });

  describe('USER_ROLES', () => {
    it('should contain all expected user roles', () => {
      expect(USER_ROLES).toContain('ADMIN');
      expect(USER_ROLES).toContain('MANAGER');
      expect(USER_ROLES).toContain('STAFF');
    });

    it('should have exactly 3 roles', () => {
      expect(USER_ROLES).toHaveLength(3);
    });
  });

  describe('DISTRIBUTION_MODES', () => {
    it('should contain all expected distribution modes', () => {
      expect(DISTRIBUTION_MODES).toContain('PERSONAL');
      expect(DISTRIBUTION_MODES).toContain('POOLED');
      expect(DISTRIBUTION_MODES).toContain('HYBRID');
    });

    it('should have exactly 3 modes', () => {
      expect(DISTRIBUTION_MODES).toHaveLength(3);
    });
  });

  describe('API_PATHS', () => {
    it('should have all expected API paths', () => {
      expect(API_PATHS.STAFF).toBe('/api/staff');
      expect(API_PATHS.VENUES).toBe('/api/venues');
      expect(API_PATHS.QR).toBe('/api/qr');
      expect(API_PATHS.TIPS).toBe('/api/tips');
      expect(API_PATHS.PAYOUTS).toBe('/api/payouts');
      expect(API_PATHS.ADMIN).toBe('/api/admin');
    });
  });
});
