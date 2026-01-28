/**
 * Staff-related business logic
 */

export type StaffRole = 
  | "WAITER" 
  | "BARISTA" 
  | "BARTENDER" 
  | "HOSTESS" 
  | "CHEF" 
  | "ADMINISTRATOR" 
  | "OTHER";

export interface Staff {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  role: StaffRole;
  balance: number;
}

/**
 * Determines if avatar fallback should be shown
 * Returns true if avatarUrl is null, undefined, or empty string
 */
export function shouldShowAvatarFallback(avatarUrl: string | null | undefined): boolean {
  return !avatarUrl || avatarUrl.trim() === '';
}

/**
 * Get initials from display name for avatar fallback
 */
export function getAvatarInitials(displayName: string): string {
  return displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * All available staff roles
 */
export const ALL_STAFF_ROLES: StaffRole[] = [
  "WAITER",
  "BARISTA", 
  "BARTENDER",
  "HOSTESS",
  "CHEF",
  "ADMINISTRATOR",
  "OTHER",
];

/**
 * Role labels in Russian
 */
export const ROLE_LABELS: Record<StaffRole, string> = {
  WAITER: "Официант",
  BARISTA: "Бариста",
  BARTENDER: "Бармен",
  HOSTESS: "Хостес",
  CHEF: "Повар",
  ADMINISTRATOR: "Администратор",
  OTHER: "Другое",
};
