export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";
import { handleApiError, successResponse, validationError } from "@/lib/api/error-handler";
import { requireAuth, requireRole } from "@/lib/api/middleware";
import prisma from "@/lib/prisma";

const PLATFORM_FEE_PERCENT = 0; // No platform fee - staff receives 100%

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
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return validationError("start and end dates required");
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Get all paid tips in the period grouped by venue
    const tips = await prisma.tip.findMany({
      where: {
        status: "PAID",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by venue
    const venueStats: Record<
      string,
      {
        venueId: string;
        venueName: string;
        totalTips: number;
        transactionCount: number;
      }
    > = {};

    for (const tip of tips) {
      if (!venueStats[tip.venueId]) {
        venueStats[tip.venueId] = {
          venueId: tip.venueId,
          venueName: tip.venue.name,
          totalTips: 0,
          transactionCount: 0,
        };
      }
      venueStats[tip.venueId].totalTips += tip.netAmount;
      venueStats[tip.venueId].transactionCount += 1;
    }

    const venues = Object.values(venueStats)
      .map((v) => ({
        ...v,
        platformFee: Math.ceil(v.totalTips * (PLATFORM_FEE_PERCENT / 100)),
      }))
      .sort((a, b) => b.totalTips - a.totalTips);

    const totalTips = venues.reduce((sum, v) => sum + v.totalTips, 0);
    const totalPlatformFee = venues.reduce((sum, v) => sum + v.platformFee, 0);
    const totalTransactions = venues.reduce(
      (sum, v) => sum + v.transactionCount,
      0
    );

    return successResponse({
      period: `${start}_${end}`,
      totalTips,
      totalPlatformFee,
      totalTransactions,
      venues,
    });
  } catch (error) {
    return handleApiError(error, "Admin commissions");
  }
}
