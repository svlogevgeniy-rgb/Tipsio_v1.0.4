export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TransactionStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED" | "EXPIRED";

function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): TransactionStatus {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "accept" ? "PAID" : "PENDING";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "CANCELED";
    case "expire":
      return "EXPIRED";
    case "failure":
      return "FAILED";
    default:
      return "PENDING";
  }
}

async function allocateTip(tipId: string) {
  const tip = await prisma.tip.findUnique({
    where: { id: tipId },
    include: {
      venue: true,
      staff: true,
    },
  });

  if (!tip) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (tip.type === "PERSONAL" && tip.staffId) {
    // Personal tip - allocate to specific staff
    await prisma.$transaction([
      // Create allocation record
      prisma.tipAllocation.create({
        data: {
          tipId: tip.id,
          staffId: tip.staffId,
          amount: tip.netAmount,
          date: today,
        },
      }),
      // Update staff balance
      prisma.staff.update({
        where: { id: tip.staffId },
        data: {
          balance: {
            increment: tip.netAmount,
          },
        },
      }),
    ]);
  } else {
    // Pool tip - distribute among active staff
    const activeStaff = await prisma.staff.findMany({
      where: {
        venueId: tip.venueId,
        status: "ACTIVE",
        participatesInPool: true,
      },
    });

    if (activeStaff.length === 0) return;

    // Split equally
    const shareAmount = Math.floor(tip.netAmount / activeStaff.length);
    const remainder = tip.netAmount - shareAmount * activeStaff.length;

    // Create allocations and update balances in a transaction
    await prisma.$transaction([
      // Create all allocation records
      prisma.tipAllocation.createMany({
        data: activeStaff.map((staff, index) => ({
          tipId: tip.id,
          staffId: staff.id,
          amount: index === 0 ? shareAmount + remainder : shareAmount,
          date: today,
        })),
      }),
      // Update each staff member's balance
      ...activeStaff.map((staff, index) =>
        prisma.staff.update({
          where: { id: staff.id },
          data: {
            balance: {
              increment: index === 0 ? shareAmount + remainder : shareAmount,
            },
          },
        })
      ),
    ]);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const tip = await prisma.tip.findUnique({
      where: { midtransOrderId: orderId },
      include: {
        venue: {
          select: {
            name: true,
          },
        },
        staff: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!tip) {
      return NextResponse.json(
        { error: "Tip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      amount: tip.amount,
      staffName: tip.staff?.displayName || null,
      staffAvatarUrl: tip.staff?.avatarUrl || null,
      venueName: tip.venue.name,
      status: tip.status,
      type: tip.type,
    });
  } catch (error) {
    console.error("Error fetching tip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tips/[orderId] - Update tip status (fallback if webhook doesn't work)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { transaction_status, fraud_status, transaction_id, payment_type, transaction_time } = body;

    const tip = await prisma.tip.findUnique({
      where: { midtransOrderId: orderId },
      include: {
        venue: true,
      },
    });

    if (!tip) {
      return NextResponse.json(
        { error: "Tip not found" },
        { status: 404 }
      );
    }

    // Don't update if already in final state
    const finalStates: TransactionStatus[] = ["PAID", "FAILED", "CANCELED", "EXPIRED"];
    if (finalStates.includes(tip.status as TransactionStatus)) {
      return NextResponse.json({
        status: "ok",
        message: "Already processed",
        currentStatus: tip.status,
      });
    }

    // Map status
    const newStatus = mapMidtransStatus(transaction_status, fraud_status);

    // Update tip status
    await prisma.tip.update({
      where: { id: tip.id },
      data: {
        status: newStatus,
        midtransPaymentType: payment_type || null,
        midtransTransactionId: transaction_id || null,
        midtransTransactionTime: transaction_time ? new Date(transaction_time) : null,
      },
    });

    // If payment successful, create tip allocations
    if (newStatus === "PAID") {
      await allocateTip(tip.id);
    }

    return NextResponse.json({
      status: "ok",
      newStatus,
      message: "Tip status updated successfully",
    });
  } catch (error) {
    console.error("Error updating tip status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
