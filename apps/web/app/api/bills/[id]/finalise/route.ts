import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { getCurrentUser } from "../../../../../lib/session";

function genInvoiceNumber() {
  const d = new Date();
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${yyyymmdd}${rand}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    // Already finalised: idempotent
    if (existing.createdAt !== null && existing.invoiceNumber) {
      return NextResponse.json({ data: existing, error: null });
    }

    // Generate a unique invoice number
    let invoiceNumber: string | null = null;
    for (let i = 0; i < 10; i++) {
      const candidate = genInvoiceNumber();
      const clash = await prisma.bill.findUnique({ where: { invoiceNumber: candidate } });
      if (!clash) {
        invoiceNumber = candidate;
        break;
      }
    }
    if (!invoiceNumber) {
      return NextResponse.json({ data: null, error: "Could not generate a unique invoice number" }, { status: 500 });
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: { invoiceNumber, createdAt: new Date() },
    });
    return NextResponse.json({ data: bill, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
