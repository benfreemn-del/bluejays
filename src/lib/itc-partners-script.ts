/**
 * ITC Quick Attach — partner / sales-team call scripts.
 *
 * Six audience branches matching ITC's verified customer segments:
 *   - dealer       (wholesale channel — Cascade-style tractor supply shops)
 *   - tym          (TYM owners — biggest verified review base, T474 brush guard)
 *   - forester     (professional foresters — SawBoss positioning)
 *   - hunter       (hunters / outdoorsmen — firearm-mount product line)
 *   - hobbyist     (sub-compact + hobby tractor owner — "the hobby user")
 *   - community    (existing customer asking for referrals — testimonial track)
 *
 * Mirrors src/lib/partners-script.ts shape so the same CallWorkspace
 * component (or a thin clone) can render either library.
 */

export type ItcAudienceId =
  | "dealer"
  | "tym"
  | "forester"
  | "hunter"
  | "hobbyist"
  | "community";

export type ItcScriptVars = {
  /** Caller's first name (e.g. one of Jake's reps) */
  callerFirstName: string;
  /** Prospect first name, if known */
  firstName?: string;
  /** Business / shop name, if dealer */
  bizName?: string;
  /** Tractor brand the prospect runs (TYM, Kioti, Mahindra, Branson) */
  tractorBrand?: string;
  /** Acreage / job-size context for foresters & hobbyists */
  acreage?: string;
  /** Their city */
  city?: string;
  /** Their state */
  state?: string;
  /** Personalized config-quiz URL (Build Your Dream Tractor) */
  configUrl?: string;
};

export type ItcScriptSection = {
  id: string;
  title: string;
  goal?: string;
  lines: string[];
  callerNotes?: string[];
};

export type ItcObjectionBranch = {
  trigger: string;
  reply: string[];
  /** Optional follow-up if they double down */
  ifDoubleDown?: string;
};

export type ItcCallScript = {
  audience: ItcAudienceId;
  label: string;
  /** One-line caller orientation: who is this person and what do they want? */
  whoTheyAre: string;
  intro: ItcScriptSection;
  qualify: ItcScriptSection;
  pitch: ItcScriptSection;
  cta: ItcScriptSection;
  voicemail: ItcScriptSection;
  objections: ItcObjectionBranch[];
};

