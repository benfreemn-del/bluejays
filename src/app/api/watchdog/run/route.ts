import { NextRequest, NextResponse, after } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { runAllHealthChecks } from "@/lib/health-checks";

/**
 * Daily watchdog cron — implements Rule 66.
 *
 * Checks that every monitored cron has logged a heartbeat row inside
 * its expected window. If any cron is silent past its threshold, fires
 * an SMS to Ben so we hear about cron failures within hours instead
 * of weeks.
 *
 * Also folds in the stuck-audit detector (item #10 from the
 * adversarial review): finds audits stuck in pending/generating > 10
 * minutes and includes them in the alert so Ben can manually push
 * them through or mark failed.
 *
 * Watchdog itself is the canary — every tick logs to watchdog_runs
 * regardless of result. A separate manual eyeball check (or a
 * second-level watchdog later) confirms this cron is firing.
 *
 * Schedule: daily 13:00 UTC (5am PT) — runs BEFORE other crons fire
 * at 14-19 UTC so it inspects the previous calendar day's activity.
 *
 * Auth: CRON_SECRET via Bearer header (Vercel cron + manual curl).
 */

// Vendor health checks add up to ~5s parallel (10 vendors × 5s timeout
// in Promise.all) on top of the normal watchdog work. 60s is plenty.
export const maxDuration = 60;

interface WatchedCron {
  name: string;
  /** Table whose newest row's timestamp = the cron's last heartbeat */
  table: string;
  /** Column on that table holding the heartbeat timestamp */
  column: string;
  /** If newest row's column > thresholdHours old, fire alert */
  thresholdHours: number;
  /** Optional WHERE filter (e.g. only Active runs, not Dormant) */
  where?: { col: string; eq: unknown };
  /** Whether ZERO rows in the table means a problem.
   *  - For heartbeat tables (hyperloop_runs) → true: zero rows means
   *    the cron's never run, which is a bug.
   *  - For activity-driven tables (email_retry_queue) → false: zero
   *    rows is the GOOD state (no email failures yet). Only alert
   *    when rows existed historically but the latest is stale. */
  alertOnZeroRows?: boolean;
}

/**
 * Crons we monitor. Add to this list when shipping new scheduled
 * tasks. Each entry is a hardcoded mapping from cron-name → which
 * table/column gets a row when the cron successfully runs.
 *
 * Adversarial review A — Critical #1 fix (2026-04-26): Rule 66
 * required EVERY cron to have a heartbeat alert. Pre-fix only 3 of 17
 * crons were watched. Generic `cron_heartbeats` table is now written
 * to from every scheduled task via `logHeartbeat()` after a successful
 * run. Each `cron_heartbeats` entry below filters by `cron_name`.
 *
 * Threshold heuristic: 2× the cron's schedule period. Daily crons →
 * 36 hours. Every-5-min cron (onboarding-reminders) → still ~36h
 * because the cron writing zero heartbeats for 36 hours = a bug.
 * Per-minute cron (replies/process) → 1 hour (60+ missed runs).
 * Weekly (hyperloop) → 8 days. Monthly (reports) → 35 days.
 */
