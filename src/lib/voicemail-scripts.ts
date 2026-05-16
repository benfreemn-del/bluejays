/**
 * Per-client voicemail clip scripts.
 *
 * Three 18-24 sec clips per client — Welcome / Missed Call / After Hours.
 * Founders/owners record these in their own voice; we provide the
 * brand-aligned script so they don't have to write it.
 *
 * Surfaced inside the per-client portal Docs tab so the owner can read
 * the script when they sit down to record. Also inlined into the
 * onboarding-handoff PDF section that asks them to schedule recording.
 *
 * Adding a new client = one entry below.
 */

export type VoicemailClip = {
  id: "welcome" | "missed_call" | "after_hours";
  title: string;
  targetSeconds: string;
  script: string;
  /** Director notes — pacing, tone, what to emphasize. */
  notes?: string;
};

export type VoicemailKit = {
  clientSlug: string;
  /** Display brand the owner reads when recording (says their name + brand). */
  brand: string;
  /** Owner's first name — appears in scripts so they don't have to ad-lib. */
  ownerFirstName: string;
  clips: VoicemailClip[];
};

const KITS: VoicemailKit[] = [
  {
    clientSlug: "zenith-sports",
    brand: "Tekky",
    ownerFirstName: "Paul",
    clips: [
      {
        id: "welcome",
        title: "Clip 1 — Welcome / Main greeting",
        targetSeconds: "18-22 sec",
        script:
          "Hey, this is Paul over at Zenith Sports and Tekky. Thanks " +
          "for calling. Quickest way to reach me is to leave your name, " +
          "what your player's working on, and your number. I'll get back " +
          "to you the same day. If you want training tips or to grab a " +
          "Tekky ball, head to tekky.org. Talk soon.",
        notes:
          "Plays when someone calls and the line rings to voicemail " +
          "during normal hours. Calm, confident, no rush. Smile while " +
          "you say it — it comes through in the audio.",
      },
      {
        id: "missed_call",
        title: "Clip 2 — Missed call callback",
        targetSeconds: "18-22 sec",
        script:
          "Hey, Paul from Tekky here. Sorry I missed your call — I'm " +
          "probably with a player on the field. Drop me your name, what " +
          "your player needs help with, and the best number to reach you " +
          "back, and I'll call you the same day. If you want to grab the " +
          "ball or see drills, that's at tekky.org. Talk soon.",
        notes:
          "Plays when a caller doesn't reach you and we send them an " +
          "auto-text seconds later. Slightly more conversational than " +
          "Clip 1. The 'on the field' line is the brand anchor — keep it.",
      },
      {
        id: "after_hours",
        title: "Clip 3 — After hours",
        targetSeconds: "18-22 sec",
        script:
          "You've reached Paul at Tekky. We're closed for the evening — " +
          "I check messages first thing in the morning. Leave your name, " +
          "your player's age, and what you're working on, and I'll get " +
          "back to you tomorrow. For drills or the Tekky ball, head to " +
          "tekky.org anytime. Have a good one.",
        notes:
          "Triggered on calls outside the hours you set in Calendar tab. " +
          "Make 'tomorrow' a real commitment — don't pad it with 'or the " +
          "next day.' Players' parents respect a hard answer.",
      },
    ],
  },
];

export function getVoicemailKit(slug: string): VoicemailKit | null {
  return KITS.find((k) => k.clientSlug === slug) ?? null;
}