// ────────────────────────────────────────────────────────────────────
// 1. DEALER — wholesale channel, highest LTV per close
// ────────────────────────────────────────────────────────────────────
const DEALER: ItcCallScript = {
  audience: "dealer",
  label: "🏪 Dealer / wholesale",
  whoTheyAre:
    "Owner or buyer at a tractor supply shop, ag-equipment dealer, or rural hardware. Cares about: per-unit margin, ship speed, shelf turn, MAP policy, return rate.",
  intro: {
    id: "intro",
    title: "Open · 12-second hook",
    goal: "Earn 90 more seconds.",
    lines: [
      "Hey, is this {firstName} over at {bizName}?",
      "This is {callerFirstName} with ITC Quick Attach out of Blossvale, New York — we make the tractor accessories: SawBoss chainsaw carriers, brush guards, toolbox kits, firearm mounts.",
      "Real quick — are you the person who decides what tractor accessories go on your shelves, or is that someone else?",
    ],
    callerNotes: [
      "If gatekeeper: 'No worries — who handles new accessory lines for you all? Could you connect me?'",
      "Pause after the question. Let them answer.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · 30 seconds",
    goal: "Confirm fit + tractor brands they sell.",
    lines: [
      "Got it. The reason I'm calling — Cascade Tractor Supply out of Spokane has been carrying our SawBoss and the brush-guard line, and it's been a strong shelf turn for them.",
      "Quick question: which tractor brands do you stock or service most? TYM, Kioti, Mahindra, Branson? Any of those?",
    ],
    callerNotes: [
      "All four are verified-fit brands for our brush guards. If they say 'just Kubota / Deere' — flag it; we don't have direct fit there yet, pivot to SawBoss + toolbox kits.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · the dealer offer",
    goal: "Make it easy to say yes.",
    lines: [
      "Perfect. Here's why I'm calling: we're American-made, in-house manufacturing in upstate NY, and our SawBoss alone retails at $180 with margin in the 35-40% range for dealers — same with the toolbox kits at $35 to $125.",
      "We ship direct to your store, no minimums on the first order, and we set the MAP so we're not racing your prices to zero on Amazon.",
      "If you're open to it, I can get a starter pack out — one SawBoss, one TYM-fit brush guard, and our top three toolbox SKUs — and we'll see how it moves. No upfront commitment, terms on first order.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · book the rep call",
    goal: "Schedule a 15-min call with ITC.",
    lines: [
      "What I'd love to do is set up a 15-minute call with our wholesale rep so they can talk MAP, shipping windows, and dealer pricing tiers.",
      "Are mornings or afternoons better for you this week?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, this is {callerFirstName} from ITC Quick Attach — we make the SawBoss chainsaw carrier and the TYM/Kioti/Mahindra brush-guard line.",
      "Cascade Tractor Supply has been moving these well and I think it'd be a fit for {bizName}. I'll text you a link to our wholesale catalog. Give me a call back when you've got a second.",
    ],
  },
  objections: [
    {
      trigger: "We already carry [brand X]",
      reply: [
        "Totally get it — we're not asking you to drop them. Most of our dealers carry us alongside another brand because the SawBoss has no real competitor at our price point.",
        "Could I send you the catalog so you can compare on margin and fit?",
      ],
    },
    {
      trigger: "What's your minimum order?",
      reply: [
        "Zero on first order. We'll do a starter pack — one of each top SKU — so you can see how it sells before committing to volume.",
      ],
    },
    {
      trigger: "Send me an email",
      reply: [
        "Will do — what's the best email? I'll fire it over now.",
        "While I've got you, what brands do most of your customers run? That way I send you the fit-list that actually matches your floor.",
      ],
    },
    {
      trigger: "We don't take cold calls",
      reply: [
        "Heard you. I'll keep this 30 seconds and let you go: ITC, made in NY, SawBoss + brush guards, no minimums on first order. If a one-page catalog makes sense, what's the email — and I'm gone.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 2. TYM OWNER — biggest review base on the brush guard
// ────────────────────────────────────────────────────────────────────
const TYM: ItcCallScript = {
  audience: "tym",
  label: "🚜 TYM owner",
  whoTheyAre:
    "Existing or recent TYM tractor owner. Knows the brand. Already searching for accessories. T474 model is the volume seller — 28+ verified reviews on our brush guard.",
  intro: {
    id: "intro",
    title: "Open · the warm hook",
    goal: "Land the connection: 'they make stuff for MY tractor'.",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach — quick call, 60 seconds.",
      "I saw you're running a TYM — is that the T474 or one of the bigger models?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · use case",
    lines: [
      "Got it. What are you mostly using it for — property maintenance, brush clearing, hauling firewood, food plots?",
    ],
    callerNotes: [
      "Listen for: brush clearing → SawBoss + brush guard. Property maintenance → toolbox kit + lights. Hunting → firearm mount + brush guard.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · TYM-specific accessories",
    lines: [
      "Reason I'm calling: we make the only American-made brush guard built specifically for the TYM — bolts directly to your factory mounting points, no drilling, no adapters. 28+ reviews on it.",
      "We've also got the SawBoss for your chainsaw — fixed-mount, holds it upright in transit so the bar doesn't beat itself up. $180.",
      "And toolbox kits that mount to the loader frame — wrenches, pins, hitch hardware, all in one spot.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · the configurator",
    goal: "Send them to Build Your Dream Tractor.",
    lines: [
      "What I want to do is text you a link — we built a quick configurator that lets you toggle the accessories on your TYM and see them on the tractor before you commit.",
      "What's the best number? I'll send it now while we're talking.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the TYM-fit brush guard with 28+ reviews and the SawBoss chainsaw carrier.",
      "I'll text you a link to our build-your-tractor configurator — see what looks right and we can talk. Give me a call back if anything jumps out.",
    ],
  },
  objections: [
    {
      trigger: "I already have a brush guard",
      reply: [
        "Smart — what brand? If it's the OEM TYM bumper, ours is heavier gauge and rated for direct tree-strikes. Most guys upgrade after the OEM one bends on them.",
        "Either way, want me to send you the SawBoss or toolbox kit info instead?",
      ],
    },
    {
      trigger: "It's too expensive",
      reply: [
        "Fair — what's your number? The brush guard's $249, SawBoss is $180, toolbox kits start at $35.",
        "Most TYM owners pick up the toolbox kit first — under $40, immediate use every time you climb on.",
      ],
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. Can I just text you the configurator link so you have it on your phone when you're sitting on the tractor? Takes 30 seconds.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 3. FORESTER — professional clearing / land-management
// ────────────────────────────────────────────────────────────────────
const FORESTER: ItcCallScript = {
  audience: "forester",
  label: "🌲 Professional forester",
  whoTheyAre:
    "Land-management pro, logging contractor, or commercial brush-clearing op. Time = money. Cares about: durability, transit safety, time saved per job.",
  intro: {
    id: "intro",
    title: "Open · respect their time",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach in upstate NY — I'll keep this under a minute.",
      "Are you running clearing jobs full-time or is this a side operation?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · job type",
    lines: [
      "Got it. What's giving you the most headaches right now — chainsaw transit, brush guard impacts, or just time burned re-rigging gear between jobs?",
    ],
    callerNotes: [
      "Listen for the pain. Don't pitch yet. Their answer drives which product leads.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · the SawBoss + Chainbox combo",
    lines: [
      "We make the SawBoss — the only fixed-mount chainsaw carrier I know of that holds the saw upright AND keeps the bar locked in transit. $180.",
      "Pairs with our Chainbox storage system — bar oil, gas can, files, chains, all locked to the tractor frame.",
      "We sell it specifically to professional foresters running TYM, Kioti, Mahindra. American-made, replacement parts in stock.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · trial unit",
    lines: [
      "What I want to do is get you a unit on a 30-day trial — if it doesn't save you 10+ minutes per job, ship it back, no questions.",
      "Want me to lock that in?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the SawBoss — fixed-mount chainsaw carrier built for professional foresters running TYM, Kioti, Mahindra.",
      "I'll text you the spec sheet. 30-day trial if you want to see how it holds up. Talk soon.",
    ],
  },
  objections: [
    {
      trigger: "I just throw the saw in the back",
      reply: [
        "Makes sense — until the bar gets bent or the chain catches a strap. SawBoss is $180 vs. a $300 bar replacement. Pays for itself the first time it saves the saw.",
      ],
    },
    {
      trigger: "Too expensive for what it is",
      reply: [
        "Walk me through what 'too expensive' looks like — if I told you it'd save you 10 minutes a job, on say 4 jobs a day, that's 200 minutes a week. What's that worth to you?",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 4. HUNTER — firearm mounts + brush guards
// ────────────────────────────────────────────────────────────────────
const HUNTER: ItcCallScript = {
  audience: "hunter",
  label: "🎯 Hunter / outdoorsman",
  whoTheyAre:
    "Hunter using a tractor or UTV on private land or lease. Cares about: secure firearm transport, brush guard for thick cover, quiet operation.",
  intro: {
    id: "intro",
    title: "Open · land + season",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. Calling about your tractor setup — quick question.",
      "Do you hunt off the tractor or use it more for getting to the stand and food-plot work?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · firearm + ground type",
    lines: [
      "What kind of firearm — rifle, shotgun, crossbow? And how thick's the brush you're punching through to get there?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · firearm mount + brush guard combo",
    lines: [
      "We make a firearm-mount system that bolts directly to your tractor or ROPS — secure, quiet, quick-release.",
      "Paired with our brush guard, you can drive into thick cover without scratching the hood OR worrying about the rifle banging around.",
      "We sell hundreds of these to hunters running TYM, Kioti, Mahindra during October-December. American-made.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · season prep",
    lines: [
      "What's the ship-by date you'd want it for — opening weekend, or earlier for scouting season?",
      "I can get you on the schedule and text you the install video so you can see the mount before it ships.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the firearm-mount + brush-guard combo for hunters running tractors on private land.",
      "I'll text you the install video. Call me back when you've got a second.",
    ],
  },
  objections: [
    {
      trigger: "I just lay it across the seat",
      reply: [
        "I hear that a lot — until the first time you hit a rut and the gun ends up muzzle-down in the dirt. Mount's $129 and bolts on in 10 minutes.",
      ],
    },
    {
      trigger: "Is it legal in my state?",
      reply: [
        "Good question — depends on whether you're transporting on private land or public, and whether the firearm's loaded or cased.",
        "Check your state DNR site, but on private land for transport, every state I know of allows it. We'll send the install guide either way.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 5. HOBBYIST — sub-compact / first-year tractor owner
// ────────────────────────────────────────────────────────────────────
const HOBBYIST: ItcCallScript = {
  audience: "hobbyist",
  label: "🏡 Hobbyist / first-year owner",
  whoTheyAre:
    "Recent buyer of a sub-compact tractor (TYM T474, Kioti CK2610, Mahindra eMax). Probably overwhelmed by accessory options. Trusts other owners more than dealers.",
  intro: {
    id: "intro",
    title: "Open · congrats on the tractor",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. Congrats on the tractor — how long have you had it?",
      "What got you into a tractor — property work, hobby farm, or just had to get one?",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · what they're learning the hard way",
    lines: [
      "What's surprised you the most so far? Like, what do you wish you'd known about owning a tractor before you bought it?",
    ],
    callerNotes: [
      "This is the gold question. They'll tell you exactly which accessory to lead with.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "Pitch · the first-year setup kit",
    lines: [
      "Yeah — that's exactly why I'm calling. We work with a lot of first-year tractor owners and there's basically a setup kit everyone wishes they'd bought day one:",
      "Toolbox kit ($35-$125) — bolt cutter, pins, wrenches, all in one spot.",
      "SawBoss ($180) — for the chainsaw, because you WILL be cutting brush.",
      "Brush guard ($249) — first time you hit a low branch, you'll wish you had it.",
      "We ship same-day. American-made, in upstate NY.",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · the configurator",
    lines: [
      "What I want to do is text you our 'Build Your Dream Tractor' configurator — you toggle accessories and see them on your tractor before buying.",
      "Best number for the link?",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make accessories for sub-compact tractors — toolbox kits, SawBoss chainsaw carrier, brush guards.",
      "I'll text you a configurator so you can see what fits your setup. Talk soon.",
    ],
  },
  objections: [
    {
      trigger: "I don't even know what I need yet",
      reply: [
        "Totally get it — that's why we built the configurator. You answer 5 questions and it tells you what most owners with your setup buy first.",
        "Want me to text you the link?",
      ],
    },
    {
      trigger: "I'll wait until I actually need something",
      reply: [
        "Smart — most people do. Just one thing: the brush guard goes on BEFORE the first hit, not after. Once it's bent, it's bent.",
        "Either way, want the link to bookmark?",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// 6. COMMUNITY — referral request from existing customer
// ────────────────────────────────────────────────────────────────────
const COMMUNITY: ItcCallScript = {
  audience: "community",
  label: "🤝 Existing customer · referral",
  whoTheyAre:
    "Existing ITC customer. Owns at least one of our products. Already knows the brand. Goal: ask for a testimonial OR a referral.",
  intro: {
    id: "intro",
    title: "Open · check-in",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach — not a sales call, promise. Quick check-in.",
      "How's the [SawBoss / brush guard / toolbox] holding up since you got it?",
    ],
    callerNotes: [
      "Use the actual product they bought — pull from CRM. Generic 'how's it going' kills the rapport.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · friction or wins",
    lines: [
      "Anything you wish was different about it? Or anything that's been a nice surprise?",
      "And how'd you originally find us — Google, a buddy, a dealer?",
    ],
  },
  pitch: {
    id: "pitch",
    title: "The ask · referral OR testimonial",
    lines: [
      "Awesome. The reason I'm calling: we're growing the community side of ITC and we're trying to get the word out the right way — through actual owners, not paid ads.",
      "Two quick asks, you can say no to either: (1) Would you be willing to record a 30-second video of you using it on your tractor — we'd send you a free toolbox kit as a thank-you. (2) Got any tractor buddies who'd be a fit for one of our products?",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · make it easy",
    lines: [
      "If you've got a name — first name + cell — I'll reach out personally and tell them you said hey.",
      "And for the video, I'll text you a link with 3 simple shots we need. No pressure, no rush.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach — not a sales call, just checking in on the [product] and seeing if you'd be up for a quick ask.",
      "Call me back when you've got a sec.",
    ],
  },
  objections: [
    {
      trigger: "I don't know anyone who needs that",
      reply: [
        "All good — totally fine. Would you do the video instead? Free toolbox kit, takes 90 seconds.",
      ],
    },
    {
      trigger: "I'm not really comfortable on camera",
      reply: [
        "Total respect. Forget the video — just one tractor friend who'd be a fit? I'll do all the work.",
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
export const ITC_SCRIPTS: Record<ItcAudienceId, ItcCallScript> = {
  dealer: DEALER,
  tym: TYM,
  forester: FORESTER,
  hunter: HUNTER,
  hobbyist: HOBBYIST,
  community: COMMUNITY,
};

export const ITC_SCRIPT_ORDER: ItcAudienceId[] = [
  "dealer",
  "tym",
  "forester",
  "hunter",
  "hobbyist",
  "community",
];

/**
 * Substitutes {var} tokens in a script line with values from vars.
 * Missing vars get bracketed placeholders so the caller sees what to fill.
 */
export function fillItcVars(line: string, vars: ItcScriptVars): string {
  return line.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = (vars as Record<string, string | undefined>)[key];
    if (value && value.trim()) return value;
    // Show placeholder so caller knows to ad-lib it
    return `[${key}]`;
  });
}

export const ITC_HORMOZI_TIPS = [
  "Pause after every question. They WILL fill the silence.",
  "Use their name twice in the call. Not three times — that's salesy.",
  "If they cuss you out, thank them and move on. 1 in 100 calls is rude. Don't take it home.",
  "Smile while you dial — your voice changes. They can hear it.",
  "Never apologize for calling. Confidence sells the offer.",
  "If you hear a TV / kid / dog — name it. 'Sounds like halftime, want me to call back in 20?' wins trust.",
  "Read the script word-for-word the first 10 calls. Then start owning it.",
  "End every objection with a question. Always pass the conversation back.",
  "If they say 'no' three times, accept it. Ask for the referral instead.",
  "The configurator link is your closer. Get the cell number.",
];
