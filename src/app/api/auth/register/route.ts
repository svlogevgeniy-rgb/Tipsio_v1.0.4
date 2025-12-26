export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { encryptKey } from "@/lib/midtrans";
import { generateShortCode } from "@/lib/qr";
import { DISTRIBUTION_MODE_VALUES, isPooledMode } from "@/types/distribution";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  venueName: z.string().min(2, "Venue name must be at least 2 characters"),
  venueType: z.enum(["RESTAURANT", "CAFE", "BAR", "COFFEE_SHOP", "OTHER"]),
  distributionMode: z.enum(DISTRIBUTION_MODE_VALUES).optional(),
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

    const { email, password, venueName, venueType, distributionMode, midtrans } = parsed.data;

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

    // Encrypt server key if provided
    const encryptedServerKey = midtrans?.serverKey 
      ? encryptKey(midtrans.serverKey) 
      : null;

    // Create user and venue in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "MANAGER",
        },
      });

      const venue = await tx.venue.create({
        data: {
          name: venueName,
          type: venueType,
          managerId: user.id,
          status: midtrans ? "ACTIVE" : "DRAFT",
          distributionMode: distributionMode || "PERSONAL",
          // Midtrans credentials
          midtransMerchantId: midtrans?.merchantId || null,
          midtransServerKey: encryptedServerKey,
          midtransClientKey: midtrans?.clientKey || null,
          midtransConnected: !!midtrans,
        },
      });

      // Auto-generate venue QR for POOLED mode
      if (isPooledMode(distributionMode)) {
        await tx.qrCode.create({
          data: {
            venueId: venue.id,
            type: "VENUE",
            label: venueName,
            shortCode: generateShortCode(),
            status: "ACTIVE",
          },
        });
      }

      return { user, venue };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: result.user.id,
        venueId: result.venue.id,
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
