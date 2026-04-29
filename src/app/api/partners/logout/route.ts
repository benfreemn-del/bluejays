import { NextResponse } from "next/server";
import { PARTNER_SESSION_COOKIE } from "@/lib/partner-auth";

/** POST /api/partners/logout — clears the session cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
