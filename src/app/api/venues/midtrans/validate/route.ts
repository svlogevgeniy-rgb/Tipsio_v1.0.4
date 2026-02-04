export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { validateMidtransCredentials } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const { clientKey, serverKey, merchantId } = await request.json();
    const validation = await validateMidtransCredentials({
      serverKey,
      clientKey,
      merchantId,
      requireMerchantId: true,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.message || "Invalid Midtrans credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Midtrans credentials are valid",
      environment: validation.environment,
    });
  } catch (error) {
    console.error("Midtrans validation error:", error);
    return NextResponse.json(
      { message: "Failed to validate Midtrans credentials" },
      { status: 500 }
    );
  }
}
