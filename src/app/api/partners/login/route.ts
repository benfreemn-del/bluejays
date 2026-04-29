import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  signPartnerSession,
  PARTNER_SESSION_COOKIE,
} from "@/lib/partner-auth";
import type { Partner } from "@/lib/partners";

/**
 * POST /api/partners/login
 *
 * Body: { email, code }
 *
 * Verifies (email, code) matches a partner with status='approved'.
 * Sets httpOnly Secure cookie and returns 200. Client navigates to
 * /partners/work after success.
 *
 * Rate-limited 8/IP/15min — light, since the family team will retype.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`partner-login:${ip}`, 8, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Wait 15 minutes." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database unavailable." },
      { status: 503 },
    );
  }

  let body: { email?: string; code?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || "").trim().toLowerCase();
  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and partner code required." },
      { status: 400 },
    );
  }

  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .maybeSingle();

  if (!data) {
    return NextResponse.json(
      { error: "Email + code don't match. Check with Ben if stuck." },
      { status: 401 },
    );
  }
  const partner = data as unknown as Partner;
  if (partner.status !== "approved") {
    return NextResponse.json(
      {
        error:
          partner.status === "pending"
            ? "Your application is still pending Ben's approval."
            : "This partner account isn't active. Email ben@bluejayportfolio.com.",
      },
      { status: 403 },
    );
  }

  // Stamp last_login_at — best-effort, ignore errors
  await supabase
    .from("partners")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", partner.id);

  const sessionToken = signPartnerSession(partner.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARTNER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return res;
}
