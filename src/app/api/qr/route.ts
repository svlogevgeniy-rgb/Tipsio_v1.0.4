export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateShortCode } from '@/lib/qr';
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, validationError, successResponse } from '@/lib/api/error-handler';
import type { ApiErrorResponse } from '@/types/api';

const createQrSchema = z.object({
  type: z.enum(['TABLE', 'VENUE']),
  label: z.string().min(1, 'Label is required'),
  venueId: z.string().min(1, 'Venue ID is required'),
});

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

    // Fetch QR codes
    const qrCodes = await prisma.qrCode.findMany({
      where: { venueId },
      include: {
        staff: {
          select: {
            id: true,
            displayName: true,
            status: true,
          },
        },
        _count: {
          select: { tips: true },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });

    return successResponse({ qrCodes });
  } catch (error) {
    return handleApiError(error, 'List QR codes');
  }
}

// POST /api/qr - Create table/venue QR code
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
      return validationError(parsed.error.issues[0].message);
    }

    const { type, label, venueId } = parsed.data;

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

    // Create QR code
    const shortCode = generateShortCode();
    const qrCode = await prisma.qrCode.create({
      data: {
        type,
        label,
        shortCode,
        venueId,
      },
    });

    return successResponse(
      {
        message: 'QR code created successfully',
        qrCode,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, 'Create QR code');
  }
}
