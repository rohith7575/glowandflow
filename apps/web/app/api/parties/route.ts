import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/session";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const parties = await prisma.party.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: parties, error: null });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const party = await prisma.party.create({ data: parsed });
    return NextResponse.json({ data: party, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
