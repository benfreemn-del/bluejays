/**
 * Olympic Inspections & Testing — partner / sales-team call scripts.
 *
 * Four audience branches matching the inspector-affiliate channels:
 *   - realtor      (real estate agents — biggest channel, ~70%)
 *   - insurance    (insurance agents who write older-home policies)
 *   - remediation  (mold remediation companies — mutual referrals)
 *   - restoration  (water/fire damage restoration — first call after leak)
 *
 * Mirrors src/lib/zenith-partners-script.ts shape so the same script
 * viewer UI can render this library.
 */

export type OITAudienceId =
  | "realtor"
  | "insurance"
  | "remediation"
  | "restoration";

export type OITScriptVars = {
  callerFirstName: string;
  firstName?: string;
  /** Brokerage / agency / company name */
  orgName?: string;
  /** Role (Broker / Agent / Owner / Operations Mgr) */
  role?: string;
  /** Their city */
  city?: string;
  state?: string;
  /** Personalized partner-tracking URL */
  trackingUrl?: string;
};

export type OITScriptSection = {
  id: string;
  title: string;
  goal?: string;
  lines: string[];
  callerNotes?: string[];
};

export type OITObjectionBranch = {
  trigger: string;
  reply: string[];
  ifDoubleDown?: string;
};

export type OITCallScript = {
  audience: OITAudienceId;
  label: string;
  whoTheyAre: string;
  intro: OITScriptSection;
  qualify: OITScriptSection;
  pitch: OITScriptSection;
  cta: OITScriptSection;
  voicemail: OITScriptSection;
  objections: OITObjectionBranch[];
};

