import { NextRequest } from "next/server";
import { prisma } from "@glow/database";
import { verifyToken } from "./auth";

export async function getCurrentUser(req: NextRequest) {
  const cookieToken = req.cookies.get("auth_token")?.value;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = cookieToken || bearer;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;
  if (!user.token || user.token !== payload.sid) return null;
  return user;
}

export function setAuthCookie(response: Response, token: string) {
  // helper not used; cookie set via NextResponse
}
