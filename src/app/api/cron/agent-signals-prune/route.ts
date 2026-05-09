import { NextRequest, NextResponse } from "next/server";
import {
  pruneOldSignals,
  emitSignal,
  AGENT_SIGNALS_UNREAD_RETENTION_DAYS,
} from "@/lib/agent-signals";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/cron/agent-signals-prune
 *
 * Weekly retention sweep. Deletes:
 *   · acked signals older than 90 days
 *   · unread non-urgent signals older than 180 days
 *
 * Stale URGENT unread signals are NOT deleted — they get surfaced as
 * a fresh `daily-digest` signal so they can't silently rot. Something
 * fired urgent and nobody picked it up for 6 months → operator needs
 * to know.
 *
 * Strategic item from audit follow-up: agent_signals retention policy.
 * Schedule: weekly Sunday 04:30 UTC (off-peak).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(_req: NextRequest) {
  const result = await pruneOldSignals();

  if (!result.ok) {
    console.error("[agent-signals-prune] failed:", result.error);
    await logHeartbeat("agent_signals_prune", {
      ok: false,
      error: result.error,
    });
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 },
    );
  }

  // Surface any unread URGENT signals that aged past the retention
  // window. We never delete them; we surface them once per sweep so
  // they don't go unnoticed.
  if (result.staleUrgentRemaining > 0) {
    await emitSignal({
      source: "agent-signals-prune",
      kind: "stale-urgent",
      severity: "urgent",
      title: `${result.staleUrgentRemaining} urgent signals are >${AGENT_SIGNALS_UNREAD_RETENTION_DAYS}d old + unread`,
      detail:
        "These were never acked — something broke and the consumer downstream wasn't watching. Open the agent-signals view to triage.",
      target: "daily-digest",
      metadata: { staleUrgentRemaining: result.staleUrgentRemaining },
    });
  }

  await logHeartbeat("agent_signals_prune", {
    readDeleted: result.readDeleted,
    unreadDeleted: result.unreadDeleted,
    staleUrgentRemaining: result.staleUrgentRemaining,
  });

  return NextResponse.json({ ...result });
}
