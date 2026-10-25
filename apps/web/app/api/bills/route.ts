import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../lib/session";

const schema = z.object({
  data: z.record(z.any()),
});

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const bills = await prisma.bill.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: bills, error: null });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const bill = await prisma.bill.create({ data: { data: parsed.data as any } });
    return NextResponse.json({ data: bill, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
