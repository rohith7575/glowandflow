import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { generateSessionId, signToken } from "../../../../lib/auth";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const otp = await prisma.otp.findFirst({
      where: {
        email: parsed.email,
        purpose: "signup",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.code !== parsed.code) {
      return NextResponse.json({ data: null, error: "Invalid or expired OTP" }, { status: 400 });
    }

    const payload = otp.payload as { name: string; phone: string | null; password: string } | null;
    if (!payload) {
      return NextResponse.json({ data: null, error: "Invalid OTP payload" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ data: null, error: "Email already registered" }, { status: 409 });
    }

    const sid = generateSessionId();
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
        token: sid,
        lastLoggedIn: new Date(),
      },
    });

    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });

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
