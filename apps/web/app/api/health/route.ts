import { NextResponse } from "next/server";
import type { HealthStatus } from "@glow/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const body: HealthStatus = {
    ok: true,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? "0.1.0",
  };
  return NextResponse.json(body);
}
