import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
});

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, phone: true, createdAt: true, lastLoggedIn: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: users, error: null });
}

import { hashPassword } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const password = await hashPassword(parsed.password ?? "password123");
    const user = await prisma.user.create({
      data: { email: parsed.email, name: parsed.name, password },
    });
    return NextResponse.json({ data: user, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
