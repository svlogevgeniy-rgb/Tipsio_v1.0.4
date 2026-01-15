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
    const midtransFilter = searchParams.get("midtransStatus") || "all";
    const tipsioFilter = searchParams.get("tipsioStatus") || "all";
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: 'insensitive' } },
        { venue: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (midtransFilter !== 'all') {
      where.midtransStatus = midtransFilter;
    }

    if (tipsioFilter !== 'all') {
      where.status = tipsioFilter === 'RECORDED' ? 'PAID' : tipsioFilter;
    }

    // Fetch transactions
    const transactions = await prisma.tip.findMany({
      where,
      include: {
        venue: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform data
    const transactionsData = transactions.map((tip) => ({
      id: tip.id,
      orderId: tip.midtransOrderId,
      venue: tip.venue.name,
      amount: tip.netAmount,
      midtransStatus: tip.midtransPaymentType || 'pending',
      tipsioStatus: tip.status === 'PAID' ? 'RECORDED' : tip.status === 'PENDING' ? 'PENDING' : 'FAILED',
      paymentMethod: tip.midtransPaymentType || 'Unknown',
      staffName: tip.staff?.displayName || null,
      createdAt: tip.createdAt.toISOString(),
      errorMessage: tip.status === 'FAILED' ? 'Payment failed' : undefined,
    }));

    return successResponse(transactionsData);
  } catch (error) {
    return handleApiError(error, "Admin transactions");
  }
}
