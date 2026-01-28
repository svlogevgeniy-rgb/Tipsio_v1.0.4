export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api/error-handler';
import { requireAuth, requireVenueAccess } from '@/lib/api/middleware';
import prisma from '@/lib/prisma';
import type { ApiErrorResponse } from '@/types/api';

// Schema for updating Team QR recipients
const updateTeamQrSchema = z.object({
  recipientStaffIds: z.array(z.string()).min(2, 'Team QR requires at least 2 recipients'),
});

// GET /api/qr/:id - Get single QR code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Fetch QR code
    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            managerId: true,
          },
        },
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
    });

    if (!qrCode) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'QR_NOT_FOUND', message: 'QR code not found' },
        { status: 404 }
      );
    }

    // Check venue access
    const venueResult = await requireVenueAccess(qrCode.venue.id, session);
    if ('error' in venueResult) return venueResult.error;

    // Transform response
    const transformedQr = {
      ...qrCode,
      recipients: qrCode.recipients.map(r => r.staff),
    };

    return successResponse({ qrCode: transformedQr });
  } catch (error) {
    return handleApiError(error, 'Get QR code');
  }
}

// PATCH /api/qr/:id - Update Team QR recipients
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Fetch QR code
    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            managerId: true,
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'QR_NOT_FOUND', message: 'QR code not found' },
        { status: 404 }
      );
    }

    // Check venue access
    const venueResult = await requireVenueAccess(qrCode.venue.id, session);
    if ('error' in venueResult) return venueResult.error;

    // Parse request body
    const body = await request.json();

    // Check if trying to change type
    if (body.type !== undefined && body.type !== qrCode.type) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'TYPE_CHANGE_NOT_ALLOWED', message: 'Cannot change QR type after creation' },
        { status: 400 }
      );
    }

    // Only TEAM QRs can update recipients
    const isTeamType = qrCode.type === 'TEAM' || qrCode.type === 'TABLE' || qrCode.type === 'VENUE';
    
    if (!isTeamType) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'INVALID_OPERATION', message: 'Only Team QR codes can update recipients' },
        { status: 400 }
      );
    }

    // Validate request
    const parsed = updateTeamQrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'MIN_RECIPIENTS_REQUIRED', message: 'Team QR requires at least 2 recipients' },
        { status: 400 }
      );
    }

    const { recipientStaffIds } = parsed.data;

    // Validate all staff exist and belong to venue
    const staffMembers = await prisma.staff.findMany({
      where: { id: { in: recipientStaffIds }, venueId: qrCode.venue.id },
    });

    if (staffMembers.length !== recipientStaffIds.length) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'STAFF_NOT_FOUND', message: 'One or more staff members not found' },
        { status: 404 }
      );
    }

    // Update recipients in transaction
    const updatedQr = await prisma.$transaction(async (tx) => {
      // Delete existing recipients
      await tx.qrCodeRecipient.deleteMany({
        where: { qrCodeId: id },
      });

      // Create new recipients
      await tx.qrCodeRecipient.createMany({
        data: recipientStaffIds.map(staffId => ({
          qrCodeId: id,
          staffId,
        })),
      });

      // Fetch updated QR with recipients
      return tx.qrCode.findUnique({
        where: { id },
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
        },
      });
    });

    // Transform response
    const transformedQr = {
      ...updatedQr,
      recipients: updatedQr?.recipients.map(r => r.staff) || [],
    };

    return successResponse({
      message: 'QR code updated successfully',
      qrCode: transformedQr,
    });
  } catch (error) {
    return handleApiError(error, 'Update QR code');
  }
}

// DELETE /api/qr/:id - Delete QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Fetch QR code
    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            managerId: true,
          },
        },
        _count: {
          select: { tips: true },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'QR_NOT_FOUND', message: 'QR code not found' },
        { status: 404 }
      );
    }

    // Check venue access
    const venueResult = await requireVenueAccess(qrCode.venue.id, session);
    if ('error' in venueResult) return venueResult.error;

    // Delete QR code (cascade will delete QrCodeRecipient records)
    await prisma.qrCode.delete({
      where: { id },
    });

    return successResponse({
      message: 'QR code deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'Delete QR code');
  }
}
