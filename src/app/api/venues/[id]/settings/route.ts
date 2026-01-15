export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api/error-handler";
import { requireAuth, requireVenueAccess } from "@/lib/api/middleware";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id: venueId } = await params;

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        distributionMode: true,
        allowStaffChoice: true,
        midtransMerchantId: true,
        midtransServerKey: true,
      },
    });

    return successResponse({
      distributionMode: venue?.distributionMode || "PERSONAL",
      allowStaffChoice: venue?.allowStaffChoice || false,
      midtransConnected: !!venue?.midtransServerKey,
      midtransMerchantId: venue?.midtransMerchantId || null,
    });
  } catch (error) {
    return handleApiError(error, "Get settings");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id: venueId } = await params;

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    const body = await request.json();
    // Note: distributionMode and allowStaffChoice are intentionally ignored
    // as part of QR code types refactoring. These fields are kept in DB for
    // historical data but no longer used in the new QR-based flow.
    const { midtransMerchantId, midtransServerKey, midtransClientKey } = body;

    // Only update Midtrans settings if provided
    const updateData: Record<string, unknown> = {};
    if (midtransMerchantId !== undefined) {
      updateData.midtransMerchantId = midtransMerchantId;
    }
    if (midtransServerKey !== undefined) {
      updateData.midtransServerKey = midtransServerKey;
    }
    if (midtransClientKey !== undefined) {
      updateData.midtransClientKey = midtransClientKey;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.venue.update({
        where: { id: venueId },
        data: updateData,
      });
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "Update settings");
  }
}
