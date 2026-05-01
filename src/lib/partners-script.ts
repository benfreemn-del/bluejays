/**
 * Hormozi-tier sales script for the BlueJays partner workspace.
 *
 * PRIMARY GOAL ON EVERY COLD CALL:
 *   Book the prospect into Ben's calendar for a 15-min audit
 *   walkthrough. NOT close the sale. Hormozi rule: a cold call has
 *   one job — get the next step. Ben does the close on the walkthrough.
 *
 * GOAL HIERARCHY (caller's brain — top is best):
 *   1. CALL_SCHEDULED — got them on Ben's calendar (scoreboard win)
 *   2. AUDIT_SENT     — texted the audit link (parachute, still useful)
 *   3. CALLBACK       — pinned a specific time to try again
 *   4. VOICEMAIL      — left VM + sent audit by text (~25% reply rate)
 *   5. NO_ANSWER      — neutral, just move on
 *
 * Voice rules baked in:
 *   - 7th-grade reading level
 *   - Honest, blunt, friendly
 *   - No "leverage", "synergy", "above the fold", "social proof"
 *   - The CALL is the close. The audit is the fallback.
 *   - Never quote price unprompted.
 */

export type ScriptVars = {
  bizName: string;
  firstName: string;        // prospect's first name (or "there" if unknown)
  category: string;         // human-readable, e.g. "landscaping"
  city: string;             // or "your area"
  url: string;              // their site URL
  partnerFirstName: string; // caller's first name
  previewUrl: string;       // the finished site preview (PRIMARY hook)
  auditUrl: string;         // personalized audit link (parachute)
  scheduleUrl: string;      // Ben's calendar booking link (PRIMARY goal)
};

export type ScriptSection = {
  id: string;
  title: string;
  /** Short callout shown to caller before the lines (goal of this section). */
  goal?: string;
  /** Lines the caller reads. Merge-tag substituted before render. */
  lines: string[];
  /** Optional caller notes — coaching, not script. */
  callerNotes?: string[];
};

