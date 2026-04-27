import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";

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
 */
const WATCHED_CRONS: WatchedCron[] = [
  {
    // Hyperloop weekly cron — should write a hyperloop_runs row every
    // Monday 16:00 UTC. Threshold 8 days = 2× schedule period. Heartbeat
    // table → ZERO rows is a bug.
    name: "hyperloop",
    table: "hyperloop_runs",
    column: "ran_at",
    thresholdHours: 24 * 8,
    alertOnZeroRows: true,
  },
  {
    // Audit submissions — any week without a single new audit means
    // either the form is broken OR all our acquisition channels died.
    // Heartbeat-ish (activity expected) → ZERO rows is a bug.
    name: "audit_submissions",
    table: "site_audits",
    column: "created_at",
    thresholdHours: 24 * 7,
    alertOnZeroRows: true,
  },
  {
    // Email retry queue — populated only when SendGrid sends fail. ZERO
    // rows = "no email failures yet" = the GOOD state. Only alert if
    // historical rows exist but the most-recent one is stale (means
    // the retry cron stopped draining the queue).
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
        ? "All watched crons fresh + no stuck audits."
        : alerts.join(" | "),
    metadata: {
      checks: checkResults,
      stuckAuditIds: stuckAudits?.map((a) => a.id) ?? [],
    },
  });

  return NextResponse.json({
    ok: true,
    watchedCrons: WATCHED_CRONS.length,
    alertsFired: alerts.length,
    stuckAuditsCount: stuckCount,
    alerts,
    checks: checkResults,
  });
}
