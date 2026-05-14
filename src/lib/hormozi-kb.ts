import { getSupabase } from "./supabase";

/**
 * Hormozi knowledge-base loader.
 *
 * The KB lives in `hormozi_kb_chunks` (see 20260512_hormozi_diagnostic.sql).
 * Each chunk is a framework summary, a YouTube transcript excerpt, or a
 * book/note. Chunks are tagged by topic; the diagnostic agent selects
 * relevant chunks per prospect and stuffs them into the cached system
 * prompt — no embeddings yet. With Anthropic's 1M cache window and the
 * 5-min TTL, this is cheaper and simpler than vector search until the
 * KB exceeds ~200k words.
 */

export interface KBChunk {
  id: string;
  title: string;
  source_kind: "framework" | "youtube" | "book" | "note";
  source_url: string | null;
  topic_tags: string[];
  content: string;
  word_count: number;
}

/**
 * Load chunks, optionally filtered by overlapping topic tags. Empty
 * `tags` returns everything (use sparingly — bypasses selection).
 */
export async function loadKBChunks(tags: string[] = []): Promise<KBChunk[]> {
  const sb = getSupabase();
  let q = sb
    .from("hormozi_kb_chunks")
    .select("id, title, source_kind, source_url, topic_tags, content, word_count")
    .order("created_at", { ascending: true });
  if (tags.length > 0) {
    q = q.overlaps("topic_tags", tags);
  }
  const { data, error } = await q;
  if (error) throw new Error(`hormozi_kb_chunks load failed: ${error.message}`);
  return (data ?? []) as KBChunk[];
}

/**
 * Heuristic tag picker — given a prospect's free-text business
 * description, returns the topic tags most relevant for the diagnosis.
 * Cheap keyword match; the agent itself does the real reasoning. Goal
 * here is "don't load all 200 chunks when 5 will do."
 */
export function pickRelevantTags(businessText: string): string[] {
  const t = businessText.toLowerCase();
  const tags = new Set<string>();
  // Always relevant for a Hormozi diagnosis
  tags.add("offer");
  tags.add("leads");
  tags.add("strategy");
  tags.add("prioritization");

  if (/\bprice|pricing|charge|cost|cheap|expensive|undercut|discount|surge\b/.test(t)) tags.add("pricing");
  if (/\bchurn|retention|cancel|drop off|lifetime|ltv|loyalty\b/.test(t)) tags.add("churn");
  if (/\bad|ads|facebook|google ads|meta|paid traffic|cpc|roas\b/.test(t)) tags.add("paid-ads");
  if (/\bcold call|outreach|dm|email blast\b/.test(t)) tags.add("cold-outreach");
  if (/\bcontent|youtube|tiktok|instagram|post|reel\b/.test(t)) tags.add("content");
  if (/\bsales call|close|pitch|deck|objection|upsell|crossell|add[-\s]?on\b/.test(t)) tags.add("sales");
  if (/\bupsell|cross[-\s]?sell|add[-\s]?on|recurring|membership|subscription\b/.test(t)) tags.add("upsell");
  if (/\bteam|hire|staff|deliver|fulfill|operator|manager\b/.test(t)) tags.add("delivery");

  // Annie-diagnosis additions (2026-05-13)
  if (/\bpartner|co[-\s]?owner|co[-\s]?founder|equity|share|split|cap[\s-]?table\b/.test(t))
    tags.add("partnership");
  if (/\bstage|scaling|scale|growth|grow|expand|next level\b/.test(t)) tags.add("scaling-stage");
  if (/\bstage|location|locations|franchise|multi[-\s]?unit|open another\b/.test(t))
    tags.add("scaling-stage");
  if (/\bstaff|hire|hiring|turn[-\s]?over|trainer|trainee|technician|stylist|coach|barista\b/.test(t))
    tags.add("staff");
  if (/\bretention|stay|stick|loyal|career|path|promotion|raise\b/.test(t)) tags.add("retention");
  if (/\btrain|training|onboard|onboarding|role[-\s]?play|script\b/.test(t)) tags.add("training");
  if (/\brebook|come back|return|recurring|appointment|booking|schedul\b/.test(t)) tags.add("rebook");
  if (/\bmembership|monthly|annual|subscription|recurring\b/.test(t)) tags.add("membership");
  if (/\bbottleneck|stuck|plateau|constraint|capacity|busy|overwhelm|slow week\b/.test(t))
    tags.add("constraint");
  if (/\bdemand|supply|busy|slow|peak|off[-\s]?peak|weekend|weekday\b/.test(t)) tags.add("demand");
  if (/\bbonus|free|gift|incentive|reward|stack\b/.test(t)) tags.add("bonus-stack");
  if (/\bmembership|recurring|monthly|annual|subscription|loyalty\b/.test(t)) tags.add("membership");
  if (/\battribut|track|where did|where they hear|source|channel\b/.test(t)) tags.add("attribution");
  if (/\bfollow[-\s]?up|callback|speed[-\s]?to[-\s]?lead|response time|cold lead\b/.test(t))
    tags.add("speed-to-lead");
  if (/\bservice|salon|gym|clinic|appointment|booking|stylist|technician\b/.test(t))
    tags.add("service-business");
  if (/\bprofit|margin|cogs|labor cost|payroll|unit economics|revenue per\b/.test(t))
    tags.add("unit-economics");
  if (/\bpre[-\s]?pay|prepay|annual plan|paid up[-\s]?front|locked in\b/.test(t)) tags.add("cashflow");

  return Array.from(tags);
}

/**
 * Build the static (cacheable) system-prompt block. This block is
 * identical across all diagnoses for a given tag set, so Anthropic's
 * prompt-caching kicks in and most input tokens are billed at 10%.
 */
export function buildKBSystemBlock(chunks: KBChunk[]): string {
  if (chunks.length === 0) {
    return "[No Hormozi KB chunks loaded — diagnose from first principles.]";
  }
  const lines: string[] = [
    "You have access to the following Alex Hormozi framework summaries and",
    "transcript excerpts. Cite them by title when you apply them.",
    "",
  ];
  for (const c of chunks) {
    lines.push(`### ${c.title}  [${c.source_kind}]`);
    if (c.source_url) lines.push(`Source: ${c.source_url}`);
    lines.push(`Tags: ${c.topic_tags.join(", ")}`);
    lines.push("");
    lines.push(c.content);
    lines.push("");
  }
  return lines.join("\n");
}
