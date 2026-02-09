export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema
const connectionRequestSchema = z.object({
  purpose: z.enum(["CONNECTION", "SUPPORT"]),
  businessName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(50),
  phone: z.string().regex(/^\+(?:62|7)\d{10,11}$/, {
    message: "Phone must be in +62 or +7 format",
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = connectionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { purpose, businessName, contactName, phone } = validationResult.data;

    // Create connection request in database
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        purpose,
        businessName,
        contactName,
        phone,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        id: connectionRequest.id,
        createdAt: connectionRequest.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating connection request:", error);
    
    return NextResponse.json(
      {
        error: "Failed to create connection request",
      },
      { status: 500 }
    );
  }
}
