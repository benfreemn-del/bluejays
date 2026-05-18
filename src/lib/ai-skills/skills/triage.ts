/**
 * ai-triage — Day-3 skill. Daily morning queue ranking.
 *
 * Fires Mon-Fri 8am PT (after brief). Pulls every audit completed in
 * the last 24h whose prospect doesn't yet have an ai_qualification
 * cached. Ships ALL of them to Claude in ONE call asking for the
 * top 3-5 picks with one-line rationale + recommended action.
 *
 * Why one-shot ranking instead of N qualify calls: cost. A single
 * Sonnet ranking pass over ~10-20 prospects costs ~$0.10. Running
 * qualify on each would be ~$2 and burns the daily cap fast. Triage
 * is the screen; qualify is the deep dive Ben/Madie pulls manually
 * on a specific prospect.
 *
 * On success: SMS Ben the top-3 summary (via the runner's
 * SMS_TARGETS set — triage uses emitSignal target "daily-triage").
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Skill, ContextResult } from "../types";

const PROMPT = `You are BlueJays' morning triage system. Each weekday at 8am PT you
receive every audit submission from the last 24 hours that hasn't been
qualified yet. Your job: rank the TOP 3-5 by likely fit for the
BlueJays offer ladder, with a one-line action note per pick.

You will receive a <context> block with:
  - date: today's ISO date
  - total_audits: count of audits in the window
  - audits: array of { prospect_id, business_name, category, source,
              email, phone, audit_score, one_line_summary,
              top_fix, orders_per_month, running_ads, biggest_frustration }

Rank by composite fit signal:
  - Manufacturer / DTC brand / indie author = $10k AI System candidate
  - Already-running-ads OR orders > 50/mo = higher tier signal
  - Low audit score (< 60) = high value-prop for our system
  - Has phone on file = higher contact certainty
  - Service business + no ad spend = $997 tier candidate

DISQUALIFY: spam, fake email, irrelevant business, score >= 80
(working too well to need us). Don't include in top picks; mention
the count in summary if notable.

Return ONLY valid JSON in this exact shape:

{
  "date": "<context.date>",
  "total_audits": <int>,
  "top_picks": [
    {
      "prospect_id": "<uuid>",
      "business_name": "<from context>",
      "audit_score": <int>,
      "category": "<from context>",
      "fit_signal": "<one-line: why they made the list>",
      "tier_guess": "$10k_ai_system" | "$997_website" | "free_audit_only",
      "next_action": "<specific move Ben/Madie should do TODAY>"
    }
  ],
  "summary": "<≤200 chars: '🎯 N audits today. Top: <business> (<tier>, <score>/100). <next action>.'>"
}

Rules:
  - top_picks: 3-5 entries max. If fewer than 3 qualify, only return
    those — don't pad the list.
  - prospect_id MUST be the exact uuid from the input. Triage doesn't
    invent identifiers — that breaks the downstream qualify flow.
  - summary: ≤200 chars for SMS visibility. Lead with the count.
  - next_action: explicit verb-first. "Phone Caleb within 1hr."
    "Email reply with $997 site pitch." NOT "Consider following up."

No prose. No markdown fences. JSON only.`;

const OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ai-triage output",
  type: "object",
  required: ["date", "total_audits", "top_picks", "summary"],
  properties: {
    date: { type: "string" },
    total_audits: { type: "integer", minimum: 0 },
    top_picks: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        required: [
          "prospect_id",
          "business_name",
          "audit_score",
          "fit_signal",
          "tier_guess",
          "next_action",
        ],
        properties: {
          prospect_id: { type: "string" },
          business_name: { type: "string" },
          audit_score: { type: "integer" },
          category: { type: "string" },
          fit_signal: { type: "string" },
          tier_guess: { type: "string" },
          next_action: { type: "string" },
        },
      },
    },
    summary: { type: "string", maxLength: 280 },
  },
} as const;

type AuditCandidate = {
  prospect_id: string;
  id: string;
  audit_content: {
    overallScore?: number;
    oneLineSummary?: string;
    prioritizedRoadmap?: Array<{ title?: string; impact?: string }>;
  } | null;
  metadata: {
    ordersPerMonth?: string;
    runningAds?: string;
    biggestFrustration?: string;
  } | null;
  business_category: string;
  generated_at: string;
};

type ProspectLookup = {
  id: string;
  business_name: string | null;
  category: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  ai_qualification: unknown;
};

async function gather(): Promise<ContextResult> {
  if (!isSupabaseConfigured()) {
    return {
      noWork: true,
      reason: "Supabase not configured",
    };
  }

  const since = new Date(Date.now() - 24 * 3600_000).toISOString();

  // Pull every audit completed in the last 24h
  const { data: auditRows } = await supabase
    .from("site_audits")
    .select(
      "id, prospect_id, audit_content, metadata, business_category, generated_at",
    )
    .eq("status", "ready")
    .gte("generated_at", since)
    .order("generated_at", { ascending: false })
    .limit(50);

  const audits = (auditRows || []) as unknown as AuditCandidate[];
  if (audits.length === 0) {
    return {
      noWork: true,
      reason: "no audits completed in the last 24h",
    };
  }

  // Pull the prospect rows in a single batched query
  const prospectIds = Array.from(new Set(audits.map((a) => a.prospect_id)));
  const { data: prospectRows } = await supabase
    .from("prospects")
    .select("id, business_name, category, email, phone, source, ai_qualification")
    .in("id", prospectIds);
  const prospects = (prospectRows || []) as unknown as ProspectLookup[];
  const byId = new Map(prospects.map((p) => [p.id, p]));

  // Filter out already-qualified prospects (avoid re-triaging the
  // same prospect every morning). If ai_qualification is set, skip.
  const unqualifiedAudits = audits.filter((a) => {
    const p = byId.get(a.prospect_id);
    return p && !p.ai_qualification;
  });

  if (unqualifiedAudits.length === 0) {
    return {
      noWork: true,
      reason: `${audits.length} audits in window but all already qualified`,
    };
  }

  // Shape the candidate list for Claude — keep each entry tight to
  // bound the prompt size. Aim for ~50 tokens per candidate so 20
  // candidates = ~1K context tokens (well within budget).
  const candidates = unqualifiedAudits.map((a) => {
    const p = byId.get(a.prospect_id)!;
    const ac = a.audit_content || {};
    const meta = a.metadata || {};
    const topFix = (ac.prioritizedRoadmap || [])[0];
    return {
      prospect_id: a.prospect_id,
      business_name: p.business_name || "(unnamed)",
      category: p.category || a.business_category,
      source: p.source,
      email: p.email,
      phone: p.phone,
      audit_score: ac.overallScore ?? null,
      one_line_summary: ac.oneLineSummary || "",
      top_fix: topFix?.title || null,
      orders_per_month: meta.ordersPerMonth || null,
      running_ads: meta.runningAds || null,
      biggest_frustration: meta.biggestFrustration || null,
    };
  });

  return {
    noWork: false,
    context: {
      date: new Date().toISOString().slice(0, 10),
      total_audits: candidates.length,
      audits: candidates,
    },
  };
}

export const triageSkill: Skill = {
  manifest: {
    name: "triage",
    description:
      "Daily Mon-Fri 8am PT morning queue. Pulls every audit completed in last 24h whose prospect isn't yet qualified, ranks top 3-5 by fit signal, SMSes Ben the queue.",
    schedule: "0 15 * * 1-5", // 8am PDT (UTC-7) Mon-Fri
    model: "claude-sonnet-4-6",
    maxTokensOut: 1200,
    costCapPerRunUsd: 0.2,
    outputSchema: "embedded",
    visibility: "ben-only",
    emitSignal: {
      severity: "info",
      target: "daily-triage",
    },
  },
  promptBody: PROMPT,
  outputSchema: OUTPUT_SCHEMA,
  gather,
};
