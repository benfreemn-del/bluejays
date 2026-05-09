/**
 * content-engine/ctas.ts — bucket-to-CTA mapping. One specific action
 * per video, never three.
 *
 * Canonical reference: .claude/skills/content-engine/SKILL.md
 */

import type { ContentBucket } from "./buckets";

export interface CtaTemplate {
  /** Spoken/written CTA in the video itself (last 3-5s) */
  videoLine: string;
  /** Text CTA for the post caption */
  captionLine: string;
  /** Why this CTA fits this bucket (for the brief UI) */
  rationale: string;
}

export const CTA_BY_BUCKET: Record<ContentBucket, CtaTemplate> = {
  prospect_questions: {
    videoLine: "comment '[KEYWORD]' below and i'll send you the full breakdown",
    captionLine: "↓ comment '[KEYWORD]' for the full version",
    rationale:
      "High-engagement loop: comment → DM follow-up → email capture. The DM is a soft sales touch, not a link drop.",
  },
  client_outcomes: {
    videoLine: "want this for your business? link in bio: free 30-second audit",
    captionLine: "→ free 30-sec audit: bluejayportfolio.com/free-audit",
    rationale:
      "Proof → audit funnel. Already-warm viewer who saw a real outcome is most likely to click.",
  },
  build_in_public: {
    videoLine: "follow for the next teardown",
    captionLine: "follow → operator notes weekly",
    rationale:
      "Identity capture, not transactional. Build-in-public converts on the 5th-10th view, not the first.",
  },
  hot_takes: {
    videoLine: "what would you change? drop it below.",
    captionLine: "⤵️ disagree? tell me why",
    rationale:
      "Comments = algorithm fuel. Hot takes that don't ask for the disagreement underperform.",
  },
  ship_log: {
    videoLine: "want this for your business? bluejayportfolio.com",
    captionLine: "→ bluejayportfolio.com",
    rationale:
      "Direct funnel — only use for ship-log content ~1x/week. Otherwise burns the audience on transactional tone.",
  },
};

/**
 * Replace the [KEYWORD] placeholder with a 1-word topic keyword for
 * the comment-trigger CTA. Pick something memorable and short — 1
 * word, all caps, easy to type on a phone.
 */
export function fillCtaKeyword(
  cta: CtaTemplate,
  keyword: string,
): CtaTemplate {
  const k = keyword.toUpperCase().replace(/\s+/g, "");
  return {
    videoLine: cta.videoLine.replace(/\[KEYWORD\]/g, k),
    captionLine: cta.captionLine.replace(/\[KEYWORD\]/g, k),
    rationale: cta.rationale,
  };
}
