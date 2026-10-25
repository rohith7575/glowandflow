import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/session";

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ data: null, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    data: { id: user.id, email: user.email, name: user.name },
    error: null,
  });
}
