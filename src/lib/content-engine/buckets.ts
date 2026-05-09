/**
 * content-engine/buckets.ts — pulls fresh source material from the
 * BlueJays system for each of the 5 idea buckets.
 *
 * Canonical reference: .claude/skills/content-engine/SKILL.md
 *
 * Each bucket reads recent operational data (yesterday-ish) and
 * returns 0-N candidate posts. The brief generator picks the best one
 * and feeds it through the hook + script + CTA pipeline.
 *
 * Empty bucket = no fresh material that day. Brief generator falls
 * back to the next bucket in the rotation, then to evergreen.
 */

import { execSync } from "node:child_process";
import { supabase, isSupabaseConfigured } from "../supabase";

export type ContentBucket =
  | "prospect_questions"
  | "client_outcomes"
  | "build_in_public"
  | "hot_takes"
  | "ship_log";

export interface BucketCandidate {
  bucket: ContentBucket;
  /** One-line summary used as seed for hook generation */
  seed: string;
  /** Specifics: numbers, names, slugs, urls — anything that grounds the hook */
  specifics: Record<string, string | number>;
  /** Where this came from (for the brief UI to show source) */
  sourceLabel: string;
}

/* ─────────────────────── BUCKET 5: SHIP LOG ─────────────────────── */

/**
 * Yesterday's git activity — what Ben (or Claude) shipped. Lowest
 * leverage of the 5 buckets but the easiest to harvest, so always
 * available as fallback.
 */
export function getShipLogCandidates(): BucketCandidate[] {
  try {
    const log = execSync(
      `git log --since="2 days ago" --until="now" --pretty=format:"%h|%s" --no-merges`,
      { encoding: "utf-8", cwd: process.cwd() },
    );
    if (!log.trim()) return [];
    const candidates: BucketCandidate[] = [];
    for (const line of log.split("\n").slice(0, 5)) {
      const [hash, ...subjectParts] = line.split("|");
      const subject = subjectParts.join("|");
      if (!subject || /merge|wip|fixup/i.test(subject)) continue;
      candidates.push({
        bucket: "ship_log",
        seed: subject,
        specifics: { commit: hash, subject },
        sourceLabel: `git: ${hash}`,
      });
    }
    return candidates;
  } catch {
    return [];
  }
}

/* ─────────────────── BUCKET 2: CLIENT OUTCOMES ─────────────────── */

/**
 * Recent paid prospects + booked client_leads. The pure-proof bucket.
 */
export async function getClientOutcomeCandidates(): Promise<BucketCandidate[]> {
  if (!isSupabaseConfigured()) return [];
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const out: BucketCandidate[] = [];

  // Recent paid closes
  const { data: paid } = await supabase
    .from("prospects")
    .select("id, business_name, pricing_tier, paid_at")
    .eq("status", "paid")
    .gte("paid_at", since)
    .order("paid_at", { ascending: false })
    .limit(3);
  for (const p of paid ?? []) {
    if (!p.business_name) continue;
    const dollars = p.pricing_tier === "fullsystem" ? 9700 : 997;
    out.push({
      bucket: "client_outcomes",
      seed: `${p.business_name} closed $${dollars.toLocaleString()}`,
      specifics: {
        business: p.business_name,
        amount_usd: dollars,
        tier: p.pricing_tier ?? "unknown",
      },
      sourceLabel: `prospect: ${p.business_name}`,
    });
  }

  // Recent booked client_leads
  const { data: booked } = await supabase
    .from("client_leads")
    .select("id, client_slug, name, booked_at, deal_value_usd")
    .not("booked_at", "is", null)
    .gte("booked_at", since)
    .order("booked_at", { ascending: false })
    .limit(3);
  for (const l of booked ?? []) {
    out.push({
      bucket: "client_outcomes",
      seed: `${l.name ?? "client lead"} booked for ${l.client_slug}${l.deal_value_usd ? ` ($${l.deal_value_usd})` : ""}`,
      specifics: {
        slug: l.client_slug,
        deal_value: l.deal_value_usd ?? 0,
      },
      sourceLabel: `client_lead: ${l.client_slug}`,
    });
  }
  return out;
}

/* ────────────────── BUCKET 3: BUILD IN PUBLIC ────────────────── */

/**
 * Recent acked URGENT signals — something broke + got fixed. The
 * relatable / build-in-public bucket.
 */
