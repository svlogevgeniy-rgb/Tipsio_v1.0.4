/**
 * @deprecated Distribution mode is deprecated. Use QR types (INDIVIDUAL/TEAM) instead.
 * 
 * Centralized distribution mode definitions used across venue/staff flows.
 * Kept for backward compatibility only.
 */
export const DISTRIBUTION_MODE_VALUES = ["POOLED", "PERSONAL"] as const;

/**
 * @deprecated Use QR types (INDIVIDUAL/TEAM) instead of distribution mode.
 */
export type DistributionMode = (typeof DISTRIBUTION_MODE_VALUES)[number];

/**
 * @deprecated Distribution mode is deprecated. Use QR types instead.
 * Returns true when venue tips are pooled at venue level.
 */
export function isPooledMode(mode?: DistributionMode | null): mode is "POOLED" {
  return mode === "POOLED";
}

/**
 * @deprecated Distribution mode is deprecated. Use QR types instead.
 * Returns true when venue tips are distributed per staff member.
 */
export function isPersonalMode(mode?: DistributionMode | null): mode is "PERSONAL" {
  return mode === "PERSONAL";
}
