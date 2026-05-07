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
    "[When transferred] — {partnerFirstName} with BlueJays. I just finished a new website for {bizName}. You get texts at this number? I just sent it.",
    "[Click SEND PREVIEW LINK ↘ — fires text + email simultaneously]",
    "[Wait a beat] You'll see it in a couple seconds — pull it up while we talk.",
  ],
  callerNotes: [
    "★ OWNER NAME UNKNOWN — DO NOT guess a name. Ask for the role first.",
    "If gatekeeper says 'WHAT'S THIS REGARDING?' → 'I built them a new website — they haven't seen it yet. 2 minutes with whoever handles it.' Specific = trust.",
    "If gatekeeper says 'I HANDLE IT' → run the same intro on them.",
    "★ ASSUMPTIVE FRAMING. 'I just finished it' presumes the gift exists. They feel behind, not pitched.",
    "★ DON'T ASK FOR THEIR NUMBER. You just dialed it. Send to the dialed number — SEND PREVIEW LINK fires text + email at once.",
    "★ 'You get texts at this number?' is a micro-yes that earns the next 60 seconds — and the SEND PREVIEW LINK has already fired, so the proof is mid-air.",
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
      "Hey {firstName} — {partnerFirstName} with BlueJays. Quick reason for the call: I just finished a new website for {bizName}. You get texts at this number? I just sent it.",
      "[Click SEND PREVIEW LINK ↘ — fires text + email simultaneously to the number/email on file]",
      "[Wait a beat] You'll see it pop up in a couple seconds — pull it up while we talk.",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAME. 'I just sent it' (past tense, already done) is stronger than 'I'm about to text it' (future, asks permission). The gift is already in motion — they feel behind, not pitched. 'Did you have a chance' is polite-speak for 'feel free to say no' — never use it.",
      "★ DON'T ASK FOR THEIR NUMBER. You just dialed it. Asking 'what's the best number' tells them you're not actually a real partner — you're working off a list. Send to the dialed number.",
      "★ 'You get texts at this number?' is a micro-yes that earns the next 60 seconds — and unlike 'you in front of a phone', it doesn't imply they need to stop what they're doing. Reflexive 'yeah' either way.",
      "★ FIRE SEND PREVIEW LINK before they answer the question. If you wait for permission, you've already lost the assumptive frame. The text arriving while you're talking IS the proof.",
      "★ SEND PREVIEW LINK button on the right ↘ fires BOTH text + email at once. Don't ask for email separately — both channels go out, no extra friction.",
      "★ NEVER start with 'Hey, is this {firstName}?' — sounds like a telemarketer. Say their name with question intonation and launch.",
      "★ FM DJ voice — low and slow. Down-inflection at end of every statement except the question itself.",
      "★ Mutual connection? Lead with it: 'Hey {firstName} — talking to [name] and {bizName} came up. I just finished a new website for you — you get texts here? I just sent it.' Warm name in sentence one triples pickup.",
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

/* ═════════════════════════════════════════════════════════════════════
 * MADIE — APPOINTMENT-SETTER SCRIPT
 *
 * Madie is BlueJays' first sales partner (joined 2026-05). She's a
 * SETTER — she runs follow-up calls on prospects who already received
 * a website preview, then BOOKS them on Ben's calendar. Ben does the
 * close on the appointment, walking them through:
 *   1. The polished website (vs the rough preview Madie introduced)
 *   2. The backend AI Marketing System mock-up
 * ...attempting to close on EITHER OR BOTH on that call.
 *
 * Compensation:
 *   · $200 per WEBSITE Ben closes ($997)
 *   · $1,000 per BACKEND Ben closes ($9,700 AI Marketing System)
 *   · Best meetings book BOTH — Madie clears $1,200 if Ben dual-closes.
 *
 * Capacity scarcity (real, baked into close):
 *   · Ben builds 30 sites/month max
 *   · Ben builds 10 backend systems/month max
 *   · "We still have a few spots left" framing — true, not fake.
 *
 * Permission slip on the preview:
 *   The preview Madie sent is intentionally rough. The script names
 *   this BEFORE the prospect can — "this is just a preview, Ben will
 *   create a more polished version for your call with him, and he'll
 *   present it then alongside your backend mock-up for how to
 *   supercharge your lead gen."
 *
 * Voice: same Hormozi rules as Ben's script (7th-grade, blunt,
 * friendly, no jargon, smile before dial, FM-DJ tone).
 * ═════════════════════════════════════════════════════════════════════ */

/** Madie-flow goal hierarchy. Higher = better close — feeds her
 *  commission scoreboard. */
export type MadieOutcome =
  | "BOTH_BOOKED" // Ben booked for site + backend reveal — best win
  | "BACKEND_BOOKED" // Ben booked for backend close ($1k commission)
  | "WEBSITE_BOOKED" // Ben booked for website close ($200 commission)
  | "AUDIT_SENT" // Couldn't book — sent the audit as a parachute
  | "CALLBACK" // Pinned a specific time
  | "VOICEMAIL"
  | "NO_ANSWER"
  | "DO_NOT_CALL";

/** Madie-shaped script. Different section set than Ben's cold-call
 *  flow — she has a discovery step + two parallel pitches (website
 *  vs backend) + a scarcity close. */
export type MadieCallScript = {
  opener: ScriptSection;
  identityFrame: ScriptSection;
  previewFrame: ScriptSection;
  discovery: ScriptSection;
  websitePitch: ScriptSection;
  agencyReplacementHook: ScriptSection;
  backendPivot: ScriptSection;
  backendPitch: ScriptSection;
  scarcityClose: ScriptSection;
  bookTheCall: ScriptSection;
  textTheLink: ScriptSection;
  callbackClose: ScriptSection;
  voicemail: ScriptSection;
  objections: ObjectionBranch[];
};

/** Pre-call coaching for Madie. Parallel to HORMOZI_CALL_TIPS but
 *  centered on the SETTER role + the dual-product framing. */
export const MADIE_CALL_TIPS: CallTip[] = [
  {
    id: "youAreNotClosing",
    emoji: "🎯",
    title: "★ MUST: You're NOT closing — Ben is.",
    body: "Your job is to BOOK BEN. The hardest mistake new setters make is trying to close on the call. Stop. The pitch is just enough to earn 15 minutes. Every word past 'Tuesday or Thursday' is risk.",
  },
  {
    id: "smile",
    emoji: "😊",
    title: "★ MUST: Smile before you dial",
    body: "Your tone changes the second you smile. They can't see you but they feel it. First 5 words decide if they hang up.",
  },
  {
    id: "preview-is-rough",
    emoji: "🪵",
    title: "★ Name the rough preview FIRST",
    body: "Before they say 'it's a little rough' you say it: 'This is just a preview — Ben polishes the real version for your call.' Pre-handles the #1 objection on a website they just received.",
  },
  {
    id: "two-products",
    emoji: "🏗️",
    title: "★ Always offer the backend escape",
    body: "If they're cool on the website but DO pay an agency or run ads → that's not a no, that's a high-ticket signal. Pivot to the backend ($9,700 AI System) immediately. $1k commission > $200.",
  },
  {
    id: "scarcity",
    emoji: "⏰",
    title: "Capacity scarcity is REAL",
    body: "Ben caps at 30 sites + 10 backends a month. Drop it once in the close: 'We still have a few spots left this month.' True, not fake. Don't say it twice — feels desperate.",
  },
  {
    id: "agency-killer",
    emoji: "💸",
    title: "Agency is a kill word",
    body: "If they say 'we work with an agency' or 'we have someone running ads' → instant high-ticket pivot. The frame is 'we build custom software so you can CUT OUT your agency.' Their monthly retainer beats our one-time price in 6-8 months.",
  },
  {
    id: "exit-offer",
    emoji: "🚪",
    title: "Always offer the exit",
    body: "'If you say no right now I'll never call again.' They relax instantly. Most yeses come 30 seconds AFTER you give them permission to say no.",
  },
  {
    id: "did-you-get-it",
    emoji: "📲",
    title: "Open WITHOUT introducing yourself",
    body: "First line is 'Hey it's Madie — did you guys get that website we made for you?' NOT 'Hi, my name is Madie from BlueJays...' The assumption (we made you a website) earns the next 30 seconds.",
  },
  {
    id: "shut-up",
    emoji: "🤐",
    title: "After the close question — SHUT UP",
    body: "'Tuesday at 3 or Thursday at 10 — which works?' Then count to FOUR Mississippi. The first one to talk loses. 80% of yeses come in that 4-second silence.",
  },
  {
    id: "two-pitches-one-call",
    emoji: "🎁",
    title: "Both products on the SAME Ben call",
    body: "When you book Ben, he shows them BOTH the polished site AND the backend mock-up. They decide on either or both on that one call. You don't book two separate Ben meetings — you book one with both reveals.",
  },
];

/** Mantra shown above the workspace for Madie. Different drumbeat
 *  than Ben's "stack the nos" — she's optimizing for BOOKINGS. */
export const MADIE_MANTRA =
  "Book Ben. Don't close. Book Ben. The reveal is his job — yours is the 15 minutes.";

export const MADIE_CALL_SCRIPT: MadieCallScript = {
  opener: {
    id: "opener",
    title: "Open the call",
    goal: "Assume the gift. They already received the preview — confirm they have it, get them looking. NEVER lead with introduction.",
    lines: [
      "Hey {firstName} — it's Madie. Did you guys get that website we made for you?",
      "[If YES they have it] Awesome — pull it up real quick while we talk, takes 10 seconds.",
      "[If NO / NOT SURE] No problem — just texted + emailed it again, you'll see it pop up in a few seconds. Pull it up while we talk.",
      "[Click SEND PREVIEW LINK ↘ even if they say yes — confirms text + email both fired]",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAME from word one. 'Did you guys get that website we made for you?' presumes the gift exists. They feel BEHIND, not pitched.",
      "★ DO NOT introduce yourself first. 'Hi, my name is Madie from BlueJays' = telemarketer. 'Hey {firstName} it's Madie' = old friend.",
      "★ If they say 'who is this?' → 'Madie, the website I just sent you — pull it up' (still assumptive, still moving).",
      "★ FM DJ voice — low and slow. Down-inflection on every statement except the question.",
      "After they confirm receipt → IDENTITY FRAME tab.",
      "If they're confused/hostile → IDENTITY FRAME (the partner-with-Ben line clears it up fast).",
      "If they say BAD TIME → 'Totally — won't keep you. Real quick: better to call you back at 2 today or 10 tomorrow morning?' [pin a time] Mark CALLBACK.",
    ],
  },

  identityFrame: {
    id: "identityFrame",
    title: "Set the identity",
    goal: "One sentence that establishes who Madie is + the try-before-you-buy promise. Disarms 'is this a sales call' before they ask.",
    lines: [
      "Real quick — I'm Madie. I run a business with a web developer named Ben. He custom-makes websites you can try before you buy. You only move forward if you love it.",
      "[Wait for acknowledgment — 'ok', 'gotcha', etc.]",
    ],
    callerNotes: [
      "★ 'I run a business WITH Ben' = partner, not employee. Frames you as a peer. Different energy than 'I'm calling FROM BlueJays'.",
      "★ 'Try before you buy' is the keystone — it's the answer to every 'what if I don't like it' before they ask. Say it cleanly, like a fact.",
      "★ 'You only move forward if you love it' = the exit handed to them up front. They relax.",
      "★ NO PRICE in this section. Don't quote anything yet — pricing comes after they've SEEN the site.",
      "Once they acknowledge → PREVIEW FRAME tab.",
    ],
  },

  previewFrame: {
    id: "previewFrame",
    title: "Frame the rough preview",
    goal: "Pre-handle the #1 objection — 'it looks rough' — before they say it. Promise the polished version on Ben's call + tease the backend reveal.",
    lines: [
      "Before you dig in — what you're looking at is just a PREVIEW to give you the idea. Ben will create the polished version for your call with him.",
      "And on that same call, he'll present the polished site alongside a BACKEND MOCK-UP — basically a custom AI marketing system showing how he'd supercharge your lead generation. Two reveals on one 15-minute call.",
      "[Pause, let them react]",
    ],
    callerNotes: [
      "★ THIS IS THE KEYSTONE PERMISSION SLIP. Without this they'll fixate on 'the colors are wrong' / 'the photo isn't right' / 'it's missing X'. With this, every imperfection becomes 'oh that's the preview, Ben polishes it.'",
      "★ Line 2 plants the BACKEND REVEAL. Even prospects who only want a site become curious about the backend. This is how Madie books $1,200 dual-closes — she promises both reveals from the start.",
      "★ Don't oversell the backend yet — just name it. 'Custom AI marketing system' is the bait, the pitch comes later if they ask.",
      "If they ask 'WHAT'S A BACKEND' → 'It's a system that automatically follows up with your leads — texts, emails, missed-call replies. Ben shows the mock-up on the call. Like seeing the engine before you buy the car.' → DISCOVERY tab.",
      "If they ask 'HOW MUCH' → see howMuch objection (DO NOT quote yet).",
      "Once they react / nod → DISCOVERY tab.",
    ],
  },

  discovery: {
    id: "discovery",
    title: "Two questions (find the path)",
    goal: "Discover whether they're a WEBSITE close or a BACKEND close. Two questions, no third — they reveal the path themselves.",
    lines: [
      "Two quick questions before I let you go — just so I know what to tell Ben to focus on.",
      "First — are you happy with your current website?",
      "[Pause four counts. Listen.]",
      "Second — do you currently run ads, or work with a marketing agency?",
      "[Pause four counts. Listen.]",
    ],
    callerNotes: [
      "★ THESE TWO QUESTIONS ARE THE WHOLE GAME. Their answers route you:",
      "  → 'NOT happy with site' + 'NO agency'  = WEBSITE PITCH path ($997, $200 comm)",
      "  → 'NOT happy with site' + 'YES agency' = WEBSITE + BACKEND PITCH (dual close, $1,200 comm)",
      "  → 'happy with site'     + 'NO agency'  = soft path — pivot to BACKEND ($9,700, $1k comm). Frame: 'cool, then maybe the backend is the conversation.'",
      "  → 'happy with site'     + 'YES agency' = HARD BACKEND pivot ($9,700). Frame: 'sounds like the website's not the bottleneck — let's talk about the agency replacement.'",
      "★ AFTER EACH QUESTION — count to FOUR. Pause. Let them fill silence. Their unscripted answer is gold.",
      "★ NEVER ask a third question. The setter who asks the third question loses control of the call.",
      "If they answer 'YES AGENCY' → BACKEND PIVOT tab (this is the high-ticket signal).",
      "If they answer 'YES WEBSITE IS FINE' but NO agency → BACKEND PIVOT tab (soft).",
      "Otherwise → WEBSITE PITCH tab.",
    ],
  },

  websitePitch: {
    id: "websitePitch",
    title: "Pitch the website call",
    goal: "They said the current site isn't great. Direct their eye to the new preview, anchor the gap, book Ben.",
    lines: [
      "Yeah — so look at the preview real quick. Top of the homepage, the call button. See it? That alone is what most {category} sites are missing.",
      "Ben built the whole new site around fixes like that. The polished version — colors, photos, your real content — comes together on the call with him.",
      "Honest question — would it be the worst thing in the world to spend 15 minutes with Ben, see what he changed and why, AND see the backend mock-up too — and then decide?",
      "[Pause four counts]",
      "Right. Worst case 15 minutes. He's got Tuesday at 3 or Thursday at 10 — which works?",
    ],
    callerNotes: [
      "★ DIRECT THE EYE — same play as Ben's script. The preview is on their screen, name a specific element. Substitute the {category}-relevant landmark (call button / menu / quote form / appointment CTA).",
      "★ HORMOZI MAGIC LINE in line 3. 'Worst thing in the world' pre-handles 'I don't want to be sold to' before they think it.",
      "★ Notice line 3 ALWAYS includes 'AND see the backend mock-up too' — Madie ALWAYS books for both reveals, even on a website-pitch path. Ben decides on the call which one to push.",
      "★ AFTER 'which works?' — FOUR Mississippi. Do not breathe loud. The first one to talk loses.",
      "If they say HOW MUCH → howMuch objection (don't quote during the pitch).",
      "If they YES on a time → BOOK THE CALL tab.",
      "If they hesitate → BACKEND PIVOT tab (try the backend angle as the second hook).",
    ],
  },

  agencyReplacementHook: {
    id: "agencyReplacementHook",
    title: "Agency-replacement hook (high-margin categories)",
    goal: "Two short qualifying questions to drop in mid-discovery when the prospect's category is one that typically PAYS for a marketing agency (chiropractic, dental, law-firm, real-estate, accounting, insurance, medical, fitness, physical-therapy, interior-design, photography). Both questions are kill-shots — if they say YES to either, pivot straight to backendPitch ($9,700 + $500-1k/mo, $1k commission).",
    lines: [
      "Have you ever thought about replacing your marketing agency permanently with AI?",
      "[pause four counts]",
      "Getting rid of that monthly payment?",
    ],
    callerNotes: [
      "★ TWO QUESTIONS, FOUR-COUNT PAUSE BETWEEN. Don't run them together. The first is a thought-experiment — opens the door. The second is the gut-punch — names the pain (the bill that arrives every single month).",
      "★ ONLY use this hook on categories that actually pay agencies — see the goal field. For trades (plumber, electrician, locksmith, towing) the hook falls flat because they don't have an agency to replace.",
      "★ If they say 'yes' / 'I've thought about it' / 'tell me more' → straight to backendPitch tab.",
      "★ If they say 'we don't have an agency' → fall through to websitePitch + the standard discovery flow. They're a $997 lead, not a $9,700 lead.",
      "★ If they say 'no, I love my agency' → don't push. 'Cool, just had to ask. Let's keep going.' Move on. Hard-pushing here burns the call.",
    ],
  },

  backendPivot: {
    id: "backendPivot",
    title: "Pivot to the backend (high-ticket)",
    goal: "Website didn't grab them OR they signaled 'we work with an agency'. Pivot to the AI System pitch on the SAME call. This is where $1k commissions live.",
    lines: [
      "Honestly — sounds like the website might not be the bottleneck for you. Cool — let me tell you about the OTHER thing Ben does, because I think it's a bigger fit.",
      "Most businesses paying an agency are spending $2,000 to $5,000 a MONTH on lead generation, ads, follow-up. We build a custom AI marketing system that does ALL of that — automated text-back when calls miss, lead follow-up sequences, a dashboard you can see your whole pipeline on.",
      "$9,700 to build it. Plus the AI tools run about $500 to $1,000 a month — that's Twilio, SendGrid, Claude, ad spend — but those bills go to the vendors directly, not to us. We're NOT a retainer agency. Versus what you're paying $2-5k/mo for, you're cutting your monthly cost by half or more, AND you own the whole system.",
      "[Pause]",
      "Ben can show you the mock-up of what yours would look like on the same 15-minute call. He'll have the website AND the backend ready — you decide which makes sense. Worst case 15 minutes. Tuesday at 3 or Thursday at 10?",
    ],
    callerNotes: [
      "★ LINE 1 IS THE PIVOT — 'sounds like the website might not be the bottleneck' validates their answer + opens the door to the bigger conversation. Don't argue the website. Move on.",
      "★ THE FRAME IS AGENCY-REPLACEMENT, not 'add-on'. If they pay an agency, the AI System is what they BUY INSTEAD of the agency, not in addition. That's the whole pitch.",
      "★ Line 3 is the only place you quote price unprompted. $9,700 + $500-1,000/mo IS the honest number. The trust move is naming the recurring BEFORE they ask — and immediately separating it from agency retainer (vendor bills, not BlueJays). Frame against agency monthly: cutting their bill in half + ownership.",
      "★ KEY: the close is STILL Ben's 15-minute call with BOTH reveals. Madie never closes the $9,700 — she books Ben.",
      "★ AFTER 'which works?' — four counts of silence. Let them speak first.",
      "If they say YES → BOOK THE CALL tab. Mark BACKEND_BOOKED in outcome.",
      "If they want BOTH details → 'Ben walks both on the call. You just need to pick a time.' → BOOK THE CALL.",
      "If they hesitate hard → SCARCITY CLOSE tab.",
    ],
  },

  backendPitch: {
    id: "backendPitch",
    title: "Backend pitch (lead-with-backend, no website angle)",
    goal: "Used when the discovery answers were 'happy with website + working with an agency'. Skip the website pitch entirely, lead with backend.",
    lines: [
      "OK perfect — so the website isn't the issue. The conversation that probably matters more is the agency one.",
      "Quick question — what are you paying them a month, ballpark?",
      "[Listen. Don't talk over.]",
      "Right. So here's what we'd build for you. Custom AI marketing system — automated text-back on every missed call (real number, real conversation), drip campaigns for every lead that comes in, a dashboard you can see every conversation + every conversion on. $9,700 build, then the AI tools run about $500 to $1,000 a month — Twilio, SendGrid, Claude, ad spend — paid straight to the vendors, not to us. We're NOT a retainer agency.",
      "Versus your $2-5k/mo agency bill, you're cutting your monthly cost roughly in half AND you own the system. After the build pays for itself in 6 to 8 months, every month after that is pure savings.",
      "[Pause]",
      "Ben can walk through the mock-up of what yours specifically would look like — 15 minutes. He'll have the website AND the backend ready. Tuesday at 3 or Thursday at 10?",
    ],
    callerNotes: [
      "★ LINE 2 — get a number. 'Ballpark' makes it easy. Their answer becomes ammo for the break-even framing in line 5.",
      "★ NEVER skip line 2. The number is the whole frame. Without it, $9,700 + $500-1k/mo sounds expensive. With it ('you said $3k/mo'), the BlueJays setup is roughly half their current burn AND they own it.",
      "★ Line 4 names the FOUR pillars (text-back, drip, dashboard, ownership). Don't list more — four is the brain's chunking limit.",
      "★ KEY: still booking Ben for BOTH reveals. Even if they only want backend, the polished website mock-up is in Ben's pocket — sometimes the backend conversation surfaces a website opportunity.",
      "If they say AGENCY IS LOCKED IN → 'Got it — when's the contract up?' Pin that as a callback. Mark CALLBACK.",
      "If they YES → BOOK THE CALL.",
      "If price-shock → 'Yeah, big number. But check the math against $3k/mo for forever vs $9,700 once. Ben walks the comparison on the call.' → SCARCITY CLOSE.",
    ],
  },

  scarcityClose: {
    id: "scarcityClose",
    title: "Capacity scarcity (use sparingly)",
    goal: "Real scarcity, not fake. Ben caps at 30 sites + 10 backends a month. Drop it ONCE if they're hesitating. Then go back to the close.",
    lines: [
      "One thing — Ben does 30 sites a month max, and only 10 of these backend systems. We still have a few spots left this month.",
      "I'd rather book you in early than have you wait. Tuesday at 3 or Thursday at 10?",
    ],
    callerNotes: [
      "★ REAL SCARCITY — not fake. The cap exists because Ben builds these himself. Don't oversell the urgency, just state the fact.",
      "★ ONE TIME ONLY. If you say 'spots left' twice, it sounds desperate. Once = confidence.",
      "★ This goes RIGHT BEFORE the bookTheCall close. Use it ONLY if they're sitting on the fence after the website / backend pitch.",
      "★ AFTER the line — pause. Don't fill the silence with more pitch. The number does the work.",
    ],
  },

  bookTheCall: {
    id: "bookTheCall",
    title: "Book Ben's call (the win)",
    goal: "This is the only thing that matters. Get them on Ben's calendar before you hang up. Phone is already in hand — just send.",
    lines: [
      "Perfect. Texting you Ben's booking link right now to the same number — grab a 15-minute slot. He's got openings this week.",
      "Once you book, you'll get a calendar invite from Ben. He'll have your polished website AND backend mock-up pulled up and ready to walk through.",
      "Last thing — what's the ONE question you want Ben to answer on the call? I'll put it in his notes so he's prepped.",
    ],
    callerNotes: [
      "★ Phone was captured in opener. SEND BOOKING LINK ↘ button on the right.",
      "★ Mark outcome — pick the highest one that applies:",
      "  · BOTH_BOOKED — discovery surfaced agency + unhappy website (most valuable, $1.2k comm)",
      "  · BACKEND_BOOKED — discovery routed to backend pivot (high-ticket, $1k comm)",
      "  · WEBSITE_BOOKED — discovery routed to website pitch only ($200 comm)",
      "★ Line 3 commitment escalator. Their answer = invested in the call happening. Write it in the notes box for Ben.",
      "If they hesitate on time → 'Mornings or afternoons better?' Two options keeps the close moving.",
      "If they push for it 'later this week' → 'Friday morning or Monday afternoon?' Specific windows close better than vague.",
    ],
  },

  textTheLink: {
    id: "textTheLink",
    title: "Send the audit (FALLBACK)",
    goal: "They wouldn't book live. Send the personalized audit as a parachute — second touch they'll read on their own time.",
    lines: [
      "On top of the preview I sent — let me also text you a 60-second audit of your CURRENT site. Read it tonight, decide if it's worth 15 minutes with Ben.",
      "Before I send it — is there one thing about your current setup that's been bugging you? I'll flag it for Ben.",
      "Sending now. You'll see it right next to the preview link.",
    ],
    callerNotes: [
      "★ Use ONLY if they won't book live. Booking > audit-send every time.",
      "★ Click SEND AUDIT LINK button on the right ↘ (different from SEND PREVIEW LINK).",
      "★ Mark outcome AUDIT_SENT.",
      "Line 2 plants a seed → they answer it, half-committed to the callback.",
    ],
  },

  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — surface the real objection, then pin a specific time.",
    lines: [
      "What's making you want to sit on it? Most people say price or timing — is that it?",
      "Got it. Tomorrow morning or Thursday afternoon — which works for a quick callback?",
      "Either way the audit's in your hands tonight. If you decide it's not useful, just text me and I'll stop reaching out.",
    ],
    callerNotes: [
      "Line 1 is NEPQ — surfaces the real blocker before scheduling.",
      "Mark CALLBACK + write the specific time in notes.",
      "Don't push for the sale on the callback — push for Ben's audit call first.",
    ],
  },

  voicemail: {
    id: "voicemail",
    title: "Leave a voicemail",
    goal: "Hook first — 'website we made for you' before identity. Under 25 seconds. Drop the link in text + email immediately after.",
    lines: [
      "Hey {firstName} — this is Madie. Wanted to know if you got a chance to look at the website we made for {bizName}. Sending you the link right now to your phone — takes 30 seconds.",
      "Text back 'site' and I'll get Ben — he built it — on a quick walkthrough call. He'll have the polished version AND a backend mock-up ready. Either way the site's yours.",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAMING: 'did you get a chance to look at the website we made' presumes already sent.",
      "★ HOOK FIRST. 'Website' before 'Madie' on voicemail every time.",
      "★ 'Text back site' — zero-friction reply, lower bar than calling back.",
      "★ Hang up → SEND PREVIEW LINK first → SEND BOOKING LINK second. Mark VOICEMAIL.",
      "★ Under 25 seconds. Every extra second = lower callback rate.",
    ],
  },

  objections: [
    {
      id: "alreadyHaveSite",
      trigger: "I already have a website / I just had one done / mine works fine",
      response: [
        "Already have one?",
        "[pause four counts] Cool — but here's the thing. We didn't know that and we already built yours. You should still see it. Even if you never use it, you'd know exactly what yours has versus what we made.",
        "AND — here's the part that matters more — Ben can show you the BACKEND mock-up on the same call. The piece that handles your leads automatically. Most owners with a great site are still leaking leads on the back end. 15 minutes. Tuesday or Thursday?",
      ],
      callerNotes:
        "★ Mirror first. THEN flip to backend — if their site is fine, the leak is somewhere else. The backend pitch lands hardest on owners who like their website. Use this every time.",
    },
    {
      id: "haveAnAgency",
      trigger: "I already work with an agency / we have someone running our marketing",
      response: [
        "You work with an agency?",
        "[pause] What are they running for you, ballpark — ads, SEO, leads?",
        "[listen. Get specifics.]",
        "Right. Quick question — what would it take for you to fire them and own that whole stack yourself for one fixed cost?",
        "[pause four counts]",
        "That's exactly what Ben's backend system is. Custom-built to do what your agency does — but YOU own it. $9,700 to build, then about $500-1,000/mo for the AI infrastructure — but that's Twilio, SendGrid, Claude, ads — paid to the vendors, NOT a retainer to us. Versus what you're paying your agency, you're cutting your monthly cost in half and you own the whole stack. Ben walks the mock-up on a 15-minute call. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ THE HIGH-TICKET KILL SHOT. Mirror → discover what they're paying for → reframe as fire-the-agency. ★ Don't insult their agency — most owners already feel ripped off, they need permission, not a takedown. ★ This is a $1k commission objection. Lean in.",
    },
    {
      id: "howMuch",
      trigger: "How much does it cost?",
      response: [
        "Depends what we're solving — Ben prices based on what your current setup is leaking, and I'd be doing you dirty quoting blind.",
        "Two ranges so you're not shopping in the dark — site is around a thousand bucks one-time, the backend system is around ten thousand to build plus five hundred to a thousand a month for the AI tools. Big spread because they solve different problems.",
        "Ben walks the math on the call — 15 minutes. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ DON'T price-quote in the pitch. Hormozi rule: price-first calls close at 5%; value-first calls close at 25%. ★ When you DO quote (line 2), give the spread $997 / $9,700 + $500-1k/mo — anchors high, makes the website feel cheap. Always say the recurring upfront — surprise pricing later kills trust. Then immediately re-close.",
    },
    {
      id: "previewIsRough",
      trigger: "It looks rough / unfinished / not what I expected",
      response: [
        "Yep — that's exactly what I told you up top. The preview's intentionally rough. It's a sketch, not the finished piece.",
        "Ben does the polished version FOR your call with him. Your real photos, your real colors, your real content. The preview just exists so you can picture the structure before he invests the polish hours.",
        "Want to see what the polished version looks like? That's the call. 15 minutes. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ NEVER apologize. The rough preview is a feature, not a bug — it's why Ben can offer 'try before you buy'. Reframe as INTENTIONAL.",
    },
    {
      id: "tooExpensive",
      trigger: "Too expensive / can't afford it",
      response: [
        "Compared to what?",
        "[pause four counts]",
        "Most owners feel that until they see the audit. Site is a thousand bucks once. The backend is ten thousand to build plus five hundred to a thousand a month for the AI tools — versus an agency at three thousand a month, you're cutting your monthly cost in half AND you own the system.",
        "Let me text you the audit free. If it doesn't show you're losing more than the price tag, ignore us. If you say no right now, I'll never call again — but take a look first.",
      ],
      callerNotes:
        "★ 'Compared to what?' is the mirror. Shut up. ★ The Hormozi exit offer at the end ('say no right now and I'll never call again') is the highest-converting line in the script. Calm and confident, not desperate.",
    },
    {
      id: "thinkAboutIt",
      trigger: "I'll think about it",
      response: [
        "Of course. What part — the website piece, the backend piece, or both?",
        "[mirror their answer]",
        "Got it. Honest question — would it be the worst thing in the world to take 15 minutes with Ben, see both options walked through, and decide AFTER?",
        "[pause four]",
        "Right. Worst case 15 minutes. Best case the leak finally closes. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ 'I'll think about it' = 'I don't want to say no on the phone'. The discovery question (which part) re-engages — they'll commit to one.",
    },
    {
      id: "busy",
      trigger: "I'm busy / bad time",
      response: [
        "Makes sense — keep going. Real quick: better to call you back at 2 today or 10 tomorrow morning?",
        "[pin a time]",
        "Cool — texting you the site link now so you can look between things. Talk then.",
      ],
      callerNotes: "Pin the time, hang up fast, mark CALLBACK with the specific time in notes.",
    },
    {
      id: "notInterested",
      trigger: "Not interested",
      response: [
        "Heard that. Quick question — is it the website thing in general, or is it the timing?",
        "If you say no right now, I'll never call again. But before you do — would it be the worst thing to take 30 seconds and see the preview AND hear how the backend would replace what your agency's doing?",
        "Either way, have a good one.",
      ],
      callerNotes:
        "★ The Hormozi exit offer. Calm, confident. ★ If TIMING → callback in 90 days. If GENERAL → mark NOT_INTERESTED, exit warm.",
    },
    {
      id: "isThisSpam",
      trigger: "Is this a robocall / spam / scam?",
      response: [
        "Real person — Madie here. I run a business with a web developer named Ben. We built {bizName} a website preview and I'm calling to walk you through it.",
        "Want me to text you the link instead? You decide if it's worth a closer look.",
      ],
      callerNotes: "Slow voice. Use first name. Don't over-explain — that confirms the suspicion.",
    },
    {
      id: "removeFromList",
      trigger: "Take me off your list / do not call",
      response: [
        "Done. Removed right now. You won't hear from me again. Sorry to bother you.",
      ],
      callerNotes: "Mark DO_NOT_CALL. Never argue. Never re-pitch.",
    },
    {
      id: "letMeLookAtItLater",
      trigger: "Let me look at it later / I'll call you back",
      response: [
        "Look at it later?",
        "[pause] Totally fair — but here's the thing. You looking alone, you'll see what's there. Ben on the call, you see what's there AND what's missing — what it's costing you AND what the backend would replace.",
        "Same 15 minutes either way. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ #1 escape line. Same play as Ben's script — mirror, reframe (alone vs with the architect), two-option close. If they STILL deflect → drop to TextTheLink and exit warm.",
    },
  ],
};

