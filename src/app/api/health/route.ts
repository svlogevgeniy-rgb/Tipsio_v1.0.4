export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  const checks = {
    database: {
      status: "unknown" as "ok" | "error" | "skipped",
      latencyMs: null as number | null,
      error: null as string | null,
    },
  };

  let healthy = true;

  if (!process.env.DATABASE_URL) {
    checks.database = {
      status: "skipped",
      latencyMs: null,
      error: "DATABASE_URL not configured",
    };
  } else {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: "ok",
        latencyMs: Date.now() - start,
        error: null,
      };
    } catch (error) {
      healthy = false;
      const message = error instanceof Error ? error.message : String(error);
      checks.database = {
        status: "error",
        latencyMs: Date.now() - start,
        error: message,
      };
    }
  }

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      uptimeMs: Math.round(process.uptime() * 1000),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
