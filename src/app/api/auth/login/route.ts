import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { checkSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Login endpoint — Q4=A locked 2026-05-08. Two passwords supported:
 *   - ADMIN_PASSWORD (or ADMIN_PASSWORD_BEN) → role=owner (Ben, full access)
 *   - ADMIN_PASSWORD_MADIE → role=sales (Madie, gated tab visibility)
 *
 * Both passwords produce a valid bluejays_auth session token (kept
 * httpOnly + matched in middleware). The bj_role cookie carries the
 * role tag and IS readable by client JS so the top nav + tab bars
 * filter their visible items per role.
 *
 * Env-var contract:
 *   - ADMIN_PASSWORD (existing) — Ben's password. If unset, falls
 *     back to "bluejay2026" (legacy default). Always works.
 *   - ADMIN_PASSWORD_BEN (optional alias) — same as ADMIN_PASSWORD.
 *     Lets Ben rotate without breaking the legacy var.
 *   - ADMIN_PASSWORD_MADIE (optional) — Madie's password. If unset,
 *     no Madie login. Setting it activates the sales-role flow.
 *
 * Backwards-compatible: if ADMIN_PASSWORD_MADIE is unset, the auth
 * flow is identical to before. No cookies break, no users lock out.
 */

const OWNER_PASSWORD = (
  process.env.ADMIN_PASSWORD_BEN ||
  process.env.ADMIN_PASSWORD ||
  "bluejay2026"
).trim();
const SALES_PASSWORD = (process.env.ADMIN_PASSWORD_MADIE || "").trim();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again in 5 minutes." }, { status: 429 });
  }

  const body = await request.json();
  const { password } = body;

  let role: "owner" | "sales" | null = null;
  let tokenSource = "";
  if (password === OWNER_PASSWORD) {
    role = "owner";
    tokenSource = OWNER_PASSWORD;
  } else if (SALES_PASSWORD && password === SALES_PASSWORD) {
    role = "sales";
    tokenSource = SALES_PASSWORD;
  }

  if (!role) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const sessionToken = createHash("sha256")
    .update(tokenSource + "bluejays-session-salt")
    .digest("hex");
  const response = NextResponse.json({ success: true, role });

  // Auth cookie — httpOnly, validated in middleware
  response.cookies.set("bluejays_auth", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  // Role cookie — readable by client JS so top nav + ClientTabsBar
  // can filter visible tabs without an extra API roundtrip. Not a
  // security gate (server-side authorization happens via the
  // session-token cookie above); just a visibility hint.
  response.cookies.set("bj_role", role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
