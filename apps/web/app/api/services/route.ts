import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/session";

const units = ["number", "piece", "set", "feet", "meter"] as const;

const schema = z.object({
  name: z.string().min(1),
  rate: z.number().nonnegative(),
  unit: z.enum(units).default("piece"),
});

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: services, error: null });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const service = await prisma.service.create({ data: parsed });
    return NextResponse.json({ data: service, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
