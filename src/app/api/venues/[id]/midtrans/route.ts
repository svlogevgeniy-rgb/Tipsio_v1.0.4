export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { validateMidtransCredentials } from "@/lib/midtrans";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: "AUTH_REQUIRED", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: venueId } = await params;
    const body = await request.json();
    const { serverKey, clientKey, merchantId } = body;

    if (!serverKey || !clientKey) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Server Key and Client Key are required" },
        { status: 400 }
      );
    }

    // Check venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Venue not found" },
        { status: 404 }
      );
    }

    if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    const validation = await validateMidtransCredentials({
      serverKey,
      clientKey,
      merchantId,
      requireMerchantId: false,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message || "Invalid Midtrans credentials" },
        { status: 400 }
      );
    }

    // Encrypt and save keys
    const encryptedServerKey = encrypt(serverKey);
    const encryptedClientKey = encrypt(clientKey);

    await prisma.venue.update({
      where: { id: venueId },
      data: {
        midtransServerKey: encryptedServerKey,
        midtransClientKey: encryptedClientKey,
        midtransMerchantId: merchantId || null,
        midtransConnected: true,
        midtransEnvironment: validation.environment || "sandbox",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Midtrans connected successfully",
    });
  } catch (error) {
    console.error("Midtrans connection error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
