import { NextRequest, NextResponse } from "next/server";
import { sendOwnerAlert, sendOwnerEmail } from "@/lib/alerts";

/**
 * POST /api/clients/inquire
 *
 * Shared inquiry endpoint for the custom-tier showcase sites at
 * /clients/[slug] and /v2/consulting (Daniel Consulting). Each site
 * has its own form with business-specific fields, but they all post
 * the same shape to this endpoint:
 *
 *   { slug: "ps-reiki" | "heale-counseling" | "tacos-yum" | "consulting",
 *     name: string,
 *     email: string,
 *     ...all other fields the form collected }
 *
 * Behavior:
 *   - Validates name + email
 *   - Renders a structured email + SMS to Ben describing the inquiry
 *     (sender name, the slug, every field they filled in)
 *   - Returns ok:true so the form can show its success state
 *
 * Why we don't store these in Supabase yet: at low volume Ben can
 * forward each lead to the actual client (Pratima, Melissa, Bob, Reece)
 * directly. Once volume picks up we'll add a `client_inquiries` table.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Per-slug config for routing context. Keeps the email subject + intro
// readable when Ben triages the inbox so he knows which client this is
// for at a glance.
const SLUG_CONFIG: Record<
  string,
  { businessLabel: string; clientEmail: string; emoji: string }
> = {
  "ps-reiki": {
    businessLabel: "PS Reiki (Pratima)",
    clientEmail: "pratima.reiki@gmail.com",
    emoji: "🪷",
  },
  "heale-counseling": {
    businessLabel: "Heale (Melissa Hale, LCSW)",
    clientEmail: "connect@heale.me",
    emoji: "⚖️",
  },
  "tacos-yum": {
    businessLabel: "Tacos Yum (Bob)",
    clientEmail: "bobstaco@tacosyum.com",
    emoji: "🌮",
  },
  consulting: {
    businessLabel: "Daniel Consulting Group (Reece)",
    clientEmail: "reece@danielconsultinggroup.com",
    emoji: "🔋",
  },
};

// in-memory rate-limit bucket — resets on deploy, sufficient for MVP
const recentByIp = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (recentByIp.get(ip) ?? []).filter((t) => now - t < LIMIT_WINDOW_MS);
  arr.push(now);
  recentByIp.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (tooMany(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — try again in a minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = String(body.slug || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  const cfg = SLUG_CONFIG[slug];
  if (!cfg) {
    return NextResponse.json({ ok: false, error: "Unknown site" }, { status: 400 });
  }
  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "Name and email are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 },
    );
  }

  // Build a readable owner-alert body. Iterate every body key (except
  // slug/name/email which are summarized in the header) so site-specific
  // fields surface without needing per-slug code here.
  const skipKeys = new Set(["slug", "name", "email"]);
  const fieldLines: string[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (skipKeys.has(k)) continue;
    if (v === "" || v === null || v === undefined) continue;
    const label = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const valueStr = typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);
    fieldLines.push(`${label}: ${valueStr}`);
  }

  const summaryLines = [
    `${cfg.emoji} New inquiry — ${cfg.businessLabel}`,
    "",
    `From: ${name} <${email}>`,
    "",
    "Details:",
    ...(fieldLines.length > 0 ? fieldLines.map((l) => `  • ${l}`) : ["  (no additional fields)"]),
    "",
    `Forward to client: ${cfg.clientEmail}`,
  ];

  const fullMessage = summaryLines.join("\n");
  const subject = `${cfg.emoji} New inquiry — ${cfg.businessLabel} — ${name}`;
  const smsMessage = `${cfg.emoji} ${cfg.businessLabel}\n${name} <${email}>\n→ Check email for details`;

  await Promise.allSettled([
    sendOwnerAlert(smsMessage).catch((err) =>
      console.error("[clients/inquire] owner SMS failed:", err),
    ),
    sendOwnerEmail({ subject, body: fullMessage }).catch((err) =>
      console.error("[clients/inquire] owner email failed:", err),
    ),
  ]);

  return NextResponse.json({ ok: true });
}
