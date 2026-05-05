import { NextResponse } from "next/server";
import { sendCampaign } from "@/lib/client-campaigns";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/cron/campaigns-scheduled
 *
 * Vercel cron — runs every 5 min. Finds every client_email_campaign
 * with status='scheduled' and scheduled_for <= now() and fires sendCampaign
 * on each. The send pipeline flips status to 'sending' before fan-out
 * and 'sent' after, so a re-firing cron never double-sends.
 *
 * Designed to be idempotent: if a cron run crashes mid-way, the next
 * run picks up where it left off because the campaign's status will
 * have already advanced.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ScheduledRow = {
  id: string;
  client_slug: string;
  scheduled_for: string;
  name: string;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: false,
      error: "Supabase not configured",
    });
  }

  const sb = getSupabase();
  const now = new Date().toISOString();

  // Find every campaign that's due. Cap at 50 per run so a backlog
  // doesn't lock up the cron — next run picks up the rest.
  const { data, error } = await sb
    .from("client_email_campaigns")
    .select("id, client_slug, scheduled_for, name")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { ok: false, error: `query failed: ${error.message}` },
      { status: 500 },
    );
  }

  const due = (data ?? []) as ScheduledRow[];
  if (due.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: "No scheduled campaigns due.",
    });
  }

  const results: Array<{
    campaignId: string;
    clientSlug: string;
    name: string;
    ok: boolean;
    sent?: number;
    failed?: number;
    error?: string;
  }> = [];

  for (const row of due) {
    try {
      const r = await sendCampaign({
        id: row.id,
        clientSlug: row.client_slug,
        // Per-client from-name. Map a few known slugs; default to a
        // generic label that's still recognizable.
        fromName:
          row.client_slug === "zenith-sports"
            ? "TEKKY"
            : row.client_slug === "itc-quick-attach"
              ? "ITC Quick Attach"
              : row.client_slug,
      });
      results.push({
        campaignId: row.id,
        clientSlug: row.client_slug,
        name: row.name,
        ok: true,
        sent: r.sent,
        failed: r.failed,
      });
    } catch (err) {
      // Don't let one bad campaign abort the rest of the batch.
      results.push({
        campaignId: row.id,
        clientSlug: row.client_slug,
        name: row.name,
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      });
      console.error(
        `[campaigns-scheduled] ${row.client_slug}/${row.name} (${row.id}) failed:`,
        err,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
