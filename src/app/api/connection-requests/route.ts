export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema
const connectionRequestSchema = z.object({
  purpose: z.enum(["CONNECTION", "SUPPORT"]),
  businessName: z.string().min(1).max(100),
  contactName: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  phone: z.string().min(1).max(20),
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
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { purpose, businessName, contactName, email, phone } = validationResult.data;

    // Create connection request in database
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        purpose,
        businessName,
        contactName,
        email,
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
