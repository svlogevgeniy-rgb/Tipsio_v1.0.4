/**
 * Payouts business logic
 * Handles staff balance management and payout operations
 */

export interface StaffBalance {
  id: string;
  displayName: string;
  balance: number;
}

/**
 * Process payout for a single staff member
 * Returns updated staff with balance set to 0
 * 
 * **Property 10: Обнуление баланса при выплате**
 */
export function processStaffPayout(staff: StaffBalance): StaffBalance {
  return {
    ...staff,
    balance: 0,
  };
}

/**
 * Process payout for all staff members
 * Returns updated staff list with all balances set to 0
 * 
 * **Property 11: Массовое обнуление балансов**
 */
export function processAllPayouts(staffList: StaffBalance[]): StaffBalance[] {
  return staffList.map(staff => processStaffPayout(staff));
}

/**
 * Calculate total balance across all staff
 */
export function getTotalBalance(staffList: StaffBalance[]): number {
  return staffList.reduce((sum, staff) => sum + staff.balance, 0);
}

/**
 * Get staff members with positive balance
 */
export function getStaffWithBalance(staffList: StaffBalance[]): StaffBalance[] {
  return staffList.filter(staff => staff.balance > 0);
}

/**
 * Check if staff member is eligible for payout
 */
export function isEligibleForPayout(staff: StaffBalance): boolean {
  return staff.balance > 0;
}

/**
 * Validate payout operation
 */
export function validatePayout(staff: StaffBalance): { valid: boolean; error?: string } {
  if (staff.balance <= 0) {
    return { valid: false, error: "Нет накопленных чаевых" };
  }
  return { valid: true };
}
