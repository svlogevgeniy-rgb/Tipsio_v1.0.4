export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/staff/payout-all - Process payout for all staff members
 * Sets all staff balances to 0
 * 
 * **Property 11: Массовое обнуление балансов**
 * **Validates: Requirements 5.5**
 */
export async function POST() {
  try {
    const session = await auth();
    
    // For development without auth
    if (!session) {
      return NextResponse.json({ 
        success: true, 
        message: "All payouts processed (mock)",
        count: 4,
      });
    }

    const { prisma } = await import("@/lib/prisma");

    // Find venue for current user
    const venue = await prisma.venue.findFirst({
      where: { managerId: session.user.id },
    });

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    // Get all staff with positive balance
    const staffWithBalance = await prisma.staff.findMany({
      where: {
        venueId: venue.id,
        balance: { gt: 0 },
      },
      select: { id: true, balance: true },
    });

    if (staffWithBalance.length === 0) {
      return NextResponse.json(
        { error: "No staff with balance to payout" },
        { status: 400 }
      );
    }

    // Process all payouts - set all balances to 0
    await prisma.staff.updateMany({
      where: {
        venueId: venue.id,
        balance: { gt: 0 },
      },
      data: { balance: 0 },
    });

    const totalPaid = staffWithBalance.reduce((sum, s) => sum + s.balance, 0);

    return NextResponse.json({ 
      success: true, 
      message: "All payouts processed",
      count: staffWithBalance.length,
      totalPaid,
    });
  } catch (error) {
    console.error("Bulk payout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
