import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { getCurrentUser } from "../../../../lib/session";

const schema = z.object({
  data: z.record(z.any()).optional(),
  billInfoId: z.string().optional().nullable(),
});

async function resolveBillInfo(id?: string | null) {
  if (id) {
    const found = await prisma.billInfo.findUnique({ where: { id } });
    if (found) return found;
  }
  return null;
}

function snapshot(bi: any) {
  if (!bi) return null;
  return {
    id: bi.id,
    name: bi.name,
    companyName: bi.companyName ?? null,
    phone: bi.phone ?? [],
    address: bi.address ?? null,
  };
}

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

    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    const data = parsed.data ? { ...parsed.data } : { ...(existing.data as any) };

    // Resolve bill info: explicit id, or keep existing snapshot, or fallback to first
    let bi: any = null;
    if (parsed.billInfoId !== undefined) {
      if (parsed.billInfoId) bi = await resolveBillInfo(parsed.billInfoId);
    } else if (data.billInfo?.id) {
      bi = await resolveBillInfo(data.billInfo.id);
    }
    if (!bi && !data.billInfo) {
      bi = await prisma.billInfo.findFirst({ orderBy: { createdAt: "asc" } });
    }
    const snap = bi ? snapshot(bi) : data.billInfo ?? null;
    if (snap) data.billInfo = snap;

    const wasFinalised = existing.createdAt !== null;

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        data: data as any,
        // Auto re-finalise: re-stamp createdAt if it was already finalised
        ...(wasFinalised ? { createdAt: new Date() } : {}),
      },
    });
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
