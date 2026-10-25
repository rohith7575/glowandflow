import { NextResponse } from "next/server";
import { prisma } from "@glow/database";
import { getCurrentUser } from "../../../../lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (user) {
    // Server-side token revocation: clear the stored session token
    await prisma.user.update({ where: { id: user.id }, data: { token: null } });
  }
  const res = NextResponse.json({ data: { ok: true }, error: null });
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
