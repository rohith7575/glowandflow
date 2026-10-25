import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/session";

const schema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional().nullable(),
  phone: z.array(z.string()).default([]),
  address: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const items = await prisma.billInfo.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: items, error: null });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const item = await prisma.billInfo.create({ data: parsed as any });
    return NextResponse.json({ data: item, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