const WATCHED_CRONS: WatchedCron[] = [
  // ─── Heartbeat-table watchers (newer pattern, generic) ───────
  {
    name: "funnel_run",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "funnel_run" },
    alertOnZeroRows: true,
  },
  {
    name: "replies_process",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 1, // Per-minute cron — 1 hour silent = 60+ missed
    where: { col: "cron_name", eq: "replies_process" },
    alertOnZeroRows: true,
  },
  {
    name: "onboarding_reminders",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 6, // Every-5-min cron, but reminder logic is data-dependent
    where: { col: "cron_name", eq: "onboarding_reminders" },
    alertOnZeroRows: true,
  },
  {
    name: "digest",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "digest" },
    alertOnZeroRows: true,
  },
  {
    name: "referral_send",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "referral_send" },
    alertOnZeroRows: true,
  },
  {
    name: "reports_monthly",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 24 * 35, // Monthly cron — 35-day threshold
    where: { col: "cron_name", eq: "reports_monthly" },
    alertOnZeroRows: true,
  },
  {
    name: "auto_scout",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "auto_scout" },
    alertOnZeroRows: true,
  },
  {
    name: "billing_check_renewals",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "billing_check_renewals" },
    alertOnZeroRows: true,
  },
  {
    name: "billing_retry_sends",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "billing_retry_sends" },
    alertOnZeroRows: true,
  },
  {
    name: "billing_check_domains",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "billing_check_domains" },
    alertOnZeroRows: true,
  },
  {
    name: "nps_send",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "nps_send" },
    alertOnZeroRows: true,
  },
  {
    name: "test_cohort_postcard",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "test_cohort_postcard" },
    alertOnZeroRows: true,
  },
  {
    name: "review_blast_dispatch",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "review_blast_dispatch" },
    alertOnZeroRows: true,
  },
  {
    name: "audit_followup",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "audit_followup" },
    alertOnZeroRows: true,
  },
  {
    name: "audit_postcard",
    table: "cron_heartbeats",
    column: "ran_at",
    thresholdHours: 36,
    where: { col: "cron_name", eq: "audit_postcard" },
    alertOnZeroRows: true,
  },

  // ─── Pre-existing watchers (kept for back-compat) ────────────
  {
    // Hyperloop weekly cron — has its own dedicated runs table with
    // dormancy tracking; keeping the dedicated watcher.
    name: "hyperloop",
    table: "hyperloop_runs",
    column: "ran_at",
    thresholdHours: 24 * 8,
    alertOnZeroRows: true,
  },
  {
    // Audit submissions — week without one means the form is broken
    // OR all acquisition channels died. Activity-driven, not a cron.
    name: "audit_submissions",
    table: "site_audits",
    column: "created_at",
    thresholdHours: 24 * 7,
    alertOnZeroRows: true,
  },
  {
    // Email retry queue — populated only when sends fail. ZERO rows =
    // good state. Only alert if rows exist historically but stale.
    name: "email_retry_queue",
    table: "email_retry_queue",
    column: "created_at",
    thresholdHours: 36,
    alertOnZeroRows: false,
  },
];

/** Stuck audits: pending or generating for > 10 minutes = stuck. */
const STUCK_AUDIT_THRESHOLD_MS = 10 * 60 * 1000;

export async function POST(req?: NextRequest) {
  return runWatchdog(req);
}

export async function GET(req?: NextRequest) {
  return runWatchdog(req);
}

