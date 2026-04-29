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

export type CallTip = {
  id: string;
  emoji: string;
  title: string;
  body: string;
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

/** Hormozi-tier coaching the caller sees BEFORE every dial.
 *  These don't change per-call — they're the muscle memory we want
 *  the caller building over the first 100 calls. */
export const HORMOZI_CALL_TIPS: CallTip[] = [
  {
    id: "smile",
    emoji: "😊",
    title: "Smile before you dial",
    body: "Your tone changes the second you smile. They can't see you but they can feel it. The first 5 words decide if they hang up.",
  },
  {
    id: "slow",
    emoji: "🐢",
    title: "Slow down",
    body: "Talk like you're explaining to a friend, not selling. Cold callers rush. Friends don't. Be the friend.",
  },
  {
    id: "firstName",
    emoji: "👋",
    title: "Use their first name early + often",
    body: "Hearing their own name in the first sentence kills 'is this spam.' Use it again every 30 seconds — never more than once a sentence.",
  },
  {
    id: "permission",
    emoji: "🤝",
    title: "Permission first",
    body: "\"Cool?\" / \"Fair?\" / \"Sound useful?\" earns the green light. People hang up on monologues, not conversations.",
  },
  {
    id: "worstThing",
    emoji: "⭐",
    title: "The Hormozi magic line",
    body: "\"Would it be the worst thing in the world if you took 15 minutes, learned what's broken, and decided not to use us?\" → They say no → Objections evaporate.",
  },
  {
    id: "twoOptions",
    emoji: "🎯",
    title: "Two options, never one",
    body: "\"Tuesday at 3 or Thursday at 10?\" beats \"do you want to book?\" every time. Yes/no questions get nos. Choices get choices.",
  },
  {
    id: "endOnQ",
    emoji: "❓",
    title: "End every line on a question",
    body: "If you stop talking with a period, they fill the silence with \"no thanks.\" If you stop with a question, they have to answer.",
  },
  {
    id: "numbers",
    emoji: "🔢",
    title: "Anchor a number THEY say",
    body: "\"How many calls a week?\" → they give a number. That number becomes the wedge: \"top sites in your space pull 3-4× that.\" Their number, not yours.",
  },
  {
    id: "noTrash",
    emoji: "🛡️",
    title: "Never trash their current guy",
    body: "\"When's the last time he RAISED your leads?\" plants doubt without insulting them. They have to defend the choice — they can't.",
  },
  {
    id: "exit",
    emoji: "🚪",
    title: "Always offer the exit",
    body: "\"If you say no I'll never call again.\" They relax. Pressure kills. Most yeses come 30 seconds AFTER you give them permission to say no.",
  },
  {
    id: "everyNo",
    emoji: "🔥",
    title: "Every no gets you closer to a yes",
    body: "Cold-call math: ~1 in 20 books. That means every no isn't a failure — it's progress. Stack the nos fast. The yes is on the other side of them.",
  },
];

/** Big anchor mantra shown as a top banner on the workspace —
 *  the one line that resets the brain after every no. */
export const HORMOZI_MANTRA =
  "Every no leads you closer to a yes.";

/**
 * Gatekeeper / unknown-owner intro + voicemail variants.
 *
 * Used when the prospect record doesn't have an owner_name. Falling
 * back to "Hi there" sounds like spam. Hormozi-aligned move: ask for
 * the decision-maker by ROLE ("who handles the website?") which both
 * qualifies and gets the caller to the right person fast.
 *
 * Page logic swaps these in for `intro` / `voicemail` when
 * ownerFirstName is unknown — the rest of the script stays the same.
 */
export const HORMOZI_INTRO_UNKNOWN_OWNER: ScriptSection = {
  id: "intro",
  title: "Open the call (gatekeeper)",
  goal: "Owner name unknown — ask for who handles the website. Get to the decision-maker fast.",
  lines: [
    "Hey — quick question, who handles the website over at {bizName}?",
    "Awesome, is {ownerOrThem} around? I'll keep it short — got one quick thing about your site that's probably costing you some calls.",
    "[When transferred] — Hey, this is {partnerFirstName} with BlueJays. I'm not your typical sales call. One question, takes 10 seconds, then I'll let you go either way. Cool?",
    "Real quick — when somebody Googles \"{category} {city}\" and lands on your site, are you getting the kind of phone calls you'd want from it?",
  ],
  callerNotes: [
    "★ OWNER NAME UNKNOWN — DO NOT guess a name. Ask for the role.",
    "If gatekeeper says 'WHAT'S THIS REGARDING?' → 'I noticed something on the website that's probably costing them some customers — I just need 2 minutes with whoever handles it.' Specific = trust.",
    "If gatekeeper says 'I HANDLE IT' → great, run the same intro on them.",
    "Once on with the decision-maker, write their name in the notes box so the next caller has it.",
  ],
};

export const HORMOZI_VOICEMAIL_UNKNOWN_OWNER: ScriptSection = {
  id: "voicemail",
  title: "Leave a voicemail (no name)",
  goal: "Curiosity hook, no awkward 'Hey there.' Ask the next person to call back.",
  lines: [
    "Hey — this is {partnerFirstName} with BlueJays, calling for whoever handles {bizName}'s website.",
    "I was looking at the site and I found a couple things that are probably costing you about $2,000 a month in lost customers. Texting the breakdown right now so you can see what I mean.",
    "If it makes sense, just text back and we'll get whoever handles the site on a 15-minute call with Ben — he's the owner, he'd walk you through it. Either way, the breakdown's yours.",
  ],
  callerNotes: [
    "★ Hang up → SEND BOOKING LINK first → SEND AUDIT LINK second. Then mark VOICEMAIL.",
    "★ No name — keep it role-based. Don't fake-friendly with 'Hey there!' — sounds like spam.",
    "About 1 in 4 voicemail-then-text combos get a reply.",
  ],
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
    ownerOrThem: "they",
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
    goal: "Earn the next 30 seconds. Permission + intrigue = they don't hang up.",
    lines: [
      "Hey, is this {firstName}?",
      "Hi {firstName} — this is {partnerFirstName} with BlueJays. I'm not your typical sales call. I've got one question, takes about 10 seconds, then I'll let you go either way. Cool?",
      "Awesome. So I was looking at {bizName}'s website and I noticed a couple things that are probably costing you some calls. Real quick — when somebody Googles \"{category} {city}\" and lands on your site, are you getting the kind of phone calls you'd want from it?",
    ],
    callerNotes: [
      "PERMISSION FIRST. \"Cool?\" earns the green light. People hang up on monologues, not on conversations.",
      "If they say BAD TIME → jump to objection: 'busy'.",
      "If they say WHO ARE YOU → 'BlueJays builds websites for local {category} businesses. I'm calling because I genuinely think we can help.' Then continue.",
      "Use {firstName} early and often. Hearing your own name kills 'is this spam' instantly.",
    ],
  },

  qualify: {
    id: "qualify",
    title: "Qualify with NUMBERS",
    goal: "Anchor a specific number THEY say. That number becomes the wedge.",
    lines: [
      "Roughly how many new customer calls do you get a week — like a real ballpark?",
      "Got it. And of those, how many came from the website vs. word of mouth or your Google reviews?",
      "Yeah — that's actually right where most {category} sites land. The top sites in your space pull 3-4 times that. Not because they're prettier — because they have 3 specific things yours probably doesn't.",
      "So here's why I'm calling.",
    ],
    callerNotes: [
      "Get a NUMBER. Even a guess. Numbers anchor — \"happy\" / \"fine\" don't.",
      "If website calls = 0-2/wk → 'Yeah, a {category} site should be doing 5-15. We can fix that.' Go to Pitch.",
      "If they say WEBSITE DOESN'T MATTER / WORD OF MOUTH ONLY → 'Cool — but when somebody hears about you and Googles you to check you're real, what does the site tell them? That's the issue.' Go to Pitch.",
      "If they DEFLECT → 'Fair. Mind if I send the audit anyway? Read it tonight, ignore it if it's not useful.' → TextTheLink.",
    ],
  },

  pitch: {
    id: "pitch",
    title: "Tease ONE thing — then ask",
    goal: "Sell the CALL only. One sentence per breath. End every line on a question.",
    lines: [
      "I'd love to set you up with a 15-minute call with Ben — he's the owner, Washington State Trooper, builds these himself. He'd walk you through exactly what's costing you calls and how he'd fix it. No slides, no pitch. Sound useful?",
      "Cool. The call is free. The audit he'll walk you through is free. Even if you never use us, you walk away knowing exactly what to fix on the site you have. Fair?",
      "Real quick before we book it — would it be the worst thing in the world if you took the 15 minutes, learned what's broken, and decided not to use us?",
      "Right? Worst case you waste 15 minutes. Best case you double the calls coming off your site. He's free Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ HORMOZI MAGIC LINE: 'Would it be the worst thing in the world if you took the 15 minutes...' Pre-handles the no. Always says no, which means no objections left.",
      "★ TWO-OPTION CLOSE: 'Tuesday or Thursday' beats 'do you want to book?' every time. Yes/no questions get nos. Choices get choices.",
      "If they ask HOW MUCH → '$997 one-time, $100/yr hosting. But all that's later — the call's free, you should hear Ben out first. Tuesday or Thursday?'",
      "If they ask WHO ARE YOU → 'Ben Freeman runs BlueJays. State Trooper, builds them himself. You'd talk to him directly on the call.'",
      "If they ask WHAT'S WRONG WITH MY SITE on the phone → 'I'm not the one to tell you — that's literally Ben's job on the call. Tuesday or Thursday?'",
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
    title: "Leave a voicemail (with a HOOK)",
    goal: "Curiosity gap → specific dollar number → text follows in 5 sec.",
    lines: [
      "Hey {firstName}, {partnerFirstName} with BlueJays — I'm going to keep this short.",
      "I was looking at {bizName}'s website and I found a couple things that are probably costing you about $2,000 a month in lost customers. I'm going to text you the breakdown right now so you can see what I mean.",
      "If it makes sense, just text back and we'll get you on a 15-minute call with Ben — he's the owner, he'd walk you through it. Either way, the breakdown's yours. Thanks {firstName}.",
    ],
    callerNotes: [
      "★ The DOLLAR NUMBER is the hook. \"Probably costing you customers\" is forgettable. \"$2,000 a month\" gets a callback.",
      "★ Hang up → SEND BOOKING LINK first → SEND AUDIT LINK second. Then mark VOICEMAIL.",
      "About 1 in 4 voicemail-then-text combos get a reply. Always text after.",
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
        "Last question and I'll let you go: when's the last time he actually RAISED the calls coming off your site? Like a real change, not just 'updated something.'",
        "Yeah — that's actually what we do. Want me to send you a free audit anyway? You can show it to your guy. Either he uses it or he can't, but you'll know exactly what's missing.",
      ],
      callerNotes:
        "★ Never trash the current guy. Plant doubt with the LEVERAGE question — \"when did he RAISE your leads.\" Most never have, because most 'guys' built a Squarespace + disappeared. The audit becomes a tool the prospect can wield. They get to feel smart, not bullied.",
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
        "Totally fair. Quick question — would it be the worst thing in the world if you took 15 minutes with Ben on Tuesday or Thursday, learned what's broken, and decided not to use us?",
        "Right? Worst case you waste 15 minutes. Best case the call doubles your phone calls. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ HORMOZI MAGIC LINE again. \"I'll think about it\" is almost always \"I don't want to say no on the phone.\" The worst-thing question gives them permission to say yes without committing to anything.",
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
