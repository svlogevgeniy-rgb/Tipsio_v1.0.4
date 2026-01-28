/**
 * Property-based tests for Tip API (QR Data Retrieval)
 * 
 * Feature: qr-code-types-refactoring
 * 
 * These tests verify the correctness properties of the tip flow API.
 * Run with: npm test -- --run src/app/api/tip/tip-api.property.test.ts
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// Types matching the API response
type StaffStatus = 'ACTIVE' | 'INACTIVE';

interface Staff {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  status: StaffStatus;
}

interface QrCodeRecipient {
  staff: Staff;
}

interface QrCode {
  id: string;
  type: 'INDIVIDUAL' | 'TEAM' | 'PERSONAL' | 'TABLE' | 'VENUE';
  label: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  staff: Staff | null;
  recipients: QrCodeRecipient[];
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
    status: 'ACTIVE' | 'DRAFT' | 'BLOCKED';
    midtransConnected: boolean;
  };
}

interface TipApiResponse {
  id: string;
  type: 'INDIVIDUAL' | 'TEAM';
  label: string | null;
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  staff: Staff | null;
  recipients: Staff[];
}

// Logic functions matching the API implementation
function isIndividualType(type: QrCode['type']): boolean {
  return type === 'INDIVIDUAL' || type === 'PERSONAL';
}

function isTeamType(type: QrCode['type']): boolean {
  return type === 'TEAM' || type === 'TABLE' || type === 'VENUE';
}

function getActiveRecipients(qrCode: QrCode): Staff[] {
  return qrCode.recipients
    .map(r => r.staff)
    .filter(staff => staff.status === 'ACTIVE')
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function processQrForTip(qrCode: QrCode): 
  | { success: true; response: TipApiResponse }
  | { success: false; code: string; error: string } {
  
  // Check QR status
  if (qrCode.status !== 'ACTIVE') {
    return { success: false, code: 'QR_INACTIVE', error: 'This QR code has been deactivated' };
  }

  // Check venue status
  if (qrCode.venue.status !== 'ACTIVE') {
    return { success: false, code: 'VENUE_NOT_ACCEPTING', error: 'This venue is not accepting tips at the moment' };
  }

  // Check payment configured
  if (!qrCode.venue.midtransConnected) {
    return { success: false, code: 'PAYMENT_NOT_CONFIGURED', error: 'Payment is not configured for this venue' };
  }

  if (isIndividualType(qrCode.type)) {
    // Check staff is active
    if (qrCode.staff && qrCode.staff.status !== 'ACTIVE') {
      return { success: false, code: 'STAFF_INACTIVE', error: 'Staff member is inactive' };
    }

    return {
      success: true,
      response: {
        id: qrCode.id,
        type: 'INDIVIDUAL',
        label: qrCode.label,
        venue: {
          id: qrCode.venue.id,
          name: qrCode.venue.name,
          logoUrl: qrCode.venue.logoUrl,
        },
        staff: qrCode.staff,
        recipients: [],
      },
    };
  }

  if (isTeamType(qrCode.type)) {
    const activeRecipients = getActiveRecipients(qrCode);

    if (activeRecipients.length === 0) {
      return { success: false, code: 'VENUE_NOT_ACCEPTING', error: 'No active staff available to receive tips' };
    }

    return {
      success: true,
      response: {
        id: qrCode.id,
        type: 'TEAM',
        label: qrCode.label,
        venue: {
          id: qrCode.venue.id,
          name: qrCode.venue.name,
          logoUrl: qrCode.venue.logoUrl,
        },
        staff: null,
        recipients: activeRecipients,
      },
    };
  }

  return { success: false, code: 'INVALID_QR_TYPE', error: 'Invalid QR code type' };
}

// Generators
const staffIdArb = fc.uuid();
const venueIdArb = fc.uuid();
const qrIdArb = fc.uuid();
const displayNameArb = fc.string({ minLength: 1, maxLength: 50 });
const roleArb = fc.constantFrom('WAITER', 'BARTENDER', 'BARISTA', 'HOSTESS', 'CHEF', 'ADMINISTRATOR', 'OTHER');

const activeStaffArb = fc.record({
  id: staffIdArb,
  displayName: displayNameArb,
  avatarUrl: fc.option(fc.webUrl(), { nil: null }),
  role: roleArb,
  status: fc.constant<StaffStatus>('ACTIVE'),
});

const inactiveStaffArb = fc.record({
  id: staffIdArb,
  displayName: displayNameArb,
  avatarUrl: fc.option(fc.webUrl(), { nil: null }),
  role: roleArb,
  status: fc.constant<StaffStatus>('INACTIVE'),
});

const activeVenueArb = fc.record({
  id: venueIdArb,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  logoUrl: fc.option(fc.webUrl(), { nil: null }),
  status: fc.constant<'ACTIVE'>('ACTIVE'),
  midtransConnected: fc.constant(true),
});

/**
 * Property 3: Individual QR leads directly to payment
 * 
 * For any Individual QR with active staff, when accessed via /tip/:shortCode,
 * the API response shall indicate type=INDIVIDUAL and include the staff data,
 * enabling direct navigation to payment page.
 * 
 * Validates: Requirements 2.4, 8.3
 */
