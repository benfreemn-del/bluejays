/**
 * Voice Corpus loader — implements CLAUDE.md Rule 76.
 *
 * Reads the markdown files in `data/voice-corpus/` at MODULE INIT
 * (not per-request), caches them in-memory, and exposes
 * `loadVoiceCorpus({ types })` for AI features to subset by use case.
 *
 * Per Rule 76: every customer-facing AI feature that generates copy
 * MUST inject corpus excerpts as a CACHED system-prompt segment.
 * This module is the single seam.
 *
 * Design choices:
 * - Read at module init (cold start), not per-request → zero per-call
 *   filesystem cost, instant lookup
 * - "Empty corpus" = `hasContent: false` so callers can no-op when
 *   the placeholder files haven't been filled in yet (today's state).
 *   Wiring in is harmless until Ben pastes real content.
 * - Strip frontmatter blocks (--- ... ---) and HTML comments
 *   (<!-- ... -->) so the AI sees only the verbatim voice samples,
 *   not the per-entry metadata.
 * - Strip "🟡 awaiting content" placeholder sections so a half-filled
 *   corpus (e.g. only `cold-pitches.md` populated) still produces a
 *   useful subset for the relevant feature.
 *
 * Usage:
 * ```ts
 * import { loadVoiceCorpus } from "@/lib/voice-corpus";
 *
 * const corpus = loadVoiceCorpus({ types: ["replies", "voice-rules"] });
 * if (corpus.hasContent) {
 *   systemPrompt = `${corpus.excerpts}\n\n---\n\n${systemPrompt}`;
 * }
 * // → cache the combined systemPrompt with cache_control: ephemeral
 * ```
 */

import fs from "node:fs";
import path from "node:path";

/** All corpus file types defined in `data/voice-corpus/README.md`. */
export type VoiceCorpusType =
  | "cold-pitches"
  | "replies"
  | "tweets"
  | "linkedin-posts"
  | "sales-call-snippets"
  | "vsl-scripts"
  | "voice-rules";

const ALL_TYPES: VoiceCorpusType[] = [
  "cold-pitches",
  "replies",
  "tweets",
  "linkedin-posts",
  "sales-call-snippets",
  "vsl-scripts",
  "voice-rules",
];

/** Result of loading + subsetting the corpus. */
export type VoiceCorpusResult = {
  /** Concatenated, cleaned voice samples ready to paste into a system
   *  prompt. Empty string when no usable content is found. */
  excerpts: string;
  /** True when at least ONE of the requested types contains real
   *  voice content (i.e. the file isn't just placeholder template).
   *  Callers should skip injection when false to avoid blowing the
   *  cache key with empty content. */
  hasContent: boolean;
  /** The types that ACTUALLY contributed content (excludes types
   *  that were requested but returned empty). Useful for debugging
   *  + cost logging. */
  contributingTypes: VoiceCorpusType[];
  /** Approximate token count of `excerpts` (chars / 4). Used by
   *  callers to budget cached system prompt size. */
  approxTokens: number;
};

/** Cache: read once at first call, reused for the lifetime of the
 *  Node process. Vercel cold starts will re-read, which is fine. */
const fileCache = new Map<VoiceCorpusType, string | null>();

/** Resolve the corpus directory. In Vercel deploys the working dir
 *  is `/var/task` and `data/voice-corpus/` is bundled at the project
 *  root. In local dev `process.cwd()` is the bluejays/ folder. */
function corpusDir(): string {
  return path.join(process.cwd(), "data", "voice-corpus");
}

function readFileOrNull(type: VoiceCorpusType): string | null {
  if (fileCache.has(type)) return fileCache.get(type) ?? null;
  try {
    const filePath = path.join(corpusDir(), `${type}.md`);
    const raw = fs.readFileSync(filePath, "utf8");
    fileCache.set(type, raw);
    return raw;
  } catch {
    // File missing (fresh checkout, CI, etc.) — graceful degradation.
    fileCache.set(type, null);
    return null;
  }
}

/**
 * Strip the file down to just the verbatim voice samples:
 * - Remove the H1 title + the "Status" + maintenance / how-to-use
 *   sections (everything above the first "ENTRIES BEGIN HERE" marker
 *   when present, otherwise everything above the first `---`
 *   frontmatter block)
 * - Remove HTML comment placeholders (<!-- example -->)
 * - Remove per-entry frontmatter blocks (--- ... ---)
 * - Remove the "🟡 Awaiting content" placeholder paragraph
 * - Collapse 3+ blank lines into 2
 */
