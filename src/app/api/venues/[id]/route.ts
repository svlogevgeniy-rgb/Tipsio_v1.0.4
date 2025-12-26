export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, successResponse, validationError } from "@/lib/api/error-handler";
import { requireAuth, requireVenueAccess } from "@/lib/api/middleware";
import prisma from "@/lib/prisma";
import { DISTRIBUTION_MODE_VALUES } from "@/types/distribution";

const updateVenueSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["RESTAURANT", "CAFE", "BAR", "COFFEE_SHOP", "OTHER"]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  distributionMode: z.enum(DISTRIBUTION_MODE_VALUES).optional(),
  allowStaffChoice: z.boolean().optional(),
});

// GET /api/venues/[id] - Get venue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id } = await params;

    // Check venue access
    const venueResult = await requireVenueAccess(id, session);
    if ('error' in venueResult) return venueResult.error;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        staff: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            tips: true,
            qrCodes: true,
          },
        },
      },
    });

    return successResponse({ venue });
  } catch (error) {
    return handleApiError(error, "Get venue");
  }
}

// PATCH /api/venues/[id] - Update venue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id } = await params;

    // Check venue access
    const venueResult = await requireVenueAccess(id, session);
    if ('error' in venueResult) return venueResult.error;

    const body = await request.json();
    const parsed = updateVenueSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse({ venue: updatedVenue });
  } catch (error) {
    return handleApiError(error, "Update venue");
  }
}
