/**
 * ai-brief — Day-2 skill. Daily morning briefing.
 *
 * Fires Mon-Fri 7am PT via Vercel cron. Pulls the last 24h of
 * pipeline + revenue + task signals, hands to Claude Sonnet, gets
 * back a structured "what should Ben do today?" payload.
 *
 * On success: SMS Ben the one-line `summary` field (handled by the
 * skill's emitSignal config — runner persists + emits agent_signal +
 * the post-run hook in runner.ts pipes to sendOwnerAlert when the
 * emitSignal target is "morning-brief").
 *
 * Prompt lifted from aios/.claude/skills/morning_brief/SKILL.md but
 * tightened for unattended JSON-mode execution. The 5-bullet output
 * format is preserved as the `summary` string so SMS rendering is
 * symmetric with what Ben sees in chat when he runs the AIOS skill
 * manually.
 *
 * noWork branch: skips Claude call when there's literally no
 * activity in the last 24h (cold weekend, etc.). The run still
 * persists with cost=0 so Ben can see "the cron fired."
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Skill, ContextResult } from "../types";

const PROMPT = `You are Ben Freeman's BlueJays morning-brief generator.

You will receive a <context> block with:
  - date: today's ISO date (YYYY-MM-DD)
  - ramp_day: which day of the 30-day Hormozi ramp (started 2026-04-28)
  - new_audits_24h: array of recent audit submissions (business names + scores)
  - status_changes_24h: array of prospect status transitions in the last 24h
  - open_tasks: array of pending/in-progress client tasks (top by priority)
  - paid_today: count of new paid prospects today
  - inbound_replies: count of prospect replies awaiting review

Your job: produce a 5-bullet morning brief that tells Ben exactly what
to focus on today. Be specific. Use the real numbers from the context.

Return ONLY valid JSON in this exact shape:

{
  "date": "<context.date>",
  "ramp_day": <context.ramp_day as int>,
  "cash_line": "<one line on revenue movement — use real $ from paid_today; if 0, say so honestly>",
  "pipeline_line": "<one line on biggest pipeline mover — new audits, replies needing review, or status flips>",
  "todays_action": {
    "action": "<specific Hormozi-leverage move for today — usually cash collection > new outreach > skill-building > infra>",
    "why": "<one-sentence rationale>"
  },
  "alerts": ["<zero or more urgent items — past-due invoices, angry replies, system failures>"],
  "summary": "☀️ Day <ramp_day> · <cash_line one-liner>. <pipeline_line one-liner>. TODAY: <todays_action.action>."
}

Rules:
  - Specific numbers always. "$2,500 from Tekky still unpaid (day 4)"
    beats "Tekky still hasn't paid."
  - ONE recommended action. Pick the highest-leverage move. Hormozi
    priority: cash collection > new outreach > skill-building > infra.
  - Hormozi tone on drift. If the data shows skipped habits or
    customers past-due, name it directly. No softening.
  - The summary field is what gets SMS'd to Ben. Keep it under 280 chars
    so it fits in one SMS without splitting. Lead with the day number.
  - alerts array is for actionable urgent items only. Don't pad with
    nice-to-knows. Empty array is fine.

No prose, no markdown fences, no explanation. JSON only.`;

const OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ai-brief output",
  type: "object",
  required: [
    "date",
    "ramp_day",
    "cash_line",
    "pipeline_line",
    "todays_action",
    "alerts",
    "summary",
  ],
  properties: {
    date: { type: "string" },
    ramp_day: { type: "integer" },
    cash_line: { type: "string" },
    pipeline_line: { type: "string" },
    todays_action: {
      type: "object",
      required: ["action", "why"],
      properties: {
        action: { type: "string" },
        why: { type: "string" },
      },
    },
    alerts: { type: "array", items: { type: "string" } },
    summary: { type: "string", maxLength: 280 },
  },
} as const;

/** 30-day Hormozi ramp started 2026-04-28 per memory.
 *  current_30day_state.md. */
const RAMP_START_ISO = "2026-04-28";

