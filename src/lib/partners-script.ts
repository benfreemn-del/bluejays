/**
 * Hormozi-tier sales script for the BlueJays partner workspace.
 *
 * PRIMARY GOAL ON EVERY COLD CALL:
 *   Book the prospect into Ben's calendar for a 15-min audit
 *   walkthrough. NOT close the sale. Hormozi rule for B2B service
 *   cold calls: a cold call has one job — get the next step. Ben
 *   does the actual close on the booked walkthrough.
 *
 * GOAL HIERARCHY (caller's brain — top is best):
 *   1. CALL_SCHEDULED — got them on Ben's calendar (scoreboard win)
 *   2. AUDIT_SENT     — texted the audit link (parachute, still useful)
 *   3. CALLBACK       — pinned a specific time to try again
 *   4. VOICEMAIL      — left VM + sent audit by text (ratio: ~25% reply)
 *   5. NO_ANSWER      — neutral, just move on
 *
 * Structure: every section is short, plain English, and reads aloud
 * naturally. Objection branches are written as deflect → compress →
 * re-offer per Hormozi closes. Merge tags ({bizName}, {firstName},
 * {category}, {city}, {url}, {partnerFirstName}, {auditUrl},
 * {scheduleUrl}) are resolved server-side before the script renders.
 *
 * Voice rules baked in:
 *   - 7th-grade reading level
 *   - Honest, blunt, friendly (Trooper voice)
 *   - No "leverage", "synergy", "above the fold", "social proof"
 *   - The CALL is the close. The audit is the fallback.
 *   - Never quote price unprompted.
 */

export type ScriptVars = {
  bizName: string;
  firstName: string;       // prospect's first name (or "there" if unknown)
  category: string;        // human-readable, e.g. "landscaping"
  city: string;            // or "your area"
  url: string;             // their site URL
  partnerFirstName: string; // caller's first name
  auditUrl: string;        // personalized audit link to text (parachute)
  scheduleUrl: string;     // Ben's calendar booking link (PRIMARY goal)
};

export type ScriptSection = {
  id: string;
  title: string;
  /** Short callout shown to caller before the lines (what's the goal of this section). */
  goal?: string;
  /** Lines the caller reads. Merge-tag substituted before render. */
  lines: string[];
  /** Optional caller notes — coaching, not script. */
  callerNotes?: string[];
};

export type ObjectionBranch = {
  id: string;
  trigger: string;         // what the prospect said
  response: string[];      // lines to read back
  callerNotes?: string;    // tactical note for the caller
};

export type CallScript = {
  intro: ScriptSection;
  qualify: ScriptSection;
  pitch: ScriptSection;
  bookTheCall: ScriptSection;
  textTheLink: ScriptSection;
  callbackClose: ScriptSection;
  voicemail: ScriptSection;
  objections: ObjectionBranch[];
};

/** Replace {merge} tags in a string with values from vars. Missing keys
 *  fall back to a generic stand-in so the line never reads as broken. */
export function fillVars(template: string, vars: ScriptVars): string {
  const fallbacks: Record<string, string> = {
    bizName: "your business",
    firstName: "there",
    category: "service",
    city: "your area",
    url: "your site",
    partnerFirstName: "the team",
    auditUrl: "https://bluejayportfolio.com/audit",
    scheduleUrl: "https://bluejayportfolio.com/schedule",
  };
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = (vars as unknown as Record<string, string>)[key];
    return v && v.trim() ? v : (fallbacks[key] ?? "");
  });
}

