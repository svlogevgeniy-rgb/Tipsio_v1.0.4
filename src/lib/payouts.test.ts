import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { 
  processStaffPayout,
  processAllPayouts,
  getTotalBalance,
  getStaffWithBalance,
  isEligibleForPayout,
  validatePayout,
  StaffBalance
} from './payouts';

/**
 * **Feature: tipsio-refactor-v2, Property 10: Обнуление баланса при выплате**
 * 
 * *Для любого* сотрудника, после выполнения операции "Выплачено", 
 * его баланс должен быть равен 0.
 * 
 * **Validates: Requirements 5.4**
 */
describe('Property 10: Staff payout zeroes balance', () => {
  const staffArb = fc.record({
    id: fc.uuid(),
    displayName: fc.string({ minLength: 2, maxLength: 30 }),
    balance: fc.integer({ min: 0, max: 10000000 }),
  }) as fc.Arbitrary<StaffBalance>;

  it('should set balance to 0 after payout', () => {
    fc.assert(
      fc.property(
        staffArb,
        (staff) => {
          const result = processStaffPayout(staff);
          expect(result.balance).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve staff id and displayName after payout', () => {
    fc.assert(
      fc.property(
        staffArb,
        (staff) => {
          const result = processStaffPayout(staff);
          expect(result.id).toBe(staff.id);
          expect(result.displayName).toBe(staff.displayName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work for staff with zero balance', () => {
    fc.assert(
      fc.property(
        staffArb.filter(s => s.balance === 0),
        (staff) => {
          const result = processStaffPayout(staff);
          expect(result.balance).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: tipsio-refactor-v2, Property 11: Массовое обнуление балансов**
 * 
 * *Для любого* заведения, после выполнения операции "Выплатить всем", 
 * балансы всех сотрудников должны быть равны 0.
 * 
 * **Validates: Requirements 5.5**
 */
describe('Property 11: Bulk payout zeroes all balances', () => {
  const staffArb = fc.record({
    id: fc.uuid(),
    displayName: fc.string({ minLength: 2, maxLength: 30 }),
    balance: fc.integer({ min: 0, max: 10000000 }),
  }) as fc.Arbitrary<StaffBalance>;

  const staffListArb = fc.array(staffArb, { minLength: 0, maxLength: 20 });

  it('should set all balances to 0 after bulk payout', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const result = processAllPayouts(staffList);
          
          // All balances should be 0
          result.forEach(staff => {
            expect(staff.balance).toBe(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve staff count after bulk payout', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const result = processAllPayouts(staffList);
          expect(result.length).toBe(staffList.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve staff ids after bulk payout', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const result = processAllPayouts(staffList);
          const originalIds = staffList.map(s => s.id);
          const resultIds = result.map(s => s.id);
          
          expect(resultIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('total balance should be 0 after bulk payout', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const result = processAllPayouts(staffList);
          const totalBalance = getTotalBalance(result);
          
          expect(totalBalance).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Payout helper functions', () => {
  const staffArb = fc.record({
    id: fc.uuid(),
    displayName: fc.string({ minLength: 2, maxLength: 30 }),
    balance: fc.integer({ min: 0, max: 10000000 }),
  }) as fc.Arbitrary<StaffBalance>;

  const staffListArb = fc.array(staffArb, { minLength: 0, maxLength: 20 });

  it('getTotalBalance should equal sum of all balances', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const total = getTotalBalance(staffList);
          const expected = staffList.reduce((sum, s) => sum + s.balance, 0);
          
          expect(total).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getStaffWithBalance should only return staff with positive balance', () => {
    fc.assert(
      fc.property(
        staffListArb,
        (staffList) => {
          const withBalance = getStaffWithBalance(staffList);
          
          withBalance.forEach(staff => {
            expect(staff.balance).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isEligibleForPayout should return true only for positive balance', () => {
    fc.assert(
      fc.property(
        staffArb,
        (staff) => {
          const eligible = isEligibleForPayout(staff);
          expect(eligible).toBe(staff.balance > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validatePayout should return valid for positive balance', () => {
    fc.assert(
      fc.property(
        staffArb.filter(s => s.balance > 0),
        (staff) => {
          const result = validatePayout(staff);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validatePayout should return invalid for zero balance', () => {
    fc.assert(
      fc.property(
        staffArb.filter(s => s.balance === 0),
        (staff) => {
          const result = validatePayout(staff);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
