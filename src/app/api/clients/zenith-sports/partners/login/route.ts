import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  signPartnerSession,
  partnerSessionCookieName,
} from "@/lib/partner-auth";
import type { Partner } from "@/lib/partners";

/**
 * POST /api/clients/zenith-sports/partners/login
 *
 * Body: { email, code }
 *
 * Verifies (email, code) matches a partner with status='approved' AND
 * client_slug='zenith-sports'. Sets the per-tenant httpOnly Secure
 * cookie and returns 200. Client navigates to /clients/zenith-sports/partners/work.
 *
 * Rate-limited 8/IP/15min to mirror the BlueJays partner-login policy.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`zenith-partner-login:${ip}`, 8, 15 * 60 * 1000);
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
    .eq("client_slug", "zenith-sports")
    .maybeSingle();

  if (!data) {
    return NextResponse.json(
      { error: "Email + code don't match. Email Philip if stuck." },
      { status: 401 },
    );
  }
  const partner = data as unknown as Partner;
  if (partner.status !== "approved") {
    return NextResponse.json(
      {
        error:
          partner.status === "pending"
            ? "Your application is still pending Philip's approval."
            : "This partner account isn't active. Email partners@zenithsports.org.",
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
  res.cookies.set(partnerSessionCookieName("zenith-sports"), sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
  return res;
}
