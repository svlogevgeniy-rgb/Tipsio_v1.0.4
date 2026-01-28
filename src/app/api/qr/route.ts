export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, validationError, successResponse } from '@/lib/api/error-handler';
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import prisma from '@/lib/prisma';
import { generateShortCode } from '@/lib/qr';
import type { ApiErrorResponse } from '@/types/api';

// New schema supporting INDIVIDUAL and TEAM types
const createQrSchema = z.object({
  type: z.enum(['INDIVIDUAL', 'TEAM']),
  label: z.string().min(1, 'Label is required'),
  venueId: z.string().min(1, 'Venue ID is required'),
  // For INDIVIDUAL QR - exactly one staff
  staffId: z.string().optional(),
  // For TEAM QR - minimum 2 recipients
  recipientStaffIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.type === 'INDIVIDUAL') {
      return !!data.staffId;
    }
    return true;
  },
  { message: 'Individual QR requires staffId', path: ['staffId'] }
).refine(
  (data) => {
    if (data.type === 'TEAM') {
      return data.recipientStaffIds && data.recipientStaffIds.length >= 2;
    }
    return true;
  },
  { message: 'Team QR requires at least 2 recipients', path: ['recipientStaffIds'] }
);

// GET /api/qr - List QR codes for a venue
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

    // Fetch QR codes with recipients for TEAM QRs
    const qrCodes = await prisma.qrCode.findMany({
      where: { venueId },
      include: {
        staff: {
          select: {
            id: true,
            displayName: true,
            status: true,
            avatarUrl: true,
            role: true,
          },
        },
        recipients: {
          include: {
            staff: {
              select: {
                id: true,
                displayName: true,
                status: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { tips: true },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });

    // Transform response to flatten recipients
    const transformedQrCodes = qrCodes.map(qr => ({
      ...qr,
      recipients: qr.recipients.map(r => r.staff),
    }));

    return successResponse({ qrCodes: transformedQrCodes });
  } catch (error) {
    return handleApiError(error, 'List QR codes');
  }
}

// POST /api/qr - Create QR code (INDIVIDUAL or TEAM)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const parsed = createQrSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      // Map validation errors to specific error codes
      if (firstError.path.includes('staffId')) {
        return NextResponse.json<ApiErrorResponse>(
          { code: 'INDIVIDUAL_REQUIRES_STAFF', message: 'Individual QR requires exactly one staffId' },
          { status: 400 }
        );
      }
      if (firstError.path.includes('recipientStaffIds')) {
        return NextResponse.json<ApiErrorResponse>(
          { code: 'TEAM_REQUIRES_MIN_RECIPIENTS', message: 'Team QR requires at least 2 recipients' },
          { status: 400 }
        );
      }
      return validationError(firstError.message);
    }

    const { type, label, venueId, staffId, recipientStaffIds } = parsed.data;

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;
    const { venue } = venueResult;

    // Block QR creation if Midtrans not connected
    if (!venue.midtransConnected) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'MIDTRANS_REQUIRED', message: 'Please connect Midtrans before creating QR codes' },
        { status: 400 }
      );
    }

    // Validate staff exists and belongs to venue
    if (type === 'INDIVIDUAL' && staffId) {
      const staff = await prisma.staff.findFirst({
        where: { id: staffId, venueId },
      });
      if (!staff) {
        return NextResponse.json<ApiErrorResponse>(
          { code: 'STAFF_NOT_FOUND', message: 'Staff member not found' },
          { status: 404 }
        );
      }
    }

    if (type === 'TEAM' && recipientStaffIds) {
      const staffMembers = await prisma.staff.findMany({
        where: { id: { in: recipientStaffIds }, venueId },
      });
      if (staffMembers.length !== recipientStaffIds.length) {
        return NextResponse.json<ApiErrorResponse>(
          { code: 'STAFF_NOT_FOUND', message: 'One or more staff members not found' },
          { status: 404 }
        );
      }
    }

    // Create QR code with transaction for TEAM type
    const shortCode = generateShortCode();
    
    if (type === 'INDIVIDUAL') {
      const qrCode = await prisma.qrCode.create({
        data: {
          type,
          label,
          shortCode,
          venueId,
          staffId,
        },
        include: {
          staff: {
            select: {
              id: true,
              displayName: true,
              status: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      });

      return successResponse(
        {
          message: 'QR code created successfully',
          qrCode,
        },
        201
      );
    }

    // TEAM QR - create with recipients in transaction
    const qrCode = await prisma.$transaction(async (tx) => {
      const newQr = await tx.qrCode.create({
        data: {
          type,
          label,
          shortCode,
          venueId,
        },
      });

      // Create QrCodeRecipient records
      await tx.qrCodeRecipient.createMany({
        data: recipientStaffIds!.map(sId => ({
          qrCodeId: newQr.id,
          staffId: sId,
        })),
      });

      // Fetch with recipients
      return tx.qrCode.findUnique({
        where: { id: newQr.id },
        include: {
          recipients: {
            include: {
              staff: {
                select: {
                  id: true,
                  displayName: true,
                  status: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    });

    // Transform response
    const transformedQr = {
      ...qrCode,
      recipients: qrCode?.recipients.map(r => r.staff) || [],
    };

    return successResponse(
      {
        message: 'QR code created successfully',
        qrCode: transformedQr,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, 'Create QR code');
  }
}
