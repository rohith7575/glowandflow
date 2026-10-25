import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/session";

const schema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional().nullable(),
  phone: z.array(z.string()).optional(),
  address: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.billInfo.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: item, error: null });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const item = await prisma.billInfo.update({ where: { id }, data: parsed as any });
    return NextResponse.json({ data: item, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.billInfo.delete({ where: { id } });
  return NextResponse.json({ data: { ok: true }, error: null });
}
