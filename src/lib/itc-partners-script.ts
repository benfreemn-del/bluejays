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
  /** Tactical coaching for the caller (Hormozi mirrors, 3-no rule, etc) */
  callerNotes?: string;
};

export type ItcCallTip = {
  id: string;
  emoji: string;
  title: string;
  body: string;
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
  /** Fallback if the CTA fails — text the relevant link */
  textTheLink: ItcScriptSection;
  /** Close on a callback for "maybe" prospects */
  callbackClose: ItcScriptSection;
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
      "★ MUST: FM DJ voice — low and slow, down-inflection at sentence ends. You are not a telemarketer.",
      "★ Pause after the question. Count to 4 Mississippi. Let them answer first.",
      "★ Smile while you dial — your voice changes. They can hear it.",
      "If gatekeeper picks up → 'No worries — who handles new accessory lines for you all? Could you connect me?'",
      "If they say 'WHAT'S THIS REGARDING?' → 'New accessory line, made in NY, dealer margin in the 35-40% range. 60 seconds with whoever buys.'",
      "★ DON'T pitch the catalog yet — just confirm role. Pitch comes after they qualify themselves.",
      "If they sound rushed → 'I'll keep this 30 seconds — promise.' Then move fast.",
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
      "★ All four are verified-fit brands for our brush guards. If they say 'just Kubota / Deere' — flag it; we don't have direct fit there yet, pivot to SawBoss + toolbox kits.",
      "★ Pause after the brand question. Count to 4. Let them name brands.",
      "If they ask 'who's Cascade?' → 'Independent tractor supply, 4 stores in eastern WA. They've moved 60+ SawBoss in 6 months.'",
      "Listen for ANNUAL VOLUME signals — 'we sell a couple a month' vs 'we move dozens'. Drives whether you push starter pack or full pallet.",
      "★ If they say 'we already carry [competitor]' → that's a YES, not a no. They're already buying this category.",
      "Don't quote price yet. Save the margin number for the pitch.",
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
    callerNotes: [
      "★ MAP enforcement is the #1 dealer hook. Lead with it if they pushed back on Amazon competition.",
      "★ 'No minimums on first order' is the killer line — repeat it slow.",
      "★ Pause after 'no upfront commitment, terms on first order.' Let them sit with how easy this is.",
      "If they ask about return policy → '30 days no questions, full credit. We eat the freight on returns under $500.'",
      "★ DON'T mention Amazon unless they bring it up. Don't poison the well.",
      "If they ask about exclusivity → 'Not exclusive territories yet, but first dealer in a county gets priority on new SKUs.'",
      "★ End on a question. 'Sound like a fit for what you stock?'",
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
    callerNotes: [
      "★ MUST: Two options, never one. 'Mornings or afternoons' beats 'do you want to book?' every time.",
      "★ AFTER the question — count to 4 Mississippi. Do not speak. First one to talk loses.",
      "If they hesitate → 'Tuesday at 10 or Thursday at 2 — which works?' Pin a specific time.",
      "Once they pick, confirm the email + phone for the calendar invite.",
      "★ Mark outcome BOOKED REP CALL — that's the win we track for dealer audience.",
      "If they say 'just send me info' → pivot to TextTheLink (catalog).",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the catalog",
    goal: "If they won't book, get the catalog into their hands.",
    lines: [
      "No problem — let me text you our wholesale catalog. One page, MAP, ship windows, and the top 10 SKUs by margin.",
      "What's the best mobile number? I'll send it now while we're talking.",
      "Once you've got it — give it a 5-minute look tonight. If anything jumps out, text me back the SKU and I'll get a starter pack quote on your desk by tomorrow.",
    ],
    callerNotes: [
      "★ NEW PURPOSE: this is the second touch when they won't book the rep call.",
      "★ Get the mobile number. Email is too slow for dealers — they live on text.",
      "Catalog includes margin column right next to MSRP — that's the hook. Make sure they see it.",
      "★ Mark outcome CATALOG_SENT.",
      "Set a callback for 48 hours. 'I'll check back Thursday — sound fair?'",
      "If they refuse mobile → 'Email works, but I'll bug you slower that way.' Light humor, get the email.",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real blocker, then pin a specific time.",
    lines: [
      "What's making you want to sit on it? Most dealers say it's either margin, ship windows, or they're locked into another vendor — is that it?",
      "Got it. Tomorrow morning or Thursday afternoon — which works better for a quick callback?",
      "Either way, you'll have the catalog in your hands tonight. If you decide it's not a fit, just text me 'pass' and I'll stop reaching out.",
    ],
    callerNotes: [
      "★ Line 1 is NEPQ — surfaces the real blocker before you schedule. Mirror their answer back.",
      "★ Mark outcome CALLBACK + write the specific time in the notes.",
      "Don't push for the rep call on the callback — push for the catalog read first.",
      "If they name a vendor → 'Cool. We're not asking you to drop them. Most dealers carry both.' Don't trash the competitor.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, this is {callerFirstName} from ITC Quick Attach — we make the SawBoss chainsaw carrier and the TYM/Kioti/Mahindra brush-guard line.",
      "Cascade Tractor Supply has been moving these well and I think it'd be a fit for {bizName}. I'll text you a link to our wholesale catalog. Give me a call back when you've got a second.",
    ],
    callerNotes: [
      "★ Hang up → text the catalog link IMMEDIATELY. Mark VOICEMAIL.",
      "★ Under 25 seconds. Every extra second drops callback rate.",
      "★ Hook first — 'we make the SawBoss' before introducing yourself. Curiosity beats intro.",
      "Mention Cascade by name — social proof from a peer dealer matters.",
      "If their VM box is full → text the catalog anyway. Mark NO_VOICEMAIL_TEXTED.",
      "About 1 in 4 voicemail-then-text combos get a callback. Always text after the VM.",
    ],
  },
  objections: [
    {
      trigger: "We already carry [brand X]",
      reply: [
        "Already carry someone?",
        "Totally get it — we're not asking you to drop them. Most of our dealers carry us alongside another brand because the SawBoss has no real competitor at our price point.",
        "Could I send you the catalog so you can compare on margin and fit?",
      ],
      callerNotes:
        "★ Mirror first — 'Already carry someone?' Shut up. Let the silence work. They'll usually name the brand. ★ Don't trash the competitor — frame as 'alongside, not instead of.' ★ The catalog ask is a low-friction next step.",
    },
    {
      trigger: "What's your minimum order?",
      reply: [
        "Zero on first order. We'll do a starter pack — one of each top SKU — so you can see how it sells before committing to volume.",
        "After that, $500 minimum for re-orders to keep freight free. Most dealers re-order monthly once the first pack moves.",
      ],
      callerNotes:
        "★ 'Zero minimum' is the closer line. Say it confident, no hedging. ★ Free freight at $500 is a real number — repeat if they balk on re-order minimums.",
    },
    {
      trigger: "Send me an email",
      reply: [
        "Will do — what's the best email? I'll fire it over now.",
        "While I've got you, what brands do most of your customers run? That way I send you the fit-list that actually matches your floor.",
      ],
      callerNotes:
        "★ Get BOTH email AND mobile if possible. Email gets read tomorrow; text gets read in 5 minutes. ★ The 'fit list' line keeps the conversation alive — don't just hang up after taking the email.",
    },
    {
      trigger: "We don't take cold calls",
      reply: [
        "Heard you. I'll keep this 30 seconds and let you go: ITC, made in NY, SawBoss + brush guards, no minimums on first order. If a one-page catalog makes sense, what's the email — and I'm gone.",
      ],
      callerNotes:
        "★ Don't argue. Acknowledge + 30-second pitch + ask for the email + exit. ★ Tone matters — calm, not defensive. They respect that.",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Makes sense — I'll keep it to 20 seconds. Would it be useful if I just texted you the wholesale catalog? Read it tonight in 3 minutes. No call needed.",
        "Cool — sending it now. Have a good one.",
      ],
      callerNotes:
        "★ 3-NO RULE: this is their first no — offer the text as a different angle. ★ If yes → text catalog + mark CATALOG_SENT. If no → mark NOT_INTERESTED politely, exit fast.",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. What part do you need to think through? Is it the margin, the ship times, or something about the SKUs themselves?",
        "Got it. Would it be the worst thing in the world if you took 60 seconds to look at the catalog and decided not to stock us?",
        "Right — worst case 60 seconds. Best case you've got a 35% margin SKU on your floor next week. Want me to text it now?",
      ],
      callerNotes:
        "★ Line 1 is NEPQ — surfaces the REAL objection. 'Think about it' almost always means 'I don't want to say no on the phone.' ★ Line 2 is the magic line — pre-handles 'I don't want to be sold to.' ★ 3-NO: if they say no to all three, exit clean: 'Totally get it. If anything changes, ITCQuickAttach.com. Have a good one.'",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you AND text you the catalog — most buyers read texts faster. What's the best mobile?",
      ],
      callerNotes:
        "★ Get BOTH if possible. Email-only = mark CATALOG_SENT_EMAIL. ★ Don't push hard on mobile if they push back — email is fine, it just lands slower.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} here. We make tractor accessories out of Blossvale, NY — SawBoss chainsaw carriers, brush guards, toolbox kits.",
        "Want me to text you our wholesale catalog so you can see we're real? You decide if it's useful.",
      ],
      callerNotes:
        "★ Slow down, sound human, use their first name. Spam-paranoid buyers relax fast when they hear a calm, confident voice. ★ Don't over-explain. Less is more.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL — flags the prospect so no other rep can call them either. NEVER argue. NEVER ask why.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most dealers tell me that — usually it's late shipments, MAP nobody enforces, or returns that take 90 days. We do it backwards: terms on first order, 30-day full-credit returns, MAP we actively police on Amazon.",
        "Want to see the catalog before you decide? You'd know exactly what you're getting.",
      ],
      callerNotes:
        "★ STRONGEST PITCH for dealers. Mirror the pain first — 'Got burned before?' — so they feel heard. ★ Then flip it: name the three things that usually go wrong + how we do those backwards. ★ End on the catalog ask — low friction.",
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
    callerNotes: [
      "★ MUST: FM DJ voice — calm, confident, like you're calling a buddy.",
      "★ The model question is a micro-yes. They'll answer because they're proud of their tractor.",
      "★ Pause after the question. Don't fill the silence.",
      "Use first name early — kills 'is this spam' instinct.",
      "If they ask 'how do you know I have a TYM?' → 'Public registration database — same place TYM dealers see who's running their stuff.' Truth = trust.",
      "If gatekeeper (spouse) → 'Hey, is {firstName} around? It's about his tractor — quick question on accessories.'",
      "★ Smile while you dial. They hear it.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · use case",
    lines: [
      "Got it. What are you mostly using it for — property maintenance, brush clearing, hauling firewood, food plots?",
    ],
    callerNotes: [
      "★ This is the diagnostic question. Their answer drives which product leads.",
      "Listen for: brush clearing → SawBoss + brush guard. Property maintenance → toolbox kit + lights. Hunting → firearm mount + brush guard.",
      "★ Pause after they answer. Then ask one follow-up: 'How thick's the brush you're punching through?' or 'How often you out there?'",
      "★ Don't pitch yet. The diagnosis comes from THEM, not from you.",
      "If they say 'a little of everything' → lead with toolbox kit ($35-$125, lowest barrier).",
      "Take notes — you'll repeat what they said back in the pitch.",
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
    callerNotes: [
      "★ Lead with the product that matched their qualify answer. Brush clearing → brush guard first. Hunting → firearm mount first.",
      "★ '28+ reviews' is the trust hook for TYM owners — they verify EVERYTHING online.",
      "★ 'No drilling, no adapters' is a magic phrase. TYM owners hate modifying their tractor.",
      "If they ask about install → '20 minutes with two wrenches. Video on the configurator if you want to see it before buying.'",
      "★ DON'T mention price unprompted on the brush guard ($249) — let them ask. Lead with SawBoss price ($180) since it's lower.",
      "★ End on a question. 'Sound like the right fit for what you're doing?'",
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
    callerNotes: [
      "★ The configurator is the closer. Get the cell number.",
      "★ 'Best number' beats 'what's your number' — assumes they have one.",
      "★ AFTER the ask — count to 4 Mississippi. Let them give the number.",
      "Once you have the number, fire the SMS WHILE you're still on the phone. The link arriving live is part of the proof.",
      "★ Mark outcome CONFIG_LINK_SENT.",
      "If they hesitate on the number → 'I'll text it to the number I'm calling from — sound good?' Then send to the dialed number.",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the configurator",
    goal: "If they won't engage on the call, get the link in their hand.",
    lines: [
      "No problem — let me at least text you the configurator link so you have it on your phone when you're sitting on the tractor this weekend.",
      "What's the best number? Takes 30 seconds to play with.",
      "Once you've got it — toggle a couple accessories, see what looks right on your model. If anything jumps out, just text me back and I'll answer.",
    ],
    callerNotes: [
      "★ Use this when they're polite but disengaged. The configurator does the selling for you.",
      "★ 'When you're sitting on the tractor this weekend' — places the link in their context, not yours.",
      "★ Mark outcome CONFIG_LINK_SENT.",
      "Don't push for a callback time on this fallback — let the configurator do the work.",
      "If they refuse the number → 'Cool — ITCQuickAttach.com if you ever want to take a look.' Exit warm.",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real blocker, then pin a specific time.",
    lines: [
      "What's making you want to sit on it? Most TYM owners say it's either price, fit on their model, or they want to see how it looks first — is that it?",
      "Got it. Saturday morning or Sunday afternoon — when's a better time to take another look together?",
      "Either way, the configurator link's on your phone. If you decide it's not for you, just text me 'pass' and I'll never bug you again.",
    ],
    callerNotes: [
      "★ NEPQ on line 1 — surfaces the real blocker.",
      "★ TYM owners are weekend tractor people — pin Saturday or Sunday, not weekdays.",
      "★ Mark outcome CALLBACK + specific day/time.",
      "★ The 'never bug you again' line is the exit offer — kills pressure, gets more yeses.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the TYM-fit brush guard with 28+ reviews and the SawBoss chainsaw carrier.",
      "I'll text you a link to our build-your-tractor configurator — see what looks right and we can talk. Give me a call back if anything jumps out.",
    ],
    callerNotes: [
      "★ Hang up → text the config link IMMEDIATELY. Mark VOICEMAIL.",
      "★ Under 25 seconds. Lead with the product, not yourself.",
      "★ '28+ reviews' lands harder than 'we're the best' — TYM owners verify.",
      "Mention 'TYM-fit' specifically — they hear 'this guy gets MY tractor'.",
      "If their VM box is full → text the link anyway. Mark NO_VOICEMAIL_TEXTED.",
    ],
  },
  objections: [
    {
      trigger: "I already have a brush guard",
      reply: [
        "Already have one?",
        "Smart — what brand? If it's the OEM TYM bumper, ours is heavier gauge and rated for direct tree-strikes. Most guys upgrade after the OEM one bends on them.",
        "Either way, want me to send you the SawBoss or toolbox kit info instead?",
      ],
      callerNotes:
        "★ Mirror first — 'Already have one?' Shut up. ★ The OEM TYM bumper bends on the first hard hit — that's the gap. ★ Pivot to other SKUs if they push back twice.",
    },
    {
      trigger: "It's too expensive",
      reply: [
        "Too expensive compared to what?",
        "Fair — what's your number? The brush guard's $249, SawBoss is $180, toolbox kits start at $35.",
        "Most TYM owners pick up the toolbox kit first — under $40, immediate use every time you climb on.",
      ],
      callerNotes:
        "★ MIRROR + magic-line variant. 'Too expensive compared to what?' surfaces the real number in their head. ★ Pivot down-stack: brush guard → SawBoss → toolbox. The $35 toolbox kit is the entry-point closer. ★ Exit offer: 'If you say no right now I'll never call again — but take a look at the configurator first?'",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. What part do you need to think through? Is it the price, the fit, or something about the install?",
        "Got it. Would it be the worst thing in the world if you took 60 seconds to look at the configurator and decided not to use us?",
        "Right — worst case 60 seconds. Best case you find the exact accessory you've been wanting. Want the link?",
      ],
      callerNotes:
        "★ Line 1 is NEPQ — find the real blocker. ★ Line 2 is the magic line. ★ 3-NO: if they decline the link, exit: 'Totally get it. If anything changes, ITCQuickAttach.com. Take care.'",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Makes sense — I'll keep it to 20 seconds. Want me to just text you the configurator link? Look at it tonight, 30 seconds.",
        "Cool — sending it. Have a good one.",
      ],
      callerNotes:
        "★ 3-NO: this is their first no — offer the text as a different angle. ★ Get the cell number even if they're rushed. ★ If yes → CONFIG_LINK_SENT. If no → NOT_INTERESTED, exit fast.",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you AND text you the configurator — most TYM owners look at it on the tractor. What's the best mobile?",
      ],
      callerNotes:
        "★ Get BOTH if possible. The configurator is mobile-first — text matters more than email for this audience.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} here. We make tractor accessories out of Blossvale, NY — TYM-fit brush guards, SawBoss chainsaw carrier.",
        "Want me to text you our website so you can see we're real? You decide if it's useful.",
      ],
      callerNotes:
        "★ Slow down, sound human. Spam-paranoid TYM owners relax when you mention NY (real address) + the specific products. ★ Don't over-explain.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL. NEVER argue. NEVER ask why.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most TYM owners tell me that — usually accessories that didn't fit, brackets that broke, or returns nobody honored. We do it different: TYM-fit means TYM-fit, no adapters, and 30-day full-credit return if the install isn't right.",
        "Want to see the install video before you decide? Takes 90 seconds.",
      ],
      callerNotes:
        "★ Mirror — 'Got burned before?' Shut up. They'll vent. ★ Validate the pain (most guys tell me that), then flip with the three-thing-different frame. ★ The install video is the proof — easy yes.",
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
    callerNotes: [
      "★ MUST: 'Under a minute' — say it and mean it. Foresters respect time more than any other audience.",
      "★ FM DJ voice, but slightly faster pace than dealer/TYM. Match their work-rhythm energy.",
      "★ Full-time vs side question is qualifying — drives whether you push SawBoss + Chainbox or just SawBoss.",
      "★ Pause after the question. They'll answer in two words. Don't fill it.",
      "If gatekeeper picks up at a logging company → 'Need to talk to whoever buys the chainsaw gear. 90 seconds.'",
      "★ DON'T mention price for the first 60 seconds. Lead with time-saved, not dollars.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · job type",
    lines: [
      "Got it. What's giving you the most headaches right now — chainsaw transit, brush guard impacts, or just time burned re-rigging gear between jobs?",
    ],
    callerNotes: [
      "★ Listen for the pain. Don't pitch yet. Their answer drives which product leads.",
      "★ Chainsaw transit pain → SawBoss is the lead. Brush impact pain → brush guard. Re-rigging pain → Chainbox storage system.",
      "★ Pause after they answer. Then mirror the last 3 words back as a question — 'Re-rigging gear between jobs?' Watch them open up.",
      "If they say 'no real headaches' → ask 'how much time do you spend chaining the saw down between cuts?' Reframe as a hidden time cost.",
      "★ Take notes — you'll quote their pain back in the pitch.",
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
    callerNotes: [
      "★ 'The only one I know of' — soft confidence, not boast. Foresters hate marketing speak.",
      "★ 'American-made, replacement parts in stock' is the trust hook. They've been burned by import gear that breaks at month 6.",
      "★ Quote their qualify pain back: if they said 're-rigging takes 10 minutes a stop' → 'You said 10 minutes a stop — SawBoss kills that to under 30 seconds.'",
      "★ DON'T pitch Chainbox first if they only need SawBoss. Bundle is the upsell, not the lead.",
      "If they ask 'why fixed-mount, why not strap?' → 'Straps wear and snap. Fixed-mount keeps the bar from beating itself up — saves a $300 bar replacement.'",
      "★ End on a question. 'Sound like it'd cut your transit time?'",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · trial unit",
    lines: [
      "What I want to do is get you a unit on a 30-day trial — if it doesn't save you 10+ minutes per job, ship it back, no questions.",
      "Want me to lock that in?",
    ],
    callerNotes: [
      "★ The 30-day trial is the killer offer. Lead with it strong.",
      "★ '10+ minutes per job' is a real, defensible number. Don't soften it.",
      "★ AFTER 'lock that in?' — count to 4 Mississippi. First one to talk loses.",
      "If yes → confirm shipping address + best mobile for the install video.",
      "★ Mark outcome TRIAL_LOCKED — the win we track for forester audience.",
      "If they hesitate → 'You don't pay until day 31. Ship it back if it doesn't save the time. Worst case you're out a phone call.'",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the spec sheet",
    goal: "If they won't trial it, get the spec sheet in their hands.",
    lines: [
      "No problem — let me at least text you the SawBoss spec sheet. Steel gauge, mount points, weight rating. One page.",
      "What's the best mobile? I'll send it now.",
      "Once you've got it — give it 60 seconds tonight. If anything looks off, text me back and I'll get you a straight answer.",
    ],
    callerNotes: [
      "★ Foresters respect a one-page spec sheet way more than a sales catalog.",
      "★ 'Steel gauge, mount points, weight rating' — those are the three numbers they care about.",
      "★ Mark outcome SPEC_SHEET_SENT.",
      "Set a 48-hour callback. 'I'll check back Thursday — sound fair?'",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real blocker, then pin a specific time.",
    lines: [
      "What's making you sit on it? Most foresters say it's either price, durability question, or they want to see one in the field first — is that it?",
      "Got it. Friday after work or Monday morning — when's better for a quick callback?",
      "Either way, the spec sheet's on your phone tonight. If you decide it's not a fit, just text me 'pass' and I'm gone.",
    ],
    callerNotes: [
      "★ NEPQ on line 1. ★ Foresters work weekends — pin late Friday or Saturday morning, not midweek. ★ Mark CALLBACK + specific time.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the SawBoss — fixed-mount chainsaw carrier built for professional foresters running TYM, Kioti, Mahindra.",
      "I'll text you the spec sheet. 30-day trial if you want to see how it holds up. Talk soon.",
    ],
    callerNotes: [
      "★ Hang up → text spec sheet IMMEDIATELY. Mark VOICEMAIL.",
      "★ Under 20 seconds. Foresters don't listen to long VMs.",
      "★ Lead with 'SawBoss' — they recognize the product before they recognize the company.",
      "★ Mention the 30-day trial — that's the hook.",
    ],
  },
  objections: [
    {
      trigger: "I just throw the saw in the back",
      reply: [
        "Throw it in the back?",
        "Makes sense — until the bar gets bent or the chain catches a strap. SawBoss is $180 vs. a $300 bar replacement. Pays for itself the first time it saves the saw.",
      ],
      callerNotes:
        "★ Mirror first. ★ The $180-vs-$300 math is the closer. Don't soften it. ★ If they say 'never had that happen' → 'How long you been running? Most guys it's a when, not an if.'",
    },
    {
      trigger: "Too expensive for what it is",
      reply: [
        "Too expensive compared to what?",
        "Walk me through what 'too expensive' looks like — if I told you it'd save you 10 minutes a job, on say 4 jobs a day, that's 200 minutes a week. What's that worth to you?",
      ],
      callerNotes:
        "★ Mirror + math. The 200-minutes-a-week number is the hammer. ★ Let them name the dollar value — when THEY say 'that's worth $X', they've sold themselves.",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Makes sense — I'll keep it to 15 seconds. Want me to just text you the spec sheet? Read it tonight in 60 seconds.",
        "Cool — sending it. Stay safe out there.",
      ],
      callerNotes:
        "★ 'Stay safe out there' — forester rapport line. They notice you noticed. ★ Mark SPEC_SHEET_SENT or NOT_INTERESTED.",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. What part do you need to think through? Is it the price, the install, or whether it'll hold up in the field?",
        "Got it. Would it be the worst thing in the world if you took 60 seconds to look at the spec sheet and decided not to trial it?",
        "Right — worst case 60 seconds. Best case it saves you 10 minutes a job. Want the spec sheet?",
      ],
      callerNotes:
        "★ NEPQ + magic line + spec sheet pivot. ★ 3-NO: exit clean if they decline.",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you the spec sheet AND text it — most foresters look on their phone in the truck. What's the best mobile?",
      ],
      callerNotes:
        "★ Foresters live in the truck. Text matters more than email here.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} here. We make the SawBoss chainsaw carrier out of Blossvale, NY.",
        "Want me to text you our website so you can see we're real? You decide if it's useful.",
      ],
      callerNotes:
        "★ Foresters hate spam more than anyone — they've been burned by 'tool subscription' scams. Calm voice + specific product name + NY address breaks the spam frame.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL. NEVER argue.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most foresters say the same — gear breaks in month 4, replacement parts impossible to find, vendor disappeared. We do it backwards: American-made, replacement parts on the shelf, 30-day trial.",
        "Want to see the spec sheet before you decide? One page.",
      ],
      callerNotes:
        "★ Mirror + flip with the three-thing-different frame. ★ 'Replacement parts on the shelf' is the killer line for foresters — they've all had vendors disappear.",
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
    callerNotes: [
      "★ FM DJ voice — calm, low. Hunters respond to outdoorsy, not salesy.",
      "★ The on-vs-off-tractor question is qualifying — drives whether firearm mount or brush guard leads.",
      "★ Pause after the question. They'll talk about their setup if you let them.",
      "Use first name early.",
      "★ DON'T mention 'firearm' until they bring up hunting context. Some hunters get cagey about firearms over the phone.",
      "If gatekeeper (spouse) → 'Hey, is {firstName} around? It's about his hunting tractor setup.' Spouses know that frame.",
      "★ Match their energy — they're outdoorsy, not corporate. Drop a 'yeah man' if it fits.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · firearm + ground type",
    lines: [
      "What kind of firearm — rifle, shotgun, crossbow? And how thick's the brush you're punching through to get there?",
    ],
    callerNotes: [
      "★ Two questions in one — the firearm type drives the mount, the brush thickness drives the brush guard.",
      "★ Listen for 'crossbow' specifically — different mount, different price point.",
      "★ Pause after they answer. Then mirror back: 'Thick stuff, all season?' Get them confirming.",
      "If they say 'don't really hunt off it' → pivot to brush guard + lights for food-plot work.",
      "★ Take notes — you'll quote what they said back in the pitch.",
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
    callerNotes: [
      "★ 'Secure, quiet, quick-release' — three magic words for hunters. Quiet matters most for stand approach.",
      "★ 'Hundreds of these to hunters' is social proof — hunters trust other hunters.",
      "★ Mention October-December — places them in the season context, urgency builds naturally.",
      "★ DON'T quote price unprompted ($129 firearm mount, $249 brush guard) — let them ask.",
      "If they ask about caliber/weight rating → 'Up to .308 rifle, 12-gauge shotgun, all crossbows. ROPS-rated for tractor frame.'",
      "★ End on a question. 'Sound like the right setup for your land?'",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · season prep",
    lines: [
      "What's the ship-by date you'd want it for — opening weekend, or earlier for scouting season?",
      "I can get you on the schedule and text you the install video so you can see the mount before it ships.",
    ],
    callerNotes: [
      "★ Ship-by-date question is assumptive — assumes they're buying.",
      "★ 'Opening weekend or scouting season' is a two-option close.",
      "★ AFTER the question — count to 4 Mississippi.",
      "If they pick a date → confirm address + mobile for the install video.",
      "★ Mark outcome SHIP_DATE_LOCKED — that's the win for hunter audience.",
      "If they hesitate → 'No commitment yet — just want to know when you'd want it on the tractor.'",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the configurator",
    goal: "If they won't lock a ship date, get the link in their hand.",
    lines: [
      "No problem — let me text you our configurator. You can see the firearm mount on a TYM, Kioti, or Mahindra and pick the rifle/shotgun/crossbow setup.",
      "What's the best number? I'll send it now.",
      "Take a look this weekend before scouting. If anything looks right, text me back and we'll get it on the truck before opening day.",
    ],
    callerNotes: [
      "★ Configurator does the work — show, don't tell.",
      "★ 'Before scouting' or 'before opening day' — frame against the season they care about.",
      "★ Mark outcome CONFIG_LINK_SENT.",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real blocker, then pin a specific time.",
    lines: [
      "What's making you sit on it? Most hunters say it's price, fit on their tractor, or they want to see one mounted first — is that it?",
      "Got it. Saturday morning or Sunday afternoon — when's better for a quick callback?",
      "Either way, configurator's on your phone tonight. If you decide it's not for you, just text me 'pass' and I'm gone.",
    ],
    callerNotes: [
      "★ NEPQ on line 1. ★ Hunters are weekend people — pin Saturday or Sunday. ★ Mark CALLBACK + specific time.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make the firearm-mount + brush-guard combo for hunters running tractors on private land.",
      "I'll text you the install video. Call me back when you've got a second.",
    ],
    callerNotes: [
      "★ Hang up → text install video link IMMEDIATELY. Mark VOICEMAIL.",
      "★ Under 20 seconds.",
      "★ 'On private land' — important framing. Public-land hunters have different rules + concerns.",
      "★ Install video is the hook — hunters love watching gear go on.",
    ],
  },
  objections: [
    {
      trigger: "I just lay it across the seat",
      reply: [
        "Lay it across the seat?",
        "I hear that a lot — until the first time you hit a rut and the gun ends up muzzle-down in the dirt. Mount's $129 and bolts on in 10 minutes.",
      ],
      callerNotes:
        "★ Mirror first. ★ The 'muzzle-down in the dirt' image lands hard — every hunter has had that almost happen. ★ $129 + 10 minutes is the closer math.",
    },
    {
      trigger: "Is it legal in my state?",
      reply: [
        "Good question — depends on whether you're transporting on private land or public, and whether the firearm's loaded or cased.",
        "Check your state DNR site, but on private land for transport, every state I know of allows it. We'll send the install guide either way.",
      ],
      callerNotes:
        "★ DON'T pretend to know every state's law. Refer them to DNR + give the broad-strokes answer. ★ 'We'll send the install guide either way' keeps the conversation alive even if they need to verify.",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Makes sense — I'll keep it to 15 seconds. Want me to just text you the install video? Watch it tonight, 60 seconds.",
        "Cool — sending it. Have a good one.",
      ],
      callerNotes:
        "★ 3-NO: first no, offer the text. ★ Mark INSTALL_VIDEO_SENT or NOT_INTERESTED.",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. What part do you need to think through? Is it the price, the fit on your tractor, or whether it'll work for your firearm?",
        "Got it. Would it be the worst thing in the world if you took 60 seconds to watch the install video and decided not to use us?",
        "Right — worst case 60 seconds. Best case you've got it on the tractor before opening weekend. Want the link?",
      ],
      callerNotes:
        "★ NEPQ + magic line + season-urgency. ★ 3-NO: exit clean if they decline.",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you AND text the install video — most hunters watch on the phone in the truck. What's the best mobile?",
      ],
      callerNotes:
        "★ Get BOTH. The install video is mobile-first content.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} here. We make tractor accessories for hunters out of Blossvale, NY — firearm mounts, brush guards.",
        "Want me to text you our website so you can see we're real? You decide if it's useful.",
      ],
      callerNotes:
        "★ Hunters are wary of firearm-related calls — calm voice + specific product + NY address breaks the spam frame fast.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most hunters tell me that — usually a mount that rattled loose, plastic that cracked in the cold, or a brush guard that bent on the first hit. We do it backwards: steel construction, cold-weather rated, 30-day full-credit return.",
        "Want to see the install video before you decide? 60 seconds.",
      ],
      callerNotes:
        "★ Mirror + flip with the three-thing-different frame. ★ 'Cold-weather rated' is critical for hunters — they've all had plastic crack in deer-stand temperatures.",
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
    callerNotes: [
      "★ MUST: 'Congrats on the tractor' — this is the warm hook. New tractor owners LOVE talking about their tractor.",
      "★ FM DJ voice but warmer than dealer/forester. You're a buddy congratulating them, not pitching.",
      "★ Pause after each question. They'll tell you their whole story if you let them.",
      "★ This is the longest qualify of any audience — let them talk. The longer they talk, the more they like you.",
      "If they say 'just had to get one' — you've got a story-teller. Ask one follow-up: 'How's it been so far?'",
      "★ Use first name three times in the first 60 seconds. Hobbyists eat that up.",
      "★ Smile. Hobbyists hear smiles louder than any other audience.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · what they're learning the hard way",
    lines: [
      "What's surprised you the most so far? Like, what do you wish you'd known about owning a tractor before you bought it?",
    ],
    callerNotes: [
      "★ This is the GOLD question. They'll tell you exactly which accessory to lead with.",
      "★ Pause LONG after this question. They'll think for 5 seconds, then tell you the truth.",
      "★ Listen for: 'I didn't realize how much I'd cut brush' → SawBoss + brush guard. 'I keep losing tools' → toolbox kit. 'It's louder than I thought' → no upsell here, just empathize.",
      "★ Mirror the surprise back: 'You wish you'd known about the brush?' Watch them open up further.",
      "If they say 'nothing surprised me' → ask 'what do you wish you had on it that didn't come stock?'",
      "★ Take detailed notes — you'll quote their exact words back in the pitch.",
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
    callerNotes: [
      "★ Lead with the SKU that matched their qualify pain. If they said 'losing tools' — start with toolbox kit.",
      "★ 'Everyone wishes they'd bought day one' — this is the killer line. Hobbyists FEAR being the only one who didn't know.",
      "★ Stack price low-to-high — toolbox first ($35), brush guard last ($249). Lower entry-point = easier first yes.",
      "★ 'You WILL be cutting brush' — confident future-pacing. Don't soften it.",
      "★ End on a question. 'Sound like the kind of setup you've been looking for?'",
      "If they ask about install → 'Toolbox is 5 minutes, SawBoss is 15, brush guard is 20. All bolt-on, no drilling.'",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · the configurator",
    lines: [
      "What I want to do is text you our 'Build Your Dream Tractor' configurator — you toggle accessories and see them on your tractor before buying.",
      "Best number for the link?",
    ],
    callerNotes: [
      "★ 'Build Your Dream Tractor' — say the full name. Hobbyists love the dream framing.",
      "★ 'Best number' beats 'what's your number'.",
      "★ AFTER the ask — count to 4 Mississippi.",
      "★ Mark outcome CONFIG_LINK_SENT.",
      "If they hesitate → 'I'll send to the number I'm calling. Sound good?' Send to dialed number.",
      "Send the SMS WHILE they're on the phone — the live arrival is part of the close.",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the configurator",
    goal: "If they won't engage, get the configurator in their hand for the weekend.",
    lines: [
      "No problem — let me text you the configurator link so you can play with it this weekend on the tractor.",
      "What's the best number? Takes 30 seconds.",
      "Once you've got it — toggle a couple accessories, see how they look on your model. If anything jumps out, text me and I'll answer any questions.",
    ],
    callerNotes: [
      "★ 'Play with it this weekend' — hobbyists treat the configurator like a toy. Lean into that.",
      "★ Mark CONFIG_LINK_SENT.",
      "★ Set 48-hour callback if they engage at all.",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' — find the real blocker, then pin a specific time.",
    lines: [
      "What's making you want to sit on it? Most first-year owners say price, or they want to wait until they actually need something — is that it?",
      "Got it. Saturday or Sunday — when's better for a quick callback after you've used it a bit?",
      "Either way, configurator's on your phone. If you decide it's not for you, just text 'pass' and I'm gone.",
    ],
    callerNotes: [
      "★ NEPQ on line 1. ★ 'Wait until I need something' is THE hobbyist objection — surface it on purpose. ★ Mark CALLBACK + specific weekend day.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach. We make accessories for sub-compact tractors — toolbox kits, SawBoss chainsaw carrier, brush guards.",
      "I'll text you a configurator so you can see what fits your setup. Talk soon.",
    ],
    callerNotes: [
      "★ Hang up → text configurator IMMEDIATELY. Mark VOICEMAIL.",
      "★ Under 20 seconds.",
      "★ 'Sub-compact tractors' — they recognize their model.",
      "★ Warm tone — they're newbies, you're a friendly voice.",
    ],
  },
  objections: [
    {
      trigger: "I don't even know what I need yet",
      reply: [
        "Don't know yet?",
        "Totally get it — that's why we built the configurator. You answer 5 questions and it tells you what most owners with your setup buy first.",
        "Want me to text you the link?",
      ],
      callerNotes:
        "★ Mirror first. ★ The configurator IS the answer to 'I don't know what I need' — lean into that. ★ '5 questions' makes it feel small.",
    },
    {
      trigger: "I'll wait until I actually need something",
      reply: [
        "Wait till you need it?",
        "Smart — most people do. Just one thing: the brush guard goes on BEFORE the first hit, not after. Once it's bent, it's bent.",
        "Either way, want the configurator link to bookmark?",
      ],
      callerNotes:
        "★ Mirror first. ★ 'Once it's bent, it's bent' is the hammer line — hobbyists feel that loss aversion immediately. ★ End with a low-friction ask (just bookmark) — not a buy ask.",
    },
    {
      trigger: "It's too expensive",
      reply: [
        "Too expensive compared to what?",
        "Fair — what's your number? The toolbox kit's $35, SawBoss is $180, brush guard's $249.",
        "Most first-year owners pick up the toolbox kit first — under $40, immediate use every time you climb on. Would it be the worst thing in the world if you took 60 seconds to look at the configurator and decided not to use us?",
      ],
      callerNotes:
        "★ MIRROR + magic line. ★ Toolbox kit at $35 is the entry-point closer. ★ Exit offer: 'If you say no right now I'll never call again — but take a look first.'",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Makes sense — I'll keep it to 15 seconds. Want me to just text the configurator link? Look at it whenever you're on the tractor next.",
        "Cool — sending it. Enjoy that tractor.",
      ],
      callerNotes:
        "★ 3-NO: first no, offer the text. ★ 'Enjoy that tractor' — warm exit. They remember it.",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. What part do you need to think through? Is it the price, the fit, or what to start with?",
        "Got it. Would it be the worst thing in the world if you took 60 seconds to look at the configurator and decided not to use us?",
        "Right — worst case 60 seconds. Best case you find what you've been wanting. Want the link?",
      ],
      callerNotes:
        "★ NEPQ + magic line. ★ 3-NO: exit clean.",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you AND text the configurator — most hobbyists look at it on the tractor. What's the best mobile?",
      ],
      callerNotes:
        "★ Get BOTH. Configurator is mobile-first.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} here. We make tractor accessories out of Blossvale, NY — toolbox kits, SawBoss, brush guards.",
        "Want me to text you our website so you can see we're real? You decide if it's useful.",
      ],
      callerNotes:
        "★ Calm voice + product names + NY address breaks the spam frame for new tractor owners.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most first-year owners tell me that — usually accessories that didn't fit, brackets that broke, or shipping that took 3 weeks. We do it backwards: bolt-on no-drill fit, steel construction, ships same-day.",
        "Want to see the configurator before you decide? 30 seconds.",
      ],
      callerNotes:
        "★ Mirror + flip with the three-thing-different frame. ★ 'Ships same-day' is the new-owner trust hook — they hate waiting.",
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
      "★ MUST: 'Not a sales call, promise' — disarms instantly. Customers expect a sales pitch when ITC calls.",
      "★ Use the actual product they bought — pull from CRM. Generic 'how's it going' kills the rapport.",
      "★ Warmest tone of any audience — you're a friend calling, not a rep.",
      "★ Pause LONG after the holding-up question. Let them tell you about it.",
      "If they say 'great, no issues' — perfect, advance to qualify.",
      "If they say 'actually had a problem' — STOP the script. Solve the problem first. Referral ask is dead until they're happy again.",
      "★ Use first name twice in the first 30 seconds.",
    ],
  },
  qualify: {
    id: "qualify",
    title: "Qualify · friction or wins",
    lines: [
      "Anything you wish was different about it? Or anything that's been a nice surprise?",
      "And how'd you originally find us — Google, a buddy, a dealer?",
    ],
    callerNotes: [
      "★ The 'wish was different' question is critical — gives them permission to share negatives without prompting. If they have one, fix it before asking for a referral.",
      "★ 'Nice surprise' surfaces the testimonial gold — write down the exact words.",
      "★ The how-did-you-find-us question feeds product strategy — track the channel that brings the most referral-ready customers.",
      "★ Pause after each question. Don't combine them.",
      "If they say 'a buddy' — that's a referral chain. Ask 'who?' so you can thank that referrer too.",
    ],
  },
  pitch: {
    id: "pitch",
    title: "The ask · referral OR testimonial",
    lines: [
      "Awesome. The reason I'm calling: we're growing the community side of ITC and we're trying to get the word out the right way — through actual owners, not paid ads.",
      "Two quick asks, you can say no to either: (1) Would you be willing to record a 30-second video of you using it on your tractor — we'd send you a free toolbox kit as a thank-you. (2) Got any tractor buddies who'd be a fit for one of our products?",
    ],
    callerNotes: [
      "★ 'Through actual owners, not paid ads' — community customers eat this up. Authenticity hook.",
      "★ 'You can say no to either' — pre-handles the awkward. Customers relax instantly.",
      "★ The free toolbox kit is the killer offer — $125 retail value for 30 seconds of phone video.",
      "★ Two asks gives them an out — no on the video, yes on the referral. Or vice versa.",
      "★ Pause after the second question. Count to 4. Let them think.",
      "If they hesitate → 'No pressure either way. Even one tractor buddy's name is huge for us.'",
    ],
  },
  cta: {
    id: "cta",
    title: "Close · make it easy",
    lines: [
      "If you've got a name — first name + cell — I'll reach out personally and tell them you said hey.",
      "And for the video, I'll text you a link with 3 simple shots we need. No pressure, no rush.",
    ],
    callerNotes: [
      "★ 'Tell them you said hey' is the magic line — frames it as a warm intro, not a sales handoff.",
      "★ '3 simple shots' makes the video feel small. The link spells out exactly what to record.",
      "★ AFTER the ask — count to 4. Don't fill the silence.",
      "If they give a name → confirm spelling, confirm cell, ask 'when's the best time to reach them?'",
      "★ Mark outcome REFERRAL_RECEIVED or VIDEO_BRIEF_SENT.",
      "If both → mark BOTH and send a hand-written thank-you card. (Yes, paper. It works.)",
    ],
  },
  textTheLink: {
    id: "textTheLink",
    title: "Fallback · text the video brief",
    goal: "If they won't refer or commit on the call, get the video brief in their hand.",
    lines: [
      "No problem — let me at least text you the video brief link. You'll see the 3 shots we need. If anything looks doable, you can record it whenever.",
      "What's the best number? I'll send it now.",
      "Free toolbox kit if you do — and if you change your mind on the referral, just text me a name later.",
    ],
    callerNotes: [
      "★ Use this when they're polite but unsure on the spot.",
      "★ The video brief is low-pressure — they decide later.",
      "★ Mark outcome VIDEO_BRIEF_SENT.",
      "★ Set a 7-day callback. 'Cool if I check back next week?' Get a soft yes.",
    ],
  },
  callbackClose: {
    id: "callbackClose",
    title: "Close on a callback",
    goal: "If they say 'maybe' on referral or video — find the blocker, pin a specific time.",
    lines: [
      "What's making you sit on it? Most owners say it's either they want to think about who'd be a fit, or they don't love being on camera — is that it?",
      "Got it. Want me to check back this weekend after you've thought about it?",
      "Either way, no pressure. The video brief's on your phone. If anything comes to mind, text me a name anytime.",
    ],
    callerNotes: [
      "★ NEPQ on line 1 — surface the real friction. ★ Most common is camera shyness — that's why the referral path stays open even if video's a no. ★ Mark CALLBACK + day.",
    ],
  },
  voicemail: {
    id: "voicemail",
    title: "Voicemail",
    lines: [
      "Hey {firstName}, {callerFirstName} from ITC Quick Attach — not a sales call, just checking in on the [product] and seeing if you'd be up for a quick ask.",
      "Call me back when you've got a sec.",
    ],
    callerNotes: [
      "★ 'Not a sales call' — say it. They'll listen to the whole VM if you set that frame.",
      "★ Hang up → text 'Hey {firstName} — left you a quick VM. No pressure, just wanted to check in on the [product] and run a quick ask by you. Whenever you've got a minute.'",
      "★ Under 15 seconds.",
      "★ Mark outcome VOICEMAIL_COMMUNITY.",
      "Don't text the video brief link in the VM follow-up — wait for the live conversation. Keep mystery.",
    ],
  },
  objections: [
    {
      trigger: "I don't know anyone who needs that",
      reply: [
        "Don't know anyone?",
        "All good — totally fine. Would you do the video instead? Free toolbox kit, takes 90 seconds.",
      ],
      callerNotes:
        "★ Mirror first. ★ Pivot to video — it's the easier yes when referral is dry. ★ Don't push for a name twice — respect the no.",
    },
    {
      trigger: "I'm not really comfortable on camera",
      reply: [
        "Total respect. Forget the video — just one tractor friend who'd be a fit? I'll do all the work.",
      ],
      callerNotes:
        "★ INSTANT pivot. Camera-shy customers FEAR the ask staying open — drop it the second they signal discomfort. ★ 'I'll do all the work' is the close — they just give a name, ITC handles the rest.",
    },
    {
      trigger: "I'm busy / bad time / not now",
      reply: [
        "Totally get it — quick one. Want me to text you a link with the video brief? You can look at it whenever, no rush.",
        "Cool — sending it. Talk soon.",
      ],
      callerNotes:
        "★ Don't fight it. Send the brief link, mark VIDEO_BRIEF_SENT, exit warm. Existing customers are forever — no rush.",
    },
    {
      trigger: "I'll think about it",
      reply: [
        "Of course. Want me to text you the video brief and any tractor-buddy names that come to mind, you can text me later? No deadline.",
        "Cool — sending the brief now. Whenever something pops up, just shoot it over.",
      ],
      callerNotes:
        "★ Don't push the magic line on existing customers — that's for cold prospects, not relationship calls. ★ Make it easy to come back later.",
    },
    {
      trigger: "Send me an email instead",
      reply: [
        "Happy to. What's the best email?",
        "I'll email you the video brief AND text it — text usually gets read first. What's the best mobile?",
      ],
      callerNotes:
        "★ Get both. Existing customer = high-value contact, double-channel them.",
    },
    {
      trigger: "Is this a robocall / scam / spam?",
      reply: [
        "Nope — real person. {callerFirstName} from ITC Quick Attach. You bought the [product] from us back in [date if known]. Just calling to check in.",
        "Want me to text you so you've got my number? You decide if it's useful.",
      ],
      callerNotes:
        "★ Reference the actual product + ideally the purchase date. Nothing breaks the spam frame faster than 'you bought the SawBoss in March.' ★ Pull from CRM before dialing.",
    },
    {
      trigger: "Take me off your list / do not call",
      reply: [
        "Done. Removed right now. You won't hear from us again. Sorry to bother you.",
      ],
      callerNotes:
        "★ Mark DO_NOT_CALL even for existing customers. NEVER argue. ★ Flag the prospect record so future referral programs skip them too.",
    },
    {
      trigger: "I've had a bad experience with another vendor / got burned before",
      reply: [
        "Got burned before?",
        "Most owners tell me that — that's actually why I'm calling existing customers like you. We're trying to grow through people who've actually used our stuff, not paid ads or random outreach.",
        "Even one name of someone who's been burned by another brand — I'll personally make sure they get the right product. And free toolbox kit for you if you record a quick video about your experience with us.",
      ],
      callerNotes:
        "★ Mirror first. ★ Reframe: their bad experience is the EXACT reason we're growing through real customers. ★ This objection is actually a setup for a strong referral — the burned-once-buyer trusts a real-customer recommendation way more than ads.",
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
 * Missing vars fall back to safe stand-ins so a rep can't accidentally
 * read "[firstName]" aloud mid-call.
 */
export function fillItcVars(line: string, vars: ItcScriptVars): string {
  const fallbacks: Record<string, string> = {
    callerFirstName: "the team",
    firstName: "there",
    bizName: "your shop",
    tractorBrand: "your tractor",
    acreage: "your land",
    city: "your area",
    state: "your state",
    configUrl: "https://itcquickattach.com",
  };
  return line.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = (vars as Record<string, string | undefined>)[key];
    if (value && value.trim()) return value;
    return fallbacks[key] ?? "";
  });
}

/** Big anchor mantra shown as a top banner on the workspace. */
export const ITC_HORMOZI_MANTRA =
  "Stack the nos fast. Every no is one step closer to the yes.";

/** Pre-call coaching shown BEFORE every dial.
 *  ★ MUST KNOW tips first — burn these into muscle memory over your first 100 calls. */
export const ITC_HORMOZI_TIPS_FULL: ItcCallTip[] = [
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
    body: "'Would it be the worst thing in the world if you took 60 seconds to look at the configurator and decided not to use us?' They say no → objections evaporate. Use it every single call.",
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
    body: "Ask questions until THEY surface the pain. 'What's giving you the most headaches right now?' A doctor doesn't prescribe before diagnosing. Neither do you.",
  },
  {
    id: "mirror",
    emoji: "🪞",
    title: "★ MUST: Mirror — repeat their last 3 words as a question",
    body: "They say 'I already have a brush guard.' You say: 'Already have one?' Silence follows. They fill it with the REAL objection. Works on every call. No prep needed.",
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
    body: "'If this saved you 10 minutes a job, on 4 jobs a day, what would that be worth to you?' When THEY say the outcome in their own words, they've already half-sold themselves.",
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
    title: "Never trash their current vendor",
    body: "'Most of our dealers carry us alongside another brand' plants the option without insulting anyone. They have to defend a choice they can't defend.",
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
    body: "If you know a peer dealer carries us, lead with it: 'Cascade Tractor Supply has been moving these well.' A peer name in the first sentence triples pickup rate.",
  },
];

/** Backwards-compat flat string array (used by older UI surfaces). */
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

/** Gatekeeper / unknown-owner intro. Used when firstName/bizName aren't on file. */
export const ITC_INTRO_UNKNOWN_OWNER: ItcScriptSection = {
  id: "intro",
  title: "Open the call (gatekeeper / unknown owner)",
  goal: "Owner unknown — get to whoever buys accessories. Same assumptive frame as the main intro, no name guessing.",
  lines: [
    "Hey — who handles new accessory lines over there?",
    "This is {callerFirstName} with ITC Quick Attach out of Blossvale, New York — we make tractor accessories: SawBoss chainsaw carriers, brush guards, toolbox kits.",
    "Are they around? 60 seconds tops — quick reason for the call: we're picking up shelf space with dealers like Cascade Tractor Supply and I want to see if you all are a fit.",
    "[When transferred] — {callerFirstName} from ITC Quick Attach. We make the SawBoss + brush-guard line. You get texts at this number? I'll send the wholesale catalog while we talk.",
    "[Click TEXT CATALOG ↘ — fires the wholesale catalog to the dialed number]",
  ],
  callerNotes: [
    "★ OWNER NAME UNKNOWN — DO NOT guess a name. Ask for the role first.",
    "If gatekeeper says 'WHAT'S THIS REGARDING?' → 'New accessory line, made in NY, dealer margin in the 35-40% range. 60 seconds with whoever buys.' Specific = trust.",
    "If gatekeeper says 'I HANDLE IT' → run the dealer intro on them, swap {firstName} for 'you' and {bizName} for 'your shop'.",
    "★ ASSUMPTIVE FRAMING. 'I'll send the catalog while we talk' presumes the gift exists. They feel behind, not pitched.",
    "★ DON'T ASK FOR THEIR NUMBER. You just dialed it. Send to the dialed number — TEXT CATALOG fires SMS automatically.",
    "★ 'You get texts at this number?' is a micro-yes that earns the next 60 seconds — and the catalog has already fired, so the proof is mid-air.",
    "★ NEVER start with 'Hey, is this {firstName}?' — sounds like a telemarketer when you don't actually know the name.",
    "Once they have the catalog in hand → advance to Qualify while they pull it up.",
  ],
};

/** Voicemail variant when firstName isn't on file. */
export const ITC_VOICEMAIL_UNKNOWN_OWNER: ItcScriptSection = {
  id: "voicemail",
  title: "Leave a voicemail (no name)",
  goal: "Hook first — product before identity. Get the right person to call back without an awkward 'Hey there.'",
  lines: [
    "Hey — looking for whoever handles new accessory lines. {callerFirstName} with ITC Quick Attach out of Blossvale, NY. We make the SawBoss chainsaw carrier and the TYM/Kioti/Mahindra brush-guard line.",
    "I'm texting the wholesale catalog to this number right now — takes a minute to look. If it's a fit, text back 'catalog' and I'll get our wholesale rep on a quick call. Either way the catalog's yours.",
  ],
  callerNotes: [
    "★ Hang up → TEXT CATALOG first → mark VOICEMAIL.",
    "★ No name — role-based ('whoever handles new accessory lines'). 'Hey there!' sounds like spam.",
    "★ Hook first. Product before introducing yourself. Curiosity beats intro on voicemail every time.",
    "★ 'Text back catalog' gives them a zero-friction reply — lower bar than calling back.",
    "About 1 in 4 voicemail-then-text combos get a reply. Always text after the VM.",
    "★ Under 25 seconds. Every extra second = lower callback rate.",
  ],
};
