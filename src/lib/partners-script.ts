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
 *  Build this muscle memory over your first 100 calls. */
export const HORMOZI_CALL_TIPS: CallTip[] = [
  {
    id: "smile",
    emoji: "😊",
    title: "Smile before you dial",
    body: "Your tone changes the second you smile. They can't see you but they feel it. First 5 words decide if they hang up.",
  },
  {
    id: "fmDJ",
    emoji: "🎙️",
    title: "FM DJ voice — low, slow, confident",
    body: "Think late-night radio host, not morning show. Drop your pitch DOWN at the end of every statement. Up-inflection sounds unsure. Down-inflection sounds like you already know the answer.",
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
    id: "talkLess",
    emoji: "🤐",
    title: "Talk less than half the call",
    body: "Top closers speak less than 57% of the time. Ask a question, then shut up. The more they talk, the more they sell themselves. Silence is not awkward — it's pressure.",
  },
  {
    id: "worstThing",
    emoji: "⭐",
    title: "The Hormozi magic line",
    body: "'Would it be the worst thing in the world if you took 15 minutes, learned what's broken, and decided not to use us?' They say no → objections evaporate. Use it every single call.",
  },
  {
    id: "twoOptions",
    emoji: "🎯",
    title: "Two options, never one",
    body: "'Tuesday at 3 or Thursday at 10?' beats 'do you want to book?' every time. Yes/no gets no. Choices get choices.",
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
    body: "'If you say no I'll never call again.' They relax instantly. Most yeses come 30 seconds AFTER you give them permission to say no.",
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
  "Stack the nos fast. The yes is on the other side.";

/** Gatekeeper / unknown-owner variants. Swapped in when ownerFirstName
 *  is unknown — the rest of the script stays the same. */
export const HORMOZI_INTRO_UNKNOWN_OWNER: ScriptSection = {
  id: "intro",
  title: "Open the call (gatekeeper)",
  goal: "Owner name unknown — ask for who handles the website. Get to the decision-maker fast.",
  lines: [
    "Hey — quick question, who handles the website over at {bizName}?",
    "Awesome — any chance they're around? I'll keep it short, got one quick thing about your site that's probably costing some calls.",
    "[When transferred] — Hey, {partnerFirstName} with BlueJays. Quick heads-up — we finished building {bizName} a new website. Just want to show it to whoever handles the site. Can I text the link?",
    "[If curious] Yeah — we finish the whole thing first, you see it before anyone owes us anything. Takes 30 seconds to look. Cool?",
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
    "Hey — {partnerFirstName} with BlueJays, calling for whoever handles {bizName}'s website.",
    "We finished building the business a new site and just want to show it to you. Texting the link right now — takes 30 seconds to look.",
    "If it makes sense, just text back and we'll get whoever handles the site on a 15-minute call with Ben — he built it. Either way, the site's yours to see.",
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
    goal: "Earn the next 30 seconds. Permission + intrigue = they don't hang up.",
    lines: [
      "Hey, is this {firstName}?",
      "Hi {firstName} — {partnerFirstName} with BlueJays. Quick heads-up — we finished building {bizName} a new website. Not asking for anything right now, I just want to show it to you. Can I text you the link?",
      "[If curious] Yeah — we build sites for {category} businesses and we finish the whole thing first. You see it before you owe us a dollar. Takes 30 seconds to look. Cool?",
    ],
    callerNotes: [
      "★ LEAD WITH THE SITE. 'We built you something' = curiosity. 'I noticed problems' = defenses up.",
      "★ If they say 'you built me a what?' — that's the hook working. 'Yeah — full site, your services, contact form, everything. Already done. Want to see it?'",
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
      "While you pull that up — quick question: roughly how many new customer calls do you get off the current site each week? Just a ballpark.",
      "Got it. And how many of those find you online versus word of mouth or referrals?",
      "Yeah — that's the gap. Most {category} sites miss 3 things that change that number. You'll see them when you look at what we built.",
      "When's the last time someone actually worked on the site to RAISE those numbers — not just updated it, but actually improved the lead flow?",
    ],
    callerNotes: [
      "GET A NUMBER. Even a guess. Numbers anchor — 'fine' doesn't.",
      "★ After they answer, pause. Let the silence work. They'll say more.",
      "★ The last question is NEPQ — surfaces pain they already feel without you naming it first.",
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
      "So you've seen it — Ben built that specifically for {bizName}. He'd love 15 minutes to walk you through what he changed and why it matters for your lead flow.",
      "The walkthrough is free. Even if you never use us, you'd know exactly what's working and what to fix. Worth 15 minutes?",
      "Would it be the worst thing in the world if you took 15 minutes, saw the full build, and decided not to move forward?",
      "Right — worst case it's 15 minutes. Best case it doubles your calls. He's got Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ ONE IDEA PER LINE. Pause after every question. Silence is pressure — use it.",
      "★ HORMOZI MAGIC LINE: 'Would it be the worst thing in the world...' Pre-handles every no. Always use it.",
      "★ TWO-OPTION CLOSE: 'Tuesday or Thursday' — yes/no gets nos, choices get choices.",
      "If they ask HOW MUCH → '$997 one-time, $100/yr hosting. That's Ben's territory — hear him out first. Tuesday or Thursday?'",
      "If they ask WHAT'S WRONG WITH MY SITE → 'You just saw one version — Ben walks through the specifics on the call. Tuesday or Thursday?'",
    ],
  },

  bookTheCall: {
    id: "bookTheCall",
    title: "Book Ben's call",
    goal: "This is the close. Get them on Ben's calendar before you hang up.",
    lines: [
      "Awesome. I'm going to text you Ben's booking link right now — grab a 15-minute slot that works. He's got openings this week.",
      "While I have you, what's the best number to text? ... Got it, sending now.",
      "Once you book, you'll get a calendar invite from Ben. He'll have the audit pulled up and ready to walk you through.",
      "One last thing — anything specific about the site that's been bugging you? Want him to focus on something in particular?",
    ],
    callerNotes: [
      "★ Click SEND BOOKING LINK button on the right ↘. Pre-filled SMS with their personalized URL.",
      "★ Mark outcome BOOKED BEN'S CALL — this is the win we're tracking.",
      "The 'anything specific' question gives Ben a hot lead-in. Write the answer in the notes box.",
      "If they hesitate on the time → 'Or would mornings work better?' Two options keeps the close moving.",
    ],
  },

  textTheLink: {
    id: "textTheLink",
    title: "Send the audit link (FALLBACK)",
    goal: "If they won't book the call — at least get the audit in their hands.",
    lines: [
      "No worries. Quick alternative — I'll text you a free 60-second audit of your site. Read it tonight in 5 minutes. No call required.",
      "If after reading it you want Ben to walk you through it, the booking link is right there. If not, you keep the audit and we move on.",
      "What's the best number to text?",
      "Sending now — you'll see it in about 5 seconds.",
    ],
    callerNotes: [
      "Use this ONLY if they won't book the call. Booking > audit-text every time.",
      "Click SEND AUDIT LINK button on the right ↘.",
      "Mark outcome AUDIT_SENT.",
    ],
  },

  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — pin a specific time. Vague callbacks never happen.",
    lines: [
      "Cool — what's a better time? I can call back tomorrow morning or Thursday afternoon, your pick.",
      "Got it, I'll mark you down for {time}. Either way you'll have the audit in your hands tonight — if you want to skip the callback you can just text me yes or no.",
    ],
    callerNotes: [
      "Mark outcome CALLBACK + write the specific time in the notes box.",
      "Don't push for a sale on the callback — push for the audit call first.",
    ],
  },

  voicemail: {
    id: "voicemail",
    title: "Leave a voicemail",
    goal: "Gift hook — 'we built you something' gets callbacks better than 'I found problems.'",
    lines: [
      "Hey {firstName}, {partnerFirstName} with BlueJays — keeping this short.",
      "We finished building {bizName} a new website and I want you to see it. Going to text you the link right now — takes 30 seconds to look.",
      "If you want someone to walk you through it, text me back and I'll set you up with Ben — he built it. Either way the site's yours to look at. Thanks {firstName}.",
    ],
    callerNotes: [
      "★ 'We built you something' is the hook. Curiosity beats problem-framing on voicemail.",
      "★ Hang up → SEND PREVIEW LINK first → SEND BOOKING LINK second. Then mark VOICEMAIL.",
      "About 1 in 4 voicemail-then-text combos get a reply. Always text after the VM.",
    ],
  },

  objections: [
    {
      id: "busy",
      trigger: "I'm busy / bad time / not now",
      response: [
        "Totally fair, I won't keep you. Real quick — would it be useful if I just texted you a free audit of your site right now? Read it tonight in 5 minutes. No call needed.",
        "Cool — sending it now. Have a good one.",
      ],
      callerNotes:
        "If yes → SEND AUDIT LINK + mark SENT_AUDIT. If no → mark NOT_INTERESTED politely.",
    },
    {
      id: "haveAGuy",
      trigger: "I already have a guy / web designer / nephew does it",
      response: [
        "Cool — who's been doing it for you?",
        "Last question and I'll let you go: when's the last time he actually RAISED the calls coming off your site? Like a real change, not just updated something.",
        "Yeah — that's actually what we do differently. Want me to send you the audit anyway? You can show it to your guy. Either he uses it or he can't — but you'll know what's missing.",
      ],
      callerNotes:
        "★ Never trash the current guy. Plant doubt with 'when did he RAISE your leads.' Most built a Squarespace + disappeared. The audit becomes a tool the prospect can wield against their current vendor.",
    },
    {
      id: "badExperience",
      trigger: "I've had a bad experience with a web designer / got burned before",
      response: [
        "That's the most common thing we hear. Most designers take your money and disappear with a half-finished site.",
        "We do it backwards. Ben builds the whole site FIRST — you see the finished product before you pay a single dollar. Your name never goes on a bad outcome.",
        "Want to see what he already built for your business? Takes 30 seconds to look.",
      ],
      callerNotes:
        "★ This is your strongest pitch. 'Build first, pay after' is the exact opposite of what burned them. Lead with it hard. Then send the audit link.",
    },
    {
      id: "howMuch",
      trigger: "How much does it cost?",
      response: [
        "$997 one-time. $100 a year for hosting and support after that. No retainers, no monthly fees beyond the $100/yr.",
        "But before any of that — the audit is free and you should see it first. Want me to text it?",
      ],
      callerNotes:
        "Pivot back to the FREE audit immediately. Price-first calls close low. Audit-first calls close at 25%.",
    },
    {
      id: "cantAfford",
      trigger: "Can't afford it / too expensive",
      response: [
        "Totally fair. Most owners feel that way until they see the audit — usually shows them losing $2,000–$3,000 a month from a broken site.",
        "Let me text you the audit free. If it shows you're not losing money, ignore us. If it shows you are, $997 is just math.",
      ],
      callerNotes:
        "Reframe: 'too expensive' vs WHAT? The audit answers that. Always end on the free audit offer.",
    },
    {
      id: "thinkAboutIt",
      trigger: "I'll think about it",
      response: [
        "Totally fair. Quick question — would it be the worst thing in the world if you took 15 minutes with Ben, learned what's broken, and decided not to use us?",
        "Right? Worst case you waste 15 minutes. Best case the call doubles your phone calls. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ 'I'll think about it' almost always means 'I don't want to say no on the phone.' The worst-thing question gives them permission to say yes without committing.",
    },
    {
      id: "emailMe",
      trigger: "Send me an email instead",
      response: [
        "Will do. What's the best email?",
        "I'll email you AND text you — most owners read texts faster. What's the best mobile number?",
      ],
      callerNotes:
        "Get BOTH if possible. If email only, send audit via email and mark SENT_AUDIT.",
    },
    {
      id: "notInterested",
      trigger: "Not interested / no thanks",
      response: [
        "Totally cool. Quick question — is it the website thing in general, or just bad timing right now?",
        "Got it. If you ever change your mind we're at bluejayportfolio.com. Have a good one.",
      ],
      callerNotes:
        "If BAD TIMING → mark CALLBACK with note '90 days'. If WEBSITE THING → mark NOT_INTERESTED, exit fast and friendly.",
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
        "No, this is {partnerFirstName} — real person on the phone. I'm with BlueJays, we build websites for local {category} businesses.",
        "Want me to send you a free audit instead and you can decide if it's useful?",
      ],
      callerNotes:
        "Slow down, sound human, use their first name. Spam-paranoid prospects relax fast when they hear their own name.",
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
  ],
};
