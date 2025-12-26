/**
 * Centralized distribution mode definitions used across venue/staff flows.
 * Helps to avoid ad-hoc string unions and keeps the allowed values consistent.
 */
export const DISTRIBUTION_MODE_VALUES = ["POOLED", "PERSONAL"] as const;

export type DistributionMode = (typeof DISTRIBUTION_MODE_VALUES)[number];

/**
 * Returns true when venue tips are pooled at venue level.
 */
export function isPooledMode(mode?: DistributionMode | null): mode is "POOLED" {
  return mode === "POOLED";
}

/**
 * Returns true when venue tips are distributed per staff member.
 */
export function isPersonalMode(mode?: DistributionMode | null): mode is "PERSONAL" {
  return mode === "PERSONAL";
}
