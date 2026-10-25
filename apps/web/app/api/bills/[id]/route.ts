import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/session";

const schema = z.object({
  data: z.record(z.any()).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: bill, error: null });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const bill = await prisma.bill.update({ where: { id }, data: { data: parsed.data as any } });
    return NextResponse.json({ data: bill, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.bill.delete({ where: { id } });
  return NextResponse.json({ data: { ok: true }, error: null });
}
