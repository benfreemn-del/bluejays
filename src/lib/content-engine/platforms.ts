/**
 * content-engine/platforms.ts — fan out one ContentBrief into
 * platform-native drafts (X · LinkedIn · Instagram · Newsletter).
 *
 * Canonical reference: .claude/skills/content-engine/SKILL.md
 *
 * Same discipline as briefs.ts: deterministic transforms, not LLM
 * calls. Each platform has its own voice + length budget. Drafts are
 * "rewriteable starts," never ship-as-is.
 */

import type { ContentBrief } from "./briefs";

export type Platform = "x" | "linkedin" | "instagram" | "newsletter";

export interface PlatformDraft {
  platform: Platform;
  label: string;
  body: string;
  charCount: number;
  charBudget: number;
  /** Optional title — subject line for newsletter, hook label for IG */
  title?: string;
  /** Optional hashtag block (IG, sometimes X) */
  hashtags?: string[];
  /** Visual cue — what to attach in the post (screenshot, b-roll still, etc.) */
  attachmentHint?: string;
}

const CHAR_BUDGET: Record<Platform, number> = {
  x: 280,
  linkedin: 1300,
  instagram: 1000,
  newsletter: 600,
};

export function generatePlatformDrafts(
  brief: ContentBrief,
  hookOverride?: string,
): PlatformDraft[] {
  const hook = (hookOverride || brief.hooks[0]?.text || "").trim();
  return [
    buildXDraft(brief, hook),
    buildLinkedInDraft(brief, hook),
    buildInstagramDraft(brief, hook),
    buildNewsletterDraft(brief, hook),
  ];
}

function buildXDraft(brief: ContentBrief, hook: string): PlatformDraft {
  const proof = condense(brief.scriptDraft.proofSeconds, 100);
  const cta = brief.cta.captionLine.replace(/^→\s*/, "");

  const body = [hook, "", proof, "", cta].join("\n").trim();
  const trimmed = body.length > CHAR_BUDGET.x ? body.slice(0, CHAR_BUDGET.x - 1) + "…" : body;

  return {
    platform: "x",
    label: "X / Twitter",
    body: trimmed,
    charCount: trimmed.length,
    charBudget: CHAR_BUDGET.x,
    attachmentHint: "single image — screenshot of the surface from b-roll cue #1",
  };
}

function buildLinkedInDraft(brief: ContentBrief, hook: string): PlatformDraft {
  const sourceLine = `(${brief.candidate.sourceLabel})`;
  const promise = brief.scriptDraft.promiseSeconds;
  const proof = brief.scriptDraft.proofSeconds;
  const cta = brief.cta.captionLine;

  const bullets = breakIntoBullets(proof, brief);

  const body = [
    sentenceCase(hook),
    "",
    sourceLine,
    "",
    sentenceCase(promise),
    "",
    "Here's what stood out:",
    "",
    ...bullets.map((b) => `• ${b}`),
    "",
    cta,
  ].join("\n");

  return {
    platform: "linkedin",
    label: "LinkedIn",
    body,
    charCount: body.length,
    charBudget: CHAR_BUDGET.linkedin,
    attachmentHint: "carousel — title slide (hook), 3 proof slides (b-roll stills), CTA slide",
  };
}

function buildInstagramDraft(brief: ContentBrief, hook: string): PlatformDraft {
  const proof = condense(brief.scriptDraft.proofSeconds, 220);
  const cta = brief.cta.captionLine;

  const body = [
    hook,
    "",
    "—",
    "",
    proof,
    "",
    cta,
  ].join("\n");

  return {
    platform: "instagram",
    label: "Instagram",
    body,
    charCount: body.length,
    charBudget: CHAR_BUDGET.instagram,
    title: condense(hook, 60),
    hashtags: pickHashtags(brief),
    attachmentHint: "reel cover = hook overlay on b-roll still; reel = 30s vertical video from /videos pipeline",
  };
}

function buildNewsletterDraft(brief: ContentBrief, hook: string): PlatformDraft {
  const subject = condense(stripFiller(hook), 70);
  const proof = brief.scriptDraft.proofSeconds;
  const bullets = breakIntoBullets(proof, brief);

  const body = [
    sentenceCase(hook),
    "",
    sentenceCase(brief.scriptDraft.promiseSeconds),
    "",
    ...bullets.map((b) => `— ${b}`),
    "",
    brief.cta.captionLine,
    "",
    "— Ben",
  ].join("\n");

  return {
    platform: "newsletter",
    label: "Newsletter",
    body,
    charCount: body.length,
    charBudget: CHAR_BUDGET.newsletter,
    title: subject,
    attachmentHint: "header image — same screenshot as the X attachment for consistency",
  };
}

function condense(text: string, maxChars: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars - 1).replace(/\s+\S*$/, "") + "…";
}

function sentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripFiller(text: string): string {
  return text
    .replace(/^(here's|i just|i'm|so |yeah |okay |well )/i, "")
    .replace(/\s+—\s+.*$/, "")
    .trim();
}

const NOISY_SPECIFIC_KEYS = new Set([
  "subject",
  "prospect_id",
  "prospectId",
  "id",
  "from",
  "email",
  "commit",
  "hash",
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function breakIntoBullets(proof: string, brief: ContentBrief): string[] {
  const specifics = brief.candidate.specifics;
  const bullets: string[] = [];

  for (const [key, value] of Object.entries(specifics)) {
    if (NOISY_SPECIFIC_KEYS.has(key)) continue;
    if (typeof value === "string") {
      if (value.length < 4) continue;
      if (UUID_RE.test(value)) continue;
      if (EMAIL_RE.test(value)) continue;
    }
    bullets.push(`${prettyKey(key)}: ${value}`);
    if (bullets.length >= 3) break;
  }

  if (bullets.length === 0) {
    const sentences = proof
      .replace(/\([^)]+\)\s*/g, "")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    bullets.push(...sentences.slice(0, 3));
  }

  if (bullets.length === 0) bullets.push(sentenceCase(proof));
  return bullets;
}

function prettyKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickHashtags(brief: ContentBrief): string[] {
  const base = ["#smallbusiness", "#localbusiness", "#aimarketing"];
  const byBucket: Record<string, string[]> = {
    ship_log: ["#buildinpublic", "#indiehackers"],
    client_outcomes: ["#casestudy", "#growth"],
    build_in_public: ["#buildinpublic", "#startup"],
    prospect_questions: ["#marketing", "#sales"],
    hot_takes: ["#marketing", "#contrarian"],
  };
  return [...base, ...(byBucket[brief.bucket] ?? [])].slice(0, 6);
}