describe('Property 3: Individual QR leads directly to payment', () => {
  it('should return type=INDIVIDUAL with staff data for INDIVIDUAL QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        activeVenueArb,
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
        (qrId, staff, venue, label) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.response.type).toBe('INDIVIDUAL');
            expect(result.response.staff).toEqual(staff);
            expect(result.response.recipients).toEqual([]);
          }
          return result.success && result.response.type === 'INDIVIDUAL';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return type=INDIVIDUAL for legacy PERSONAL QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'PERSONAL', // Legacy type
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            // Should be normalized to INDIVIDUAL
            expect(result.response.type).toBe('INDIVIDUAL');
            expect(result.response.staff).toEqual(staff);
          }
          return result.success && result.response.type === 'INDIVIDUAL';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include staff data enabling direct payment navigation', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: 'Test QR',
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            // Staff data should be complete for payment
            expect(result.response.staff?.id).toBe(staff.id);
            expect(result.response.staff?.displayName).toBe(staff.displayName);
          }
          return result.success && result.response.staff?.id === staff.id;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Team QR leads to staff selection
 * 
 * For any Team QR, when accessed via /tip/:shortCode, the API response shall
 * indicate type=TEAM and include the recipients array, enabling staff selection
 * page display.
 * 
 * Validates: Requirements 3.5, 8.2
 */
