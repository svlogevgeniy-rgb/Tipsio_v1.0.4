/**
 * Centralized constants for the Tipsio application
 * 
 * These constants are used across the codebase to ensure consistency
 * and reduce magic strings duplication.
 */

// Staff roles - matches Prisma enum
export const STAFF_ROLES = [
  'WAITER',
  'BARTENDER',
  'BARISTA',
  'HOSTESS',
  'CHEF',
  'ADMINISTRATOR',
  'OTHER',
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

// Tip statuses - matches Prisma enum
export const TIP_STATUSES = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
] as const;
export type TipStatus = (typeof TIP_STATUSES)[number];

// QR code types - matches Prisma enum
export const QR_CODE_TYPES = [
  'PERSONAL',
  'VENUE',
  'TABLE',
] as const;
export type QrCodeType = (typeof QR_CODE_TYPES)[number];

// Staff statuses
export const STAFF_STATUSES = [
  'ACTIVE',
  'INACTIVE',
] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

// User roles - matches Prisma enum
export const USER_ROLES = [
  'ADMIN',
  'MANAGER',
  'STAFF',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Distribution modes
export const DISTRIBUTION_MODES = [
  'PERSONAL',
  'POOLED',
  'HYBRID',
] as const;
export type DistributionMode = (typeof DISTRIBUTION_MODES)[number];

// API paths for client-side usage
export const API_PATHS = {
  STAFF: '/api/staff',
  VENUES: '/api/venues',
  QR: '/api/qr',
  TIPS: '/api/tips',
  PAYOUTS: '/api/payouts',
  ADMIN: '/api/admin',
} as const;
