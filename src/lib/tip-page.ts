import { isPersonalMode, type DistributionMode } from "@/types/distribution";

export type { DistributionMode } from "@/types/distribution";

export type QrType = "PERSONAL" | "TABLE" | "VENUE";

export interface TipPageConfig {
  qrType: QrType;
  distributionMode: DistributionMode;
  allowStaffChoice: boolean;
  availableStaffCount: number;
}

/**
 * Determines if staff selection should be shown on tip page
 * 
 * Rules:
 * - For PERSONAL QR (staff-specific): never show selection (staff is pre-selected)
 * - For TABLE/VENUE QR with PERSONAL distribution: show if staff available
 * - For TABLE/VENUE QR with allowStaffChoice: show if staff available
 * - For POOLED distribution without allowStaffChoice: don't show
 */
export function shouldShowStaffSelection(config: TipPageConfig): boolean {
  // Personal QR already has staff assigned
  if (config.qrType === "PERSONAL") {
    return false;
  }

  // No staff available
  if (config.availableStaffCount === 0) {
    return false;
  }

  // PERSONAL distribution mode always shows staff selection
  if (isPersonalMode(config.distributionMode)) {
    return true;
  }

  // POOLED mode only shows if explicitly allowed
  return config.allowStaffChoice;
}

/**
 * Get default tip target based on QR type
 */
export function getDefaultTipTarget(qrType: QrType, hasStaff: boolean): "pool" | "staff" {
  if (qrType === "PERSONAL" && hasStaff) {
    return "staff";
  }
  return "pool";
}