// ────────────────────────────────────────────────────────────────────
// 1. REALTOR — biggest referral channel
// ────────────────────────────────────────────────────────────────────
const REALTOR: OITCallScript = {
  audience: "realtor",
  label: "🏠 Realtor affiliate",
  whoTheyAre:
    "Real estate agent or brokerage owner. Cares about: closing transactions on time, no surprise inspection issues, having a reliable inspector who turns reports around fast. Trusts inspectors who have done deals for other agents in their brokerage.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    goal: "Earn 90 more seconds.",
    lines: [
      "Hi, is this {firstName} from {orgName}?",
      "This is {callerFirstName} with Olympic Inspections & Testing — independent mold inspector serving the Olympic Peninsula.",
      "I'm reaching out to a few brokerages this week to get on the recommended-inspector list for buyer agents.",
      "Quick question — do you have a go-to mold inspector you currently send buyers to, or is that something you handle case-by-case?",
    ],
    callerNotes: [
      "Listen for: 'we use [other inspector]' OR 'we don't really test for mold' OR 'we recommend buyer-choice'.",
      "If they have a current inspector, don't try to displace — position as a backup option for tight timelines.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 60 seconds",
    goal: "Find the friction point in their current inspector workflow.",
    lines: [
      "Got it. So when a buyer asks about mold testing — whether it's a contingency or just a peace-of-mind thing — what does that usually look like for the timeline on your side?",
      "Have you ever had a mold inspection delay a closing? What happened?",
      "How often does mold come up in your transactions — every month? Just on older homes? Other patterns?",
    ],
    callerNotes: [
      "Goal: hear them say 'reports take too long' or 'older homes are tricky' or 'we get inspection-contingency surprises'.",
      "If they mention any pain — that's the wedge for the pitch.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · 90 seconds",
    goal: "Show how OIT solves the friction + how the partner program rewards them for sending business.",
    lines: [
      "Here's how we're different and why agents like working with us.",
      "Most local mold inspectors take 10-14 days to deliver a written report. That's too long for inspection-contingency windows. We deliver in 3-5 days, lab-backed, photo-documented, formatted for buyers and adjusters.",
      "We're independent — we don't do remediation ourselves, so the inspection is honest. No incentive to inflate findings.",
      "And we run a referral program for agents: $50 per closed inspection from your link, $75 after 5 closes, $100 after 20. Tracked automatically through your unique URL — no codes, no extra step for the buyer.",
      "So if you have a buyer ask about mold, you send them: {trackingUrl}",
      "They book, we inspect, you get paid. Monthly via Zelle, Venmo, or check.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · 30 seconds",
    goal: "Get them to take ONE action — accept the tracking link.",
    lines: [
      "Easiest thing: I'll text or email you the tracking link right after this call. Drop it in your email signature or your buyer-prep PDF, and you're set up. Total time: 60 seconds.",
      "If a buyer never asks about mold, you never use it — no commitment, no monthly anything.",
      "What's the best email or phone for the link?",
    ],
    callerNotes: [
      "The ask is microscopic. Make it impossible to say no.",
      "After they give the contact info, send the tracking link within the hour while they're warm.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail · 20 seconds",
    lines: [
      "Hi {firstName}, this is {callerFirstName} with Olympic Inspections & Testing — we do mold inspections for real estate transactions across the Olympic Peninsula.",
      "Quick question about getting on the recommended-inspector list at {orgName} for buyer agents — and a small referral program for closes. 3-5 day turnaround vs the usual 10-14.",
      "Call back when you have a minute, no rush. {callerFirstName} at Olympic Inspections.",
    ],
  },
  objections: [
    {
      trigger: "We already use [other inspector].",
      reply: [
        "That's totally fine — most agents have someone they trust. I'm not asking to replace them. I'm asking to be the backup when your guy is booked out 3 weeks and you have a buyer with a 10-day inspection window.",
        "Worth keeping our number in your phone for those moments?",
      ],
    },
    {
      trigger: "We don't really do mold testing.",
      reply: [
        "Got it. Most inspections come up in two scenarios — older homes (pre-1980) where moisture intrusion is likely, and any home with visible water staining or musty smell during the buyer walkthrough. Sound like that ever comes up?",
      ],
    },
    {
      trigger: "How much does it cost?",
      reply: [
        "Typical inspection runs $300-$575 depending on home size, plus $55-$85 per lab sample if needed. Quote is locked before we start — no surprises.",
        "From your buyer's perspective: cheap insurance against inheriting a remediation problem after close.",
      ],
    },
    {
      trigger: "Is the referral money even worth my time?",
      reply: [
        "Honestly — for an agent doing 15+ transactions a year, it adds up to $750-$1,500 with zero extra work. For most agents it's just nice coffee money or a tank of gas.",
        "The bigger value is having an inspector who can turn around in 3-5 days vs 2 weeks. That's what saves a deal.",
      ],
      ifDoubleDown: "Fair — money's not the hook. Forget the referral program. Just keep the number for the next time mold comes up — that's the real value.",
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 2. INSURANCE — agents writing policies on older PNW homes
// ────────────────────────────────────────────────────────────────────
const INSURANCE: OITCallScript = {
  audience: "insurance",
  label: "🛡 Insurance affiliate",
  whoTheyAre:
    "Insurance agent (often independent / multi-carrier). Cares about: getting policies bound on older homes that need underwriting clearance, claims that move smoothly, having a documented inspector for client claim packages.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    goal: "Frame as a tool that helps THEM, not a sales pitch.",
    lines: [
      "Hi, is this {firstName} at {orgName}?",
      "This is {callerFirstName} with Olympic Inspections & Testing — independent mold inspection lab on the Olympic Peninsula.",
      "Reaching out because we work with a lot of carriers on claim-driven testing and underwriting clearance. Curious if you ever run into homes where the carrier requires mold testing before they'll bind?",
    ],
    callerNotes: [
      "Insurance agents understand mold testing as a transactional necessity — pitch it as workflow help, not 'come refer us business'.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 60 seconds",
    lines: [
      "What's your typical workflow when a carrier flags a home for mold-history concern?",
      "Have you had a binder delayed because the homeowner couldn't get an inspector quickly enough?",
      "How often do your existing clients call you about water-damage or mold claims?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · 90 seconds",
    lines: [
      "Here's how we slot into your workflow.",
      "We deliver carrier-grade inspection reports in 3-5 days. AIHA-LAP-accredited lab, chain-of-custody documented, formatted directly for adjuster review.",
      "When a carrier flags a home, you send the homeowner to us with a unique link. We inspect, deliver the report directly to you AND the homeowner, and the underwriter has what they need to bind the policy.",
      "For claim-driven inspections, same fast turnaround. We've worked with State Farm, Allstate, Liberty Mutual, Geico, USAA, Farmers, Travelers — the format is plug-and-play.",
      "Partner program: $50 per closed inspection from your tracking link, scaling up. But honestly the bigger value is being able to tell a homeowner 'I have an inspector who can do this in a week, not three.'",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · 30 seconds",
    lines: [
      "Want me to send you a tracking link? Drop it in your client-onboarding email, or just text it to a homeowner when mold comes up in their policy review.",
      "What's the best email to send it to?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail · 20 seconds",
    lines: [
      "Hi {firstName}, this is {callerFirstName} with Olympic Inspections & Testing.",
      "We do carrier-grade mold inspections — fast turnaround, AIHA lab, claim-ready reports — for clients with underwriting or claim issues. Worked with all the major carriers.",
      "Wondering if it'd be useful to have a tracking link for your clients when mold comes up in policy review. Call back when you have a minute. Thanks.",
    ],
  },
  objections: [
    {
      trigger: "I don't really refer for inspections — I write policies.",
      reply: [
        "Totally — and that's exactly the point. You don't refer FOR mold inspections. You refer when a carrier won't bind without one, or when a client calls you mid-claim asking who to call.",
        "It's a tool to help your clients, not extra work for you.",
      ],
    },
    {
      trigger: "We have a list of approved inspectors already.",
      reply: [
        "Makes sense. Most carriers don't have an exclusive list — they just want chain-of-custody lab reports. We meet the format. Worth adding us as a backup when your usual is booked out?",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 3. REMEDIATION — mutual referrals
// ────────────────────────────────────────────────────────────────────
const REMEDIATION: OITCallScript = {
  audience: "remediation",
  label: "🛠 Remediation partner",
  whoTheyAre:
    "Mold remediation company owner or operations manager. Critical: they CAN'T self-test their work for liability reasons, so they need an independent inspector for post-remediation clearance testing. We don't compete — we're complementary.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    goal: "Position as a complementary partner, not a competitor.",
    lines: [
      "Hi, is this {firstName} at {orgName}?",
      "This is {callerFirstName} with Olympic Inspections & Testing — independent mold inspector on the Olympic Peninsula.",
      "Calling because we work with a few remediation companies in the area for clearance testing — we test, you remediate. We don't do remediation ourselves, so we're never going to compete with you on the cleanup work.",
      "Quick question — who do you currently use for post-remediation clearance testing?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 60 seconds",
    lines: [
      "How often do your jobs need clearance testing afterward — pretty much every job, or just claim-driven ones?",
      "What's your typical turnaround when you need a third-party inspector? Is it ever the bottleneck on closing out a job?",
      "Do you have a referral relationship with anyone for testing? What works, what doesn't?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · 90 seconds",
    lines: [
      "Here's the partnership structure that's worked for the other remediation companies we work with.",
      "Mutual referrals. When a homeowner calls us with visible mold and we recommend remediation, we hand off to YOU — not whoever the homeowner Googles. When you finish a job and need clearance testing, you send the homeowner to us.",
      "We're fast — 3-5 days from inspection to written report. Lab-backed. AIHA-LAP accredited.",
      "Per-referral payout if you want it: $50 per closed inspection through your tracking link. Most remediation partners turn off the payout — they just want a reliable inspector who doesn't drag out closing-the-job.",
      "Either way, win-win. You get post-remediation clearance fast. We get pre-remediation referrals when growth is found.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · 30 seconds",
    lines: [
      "Easiest next step: lunch or coffee in the next two weeks. I want to walk through what your typical job looks like and where we slot in.",
      "What's your week look like Tuesday or Thursday?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail · 20 seconds",
    lines: [
      "Hi {firstName}, this is {callerFirstName} with Olympic Inspections & Testing.",
      "We're an independent mold inspector — we test, you remediate, we never compete on remediation work.",
      "Calling about a mutual-referral arrangement. We have homeowners every month who need a remediation referral, and we figure you've got jobs that need clearance testing.",
      "Coffee or lunch when you have time. Call me back at the number on caller ID.",
    ],
  },
  objections: [
    {
      trigger: "We already test ourselves / have an inspector we use.",
      reply: [
        "Got it. If you self-test, that's fine for non-claim jobs — but the moment a job is insurance-driven or a buyer/seller is involved, the carrier or attorney will want a third-party inspector on the report.",
        "Worth keeping our number for those edge cases?",
      ],
    },
    {
      trigger: "We don't get many post-remediation clearance jobs.",
      reply: [
        "Then the value flip is the OTHER direction. We refer out 5-10 remediation jobs a month. If you're our default partner, that's a meaningful referral stream for you with no contract or fees.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 4. RESTORATION — first call after a leak
// ────────────────────────────────────────────────────────────────────
const RESTORATION: OITCallScript = {
  audience: "restoration",
  label: "🚒 Restoration partner",
  whoTheyAre:
    "Water/fire damage restoration company. They're the FIRST CALL after a leak/flood/fire — usually 24/7 emergency dispatch. Their job is dry-out + repair, not testing. They refer for mold testing 1-3 weeks after dry-out.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    lines: [
      "Hi, is this {firstName} at {orgName}?",
      "This is {callerFirstName} with Olympic Inspections & Testing.",
      "Reaching out because we work with restoration companies — you handle the dry-out, we handle the post-dry-out testing if there's a question about whether moisture became mold.",
      "How often do homeowners ask you 'do I need to test for mold' after a job, and where do you send them?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 60 seconds",
    lines: [
      "What's your typical workflow when a customer asks about mold-testing 2-3 weeks after a water-damage job?",
      "Do insurance carriers ask you for a mold-testing report sometimes as part of closing the claim? How do you handle that?",
      "What would make a referral relationship valuable on your side? Faster turnaround? A specific report format? A payout?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · 90 seconds",
    lines: [
      "Here's how we work with restoration companies in the area.",
      "When you finish a water-damage job, you tell the homeowner: 'In 14 days, get a mold inspection from Olympic Inspections — they're independent so the report is honest, and they'll close the loop on the claim.'",
      "You send them via your tracking link. We deliver a full lab-backed report in 3-5 days. The carrier closes the claim. The homeowner is happy. You look like you handled it right.",
      "Partner payout: $50 per closed inspection. But again, the bigger value is handing off to someone reliable so a customer doesn't go Google a random inspector.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · 30 seconds",
    lines: [
      "Easiest thing: 15-minute call or lunch this week or next. Want to walk through what a typical post-restoration referral looks like.",
      "Tuesday morning or Thursday afternoon work?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail · 20 seconds",
    lines: [
      "Hi {firstName}, this is {callerFirstName} with Olympic Inspections & Testing.",
      "We're independent mold testers on the Olympic Peninsula. Calling about a referral relationship — when your restoration jobs need follow-up testing 2-3 weeks after dry-out.",
      "Quick conversation when you have time. Call back any time, my number is on caller ID. Thanks.",
    ],
  },
  objections: [
    {
      trigger: "We don't really refer to inspectors — we just dry the place out.",
      reply: [
        "Totally fine. The use case isn't proactive — it's reactive. When a homeowner calls you 2 weeks later asking 'is this still safe' or the carrier asks for clearance testing, you have someone to send them to instead of saying 'not my problem.'",
      ],
    },
    {
      trigger: "We have a parent franchise relationship with a tester already.",
      reply: [
        "Got it. National franchises usually take 10-14 days for reports. We're 3-5 day turnaround locally. Worth keeping us as a backup for tight timelines?",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// REGISTRY
// ────────────────────────────────────────────────────────────────────

export const OIT_CALL_SCRIPTS: OITCallScript[] = [
  REALTOR,
  INSURANCE,
  REMEDIATION,
  RESTORATION,
];

export function getOITScript(audience: OITAudienceId): OITCallScript | null {
  return OIT_CALL_SCRIPTS.find((s) => s.audience === audience) ?? null;
}

export function listOITScripts(): OITCallScript[] {
  return OIT_CALL_SCRIPTS;
}

/* ──────────────── Variable substitution helper ──────────────── */

export function fillOITVars(template: string, vars: OITScriptVars): string {
  return template
    .replace(/\{callerFirstName\}/g, vars.callerFirstName || "")
    .replace(/\{firstName\}/g, vars.firstName || "")
    .replace(/\{orgName\}/g, vars.orgName || "your office")
    .replace(/\{role\}/g, vars.role || "")
    .replace(/\{city\}/g, vars.city || "")
    .replace(/\{state\}/g, vars.state || "")
    .replace(
      /\{trackingUrl\}/g,
      vars.trackingUrl || "https://bluejayportfolio.com/sites/olympic-inspections/index.html",
    );
}

export const OIT_DIAL_TIPS: string[] = [
  "Real-estate agents are 70% of inspector referrals. Start there.",
  "Insurance is the 'invisible' channel — they don't refer often but each referral is high-value (claim-driven).",
  "Remediation companies hate self-testing for liability reasons — they NEED an independent inspector.",
  "Restoration is reactive, not proactive — pitch as 'when your customer asks 2 weeks later'.",
  "Lead with turnaround time (3-5 days) — that's the #1 inspector pain point for time-sensitive deals.",
  "AIHA-LAP accreditation is the magic phrase for insurance + claim-driven calls.",
  "For agents, 'cheap insurance against inheriting a remediation problem' is the strongest reframe.",
  "Never pitch the referral payout as the main hook — it's the cherry, not the cake.",
  "Olympic Peninsula is the territory — leave nationwide / out-of-area calls alone.",
  "The voicemail script is the most-used artifact — pick up rate is < 30% for cold calls.",
];