async function runWatchdog(req?: NextRequest) {
  if (req) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      message: "Supabase not configured — watchdog is a no-op in dev",
      ok: true,
    });
  }

  const alerts: string[] = [];
  const checkResults: Array<{
    cron: string;
    lastSeen: string | null;
    ageHours: number | null;
    thresholdHours: number;
    alert: boolean;
    error?: string;
  }> = [];

  // ─── Cron heartbeat checks ───────────────────────────────────
  for (const c of WATCHED_CRONS) {
    let query = supabase
      .from(c.table)
      .select(c.column)
      .order(c.column, { ascending: false })
      .limit(1);

    if (c.where) {
      query = query.eq(c.where.col, c.where.eq);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      // Table missing or RLS blocking — log it but don't crash. Could
      // be a misconfiguration in WATCHED_CRONS.
      checkResults.push({
        cron: c.name,
        lastSeen: null,
        ageHours: null,
        thresholdHours: c.thresholdHours,
        alert: false,
        error: error.message,
      });
      continue;
    }

    if (!data) {
      // Zero rows ever. For heartbeat tables (alertOnZeroRows: true)
      // this is a bug — the cron never logged. For activity-driven
      // tables (alertOnZeroRows: false) this is the good state — no
      // failures or events yet — silently no-op.
      const shouldAlert = c.alertOnZeroRows !== false;
      if (shouldAlert) {
        alerts.push(`${c.name}: ZERO rows in ${c.table}`);
      }
      checkResults.push({
        cron: c.name,
        lastSeen: null,
        ageHours: null,
        thresholdHours: c.thresholdHours,
        alert: shouldAlert,
      });
      continue;
    }

    const lastSeenStr = (data as unknown as Record<string, unknown>)[c.column] as string;
    const lastSeenMs = new Date(lastSeenStr).getTime();
    const ageHours = (Date.now() - lastSeenMs) / (60 * 60 * 1000);
    const stale = ageHours > c.thresholdHours;

    if (stale) {
      alerts.push(
        `${c.name}: last seen ${Math.round(ageHours)}h ago (threshold ${c.thresholdHours}h)`,
      );
    }

    checkResults.push({
      cron: c.name,
      lastSeen: lastSeenStr,
      ageHours: Math.round(ageHours * 10) / 10,
      thresholdHours: c.thresholdHours,
      alert: stale,
    });
  }

  // ─── Stuck-audit detector (item #10 from review) ─────────────
  const stuckCutoff = new Date(Date.now() - STUCK_AUDIT_THRESHOLD_MS).toISOString();
  const { data: stuckAudits } = await supabase
    .from("site_audits")
    .select("id, target_url, status, created_at")
    .in("status", ["pending", "generating"])
    .lt("created_at", stuckCutoff);

  const stuckCount = stuckAudits?.length ?? 0;
  if (stuckCount > 0 && stuckAudits) {
    const ids = stuckAudits.map((a) => (a.id as string).slice(0, 8)).join(", ");
    alerts.push(`${stuckCount} audits stuck > 10min: ${ids}`);

    // Self-healing: fire a fresh kick at every stuck audit (only those
    // still in 'pending' — 'generating' rows might be mid-run on another
    // Lambda). The generate route is idempotent on status='generating'/
    // 'ready' so duplicate kicks are safe. Wrapped in `after()` so the
    // kicks complete after the watchdog response is sent. This means a
    // stuck audit that escaped the submit-route + status-route safety
    // nets gets a third recovery attempt within ~24 hours instead of
    // sitting forever as the original bug class did.
    const baseUrl = "https://bluejayportfolio.com";
    const cronSecret = process.env.CRON_SECRET || "dev";
    const stuckPending = stuckAudits.filter((a) => a.status === "pending");
    if (stuckPending.length > 0) {
      after(async () => {
        for (const a of stuckPending) {
          try {
            await fetch(`${baseUrl}/api/audit/generate/${a.id as string}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cronSecret}`,
              },
              signal: AbortSignal.timeout(8000),
            });
          } catch (err) {
            const isTimeout = err instanceof Error && err.name === "TimeoutError";
            if (!isTimeout) {
              console.error(`[watchdog] stuck-audit retry kick failed for ${a.id}:`, err);
            }
          }
        }
      });
    }
  }

  // ─── Vendor health checks (Hormozi review #4) ─────────────────
  // Pings every external dependency (Stripe, SendGrid, Anthropic, OpenAI,
  // Twilio, Lob, Namecheap, Meta Ads, Google Ads, Supabase) and adds
  // any failing vendors to the alert list. Skipped vendors (no creds)
  // don't alert — silent gaps are fine while we ramp.
  let vendorChecks: Awaited<ReturnType<typeof runAllHealthChecks>> | null = null;
  try {
    vendorChecks = await runAllHealthChecks();
    const failingVendors = vendorChecks.checks.filter((c) => c.status === "fail");
    if (failingVendors.length > 0) {
      const list = failingVendors
        .map((v) => `${v.vendor}(${v.detail || "unknown"})`)
        .join(", ");
      alerts.push(`${failingVendors.length} vendor(s) failing: ${list}`);
    }
  } catch (err) {
    // Vendor check itself crashed — log but don't crash the watchdog.
    alerts.push(
      `vendor_health_check crashed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // ─── Fire SMS to Ben if anything's wrong ─────────────────────
  if (alerts.length > 0) {
    void sendOwnerAlert(`🚨 Watchdog alert:\n${alerts.join("\n")}`).catch(() => {});
  }

  // ─── Self-log to watchdog_runs (the canary's heartbeat) ──────
  await supabase.from("watchdog_runs").insert({
    watched_count: WATCHED_CRONS.length,
    alerts_fired: alerts.length,
    stuck_audits_count: stuckCount,
    status: "completed",
    notes:
      alerts.length === 0
        ? "All watched crons fresh + no stuck audits + all vendors healthy."
        : alerts.join(" | "),
    metadata: {
      checks: checkResults,
      stuckAuditIds: stuckAudits?.map((a) => a.id) ?? [],
      vendorChecks: vendorChecks?.checks ?? null,
      vendorOkCount: vendorChecks?.okCount ?? 0,
      vendorFailCount: vendorChecks?.failCount ?? 0,
      vendorSkippedCount: vendorChecks?.skippedCount ?? 0,
    },
  });

  return NextResponse.json({
    ok: true,
    watchedCrons: WATCHED_CRONS.length,
    alertsFired: alerts.length,
    stuckAuditsCount: stuckCount,
    vendorOkCount: vendorChecks?.okCount ?? 0,
    vendorFailCount: vendorChecks?.failCount ?? 0,
    vendorSkippedCount: vendorChecks?.skippedCount ?? 0,
    alerts,
    checks: checkResults,
    vendorChecks: vendorChecks?.checks ?? [],
  });
}
