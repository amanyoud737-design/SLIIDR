import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminSession, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  const hash = process.env.ADMIN_PASSWORD_HASH!;
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

  const token = signAdminSession();
  setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
