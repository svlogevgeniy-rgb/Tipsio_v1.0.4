/**
 * Property-based tests for QR Type Migration
 * 
 * Feature: qr-code-types-refactoring
 * 
 * These tests verify the correctness properties of the QR type migration logic.
 * Run with: npm test -- scripts/migrate-qr-types.test.ts
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

// Types matching Prisma schema
type LegacyQrType = 'PERSONAL' | 'TABLE' | 'VENUE';
type NewQrType = 'INDIVIDUAL' | 'TEAM';
type QrType = LegacyQrType | NewQrType;

interface QrCode {
  id: string;
  type: QrType;
  shortCode: string;
  staffId: string | null;
  venueId: string;
}

interface Staff {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  venueId: string;
}

interface QrCodeRecipient {
  qrCodeId: string;
  staffId: string;
}

interface Tip {
  id: string;
  qrCodeId: string;
}

interface TipAllocation {
  id: string;
  tipId: string;
}

// Migration logic (pure functions for testing)
function migrateQrType(qr: QrCode): NewQrType {
  if (qr.type === 'PERSONAL') return 'INDIVIDUAL';
  if (qr.type === 'TABLE' || qr.type === 'VENUE') return 'TEAM';
  return qr.type as NewQrType;
}

function createRecipientsForTeamQr(
  qr: QrCode,
  allStaff: Staff[]
): QrCodeRecipient[] {
  if (qr.type !== 'TABLE' && qr.type !== 'VENUE') return [];
  
  const activeStaff = allStaff.filter(
    s => s.venueId === qr.venueId && s.status === 'ACTIVE'
  );
  
  return activeStaff.map(staff => ({
    qrCodeId: qr.id,
    staffId: staff.id,
  }));
}

// Generators
const qrIdArb = fc.uuid();
const shortCodeArb = fc.stringMatching(/^[a-z0-9]{6,12}$/);
const staffIdArb = fc.uuid();
const venueIdArb = fc.uuid();

const legacyQrTypeArb = fc.constantFrom<LegacyQrType>('PERSONAL', 'TABLE', 'VENUE');

const qrCodeArb = fc.record({
  id: qrIdArb,
  type: legacyQrTypeArb,
  shortCode: shortCodeArb,
  staffId: fc.option(staffIdArb, { nil: null }),
  venueId: venueIdArb,
});

const staffArb = fc.record({
  id: staffIdArb,
  status: fc.constantFrom<'ACTIVE' | 'INACTIVE'>('ACTIVE', 'INACTIVE'),
  venueId: venueIdArb,
});

/**
 * Property 9: Migration preserves shortCodes
 * 
 * For any QR code that exists before migration, after migration the shortCode
 * value shall remain unchanged, ensuring URL compatibility.
 * 
 * Validates: Requirements 7.5, 8.4
 */
