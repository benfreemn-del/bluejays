import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";
import { sendPostcard } from "@/lib/postcard-sender";
import type { Prospect } from "@/lib/types";

/**
 * Daily cron: send Lob postcards to high-intent prospects who submitted
 * an audit ≥ 5 days ago and haven't taken any action since (Q8C).
 *
 * Why this exists: every prospect who hits /audit and submits gives us
 * email + URL + category — they self-identified as "warm enough to
 * spend 3 minutes". A postcard sent to that hand-raised prospect 5 days
 * later is night-and-day better than a cold-list postcard. The Lob send
 * costs ~$1.20; at 4.5+ stars the lifetime value math works at < 5%
 * close rate.
 *
 * Filter (composite gate):
 *   1. Has a `site_audits` row with status='ready' (audit completed)
 *   2. Audit `created_at` ≤ now() - 5 days
 *   3. `audit_postcard_sent_at` IS NULL (idempotent — never re-send)
 *   4. `manually_managed` = false (Rule 49 — never auto-touch a manual
 *      prospect; Ben handles those personally)
 *   5. status NOT IN ('paid','dismissed','unsubscribed','bounced',
 *      'audit_preview_requested') — they took action; no postcard
 *   6. scrapedData rating >= 4.5 (high-intent only — Q8C protects
 *      per-prospect economics; sendPostcard's tier gate would catch
 *      this anyway, but pre-filtering saves DB reads + Lob calls)
 *
 * After successful send: stamp `audit_postcard_sent_at` so the cron
 * never picks them up again.
 *
 * Schedule: 0 19 * * *  (19:00 UTC = 11am PT — sits in the daily
 * outbound window per Rule 30, AFTER existing crons).
 *
 * Mock-safe: if LOB_API_KEY is absent, sendPostcard logs + no-ops; the
 * cron still runs (and stamps audit_postcard_sent_at on the no-op so
 * we don't keep retrying).
 *
 * Auth: Vercel cron passes Bearer CRON_SECRET. Manual triggers must
 * pass the same header.
 */
export async function POST(request?: NextRequest) {
  return runCron(request);
}

// GET handler so Ben (or curl) can hit the URL with a Bearer token
// from a browser-friendly tool. Same auth gate as POST.
export async function GET(request?: NextRequest) {
  return runCron(request);
}

async function runCron(request?: NextRequest) {
  if (request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      message: "Supabase not configured — cron is a no-op in dev",
      sent: 0,
    });
  }

  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  // Step 1: pull every audit row that's ≥5 days old and ready. Small
  // result set in practice (only audits, not all prospects) so this
  // index lookup is cheap.
  const { data: auditRows, error: auditErr } = await supabase
    .from("site_audits")
    .select("id, prospect_id, created_at, target_url")
    .eq("status", "ready")
    .lte("created_at", fiveDaysAgo);

  if (auditErr) {
    console.error("[audit/postcard-cron] audit query failed:", auditErr);
    return NextResponse.json({ error: auditErr.message }, { status: 500 });
  }

  const audits = auditRows || [];
  if (audits.length === 0) {
    return NextResponse.json({
      message: "No audits past Day 5 yet.",
      sent: 0,
    });
  }

  // Dedupe prospect IDs (a single prospect could have multiple audits)
  const uniqueProspectIds = Array.from(new Set(audits.map((r) => r.prospect_id as string)));

  // Step 2: pull the candidate prospects in one query with as much of
  // the gate as Postgres can express directly. Status filter + manually
  // managed flag + postcard-not-yet-sent.
  const { data: prospectRows, error: prospectErr } = await supabase
    .from("prospects")
    .select("id, business_name, status, manually_managed, scraped_data, address, city, state")
    .in("id", uniqueProspectIds)
    .is("audit_postcard_sent_at", null)
    .eq("manually_managed", false)
    .not("status", "in", "(paid,dismissed,unsubscribed,bounced,audit_preview_requested)");

  if (prospectErr) {
    console.error("[audit/postcard-cron] prospect query failed:", prospectErr);
    return NextResponse.json({ error: prospectErr.message }, { status: 500 });
  }

  // Step 3: rating filter (4.5+ stars per Q8C). scrapedData is JSONB —
  // simpler to filter in JS than craft a Postgres JSONB cast in the
  // Supabase JS client.
  const candidates = (prospectRows || []).filter((p) => {
    const sd = (p.scraped_data ?? {}) as Record<string, unknown>;
    const ratingRaw = sd.googleRating ?? sd.rating ?? sd.googleRatingValue ?? 0;
    const rating = typeof ratingRaw === "number" ? ratingRaw : parseFloat(String(ratingRaw)) || 0;
    return rating >= 4.5;
  });

  if (candidates.length === 0) {
    return NextResponse.json({
      message: `${prospectRows?.length || 0} candidates past Day 5 but none meet the 4.5★ gate.`,
      sent: 0,
      considered: prospectRows?.length || 0,
    });
  }

  console.log(
    `[audit/postcard-cron] ${candidates.length} eligible prospects (5+ days post-audit, 4.5★+, no action)`,
  );

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const results: Array<{
    id: string;
    businessName: string;
    sent: boolean;
    skipped?: string;
    error?: string;
  }> = [];

  for (const c of candidates) {
    const id = c.id as string;
    // Hydrate full Prospect (sendPostcard expects the camelCase shape).
    const prospect = await getProspect(id);
    if (!prospect) {
      failed++;
      continue;
    }

    try {
      // No forceTier here — sendPostcard's internal tier gate is the
      // belt to our suspenders. We pre-filtered at 4.5★ in the cron,
      // sendPostcard double-checks rating + reviews + address validity.
      const result = await sendPostcard(prospect as Prospect);
      if (result.sent) {
        sent++;
        await supabase
          .from("prospects")
          .update({ audit_postcard_sent_at: new Date().toISOString() })
          .eq("id", id);
        results.push({ id, businessName: prospect.businessName, sent: true });
      } else {
        skipped++;
        // Stamp anyway when skipped for a "permanent" reason (no address,
        // tier-gate fail, etc.) so the cron doesn't keep retrying tomorrow.
        // Only RE-try when skipped for transient errors (which sendPostcard
        // exposes via result.error rather than result.skipped).
        if (result.skipped && !result.error) {
          await supabase
            .from("prospects")
            .update({ audit_postcard_sent_at: new Date().toISOString() })
            .eq("id", id);
        }
        results.push({
          id,
          businessName: prospect.businessName,
          sent: false,
          skipped: result.skipped || "unknown",
          error: result.error,
        });
      }
    } catch (err) {
      failed++;
      results.push({
        id,
        businessName: prospect.businessName,
        sent: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(
    `[audit/postcard-cron] done: sent=${sent} skipped=${skipped} failed=${failed}`,
  );

  return NextResponse.json({
    sent,
    skipped,
    failed,
    eligible: candidates.length,
    results,
  });
}
