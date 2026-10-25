import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: users, error: null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const user = await prisma.user.create({ data: parsed });
    return NextResponse.json({ data: user, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
