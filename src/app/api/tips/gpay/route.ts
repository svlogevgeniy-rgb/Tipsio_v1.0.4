export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import {
  getDecryptedCredentials,
  generateTipOrderId,
} from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

const PLATFORM_FEE_PERCENT = 0; // No platform fee - staff receives 100%

const MIDTRANS_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";
const MIDTRANS_PRODUCTION_URL = "https://app.midtrans.com/snap/v1/transactions";

interface CreateGPayTipRequest {
  qrCodeId: string;
  amount: number;
  staffId: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateGPayTipRequest = await request.json();
    const { qrCodeId, amount, staffId } = body;

    // Validate amount
    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: "Minimum tip amount is 10,000 IDR" },
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
    const totalAmount = amount;

    // Determine target staff
    let targetStaffId: string | null = null;

    if (qrCode.type === "PERSONAL" && qrCode.staffId) {
      targetStaffId = qrCode.staffId;
    } else if (qrCode.type === "INDIVIDUAL" && qrCode.staffId) {
      targetStaffId = qrCode.staffId;
    } else if (staffId) {
      targetStaffId = staffId;
    }

    // Generate order ID
    const orderId = generateTipOrderId(qrCode.venue.id);

    // Create tip record with PENDING status
    const tip = await prisma.tip.create({
      data: {
        amount: totalAmount,
        netAmount,
        platformFee,
        guestPaidFee: false,
        type: "PERSONAL",
        status: "PENDING",
        midtransOrderId: orderId,
        venueId: qrCode.venue.id,
        qrCodeId: qrCode.id,
        staffId: targetStaffId,
      },
    });

    // Create Midtrans Snap transaction with ONLY Google Pay enabled
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const snapUrl = credentials.environment === "production"
      ? MIDTRANS_PRODUCTION_URL
      : MIDTRANS_SANDBOX_URL;

    const authString = Buffer.from(`${credentials.serverKey}:`).toString("base64");

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      credit_card: {
        secure: true,
      },
      // Only Google Pay - this will skip payment method selection
      enabled_payments: ["google_pay"],
      item_details: [
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
    };

    const response = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Midtrans GPay error:", error);
      
      // Delete the pending tip if Midtrans fails
      await prisma.tip.delete({ where: { id: tip.id } });
      
      return NextResponse.json(
        { error: error.error_messages?.[0] || "Failed to create Google Pay transaction" },
        { status: 500 }
      );
    }

    const snapResponse = await response.json();

    return NextResponse.json({
      tipId: tip.id,
      orderId,
      snapToken: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
    });
  } catch (error) {
    console.error("Error creating GPay tip:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
