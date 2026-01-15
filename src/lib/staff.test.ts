import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { 
  shouldShowAvatarFallback, 
  getAvatarInitials,
  ALL_STAFF_ROLES,
  ROLE_LABELS
} from './staff';

/**
 * **Feature: tipsio-refactor-v2, Property 8: Заглушка аватара при отсутствии фото**
 * 
 * *Для любого* сотрудника с avatarUrl = null, интерфейс должен отображать заглушку-аватар.
 * 
 * **Validates: Requirements 4.7**
 */
describe('Property 8: Avatar fallback', () => {
  const alphanumeric = fc.stringMatching(/^[a-zA-Z0-9]+$/);
  const displayNameArb = fc.tuple(
    alphanumeric.filter(s => s.length >= 1),
    alphanumeric.filter(s => s.length >= 1)
  ).map(([first, last]) => `${first} ${last}`);

  it('should show fallback when avatarUrl is null', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (avatarUrl) => {
          expect(shouldShowAvatarFallback(avatarUrl)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show fallback when avatarUrl is undefined', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (avatarUrl) => {
          expect(shouldShowAvatarFallback(avatarUrl)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show fallback when avatarUrl is empty string', () => {
    fc.assert(
      fc.property(
        fc.constant(''),
        (avatarUrl) => {
          expect(shouldShowAvatarFallback(avatarUrl)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show fallback when avatarUrl is whitespace only', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('   ', '  ', ' ', '\t', '\n'),
        (avatarUrl) => {
          expect(shouldShowAvatarFallback(avatarUrl)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not show fallback when avatarUrl is valid', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (avatarUrl) => {
          expect(shouldShowAvatarFallback(avatarUrl)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate correct initials from display name', () => {
    fc.assert(
      fc.property(
        displayNameArb,
        (displayName) => {
          const initials = getAvatarInitials(displayName);
          
          // Initials should be uppercase
          expect(initials).toBe(initials.toUpperCase());
          
          // Initials should be max 2 characters
          expect(initials.length).toBeLessThanOrEqual(2);
          
          // First initial should match first letter of first name
          const firstLetter = displayName.split(' ')[0][0].toUpperCase();
          expect(initials[0]).toBe(firstLetter);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all required staff roles', () => {
    const requiredRoles = ['WAITER', 'BARISTA', 'BARTENDER', 'HOSTESS', 'CHEF', 'ADMINISTRATOR'];
    
    for (const role of requiredRoles) {
      expect(ALL_STAFF_ROLES).toContain(role);
      expect(ROLE_LABELS[role as keyof typeof ROLE_LABELS]).toBeDefined();
    }
  });

  it('should have Russian labels for all roles', () => {
    for (const role of ALL_STAFF_ROLES) {
      const label = ROLE_LABELS[role];
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
