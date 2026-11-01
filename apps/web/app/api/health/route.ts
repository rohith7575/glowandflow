import { NextResponse } from "next/server";
import type { HealthStatus } from "@glow/types";
import { getCurrentVersion } from "../../../lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const body: HealthStatus = {
    ok: true,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: getCurrentVersion(),
  };
  return NextResponse.json(body);
}
