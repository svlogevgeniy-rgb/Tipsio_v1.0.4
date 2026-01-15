export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api/error-handler";
import { requireAuth, requireRole } from "@/lib/api/middleware";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Check admin role
    const roleResult = requireRole(session, ['ADMIN']);
    if ('error' in roleResult) return roleResult.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'all') {
      if (status === 'live') {
        where.midtransConnected = true;
        where.midtransEnvironment = 'production';
        where.status = 'ACTIVE';
      } else if (status === 'test') {
        where.midtransConnected = true;
        where.midtransEnvironment = 'sandbox';
      } else if (status === 'blocked') {
        where.status = 'BLOCKED';
      }
    }

    // Fetch venues with aggregated data
    const venues = await prisma.venue.findMany({
      where,
      include: {
        _count: {
          select: {
            staff: true,
          },
        },
        tips: {
          where: {
            status: 'PAID',
          },
          select: {
            netAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data
    const venuesData = venues.map((venue) => {
      const totalVolume = venue.tips.reduce((sum, tip) => sum + tip.netAmount, 0);
      const lastActivity = venue.updatedAt;

      return {
        id: venue.id,
        name: venue.name,
        area: venue.address || 'N/A',
        midtransStatus: venue.midtransConnected 
          ? (venue.midtransEnvironment === 'production' ? 'LIVE' : 'TEST')
          : 'NOT_CONNECTED',
        status: venue.status,
        totalVolume,
        lastActivity: lastActivity.toISOString(),
        staffCount: venue._count.staff,
      };
    });

    return successResponse(venuesData);
  } catch (error) {
    return handleApiError(error, "Admin venues");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Check admin role
    const roleResult = requireRole(session, ['ADMIN']);
    if ('error' in roleResult) return roleResult.error;

    const body = await request.json();
    const { venueId, status } = body;

    if (!venueId || !status) {
      return successResponse({ error: 'venueId and status are required' }, 400);
    }

    // Update venue status
    const venue = await prisma.venue.update({
      where: { id: venueId },
      data: { status },
    });

    return successResponse(venue);
  } catch (error) {
    return handleApiError(error, "Admin venues update");
  }
}