export async function getBuildInPublicCandidates(): Promise<BucketCandidate[]> {
  if (!isSupabaseConfigured()) return [];
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("agent_signals")
    .select("id, title, detail, source, created_at, read_at")
    .eq("severity", "urgent")
    .gte("created_at", since)
    .not("read_at", "is", null) // resolved = something we fixed
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []).map((s) => ({
    bucket: "build_in_public",
    seed: s.title,
    specifics: {
      source: s.source,
      detail: (s.detail || "").slice(0, 200),
    },
    sourceLabel: `signal: ${s.source}`,
  }));
}

/* ─────────────── BUCKET 1: PROSPECT QUESTIONS ─────────────── */

/**
 * Recent inbound prospect emails / replies that ASKED something. Best
 * source for "answer a real question" content.
 */
export async function getProspectQuestionCandidates(): Promise<BucketCandidate[]> {
  if (!isSupabaseConfigured()) return [];
  const since = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("emails")
    .select("id, body, from_address, prospect_id, sent_at")
    .gte("sent_at", since)
    .ilike("body", "%?%") // crude question-mark filter — good enough v1
    .order("sent_at", { ascending: false })
    .limit(20);
  // Pick the first 3 that look like a real question (not a bounce / signature).
  const out: BucketCandidate[] = [];
  for (const e of data ?? []) {
    const body = String(e.body || "").trim();
    if (!body || body.length < 30) continue;
    if (/unsubscribe|delivery failed|undeliverable/i.test(body)) continue;
    // Find the question line
    const qLine = body
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l.includes("?") && l.length < 200);
    if (!qLine) continue;
    out.push({
      bucket: "prospect_questions",
      seed: qLine,
      specifics: {
        from: String(e.from_address || ""),
        prospect_id: String(e.prospect_id || ""),
      },
      sourceLabel: `email: ${(e.from_address || "").split("@")[0]}`,
    });
    if (out.length >= 3) break;
  }
  return out;
}

/* ─────────────── BUCKET 4: HOT TAKES (curated) ─────────────── */

/**
 * Hot takes are operator opinions, not auto-fetched. Pull from a
 * curated list and rotate. Ben can edit `content-assets/hot-takes.md`
 * to add fresh ones — for v1 we ship a starter set inline.
 */
const HOT_TAKE_SEEDS = [
  "every marketing agency charges $5k/mo to post on facebook. that's the scam.",
  "stop A/B testing headlines. test the offer.",
  "if your audit is more than 1 page nobody reads it.",
  "ad spend > content polish. always.",
  "the agency model is dead. operators are the next decade.",
  "your CRM is a graveyard. go look at the last 50 'no replies'.",
  "every operator should ship one client win publicly per week.",
];

export function getHotTakeCandidates(): BucketCandidate[] {
  // Pseudo-random rotation by day so the same take doesn't fire two
  // days in a row when this bucket is picked.
  const idx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % HOT_TAKE_SEEDS.length;
  const seed = HOT_TAKE_SEEDS[idx];
  return [
    {
      bucket: "hot_takes",
      seed,
      specifics: { rotation_index: idx },
      sourceLabel: "hot-takes seed bank",
    },
  ];
}

/* ─────────────────────── ROTATION POLICY ─────────────────────── */

/**
 * Daily bucket order — the brief generator walks this list and picks
 * the first bucket with fresh material. Rotation is anchored to the
 * day of the week so the same bucket doesn't fire 2 days in a row.
 *
 * Ranking priority: highest leverage first.
 */
export const BUCKET_ROTATION: Record<number, ContentBucket[]> = {
  0: ["client_outcomes", "ship_log", "build_in_public", "hot_takes"], // Sun
  1: ["prospect_questions", "client_outcomes", "ship_log", "hot_takes"], // Mon
  2: ["client_outcomes", "build_in_public", "ship_log", "hot_takes"], // Tue
  3: ["prospect_questions", "ship_log", "client_outcomes", "hot_takes"], // Wed
  4: ["build_in_public", "client_outcomes", "ship_log", "hot_takes"], // Thu
  5: ["hot_takes", "ship_log", "client_outcomes", "prospect_questions"], // Fri
  6: ["ship_log", "build_in_public", "client_outcomes", "hot_takes"], // Sat
};

export async function fetchAllBucketCandidates(): Promise<BucketCandidate[]> {
  const [questions, outcomes, builds] = await Promise.all([
    getProspectQuestionCandidates(),
    getClientOutcomeCandidates(),
    getBuildInPublicCandidates(),
  ]);
  return [
    ...questions,
    ...outcomes,
    ...builds,
    ...getShipLogCandidates(),
    ...getHotTakeCandidates(),
  ];
}