export const HORMOZI_CALL_SCRIPT: CallScript = {
  intro: {
    id: "intro",
    title: "Open the call",
    goal: "Get past the first 5 seconds. Friendly + specific = they don't hang up.",
    lines: [
      "Hey, is this {firstName}?",
      "Hi {firstName} — this is {partnerFirstName} with BlueJays. Quick reason for the call: I was looking at {bizName}'s site and I noticed a couple things that are probably costing you customers.",
      "Is now a bad time, or do you have 30 seconds?",
    ],
    callerNotes: [
      "If they say BAD TIME → jump to objection: 'busy'.",
      "If they say WHO ARE YOU → 'BlueJays builds websites for local {category} businesses — I'm calling because I genuinely think we can help.' Then continue.",
      "If they say YEAH GO AHEAD → continue to Qualify.",
    ],
  },

  qualify: {
    id: "qualify",
    title: "Qualify in 20 seconds",
    goal: "Get them to admit the site isn't pulling its weight. Their words, not yours.",
    lines: [
      "Quick question — when somebody Googles \"{category} {city}\" and lands on your site, are you happy with how many of them actually call you?",
      "Got it. And on a scale of 1 to 10, how would you rate your current site?",
      "Yeah, that's pretty common for {category} sites. The good news is fixing it isn't hard — most of what's broken is fixable in a couple of days.",
    ],
    callerNotes: [
      "If they say IT'S FINE / 9 OR 10 → 'Cool — let me ask differently. If I told you most {category} sites are missing 3 specific things that double their leads, would you at least want to see what those are? Free, no pitch.' Then go to Pitch.",
      "If they say IT'S BAD / I KNOW → perfect, go straight to Pitch with energy.",
      "If they DEFLECT → 'Fair enough. Can I send you a free audit anyway? You can read it tonight, ignore it if it's not useful.' Then go to TextTheLink.",
    ],
  },

  pitch: {
    id: "pitch",
    title: "Compress the offer",
    goal: "Set up the next step (Ben's call). Audit is the bridge, not the goal.",
    lines: [
      "Here's what I'd love to do. We have a system that scores your site 0-100 and finds the top 3 things costing you customers — takes about 60 seconds. Then Ben — that's the owner, he's a Washington State Trooper, he builds these himself — he hops on a 15-minute call with you and walks you through what's wrong and how to fix it. No pitch, no slides, just him explaining what he'd do.",
      "The audit is free. The 15-minute call is free. If after the call you want him to rebuild your site, $997 one-time, $100 a year for hosting. If not, no follow-up — you keep the audit either way.",
      "Want me to get you on Ben's calendar for the walkthrough? He's got a couple slots this week.",
    ],
    callerNotes: [
      "PRIMARY GOAL = book the 15-min walkthrough. Don't sell — sell the call.",
      "If they ask HOW MUCH → '$997 one-time, $100/yr hosting. But the call is free — you should hear what Ben'd actually do before deciding anything.'",
      "If they ask WHO BUILDS IT → 'Ben Freeman runs BlueJays. He's a Washington State Trooper, builds them himself. You'd talk to him directly on the call.'",
    ],
  },

  bookTheCall: {
    id: "bookTheCall",
    title: "Book the 15-min walkthrough (PRIMARY WIN)",
    goal: "This is the close. Get them on Ben's calendar before you hang up.",
    lines: [
      "Awesome. I'm going to text you Ben's booking link right now — pick a 15-minute slot that works. He's got openings later this week.",
      "While I have you, what's the best number to text? ... Got it, sending now.",
      "Once you book, you'll get a calendar invite from Ben. He'll have the audit pulled up and ready to walk you through. If you need to reschedule, just hit the link again.",
      "Anything specific you want him to focus on during the walkthrough? Like is there a particular thing about the site that's been bugging you?",
    ],
    callerNotes: [
      "Click SEND BOOKING LINK button on the right ↘. Pre-filled SMS with their personalized booking URL.",
      "Mark outcome CALL_SCHEDULED — this is the win we're tracking.",
      "Tip: ask the 'anything specific' question — gives Ben a hot lead-in for the walkthrough call.",
    ],
  },

  textTheLink: {
    id: "textTheLink",
    title: "Send the audit link (FALLBACK)",
    goal: "If they won't book the call — at least get the audit in their hands.",
    lines: [
      "No worries. Quick alternative — I'll text you a free 60-second audit of your site. You can read it tonight in 5 minutes. No call required, no follow-up calls.",
      "If after reading it you decide you want Ben to walk you through it, the booking link is right there at the bottom. If not, you keep the audit and we move on.",
      "What's the best number to text?",
      "Sending now — you'll see it land in about 5 seconds.",
    ],
    callerNotes: [
      "Use this ONLY if they won't book the call. Booking > audit-text every time.",
      "Click SEND AUDIT LINK button on the right ↘. That opens your messages app pre-filled.",
      "Mark outcome AUDIT_SENT.",
    ],
  },

  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — pin a specific follow-up time so it's not a fade.",
    lines: [
      "Cool — what's a better time? I can call back tomorrow morning or this Thursday afternoon, your pick.",
      "Got it, I'll mark you down for {time}. Either way you'll have the audit in your inbox tonight, so if you want to skip the call you can just text me back yes or no.",
    ],
    callerNotes: [
      "Mark outcome CALLBACK + write the time in the notes box.",
      "Don't push for a sale on the callback — push for THE AUDIT FIRST. The audit does the selling.",
    ],
  },

  voicemail: {
    id: "voicemail",
    title: "Leave a voicemail",
    goal: "Short. Specific. Tease the audit + the call. Text follows immediately.",
    lines: [
      "Hey {firstName}, this is {partnerFirstName} with BlueJays — I was looking at {bizName}'s site and noticed a couple things probably costing you customers.",
      "I'm going to text you a free 60-second audit and a link to book a 15-minute walkthrough with Ben — he owns the company, he'd walk you through what to fix. No charge for any of that.",
      "Take a look when you can. If it's useful, just text back. Thanks {firstName}.",
    ],
    callerNotes: [
      "Hang up. Hit SEND AUDIT LINK + SEND BOOKING LINK in that order. Mark outcome VOICEMAIL.",
      "About 1 in 4 voicemail-then-text combos get a reply. Leave the voicemail every time.",
    ],
  },

  objections: [
    {
      id: "busy",
      trigger: "I'm busy / bad time / not now",
      response: [
        "Totally fair, I won't keep you. Real quick — would it be useful if I just texted you a free audit of your site right now? You can read it tonight in 5 minutes. No call needed.",
        "Cool — sending it now. Have a good one.",
      ],
      callerNotes:
        "If yes → SEND AUDIT LINK button + mark SENT_AUDIT. If no → mark NOT_INTERESTED politely.",
    },
    {
      id: "haveAGuy",
      trigger: "I already have a guy / web designer / nephew does it",
      response: [
        "Cool — who's been doing it for you?",
        "How's the site working for you in terms of leads — getting 5 or more new customers a month from it?",
        "Mind if I send you a quick free audit anyway? You'll be able to compare it to what you have. If yours is better, ignore us.",
      ],
      callerNotes:
        "Don't trash their current guy. Plant doubt with the leads question, then offer the free audit as a comparison tool. Most 'guys' built a Squarespace site and disappeared.",
    },
    {
      id: "howMuch",
      trigger: "How much does it cost?",
      response: [
        "$997 one-time. $100 a year for hosting and support after that. No retainers, no monthly fees beyond the $100/yr.",
        "But before any of that — the audit is free, and you should see it before deciding. Want me to text it?",
      ],
      callerNotes:
        "Pivot back to the FREE audit immediately. Price-first calls close at 5x. Audit-first calls close at 25%.",
    },
    {
      id: "cantAfford",
      trigger: "Can't afford it / too expensive",
      response: [
        "Totally fair. Most owners feel that way until they see the audit — usually shows them losing $2,000 to $3,000 a month from a broken site.",
        "Let me text you the audit free. If it shows you're not losing money, ignore us. If it shows you are, $997 is just math.",
      ],
      callerNotes:
        "Reframe: 'too expensive' vs WHAT? The audit answers that. Always end on the free audit offer.",
    },
    {
      id: "thinkAboutIt",
      trigger: "I'll think about it",
      response: [
        "100%. The audit's free though — let me at least text it so you have the data when you're thinking about it. What's the best number?",
      ],
      callerNotes:
        "Don't push for a yes on the call. Push for the audit-link send. The audit closes them, not you.",
    },
    {
      id: "emailMe",
      trigger: "Send me an email instead",
      response: [
        "Will do. What's the best email?",
        "I'll email you AND text you — most owners read texts faster than email. What's the best mobile number?",
      ],
      callerNotes:
        "Get BOTH if possible. If they only give email, send the audit via email and mark SENT_AUDIT.",
    },
    {
      id: "notInterested",
      trigger: "Not interested / no thanks",
      response: [
        "Totally cool. Quick question — is it the website thing in general, or just bad timing for your business right now?",
        "Got it. If you ever change your mind we're at bluejayportfolio.com. Have a good one.",
      ],
      callerNotes:
        "If they say BAD TIMING → mark CALLBACK with note '90 days'. If WEBSITE THING → mark NOT_INTERESTED, exit fast and friendly.",
    },
    {
      id: "howGetNumber",
      trigger: "How did you get my number?",
      response: [
        "We're a local web service that helps small {category} businesses — found you through your business listing online. Public info, nothing weird.",
        "I'm only calling because I genuinely think we can help — happy to take you off the list right now if you'd rather not hear from us.",
      ],
      callerNotes:
        "If they say TAKE ME OFF → mark DO_NOT_CALL immediately. We honor it forever.",
    },
    {
      id: "isThisSpam",
      trigger: "Is this a robocall / scam / spam?",
      response: [
        "No, this is {partnerFirstName} — real person on the phone. I'm with BlueJays, we build websites for local {category} businesses.",
        "Want me to send you a free audit instead and you can decide if it's useful?",
      ],
      callerNotes:
        "Slow down, sound human, use the prospect's first name. Spam-paranoid prospects relax fast when you say their first name.",
    },
    {
      id: "removeFromList",
      trigger: "Take me off your list / do not call",
      response: [
        "Done. Removed you right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "Mark DO_NOT_CALL — server flags the prospect so no other partner can call them either. NEVER argue.",
    },
  ],
};
