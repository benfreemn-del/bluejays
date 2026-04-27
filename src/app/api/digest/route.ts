import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/digest
 *
 * Computes yesterday's funnel activity and sends Ben a morning SMS digest.
 * Called daily at 7am Pacific via Vercel cron (configured in vercel.json).
 *
 * Can also be hit manually from the dashboard for an on-demand snapshot.
 */

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const send = searchParams.get("send") !== "false"; // default: send SMS

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const prospects = await getAllProspects();

  // Prospects updated in the last 24 hours
  const recentlyUpdated = prospects.filter((p) => {
    const updated = new Date(p.updatedAt).getTime();
    return updated >= yesterday.getTime() && updated < todayStart.getTime();
  });

  // Count by status transition (approximate — based on current status + recency)
  const counts = {
    enrolled: recentlyUpdated.filter((p) =>
      ["contacted", "email_opened", "link_clicked"].includes(p.status)
    ).length,
    opened: recentlyUpdated.filter((p) =>
      ["email_opened", "link_clicked"].includes(p.status)
    ).length,
    clicked: recentlyUpdated.filter((p) => p.status === "link_clicked").length,
    replied: recentlyUpdated.filter((p) =>
      ["responded", "interested"].includes(p.status)
    ).length,
    interested: recentlyUpdated.filter((p) => p.status === "interested").length,
    paid: recentlyUpdated.filter((p) => p.status === "paid").length,
  };

  // Total pipeline health
  const pipeline = {
    active: prospects.filter((p) =>
      ["contacted", "email_opened", "link_clicked"].includes(p.status)
    ).length,
    warm: prospects.filter((p) =>
      ["responded", "interested"].includes(p.status)
    ).length,
    total: prospects.length,
  };

  // Spending yesterday from Supabase cost logs
  let spendYesterday = 0;
  if (isSupabaseConfigured()) {
    const { data: costs } = await supabase
      .from("system_costs")
      .select("cost_usd")
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", todayStart.toISOString());
    spendYesterday = (costs || []).reduce((sum, r) => sum + (r.cost_usd || 0), 0);
  }

  const dateStr = yesterday.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Build the SMS digest
  const lines = [
    `📊 BlueJays Daily — ${dateStr}`,
    ``,
    counts.enrolled > 0 ? `📤 Enrolled: ${counts.enrolled}` : null,
    counts.opened > 0 ? `👁 Opened: ${counts.opened}` : null,
    counts.clicked > 0 ? `🔗 Clicked: ${counts.clicked}` : null,
    counts.replied > 0 ? `💬 Replied: ${counts.replied}` : null,
    counts.interested > 0 ? `🔥 Interested: ${counts.interested}` : null,
    counts.paid > 0 ? `💰 PAID: ${counts.paid}` : null,
    ``,
    `Pipeline: ${pipeline.active} active · ${pipeline.warm} warm`,
    spendYesterday > 0 ? `Spend: $${spendYesterday.toFixed(2)}` : null,
    `📋 ${BASE_URL}/dashboard`,
  ].filter((l) => l !== null).join("\n");

  const nothingHappened =
    Object.values(counts).every((v) => v === 0);

  if (nothingHappened) {
    // Still send — quiet day is useful signal
    const quietLines = [
      `📊 BlueJays Daily — ${dateStr}`,
      `Quiet day — no funnel activity.`,
      `Pipeline: ${pipeline.active} active · ${pipeline.warm} warm`,
      `📋 ${BASE_URL}/dashboard`,
    ].join("\n");

    if (send) await sendOwnerAlert(quietLines).catch(() => {});
    await logHeartbeat("digest", { quiet: true, sent: send, counts, pipeline });
    return NextResponse.json({ sent: send, digest: quietLines, counts, pipeline });
  }

  if (send) await sendOwnerAlert(lines).catch(() => {});

  await logHeartbeat("digest", {
    quiet: false,
    sent: send,
    counts,
    pipeline,
    spendYesterday: parseFloat(spendYesterday.toFixed(2)),
  });

  return NextResponse.json({
    sent: send,
    digest: lines,
    counts,
    pipeline,
    spendYesterday: parseFloat(spendYesterday.toFixed(2)),
    date: dateStr,
  });
}
