import { isPooledMode, isPersonalMode, type DistributionMode } from "@/types/distribution";

export type { DistributionMode } from "@/types/distribution";

export interface QrDisplayConfig {
  distributionMode: DistributionMode;
  activeStaffCount: number;
  hasVenueQr: boolean;
  hasStaffQrs: boolean;
}

/**
 * Determines if QR codes should be displayed on the QR page
 * 
 * Rules:
 * - POOLED mode: always show venue QR (auto-generated)
 * - PERSONAL mode: show only if there are active staff members
 */
export function shouldShowQrCodes(config: QrDisplayConfig): boolean {
  if (isPooledMode(config.distributionMode)) {
    return config.hasVenueQr;
  }
  
  // PERSONAL mode requires active staff
  return config.activeStaffCount > 0 && config.hasStaffQrs;
}

/**
 * Determines if "add staff" notification should be shown
 * 
 * Rules:
 * - Only for PERSONAL mode
 * - Only when no active staff
 */
export function shouldShowAddStaffNotification(config: QrDisplayConfig): boolean {
  return isPersonalMode(config.distributionMode) && config.activeStaffCount === 0;
}

/**
 * Determines if download materials should be available
 * 
 * Rules:
 * - POOLED mode: always available if venue QR exists
 * - PERSONAL mode: available only if staff QRs exist
 */
export function shouldShowDownloadMaterials(config: QrDisplayConfig): boolean {
  if (isPooledMode(config.distributionMode)) {
    return config.hasVenueQr;
  }
  
  return config.hasStaffQrs && config.activeStaffCount > 0;
}

/**
 * Get the primary QR type to display
 */
export function getPrimaryQrType(distributionMode: DistributionMode): "VENUE" | "PERSONAL" {
  return isPooledMode(distributionMode) ? "VENUE" : "PERSONAL";
}