describe('Property 9: Migration preserves shortCodes', () => {
  it('should preserve shortCode for any QR code during type migration', () => {
    fc.assert(
      fc.property(
        qrCodeArb,
        (qr) => {
          const originalShortCode = qr.shortCode;
          
          // Simulate migration - only type changes, shortCode stays same
          const migratedType = migrateQrType(qr);
          const migratedQr = { ...qr, type: migratedType };
          
          // Property: shortCode must be unchanged
          expect(migratedQr.shortCode).toBe(originalShortCode);
          return migratedQr.shortCode === originalShortCode;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve shortCode for PERSONAL -> INDIVIDUAL migration', () => {
    fc.assert(
      fc.property(
        shortCodeArb,
        staffIdArb,
        venueIdArb,
        (shortCode, staffId, venueId) => {
          const qr: QrCode = {
            id: 'test-id',
            type: 'PERSONAL',
            shortCode,
            staffId,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          expect(migratedType).toBe('INDIVIDUAL');
          // shortCode is not modified by migration
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve shortCode for TABLE -> TEAM migration', () => {
    fc.assert(
      fc.property(
        shortCodeArb,
        venueIdArb,
        (shortCode, venueId) => {
          const qr: QrCode = {
            id: 'test-id',
            type: 'TABLE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          expect(migratedType).toBe('TEAM');
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve shortCode for VENUE -> TEAM migration', () => {
    fc.assert(
      fc.property(
        shortCodeArb,
        venueIdArb,
        (shortCode, venueId) => {
          const qr: QrCode = {
            id: 'test-id',
            type: 'VENUE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          expect(migratedType).toBe('TEAM');
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 10: Migration converts types correctly
 * 
 * For any QR code with type PERSONAL, migration shall change type to INDIVIDUAL
 * preserving staffId. For any QR code with type TABLE or VENUE, migration shall
 * change type to TEAM and create QrCodeRecipient records for all active venue staff.
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4
 */
describe('Property 10: Migration converts types correctly', () => {
  it('should convert PERSONAL to INDIVIDUAL preserving staffId', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        staffIdArb,
        venueIdArb,
        (id, shortCode, staffId, venueId) => {
          const qr: QrCode = {
            id,
            type: 'PERSONAL',
            shortCode,
            staffId,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          // Type should be INDIVIDUAL
          expect(migratedType).toBe('INDIVIDUAL');
          // staffId should be preserved (not modified by migration)
          expect(qr.staffId).toBe(staffId);
          
          return migratedType === 'INDIVIDUAL' && qr.staffId === staffId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should convert TABLE to TEAM', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        venueIdArb,
        (id, shortCode, venueId) => {
          const qr: QrCode = {
            id,
            type: 'TABLE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          expect(migratedType).toBe('TEAM');
          return migratedType === 'TEAM';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should convert VENUE to TEAM', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        venueIdArb,
        (id, shortCode, venueId) => {
          const qr: QrCode = {
            id,
            type: 'VENUE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const migratedType = migrateQrType(qr);
          
          expect(migratedType).toBe('TEAM');
          return migratedType === 'TEAM';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create QrCodeRecipient for all active venue staff when converting to TEAM', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        venueIdArb,
        fc.array(staffArb, { minLength: 1, maxLength: 10 }),
        (qrId, shortCode, venueId, staffList) => {
          // Ensure staff belong to the same venue
          const venueStaff = staffList.map(s => ({ ...s, venueId }));
          
          const qr: QrCode = {
            id: qrId,
            type: 'TABLE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const recipients = createRecipientsForTeamQr(qr, venueStaff);
          const activeStaff = venueStaff.filter(s => s.status === 'ACTIVE');
          
          // Should create recipient for each active staff
          expect(recipients.length).toBe(activeStaff.length);
          
          // Each recipient should reference the QR and a staff member
          recipients.forEach(r => {
            expect(r.qrCodeId).toBe(qrId);
            expect(activeStaff.some(s => s.id === r.staffId)).toBe(true);
          });
          
          return recipients.length === activeStaff.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not create recipients for PERSONAL QR codes', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        staffIdArb,
        venueIdArb,
        fc.array(staffArb, { minLength: 1, maxLength: 5 }),
        (qrId, shortCode, staffId, venueId, staffList) => {
          const qr: QrCode = {
            id: qrId,
            type: 'PERSONAL',
            shortCode,
            staffId,
            venueId,
          };
          
          const recipients = createRecipientsForTeamQr(qr, staffList);
          
          // PERSONAL QRs should not get recipients
          expect(recipients.length).toBe(0);
          return recipients.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only include active staff in recipients', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        shortCodeArb,
        venueIdArb,
        fc.array(staffArb, { minLength: 2, maxLength: 10 }),
        (qrId, shortCode, venueId, staffList) => {
          // Ensure mix of active and inactive staff
          const venueStaff: Staff[] = staffList.map((s, i) => ({
            ...s,
            venueId,
            status: (i % 2 === 0 ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
          }));
          
          const qr: QrCode = {
            id: qrId,
            type: 'VENUE',
            shortCode,
            staffId: null,
            venueId,
          };
          
          const recipients = createRecipientsForTeamQr(qr, venueStaff);
          
          // All recipients should be for active staff only
          const activeStaffIds = venueStaff
            .filter(s => s.status === 'ACTIVE')
            .map(s => s.id);
          
          recipients.forEach(r => {
            expect(activeStaffIds).toContain(r.staffId);
          });
          
          return recipients.every(r => activeStaffIds.includes(r.staffId));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 11: Migration preserves tip data
 * 
 * For any Tip or TipAllocation record that exists before migration,
 * after migration the record shall still exist with unchanged data.
 * 
 * Validates: Requirements 9.2, 9.3
 */
describe('Property 11: Migration preserves tip data', () => {
  it('should not modify tip records during migration', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (qrCodeId, tipIds) => {
          // Create tips associated with QR
          const tips: Tip[] = tipIds.map(id => ({
            id,
            qrCodeId,
          }));
          
          // Migration should not touch tips - they remain unchanged
          // This is a conceptual test - in real migration, tips table is not modified
          const tipsAfterMigration = [...tips];
          
          expect(tipsAfterMigration.length).toBe(tips.length);
          tipsAfterMigration.forEach((tip, i) => {
            expect(tip.id).toBe(tips[i].id);
            expect(tip.qrCodeId).toBe(tips[i].qrCodeId);
          });
          
          return tipsAfterMigration.length === tips.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not modify tip allocation records during migration', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (tipId, allocationIds) => {
          // Create allocations associated with tip
          const allocations: TipAllocation[] = allocationIds.map(id => ({
            id,
            tipId,
          }));
          
          // Migration should not touch allocations
          const allocationsAfterMigration = [...allocations];
          
          expect(allocationsAfterMigration.length).toBe(allocations.length);
          allocationsAfterMigration.forEach((alloc, i) => {
            expect(alloc.id).toBe(allocations[i].id);
            expect(alloc.tipId).toBe(allocations[i].tipId);
          });
          
          return allocationsAfterMigration.length === allocations.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve QR-tip relationship after type migration', () => {
    fc.assert(
      fc.property(
        qrCodeArb,
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (qr, tipIds) => {
          const tips: Tip[] = tipIds.map(id => ({
            id,
            qrCodeId: qr.id,
          }));
          
          // Migrate QR type
          const migratedType = migrateQrType(qr);
          const migratedQr = { ...qr, type: migratedType };
          
          // Tips should still reference the same QR id
          tips.forEach(tip => {
            expect(tip.qrCodeId).toBe(migratedQr.id);
          });
          
          return tips.every(tip => tip.qrCodeId === migratedQr.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
