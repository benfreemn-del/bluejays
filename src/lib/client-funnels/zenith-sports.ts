/**
 * Zenith Sports / TEKKY® per-audience funnel definitions.
 *
 * Three parallel cadences keyed by audience_segment. Content sourced
 * directly from the TEKKY Unified Brand Voice Guide Copy Vault — every
 * touch passes the framework: clear, coach-credible, ambitious-not-
 * arrogant, single-CTA matching the audience-segment table.
 *
 * Cadence rationale:
 *   PARENTS (5-touch / 14 days)  — emotional buy, longer to mull
 *   COACHES (6-touch / 21 days)  — B2B cycle, multiple stakeholders
 *   PLAYERS (3-touch / 7 days)   — short attention span, don't over-message
 *
 * Variables in templates use {{name}}, {{firstName}}, {{shopUrl}},
 * {{trainingUrl}}, {{contactUrl}} — substituted at send time by the
 * funnel runner. Keep new variables out unless they're added to
 * VARIABLE_SUBSTITUTIONS.
 *
 * Updating: edit this file, redeploy. Existing in-flight funnels pick
 * up the new content on their NEXT step (already-sent steps stay sent).
 */

import type { ClientLeadAudience } from "../client-leads";

export type FunnelStep = {
  /** Days after enrollment to send. 0 = immediately on enroll. */
  day: number;
  /** Each step can fire one or more channels in the same window. */
  channels: FunnelChannelTouch[];
};

export type FunnelChannelTouch =
  | {
      channel: "email";
      templateId: string;
      subject: string;
      /** Plain-text body. Newlines preserved as paragraph breaks. */
      body: string;
    }
  | {
      channel: "sms";
      templateId: string;
      body: string;
    }
  | {
      channel: "voicemail";
      templateId: string;
      /** URL of the recorded mp3/wav, served from Twilio's media. */
      mediaUrl?: string;
      /** Until Philip records the clips, we describe the script for now. */
      scriptHint: string;
    };

export type AudienceFunnel = {
  audience: ClientLeadAudience;
  label: string;
  steps: FunnelStep[];
};

/* ──────────────────────────── PARENTS ──────────────────────────── */

