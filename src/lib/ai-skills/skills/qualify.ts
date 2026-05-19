/**
 * ai-qualify — Day-3 skill. Per-prospect deep qualification.
 *
 * Manual invocation:
 *   bj ai qualify --prospect-id <uuid>
 *
 * Or invoked by the triage skill on each top-ranked prospect.
 *
 * Pulls the full prospect + most-recent-completed-audit + BANT
 * dropdown answers + touch history + scraped data. Hands to Claude
 * Sonnet to produce:
 *   - fit_score (0-100, overall conversion likelihood)
 *   - recommended_tier (free_audit / $997 / $10k / disqualify)
 *   - recommended_action (specific next move)
 *   - recommended_channel (email / sms / phone / wait)
 *   - drafted_message (ready-to-send first touch in Ben's voice)
 *   - reasoning (why these recommendations)
 *   - summary (one-line for SMS / log)
 *
 * Result is cached on prospects.ai_qualification (JSONB) so Madie's
 * pipeline UI can read it without re-running, and triage can skip
 * already-qualified prospects.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Skill, ContextResult } from "../types";

const PROMPT = `You are BlueJays' AI qualification system. Given a prospect's
full context (business + audit findings + form data + touch history),
score them for conversion likelihood and recommend the exact next move.

You will receive a <context> block with:
  - prospect: { id, business_name, category, email, phone, source, city, state, status }
  - audit: { score, one_line_summary, top_5_fixes, money_leak_estimate }
  - bant: { orders_per_month, running_ads, biggest_frustration, timeline }
  - scraped: { current_website_quality_signals, brand_color, etc. }
  - touches: { emails_sent, sms_sent, replies_received }

Return ONLY valid JSON in this exact shape:

{
  "fit_score": <0-100 integer>,
  "recommended_tier": "free_audit_only" | "$997_website" | "$10k_ai_system" | "disqualify",
  "recommended_action": "<one specific next move — what Ben/Madie should do TODAY>",
  "recommended_channel": "email" | "sms" | "phone" | "wait",
  "drafted_message": "<ready-to-send first-touch in Ben's voice, ≤80 words, references their actual audit findings>",
  "reasoning": "<2-3 sentences explaining the recommendations>",
  "summary": "<≤140 chars: 'Business Name: fit X. <tier>. <action>.'>"
}

TIER RULES (use the data, not vibes):

  $10k_ai_system fit (≥80 fit_score):
    - Product manufacturer / DTC brand / indie author (per category)
    - 50+ orders/month OR already running paid ads
    - OR audit score < 60 (means lots of fixable problems = high
      value-prop for BlueJays' system)
    - Clear contact info (phone + email both)

  $997_website fit (50-79 fit_score):
    - Service business OR product brand under 50 orders/mo
    - Not running ads yet (or "exploring")
    - Audit score 40-70 (real problems, fixable with a website rebuild)
    - Has email at minimum

  free_audit_only fit (20-49 fit_score):
    - Low intent signals — no phone, vague form data
    - Already has a decent site (audit score 80+)
    - Or unclear category / no BANT data
    - Recommend: send the audit report + 1 follow-up, then archive

  disqualify (0-19 fit_score):
    - Spam, fake email (yourdomain.com, test.com, etc.)
    - Irrelevant business type (not product / not service / not author)
    - Manifestly out of ICP

CHANNEL RULES:
  - "phone": $10k tier ONLY (high-touch close requires voice)
  - "sms": $997 tier with phone consent on file
  - "email": default for everything else
  - "wait": no clear signal — collect more data first

DRAFTED MESSAGE RULES (these are non-negotiable):
  - Ben's voice: lowercase greetings ("Hi Jake"), no marketing
    fluff, ~80 words max, ONE link only (the prospect's preview URL),
    zero pricing mentions, no booking CTAs in cold-first-touch.
  - References specific audit findings ("saw your score landed at 48
    with the product page being the biggest leak")
  - Soft reply prompt at end ("curious if that lines up")

SUMMARY RULES:
  - ≤140 chars (fits in SMS preview)
  - Format: "Business Name: fit N. Recommended tier. Next action."
  - Example: "Apex Pet Treats: fit 87. $10k AI System. Phone within
    1hr — ad-runner, 150 orders/mo."

No prose. No markdown fences. No explanation. JSON only.`;

const OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ai-qualify output",
  type: "object",
  required: [
    "fit_score",
    "recommended_tier",
    "recommended_action",
    "recommended_channel",
    "drafted_message",
    "reasoning",
    "summary",
  ],
  properties: {
    fit_score: { type: "integer", minimum: 0, maximum: 100 },
    recommended_tier: {
      type: "string",
      enum: [
        "free_audit_only",
        "$997_website",
        "$10k_ai_system",
        "disqualify",
      ],
    },
    recommended_action: { type: "string" },
    recommended_channel: {
      type: "string",
      enum: ["email", "sms", "phone", "wait"],
    },
    drafted_message: { type: "string" },
    reasoning: { type: "string" },
    summary: { type: "string", maxLength: 200 },
  },
} as const;

type ProspectRow = {
  id: string;
  business_name: string;
  category: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  scraped_data: Record<string, unknown> | null;
};

type AuditRow = {
  id: string;
  audit_content: {
    overallScore?: number;
    oneLineSummary?: string;
    prioritizedRoadmap?: Array<{ title?: string; impact?: string }>;
    moneyLeakEstimate?: number;
  } | null;
  metadata: {
    ordersPerMonth?: string;
    runningAds?: string;
    biggestFrustration?: string;
    timeline?: string;
  } | null;
};

async function gather(args: Record<string, unknown>): Promise<ContextResult> {
  const prospectId =
    typeof args["prospect_id"] === "string"
      ? args["prospect_id"]
      : typeof args.prospectId === "string"
        ? (args.prospectId as string)
        : "";
  if (!prospectId) {
    return {
      noWork: true,
      reason: "no --prospect-id provided",
    };
  }
  if (!isSupabaseConfigured()) {
    return {
      noWork: true,
      reason: "Supabase not configured — can't pull prospect data",
    };
  }

  const { data: prospectRow, error: prospectErr } = await supabase
    .from("prospects")
    .select(
      "id, business_name, category, email, phone, source, city, state, status, scraped_data",
    )
    .eq("id", prospectId)
    .maybeSingle();
  if (prospectErr || !prospectRow) {
    return {
      noWork: true,
      reason: `prospect ${prospectId.slice(0, 8)} not found`,
    };
  }
  const prospect = prospectRow as unknown as ProspectRow;

  // Pull the most recent completed audit (qualify needs a real audit
  // to score against — no audit = no signal).
  const { data: auditRow } = await supabase
    .from("site_audits")
    .select("id, audit_content, metadata")
    .eq("prospect_id", prospectId)
    .eq("status", "ready")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!auditRow) {
    return {
      noWork: true,
      reason: `prospect ${prospect.business_name} has no completed audit yet`,
    };
  }
  const audit = auditRow as unknown as AuditRow;
  const auditContent = audit.audit_content || {};
  const meta = audit.metadata || {};

  const top5 = (auditContent.prioritizedRoadmap || [])
    .slice(0, 5)
    .map((r) => ({ title: r.title, impact: r.impact }));

  return {
    noWork: false,
    context: {
      prospect: {
        id: prospect.id,
        business_name: prospect.business_name,
        category: prospect.category,
        email: prospect.email,
        phone: prospect.phone,
        source: prospect.source,
        city: prospect.city,
        state: prospect.state,
        status: prospect.status,
      },
      audit: {
        id: audit.id,
        score: auditContent.overallScore ?? null,
        one_line_summary: auditContent.oneLineSummary || "",
        top_5_fixes: top5,
        money_leak_estimate: auditContent.moneyLeakEstimate ?? null,
      },
      bant: {
        orders_per_month: meta.ordersPerMonth || null,
        running_ads: meta.runningAds || null,
        biggest_frustration: meta.biggestFrustration || null,
        timeline: meta.timeline || null,
      },
      scraped_signals: prospect.scraped_data
        ? {
            // Keep only signal-rich fields (avoid blowing context).
            brand_color: (prospect.scraped_data as Record<string, unknown>)
              .brandColor,
            current_website: (prospect.scraped_data as Record<string, unknown>)
              .currentWebsite,
          }
        : null,
    },
  };
}

/** Post-run hook: cache the qualification on prospects.ai_qualification.
 *  Called by the runner via the (not-yet-wired) post-success hook.
 *  For Day-3 simplicity we expose this as a named export and call it
 *  from a thin wrapper around the runner — see qualifyAndCache(). */
