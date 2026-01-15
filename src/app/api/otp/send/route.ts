export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOtp, sendOtpSms, sendOtpEmail } from "@/lib/otp";
import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from "@/lib/rate-limit";

const sendOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
}).refine((data) => data.phone || data.email, {
  message: "Phone or email is required",
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per 15 minutes per IP
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, email } = parsed.data;

    // Check if staff exists with this contact
    const staff = await prisma.staff.findFirst({
      where: {
        user: {
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json(
        { code: "STAFF_NOT_FOUND", message: "No staff account found with this contact" },
        { status: 404 }
      );
    }

    // Create OTP
    const { code } = await createOtp({ phone, email });

    // Send OTP
    if (phone) {
      await sendOtpSms(phone, code);
    } else if (email) {
      await sendOtpEmail(email, code);
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      // In development, return the code for testing
      ...(process.env.NODE_ENV === "development" ? { code } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