export type ObjectionBranch = {
  id: string;
  trigger: string;      // what the prospect said
  response: string[];   // lines to read back
  callerNotes?: string; // tactical note for the caller
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

/** Pre-call coaching shown BEFORE every dial.
 *  ★ MUST KNOW tips first — burn these into muscle memory over your first 100 calls. */
export const HORMOZI_CALL_TIPS: CallTip[] = [
  {
    id: "smile",
    emoji: "😊",
    title: "★ MUST: Smile before you dial",
    body: "Your tone changes the second you smile. They can't see you but they feel it. First 5 words decide if they hang up.",
  },
  {
    id: "fmDJ",
    emoji: "🎙️",
    title: "★ MUST: FM DJ voice — low, slow, confident",
    body: "Think late-night radio host, not morning show. Drop your pitch DOWN at the end of every statement. Up-inflection sounds unsure. Down-inflection sounds like you already know the answer.",
  },
  {
    id: "worstThing",
    emoji: "⭐",
    title: "★ MUST: The Hormozi magic line",
    body: "'Would it be the worst thing in the world if you took 15 minutes, saw what we built, and decided not to use us?' They say no → objections evaporate. Use it every single call.",
  },
  {
    id: "twoOptions",
    emoji: "🎯",
    title: "★ MUST: Two options, never one",
    body: "'Tuesday at 3 or Thursday at 10?' beats 'do you want to book?' every time. Yes/no gets no. Choices get choices.",
  },
  {
    id: "doctorFrame",
    emoji: "🩺",
    title: "★ MUST: Doctor frame — diagnose before prescribe",
    body: "Ask questions until THEY surface the pain. 'When's the last time someone worked on the site to RAISE your leads?' A doctor doesn't prescribe before diagnosing. Neither do you.",
  },
  {
    id: "mirror",
    emoji: "🪞",
    title: "★ MUST: Mirror — repeat their last 3 words as a question",
    body: "They say 'I already have someone.' You say: 'Already have someone?' Silence follows. They fill it with the REAL objection. Works on every call. No prep needed.",
  },
  {
    id: "threeNo",
    emoji: "3️⃣",
    title: "★ MUST: The 3-no rule",
    body: "First no = reflex. Acknowledge + offer a different angle. Second no = real objection. Mirror it back. Third no = they mean it — exit fast, friendly, zero pressure. Chasing past 3 destroys your reputation.",
  },
  {
    id: "futurePace",
    emoji: "🔭",
    title: "★ MUST: Future pace — get them to say the upside out loud",
    body: "'Imagine those lead numbers doubled — what would that change for you in a month?' When THEY say the outcome in their own words, they've already half-sold themselves.",
  },
  {
    id: "talkLess",
    emoji: "🤐",
    title: "Talk less than half the call",
    body: "Top closers speak less than 57% of the time. Ask a question, then shut up. The more they talk, the more they sell themselves. Silence is not awkward — it's pressure.",
  },
  {
    id: "firstName",
    emoji: "👋",
    title: "First name early and often",
    body: "Hearing their own name in the first sentence kills 'is this spam.' Use it again every 30 seconds — never more than once per sentence.",
  },
  {
    id: "permission",
    emoji: "🤝",
    title: "Permission first — always",
    body: "'Fair?' / 'Cool?' / 'Sound useful?' earns the green light before you pitch anything. People hang up on monologues. They stay on conversations.",
  },
  {
    id: "endOnQ",
    emoji: "❓",
    title: "End every line on a question",
    body: "If you stop talking with a period, they fill the silence with 'no thanks.' Stop with a question and they have to answer.",
  },
  {
    id: "noTrash",
    emoji: "🛡️",
    title: "Never trash their current guy",
    body: "'When's the last time he RAISED your leads?' plants doubt without insulting anyone. They have to defend a choice they can't defend.",
  },
  {
    id: "exit",
    emoji: "🚪",
    title: "Always offer the exit",
    body: "'If you say no right now I'll never call again.' They relax instantly. Most yeses come 30 seconds AFTER you give them permission to say no.",
  },
  {
    id: "heardYourName",
    emoji: "🔗",
    title: "Use a mutual connection when you have one",
    body: "If you know someone who knows them, lead with it: 'I was talking to [name] and your business came up.' A warm name in the first sentence triples pickup rate.",
  },
];

/** Big anchor mantra shown as a top banner on the workspace. */
export const HORMOZI_MANTRA =
  "Stack the nos fast. Every no is one step closer to the yes.";

/** Gatekeeper / unknown-owner variants. Swapped in when ownerFirstName
 *  is unknown — the rest of the script stays the same. */
export const HORMOZI_INTRO_UNKNOWN_OWNER: ScriptSection = {
  id: "intro",
  title: "Open the call (gatekeeper)",
  goal: "Owner unknown — get to whoever handles the website. Same assumptive frame as the main intro.",
  lines: [
    "Hey — who handles the website over at {bizName}?",
    "Are they around? Quick reason for the call: I just finished a new website for them — two minutes tops.",
    "[When transferred] — {partnerFirstName} with BlueJays. I just finished a new website for {bizName} and I'm about to text it to you. You in front of a phone real quick?",
    "[Wait for yes] Cool — texting it to this number now, you'll see it in five seconds. Pull it up while we talk.",
    "[Click SEND PREVIEW LINK ↘ — fires text + email simultaneously]",
  ],
  callerNotes: [
    "★ OWNER NAME UNKNOWN — DO NOT guess a name. Ask for the role first.",
    "If gatekeeper says 'WHAT'S THIS REGARDING?' → 'I built them a new website — they haven't seen it yet. 2 minutes with whoever handles it.' Specific = trust.",
    "If gatekeeper says 'I HANDLE IT' → run the same intro on them.",
    "★ ASSUMPTIVE FRAMING. 'I just finished it' presumes the gift exists. They feel behind, not pitched.",
    "★ DON'T ASK FOR THEIR NUMBER. You just dialed it. Send to the dialed number — SEND PREVIEW LINK fires text + email at once.",
    "★ 'You in front of a phone real quick?' is a micro-yes — earns the next 60 seconds.",
    "Once they have the link in hand → advance to the Qualify tab while they pull it up.",
  ],
};

export const HORMOZI_VOICEMAIL_UNKNOWN_OWNER: ScriptSection = {
  id: "voicemail",
  title: "Leave a voicemail (no name)",
  goal: "Gift hook, no awkward 'Hey there.' Get the right person to call back.",
  lines: [
    "Hey — we just finished building a new website for {bizName}. {partnerFirstName} with BlueJays. Texting you the link right now — takes 30 seconds to look.",
    "Text back 'site' if you want someone to walk you through it and I'll get Ben — he built it — on a quick call. Either way the site's yours to see.",
  ],
  callerNotes: [
    "★ Hang up → SEND PREVIEW LINK first → SEND BOOKING LINK second. Then mark VOICEMAIL.",
    "★ No name — role-based. 'Hey there!' sounds like spam.",
    "About 1 in 4 voicemail-then-text combos get a reply. Always text after the VM.",
  ],
};

/** Replace {merge} tags with values from vars. Missing keys fall back
 *  to a safe stand-in so no line ever reads as broken. */
export function fillVars(template: string, vars: ScriptVars): string {
  const fallbacks: Record<string, string> = {
    bizName: "your business",
    firstName: "there",
    category: "service",
    city: "your area",
    url: "your site",
    partnerFirstName: "the team",
    previewUrl: "https://bluejayportfolio.com/preview",
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
    goal: "Assume the gift, drop the link to the number you already have, get them looking. The first 15 seconds is the whole game.",
    lines: [
      "Hey {firstName} — {partnerFirstName} with BlueJays. Quick reason for the call: I just finished a new website for {bizName} and I'm about to text it to you. You in front of a phone real quick?",
      "[Wait for yes] Cool — texting it to this number right now, you'll see it in five seconds. Pull it up while we talk.",
      "[Click SEND PREVIEW LINK ↘ — fires text + email simultaneously to the number/email on file]",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAME. 'I'm about to text it to you' presumes the gift is real and incoming. 'Did you have a chance' is polite-speak for 'feel free to say no' — never use it.",
      "★ DON'T ASK FOR THEIR NUMBER. You just dialed it. Asking 'what's the best number' tells them you're not actually a real partner — you're working off a list. Send to the dialed number.",
      "★ 'You in front of a phone real quick?' is a micro-yes question that gets a reflexive 'yeah' — earns the next 60 seconds.",
      "★ SEND PREVIEW LINK button on the right ↘ fires BOTH text + email at once. Don't ask for email separately — both channels go out, no extra friction.",
      "★ NEVER start with 'Hey, is this {firstName}?' — sounds like a telemarketer. Say their name with question intonation and launch.",
      "★ FM DJ voice — low and slow. Down-inflection at end of every statement except the question itself.",
      "★ Mutual connection? Lead with it: 'Hey {firstName} — talking to [name] and {bizName} came up. I just finished a new website for you — texting it now, you in front of a phone?' Warm name in sentence one triples pickup.",
      "If they say YES → drop link → Qualify (Q1: while-you-pull-it-up).",
      "If they say NO (not at phone) → 'No problem — keep going, link's sitting there when you're back at it. Got 60 seconds for one quick question?' → Qualify.",
      "If they say WHAT? / WHO? → 'BlueJays — we build websites for {category} businesses. Already finished yours, sending it now.' → continue.",
      "If they say BAD TIME → 'Totally — won't keep you. Real quick: better to call you back at 2 today or 10 tomorrow morning?' [pin a time] 'Cool — texting you the site now so you can peek before we talk. Talk then.' Mark CALLBACK with the pinned time.",
      "Once link is sent → advance to Qualify. If they're already on the site and excited → skip to Pitch.",
    ],
  },

  qualify: {
    id: "qualify",
    title: "Find the gap",
    goal: "They're loading the preview — anchor the pain with REVENUE leakage, not traffic. Numbers without pain = data; numbers with pain = leverage.",
    lines: [
      "While you pull that up — roughly how many new customer calls do you get off the current site each week? Ballpark.",
      "Got it. And out of those — how many turn into actual paying jobs? Ballpark.",
      "When's the last time someone actually worked on that site to RAISE those numbers — not just updated it, but actually MOVED the count?",
      "Yeah. So picture this — if the new site doubled what you're getting now, what would that change for you in a month?",
    ],
    callerNotes: [
      "★ GET A NUMBER. Even a guess. Numbers anchor — 'fine' doesn't.",
      "★ After they answer, PAUSE. Let the silence work. They'll say more.",
      "★ Line 2 anchors REVENUE leakage, not traffic mix. When they say 'maybe half' you can say: 'so half your website calls evaporate — that's the gap.' Pain > stats.",
      "★ Line 3 is NEPQ — surfaces pain they already feel without you naming it first. Don't rush past it.",
      "★ Line 4 is future pace — when THEY say the upside out loud, they've half-sold themselves.",
      "If website calls = 0-2/wk → 'Yeah — that's exactly what we fixed. Look at the homepage I just sent.' → Pitch.",
      "If calls are HIGH but conversion is LOW → 'So traffic is fine, the SITE is leaking. That's exactly what Ben rebuilt around.' → Pitch.",
      "If WORD OF MOUTH ONLY → 'Fair — but when someone hears about you and Googles, what do they see? That's what this changes.' → Pitch.",
      "If they DEFLECT or won't engage → 'No worries — link is on your phone already. Take a look tonight, reply if it's useful.' → TextTheLink.",
    ],
  },

  pitch: {
    id: "pitch",
    title: "Pitch the call (not the sale)",
    goal: "They're staring at the site. Direct their eye to a specific element. Magic question bridges into the close.",
    lines: [
      "Look at the homepage real quick — top right, the call button. See it? That alone is why most {category} sites under-convert. Ben built the whole thing around that one fix.",
      "[Pause — wait for 'yeah' or 'ok'] Based on what you told me, that gap costs you {X} calls a week. Ben spent real hours on this. Honest question — would it be the worst thing in the world if you gave him 15 minutes, saw what he changed and why, and decided not to use us?",
      "Right. Worst case 15 minutes. Best case the site finally pulls its weight. He's got Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ DIRECT THEIR EYE. They're literally looking at the site you sent. 'Look at the homepage, top right' = micro-yes #2 (\"yeah I see it\"). The site on their screen IS the close.",
      "★ Substitute the {category}-specific landmark in line 1 — for restaurants point to the menu/order button, for medical the appointment CTA, for contractors the request-a-quote, etc. Match what's prominent on that V2 template.",
      "★ HORMOZI MAGIC LINE in the middle of line 2. Pre-handles \"I don't want to be sold to\" before they think it. Sits BEFORE the ask, not after.",
      "★ AFTER 'decided not to use us?' — count to FOUR Mississippi in your head. Do not speak. Do not breathe loud. The first one to talk loses. 80% of yeses come in that 4-second window.",
      "★ Substitute the actual {X} number from qualify line 1 (calls/week). 'Costs you 5 calls a week' is concrete; 'costs you calls' is air.",
      "If they ask HOW MUCH → see howMuch objection. NEVER quote price during the pitch — quote during the call with Ben.",
      "If they ask WHAT'S WRONG WITH MY CURRENT SITE → 'You're looking at the answer right now. Ben walks through what he changed and why on the call. Tuesday or Thursday?'",
    ],
  },

  bookTheCall: {
    id: "bookTheCall",
    title: "Book Ben's call",
    goal: "This is the close. Get them on Ben's calendar before you hang up. You already have their phone — just send.",
    lines: [
      "Perfect. Texting you Ben's booking link right now to the same number — grab a 15-minute slot. He's got openings this week.",
      "Once you book, you'll get a calendar invite from Ben. He'll have your site pulled up and ready to walk through.",
      "One thing — what's the one question you most want Ben to answer on the call? I'll put it in his notes so he's prepped.",
    ],
    callerNotes: [
      "★ Phone number was already captured in the intro — no need to re-ask. Click SEND BOOKING LINK button on the right ↘.",
      "★ Mark outcome BOOKED BEN'S CALL — this is the win we're tracking.",
      "Line 3 is a commitment escalator. They answer it, they're invested in the call happening. Write their answer in the notes box.",
      "If they hesitate on the time → 'Would mornings work better?' Two options keeps the close moving.",
    ],
  },

  textTheLink: {
    id: "textTheLink",
    title: "Add the audit (FALLBACK)",
    goal: "Preview link already went out in the intro — this is the second touch: a personalized site audit they can read on their own time.",
    lines: [
      "On top of the site I already sent — let me also text you a 60-second audit of your CURRENT site. Read it tonight, decide if it's worth 15 minutes with Ben.",
      "Before I send it — is there one thing about the current site that's been bugging you? I'll flag it for Ben so he's prepped if you do book.",
      "Sending now. You'll see it right next to the preview link.",
    ],
    callerNotes: [
      "★ NEW PURPOSE: The preview link already went out in the intro. This adds the AUDIT (different asset) as a second touch.",
      "Use this ONLY if they won't book the call on first pass. Booking > audit-text every time.",
      "Line 2 plants a seed — they answer it, they're half-committed to the callback.",
      "Click SEND AUDIT LINK button on the right ↘ (different from SEND PREVIEW LINK — this is the personalized audit).",
      "Mark outcome AUDIT_SENT.",
    ],
  },

  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real objection, then pin a specific time.",
    lines: [
      "What's making you want to sit on it? Most people say price or timing — is that it?",
      "Got it. Tomorrow morning or Thursday afternoon — which works better for a quick callback?",
      "Either way, you'll have the audit in your hands tonight. If you decide it's not useful, just text me and I'll stop reaching out.",
    ],
    callerNotes: [
      "Line 1 is NEPQ — surfaces the real blocker before you schedule anything. Mirror their answer back.",
      "Mark outcome CALLBACK + write the specific time in the notes box.",
      "Don't push for a sale on the callback — push for the audit call first.",
    ],
  },

  voicemail: {
    id: "voicemail",
    title: "Leave a voicemail",
    goal: "Hook first — site before identity. Under 25 seconds. Drop the link in text + email immediately after.",
    lines: [
      "Hey {firstName} — {partnerFirstName} with BlueJays. Wanted to know if you got a chance to look at the new website we built for {bizName}. Sending you the link right now to your phone — takes 30 seconds.",
      "Text back 'site' and I'll get Ben — he built it — on a quick walkthrough call. Either way the site's yours.",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAMING: 'did you get a chance to look' presumes you've already sent it. Curiosity > confusion.",
      "★ HOOK FIRST. Site before your name. Curiosity beats introduction on voicemail every time.",
      "★ 'Text back site' gives them a zero-friction reply — lower bar than calling back.",
      "★ Hang up → SEND PREVIEW LINK first (text + email) → SEND BOOKING LINK second. Then mark VOICEMAIL.",
      "About 1 in 4 voicemail-then-text combos get a reply. Always text after the VM.",
      "★ Under 25 seconds. Every extra second = lower callback rate.",
    ],
  },

  objections: [
    {
      id: "busy",
      trigger: "I'm busy / bad time / not now",
      response: [
        "Makes sense — I'll keep it to 20 seconds. Would it be useful if I just texted you a free audit of your site? Read it tonight in 5 minutes. No call needed.",
        "Cool — sending it now. Have a good one.",
      ],
      callerNotes:
        "If yes → SEND AUDIT LINK + mark SENT_AUDIT. If no → mark NOT_INTERESTED politely. ★ 3-NO RULE: this is their first no — offer the text as a different angle.",
    },
    {
      id: "haveAGuy",
      trigger: "I already have a guy / web designer / nephew does it",
      response: [
        "Already have someone?",
        "[pause] Cool — when's the last time he RAISED the calls coming off your site? Not maintenance. Actually moved the number up.",
        "[wait for answer — pause four counts] Right. So if a new site DOUBLED what you're getting now, what would that change for you in 30 days?",
        "Yeah. Ben's got Tuesday at 3 or Thursday at 10 to walk you through what he built — you decide after. Worst case you've got something to show your guy.",
      ],
      callerNotes:
        "★ LINE 1 is the mirror — 3-word repeat as a question. Shut up. Let the silence work. ★ Line 2: NEPQ — surfaces the gap without insulting their guy. ★ Line 3: future pace — they say the upside out loud. ★ Line 4: two-option close, not an audit pivot. The guy isn't a wall, he's a comparison they're losing. ★ 3-NO: if they decline the call after future-pacing, fall back to TextTheLink (the audit) and exit.",
    },
    {
      id: "badExperience",
      trigger: "I've had a bad experience with a web designer / got burned before",
      response: [
        "Got burned before?",
        "Most designers take your money and disappear with a half-finished site. We do it backwards — Ben builds the whole site FIRST. You see the finished product before you pay a single dollar.",
        "Want to see what he already built for your business? Takes 30 seconds.",
      ],
      callerNotes:
        "★ STRONGEST PITCH. Mirror the pain first ('Got burned before?') so they feel heard. Then flip it — 'build first, pay after' is the exact opposite of what burned them. Lead with it hard.",
    },
    {
      id: "howMuch",
      trigger: "How much does it cost?",
      response: [
        "Less than most people guess. But here's the thing — Ben prices based on what your current site's actually losing, and I'd be doing you dirty quoting blind.",
        "He's got Tuesday at 3 or Thursday at 10. Fifteen minutes. He shows you the number AND the math. Which works?",
      ],
      callerNotes:
        "★ NEVER quote price unprompted in the pitch. Hormozi rule: price-first calls close at 5%; value-first calls close at 25%. Hold the close. ★ If they push HARD for a number after this — quote $997 + $100/yr THEN immediately pivot back to the call: 'But that's the wrong way to think about it. Ben prices on impact. Tuesday or Thursday?'",
    },
    {
      id: "cantAfford",
      trigger: "Can't afford it / too expensive",
      response: [
        "Too expensive compared to what?",
        "Most owners feel that until they see the audit — usually shows them losing $2,000–$3,000 a month from a broken site. $997 is just math at that point.",
        "Let me text you the audit free. If it shows you're not losing money, ignore us. If you say no right now, I'll never call again — but take a look first.",
      ],
      callerNotes:
        "★ Line 1 is the mirror — 'Too expensive compared to what?' Shut up. They'll answer. ★ Line 3 has the Hormozi exit offer — say it calm and confident. 'If you say no right now I'll never call again.' That line gets more yeses than anything else.",
    },
    {
      id: "thinkAboutIt",
      trigger: "I'll think about it",
      response: [
        "Of course. What part do you need to think through? Is it the price, the timing, or something about the site itself?",
        "Got it. Would it be the worst thing in the world if you took 15 minutes with Ben, learned what's broken, and decided not to use us?",
        "Right — worst case 15 minutes. Best case it changes your lead flow. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ Line 1 is NEPQ — surfaces the REAL objection. 'I'll think about it' almost always means 'I don't want to say no on the phone.' Find the real blocker first. ★ Line 2 is the magic line. ★ 3-NO: if they say no to all three angles, exit: 'Totally get it — if you ever change your mind, bluejayportfolio.com. Have a good one.'",
    },
    {
      id: "emailMe",
      trigger: "Send me an email instead",
      response: [
        "Happy to. What's the best email?",
        "I'll email you AND text you — most owners read texts faster. What's the best mobile number?",
      ],
      callerNotes:
        "Get BOTH if possible. If email only, send audit via email and mark SENT_AUDIT.",
    },
    {
      id: "notInterested",
      trigger: "Not interested / no thanks",
      response: [
        "Heard that. Quick question — is it the website thing in general, or just bad timing right now?",
        "If you say no right now, I'll never call again and we remove your info. But before you do — would it be the worst thing in the world to take 30 seconds and just see what we built?",
        "Either way — have a good one.",
      ],
      callerNotes:
        "★ Line 2 is the Hormozi exit offer. Say it calm and confident — not desperate. If BAD TIMING → mark CALLBACK with note '90 days'. If WEBSITE THING → mark NOT_INTERESTED, exit fast and friendly. ★ 3-NO: third no here — let them go immediately.",
    },
    {
      id: "howGetNumber",
      trigger: "How did you get my number?",
      response: [
        "Your business listing — same place anyone searching for {category} businesses in {city} would find you.",
        "Happy to take you off our list right now if you'd rather not hear from us.",
      ],
      callerNotes:
        "If they say TAKE ME OFF → mark DO_NOT_CALL immediately. We honor it forever.",
    },
    {
      id: "isThisSpam",
      trigger: "Is this a robocall / scam / spam?",
      response: [
        "Nope — real person. {partnerFirstName} here. We build websites for local {category} businesses and we finished one for yours.",
        "Want me to send you a free audit instead? You decide if it's useful.",
      ],
      callerNotes:
        "Slow down, sound human, use their first name. Spam-paranoid prospects relax fast when they hear a calm, confident voice. Don't over-explain.",
    },
    {
      id: "removeFromList",
      trigger: "Take me off your list / do not call",
      response: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "Mark DO_NOT_CALL — flags the prospect so no other partner can call them either. NEVER argue.",
    },
    {
      id: "justGotRedone",
      trigger: "I just had my site redone / we just got a new website",
      response: [
        "Just got it redone?",
        "We built yours before we knew that — already done. You should still see it. Even if you never use it, you'd know exactly what yours has versus what we built.",
        "Takes 30 seconds. Want the link?",
      ],
      callerNotes:
        "★ Mirror first. Then flip the frame — they're comparing two sites. That comparison often reveals gaps in theirs. Don't push if they say no a second time.",
    },
    {
      id: "tryingToSellMe",
      trigger: "Are you trying to sell me something?",
      response: [
        "Not on this call. We built {bizName} a website and I want to show it to you. That's it.",
        "If you like it and want to talk, I'll connect you with Ben. If not — you've got a free audit of your site either way. Fair?",
      ],
      callerNotes:
        "Straight answer, no hedging. Hedging confirms their suspicion. Direct = trustworthy. ★ End on 'Fair?' — gets a micro-yes and keeps the conversation open.",
    },
    {
      id: "lookAtItLater",
      trigger: "Let me just look at it later / I'll call you back after I review it",
      response: [
        "Look at it later?",
        "[pause] Totally fair — but here's the thing. You looking alone, you'll see what's there. Ben on the call, you see what's there AND what's missing — and what it's costing you every week it stays the way it is.",
        "Same 15 minutes either way. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ THE #1 ESCAPE LINE. They're staring at a free site you built, this is the polite way out. Mirror first → reframe (alone vs with the architect) → loss aversion → two-option close. ★ If they STILL deflect after this, drop to TextTheLink (audit as second-touch) and exit on a friendly 'have a good one.'",
    },
  ],
};
