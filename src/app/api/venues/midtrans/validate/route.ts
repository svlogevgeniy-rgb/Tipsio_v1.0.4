export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { clientKey, serverKey, merchantId } = await request.json();

    if (!clientKey || !serverKey || !merchantId) {
      return NextResponse.json(
        { message: "All Midtrans credentials are required" },
        { status: 400 }
      );
    }

    // Test Midtrans connection by making a simple API call
    const auth = Buffer.from(`${serverKey}:`).toString("base64");
    
    const response = await fetch(
      "https://api.sandbox.midtrans.com/v2/token",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Midtrans returns 401 for invalid credentials
    // For valid credentials, it may return 400 (missing params) or 200
    if (response.status === 401) {
      return NextResponse.json(
        { message: "Invalid Midtrans credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Midtrans credentials are valid" 
    });
  } catch (error) {
    console.error("Midtrans validation error:", error);
    return NextResponse.json(
      { message: "Failed to validate Midtrans credentials" },
      { status: 500 }
    );
  }
}
