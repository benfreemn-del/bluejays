/**
 * Agency-decline nurture sequence.
 *
 * When an applicant gets declined by /api/agency/apply (didn't meet
 * hard thresholds), they're still mid-funnel — most have working
 * businesses, real revenue, just not big enough YET. The 1-shot
 * "redirected to /audit" decline screen burns half of them. This
 * sequence keeps the rest warm and tracks who eventually re-applies.
 *
 * Cadence (days after decline):
 *   Step 1 — Day 1:  Free audit nudge ("Here's what we'd find on your site")
 *   Step 2 — Day 3:  Case study + soft re-apply
 *   Step 3 — Day 14: Check-in ("Past $5K/mo yet?")
 *   Step 4 — Day 30: Direct re-apply CTA, final email
 *
 * Skipped if:
 *   - Applicant unsubscribes (sets nurture_unsubscribed_at)
 *   - Applicant manually re-qualified by Ben (status moves off 'dnq')
 *   - Sequence completes (nurture_completed_at set)
 *
 * Every email tracks utm_source=declined_agency&utm_medium=nurture
 * so we can measure recovery rate in GA + Supabase.
 */

const BASE = "https://bluejayportfolio.com";

/** Build a tracked URL with our standard nurture UTMs. */
function tracked(path: string, campaign: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${sep}utm_source=declined_agency&utm_medium=nurture&utm_campaign=${campaign}`;
}

/** Wrap text email in our standard HTML envelope (links auto-styled). */
function htmlOf(text: string): string {
  return text
    .split("\n")
    .map((line) =>
      line.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#7c3aed;text-decoration:underline">$1</a>',
      ),
    )
    .join("<br>");
}

export type NurtureBody = { text: string; html: string };

export type NurtureStep = {
  step: number;
  daysAfterPrevious: number;
  subject: (firstName: string) => string;
  body: (args: {
    firstName: string;
    businessName: string;
    industry: string | null;
  }) => NurtureBody;
};

export const NURTURE_STEPS: NurtureStep[] = [
  // ─── Day 1 — Free audit nudge ─────────────────────────────────────
  {
    step: 1,
    daysAfterPrevious: 1,
    subject: () => "Quick thought on your application",
    body: ({ firstName, businessName }) => {
      const auditUrl = tracked("/audit", "day1_audit");
      const text = [
        `Hey ${firstName || "there"},`,
        ``,
        `Ben here from BlueJays. You applied for the AI Marketing System for ${businessName} and based on the numbers I had to pass — for now.`,
        ``,
        `That's not a "no forever," it's a "let's get you to where the math works first."`,
        ``,
        `In the meantime, I built a free 60-second site audit that runs the same playbook the AI System uses, just at a smaller scope. It tells you what your current site is missing for converting cold traffic — three specific fixes, ranked by impact.`,
        ``,
        `It's free, no credit card, and the report lands in your inbox in under a minute:`,
        auditUrl,
        ``,
        `If after the audit your revenue grows past where it is now, re-apply for the full system any time. I'll fast-track returning applicants.`,
        ``,
        `— Ben`,
        ``,
        `P.S. Reply to this email if you want me to look at your site personally and tell you the #1 thing to fix. I do that for the first 5 emails I get every morning.`,
      ].join("\n");
      return { text, html: htmlOf(text) };
    },
  },

  // ─── Day 3 — Case study + soft re-apply ───────────────────────────
  {
    step: 2,
    daysAfterPrevious: 2,
    subject: () => "How a small business hit 100 leads in 90 days (the playbook)",
    body: ({ firstName, businessName, industry }) => {
      const caseUrl = tracked("/case-studies", "day3_case_study");
      const reapplyUrl = tracked("/agency/apply", "day3_reapply");
      const ind = industry || "your industry";
      const text = [
        `${firstName || "Hey"},`,
        ``,
        `Following up from the audit email — wanted to share something useful even if you don't end up using BlueJays.`,
        ``,
        `Most small businesses think the answer to "more leads" is more ads. It's not. It's a connected system that runs without you touching it: ads → site → email → SMS → voicemail, all sharing data, all tightening every week.`,
        ``,
        `That's the playbook the AI Marketing System runs. We've put case studies up here showing how it works for businesses like ${businessName} in ${ind}:`,
        caseUrl,
        ``,
        `Read whichever one is closest to your situation. The page is structured so you can copy the playbook even if you build it yourself.`,
        ``,
        `If you'd rather have us build it for you and your situation has changed since you applied, the application takes 8 minutes:`,
        reapplyUrl,
        ``,
        `— Ben`,
      ].join("\n");
      return { text, html: htmlOf(text) };
    },
  },

  // ─── Day 14 — Status check ────────────────────────────────────────
  {
    step: 3,
    daysAfterPrevious: 11,
    subject: (firstName) => `Past $5K/mo yet, ${firstName || "friend"}?`,
    body: ({ firstName, businessName }) => {
      const reapplyUrl = tracked("/agency/apply", "day14_check");
      const text = [
        `${firstName || "Hey"},`,
        ``,
        `Two weeks back I had to pass on ${businessName}'s AI Marketing System application. The math didn't work yet — usually that means revenue under $3K/mo, AVG under $1K, or budget that wasn't liquid.`,
        ``,
        `Quick check: did anything change?`,
        ``,
        `If yes, re-apply — I'll fast-track returning applicants and review within the same business day:`,
        reapplyUrl,
        ``,
        `If not, no worries. I'll send one more email at Day 30 and then I'll stop pestering you. You can also reply UNSUBSCRIBE and I'll take you off the list right now.`,
        ``,
        `— Ben`,
      ].join("\n");
      return { text, html: htmlOf(text) };
    },
  },

  // ─── Day 30 — Direct re-apply, final ──────────────────────────────
  {
    step: 4,
    daysAfterPrevious: 16,
    subject: () => "Last email — door's still open",
    body: ({ firstName, businessName }) => {
      const reapplyUrl = tracked("/agency/apply", "day30_reapply");
      const text = [
        `${firstName || "Hey"},`,
        ``,
        `Final email of this thread. ${businessName} applied for the AI Marketing System a month ago and didn't qualify — but a lot can change in a month.`,
        ``,
        `If revenue or your budget situation changed, here's the re-apply link one more time:`,
        reapplyUrl,
        ``,
        `If not, that's totally fine — I'll stop emailing. You're welcome to circle back any time at bluejayportfolio.com/agency.`,
        ``,
        `Wishing you a good quarter either way,`,
        `Ben`,
      ].join("\n");
      return { text, html: htmlOf(text) };
    },
  },
];

/**
 * Pull the first name from a contact_name field. We don't trust the
 * input format ("Sarah Smith", "Dr. Sarah Smith MD", "sarah", etc.) so
 * grab the first whitespace-separated token, strip honorifics, fall
 * back to empty string for "Hey there"-style salutation.
 */
export function firstNameOf(contactName: string | null | undefined): string {
  if (!contactName) return "";
  const tokens = contactName.trim().split(/\s+/);
  const HONORIFICS = new Set(["mr", "mrs", "ms", "dr", "mr.", "mrs.", "ms.", "dr."]);
  for (const t of tokens) {
    if (!HONORIFICS.has(t.toLowerCase())) {
      return t.charAt(0).toUpperCase() + t.slice(1);
    }
  }
  return "";
}

/**
 * Compute the next send timestamp for a given step number that just
 * completed (1-indexed). Returns null if there's no next step.
 */
export function nextSendForStep(stepCompleted: number): Date | null {
  const next = NURTURE_STEPS.find((s) => s.step === stepCompleted + 1);
  if (!next) return null;
  return new Date(Date.now() + next.daysAfterPrevious * 24 * 60 * 60 * 1000);
}
