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
  goal: "Owner name unknown — ask for who handles the website. Get to the decision-maker fast.",
  lines: [
    "Hey — who handles the website over at {bizName}?",
    "Any chance they're around? Got one quick thing about the site that's probably costing some calls. I'll keep it under two minutes.",
    "[When transferred] — {firstName}? {partnerFirstName} with BlueJays. We just finished building {bizName} a new website — want to text you the link so you can see it. What's the best number?",
    "[If curious] Yeah — we build the whole thing first. You see the finished site before anything else. Takes 30 seconds to look. Fair?",
  ],
  callerNotes: [
    "★ OWNER NAME UNKNOWN — DO NOT guess a name. Ask for the role.",
    "If gatekeeper says 'WHAT'S THIS REGARDING?' → 'I noticed something on the website that's probably costing them some customers — need 2 minutes with whoever handles it.' Specific = trust.",
    "If gatekeeper says 'I HANDLE IT' → run the same intro on them.",
    "Once on with the decision-maker, write their name in the notes box.",
    "Once they say YES → advance to the Qualify tab.",
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
    goal: "Pattern interrupt — lead with the gift, not a question. Earn the next 30 seconds.",
    lines: [
      "Hey {firstName} — {partnerFirstName} with BlueJays. We finished building {bizName} a new website. Want to send you the link?",
      "[If curious] Yeah — we build the whole thing first. You see the finished site before you owe anyone a dollar. What's the best number to text?",
      "[If skeptical] Totally get it. We built your site, your services, your contact info — all done. Takes 30 seconds to look. What's the best number?",
    ],
    callerNotes: [
      "★ NEVER start with 'Hey, is this {firstName}?' — sounds like a telemarketer. Say their name and launch.",
      "★ LEAD WITH THE SITE. 'We built you something' = curiosity. 'I noticed problems' = defenses up.",
      "★ No 'not asking for anything' or 'I just' — those are defensive. State the gift confidently.",
      "★ FM DJ voice — low and slow. Down-inflection at the end of every statement.",
      "★ Mutual connection? Lead with it: 'I was talking to [name] and {bizName} came up.' Warm name in sentence one triples pickup.",
      "If they say BAD TIME → jump to objection: 'busy'.",
      "If they say WHO ARE YOU → 'BlueJays — we build websites for {category} businesses. Already finished yours. Want the link?'",
      "Once they're in → advance to Qualify. If they're clearly ready → skip straight to Book.",
    ],
  },

  qualify: {
    id: "qualify",
    title: "Find the gap",
    goal: "While they pull up the preview, surface the pain with their own numbers.",
    lines: [
      "While you pull that up — roughly how many new customer calls do you get off the current site each week? Just a ballpark.",
      "Got it. How many of those find you online versus word of mouth or referrals?",
      "When's the last time someone actually worked on that site to RAISE those numbers — not just updated it, but actually improved the leads coming off it?",
      "Yeah. Imagine if that number doubled — what would that change for you in a month?",
    ],
    callerNotes: [
      "GET A NUMBER. Even a guess. Numbers anchor — 'fine' doesn't.",
      "★ After they answer, pause. Let the silence work. They'll say more.",
      "★ Line 3 is NEPQ — surfaces pain they already feel without you naming it first. Don't rush past it.",
      "★ Line 4 is future pace — when THEY say the upside out loud, they've half-sold themselves.",
      "If website calls = 0-2/wk → 'Yeah — that's exactly what we fixed. Look at the homepage.' → Pitch.",
      "If calls are HIGH → 'Solid. Worth seeing what we changed anyway — small upgrades on a working site = bigger gains.' → Pitch.",
      "If WORD OF MOUTH ONLY → 'Fair — but when someone hears about you and Googles, what do they see? That's what this changes.' → Pitch.",
      "If they DEFLECT → 'Let me just text the link. Look at it tonight, ignore it if it's not useful.' → TextTheLink.",
    ],
  },

  pitch: {
    id: "pitch",
    title: "Pitch the call (not the sale)",
    goal: "They've seen the site. Close on 15 minutes with Ben — one idea per line.",
    lines: [
      "Based on what you told me — Ben built the site to fix exactly that gap. He'd love 15 minutes to walk you through what he changed and why it matters.",
      "The walkthrough is free. Even if you never use us, you'd know exactly what's broken and what to fix. No strings.",
      "Would it be the worst thing in the world if you took 15 minutes, saw the full build, and decided not to move forward?",
      "Right — worst case it's 15 minutes. Best case it doubles your calls. Every week the current site stays up is another week those calls don't happen. He's got Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ LINE 1 references what THEY told you in qualify. Doctor prescribes after diagnosing. 'Based on what you told me' signals you were listening.",
      "★ ONE IDEA PER LINE. Pause after every question. Silence is pressure — use it.",
      "★ HORMOZI MAGIC LINE on line 3. Always use it. Pre-handles every no.",
      "★ LINE 4: loss aversion ('every week this stays') + two-option close. Cut 'Worth 15 minutes?' — it invites a no.",
      "If they ask HOW MUCH → '$997 one-time, $100/yr hosting. That's Ben's territory — hear him out first. Tuesday or Thursday?'",
      "If they ask WHAT'S WRONG WITH MY SITE → 'You just saw one version — Ben walks through the specifics on the call. Tuesday or Thursday?'",
    ],
  },

  bookTheCall: {
    id: "bookTheCall",
    title: "Book Ben's call",
    goal: "This is the close. Get them on Ben's calendar before you hang up.",
    lines: [
      "Perfect. Texting you Ben's booking link right now — grab a 15-minute slot that works. He's got openings this week.",
      "While I have you, what's the best number to text? ... Got it, sending now.",
      "Once you book, you'll get a calendar invite from Ben. He'll have the audit pulled up and ready to walk you through.",
      "One thing — what's the one question you most want Ben to answer on the call? I'll put it in his notes.",
    ],
    callerNotes: [
      "★ Click SEND BOOKING LINK button on the right ↘. Pre-filled SMS with their personalized URL.",
      "★ Mark outcome BOOKED BEN'S CALL — this is the win we're tracking.",
      "Line 4 is a commitment escalator. They answer it, they're invested in the call happening. Write their answer in the notes box.",
      "If they hesitate on the time → 'Would mornings work better?' Two options keeps the close moving.",
    ],
  },

  textTheLink: {
    id: "textTheLink",
    title: "Send the audit link (FALLBACK)",
    goal: "If they won't book the call — at least get the audit in their hands.",
    lines: [
      "Either way — let me text you a free 60-second audit of your site. Read it tonight, decide if it's worth 15 minutes with Ben. No call required.",
      "Before I send it — is there one thing about the site that's been bugging you? I'll flag it for Ben so he's prepped if you do book.",
      "What's the best number to text?",
      "Sending now. You'll see it in about 5 seconds.",
    ],
    callerNotes: [
      "Use this ONLY if they won't book the call. Booking > audit-text every time.",
      "Line 2 plants a seed — they answer it, they're half-committed to the callback.",
      "Click SEND AUDIT LINK button on the right ↘.",
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
    goal: "Hook first — site before identity. Under 25 seconds. Text immediately after.",
    lines: [
      "{bizName} has a new website — {partnerFirstName} with BlueJays built it for you. Texting you the link right now, takes 30 seconds.",
      "Text back 'site' and I'll set you up with Ben — he built it — for a quick walkthrough. Either way the site's yours. Thanks {firstName}.",
    ],
    callerNotes: [
      "★ HOOK FIRST. Site before your name. Curiosity beats introduction on voicemail every time.",
      "★ 'Text back site' gives them a zero-friction reply — lower bar than calling back.",
      "★ Hang up → SEND PREVIEW LINK first → SEND BOOKING LINK second. Then mark VOICEMAIL.",
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
        "When's the last time he actually RAISED the calls coming off your site? Like a real change, not just updated something.",
        "Yeah — that's what we do differently. Want me to send you the audit anyway? You can show it to your guy. Either he uses it or he can't — but you'll know what's missing.",
      ],
      callerNotes:
        "★ LINE 1 is the mirror — 3-word repeat as a question. Shut up. Let the silence work. ★ Never trash the current guy. 'When did he RAISE your leads?' plants doubt without insulting anyone. ★ 3-NO: if they decline the audit too, exit gracefully.",
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
        "$997 one-time. $100 a year for hosting and support after that. No retainers, no monthly fees beyond the $100/yr.",
        "But before any of that — see it first. Want me to text the audit?",
      ],
      callerNotes:
        "Pivot back to the FREE audit immediately. Price-first calls close low. Audit-first calls close at 25%.",
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
  ],
};
