import { NextRequest, NextResponse } from "next/server";
import {
  authenticateOwner,
  makeSessionCookie,
} from "@/lib/client-auth";

/**
 * POST /api/client-portal/login
 * Body: { email, password, slug? }
 *
 * On success: sets the `client-portal-session` cookie and returns the
 * owner's client_slug so the client redirects to /clients/{slug}/portal.
 * On failure: 401 with a generic error.
 *
 * `slug` in the body is optional but recommended — it locks the login
 * attempt to a specific client so a Wholme owner can't accidentally
 * sign into the Zenith portal with the wrong creds.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; slug?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email || "").trim();
  const password = (body.password || "").trim();
  const expectedSlug = (body.slug || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password required" },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const result = await authenticateOwner(email, password, ip);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 401 });
    }
    if (expectedSlug && result.owner.client_slug !== expectedSlug) {
      // Owner exists but for a different client — don't reveal which
      // one (info leak); just say invalid.
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }
    const cookie = makeSessionCookie(result.owner);
    const res = NextResponse.json({
      ok: true,
      slug: result.owner.client_slug,
      name: result.owner.name,
    });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (err) {
    console.error("[client-portal/login] error:", err);
    return NextResponse.json(
      { ok: false, error: "Login failed. Try again." },
      { status: 500 },
    );
  }
}
