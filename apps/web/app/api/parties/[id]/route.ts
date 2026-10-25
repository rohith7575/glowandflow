import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/session";

const schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: party, error: null });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const party = await prisma.party.update({ where: { id }, data: parsed });
    return NextResponse.json({ data: party, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.party.delete({ where: { id } });
  return NextResponse.json({ data: { ok: true }, error: null });
}
