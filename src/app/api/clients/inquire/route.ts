import { NextRequest, NextResponse } from "next/server";
import { sendOwnerAlert, sendOwnerEmail, sendEmailTo } from "@/lib/alerts";
import {
  createClientLead,
  detectAudience,
  type NewClientLead,
} from "@/lib/client-leads";
import { listOwnersWithPrefsForClient } from "@/lib/client-owner-preferences";
import { isSupabaseConfigured } from "@/lib/supabase";

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
  "itc-quick-attach": {
    businessLabel: "Innovative Tractor Components (Jake McCall)",
    clientEmail: "jake@itcquickattach.com",
    emoji: "🚜",
  },
  "visit-marfa": {
    businessLabel: "Visit Marfa (MARFA Visitor Center)",
    clientEmail: "contact@visitmarfa.com",
    emoji: "🌵",
  },
  "wholme-naturopathy": {
    businessLabel: "Wholme Naturopathic Clinic (Debbie Kaczor)",
    clientEmail: "debbie@wholmenaturopathy.com.au",
    emoji: "🌿",
  },
  "greatminds-ae": {
    businessLabel: "Great Minds Early Childhood Center (Areti Panagiotou)",
    clientEmail: "info@greatminds.ae",
    emoji: "🦋",
  },
  "zenith-sports": {
    businessLabel: "Zenith Sports (Philip Lund + Paul Hanson)",
    clientEmail: "info@zenithsports.org",
    emoji: "⚽",
  },
  "riv-inc": {
    businessLabel: "RIV Inc. / CibusCloud (Ikkei Uemura + Arjun Sharma)",
    clientEmail: "info@riv-inc.jp",
    emoji: "🌾",
  },
  "hector-landscaping": {
    businessLabel: "Hector Landscaping & Design (Renton, WA)",
    clientEmail: "hectorlandscapingonline@gmail.com",
    emoji: "🌿",
  },
  "lewis-county-autism": {
    businessLabel: "Lewis County Autism Coalition",
    clientEmail: "info@lewiscountyautism.com",
    emoji: "🧩",
  },
  "mountain-view-landscape": {
    businessLabel: "Mountain View Landscape",
    clientEmail: "info@mountainviewlandscape.com",
    emoji: "⛰️",
  },
  "pine-and-particle": {
    businessLabel: "Pine & Particle",
    clientEmail: "info@pineandparticle.com",
    emoji: "🌲",
  },
  "laser-lakes": {
    businessLabel: "Laser Lakes (Nate)",
    clientEmail: "hello@laserlakes.com",
    emoji: "🪵",
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

  // Persist as a client_lead so the per-client dashboard + funnel engine
  // can pick it up. Best-effort — if Supabase isn't configured (local
  // dev) we still fire the owner alerts. The audience-segment auto-tag
  // runs on the raw payload; null result surfaces in the dashboard as
  // "needs manual tag" instead of false-confidently bucketing.
  let leadId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const audience = detectAudience(slug, body);
      // Source heuristic — the email-capture component posts a
      // "source": "email-capture" field; main inquiry forms don't.
      const source = (body.source as string) || "main-inquiry-form";
      const phone = (body.phone as string) || (body.tel as string) || null;
      const newLead: NewClientLead = {
        client_slug: slug,
        audience_segment: audience,
        name,
        email,
        phone,
        intent: (body.intent as string) || null,
        source,
        raw_payload: body,
      };
      const created = await createClientLead(newLead);
      leadId = created.id;
    } catch (err) {
      // Don't fail the form submit if the DB write fails — the owner
      // alert below still surfaces the lead.
      console.error("[clients/inquire] client_leads insert failed:", err);
    }
  }

  // Fan-out to client portal owners that have opted into INSTANT email
  // alerts. Owners on "digest" wait for the daily roll-up; "off" gets
  // nothing. This is the system that lets Philip get a ping the moment
  // a parent submits a Camp Finder lead — without spamming Ben for it.
  const clientOwnerSends: Promise<unknown>[] = [];
  if (isSupabaseConfigured()) {
    try {
      const owners = await listOwnersWithPrefsForClient(slug);
      const audience = detectAudience(slug, body);
      for (const o of owners) {
        const filter = o.prefs.instant_audience_filter ?? [];
        if (filter.length > 0 && audience && !filter.includes(audience)) {
          continue; // owner only wants specific audiences
        }
        if (o.prefs.new_lead_email === "instant") {
          clientOwnerSends.push(
            sendEmailTo({
              to: o.email,
              subject: `${cfg.emoji} New lead — ${name}`,
              body: fullMessage,
              fromName: `${cfg.businessLabel} Alerts`,
              clientSlug: slug,
            }).catch((err) =>
              console.error("[clients/inquire] client-owner email failed:", err),
            ),
          );
        }
        // SMS fan-out is intentionally skipped here — owners' personal
        // numbers + Twilio routing happens in a follow-up sprint when we
        // wire per-client Twilio sub-accounts.
      }
    } catch (err) {
      console.error("[clients/inquire] owner pref fan-out failed:", err);
    }
  }

  await Promise.allSettled([
    // Tag every owner alert with the client_slug so /spending's
    // per-client filter counts these against the right tenant.
    sendOwnerAlert(smsMessage, { clientSlug: slug }).catch((err) =>
      console.error("[clients/inquire] owner SMS failed:", err),
    ),
    sendOwnerEmail({ subject, body: fullMessage, clientSlug: slug }).catch(
      (err) => console.error("[clients/inquire] owner email failed:", err),
    ),
    ...clientOwnerSends,
  ]);

  return NextResponse.json({ ok: true, leadId });
}
