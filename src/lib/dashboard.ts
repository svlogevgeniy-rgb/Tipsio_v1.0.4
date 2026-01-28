import { isPersonalMode, isPooledMode } from "@/types/distribution";
import type { DistributionMode } from "@/types/distribution";

export type { DistributionMode } from "@/types/distribution";

export interface DashboardBlock {
  id: string;
  type: 'metric' | 'alert' | 'list';
}

export const DASHBOARD_BLOCKS = {
  totalTips: { id: 'totalTips', type: 'metric' as const },
  transactions: { id: 'transactions', type: 'metric' as const },
  averageTip: { id: 'averageTip', type: 'metric' as const },
  activeStaff: { id: 'activeStaff', type: 'metric' as const },
  pendingPayouts: { id: 'pendingPayouts', type: 'alert' as const },
  topStaff: { id: 'topStaff', type: 'list' as const },
  tipHistory: { id: 'tipHistory', type: 'list' as const },
};

/**
 * Get dashboard blocks based on distribution mode
 * POOLED: totalTips, transactions, averageTip, tipHistory
 * PERSONAL: totalTips, transactions, averageTip, activeStaff, pendingPayouts, topStaff
 */
export function getDashboardBlocks(distributionMode: DistributionMode): DashboardBlock[] {
  if (isPooledMode(distributionMode)) {
    return [
      DASHBOARD_BLOCKS.totalTips,
      DASHBOARD_BLOCKS.transactions,
      DASHBOARD_BLOCKS.averageTip,
      DASHBOARD_BLOCKS.tipHistory,
    ];
  }
  
  return [
    DASHBOARD_BLOCKS.totalTips,
    DASHBOARD_BLOCKS.transactions,
    DASHBOARD_BLOCKS.averageTip,
    DASHBOARD_BLOCKS.activeStaff,
    DASHBOARD_BLOCKS.pendingPayouts,
    DASHBOARD_BLOCKS.topStaff,
  ];
}

/**
 * Check if a specific block should be visible
 */
export function isDashboardBlockVisible(blockId: string, distributionMode: DistributionMode): boolean {
  const blocks = getDashboardBlocks(distributionMode);
  return blocks.some(block => block.id === blockId);
}

/**
 * Check if active staff metric should be shown
 */
export function shouldShowActiveStaff(distributionMode: DistributionMode): boolean {
  return isPersonalMode(distributionMode);
}

/**
 * Check if top staff list should be shown (vs tip history)
 */
export function shouldShowTopStaff(distributionMode: DistributionMode): boolean {
  return isPersonalMode(distributionMode);
}

/**
 * Check if tip history should be shown (vs top staff)
 */
export function shouldShowTipHistory(distributionMode: DistributionMode): boolean {
  return isPooledMode(distributionMode);
}
