import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "../../../../../lib/session";
import BillPdf from "../../../../../components/bill/BillPdf";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req as any);
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

  const data = (bill.data as any) || {};
  let company: any = null;
  if (data.billInfo?.id) {
    company = await prisma.billInfo.findUnique({ where: { id: data.billInfo.id } });
  }
  if (!company) {
    company = await prisma.billInfo.findFirst({ orderBy: { createdAt: "asc" } });
  }

  const buffer = await renderToBuffer(<BillPdf bill={bill} company={company} />);
  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="invoice-${bill.invoiceNumber || bill.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
