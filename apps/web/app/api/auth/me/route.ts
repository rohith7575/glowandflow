import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@glow/database";
import { getCurrentUser } from "../../../../lib/session";
import { hashPassword } from "../../../../lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ data: null, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    data: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    error: null,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ data: null, error: "Not authenticated" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const data: any = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.phone !== undefined) data.phone = parsed.phone;
    if (parsed.email !== undefined && parsed.email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (exists) {
        return NextResponse.json({ data: null, error: "Email already in use" }, { status: 409 });
      }
      data.email = parsed.email;
    }
    if (parsed.password) {
      data.password = await hashPassword(parsed.password);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({
      data: { id: updated.id, email: updated.email, name: updated.name, phone: updated.phone },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
