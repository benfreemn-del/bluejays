#!/usr/bin/env node
// @ts-check

/**
 * backfill-hormozi-fit — score every existing prospect that doesn't
 * yet have a hormozi_fit_score.
 *
 * Why: src/lib/hormozi-fit-scorer.ts only scores NEW inbound. This
 * one-shot CLI scores the 1700+ historical prospects so Madie /
 * Raidas / Tyler's queues sort by score from day 1.
 *
 * Usage:
 *   node scripts/backfill-hormozi-fit.mjs               # all unscored
 *   node scripts/backfill-hormozi-fit.mjs --limit 50    # cap batch
 *   node scripts/backfill-hormozi-fit.mjs --dry-run     # preview only
 *   node scripts/backfill-hormozi-fit.mjs --concurrency 8  # default 5
 *
 * Cost: ~$0.003/prospect with prompt caching warm. 1740 prospects ≈ $5.
 * Runtime: ~6 minutes at concurrency 5 with sonnet-4-6.
 *
 * Env required (loaded from .env.local automatically):
 *   - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   - ANTHROPIC_API_KEY (or CLAUDE_API_KEY)
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ─── load .env.local ───
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // .env.local missing is fine if env is set externally
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const MODEL = process.env.LEAD_SCORER_MODEL || "claude-sonnet-4-6";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in env. Set it in .env.local first.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── args ───
function parseArgs(argv) {
  const out = { limit: null, concurrency: 5, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--limit") out.limit = parseInt(argv[++i], 10);
    else if (a === "--concurrency") out.concurrency = parseInt(argv[++i], 10);
  }
  return out;
}
const args = parseArgs(process.argv);

// ─── Hormozi-fit system prompt — kept verbatim in sync with
// src/lib/hormozi-fit-scorer.ts so the scores from this CLI match
// what the live /api/audit/submit hook produces. If you tweak one,
// tweak both.
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

function buildPrompt(p) {
  const lines = ["PROSPECT:"];
  lines.push(`Business: ${p.business_name}`);
  if (p.owner_name) lines.push(`Owner: ${p.owner_name}`);
  if (p.category) lines.push(`Category: ${p.category}`);
  if (p.city || p.state) lines.push(`Location: ${[p.city, p.state].filter(Boolean).join(", ")}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.address) lines.push(`Address: ${p.address}`);
  if (p.status) lines.push(`Status: ${p.status}`);
  if (p.source_channel) lines.push(`Source: ${p.source_channel}`);
  if (p.pricing_tier) lines.push(`Tier: ${p.pricing_tier}`);
  if (p.defensibility_score != null) lines.push(`Defensibility (mfg ICP): ${p.defensibility_score}/100`);
  lines.push("");
  lines.push("Score this prospect 0-100 on Hormozi-fit. Respond JSON only.");
  return lines.join("\n");
}

function extractJson(s) {
  let t = String(s ?? "").trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) return t.slice(first, last + 1);
  return t;
}

async function scoreOne(prospect) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
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
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = await resp.json();
  const text = data.content?.[0]?.text ?? "";
  const parsed = JSON.parse(extractJson(text));
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
  const summary = String(parsed.summary ?? "").trim().slice(0, 280);
  if (!Number.isFinite(score) || !summary) {
    throw new Error("malformed JSON: " + text.slice(0, 200));
  }
  return { score, summary };
}

async function processProspect(p) {
  try {
    const r = await scoreOne(p);
    if (!args.dryRun) {
      const { error } = await sb
        .from("prospects")
        .update({
          hormozi_fit_score: r.score,
          hormozi_fit_summary: r.summary,
          hormozi_fit_scored_at: new Date().toISOString(),
        })
        .eq("id", p.id);
      if (error) return { ok: false, id: p.id, err: error.message };
    }
    return { ok: true, id: p.id, score: r.score, summary: r.summary, business: p.business_name };
  } catch (e) {
    return { ok: false, id: p.id, err: e.message };
  }
}

async function main() {
  console.log(
    `[backfill-hormozi-fit] starting · model=${MODEL} · concurrency=${args.concurrency}` +
      (args.dryRun ? " · DRY RUN (no writes)" : "") +
      (args.limit ? ` · limit=${args.limit}` : ""),
  );

  let q = sb
    .from("prospects")
    .select(
      "id, business_name, owner_name, category, city, state, phone, email, address, status, source_channel, pricing_tier, defensibility_score",
    )
    .is("hormozi_fit_score", null)
    .order("created_at", { ascending: false });
  if (args.limit) q = q.limit(args.limit);
  const { data, error } = await q;
  if (error) {
    console.error("fetch failed:", error.message);
    process.exit(1);
  }
  const all = data ?? [];
  console.log(`[backfill-hormozi-fit] ${all.length} prospects to score`);
  if (all.length === 0) return;

  let done = 0;
  let priority = 0;
  let good = 0;
  let borderline = 0;
  let weak = 0;
  let errors = 0;

  // Concurrency-controlled worker pool
  const workers = Array.from({ length: args.concurrency }, async () => {
    for (;;) {
      const p = all.shift();
      if (!p) return;
      const r = await processProspect(p);
      done++;
      if (!r.ok) {
        errors++;
        console.error(`  ✗ ${p.business_name?.slice(0, 40) ?? p.id.slice(0, 8)}: ${r.err}`);
      } else {
        if (r.score >= 80) priority++;
        else if (r.score >= 60) good++;
        else if (r.score >= 40) borderline++;
        else weak++;
        if (done % 25 === 0 || r.score >= 80) {
          const tier = r.score >= 80 ? "🔥" : r.score >= 60 ? "🟢" : r.score >= 40 ? "🟡" : "🔴";
          console.log(
            `  ${tier} [${done}] ${r.business?.slice(0, 40)} → ${r.score}  ${r.summary.slice(0, 70)}`,
          );
        }
      }
    }
  });
  await Promise.all(workers);

  console.log("");
  console.log("[backfill-hormozi-fit] done");
  console.log(`  scored: ${done - errors} · errors: ${errors}`);
  console.log(`  🔥 priority (80+):  ${priority}`);
  console.log(`  🟢 good (60-79):    ${good}`);
  console.log(`  🟡 borderline (40-59): ${borderline}`);
  console.log(`  🔴 weak (0-39):     ${weak}`);
  console.log(
    `  est. cost: $${((done - errors) * 0.003).toFixed(2)} (sonnet-4-6 w/ prompt caching)`,
  );
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});
