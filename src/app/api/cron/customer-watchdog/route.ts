import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * /api/cron/customer-watchdog
 *
 * Daily anomaly detection across every active AI Package client.
 * Different from /api/watchdog/run (infrastructure health) — this one
 * watches CUSTOMER-SUCCESS metrics: lead volume, engagement, response
 * rate, and time since last activity.
 *
 * Surfaces problems BEFORE the client notices them (the renewal-saving
 * move in the deep-dive review). Every flagged anomaly hits Ben's
 * inbox + phone before the client opens their portal next morning.
 *
 * Active client = any slug with a row in client_owners. The watchdog
 * iterates each active slug and runs three checks:
 *
 *   1. Lead volume drop · this week's leads vs prior week
 *      Flag if down ≥40% AND prior week had ≥5 leads (avoid noisy
 *      flag on tiny baselines).
 *
 *   2. Lead drought · days since last client_lead row
 *      Flag if ≥7 days for any client (was generating leads → now
 *      silent. Real signal of a broken funnel / Twilio number
 *      misconfigured / ad disapproval).
 *
 *   3. Engagement collapse · response rate this week vs prior
 *      Flag if responded%/sent% drops ≥50% AND prior had ≥10 sends.
 *
 * Output: single SMS + email digest per run, grouped by client. Empty
 * digest = silent (no notification spam on healthy days).
 *
 * Schedule: 14:23 UTC daily (off-peak minute, after the regular
 * crons settle but before North American business hours).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type Anomaly = {
  client: string;
  severity: "warn" | "critical";
  kind: string;
  detail: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request?: NextRequest) {
  if (request) {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat(
      "customer_watchdog",
      { reason: "supabase_not_configured" },
      "skipped",
    );
    return NextResponse.json({ message: "Supabase not configured" });
  }

  const { data: ownerRows } = await supabase
    .from("client_owners")
    .select("client_slug");
  const slugs = Array.from(
    new Set(((ownerRows ?? []) as { client_slug: string }[]).map((r) => r.client_slug)),
  );

  if (slugs.length === 0) {
    await logHeartbeat("customer_watchdog", { clients: 0 });
    return NextResponse.json({ message: "No active clients", anomalies: [] });
  }

  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY_MS).toISOString();
  const twoWeeksAgo = new Date(now - 14 * DAY_MS).toISOString();
  const sevenDaysAgo = new Date(now - 7 * DAY_MS).toISOString();

  const anomalies: Anomaly[] = [];

  for (const slug of slugs) {
    // ─── Check 1 + 2 · Lead volume + drought
    const { data: leadRows } = await supabase
      .from("client_leads")
      .select("created_at")
      .eq("client_slug", slug)
      .gte("created_at", twoWeeksAgo);
    const leads = (leadRows ?? []) as { created_at: string }[];
    const thisWeek = leads.filter((l) => l.created_at >= weekAgo).length;
    const priorWeek = leads.length - thisWeek;

    if (priorWeek >= 5 && thisWeek <= priorWeek * 0.6) {
      anomalies.push({
        client: slug,
        severity: "warn",
        kind: "lead-volume-drop",
        detail: `${thisWeek} leads this week vs ${priorWeek} prior — ${Math.round(((priorWeek - thisWeek) / priorWeek) * 100)}% drop`,
      });
    }

    // Drought check — when was the last lead?
    const lastLeadAt =
      leads.length > 0
        ? leads.reduce(
            (max, l) => (l.created_at > max ? l.created_at : max),
            leads[0].created_at,
          )
        : null;
    if (lastLeadAt && lastLeadAt < sevenDaysAgo) {
      const days = Math.floor(
        (now - new Date(lastLeadAt).getTime()) / DAY_MS,
      );
      anomalies.push({
        client: slug,
        severity: "critical",
        kind: "lead-drought",
        detail: `No new leads in ${days} days (last: ${new Date(lastLeadAt).toLocaleDateString()})`,
      });
    } else if (!lastLeadAt && leads.length === 0) {
      // Brand-new client with zero leads in 14 days — only flag if
      // they've been a client for >14 days. Need to check their
      // client_owners.created_at for tenure.
      const { data: owner } = await supabase
        .from("client_owners")
        .select("created_at")
        .eq("client_slug", slug)
        .maybeSingle();
      const ownerCreatedAt = (owner as { created_at?: string } | null)
        ?.created_at;
      if (
        ownerCreatedAt &&
        new Date(ownerCreatedAt).getTime() < now - 14 * DAY_MS
      ) {
        anomalies.push({
          client: slug,
          severity: "critical",
          kind: "lead-drought",
          detail: `No leads in 14+ days · client onboarded ${new Date(ownerCreatedAt).toLocaleDateString()}`,
        });
      }
    }

    // ─── Check 3 · Engagement collapse (sends + responses)
    const { data: msgRows } = await supabase
      .from("client_lead_messages")
      .select("sent_at, status, replied_at")
      .eq("client_slug", slug)
      .gte("sent_at", twoWeeksAgo);
    const msgs = (msgRows ?? []) as {
      sent_at: string;
      status: string;
      replied_at: string | null;
    }[];

    const thisWeekMsgs = msgs.filter((m) => m.sent_at >= weekAgo);
    const priorWeekMsgs = msgs.filter((m) => m.sent_at < weekAgo);

    if (priorWeekMsgs.length >= 10) {
      const priorRate =
        priorWeekMsgs.filter((m) => m.replied_at).length / priorWeekMsgs.length;
      const thisRate =
        thisWeekMsgs.length === 0
          ? 0
          : thisWeekMsgs.filter((m) => m.replied_at).length /
            thisWeekMsgs.length;

      if (priorRate >= 0.05 && thisRate <= priorRate * 0.5) {
        anomalies.push({
          client: slug,
          severity: "warn",
          kind: "engagement-collapse",
          detail: `Reply rate ${(thisRate * 100).toFixed(1)}% vs ${(priorRate * 100).toFixed(1)}% prior — ${(((priorRate - thisRate) / priorRate) * 100).toFixed(0)}% drop`,
        });
      }
    }
  }

  // ─── Build the digest + alert
  if (anomalies.length === 0) {
    await logHeartbeat("customer_watchdog", { clients: slugs.length, anomalies: 0 });
    return NextResponse.json({
      message: "All quiet — no anomalies detected",
      clients: slugs.length,
      anomalies: [],
    });
  }

  // Group by client for the digest
  const byClient = new Map<string, Anomaly[]>();
  for (const a of anomalies) {
    if (!byClient.has(a.client)) byClient.set(a.client, []);
    byClient.get(a.client)!.push(a);
  }

  const lines: string[] = [
    `🔔 CUSTOMER WATCHDOG · ${anomalies.length} anomal${anomalies.length === 1 ? "y" : "ies"} across ${byClient.size} client${byClient.size === 1 ? "" : "s"}`,
    ``,
  ];
  for (const [client, list] of byClient) {
    lines.push(`▸ ${client}`);
    for (const a of list) {
      const icon = a.severity === "critical" ? "🚨" : "⚠️";
      lines.push(`  ${icon} ${a.kind}: ${a.detail}`);
    }
    lines.push(``);
  }
  lines.push(`Open /dashboard/clients/${[...byClient.keys()][0]} to investigate`);

  try {
    await sendOwnerAlert(lines.join("\n"));
  } catch (err) {
    console.warn("[customer-watchdog] alert failed:", err);
  }

  await logHeartbeat("customer_watchdog", {
    clients: slugs.length,
    anomalies: anomalies.length,
  });

  return NextResponse.json({
    message: `${anomalies.length} anomal${anomalies.length === 1 ? "y" : "ies"} detected`,
    clients: slugs.length,
    anomalies,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
