export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/staff/[id]/payout - Process payout for a single staff member
 * Sets staff balance to 0
 * 
 * **Property 10: Обнуление баланса при выплате**
 * **Validates: Requirements 5.4**
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // For development without auth
    if (!session) {
      return NextResponse.json({ 
        success: true, 
        message: "Payout processed (mock)" 
      });
    }

    const { id } = await params;

    const { prisma } = await import("@/lib/prisma");

    // Find staff and verify ownership
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        venue: {
          select: { managerId: true },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    // Check access
    if (session.user.role !== "ADMIN" && staff.venue.managerId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if staff has balance
    if (staff.balance <= 0) {
      return NextResponse.json(
        { error: "No balance to payout" },
        { status: 400 }
      );
    }

    // Process payout - set balance to 0
    await prisma.staff.update({
      where: { id },
      data: { balance: 0 },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payout processed",
      previousBalance: staff.balance,
    });
  } catch (error) {
    console.error("Staff payout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