export async function cacheQualification(
  prospectId: string,
  auditId: string,
  output: Record<string, unknown>,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const cached = {
    ...output,
    qualified_at: new Date().toISOString(),
    audit_id: auditId,
  };
  await supabase
    .from("prospects")
    .update({ ai_qualification: cached })
    .eq("id", prospectId);
}

/** afterRun hook — caches the qualification on prospects.ai_qualification
 *  so the result is queryable without re-running the skill. Called by
 *  the runner after the success path. Failure is logged but doesn't
 *  fail the run — the persisted ai_skill_runs row is source of truth. */
async function afterRun(
  output: unknown,
  args: Record<string, unknown>,
): Promise<void> {
  const prospectId =
    typeof args["prospect_id"] === "string"
      ? args["prospect_id"]
      : typeof args.prospectId === "string"
        ? (args.prospectId as string)
        : null;
  if (!prospectId || !output || typeof output !== "object") return;
  // The audit_id was in the gather() context but isn't in the output;
  // we can re-fetch the most-recent ready audit id (cheap) so the
  // cached qualification stays linkable to a specific audit row.
  if (!isSupabaseConfigured()) return;
  const { data: auditRow } = await supabase
    .from("site_audits")
    .select("id")
    .eq("prospect_id", prospectId)
    .eq("status", "ready")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const auditId = (auditRow as { id?: string } | null)?.id || null;
  await cacheQualification(prospectId, auditId || "", output as Record<string, unknown>);
}

export const qualifySkill: Skill = {
  manifest: {
    name: "qualify",
    description:
      "Per-prospect deep qualification. Reads prospect + most recent completed audit + BANT + touch history, returns fit_score / recommended_tier / next action / drafted first-touch. Cached on prospects.ai_qualification.",
    model: "claude-sonnet-4-6",
    maxTokensOut: 900,
    costCapPerRunUsd: 0.1,
    outputSchema: "embedded",
    visibility: "ben-only",
    // No emitSignal — qualify is silent. Triage emits the daily SMS
    // for the queue; individual qualify runs persist to ai_skill_runs
    // + prospects.ai_qualification but don't ping Ben.
  },
  promptBody: PROMPT,
  outputSchema: OUTPUT_SCHEMA,
  gather,
  afterRun,
};
