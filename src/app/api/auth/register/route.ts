export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { encryptKey, validateMidtransCredentials, type MidtransEnvironment } from "@/lib/midtrans";
import prisma from "@/lib/prisma";
import { generateShortCode } from "@/lib/qr";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  venueName: z.string().min(2, "Venue name must be at least 2 characters"),
  venueType: z.enum(["RESTAURANT", "CAFE", "BAR", "COFFEE_SHOP", "OTHER"]),
  // distributionMode is ignored - kept for backward compatibility but not used
  distributionMode: z.string().optional(),
  midtrans: z.object({
    clientKey: z.string(),
    serverKey: z.string(),
    merchantId: z.string(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, venueName, venueType, midtrans } = parsed.data;
    // Note: distributionMode is intentionally ignored - new flow uses QR types

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: "USER_EXISTS", message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    let encryptedServerKey: string | null = null;
    let encryptedClientKey: string | null = null;
    let midtransEnvironment: MidtransEnvironment | null = null;

    if (midtrans) {
      const validation = await validateMidtransCredentials({
        serverKey: midtrans.serverKey,
        clientKey: midtrans.clientKey,
        merchantId: midtrans.merchantId,
        requireMerchantId: true,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { code: "MIDTRANS_INVALID", message: validation.message || "Invalid Midtrans credentials" },
          { status: 400 }
        );
      }

      encryptedServerKey = encryptKey(midtrans.serverKey);
      encryptedClientKey = encryptKey(midtrans.clientKey);
      midtransEnvironment = validation.environment || "sandbox";
    }

    // Create user, venue, staff profile, and individual QR in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User with ADMIN role
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "ADMIN",
        },
      });

      // 2. Create Venue
      const venue = await tx.venue.create({
        data: {
          name: venueName,
          type: venueType,
          managerId: user.id,
          status: midtrans ? "ACTIVE" : "DRAFT",
          // Keep distributionMode as PERSONAL for backward compatibility
          distributionMode: "PERSONAL",
          // Midtrans credentials
          midtransMerchantId: midtrans?.merchantId || null,
          midtransServerKey: encryptedServerKey,
          midtransClientKey: encryptedClientKey,
          midtransConnected: !!midtrans,
          ...(midtransEnvironment ? { midtransEnvironment } : {}),
        },
      });

      // 3. Create Staff profile for owner
      const staff = await tx.staff.create({
        data: {
          displayName: venueName,
          role: "ADMINISTRATOR",
          status: "ACTIVE",
          participatesInPool: true,
          venueId: venue.id,
          userId: user.id,
        },
      });

      // 4. Create Individual QR for owner
      const qrCode = await tx.qrCode.create({
        data: {
          type: "INDIVIDUAL",
          label: venueName,
          shortCode: generateShortCode(),
          status: "ACTIVE",
          venueId: venue.id,
          staffId: staff.id,
        },
      });

      return { user, venue, staff, qrCode };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: result.user.id,
        venueId: result.venue.id,
        staffId: result.staff.id,
        qrCodeId: result.qrCode.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
