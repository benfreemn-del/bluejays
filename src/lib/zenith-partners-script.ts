/**
 * Zenith Sports / TEKKY — partner / sales-team call scripts.
 *
 * Four audience branches matching Zenith's verified customer segments:
 *   - coach         (youth + club coaches who control buying decisions)
 *   - club          (B2B wholesale — academy directors, club ops)
 *   - parent_ref    (existing customer parent → friends in the same league)
 *   - camp_director (summer camps + soccer academies running curricula)
 *
 * Mirrors src/lib/itc-partners-script.ts shape so the same script-viewer
 * UI can render either library.
 */

export type ZenithAudienceId =
  | "coach"
  | "club"
  | "parent_ref"
  | "camp_director";

export type ZenithScriptVars = {
  /** Caller's first name (Philip, Paul, or one of their reps) */
  callerFirstName: string;
  /** Prospect first name */
  firstName?: string;
  /** Club / academy / camp name */
  orgName?: string;
  /** Their role (Head Coach / Academy Director / Camp Owner / etc.) */
  role?: string;
  /** Player age group they handle (U10 / U12 / U14 / U16 / U19) */
  ageGroup?: string;
  /** Their city */
  city?: string;
  /** Their state */
  state?: string;
  /** Personalized BAE / Build-Your-Player / Coach-Guide URL */
  configUrl?: string;
};

export type ZenithScriptSection = {
  id: string;
  title: string;
  goal?: string;
  lines: string[];
  callerNotes?: string[];
};

export type ZenithObjectionBranch = {
  trigger: string;
  reply: string[];
  ifDoubleDown?: string;
};

export type ZenithCallScript = {
  audience: ZenithAudienceId;
  label: string;
  /** One-line caller orientation: who is this person and what do they want? */
  whoTheyAre: string;
  intro: ZenithScriptSection;
  qualify: ZenithScriptSection;
  pitch: ZenithScriptSection;
  cta: ZenithScriptSection;
  voicemail: ZenithScriptSection;
  objections: ZenithObjectionBranch[];
};

