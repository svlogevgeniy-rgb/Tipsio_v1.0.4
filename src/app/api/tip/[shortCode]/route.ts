export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

// Mock data for development/testing - updated for new QR types
const MOCK_DATA: Record<string, object> = {
  agung001: {
    id: "qr-001",
    type: "INDIVIDUAL",
    label: "Agung's QR",
    venue: {
      id: "venue-001",
      name: "Cafe Organic Canggu",
      logoUrl: null,
    },
    staff: {
      id: "staff-001",
      displayName: "Agung",
      avatarUrl: null,
      role: "WAITER",
      status: "ACTIVE",
    },
    recipients: [],
  },
  table01: {
    id: "qr-002",
    type: "TEAM",
    label: "Table 1",
    venue: {
      id: "venue-001",
      name: "Cafe Organic Canggu",
      logoUrl: null,
    },
    staff: null,
    recipients: [
      { id: "staff-001", displayName: "Agung", avatarUrl: null, role: "WAITER", status: "ACTIVE" },
      { id: "staff-002", displayName: "Wayan", avatarUrl: null, role: "BARISTA", status: "ACTIVE" },
      { id: "staff-003", displayName: "Ketut", avatarUrl: null, role: "BARTENDER", status: "ACTIVE" },
    ],
  },
  organic: {
    id: "qr-003",
    type: "TEAM",
    label: "Main Entrance",
    venue: {
      id: "venue-001",
      name: "Cafe Organic Canggu",
      logoUrl: null,
    },
    staff: null,
    recipients: [
      { id: "staff-001", displayName: "Agung", avatarUrl: null, role: "WAITER", status: "ACTIVE" },
      { id: "staff-002", displayName: "Wayan", avatarUrl: null, role: "BARISTA", status: "ACTIVE" },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Try mock data first (for development without DB)
    if (MOCK_DATA[shortCode]) {
      return NextResponse.json(MOCK_DATA[shortCode]);
    }

    // Try database
    try {
      const { prisma } = await import("@/lib/prisma");
      
      const qrCode = await prisma.qrCode.findUnique({
        where: { shortCode },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              midtransConnected: true,
              status: true,
            },
          },
          // For INDIVIDUAL QR - direct staff
          staff: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              role: true,
              status: true,
            },
          },
          // For TEAM QR - recipients via junction table
          recipients: {
            include: {
              staff: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                  role: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!qrCode) {
        return NextResponse.json(
          { code: "QR_NOT_FOUND", error: "QR code not found" },
          { status: 404 }
        );
      }

      if (qrCode.status !== "ACTIVE") {
        return NextResponse.json(
          { code: "QR_INACTIVE", error: "This QR code has been deactivated" },
          { status: 400 }
        );
      }

      if (qrCode.venue.status !== "ACTIVE") {
        return NextResponse.json(
          { code: "VENUE_NOT_ACCEPTING", error: "This venue is not accepting tips at the moment" },
          { status: 400 }
        );
      }

      if (!qrCode.venue.midtransConnected) {
        return NextResponse.json(
          { code: "PAYMENT_NOT_CONFIGURED", error: "Payment is not configured for this venue" },
          { status: 400 }
        );
      }

      // Determine QR type for response
      // Handle both new types (INDIVIDUAL, TEAM) and legacy types (PERSONAL, TABLE, VENUE)
      const isIndividualType = qrCode.type === "INDIVIDUAL" || qrCode.type === "PERSONAL";
      const isTeamType = qrCode.type === "TEAM" || qrCode.type === "TABLE" || qrCode.type === "VENUE";

      if (isIndividualType) {
        // INDIVIDUAL QR - return staff directly
        // Check if staff is active
        if (qrCode.staff && qrCode.staff.status !== "ACTIVE") {
          return NextResponse.json(
            { code: "STAFF_INACTIVE", error: "Staff member is inactive" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          id: qrCode.id,
          type: "INDIVIDUAL",
          label: qrCode.label,
          venue: {
            id: qrCode.venue.id,
            name: qrCode.venue.name,
            logoUrl: qrCode.venue.logoUrl,
          },
          staff: qrCode.staff,
          recipients: [],
        });
      }

      if (isTeamType) {
        // TEAM QR - return only active recipients
        const activeRecipients = qrCode.recipients
          .map(r => r.staff)
          .filter(staff => staff.status === "ACTIVE")
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        // Check if all recipients are inactive
        if (activeRecipients.length === 0) {
          return NextResponse.json(
            { code: "VENUE_NOT_ACCEPTING", error: "No active staff available to receive tips" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          id: qrCode.id,
          type: "TEAM",
          label: qrCode.label,
          venue: {
            id: qrCode.venue.id,
            name: qrCode.venue.name,
            logoUrl: qrCode.venue.logoUrl,
          },
          staff: null,
          recipients: activeRecipients,
        });
      }

      // Fallback for unknown type
      return NextResponse.json(
        { code: "INVALID_QR_TYPE", error: "Invalid QR code type" },
        { status: 400 }
      );
    } catch {
      // Database not available, return 404 for unknown codes
      return NextResponse.json(
        { code: "QR_NOT_FOUND", error: "QR code not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching QR data:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", error: "Internal server error" },
      { status: 500 }
    );
  }
}
