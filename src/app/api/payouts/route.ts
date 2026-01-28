export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mock data for development - staff with accumulated balances
function generateMockStaffBalances() {
  return {
    staff: [
      { 
        id: "staff-001", 
        displayName: "Agung", 
        role: "Официант", 
        avatarUrl: null,
        balance: 850000, 
        tipsCount: 24 
      },
      { 
        id: "staff-002", 
        displayName: "Wayan", 
        role: "Бариста", 
        avatarUrl: null,
        balance: 720000, 
        tipsCount: 21 
      },
      { 
        id: "staff-003", 
        displayName: "Ketut", 
        role: "Бармен", 
        avatarUrl: null,
        balance: 680000, 
        tipsCount: 19 
      },
      { 
        id: "staff-004", 
        displayName: "Made", 
        role: "Официант", 
        avatarUrl: null,
        balance: 0, 
        tipsCount: 15 
      },
    ],
  };
}

export async function GET() {
  try {
    const session = await auth();

    // For development, return mock data
    if (!session) {
      return NextResponse.json(generateMockStaffBalances());
    }

    // In production, fetch real data
    try {
      const { prisma } = await import("@/lib/prisma");

      const venue = await prisma.venue.findFirst({
        where: { managerId: session.user.id },
      });

      if (!venue) {
        return NextResponse.json(
          { error: "Venue not found" },
          { status: 404 }
        );
      }

      // Get all staff with their balances
      const staff = await prisma.staff.findMany({
        where: { 
          venueId: venue.id,
          status: "ACTIVE",
        },
        select: {
          id: true,
          displayName: true,
          role: true,
          avatarUrl: true,
          balance: true,
          _count: {
            select: { allocations: true },
          },
        },
        orderBy: { balance: "desc" },
      });

      return NextResponse.json({
        staff: staff.map(s => ({
          id: s.id,
          displayName: s.displayName,
          role: s.role,
          avatarUrl: s.avatarUrl,
          balance: s.balance,
          tipsCount: s._count.allocations,
        })),
      });
    } catch {
      // Database not available, return mock data
      return NextResponse.json(generateMockStaffBalances());
    }
  } catch (error) {
    console.error("Payouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