// ────────────────────────────────────────────────────────────────────
// 1. COACH — youth/club coach with buying influence
// ────────────────────────────────────────────────────────────────────
const COACH: ZenithCallScript = {
  audience: "coach",
  label: "🥅 Coach affiliate",
  whoTheyAre:
    "Youth or club coach (U10–U19). Cares about: player development, parent relationships, time saved on session planning. Trusts content from former or current pro players.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    goal: "Earn 90 more seconds.",
    lines: [
      "Hey, is this Coach {firstName} from {orgName}?",
      "This is {callerFirstName} from Zenith Sports / TEKKY — the soccer training ball with the bumps that fixes a player's first touch.",
      "Real quick — are you the head coach for the {ageGroup} group, or do you handle multiple ages?",
    ],
    callerNotes: [
      "If gatekeeper: 'No problem — who handles the gear-buying decisions for the club? Could you connect me?'",
      "Pause after the question. Don't pitch yet.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 30 seconds",
    goal: "Confirm fit + size of the buying audience.",
    lines: [
      "Got it. The reason I'm calling — coaches are our highest-trust referral source for TEKKY. Parents listen to you more than any ad we could run.",
      "Quick question: roughly how many players are on your roster across all ages? And do you typically recommend specific gear to parents, or do they figure it out themselves?",
    ],
    callerNotes: [
      "If they say 5-15 players → solo coach. Pitch direct $25/ball commission.",
      "If 30+ players → club affiliate path, mention club-level wholesale tier.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · the coach affiliate offer",
    goal: "Make it stupid easy for them to recommend TEKKY.",
    lines: [
      "Here's the thing: the TEKKY ball has raised bumps on the surface — when a player traps a pass cleanly with a bumpy ball, smooth-ball touches feel automatic. We've got 11 video testimonials from college coaches and DOCs who've used it for U10–U19.",
      "What I'd love to do is set you up with a personal coach link — share it in your team's group chat or a parent email. Every parent who buys through your link, you get $25. No quotas, no minimums, paid Venmo or Zelle within 7 days.",
      "If a parent signs up for the Zenith full coaching package through your link, that's $100 to you.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · text them the link",
    goal: "Get the cell number, send the link in the moment.",
    lines: [
      "I want to text you a link right now — your personal coach link plus a one-page parent-friendly intro to TEKKY you can forward.",
      "What's the best cell? I'll send it while we're on the phone.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey Coach {firstName}, this is {callerFirstName} from Zenith Sports / TEKKY — the bumpy training ball.",
      "Quick offer for coaches: $25 commission on every ball your parents buy through your link. I'll text you the details. Call back anytime.",
    ],
  },
  objections: [
    {
      trigger: "I don't really push gear on my parents",
      reply: [
        "Totally get it — and honestly that's why this works. You're not pushing anything. You drop the link in the team chat ONCE: 'Hey, the ball I use at trainings if anyone's looking.' If a parent buys, $25 to you. If not, no harm done.",
        "Most coaches we work with mention it once at the start of a season and never again.",
      ],
    },
    {
      trigger: "How much are the balls?",
      reply: [
        "$60 retail. Parents typically grab one for their kid; some buy two so the kid has one at home and one for the bag.",
        "$25 of that comes back to you per sale.",
      ],
    },
    {
      trigger: "What's the catch?",
      reply: [
        "Honestly, no catch. We pay coaches because parents trust their recommendations. Cheaper for us than running ads.",
        "No exclusivity — keep recommending whatever else you recommend. We just want to be in the rotation.",
      ],
    },
    {
      trigger: "Send me the info via email instead",
      reply: [
        "Will do — what's the best email? I'll fire it now.",
        "While I've got you: how many ages do you cover? Just U{ageGroup} or are you doing multiple groups?",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 2. CLUB — B2B wholesale, academy director, club ops
// ────────────────────────────────────────────────────────────────────
const CLUB: ZenithCallScript = {
  audience: "club",
  label: "🏟️ Club / academy",
  whoTheyAre:
    "Academy director, club operations manager, technical director. Buys for the whole organization. Cares about: kit deals, training equipment budget, parent satisfaction, retention metrics.",
  intro: {
    id: "intro",
    title: "Open · skip the pitch",
    goal: "Get to the right person fast.",
    lines: [
      "Hey, is this {firstName} at {orgName}?",
      "This is {callerFirstName} from Zenith Sports / TEKKY. Quick call — are you the person who handles training equipment for the club, or is that someone else?",
      "Got a minute?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · how many players",
    goal: "Size the volume opportunity.",
    lines: [
      "Roughly how many registered players do you have across all teams?",
      "And how do you currently handle training-ball provisioning — players bring their own, or club provides?",
    ],
    callerNotes: [
      "Under 100 players → personal-tier conversation, mention 10-pack starter.",
      "100-500 players → mid-tier wholesale; 25-pack and 50-pack break points.",
      "500+ players → enterprise / multi-club deal — schedule call with Philip directly.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · the club wholesale offer",
    goal: "Make the math obvious.",
    lines: [
      "Here's our club program. Wholesale on the TEKKY training ball:",
      "10-pack: $40/ball. 25-pack: $35/ball. 50-pack: $30/ball. Retail is $60, so even at 10 you've got 33% margin if you resell — or use as a parent perk at signup.",
      "What most clubs do: roll the cost into the player fee. Player gets a TEKKY ball at registration; parent feels like the club is investing in their kid; you keep margin.",
      "We'll co-brand the box if you want — your logo + ours. Free on orders of 50+.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · book a 15-min with Philip",
    goal: "Hand off to the founder for the close.",
    lines: [
      "What I want to do is set up a 15-minute call with Philip — our co-founder and a former pro. He can walk through co-branding, custom orders, and what other clubs your size are doing.",
      "Mornings or afternoons better for you this week?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, this is {callerFirstName} from Zenith Sports / TEKKY. Calling about the club wholesale program — co-branded training balls at $30-40/unit depending on order size.",
      "I'll text you the wholesale sheet. Give me a call back when you've got 5 minutes.",
    ],
  },
  objections: [
    {
      trigger: "We already have club balls",
      reply: [
        "Sure — what brand? Most clubs we work with run TEKKY alongside whatever they have. The bump-pattern training balls are different from regular practice balls — used for 15-20 minutes a session for first-touch + receiving.",
        "Want me to send a single sample so your TD can have a look?",
      ],
    },
    {
      trigger: "We can't afford a budget hit right now",
      reply: [
        "Hear you. The way most clubs do it: roll the cost into the registration fee. $30 added to a $400-800 player fee, parent gets a $60 ball, club captures the margin. Net-positive to your P&L from day one.",
      ],
    },
    {
      trigger: "Send a proposal",
      reply: [
        "Will do — what's the best email? I'll send our wholesale sheet today + a 1-page parent perk template you can drop into your registration flow.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 3. PARENT_REF — referral-from-existing-customer
// ────────────────────────────────────────────────────────────────────
const PARENT_REF: ZenithCallScript = {
  audience: "parent_ref",
  label: "👨‍👩‍👧 Parent referrer",
  whoTheyAre:
    "Existing TEKKY customer · soccer parent · already loves the ball. Goal: turn them into a recurring referral source. Tone: peer-to-peer, never salesy.",
  intro: {
    id: "intro",
    title: "Open · check-in not pitch",
    goal: "Don't make them feel sold-to.",
    lines: [
      "Hey {firstName}, this is {callerFirstName} from Zenith Sports / TEKKY. Quick check-in — not a sales call.",
      "How's your kid liking the ball? Any difference in their first touch yet?",
    ],
    callerNotes: [
      "Listen for genuine excitement vs. politeness. Genuine = pitch the referral. Polite = thank them, ask for feedback only.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · their network",
    lines: [
      "That's awesome to hear. Quick question — are most of your kid's teammates' parents pretty active in the team group chat or a Facebook group?",
      "And how many other kids on the team do you think still don't have a ball they're really happy with?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "The ask · referral incentive",
    lines: [
      "Here's the thing: the way TEKKY grows is parents like you telling other parents. We don't run a lot of ads — they don't work as well as a parent saying 'my kid actually wanted to practice after we got this'.",
      "So here's an offer: I'll text you a referral link tied to you. Drop it in the team chat or send it to one or two parents you know. Every parent who buys through your link, you get $20. No cap, paid Venmo or Zelle.",
      "Most parents do one chat message and pick up a few hundred bucks over a season.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · send the link",
    lines: [
      "Best cell? I'll text you the link right now along with a one-line message you can forward — that way you're not writing anything yourself.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from Zenith / TEKKY — checking in on the ball, and I've got a quick referral offer for you. $20 per parent you send our way.",
      "I'll text you the details. Talk soon.",
    ],
  },
  objections: [
    {
      trigger: "I don't really like promoting stuff to my friends",
      reply: [
        "Totally get it. The link is yours either way — keep it for if a parent ever asks 'where'd you get that ball.' No pressure, no posting, no DMs. Just there if you want it.",
      ],
    },
    {
      trigger: "How is this different from MLM?",
      reply: [
        "It's not a downline. You don't recruit other referrers, you don't get a cut of anyone else's sales. Flat $20 per ball your link generates. Paid once, per sale. That's it.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 4. CAMP_DIRECTOR — summer camps, academies, residential programs
// ────────────────────────────────────────────────────────────────────
const CAMP_DIRECTOR: ZenithCallScript = {
  audience: "camp_director",
  label: "🏕️ Camp / academy director",
  whoTheyAre:
    "Soccer camp owner or academy director running multi-day programs. Cares about: differentiating curriculum, parent perception of value, repeat enrollment.",
  intro: {
    id: "intro",
    title: "Open · the camp angle",
    lines: [
      "Hey {firstName}, this is {callerFirstName} from Zenith Sports / TEKKY. Calling about your camps — quick question.",
      "Do your players bring their own ball, or do you provide one as part of the registration fee?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · camp size + format",
    lines: [
      "Got it. How many players come through in a typical week? And are you doing day camps or residential, or both?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · TEKKY in your camp curriculum",
    lines: [
      "Here's what some camps we work with do. They include a TEKKY ball as part of the camp registration fee — players take it home at the end of the week.",
      "Two wins: (1) parents see real take-home value, which lifts the perceived ROI on a $400-800 camp fee. (2) you get to build your camp curriculum around TEKKY's first-touch progression — three drills we've already drafted that fit a 60-min station perfectly.",
      "Wholesale: $30/ball at 50+ unit orders. Co-branded box with your camp logo, free at 50+.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · sample box + curriculum",
    lines: [
      "Want me to ship you one sample ball + the 3-drill curriculum doc? Free, no commitment. Then if it's a fit, we line up the full order before your next camp session.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from Zenith Sports / TEKKY. Camps that bake a TEKKY ball into the registration fee see better parent reviews + repeat enrollment — I'd love to send you a sample + the curriculum doc.",
      "I'll text the details. Call me back.",
    ],
  },
  objections: [
    {
      trigger: "Players already bring their own ball",
      reply: [
        "Sure — most do. The angle here isn't replacing what they bring, it's giving them something to take home. The camp 'graduation gift' move. Parents reorganize the entire registration fee around perceived value, and a $30 ball lifts perceived value way more than $30 of curriculum time.",
      ],
    },
    {
      trigger: "We're sold out for this summer already",
      reply: [
        "Perfect — fall sessions, holiday clinics, or next summer's pre-launch. Send me your calendar; I'll line up so the boxes ship 2 weeks before whatever session you're stocking for.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
export const ZENITH_SCRIPTS: Record<ZenithAudienceId, ZenithCallScript> = {
  coach: COACH,
  club: CLUB,
  parent_ref: PARENT_REF,
  camp_director: CAMP_DIRECTOR,
};

export const ZENITH_SCRIPT_ORDER: ZenithAudienceId[] = [
  "coach",
  "club",
  "parent_ref",
  "camp_director",
];

export function fillZenithVars(
  line: string,
  vars: ZenithScriptVars,
): string {
  return line.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = (vars as Record<string, string | undefined>)[key];
    if (value && value.trim()) return value;
    return `[${key}]`;
  });
}

export const ZENITH_HORMOZI_TIPS = [
  "Lead with 'are you the head coach?' — if no, ask who is. Don't pitch a parent volunteer.",
  "Coaches care about TIME more than money. Frame everything as 'this saves you a step'.",
  "Camps care about REVIEWS. Frame the ball as a parent-review lever.",
  "Clubs care about RETENTION. Frame the ball as a parent-perk that justifies the registration fee.",
  "Never compare yourself to 'regular soccer balls'. TEKKY is a TRAINING ball — different category.",
  "If they say 'I'll think about it', text them the link anyway. Most coaches forget unless the link's already on their phone.",
  "Mention Philip + Paul by name when relevant — soccer-pedigree credibility lands hard with coaches.",
  "End every call by asking 'who else should I be talking to?' — coaches love connecting other coaches.",
  "Tuesday + Wednesday afternoons are best dial windows for coaches (after school, before practice).",
  "Saturday mornings work for camp directors (between sessions). Avoid Friday — they're busy.",
];