function rampDayCount(): number {
  const start = new Date(RAMP_START_ISO + "T00:00:00Z").getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  return Math.max(1, Math.floor((today - start) / 86_400_000) + 1);
}

async function gather(): Promise<ContextResult> {
  if (!isSupabaseConfigured()) {
    return {
      noWork: true,
      reason: "Supabase not configured — can't pull pipeline data",
    };
  }

  const since24h = new Date(Date.now() - 24 * 3600_000).toISOString();

  // Run all reads in parallel — the brief is latency-sensitive.
  const [
    auditsRes,
    statusRes,
    tasksRes,
    paidRes,
  ] = await Promise.all([
    // New audits in the last 24h
    supabase
      .from("site_audits")
      .select("target_url, business_category, generated_at, audit_content")
      .gte("generated_at", since24h)
      .order("generated_at", { ascending: false })
      .limit(10),
    // Status changes (any prospect status transition)
    supabase
      .from("prospect_status_changes")
      .select("prospect_id, from_status, to_status, source, created_at")
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(20),
    // Open client tasks (top 5 by priority)
    supabase
      .from("client_tasks")
      .select("client_slug, title, priority, status, owner")
      .in("status", ["pending", "in_progress", "blocked"])
      .order("priority", { ascending: false })
      .limit(5),
    // New paid prospects today
    supabase
      .from("prospects")
      .select("id, business_name", { count: "exact" })
      .eq("status", "paid")
      .gte("updated_at", since24h),
  ]);

  const audits = (auditsRes.data || []) as Array<{
    target_url: string;
    business_category: string;
    generated_at: string;
    audit_content: { overallScore?: number } | null;
  }>;
  const statusChanges = (statusRes.data || []) as Array<{
    prospect_id: string;
    from_status: string;
    to_status: string;
    created_at: string;
  }>;
  const tasks = (tasksRes.data || []) as Array<{
    client_slug: string;
    title: string;
    priority: string;
    status: string;
    owner: string;
  }>;
  const paidToday = paidRes.count || 0;

  // Inbound replies = transitions TO "responded" or "replied" status
  const inboundReplies = statusChanges.filter((c) =>
    ["responded", "replied"].includes(c.to_status),
  ).length;

  // No-work shortcut: cold morning with zero activity. Still log the
  // cron firing (Ben gets nothing today, sees the row in the dashboard).
  const totalActivity =
    audits.length + statusChanges.length + tasks.length + paidToday;
  if (totalActivity === 0) {
    return {
      noWork: true,
      reason: "no audit / status / task / paid activity in last 24h",
    };
  }

  return {
    noWork: false,
    context: {
      date: new Date().toISOString().slice(0, 10),
      ramp_day: rampDayCount(),
      new_audits_24h: audits.map((a) => ({
        target: a.target_url,
        category: a.business_category,
        score: a.audit_content?.overallScore ?? null,
        at: a.generated_at,
      })),
      status_changes_24h: statusChanges.map((s) => ({
        from: s.from_status,
        to: s.to_status,
        at: s.created_at,
      })),
      open_tasks: tasks.map((t) => ({
        client: t.client_slug,
        title: t.title,
        priority: t.priority,
        status: t.status,
      })),
      paid_today: paidToday,
      inbound_replies: inboundReplies,
    },
  };
}

export const briefSkill: Skill = {
  manifest: {
    name: "brief",
    description:
      "Daily Mon-Fri 7am PT morning briefing. Reads pipeline + revenue + task signals, outputs 5-bullet 'what should I focus on today' + recommended action. SMS'd to Ben.",
    schedule: "0 14 * * 1-5", // 7am PDT (UTC-7) Mon-Fri
    model: "claude-sonnet-4-6",
    maxTokensOut: 800,
    costCapPerRunUsd: 0.1,
    outputSchema: "embedded",
    visibility: "ben-only",
    emitSignal: {
      severity: "info",
      target: "morning-brief",
    },
  },
  promptBody: PROMPT,
  outputSchema: OUTPUT_SCHEMA,
  gather,
};
