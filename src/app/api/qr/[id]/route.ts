export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { handleApiError, notFoundError, successResponse, validationError } from "@/lib/api/error-handler";
import { requireAuth } from "@/lib/api/middleware";
import prisma from "@/lib/prisma";
import { buildTipUrl, generateQrPng, generateQrSvg } from "@/lib/qr";
import type { ApiErrorResponse } from "@/types/api";

// GET /api/qr/[id] - Get QR code details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format"); // png, svg, or null for JSON

    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },
        staff: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!qrCode) {
      return notFoundError("QR code");
    }

    // Check access
    if (session.userRole !== "ADMIN" && qrCode.venue.managerId !== session.userId) {
      return NextResponse.json<ApiErrorResponse>(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    const tipUrl = buildTipUrl(qrCode.shortCode);

    // Return image if format specified
    if (format === "png") {
      const pngBuffer = await generateQrPng(tipUrl);
      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${qrCode.label || qrCode.shortCode}.png"`,
        },
      });
    }

    if (format === "svg") {
      const svg = await generateQrSvg(tipUrl);
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="${qrCode.label || qrCode.shortCode}.svg"`,
        },
      });
    }

    // Return JSON with QR details
    return successResponse({
      qrCode: {
        ...qrCode,
        tipUrl,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get QR code");
  }
}

// DELETE /api/qr/[id] - Delete QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const { id } = await params;

    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        venue: {
          select: { managerId: true },
        },
        _count: {
          select: { tips: true },
        },
      },
    });

    if (!qrCode) {
      return notFoundError("QR code");
    }

    // Check access
    if (session.userRole !== "ADMIN" && qrCode.venue.managerId !== session.userId) {
      return NextResponse.json<ApiErrorResponse>(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    // Cannot delete personal QR codes (they're tied to staff)
    if (qrCode.type === "PERSONAL") {
      return validationError("Personal QR codes cannot be deleted directly. Deactivate the staff member instead.");
    }

    // If has tips, soft delete (set INACTIVE)
    if (qrCode._count.tips > 0) {
      await prisma.qrCode.update({
        where: { id },
        data: { status: "INACTIVE" },
      });

      return successResponse({
        message: "QR code deactivated (has tip history)",
        softDeleted: true,
      });
    }

    // Hard delete if no tips
    await prisma.qrCode.delete({ where: { id } });

    return successResponse({
      message: "QR code deleted successfully",
      softDeleted: false,
    });
  } catch (error) {
    return handleApiError(error, "Delete QR code");
  }
}
