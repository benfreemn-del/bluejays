import { NextResponse } from "next/server";

import {
  listWorkLogEntries,
  digestAlreadySent,
  recordDigestSend,
  kindMeta,
  weekEndingISO,
  type WorkLogEntry,
} from "@/lib/work-log";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/cron/weekly-work-log-digest
 *
 * Friday 16:00 UTC (= 9am PT during PDT) — sends one digest email per
 * AI System client with that week's `client_work_log` entries
 * (visible_to_client=true only).
 *
 * Idempotent via `client_work_log_digests` UNIQUE(client_slug, week_ending).
 * Safe to re-run; clients already digested for the current week are skipped.
 *
 * Cron config: add to vercel.json
 *   { "path": "/api/cron/weekly-work-log-digest", "schedule": "0 16 * * 5" }
 *
 * Auth: middleware allows /api/cron/* with the CRON_SECRET header. Local
 * dev hits this without auth.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FROM_EMAIL = "bluejaycontactme@gmail.com" as const;

// SLUGS that get the digest — restricted to AI System ($10k tier) clients.
// When a new AI System client onboards, add their slug here. This is a
// short list and changes rarely; gating in code is simpler than another
// DB column.
const DIGEST_SLUGS = ["zenith-sports", "itc-quick-attach"] as const;

async function ownerEmailForSlug(slug: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("client_owners")
    .select("email")
    .eq("client_slug", slug)
    .limit(1)
    .maybeSingle();
  return (data?.email as string | null) ?? null;
}

async function clientBrandName(slug: string): Promise<string> {
  if (!isSupabaseConfigured()) return slug;
  const { data } = await supabase
    .from("clients")
    .select("display_name")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  return (data?.display_name as string | null) ?? slug;
}

function buildDigestEmail(opts: {
  brand: string;
  entries: WorkLogEntry[];
  weekEnding: string;
  portalUrl: string;
}): { subject: string; body: string } {
  const { brand, entries, weekEnding, portalUrl } = opts;
  const count = entries.length;
  const subject =
    count > 0
      ? `${brand} · ${count} ${count === 1 ? "thing" : "things"} shipped this week`
      : `${brand} · weekly check-in (quiet week)`;

  const headerDate = new Date(weekEnding + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric" },
  );

  const lines: string[] = [];
  lines.push(`Hi from BlueJays —`);
  lines.push("");
  lines.push(
    `Here's everything we built, fixed, and shipped for ${brand} this week ` +
      `(through ${headerDate}):`,
  );
  lines.push("");

  if (count === 0) {
    lines.push(
      `Quiet week — no scheduled changes, but the funnel kept running. ` +
        `Check the portal for live lead counts and last-touched timestamps:`,
    );
    lines.push(portalUrl);
  } else {
    for (const e of entries) {
      const meta = kindMeta(e.kind);
      lines.push(`${meta.emoji} ${meta.label.toUpperCase()} — ${e.title}`);
      if (e.details) {
        const indented = e.details
          .split("\n")
          .map((l) => `    ${l}`)
          .join("\n");
        lines.push(indented);
      }
      if (e.links.length > 0) {
        for (const l of e.links) {
          lines.push(`    ↗ ${l.label}: ${l.url}`);
        }
      }
      lines.push("");
    }
    lines.push(`See it all in the portal: ${portalUrl}`);
  }

  lines.push("");
  lines.push("");
  lines.push("Reply to this email with questions, requests, or just to say hi.");
  lines.push("");
  lines.push("— Ben @ BlueJays");
  lines.push("bluejaycontactme@gmail.com");
  lines.push("");
  lines.push("—");
  lines.push(
    "You're receiving this because you're on the BlueJays AI System. " +
      "Email frequency: weekly (Friday mornings) plus monthly funnel reports.",
  );

  return { subject, body: lines.join("\n") };
}

async function sendDigest(
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    console.warn(
      "[weekly-digest] SENDGRID_API_KEY missing — mock mode, skipping send to",
      to,
    );
    return { ok: true };
  }
  try {
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: "BlueJays" },
        subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    if (!sgRes.ok) {
      const errText = await sgRes.text().catch(() => "<no body>");
      console.error(
        "[weekly-digest] SendGrid REJECTED →",
        sgRes.status,
        errText,
      );
      return { ok: false, error: `${sgRes.status}: ${errText}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[weekly-digest] SendGrid threw:", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const weekEnding = weekEndingISO();
  const since = new Date(weekEnding + "T00:00:00Z");
  since.setUTCDate(since.getUTCDate() - 7);

  const results: Array<{
    slug: string;
    entries: number;
    skipped?: string;
    sent?: boolean;
    error?: string;
  }> = [];

  for (const slug of DIGEST_SLUGS) {
    try {
      if (await digestAlreadySent(slug, weekEnding)) {
        results.push({ slug, entries: 0, skipped: "already_sent" });
        continue;
      }
      const entries = await listWorkLogEntries({
        client_slug: slug,
        since,
        visibleOnly: true,
      });
      const ownerEmail = await ownerEmailForSlug(slug);
      if (!ownerEmail) {
        results.push({
          slug,
          entries: entries.length,
          skipped: "no_owner_email",
        });
        continue;
      }
      const brand = await clientBrandName(slug);
      const { subject, body } = buildDigestEmail({
        brand,
        entries,
        weekEnding,
        portalUrl: `${baseUrl}/clients/${slug}/portal`,
      });
      const send = await sendDigest(ownerEmail, subject, body);
      if (!send.ok) {
        results.push({
          slug,
          entries: entries.length,
          sent: false,
          error: send.error,
        });
        continue;
      }
      await recordDigestSend({
        client_slug: slug,
        week_ending: weekEnding,
        entry_count: entries.length,
        recipient_email: ownerEmail,
      });
      results.push({ slug, entries: entries.length, sent: true });
    } catch (err) {
      results.push({
        slug,
        entries: 0,
        sent: false,
        error: (err as Error).message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    weekEnding,
    results,
  });
}
