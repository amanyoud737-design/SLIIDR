import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export function signAdminSession() {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ role: "admin" }, secret, { expiresIn: "7d" });
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function isAdminRequest(): boolean {
  try {
    const secret = process.env.JWT_SECRET!;
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return false;
    const payload = jwt.verify(token, secret) as any;
    return payload?.role === "admin";
  } catch {
    return false;
  }
}
