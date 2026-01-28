import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { 
  getDashboardBlocks, 
  isDashboardBlockVisible,
  shouldShowActiveStaff,
  shouldShowTopStaff,
  shouldShowTipHistory,
  DistributionMode 
} from './dashboard';

/**
 * **Feature: tipsio-refactor-v2, Property 5: Замена блока на дашборде в режиме "Единая кубышка"**
 * 
 * *Для любого* заведения с distributionMode = POOLED, дашборд должен отображать
 * "История чаевых" вместо "Лучшие сотрудники".
 * 
 * **Validates: Requirements 3.5**
 */
describe('Property 5: Dashboard blocks for POOLED mode', () => {
  const distributionModeArb = fc.constantFrom<DistributionMode>('POOLED', 'PERSONAL');

  it('should hide activeStaff block for POOLED mode', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        (mode) => {
          expect(shouldShowActiveStaff(mode)).toBe(false);
          expect(isDashboardBlockVisible('activeStaff', mode)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show activeStaff block for PERSONAL mode', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        (mode) => {
          expect(shouldShowActiveStaff(mode)).toBe(true);
          expect(isDashboardBlockVisible('activeStaff', mode)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show tipHistory instead of topStaff for POOLED mode', () => {
    fc.assert(
      fc.property(
        fc.constant('POOLED' as DistributionMode),
        (mode) => {
          expect(shouldShowTipHistory(mode)).toBe(true);
          expect(shouldShowTopStaff(mode)).toBe(false);
          
          const blocks = getDashboardBlocks(mode);
          const hasTipHistory = blocks.some(b => b.id === 'tipHistory');
          const hasTopStaff = blocks.some(b => b.id === 'topStaff');
          
          expect(hasTipHistory).toBe(true);
          expect(hasTopStaff).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show topStaff instead of tipHistory for PERSONAL mode', () => {
    fc.assert(
      fc.property(
        fc.constant('PERSONAL' as DistributionMode),
        (mode) => {
          expect(shouldShowTopStaff(mode)).toBe(true);
          expect(shouldShowTipHistory(mode)).toBe(false);
          
          const blocks = getDashboardBlocks(mode);
          const hasTipHistory = blocks.some(b => b.id === 'tipHistory');
          const hasTopStaff = blocks.some(b => b.id === 'topStaff');
          
          expect(hasTipHistory).toBe(false);
          expect(hasTopStaff).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always show common metrics for any mode', () => {
    fc.assert(
      fc.property(
        distributionModeArb,
        (mode) => {
          const blocks = getDashboardBlocks(mode);
          
          expect(blocks.some(b => b.id === 'totalTips')).toBe(true);
          expect(blocks.some(b => b.id === 'transactions')).toBe(true);
          expect(blocks.some(b => b.id === 'averageTip')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('POOLED mode should have fewer blocks than PERSONAL mode', () => {
    const pooledBlocks = getDashboardBlocks('POOLED');
    const personalBlocks = getDashboardBlocks('PERSONAL');
    
    expect(pooledBlocks.length).toBeLessThan(personalBlocks.length);
  });

  it('topStaff and tipHistory should be mutually exclusive', () => {
    fc.assert(
      fc.property(
        distributionModeArb,
        (mode) => {
          const blocks = getDashboardBlocks(mode);
          const hasTipHistory = blocks.some(b => b.id === 'tipHistory');
          const hasTopStaff = blocks.some(b => b.id === 'topStaff');
          
          // XOR: exactly one should be true
          expect(hasTipHistory !== hasTopStaff).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
