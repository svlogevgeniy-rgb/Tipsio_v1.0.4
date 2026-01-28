/**
 * Property-based tests for QR Code Update API
 * 
 * Feature: qr-code-types-refactoring
 * 
 * These tests verify the correctness properties of QR code updates.
 * Run with: npm test -- --run src/app/api/qr/qr-update.property.test.ts
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Types matching the API
type QrType = 'INDIVIDUAL' | 'TEAM' | 'PERSONAL' | 'TABLE' | 'VENUE';

interface QrCode {
  id: string;
  type: QrType;
  venueId: string;
}

interface UpdateRequest {
  type?: QrType;
  recipientStaffIds?: string[];
}

// Validation schema for update
const updateTeamQrSchema = z.object({
  recipientStaffIds: z.array(z.string()).min(2, 'Team QR requires at least 2 recipients'),
});

// Logic functions matching the API implementation
function isTeamType(type: QrType): boolean {
  return type === 'TEAM' || type === 'TABLE' || type === 'VENUE';
}

function validateQrUpdate(
  qrCode: QrCode,
  request: UpdateRequest
): { valid: boolean; code?: string; message?: string } {
  // Check if trying to change type
  if (request.type !== undefined && request.type !== qrCode.type) {
    return {
      valid: false,
      code: 'TYPE_CHANGE_NOT_ALLOWED',
      message: 'Cannot change QR type after creation',
    };
  }

  // Only TEAM QRs can update recipients
  if (!isTeamType(qrCode.type)) {
    return {
      valid: false,
      code: 'INVALID_OPERATION',
      message: 'Only Team QR codes can update recipients',
    };
  }

  // Validate minimum recipients
  const parsed = updateTeamQrSchema.safeParse(request);
  if (!parsed.success) {
    return {
      valid: false,
      code: 'MIN_RECIPIENTS_REQUIRED',
      message: 'Team QR requires at least 2 recipients',
    };
  }

  return { valid: true };
}

// Generators
const qrIdArb = fc.uuid();
const venueIdArb = fc.uuid();
const staffIdArb = fc.uuid();

const individualQrArb = fc.record({
  id: qrIdArb,
  type: fc.constant<QrType>('INDIVIDUAL'),
  venueId: venueIdArb,
});

const teamQrArb = fc.record({
  id: qrIdArb,
  type: fc.constantFrom<QrType>('TEAM', 'TABLE', 'VENUE'),
  venueId: venueIdArb,
});

const legacyPersonalQrArb = fc.record({
  id: qrIdArb,
  type: fc.constant<QrType>('PERSONAL'),
  venueId: venueIdArb,
});

/**
 * Property 6: QR type cannot be changed after creation
 * 
 * For any existing QR code, update requests that attempt to change the type
 * (INDIVIDUAL to TEAM or vice versa) shall be rejected with validation error.
 * 
 * Validates: Requirements 2.6, 3.8
 */
