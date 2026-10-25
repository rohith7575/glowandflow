import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { z } from "zod";
import { hashPassword, generateOtp } from "../../../../lib/auth";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      return NextResponse.json({ data: null, error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.password);
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: {
        email: parsed.email,
        code,
        purpose: "signup",
        payload: { name: parsed.name, phone: parsed.phone ?? null, password: passwordHash } as any,
        expiresAt,
      },
    });

    // OTP is logged to the console for the developer to read
    console.log(`[OTP] signup code for ${parsed.email}: ${code}`);

    return NextResponse.json({ data: { email: parsed.email }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 400 });
  }
}
