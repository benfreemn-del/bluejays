import type { Prospect } from "./types";
import { getSupabase } from "./supabase";
import { logCost } from "./cost-logger";

/**
 * hormozi-fit-scorer — Hormozi-fit triage for inbound prospects.
 *
 * Sister to the rule-based src/lib/lead-scorer.ts (Google rating +
 * reviews + category) which is wired into the Zenith AI operator
 * surface. This one scores ICP fit specifically — "would Ben + Madie
 * actually want to spend an hour selling to this prospect?" — using
 * Claude with a Hormozi-style ICP rubric. Different question, both
 * useful, coexist.
 *
 * Every prospect that hits /api/audit/submit or /api/leads/submit
 * gets a 0-100 hormozi_fit_score in the background. Madie's queue
 * sorts by it so hot leads land at the top.
 *
 * Score thresholds (referenced in the UI chips):
 *   80-100 → priority (call within 24h)
 *   60-79  → good fit
 *   40-59  → borderline
 *    0-39  → weak fit (audit-only nurture)
 *
 * Cost: ~$0.003/score with prompt-caching warm. Mock-safe — returns
 * null when ANTHROPIC_API_KEY is unset, doesn't throw.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.LEAD_SCORER_MODEL || "claude-sonnet-4-6";
const ESTIMATED_COST_USD = 0.003;

const SYSTEM_PROMPT = `You are scoring inbound prospects for BlueJays, an AI-marketing + custom-website service for owner-operators of $250k–$5M service businesses (landscapers, electricians, plumbers, HVAC, inspectors, contractors, roofers, gyms, dental, salons).

Score 0-100 based on Hormozi-style fit signals:

HIGH FIT (80-100):
- Established service business in an ICP we serve well
- Owner-operator, decision-maker (not corporate)
- Real revenue (>$250k/yr implied by team size, equipment, multi-location)
- Reachable contact info (real email + real phone)
- Pain signals: no real website, outdated site, no online booking, manual scheduling
- Already running ads OR open to it
- Located in a market we can serve

GOOD FIT (60-79):
- Right ICP, missing one strong signal (no clear revenue indicator, lukewarm contact)
- Adjacent service category we've built for before

BORDERLINE (40-59):
- Possibly right ICP but unclear from data
- Right ICP but mismatched fit (too small / too big / wrong geography)
- Strong category but contact info looks like a tire-kicker

WEAK FIT (0-39):
- Wrong ICP: corporate, B2B SaaS, professional services we don't serve, MLM
- No real contact info (gmail with no name, throwaway phone)
- Out of market (international, unsupported state)
- Clear spam or test submissions

Respond with EXACTLY this JSON shape — no prose, no fences:

{
  "score": 0-100 integer,
  "summary": "one short sentence (≤140 chars) explaining the score — start with the tier in caps (PRIORITY / GOOD / BORDERLINE / WEAK)"
}

Be calibrated. Most real inbound is 50-75. Reserve 90+ for genuinely exceptional fit. Reserve <30 for obvious junk.`;

export interface FitScoreResult {
  score: number;
  summary: string;
  model: string;
  costUsd: number;
}

export async function scoreHormoziFit(prospect: Prospect): Promise<FitScoreResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.log(`[hormozi-fit] skip ${prospect.id} — ANTHROPIC_API_KEY unset`);
    return null;
  }

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: [
          { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        ],
        messages: [{ role: "user", content: buildPrompt(prospect) }],
      }),
    });
  } catch (e) {
    console.error("[hormozi-fit] fetch failed:", (e as Error).message);
    return null;
  }

  if (!response.ok) {
    console.error(
      `[hormozi-fit] HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
    );
    return null;
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? "";

  let parsed: { score?: unknown; summary?: unknown };
  try {
    parsed = JSON.parse(extractJsonObject(text));
  } catch (e) {
    console.error("[hormozi-fit] JSON parse failed:", (e as Error).message);
    return null;
  }
  const score =
    typeof parsed.score === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.score)))
      : null;
  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 280) : null;
  if (score == null || !summary) {
    console.error("[hormozi-fit] response missing score/summary");
    return null;
  }

  await logCost({
    prospectId: prospect.id,
    service: "claude",
    action: "hormozi_fit_score",
    costUsd: ESTIMATED_COST_USD,
    metadata: { model: MODEL, score },
  });

  return { score, summary, model: MODEL, costUsd: ESTIMATED_COST_USD };
}

/**
 * Score + persist. Fire-and-forget from inbound routes.
 * Returns silently on any failure — never breaks the caller.
 */
export async function scoreAndPersistFit(prospect: Prospect): Promise<void> {
  try {
    const result = await scoreHormoziFit(prospect);
    if (!result) return;
    const sb = getSupabase();
    const { error } = await sb
      .from("prospects")
      .update({
        hormozi_fit_score: result.score,
        hormozi_fit_summary: result.summary,
        hormozi_fit_scored_at: new Date().toISOString(),
      })
      .eq("id", prospect.id);
    if (error) {
      console.error(`[hormozi-fit] persist failed for ${prospect.id}: ${error.message}`);
    } else {
      console.log(
        `[hormozi-fit] ${prospect.id} → ${result.score} (${result.summary.slice(0, 60)}…)`,
      );
    }
  } catch (e) {
    console.error(`[hormozi-fit] unhandled error for ${prospect.id}: ${(e as Error).message}`);
  }
}

function buildPrompt(p: Prospect): string {
  const lines: string[] = ["PROSPECT:"];
  lines.push(`Business: ${p.businessName}`);
  if (p.ownerName) lines.push(`Owner: ${p.ownerName}`);
  if (p.category) lines.push(`Category: ${p.category}`);
  if (p.city || p.state) lines.push(`Location: ${[p.city, p.state].filter(Boolean).join(", ")}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.address) lines.push(`Address: ${p.address}`);
  if (p.currentWebsite) lines.push(`Current website: ${p.currentWebsite}`);
  if (p.status) lines.push(`Status: ${p.status}`);
  if (p.sourceChannel) lines.push(`Source: ${p.sourceChannel}`);
  if (p.pricingTier) lines.push(`Tier: ${p.pricingTier}`);
  if (p.defensibilityScore != null)
    lines.push(`Defensibility (mfg ICP): ${p.defensibilityScore}/100`);
  lines.push("");
  lines.push("Score this prospect 0-100 on Hormozi-fit. Respond JSON only.");
  return lines.join("\n");
}

function extractJsonObject(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) return t.slice(first, last + 1);
  return t;
}

/** Tier label + Pill tone for the UI chip. */
export function tierForFit(score: number | null | undefined): {
  tier: "priority" | "good" | "borderline" | "weak" | "unscored";
  tone: "emerald" | "sky" | "amber" | "rose" | "slate";
  label: string;
} {
  if (score == null) return { tier: "unscored", tone: "slate", label: "Unscored" };
  if (score >= 80) return { tier: "priority", tone: "emerald", label: "🔥 Priority" };
  if (score >= 60) return { tier: "good", tone: "sky", label: "Good fit" };
  if (score >= 40) return { tier: "borderline", tone: "amber", label: "Borderline" };
  return { tier: "weak", tone: "rose", label: "Weak fit" };
}
