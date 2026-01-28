import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { 
  shouldShowStaffSelection, 
  getDefaultTipTarget,
  DistributionMode,
  QrType,
  TipPageConfig
} from './tip-page';

/**
 * **Feature: tipsio-refactor-v2, Property 9: Выбор сотрудника в режиме "По сотрудникам"**
 * 
 * *Для любого* заведения с distributionMode = PERSONAL, страница чаевых (tip page)
 * должна отображать выбор сотрудника.
 * 
 * **Validates: Requirements 4.10**
 */
describe('Property 9: Staff selection on tip page', () => {
  const distributionModeArb = fc.constantFrom<DistributionMode>('POOLED', 'PERSONAL');
  const qrTypeArb = fc.constantFrom<QrType>('PERSONAL', 'TABLE', 'VENUE');
  const staffCountArb = fc.nat({ max: 20 });

  it('should show staff selection for PERSONAL distribution with TABLE/VENUE QR and available staff', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<QrType>('TABLE', 'VENUE'),
        fc.integer({ min: 1, max: 20 }),
        fc.boolean(),
        (qrType, staffCount, allowStaffChoice) => {
          const config: TipPageConfig = {
            qrType,
            distributionMode: 'PERSONAL',
            allowStaffChoice,
            availableStaffCount: staffCount,
          };
          
          expect(shouldShowStaffSelection(config)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never show staff selection for PERSONAL QR type', () => {
    fc.assert(
      fc.property(
        distributionModeArb,
        fc.boolean(),
        staffCountArb,
        (distributionMode, allowStaffChoice, staffCount) => {
          const config: TipPageConfig = {
            qrType: 'PERSONAL',
            distributionMode,
            allowStaffChoice,
            availableStaffCount: staffCount,
          };
          
          // Personal QR already has staff assigned, no selection needed
          expect(shouldShowStaffSelection(config)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not show staff selection when no staff available', () => {
    fc.assert(
      fc.property(
        qrTypeArb,
        distributionModeArb,
        fc.boolean(),
        (qrType, distributionMode, allowStaffChoice) => {
          const config: TipPageConfig = {
            qrType,
            distributionMode,
            allowStaffChoice,
            availableStaffCount: 0,
          };
          
          expect(shouldShowStaffSelection(config)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show staff selection for POOLED mode only when allowStaffChoice is true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<QrType>('TABLE', 'VENUE'),
        fc.integer({ min: 1, max: 20 }),
        (qrType, staffCount) => {
          const configWithChoice: TipPageConfig = {
            qrType,
            distributionMode: 'POOLED',
            allowStaffChoice: true,
            availableStaffCount: staffCount,
          };
          
          const configWithoutChoice: TipPageConfig = {
            qrType,
            distributionMode: 'POOLED',
            allowStaffChoice: false,
            availableStaffCount: staffCount,
          };
          
          expect(shouldShowStaffSelection(configWithChoice)).toBe(true);
          expect(shouldShowStaffSelection(configWithoutChoice)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should default to staff target for PERSONAL QR with staff', () => {
    expect(getDefaultTipTarget('PERSONAL', true)).toBe('staff');
  });

  it('should default to pool target for TABLE/VENUE QR', () => {
    expect(getDefaultTipTarget('TABLE', true)).toBe('pool');
    expect(getDefaultTipTarget('VENUE', true)).toBe('pool');
    expect(getDefaultTipTarget('TABLE', false)).toBe('pool');
  });
});
