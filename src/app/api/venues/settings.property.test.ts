/**
 * Property-based tests for Venue Settings API
 * Feature: qr-code-types-refactoring
 * 
 * Property 18: Settings API ignores distribution fields
 * Validates: Requirements 10.5
 */

import { NextRequest } from 'next/server';
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma - must be before imports that use it
vi.mock('@/lib/prisma', () => ({
  default: {
    venue: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock middleware
vi.mock('@/lib/api/middleware', () => ({
  requireAuth: vi.fn(),
  requireVenueAccess: vi.fn(),
}));

import { requireAuth, requireVenueAccess } from '@/lib/api/middleware';
import prisma from '@/lib/prisma';
import { PATCH } from './[id]/settings/route';

describe('Feature: qr-code-types-refactoring - Settings API', () => {
  const mockSession = {
    user: { id: 'user-1', email: 'test@example.com', role: 'ADMIN' as const },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    managerId: 'user-1',
    distributionMode: 'PERSONAL',
    allowStaffChoice: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ session: mockSession } as any);
    vi.mocked(requireVenueAccess).mockResolvedValue({ venue: mockVenue } as any);
    vi.mocked(prisma.venue.findUnique).mockResolvedValue(mockVenue as any);
    vi.mocked(prisma.venue.update).mockResolvedValue(mockVenue as any);
  });

  describe('Property 18: Settings API ignores distribution fields', () => {
    it('should ignore distributionMode field in PATCH request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('PERSONAL', 'POOLED', 'INVALID', null, undefined),
          async (distributionMode) => {
            vi.clearAllMocks();
            vi.mocked(requireAuth).mockResolvedValue({ session: mockSession } as any);
            vi.mocked(requireVenueAccess).mockResolvedValue({ venue: mockVenue } as any);
            vi.mocked(prisma.venue.update).mockResolvedValue(mockVenue as any);

            const request = new NextRequest('http://localhost/api/venues/venue-1/settings', {
              method: 'PATCH',
              body: JSON.stringify({ distributionMode }),
              headers: { 'Content-Type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: 'venue-1' }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify distributionMode was NOT passed to update
            const updateMock = vi.mocked(prisma.venue.update);
            if (updateMock.mock.calls.length > 0) {
              const updateCall = updateMock.mock.calls[0][0];
              expect(updateCall.data).not.toHaveProperty('distributionMode');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should ignore allowStaffChoice field in PATCH request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(true, false, null, undefined, 'invalid'),
          async (allowStaffChoice) => {
            vi.clearAllMocks();
            vi.mocked(requireAuth).mockResolvedValue({ session: mockSession } as any);
            vi.mocked(requireVenueAccess).mockResolvedValue({ venue: mockVenue } as any);
            vi.mocked(prisma.venue.update).mockResolvedValue(mockVenue as any);

            const request = new NextRequest('http://localhost/api/venues/venue-1/settings', {
              method: 'PATCH',
              body: JSON.stringify({ allowStaffChoice }),
              headers: { 'Content-Type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: 'venue-1' }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify allowStaffChoice was NOT passed to update
            const updateMock = vi.mocked(prisma.venue.update);
            if (updateMock.mock.calls.length > 0) {
              const updateCall = updateMock.mock.calls[0][0];
              expect(updateCall.data).not.toHaveProperty('allowStaffChoice');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should ignore both distribution fields while accepting Midtrans fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            distributionMode: fc.constantFrom('PERSONAL', 'POOLED'),
            allowStaffChoice: fc.boolean(),
            midtransMerchantId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          }),
          async ({ distributionMode, allowStaffChoice, midtransMerchantId }) => {
            vi.clearAllMocks();
            vi.mocked(requireAuth).mockResolvedValue({ session: mockSession } as any);
            vi.mocked(requireVenueAccess).mockResolvedValue({ venue: mockVenue } as any);
            vi.mocked(prisma.venue.update).mockResolvedValue(mockVenue as any);

            const body: Record<string, unknown> = {
              distributionMode,
              allowStaffChoice,
            };
            if (midtransMerchantId !== null) {
              body.midtransMerchantId = midtransMerchantId;
            }

            const request = new NextRequest('http://localhost/api/venues/venue-1/settings', {
              method: 'PATCH',
              body: JSON.stringify(body),
              headers: { 'Content-Type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: 'venue-1' }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify distribution fields were NOT passed to update
            const updateMock = vi.mocked(prisma.venue.update);
            if (updateMock.mock.calls.length > 0) {
              const updateCall = updateMock.mock.calls[0][0];
              expect(updateCall.data).not.toHaveProperty('distributionMode');
              expect(updateCall.data).not.toHaveProperty('allowStaffChoice');
              
              // Midtrans field should be passed if provided
              if (midtransMerchantId !== null) {
                expect(updateCall.data).toHaveProperty('midtransMerchantId', midtransMerchantId);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
