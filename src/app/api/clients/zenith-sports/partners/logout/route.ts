import { NextRequest, NextResponse } from "next/server";
import { partnerSessionCookieName } from "@/lib/partner-auth";

/**
 * POST /api/clients/zenith-sports/partners/logout
 *
 * Clears the per-tenant Zenith session cookie.
 *
 * Redirects to /clients/zenith-sports/partners/login by default (because
 * the workspace uses a plain form submit). When called via fetch with
 * the Accept: application/json header, returns JSON instead.
 */
export async function POST(request: NextRequest) {
  const wantsJson = (request.headers.get("accept") || "")
    .toLowerCase()
    .includes("application/json");

  const url = new URL(request.url);
  const redirectTarget = `${url.origin}/clients/zenith-sports/partners/login`;

  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(redirectTarget, { status: 303 });

  res.cookies.set(partnerSessionCookieName("zenith-sports"), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
