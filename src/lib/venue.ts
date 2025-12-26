import { isPooledMode, type DistributionMode } from "@/types/distribution";

export type { DistributionMode } from "@/types/distribution";

export interface VenueCreationData {
  name: string;
  distributionMode: DistributionMode;
}

export interface QrCode {
  type: "VENUE" | "PERSONAL" | "TABLE";
  label: string;
  shortCode: string;
}

/**
 * Determines if a venue QR code should be auto-generated
 * For POOLED mode, a venue-level QR is automatically created
 */
export function shouldAutoGenerateVenueQr(distributionMode: DistributionMode): boolean {
  return isPooledMode(distributionMode);
}

/**
 * Creates QR code data for a venue in POOLED mode
 */
export function createVenueQrData(venueName: string, shortCode: string): QrCode {
  return {
    type: "VENUE",
    label: venueName,
    shortCode,
  };
}

/**
 * Validates that a venue in POOLED mode has a venue-level QR code
 */
export function validatePooledVenueHasQr(
  distributionMode: DistributionMode,
  qrCodes: QrCode[]
): boolean {
  if (!isPooledMode(distributionMode)) {
    return true; // Not applicable for PERSONAL mode
  }
  return qrCodes.some(qr => qr.type === "VENUE");
}
