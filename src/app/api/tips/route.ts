export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import {
  getDecryptedCredentials,
  createSnapTransaction,
  generateTipOrderId,
} from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

const PLATFORM_FEE_PERCENT = 5;

interface CreateTipRequest {
  qrCodeId: string;
  amount: number;
  guestPaidFee: boolean;
  staffId: string | null;
  type?: "PERSONAL" | "POOL"; // Optional for backward compatibility, always use PERSONAL
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTipRequest = await request.json();
    const { qrCodeId, amount, guestPaidFee, staffId } = body;

    // Validate amount
    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: "Minimum tip amount is 1,000 IDR" },
        { status: 400 }
      );
    }

    // Get QR code with venue
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrCodeId },
      include: {
        venue: true,
        staff: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (qrCode.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This QR code is not active" },
        { status: 400 }
      );
    }

    if (qrCode.venue.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This venue is not accepting tips" },
        { status: 400 }
      );
    }

    if (!qrCode.venue.midtransConnected) {
      return NextResponse.json(
        { error: "Payment is not configured for this venue" },
        { status: 400 }
      );
    }

    // Get Midtrans credentials
    const credentials = getDecryptedCredentials(qrCode.venue);
    if (!credentials) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    // Calculate fees
    const platformFee = Math.ceil(amount * (PLATFORM_FEE_PERCENT / 100));
    const netAmount = amount - platformFee;
    const totalAmount = guestPaidFee ? amount + platformFee : amount;

    // Determine target staff
    // All new tips are PERSONAL type (Requirement 10.6)
    let targetStaffId: string | null = null;
    const tipType = "PERSONAL" as const;

    if (qrCode.type === "PERSONAL" && qrCode.staffId) {
      // Personal QR always goes to that staff
      targetStaffId = qrCode.staffId;
    } else if (qrCode.type === "INDIVIDUAL" && qrCode.staffId) {
      // Individual QR always goes to that staff
      targetStaffId = qrCode.staffId;
    } else if (staffId) {
      // Guest selected specific staff (from TEAM QR)
      targetStaffId = staffId;
    }
    // Note: If no staffId, tip is still PERSONAL but without specific recipient

    // Generate order ID
    const orderId = generateTipOrderId(qrCode.venue.id);

    // Create tip record with PENDING status
    const tip = await prisma.tip.create({
      data: {
        amount: totalAmount,
        netAmount,
        platformFee,
        guestPaidFee,
        type: tipType,
        status: "PENDING",
        midtransOrderId: orderId,
        venueId: qrCode.venue.id,
        qrCodeId: qrCode.id,
        staffId: targetStaffId,
      },
    });

    // Create Midtrans Snap transaction
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const snapResponse = await createSnapTransaction(credentials, {
      orderId,
      amount: totalAmount,
      itemDetails: [
        {
          id: "tip",
          name: targetStaffId ? "Tip for Staff" : "Tip for Team",
          price: totalAmount,
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${baseUrl}/tip/success?order_id=${orderId}`,
        error: `${baseUrl}/tip/error?order_id=${orderId}`,
        pending: `${baseUrl}/tip/pending?order_id=${orderId}`,
      },
    });

    return NextResponse.json({
      tipId: tip.id,
      orderId,
      snapToken: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    });
  } catch (error) {
    console.error("Error creating tip:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
