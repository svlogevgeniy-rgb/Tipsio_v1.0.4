export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleApiError, successResponse, validationError } from '@/lib/api/error-handler';
import { getVenueIdFromQuery, requireAuth, requireVenueAccess } from '@/lib/api/middleware';
import { STAFF_ROLES, type StaffRole } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { generateShortCode } from '@/lib/qr';

const createStaffSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  fullName: z.string().optional(),
  role: z.enum(STAFF_ROLES),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  participatesInPool: z.boolean().default(true),
  avatarUrl: z.string().optional(),
});

// GET /api/staff - List staff for current venue
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Get and validate venueId
    const venueIdResult = getVenueIdFromQuery(request.url);
    if ('error' in venueIdResult) return venueIdResult.error;
    const { venueId } = venueIdResult;

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Check if we should include inactive staff
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    // Fetch staff list (exclude INACTIVE by default)
    const staffList = await prisma.staff.findMany({
      where: { 
        venueId,
        ...(includeInactive ? {} : { status: 'ACTIVE' }),
      },
      include: {
        qrCode: {
          select: {
            id: true,
            shortCode: true,
            status: true,
          },
        },
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            tips: true,
          },
        },
        tips: {
          where: {
            status: 'PAID',
          },
          select: {
            amount: true,
          },
        },
        allocations: {
          select: {
            amount: true,
            payoutId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totalTips and balance for each staff member
    const staff = staffList.map((s) => {
      // Total from direct tips (PERSONAL mode) - only PAID tips
      const totalFromTips = s.tips.reduce((sum, tip) => sum + tip.amount, 0);
      // Total from allocations (POOLED mode)
      const totalFromAllocations = s.allocations.reduce((sum, a) => sum + a.amount, 0);
      const totalTips = totalFromTips + totalFromAllocations;

      // Paid out = allocations that have payoutId (already paid to staff)
      const paidOutFromAllocations = s.allocations
        .filter((a) => a.payoutId)
        .reduce((sum, a) => sum + a.amount, 0);

      // Balance = total earned minus paid out
      const balance = totalTips - paidOutFromAllocations;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tips, allocations, ...staffData } = s;
      return {
        ...staffData,
        totalTips,
        balance,
      };
    });

    return successResponse({ staff });
  } catch (error) {
    return handleApiError(error, 'List staff');
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Parse request body
    const body = await request.json();
    const { venueId, ...staffData } = body;

    if (!venueId) {
      return validationError('venueId is required');
    }

    // Validate staff data
    const parsed = createStaffSchema.safeParse(staffData);
    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Create staff with personal QR code in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account if phone or email provided
      let userId: string | undefined;
      const { phone, email, ...restData } = parsed.data;

      if (phone || email) {
        const user = await tx.user.create({
          data: {
            phone: phone || null,
            email: email || null,
            role: 'STAFF',
          },
        });
        userId = user.id;
      }

      // Create staff member
      const staff = await tx.staff.create({
        data: {
          displayName: restData.displayName,
          fullName: restData.fullName,
          role: restData.role as StaffRole,
          participatesInPool: restData.participatesInPool,
          avatarUrl: restData.avatarUrl,
          venue: { connect: { id: venueId } },
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });

      // Auto-generate personal QR code
      const shortCode = generateShortCode();
      const qrCode = await tx.qrCode.create({
        data: {
          type: 'PERSONAL',
          label: staff.displayName,
          shortCode,
          venueId,
          staffId: staff.id,
        },
      });

      return { staff, qrCode };
    });

    return successResponse(
      {
        message: 'Staff member created successfully',
        staff: result.staff,
        qrCode: result.qrCode,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, 'Create staff');
  }
}