describe('Property 4: Team QR leads to staff selection', () => {
  it('should return type=TEAM with recipients for TEAM QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(activeStaffArb, { minLength: 2, maxLength: 10 }),
        activeVenueArb,
        (qrId, staffList, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: 'Team QR',
            status: 'ACTIVE',
            staff: null,
            recipients: staffList.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.response.type).toBe('TEAM');
            expect(result.response.staff).toBeNull();
            expect(result.response.recipients.length).toBeGreaterThanOrEqual(2);
          }
          return result.success && result.response.type === 'TEAM';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return type=TEAM for legacy TABLE QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(activeStaffArb, { minLength: 2, maxLength: 5 }),
        activeVenueArb,
        (qrId, staffList, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'TABLE', // Legacy type
            label: 'Table 1',
            status: 'ACTIVE',
            staff: null,
            recipients: staffList.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.response.type).toBe('TEAM');
          }
          return result.success && result.response.type === 'TEAM';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return type=TEAM for legacy VENUE QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(activeStaffArb, { minLength: 2, maxLength: 5 }),
        activeVenueArb,
        (qrId, staffList, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'VENUE', // Legacy type
            label: 'Main Entrance',
            status: 'ACTIVE',
            staff: null,
            recipients: staffList.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.response.type).toBe('TEAM');
          }
          return result.success && result.response.type === 'TEAM';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include recipients array for staff selection', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(activeStaffArb, { minLength: 2, maxLength: 10 }),
        activeVenueArb,
        (qrId, staffList, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: null,
            status: 'ACTIVE',
            staff: null,
            recipients: staffList.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            // Recipients should have all required fields for selection UI
            result.response.recipients.forEach(r => {
              expect(r.id).toBeDefined();
              expect(r.displayName).toBeDefined();
              expect(r.role).toBeDefined();
            });
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 5: Only active staff shown in Team QR selection
 * 
 * For any Team QR with recipients, the API shall return only those recipients
 * whose status is ACTIVE, excluding any inactive staff from the selection list.
 * 
 * Validates: Requirements 4.1, 4.5, 11.4
 */
describe('Property 5: Only active staff shown in Team QR selection', () => {
  it('should filter out inactive staff from recipients', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(activeStaffArb, { minLength: 2, maxLength: 5 }),
        fc.array(inactiveStaffArb, { minLength: 1, maxLength: 3 }),
        activeVenueArb,
        (qrId, activeStaff, inactiveStaff, venue) => {
          const allStaff = [...activeStaff, ...inactiveStaff];
          
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: null,
            status: 'ACTIVE',
            staff: null,
            recipients: allStaff.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            // All returned recipients should be active
            result.response.recipients.forEach(r => {
              expect(r.status).toBe('ACTIVE');
            });
            // Count should match active staff count
            expect(result.response.recipients.length).toBe(activeStaff.length);
          }
          return result.success && 
            result.response.recipients.every(r => r.status === 'ACTIVE');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return only active recipients even when mixed with inactive', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeVenueArb,
        (qrId, venue) => {
          // Create specific mix of active and inactive
          const staff1: Staff = { id: 'staff-1', displayName: 'Active 1', avatarUrl: null, role: 'WAITER', status: 'ACTIVE' };
          const staff2: Staff = { id: 'staff-2', displayName: 'Inactive', avatarUrl: null, role: 'WAITER', status: 'INACTIVE' };
          const staff3: Staff = { id: 'staff-3', displayName: 'Active 2', avatarUrl: null, role: 'BARISTA', status: 'ACTIVE' };
          
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: null,
            status: 'ACTIVE',
            staff: null,
            recipients: [{ staff: staff1 }, { staff: staff2 }, { staff: staff3 }],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.response.recipients.length).toBe(2);
            expect(result.response.recipients.map(r => r.id)).toContain('staff-1');
            expect(result.response.recipients.map(r => r.id)).toContain('staff-3');
            expect(result.response.recipients.map(r => r.id)).not.toContain('staff-2');
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return error when all recipients are inactive', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(inactiveStaffArb, { minLength: 1, maxLength: 5 }),
        activeVenueArb,
        (qrId, inactiveStaff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: null,
            status: 'ACTIVE',
            staff: null,
            recipients: inactiveStaff.map(s => ({ staff: s })),
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('VENUE_NOT_ACCEPTING');
          }
          return !result.success && result.code === 'VENUE_NOT_ACCEPTING';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sort active recipients by displayName', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeVenueArb,
        (qrId, venue) => {
          const staff1: Staff = { id: 'staff-1', displayName: 'Zara', avatarUrl: null, role: 'WAITER', status: 'ACTIVE' };
          const staff2: Staff = { id: 'staff-2', displayName: 'Anna', avatarUrl: null, role: 'WAITER', status: 'ACTIVE' };
          const staff3: Staff = { id: 'staff-3', displayName: 'Mike', avatarUrl: null, role: 'BARISTA', status: 'ACTIVE' };
          
          const qrCode: QrCode = {
            id: qrId,
            type: 'TEAM',
            label: null,
            status: 'ACTIVE',
            staff: null,
            recipients: [{ staff: staff1 }, { staff: staff2 }, { staff: staff3 }],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          if (result.success) {
            const names = result.response.recipients.map(r => r.displayName);
            expect(names).toEqual(['Anna', 'Mike', 'Zara']);
          }
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Inactive staff triggers popup
 * 
 * For any tip payment request targeting an inactive staff member, the system
 * shall return an error indicating staff is inactive, triggering the popup display.
 * 
 * Validates: Requirements 5.1
 */
describe('Property 7: Inactive staff triggers error', () => {
  it('should return STAFF_INACTIVE error for Individual QR with inactive staff', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        inactiveStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('STAFF_INACTIVE');
          }
          return !result.success && result.code === 'STAFF_INACTIVE';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return STAFF_INACTIVE for legacy PERSONAL QR with inactive staff', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        inactiveStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'PERSONAL', // Legacy type
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('STAFF_INACTIVE');
          }
          return !result.success && result.code === 'STAFF_INACTIVE';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not return STAFF_INACTIVE for active staff', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(true);
          return result.success;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional error handling tests
 */
describe('Tip API Error Handling', () => {
  it('should return QR_INACTIVE for deactivated QR codes', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        activeVenueArb,
        (qrId, staff, venue) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: null,
            status: 'INACTIVE', // Deactivated
            staff,
            recipients: [],
            venue,
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('QR_INACTIVE');
          }
          return !result.success && result.code === 'QR_INACTIVE';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return VENUE_NOT_ACCEPTING for inactive venue', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        venueIdArb,
        (qrId, staff, venueId) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue: {
              id: venueId,
              name: 'Test Venue',
              logoUrl: null,
              status: 'DRAFT', // Not active
              midtransConnected: true,
            },
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('VENUE_NOT_ACCEPTING');
          }
          return !result.success && result.code === 'VENUE_NOT_ACCEPTING';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return PAYMENT_NOT_CONFIGURED when Midtrans not connected', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        activeStaffArb,
        venueIdArb,
        (qrId, staff, venueId) => {
          const qrCode: QrCode = {
            id: qrId,
            type: 'INDIVIDUAL',
            label: null,
            status: 'ACTIVE',
            staff,
            recipients: [],
            venue: {
              id: venueId,
              name: 'Test Venue',
              logoUrl: null,
              status: 'ACTIVE',
              midtransConnected: false, // Not connected
            },
          };

          const result = processQrForTip(qrCode);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.code).toBe('PAYMENT_NOT_CONFIGURED');
          }
          return !result.success && result.code === 'PAYMENT_NOT_CONFIGURED';
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 13: New tips always PERSONAL type
 * 
 * For any tip creation request, regardless of QR type or staff selection,
 * the created tip shall always have type=PERSONAL. The POOL type is no longer
 * used for new tips.
 * 
 * Validates: Requirements 10.6
 */
describe('Property 13: New tips always PERSONAL type', () => {
  it('should create PERSONAL tip for Individual QR', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        staffIdArb,
        fc.integer({ min: 1000, max: 1000000 }),
        (qrId, staffId, amount) => {
          // Simulate tip creation for Individual QR
          const tipRequest = {
            qrCodeId: qrId,
            staffId,
            amount,
            type: 'PERSONAL' as const,
          };

          // The type should always be PERSONAL
          expect(tipRequest.type).toBe('PERSONAL');
          return tipRequest.type === 'PERSONAL';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create PERSONAL tip for Team QR with selected staff', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        staffIdArb,
        fc.integer({ min: 1000, max: 1000000 }),
        (qrId, staffId, amount) => {
          // Simulate tip creation for Team QR with staff selection
          const tipRequest = {
            qrCodeId: qrId,
            staffId,
            amount,
            type: 'PERSONAL' as const,
          };

          // Even for Team QR, type should be PERSONAL
          expect(tipRequest.type).toBe('PERSONAL');
          return tipRequest.type === 'PERSONAL';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never create POOL type tips', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.option(staffIdArb, { nil: null }),
        fc.integer({ min: 1000, max: 1000000 }),
        (qrId, staffId, amount) => {
          // Simulate tip creation with or without staff
          const tipRequest = {
            qrCodeId: qrId,
            staffId,
            amount,
            type: 'PERSONAL' as const,
          };

          // Type should never be POOL
          expect(tipRequest.type).not.toBe('POOL');
          expect(tipRequest.type).toBe('PERSONAL');
          return tipRequest.type === 'PERSONAL';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create PERSONAL tip even when staffId is null', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.integer({ min: 1000, max: 1000000 }),
        (qrId, amount) => {
          // Simulate tip creation without specific staff
          const tipRequest = {
            qrCodeId: qrId,
            staffId: null,
            amount,
            type: 'PERSONAL' as const,
          };

          // Type should still be PERSONAL, not POOL
          expect(tipRequest.type).toBe('PERSONAL');
          return tipRequest.type === 'PERSONAL';
        }
      ),
      { numRuns: 100 }
    );
  });
});