function cleanCorpusFile(raw: string): string {
  let s = raw;

  // Cut off everything before the entries marker (most files use this).
  const entriesMarker = /<!--\s*ENTRIES BEGIN HERE\s*-->/i;
  const m = s.match(entriesMarker);
  if (m && m.index !== undefined) {
    s = s.substring(m.index + m[0].length);
  }

  // Strip HTML comments (which the README files use to wrap example
  // entries — those are NOT voice samples, they're guidance for Ben).
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // Strip frontmatter blocks (--- key: value ... ---) — they're
  // per-entry metadata for routing, not voice content the AI needs to
  // see. CRITICAL: the regex MUST require key:value lines inside the
  // block, otherwise it eats horizontal-rule `---` separators in
  // content sections and nukes everything between them. Bug caught
  // 2026-05-07 when voice-rules.md lost 5K chars to this exact issue
  // (Rules 2-4 disappeared because they sat between two `---`
  // horizontal rules). The `(?:[a-z_-]+:.*\n)+` lookahead requires at
  // least one `key: value` line inside the block, so `---` followed
  // by prose content stays untouched.
  s = s.replace(/^---\n(?:[a-zA-Z_-]+:.*\n)+(?:.*\n)*?---\n?/gm, "");

  // Strip the placeholder "🟡 Awaiting content" notice if present.
  s = s.replace(/🟡\s+\*\*Awaiting content\.\*\*[\s\S]*?(?=\n## |\n# |$)/g, "");

  // Strip "## Status" subsections (the placeholder maintenance copy).
  s = s.replace(/^## Status[\s\S]*?(?=\n## |\n# |$)/gm, "");

  // Collapse runs of 3+ blank lines.
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

/**
 * Load (and cache) one corpus type, returning the cleaned voice
 * content. Returns empty string when the file is missing OR contains
 * only placeholder template (no real voice content).
 */
function loadOne(type: VoiceCorpusType): string {
  const raw = readFileOrNull(type);
  if (!raw) return "";
  const cleaned = cleanCorpusFile(raw);
  // After cleaning, treat anything under ~80 chars as "still empty"
  // (cleaned-out boilerplate can leave a stray heading or newline).
  if (cleaned.length < 80) return "";
  return cleaned;
}

/** Format the merged excerpts with a system-prompt-friendly header
 *  block per type, so the AI knows what each section is for. */
function formatExcerpts(blocks: { type: VoiceCorpusType; content: string }[]): string {
  if (blocks.length === 0) return "";

  const header =
    "BEN-VOICE REFERENCE CORPUS — these are real samples of how Ben " +
    "writes. Match this voice + cadence + sentence rhythm in your " +
    "output. The corpus encodes the unfakeable signal that distinguishes " +
    "Ben's writing from generic AI output.";

  const sections = blocks
    .map((b) => {
      const label = TYPE_LABELS[b.type] ?? b.type;
      return `### ${label}\n\n${b.content}`;
    })
    .join("\n\n---\n\n");

  return `${header}\n\n${sections}`;
}

const TYPE_LABELS: Record<VoiceCorpusType, string> = {
  "cold-pitches": "Cold pitches (Ben's outbound style)",
  "replies": "Replies (Ben's conversational / objection-handling style)",
  "tweets": "Tweets (Ben's short-form fingerprint)",
  "linkedin-posts": "LinkedIn posts (Ben's long-form public voice)",
  "sales-call-snippets": "Sales-call snippets (Ben's spoken voice)",
  "vsl-scripts": "VSL scripts (Ben's persuasion structure)",
  "voice-rules": "Voice rules (distilled style guide)",
};

/**
 * Load the corpus, subsetting by use case.
 *
 * @param opts.types  Which corpus files to include. Default: all
 *                    types. Pick the minimum that's relevant to the
 *                    feature — token budget matters even with caching.
 *
 * Recommended subsets (per Rule 76):
 * - Cold-pitch generator: `["cold-pitches", "voice-rules"]`
 * - Reply drafter:        `["replies", "sales-call-snippets", "voice-rules"]`
 * - Audit-page copy:      `["linkedin-posts", "voice-rules"]`
 * - SMS templates:        `["replies", "voice-rules"]`
 * - Newsletter / mosy:    `["linkedin-posts", "voice-rules"]`
 */
export function loadVoiceCorpus(
  opts: { types?: VoiceCorpusType[] } = {},
): VoiceCorpusResult {
  const types = opts.types ?? ALL_TYPES;

  const blocks: { type: VoiceCorpusType; content: string }[] = [];
  for (const t of types) {
    const content = loadOne(t);
    if (content) blocks.push({ type: t, content });
  }

  const excerpts = formatExcerpts(blocks);
  const approxTokens = Math.ceil(excerpts.length / 4);

  return {
    excerpts,
    hasContent: blocks.length > 0,
    contributingTypes: blocks.map((b) => b.type),
    approxTokens,
  };
}

/**
 * Reset the in-memory cache. Used by tests + (rarely) by an admin
 * endpoint that wants to hot-reload the corpus without redeploying.
 * Production code should NOT call this — the cache is the point.
 */
export function _resetVoiceCorpusCache(): void {
  fileCache.clear();
}