describe('Property 6: QR type cannot be changed after creation', () => {
  it('should reject type change from INDIVIDUAL to TEAM', () => {
    fc.assert(
      fc.property(
        individualQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 5 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            type: 'TEAM',
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('TYPE_CHANGE_NOT_ALLOWED');
          return !result.valid && result.code === 'TYPE_CHANGE_NOT_ALLOWED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject type change from TEAM to INDIVIDUAL', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        staffIdArb,
        (qrCode, staffId) => {
          const request: UpdateRequest = {
            type: 'INDIVIDUAL',
            recipientStaffIds: [staffId],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('TYPE_CHANGE_NOT_ALLOWED');
          return !result.valid && result.code === 'TYPE_CHANGE_NOT_ALLOWED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject type change from PERSONAL to TEAM', () => {
    fc.assert(
      fc.property(
        legacyPersonalQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 5 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            type: 'TEAM',
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('TYPE_CHANGE_NOT_ALLOWED');
          return !result.valid && result.code === 'TYPE_CHANGE_NOT_ALLOWED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject type change from TABLE to INDIVIDUAL', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        venueIdArb,
        staffIdArb,
        (id, venueId, staffId) => {
          const qrCode: QrCode = { id, type: 'TABLE', venueId };
          const request: UpdateRequest = {
            type: 'INDIVIDUAL',
            recipientStaffIds: [staffId],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('TYPE_CHANGE_NOT_ALLOWED');
          return !result.valid && result.code === 'TYPE_CHANGE_NOT_ALLOWED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject type change from VENUE to INDIVIDUAL', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        venueIdArb,
        staffIdArb,
        (id, venueId, staffId) => {
          const qrCode: QrCode = { id, type: 'VENUE', venueId };
          const request: UpdateRequest = {
            type: 'INDIVIDUAL',
            recipientStaffIds: [staffId],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('TYPE_CHANGE_NOT_ALLOWED');
          return !result.valid && result.code === 'TYPE_CHANGE_NOT_ALLOWED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow update without type change for TEAM QR', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 10 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            // No type field - not changing type
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(true);
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow update with same type for TEAM QR', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 10 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            type: qrCode.type, // Same type
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(true);
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 14: Team QR minimum recipients on edit
 * 
 * For any Team QR edit request that removes recipients, the system shall
 * reject the request if it would result in fewer than 2 recipients remaining.
 * 
 * Validates: Requirements 11.3
 */
describe('Property 14: Team QR minimum recipients on edit', () => {
  it('should reject update with only 1 recipient', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        staffIdArb,
        (qrCode, staffId) => {
          const request: UpdateRequest = {
            recipientStaffIds: [staffId], // Only 1 recipient
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('MIN_RECIPIENTS_REQUIRED');
          return !result.valid && result.code === 'MIN_RECIPIENTS_REQUIRED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject update with empty recipients array', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        (qrCode) => {
          const request: UpdateRequest = {
            recipientStaffIds: [], // Empty
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('MIN_RECIPIENTS_REQUIRED');
          return !result.valid && result.code === 'MIN_RECIPIENTS_REQUIRED';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept update with exactly 2 recipients (minimum)', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        staffIdArb,
        staffIdArb,
        (qrCode, staffId1, staffId2) => {
          const request: UpdateRequest = {
            recipientStaffIds: [staffId1, staffId2],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(true);
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept update with more than 2 recipients', () => {
    fc.assert(
      fc.property(
        teamQrArb,
        fc.array(staffIdArb, { minLength: 3, maxLength: 10 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(true);
          return result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject update for legacy TABLE QR with only 1 recipient', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        venueIdArb,
        staffIdArb,
        (id, venueId, staffId) => {
          const qrCode: QrCode = { id, type: 'TABLE', venueId };
          const request: UpdateRequest = {
            recipientStaffIds: [staffId],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('MIN_RECIPIENTS_REQUIRED');
          return !result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject update for legacy VENUE QR with only 1 recipient', () => {
    fc.assert(
      fc.property(
        qrIdArb,
        venueIdArb,
        staffIdArb,
        (id, venueId, staffId) => {
          const qrCode: QrCode = { id, type: 'VENUE', venueId };
          const request: UpdateRequest = {
            recipientStaffIds: [staffId],
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('MIN_RECIPIENTS_REQUIRED');
          return !result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional validation tests for QR update
 */
describe('QR Update Validation', () => {
  it('should reject recipient update for INDIVIDUAL QR', () => {
    fc.assert(
      fc.property(
        individualQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 5 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('INVALID_OPERATION');
          return !result.valid && result.code === 'INVALID_OPERATION';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject recipient update for legacy PERSONAL QR', () => {
    fc.assert(
      fc.property(
        legacyPersonalQrArb,
        fc.array(staffIdArb, { minLength: 2, maxLength: 5 }),
        (qrCode, recipientStaffIds) => {
          const request: UpdateRequest = {
            recipientStaffIds,
          };

          const result = validateQrUpdate(qrCode, request);

          expect(result.valid).toBe(false);
          expect(result.code).toBe('INVALID_OPERATION');
          return !result.valid && result.code === 'INVALID_OPERATION';
        }
      ),
      { numRuns: 100 }
    );
  });
});