const PARENTS: AudienceFunnel = {
  audience: "parent",
  label: "Parents · 5-touch · 14 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "parents.d0.welcome",
          subject:
            "Welcome to TEKKY®, {{firstName}} — let's get your player started",
          body: `Hi {{firstName}},

Thanks for reaching out about TEKKY®.

I'm Philip — co-founder. Quick note before I send anything else: the most common thing parents tell us after their player starts using the TEKKY ball is "I can see the difference in two weeks."

That's the Before & After Effect. It's why we built this.

The ball is FIFA Size 3 control with FIFA Size 5 match-day weight. Smaller surface = no margin for sloppy touches = sharper feel when they go back to the regulation ball on game day.

If you want to grab one and start training this week, here's the link: {{shopUrl}}

If you have questions first, just reply to this email — I read every one.

— Philip
Zenith Sports / TEKKY®
Building Better Players. One Touch at a Time.`,
        },
      ],
    },
    {
      day: 2,
      channels: [
        {
          channel: "sms",
          templateId: "parents.d2.sms",
          body: `Hi {{firstName}} — Philip @ TEKKY. Quick text to make sure you got my email about the training ball. Any questions before you order? Reply here, I'll personally get back to you. — P`,
        },
      ],
    },
    {
      day: 5,
      channels: [
        {
          channel: "email",
          templateId: "parents.d5.bae",
          subject: "What 'sharper touch' actually looks like (60-sec video)",
          body: `Hi {{firstName}},

A short one. Here's the 60-second drill that shows the BAE effect best:

{{trainingUrl}}

Player works the TEKKY for 60 seconds, switches to a regulation ball, you can see the difference in their first touch by the second rep.

That's what we're after. Confidence on every touch — not luck.

If your player's ready: {{shopUrl}}

— Philip`,
        },
      ],
    },
    {
      day: 9,
      channels: [
        {
          channel: "email",
          templateId: "parents.d9.social-proof",
          subject: "From a parent in your area",
          body: `Hi {{firstName}},

Quick share. We just heard back from a parent whose 11-year-old has been on the TEKKY ball for six weeks. Her words:

"He used to swing wild on every touch. Now he's calm. The coach noticed before I did."

That's typical. You don't need a club program or a $2,000 camp. You need 10–15 minutes a day with the right tool. That's it.

Here's the ball if you want to start: {{shopUrl}}

— Philip
TEKKY® · Patent Pending`,
        },
      ],
    },
    {
      day: 14,
      channels: [
        {
          channel: "email",
          templateId: "parents.d14.final",
          subject: "Last note from me — your call",
          body: `Hi {{firstName}},

I won't keep emailing — promise. This is my last note.

If TEKKY® isn't the right fit right now, no hard feelings. We'll be here when you're ready.

If you do want to grab one: {{shopUrl}}
If you'd rather talk it through first, just reply.

Either way — thanks for considering us. The work you're doing investing in your player matters.

— Philip
Zenith Sports`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── COACHES ──────────────────────────── */

const COACHES: AudienceFunnel = {
  audience: "coach",
  label: "Coaches / DOCs · 6-touch · 21 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "coaches.d0.welcome",
          subject: "TEKKY® for {{firstName}} — coach-credible, not influencer-first",
          body: `Hi {{firstName}},

Thanks for reaching out about TEKKY®. I'm Philip — Zenith Sports co-founder, ex-academy coach.

Short version: TEKKY is a patent-pending technical training ball. FIFA Size 3 control surface. FIFA Size 5 match-day weight. Built specifically to force more touches per minute and tighter technique under fatigue.

Trusted by Rec, Travel, ECNL, MLS Next clubs and college programs. We didn't go influencer-first. We went coach-first.

Two things I can do for you right now:

1. Send you our coaching guide — drill progressions, session plans, the European-style technical curriculum we use. Free PDF: {{trainingUrl}}

2. Walk you through a 30-minute club demo (in person if you're in WA, video call anywhere else). Book here: {{contactUrl}}

— Philip
Zenith Sports / TEKKY®`,
        },
      ],
    },
    {
      day: 1,
      channels: [
        {
          channel: "sms",
          templateId: "coaches.d1.sms",
          body: `{{firstName}} — Philip @ TEKKY. Sent you the coaching guide PDF and a club-demo booking link. Want me to set up a quick call this week to walk through it together?`,
        },
      ],
    },
    {
      day: 3,
      channels: [
        {
          channel: "email",
          templateId: "coaches.d3.outcomes",
          subject: "What ECNL coaches are seeing in 6 weeks",
          body: `Hi {{firstName}},

I'll keep this tactical. Three measurable outcomes from clubs running TEKKY in their training:

1. Touches per minute up ~28% in possession drills (player has to track the smaller surface)
2. Sole-of-foot control under pressure noticeably tighter — even at U10
3. First-touch composure on transition (the moment after a turnover) is the most-cited improvement from coaches

The mechanism is simple: smaller ball + match-day weight = forced focus. No way to fake it through.

If you want to put TEKKY in front of your players for a session, I can ship you a few balls to try with your roster, on us. Just reply with how many.

— Philip`,
        },
      ],
    },
    {
      day: 7,
      channels: [
        {
          channel: "email",
          templateId: "coaches.d7.demo-nudge",
          subject: "Quick demo this week, {{firstName}}?",
          body: `Hi {{firstName}},

Following up on the club demo. Most DOCs we talk to are pulled in 14 directions — I get it.

Here's what a 30-minute demo looks like:
  • 10 min — the methodology (technique before tactics, the European pipeline)
  • 10 min — TEKKY specs + drill library walkthrough
  • 10 min — Q&A on integrating it into your existing training

Book whenever works: {{contactUrl}}

If you'd rather just have me send the curriculum so your assistant coach can run with it, that's fine too — just reply.

— Philip`,
        },
      ],
    },
    {
      day: 14,
      channels: [
        {
          channel: "email",
          templateId: "coaches.d14.testimonial",
          subject: "From a DOC who just ordered for the club",
          body: `Hi {{firstName}},

Quick share from a DOC at an ECNL club we just kitted out:

"The ball does the coaching for me. My U13s aren't getting away with sloppy first touches anymore — the ball won't let them. I wish we'd had this five years ago."

If TEKKY® makes sense for your roster, here's the bulk-order link with the club discount: {{shopUrl}}

Or if you'd rather get on a call first: {{contactUrl}}

— Philip
Zenith Sports / TEKKY® · Patent Pending`,
        },
      ],
    },
    {
      day: 21,
      channels: [
        {
          channel: "email",
          templateId: "coaches.d21.final",
          subject: "Last check-in — your call",
          body: `Hi {{firstName}},

This is my last email — won't keep filling your inbox.

If TEKKY® isn't the right call for your program right now, no problem. Save this email for later, the ball isn't going anywhere.

If you do want to move on it: {{contactUrl}} for a demo, {{shopUrl}} to bulk-order direct.

Appreciate you giving us a look. Coaching technical players is the long game, and what you're doing matters.

— Philip
Zenith Sports`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── PLAYERS ──────────────────────────── */

const PLAYERS: AudienceFunnel = {
  audience: "player",
  label: "Players · 3-touch · 7 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "players.d0.welcome",
          subject: "What's up {{firstName}} — welcome to #TEKKYTouch",
          body: `Yo {{firstName}},

Philip @ TEKKY here. Thanks for tagging in.

Quick deal: if you train with TEKKY® for 14 days straight, you'll feel the difference in your touch the next time you play with a regulation ball. That's the BAE effect — Before & After.

Here's the drill library to get started: {{trainingUrl}}

New drill drops every Touch Tuesday on @ZenithSports. Tag #TEKKYTouch in your training reels — we feature one player a week.

— Philip`,
        },
      ],
    },
    {
      day: 3,
      channels: [
        {
          channel: "sms",
          templateId: "players.d3.sms",
          body: `{{firstName}} — Philip @ TEKKY. How's the touch feeling? Try the V-Cut drill today: youtube.com/watch?v=ojviCQ0mrsY · tag #TEKKYTouch when you do.`,
        },
      ],
    },
    {
      day: 7,
      channels: [
        {
          channel: "email",
          templateId: "players.d7.feature",
          subject: "Week 1 down — here's what's next",
          body: `Yo {{firstName}},

7 days in. If you've been training daily, you should be feeling the change in your sole-of-foot control already.

Two next moves:

1. Step up to the Intermediate drills (La Croqueta, Push Pull U-Drag): {{trainingUrl}}
2. Get your own TEKKY® if you've been borrowing one: {{shopUrl}}

And keep tagging #TEKKYTouch — we're picking next week's feature on Tuesday.

— Philip
Zenith Sports / TEKKY®`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── REGISTRY ──────────────────────────── */

export const ZENITH_FUNNELS: Record<ClientLeadAudience, AudienceFunnel | null> = {
  parent: PARENTS,
  coach: COACHES,
  player: PLAYERS,
  // No funnel for "club" or "unknown" — those route to manual review
  // in the dashboard. Once Ben tags them in the lead drawer, the
  // funnel runner picks them up on the next pass.
  club: null,
  unknown: null,
};

/** Lookup by audience. Returns null if no funnel is defined for that segment. */
export function getZenithFunnel(
  audience: ClientLeadAudience | null,
): AudienceFunnel | null {
  if (!audience) return null;
  return ZENITH_FUNNELS[audience] ?? null;
}

/** All defined funnels — used by the runner + analytics dashboard. */
export function listZenithFunnels(): AudienceFunnel[] {
  return Object.values(ZENITH_FUNNELS).filter((f): f is AudienceFunnel => !!f);
}
