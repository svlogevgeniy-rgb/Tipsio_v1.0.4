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
    const { distributionMode, allowStaffChoice } = body;

    await prisma.venue.update({
      where: { id: venueId },
      data: {
        distributionMode: distributionMode || undefined,
        allowStaffChoice: allowStaffChoice !== undefined ? allowStaffChoice : undefined,
      },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "Update settings");
  }
}
