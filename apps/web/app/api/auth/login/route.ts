import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { verifyPassword, generateSessionId, signToken } from "../../../../lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) {
      return NextResponse.json({ data: null, error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.password, user.password);
    if (!ok) {
      return NextResponse.json({ data: null, error: "Invalid credentials" }, { status: 401 });
    }

    const sid = generateSessionId();
    await prisma.user.update({
      where: { id: user.id },
      data: { token: sid, lastLoggedIn: new Date() },
    });

    const token = signToken({ sub: user.id, sid });

    const res = NextResponse.json({
      data: { user: { id: user.id, email: user.email, name: user.name } },
      error: null,
    });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
