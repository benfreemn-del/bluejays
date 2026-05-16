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

/* ───────────────────────────────────────────────────────────────────────
 * VERTICAL-BRANCH OPENERS — added 2026-05-14 per ICP niche-down lock.
 *
 * BlueJays now targets only two verticals: niche product manufacturers
 * (Tekky + ITC anchors) and indie authors (Bloodlines anchor). REI dropped
 * for 90 days. The full script below is being rewritten in Phase 2 (Days
 * 24-30) to branch top-to-bottom per vertical. This Phase 1 minimal change
 * surfaces the first 30-60 seconds of script per vertical, so Madie can
 * say the right thing in the opening 5 lines based on what's on the
 * prospect's lead row.
 *
 * Frameworks: "Customer Dream Layout (Show 4 Wild Ideas)" + "Damaging
 * Admissions Frontload" (Joel batch) — caller names the vertical-specific
 * outcome first, then filters out misfit prospects up front.
 *
 * Usage in the LeadPicker.client.tsx: pull prospect.category, map to one
 * of: 'manufacturer' | 'author' | 'referral'. Default 'referral' for any
 * prospect outside the two ICP verticals.
 * ─────────────────────────────────────────────────────────────────────── */

export type VerticalKey = "manufacturer" | "author" | "referral";

export type VerticalOpener = {
  /** Short label shown above the script — Madie knows which branch she's reading. */
  label: string;
  /** First 4-6 lines of the call that lock the frame. Read in order. */
  openingLines: string[];
  /** Note shown to Madie BEFORE reading — coaching, not script. */
  callerNote: string;
};

export const VERTICAL_OPENERS: Record<VerticalKey, VerticalOpener> = {
  manufacturer: {
    label: "🏭 Manufacturer vertical (Tekky / ITC pattern)",
    openingLines: [
      "Hey {firstName} — this is {partnerFirstName} from BlueJays. Quick call, takes 2 minutes.",
      "I'm reaching out because we work with product manufacturers like {bizName} — folks who make a real product and have dealers or distributors moving it.",
      "Honest question — when one of your dealers sells a unit of your product, are you making more on that sale, or are they?",
      "Most makers we talk to: the dealer is making more. Because the dealer owns the customer. You don't.",
      "We just helped a tractor-accessory manufacturer (ITC Quick Attach) fix that. And a soccer-training-gear brand (Tekky). Same shape of problem.",
      "Worth showing you the 60-second version of what we built them? I can text you the link and you tell me yes or no.",
    ],
    callerNote: "You're not selling a website. You're selling 'own your customer relationship.' If they say 'I already have a website' — that's not the pitch. The pitch is the dealer / distributor margin problem. Ask: 'is your distributor making more than you on each unit?' If yes → they're in. If no → they're already running their own funnel and don't need us yet.",
  },
  author: {
    label: "📖 Indie author vertical (Bloodlines pattern)",
    openingLines: [
      "Hey {firstName} — {partnerFirstName} from BlueJays. Two minutes, then I'll let you write.",
      "I'm reaching out because we work with indie fiction authors — folks who have book #1 live and are working on the rest of a series.",
      "Quick question — when someone finishes your first book on Kindle, what's the next thing that happens on YOUR side? Do you hear from them, or do they just disappear into Amazon?",
      "Most authors we talk to: the reader disappears. Goodreads owns them. Amazon owns them. The author doesn't.",
      "We built Preston James Hunsaker's Bloodlines saga a bespoke showcase — world map, magic system, faction quiz, newsletter capture, retargeting pixels. So when book #2 drops, every book-#1 reader gets pulled back in.",
      "Worth showing you the 60-second version? I'll text the link, you tell me yes or no.",
    ],
    callerNote: "You're not selling 'a website for an author.' You're selling 'every book-1 reader becomes a book-2-3-4 reader.' If they say 'I have a Squarespace already' — that's the gap, not the win. Ask: 'does your Squarespace know who finished book 1?' Almost always no. That's the pitch.",
  },
  referral: {
    label: "🤝 Referral / unknown vertical fallback",
    openingLines: [
      "Hey {firstName} — {partnerFirstName} from BlueJays. Two-minute call.",
      "Reaching out because {referralContext}. I'd love to see if what we do is a fit for {bizName}.",
      "Real quick — we work two tiers. The $997 custom website tier is open to most businesses (service trades, local businesses, anyone who wants a great site). The $10k AI Marketing System tier is for product manufacturers and indie authors only — that one has tighter math.",
      "What tier are you curious about? And what does {bizName} sell — physical product, digital product, or a service?",
      "Either way, free 60-second audit first, then we build a custom preview before you pay anything. Worth a look?",
    ],
    callerNote: "Default branch when the prospect's category isn't clearly manufacturer or author. Lead with the tier-fit question — the $997 site is open to service trades, the $10k AI System isn't. If they're a service trade asking about the $10k tier, route them down to $997. If they sell a product, escalate to the manufacturer branch. If they write fiction, escalate to author branch.",
  },
};

/* ───────────────────────────────────────────────────────────────────────
 * VERTICAL-SPECIFIC PITCH + OBJECTIONS — added 2026-05-14 (Phase 4 of
 * niche-down). These run AFTER the opener has landed (prospect said yes
 * to "worth showing you the 60-second version?") and they're staring at
 * the preview link Madie just texted them.
 *
 * The existing `HORMOZI_CALL_SCRIPT.pitch` and `HORMOZI_CALL_SCRIPT.objections`
 * stay intact for backwards compat — service-trade prospects (and any
 * legacy prospect on the $997 ladder) get the generic version. When the
 * prospect.category resolves to manufacturer or author, LeadPicker uses
 * VERTICAL_PITCH[vertical] + concatenates VERTICAL_OBJECTIONS[vertical]
 * into the objection menu.
 *
 * Frameworks (Hormozi KB):
 *   · "Customer Dream Layout (Show 4 Wild Ideas)" — pitch shows them
 *     the bonus stack their vertical unlocks
 *   · "Damaging Admissions Frontloaded" — objection handling leads
 *     with the constraint, not the value
 *   · "Self-Qualifying via Friction List" — objections that pre-empt
 *     misfit prospects (too early authors, distributor-loyal mfgs)
 * ─────────────────────────────────────────────────────────────────── */

export const VERTICAL_PITCH: Record<"manufacturer" | "author", ScriptSection> = {
  manufacturer: {
    id: "pitch-mfg",
    title: "Pitch — manufacturer vertical",
    goal: "They're staring at the preview. Direct their eye to the dealer/DTC split. Magic question → close the call.",
    lines: [
      "Look at the homepage real quick — see the DTC storefront on top + the dealer locator right below it? Same product catalog, two surfaces. End-buyers who want to order direct can finally find you. Your dealers still get every territory install they handle today.",
      "[Pause — wait for 'yeah' or 'I see it'] Based on what you told me about your dealer network, the math is roughly this: every direct-order customer you capture is one your distributor isn't middling. Even if 80% of volume stays through dealers, the 20% direct compounds in margin AND in retargetable audience for ad spend.",
      "Honest question — would it be the worst thing in the world if you gave Ben 15 minutes, saw what he'd change about your specific product catalog and dealer-locator setup, and decided not to use us?",
      "Right. Worst case 15 minutes. Best case you stop losing every direct-order customer to a Google search that lands on your dealer's website. He's got Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ DIRECT THEIR EYE to the DTC + dealer split visible on the preview. Tekky and ITC anchors both have this layout — point to it.",
      "★ HORMOZI MAGIC LINE in line 3. Pre-handles 'I don't want to be sold to' before they think it.",
      "★ AFTER 'decided not to use us?' — count to FOUR Mississippi in silence. First to talk loses.",
      "★ If they ask HOW MUCH → see howMuch-mfg objection. NEVER quote price during the pitch — quote during the call with Ben.",
      "★ If they push back on 'my dealers wouldn't like this' → see dealersWontLike objection. The dealer-locator IS the dealer-protection answer.",
      "★ If they're already on Amazon → see amazonAlready objection. Amazon is rented audience, this is owned.",
    ],
  },
  author: {
    id: "pitch-author",
    title: "Pitch — indie author vertical",
    goal: "They're looking at the Bloodlines-pattern preview. Direct their eye to the interactive features. Magic question → close.",
    lines: [
      "Look at the homepage real quick — see the world-map / character-roster / faction-quiz at the top? Each one is a newsletter capture point. A reader who hits the site doesn't just see a book cover — they get pulled INTO your world. We built Preston James Hunsaker exactly this for the Bloodlines saga.",
      "[Pause — wait for 'yeah' or 'I see it'] If book #2 dropped tomorrow, would your current site know who finished book #1? Right — Goodreads knows. Amazon knows. You don't. Every book-1 reader who isn't on your list is a customer your book #2 launch will never find.",
      "Honest question — would it be the worst thing in the world if you gave Ben 15 minutes, saw what he'd build for your specific series (which interactive features fit your world, how the newsletter capture wires through), and decided not to use us?",
      "Right. Worst case 15 minutes. Best case every book-1 reader from here on becomes a book-2-3-4 reader. He's got Tuesday at 3 or Thursday at 10 — which works better?",
    ],
    callerNotes: [
      "★ DIRECT THEIR EYE to the interactive features (world map / roster / quiz). Bloodlines anchor has all 5 — point to whichever shows on their preview.",
      "★ HORMOZI MAGIC LINE in line 3. Pre-handles 'I don't want to be sold to' before they think it.",
      "★ AFTER 'decided not to use us?' — count to FOUR Mississippi in silence. First to talk loses.",
      "★ If they only have ONE book → see onlyOneBook objection. Tell them the truth — too early for $10k tier.",
      "★ If they ask about Squarespace → see squarespaceIsFine objection. The gap, not the win.",
      "★ If they ask HOW MUCH → see howMuch-author objection. Same as mfg — defer to call with Ben.",
    ],
  },
};

export const VERTICAL_OBJECTIONS: Record<"manufacturer" | "author", ObjectionBranch[]> = {
  manufacturer: [
    {
      id: "dealersWontLike",
      trigger: "My dealers wouldn't like this / it'll undercut my dealer network",
      response: [
        "Fair concern — and it's the FIRST thing every manufacturer asks. Here's the answer: we don't undercut dealers. We protect them.",
        "Look at the preview again — there's a DTC storefront AND a dealer locator on the SAME catalog. End-buyers who want a regional install get routed to your nearest authorized dealer. End-buyers who want to order direct (which is happening anyway, they just hit your dealer's website instead of yours) finally land on YOUR site.",
        "ITC Quick Attach had this exact concern. After 3 months their dealers were sending MORE leads back to ITC because the partner program tracked attribution cleanly — they get a kickback on every regional install they help close.",
        "If you want to see how the dealer-locator wires up, Ben can walk through it on the 15-minute call. Tuesday or Thursday?",
      ],
      callerNotes: "This is THE biggest manufacturer objection. Answer it confidently — the answer IS the product. Then route to book.",
    },
    {
      id: "amazonAlready",
      trigger: "We already sell on Amazon / Amazon does this for us",
      response: [
        "Amazon's great for checkout. It's terrible for everything else. You don't own those buyers — you can't email them, you can't retarget them, you can't pitch them on book #2 / next product / accessory bundle.",
        "The system runs ALONGSIDE Amazon. We keep your Amazon listings live, drive traffic to BOTH the Amazon listing and your DTC storefront, but capture email + retargeting on every visit. Amazon stays the easy-checkout option, you stop losing the relationship.",
        "Tekky still has every Amazon listing they had before — but now they own a 12,000-person email list of buyers Amazon would never have given them.",
        "Want Ben to walk through the Amazon + DTC coexistence math on the call? Tuesday or Thursday?",
      ],
      callerNotes: "Don't dunk on Amazon. Amazon IS a good checkout. The story is 'rented vs owned audience.' Routes to book.",
    },
    {
      id: "b2bOnly",
      trigger: "We're B2B only / we don't sell to consumers / dealers are 100% of our volume",
      response: [
        "Got it. The system still works — the DTC piece is your email-capture layer, not your sales-conversion layer. Even if 100% of sales flow through dealers, every visitor to YOUR site (which DOES happen — they Google the brand) leaves an email + retargeting pixel.",
        "What that gets you: a real owned audience for dealer-recruitment campaigns, for product-launch announcements that you push to your dealer network, for distributor-side content marketing.",
        "ITC's about 95% B2B by volume. The system shows up in a totally different place for them than for Tekky — different funnel, same engine. Ben can walk through the B2B-specific configuration on the call.",
        "Tuesday or Thursday?",
      ],
      callerNotes: "B2B-only prospects often think DTC = sales-conversion. Reframe: DTC = audience layer. Then route to book.",
    },
    {
      id: "noDealerMomentum",
      trigger: "We're still building our dealer network / not enough dealers yet",
      response: [
        "Honest answer — if you don't have at least 8-10 dealers OR a clear path to 8-10 in the next 12 months, the AI System tier is probably too early for you.",
        "Reason: the dealer-locator + partner program math only compounds when there's enough dealer volume to attribute against. Below ~8 dealers, you're paying $10k for a system you can't fully use.",
        "Here's what I'd suggest instead — start with the $997 custom website tier first, focus on dealer-recruitment for 6-12 months, and graduate to the AI System when your dealer count justifies the math. We track these conversations — Ben can put you on a 12-month check-in.",
        "Want me to send you the $997 tier info? Or schedule the 12-month check-in?",
      ],
      callerNotes: "DAMAGING ADMISSION — tell them no. Filters out misfit prospects, raises perceived value, builds trust. Some will book the call anyway to disagree; that's a real lead.",
    },
    {
      id: "noPaidAds",
      trigger: "We don't run paid ads / we don't believe in advertising",
      response: [
        "Got it. The system runs without paid ads — about 60% of what it does is organic. Email capture, retargeting (which is just remembering visitors), the dealer partner program, smart postcards to your existing dealer list, the county lead finder for dealer-recruitment.",
        "The paid ads piece is a multiplier — if you DO eventually run ads, the system tunes them automatically. But it's not the engine. The engine is the email capture + dealer-network compounding.",
        "ITC ran with zero ad spend for the first 4 months. The dealer partner program alone paid the system off. Ben can walk through the no-ads version on the call.",
        "Tuesday or Thursday?",
      ],
      callerNotes: "Manufacturers who hate ads still love dealer-recruitment + email capture. Reframe: ads are optional, audience is mandatory.",
    },
    {
      id: "howMuch-mfg",
      trigger: "How much / what's the cost?",
      response: [
        "Main offer is the $10,000 AI Marketing System — that's what we're aiming for. Three ways to pay: $9,700 up front and save $300, OR $3,500 + $3,500 + $3,000 across 60 days, OR $2,500 quarterly four times. After the build there's roughly $500-1,000/mo for ongoing infrastructure (Twilio + SendGrid + Claude + your ad spend — those bills go to the vendors, not us).",
        "If the $10k math doesn't fit your dealer momentum yet (fewer than 8 dealers, or a tight cash window right now), we also have a $997 custom website tier as the entry-point — you graduate to the AI System when the dealer math compounds. But for most manufacturers we talk to, the $10k pays for itself in margin-pull within 3-6 months.",
        "Honest — the price isn't really the question. The question is whether the math works for your specific dealer-margin situation. Ben covers that on the call. If your numbers don't justify the $10k, he'll tell you on the spot and route you to the $997 path. Tuesday or Thursday?",
      ],
      callerNotes: "ALWAYS lead with $10k AI System as the main goal. $997 is the downsell for prospects who self-disqualify on dealer momentum or cash. Defer to Ben for the math conversation.",
    },
  ],
  author: [
    {
      id: "onlyOneBook",
      trigger: "I only have one book out so far / book #2 isn't done yet",
      response: [
        "Honest answer — if book #2 isn't drafted yet, the AI System tier is probably too early. The math on $10k works when you have a SERIES.",
        "Here's why: the system's biggest payoff is the book-1-reader-becomes-book-2-3-4-reader sequence. If book #2 is 12+ months out, the system pays for itself slowly. Better to start with our $997 author website tier, build the audience for 6-9 months while you finish book #2, and graduate to the AI System when the series is real.",
        "What's the book #2 ETA?",
        "[If 6 months or sooner] → That's the right timing. Let's book the call with Ben so the system's ready when book #2 drops.",
        "[If 12+ months out] → Let me send you the $997 tier info. We'll circle back when book #2 is in beta.",
      ],
      callerNotes: "DAMAGING ADMISSION — most one-book authors are too early. Filter them down to $997 OR pre-qualify by asking about book #2 timing. Don't try to make a $10k sale on a one-book author.",
    },
    {
      id: "squarespaceIsFine",
      trigger: "I have a Squarespace / Wix / [other simple author site] already — it works fine",
      response: [
        "Squarespace is great for a static landing page. It's not built for a series.",
        "Honest test — pull up your Squarespace right now and tell me: does it know which visitor finished book #1 versus a first-time visitor? When book #2 drops, can you send a different email to those two groups? Does it capture a newsletter signup from someone who DIDN'T buy book #1 yet but is exploring your world?",
        "Almost always the answer is no, no, and no. That's not a Squarespace failure — Squarespace is doing its job. The job we do is series-aware capture + retargeting, which is a different shape entirely.",
        "Want Ben to walk through what gets added on top of (or replaces) the Squarespace? Tuesday or Thursday?",
      ],
      callerNotes: "Don't dunk on Squarespace. The story is 'right tool, wrong job.' Routes to book.",
    },
    {
      id: "genreConcern",
      trigger: "I'm not a fantasy author / [my genre] is different / Bloodlines doesn't apply to me",
      response: [
        "Totally fair — the system is genre-agnostic in mechanic but genre-specific in delivery.",
        "Romance series → couples quiz + tropes explorer + character relationship map (instead of magic-system explorer).",
        "Thriller series → case-file dossier + clue tracker + character-suspect roster.",
        "Sci-fi series → worldbuilding wiki + tech-glossary + faction matrix.",
        "Literary / contemporary fiction → location/setting tour + thematic essay archive + character interview series.",
        "Same engine, your genre's flavor. Ben can walk through which interactive features fit YOUR series specifically on the call. Tuesday or Thursday?",
      ],
      callerNotes: "Authors worry the Bloodlines pattern only fits fantasy. Show them the genre-translation menu fast. Routes to book.",
    },
    {
      id: "newsletterConflict",
      trigger: "I use Mailchimp / ConvertKit / Substack — I don't want to switch",
      response: [
        "Good. Don't switch. We integrate with whatever you're using.",
        "The system writes to your existing newsletter platform via API — Mailchimp, ConvertKit, Substack, MailerLite, Beehiiv, all work. We just add the capture surfaces (the interactive book-world features) and the audience-tagging logic (book-1 reader vs first-time visitor vs pre-order signup).",
        "Your subscribers stay in your existing tool. Your existing automations keep running. We layer on top, we don't replace.",
        "Want Ben to walk through the integration on the call? Tuesday or Thursday?",
      ],
      callerNotes: "Most authors are precious about their list (rightfully). The fact that we integrate vs replace IS the unblock. Routes to book.",
    },
    {
      id: "amazonExclusive",
      trigger: "I'm KDP Select exclusive / I can't sell anywhere else",
      response: [
        "Got it — KDP Select doesn't conflict at all. We're not selling your books on the site, we're sending traffic TO Amazon. KDP exclusivity is about where the EBOOK is sold, not where the marketing lives.",
        "What the system does: captures the email + retargeting pixel on YOUR site, then routes the actual purchase click to your Amazon listing. KDP Select stays clean.",
        "If you eventually leave KDP Select (which a lot of series authors do at book #3-4 to capture wide retailer income), the system already has Apple Books / Kobo / IngramSpark CTAs wired up — just toggle them on. No rebuild needed.",
        "Want Ben to walk through the KDP-compatible setup? Tuesday or Thursday?",
      ],
      callerNotes: "KDP-exclusive authors worry about contract violations. The site doesn't sell books, it sends to Amazon. Zero conflict.",
    },
    {
      id: "howMuch-author",
      trigger: "How much / what's the cost?",
      response: [
        "Main offer is the $10,000 AI Marketing System — that's what we're aiming for. Three ways to pay: $9,700 up front and save $300, OR $3,500 + $3,500 + $3,000 across 60 days, OR $2,500 quarterly four times. After the build there's roughly $500-1,000/mo for ongoing infrastructure (newsletter platform fees + ad spend if you run any + Claude AI). Those bills go to the vendors, not to us.",
        "If your series isn't far enough along yet — only book #1 live and book #2 is 12+ months out — we also have a $997 custom author site tier as the starting point. You build your audience for 6-9 months while you finish book #2, and we graduate you to the AI System when book #2 hits beta.",
        "Honest — for authors, the price isn't the question. The question is whether your series is far enough along to make the math work. Ben covers that on the call. If your series isn't ready, he'll tell you straight up and route you to the $997 path. Tuesday or Thursday?",
      ],
      callerNotes: "ALWAYS lead with $10k AI System as the main goal. $997 is the downsell for too-early authors (only book #1, book #2 is 12+ months out). Defer to Ben for the series-readiness call.",
    },
  ],
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
    body: "Ask questions until THEY surface the pain. 'When's the last time someone worked on the site to RAISE your leads?' A doctor doesn't prescribe before diagnosing. Neitthe caller's do you.",
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
    "Text back 'site' if you want someone to walk you through it and I'll get Ben — he built it — on a quick call. Eitthe caller's way the site's yours to see.",
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
      "★ 'You get texts at this number?' is a micro-yes that earns the next 60 seconds — and unlike 'you in front of a phone', it doesn't imply they need to stop what they're doing. Reflexive 'yeah' eitthe caller's way.",
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
      "Eitthe caller's way, you'll have the audit in your hands tonight. If you decide it's not useful, just text me and I'll stop reaching out.",
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
      "Text back 'site' and I'll get Ben — he built it — on a quick walkthrough call. Eitthe caller's way the site's yours.",
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
        "Eitthe caller's way — have a good one.",
      ],
      callerNotes:
        "★ Line 2 is the Hormozi exit offer. Say it calm and confident — not desperate. If BAD TIMING → mark CALLBACK with note '90 days'. If WEBSITE THING → mark NOT_INTERESTED, exit fast and friendly. ★ 3-NO: third no here — let them go immediately.",
    },
    {
      id: "howGetNumber",
      trigger: "How did you get my number?",
      response: [
        "Your business listing — same place anyone searching for {category} businesses in {city} would find you.",
        "Happy to take you off our list right now if you'd ratthe caller's not hear from us.",
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
        "Done. Removed right now. You won't hear from us again. Sorry to botthe caller's you.",
      ],
      callerNotes:
        "Mark DO_NOT_CALL — flags the prospect so no otthe caller's partner can call them either. NEVER argue.",
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
        "If you like it and want to talk, I'll connect you with Ben. If not — you've got a free audit of your site eitthe caller's way. Fair?",
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
        "Same 15 minutes eitthe caller's way. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ THE #1 ESCAPE LINE. They're staring at a free site you built, this is the polite way out. Mirror first → reframe (alone vs with the architect) → loss aversion → two-option close. ★ If they STILL deflect after this, drop to TextTheLink (audit as second-touch) and exit on a friendly 'have a good one.'",
    },
  ],
};

/* ═════════════════════════════════════════════════════════════════════
 * APPOINTMENT-SETTER SCRIPT
 *
 * the caller is BlueJays' first sales partner (joined 2026-05). She's a
 * SETTER — the caller runs follow-up calls on prospects who already received
 * a website preview, then BOOKS them on Ben's calendar. Ben does the
 * close on the appointment, walking them through:
 *   1. The polished website (vs the rough preview the caller introduced)
 *   2. The backend AI Marketing System mock-up
 * ...attempting to close on EITHER OR BOTH on that call.
 *
 * Compensation:
 *   · $200 per WEBSITE Ben closes ($997)
 *   · $1,000 per BACKEND Ben closes ($10,000 AI Marketing System)
 *   · Best meetings book BOTH — the caller clears $1,200 if Ben dual-closes.
 *
 * Capacity scarcity (real, baked into close):
 *   · Ben builds 30 sites/month max
 *   · Ben builds 10 backend systems/month max
 *   · "We still have a few spots left" framing — true, not fake.
 *
 * Permission slip on the preview:
 *   The preview the caller sent is intentionally rough. The script names
 *   this BEFORE the prospect can — "this is just a preview, Ben will
 *   create a more polished version for your call with him, and he'll
 *   present it then alongside your backend mock-up for how to
 *   supercharge your lead gen."
 *
 * Voice: same Hormozi rules as Ben's script (7th-grade, blunt,
 * friendly, no jargon, smile before dial, FM-DJ tone).
 * ═════════════════════════════════════════════════════════════════════ */

/** the caller-flow goal hierarchy. Higthe caller's = better close — feeds her
 *  commission scoreboard. */
export type PartnerOutcome =
  | "BOTH_BOOKED" // Ben booked for site + backend reveal — best win
  | "BACKEND_BOOKED" // Ben booked for backend close ($1k commission)
  | "WEBSITE_BOOKED" // Ben booked for website close ($200 commission)
  | "AUDIT_SENT" // Couldn't book — sent the audit as a parachute
  | "CALLBACK" // Pinned a specific time
  | "VOICEMAIL"
  | "NO_ANSWER"
  | "DO_NOT_CALL";

/** the caller-shaped script. Different section set than Ben's cold-call
 *  flow — the caller has a discovery step + two parallel pitches (website
 *  vs backend) + a scarcity close. */
export type PartnerCallScript = {
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

/** Pre-call coaching for the caller. Parallel to HORMOZI_CALL_TIPS but
 *  centered on the SETTER role + the dual-product framing. */
export const PARTNER_CALL_TIPS: CallTip[] = [
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
    body: "If they're cool on the website but DO pay an agency or run ads → that's not a no, that's a high-ticket signal. Pivot to the backend ($10,000 AI System) immediately. $1k commission > $200.",
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
    body: "First line is 'Hey it's {callerName} — did you guys get that website we made for you?' NOT 'Hi, my name is the caller from BlueJays...' The assumption (we made you a website) earns the next 30 seconds.",
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
    body: "When you book Ben, he shows them BOTH the polished site AND the backend mock-up. They decide on eitthe caller's or both on that one call. You don't book two separate Ben meetings — you book one with both reveals.",
  },
];

/** Mantra shown above the workspace for the caller. Different drumbeat
 *  than Ben's "stack the nos" — she's optimizing for BOOKINGS. */
export const PARTNER_MANTRA =
  "Book Ben. Don't close. Book Ben. The reveal is his job — yours is the 15 minutes.";

export const PARTNER_CALL_SCRIPT: PartnerCallScript = {
  opener: {
    id: "opener",
    title: "Open the call",
    goal: "Assume the gift. They already received the preview — confirm they have it, get them looking. NEVER lead with introduction.",
    lines: [
      "Hey {firstName} — it's {callerName}. Did you guys get that website we made for you?",
      "[If YES they have it] Awesome — pull it up real quick while we talk, takes 10 seconds.",
      "[If NO / NOT SURE] No problem — just texted + emailed it again, you'll see it pop up in a few seconds. Pull it up while we talk.",
      "[Click SEND PREVIEW LINK ↘ even if they say yes — confirms text + email both fired]",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAME from word one. 'Did you guys get that website we made for you?' presumes the gift exists. They feel BEHIND, not pitched.",
      "★ DO NOT introduce yourself first. 'Hi, my name is [yourName] from BlueJays' = telemarketer. 'Hey {firstName} it's {callerName}' = old friend.",
      "★ If they say 'who is this?' → '[yourName], the website I just sent you — pull it up' (still assumptive, still moving).",
      "★ FM DJ voice — low and slow. Down-inflection on every statement except the question.",
      "After they confirm receipt → IDENTITY FRAME tab.",
      "If they're confused/hostile → IDENTITY FRAME (the partner-with-Ben line clears it up fast).",
      "If they say BAD TIME → 'Totally — won't keep you. Real quick: better to call you back at 2 today or 10 tomorrow morning?' [pin a time] Mark CALLBACK.",
    ],
  },

  identityFrame: {
    id: "identityFrame",
    title: "Set the identity",
    goal: "One sentence that establishes who the caller is + the try-before-you-buy promise. Disarms 'is this a sales call' before they ask.",
    lines: [
      "Real quick — I'm the caller. I run a business with a web developer named Ben. He custom-makes websites you can try before you buy. You only move forward if you love it.",
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
      "★ Line 2 plants the BACKEND REVEAL. Even prospects who only want a site become curious about the backend. This is how the caller books $1,200 dual-closes — the caller promises both reveals from the start.",
      "★ Don't oversell the backend yet — just name it. 'Custom AI marketing system' is the bait, the pitch comes later if they ask.",
      "If they ask 'WHAT'S A BACKEND' → 'It's a system that automatically follows up with your leads — texts, emails, missed-call replies. Ben shows the mock-up on the call. Like seeing the engine before you buy the car.' → DISCOVERY tab.",
      "If they ask 'HOW MUCH' → see howMuch objection (DO NOT quote yet).",
      "Once they react / nod → DISCOVERY tab.",
    ],
  },

  discovery: {
    id: "discovery",
    title: "Two questions (find the path)",
    goal: "Discover whetthe caller's they're a WEBSITE close or a BACKEND close. Two questions, no third — they reveal the path themselves.",
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
      "  → 'happy with site'     + 'NO agency'  = soft path — pivot to BACKEND ($10,000, $1k comm). Frame: 'cool, then maybe the backend is the conversation.'",
      "  → 'happy with site'     + 'YES agency' = HARD BACKEND pivot ($10,000). Frame: 'sounds like the website's not the bottleneck — let's talk about the agency replacement.'",
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
      "Ben built the whole new site around fixes like that. The polished version — colors, photos, your real content — comes togetthe caller's on the call with him.",
      "Honest question — would it be the worst thing in the world to spend 15 minutes with Ben, see what he changed and why, AND see the backend mock-up too — and then decide?",
      "[Pause four counts]",
      "Right. Worst case 15 minutes. He's got Tuesday at 3 or Thursday at 10 — which works?",
    ],
    callerNotes: [
      "★ DIRECT THE EYE — same play as Ben's script. The preview is on their screen, name a specific element. Substitute the {category}-relevant landmark (call button / menu / quote form / appointment CTA).",
      "★ HORMOZI MAGIC LINE in line 3. 'Worst thing in the world' pre-handles 'I don't want to be sold to' before they think it.",
      "★ Notice line 3 ALWAYS includes 'AND see the backend mock-up too' — the caller ALWAYS books for both reveals, even on a website-pitch path. Ben decides on the call which one to push.",
      "★ AFTER 'which works?' — FOUR Mississippi. Do not breathe loud. The first one to talk loses.",
      "If they say HOW MUCH → howMuch objection (don't quote during the pitch).",
      "If they YES on a time → BOOK THE CALL tab.",
      "If they hesitate → BACKEND PIVOT tab (try the backend angle as the second hook).",
    ],
  },

  agencyReplacementHook: {
    id: "agencyReplacementHook",
    title: "Agency-replacement hook (high-margin categories)",
    goal: "Two short qualifying questions to drop in mid-discovery when the prospect's category is one that typically PAYS for a marketing agency (chiropractic, dental, law-firm, real-estate, accounting, insurance, medical, fitness, physical-therapy, interior-design, photography). Both questions are kill-shots — if they say YES to either, pivot straight to backendPitch ($10,000 + $500-1k/mo, $1k commission).",
    lines: [
      "Have you ever thought about replacing your marketing agency permanently with AI?",
      "[pause four counts]",
      "Getting rid of that monthly payment?",
    ],
    callerNotes: [
      "★ TWO QUESTIONS, FOUR-COUNT PAUSE BETWEEN. Don't run them together. The first is a thought-experiment — opens the door. The second is the gut-punch — names the pain (the bill that arrives every single month).",
      "★ ONLY use this hook on categories that actually pay agencies — see the goal field. For trades (plumber, electrician, locksmith, towing) the hook falls flat because they don't have an agency to replace.",
      "★ If they say 'yes' / 'I've thought about it' / 'tell me more' → straight to backendPitch tab.",
      "★ If they say 'we don't have an agency' → fall through to websitePitch + the standard discovery flow. They're a $997 lead, not a $10,000 lead.",
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
      "$10,000 to build it. Plus the AI tools run about $500 to $1,000 a month — that's Twilio, SendGrid, Claude, ad spend — but those bills go to the vendors directly, not to us. We're NOT a retainer agency. Versus what you're paying $2-5k/mo for, you're cutting your monthly cost by half or more, AND you own the whole system.",
      "[Pause]",
      "Ben can show you the mock-up of what yours would look like on the same 15-minute call. He'll have the website AND the backend ready — you decide which makes sense. Worst case 15 minutes. Tuesday at 3 or Thursday at 10?",
    ],
    callerNotes: [
      "★ LINE 1 IS THE PIVOT — 'sounds like the website might not be the bottleneck' validates their answer + opens the door to the bigger conversation. Don't argue the website. Move on.",
      "★ THE FRAME IS AGENCY-REPLACEMENT, not 'add-on'. If they pay an agency, the AI System is what they BUY INSTEAD of the agency, not in addition. That's the whole pitch.",
      "★ Line 3 is the only place you quote price unprompted. $10,000 + $500-1,000/mo IS the honest number. The trust move is naming the recurring BEFORE they ask — and immediately separating it from agency retainer (vendor bills, not BlueJays). Frame against agency monthly: cutting their bill in half + ownership.",
      "★ KEY: the close is STILL Ben's 15-minute call with BOTH reveals. the caller never closes the $10,000 — the caller books Ben.",
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
      "Right. So here's what we'd build for you. Custom AI marketing system — automated text-back on every missed call (real number, real conversation), drip campaigns for every lead that comes in, a dashboard you can see every conversation + every conversion on. $10,000 build, then the AI tools run about $500 to $1,000 a month — Twilio, SendGrid, Claude, ad spend — paid straight to the vendors, not to us. We're NOT a retainer agency.",
      "Versus your $2-5k/mo agency bill, you're cutting your monthly cost roughly in half AND you own the system. After the build pays for itself in 6 to 8 months, every month after that is pure savings.",
      "[Pause]",
      "Ben can walk through the mock-up of what yours specifically would look like — 15 minutes. He'll have the website AND the backend ready. Tuesday at 3 or Thursday at 10?",
    ],
    callerNotes: [
      "★ LINE 2 — get a number. 'Ballpark' makes it easy. Their answer becomes ammo for the break-even framing in line 5.",
      "★ NEVER skip line 2. The number is the whole frame. Without it, $10,000 + $500-1k/mo sounds expensive. With it ('you said $3k/mo'), the BlueJays setup is roughly half their current burn AND they own it.",
      "★ Line 4 names the FOUR pillars (text-back, drip, dashboard, ownership). Don't list more — four is the brain's chunking limit.",
      "★ KEY: still booking Ben for BOTH reveals. Even if they only want backend, the polished website mock-up is in Ben's pocket — sometimes the backend conversation surfaces a website opportunity.",
      "If they say AGENCY IS LOCKED IN → 'Got it — when's the contract up?' Pin that as a callback. Mark CALLBACK.",
      "If they YES → BOOK THE CALL.",
      "If price-shock → 'Yeah, big number. But check the math against $3k/mo for forever vs $10,000 once. Ben walks the comparison on the call.' → SCARCITY CLOSE.",
    ],
  },

  scarcityClose: {
    id: "scarcityClose",
    title: "Capacity scarcity (use sparingly)",
    goal: "Real scarcity, not fake. Ben caps at 30 sites + 10 backends a month. Drop it ONCE if they're hesitating. Then go back to the close.",
    lines: [
      "One thing — Ben does 30 sites a month max, and only 10 of these backend systems. We still have a few spots left this month.",
      "I'd ratthe caller's book you in early than have you wait. Tuesday at 3 or Thursday at 10?",
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
      "Eitthe caller's way the audit's in your hands tonight. If you decide it's not useful, just text me and I'll stop reaching out.",
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
      "Hey {firstName} — this is the caller. Wanted to know if you got a chance to look at the website we made for {bizName}. Sending you the link right now to your phone — takes 30 seconds.",
      "Text back 'site' and I'll get Ben — he built it — on a quick walkthrough call. He'll have the polished version AND a backend mock-up ready. Eitthe caller's way the site's yours.",
    ],
    callerNotes: [
      "★ ASSUMPTIVE FRAMING: 'did you get a chance to look at the website we made' presumes already sent.",
      "★ HOOK FIRST. 'Website' before 'the caller' on voicemail every time.",
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
        "That's exactly what Ben's backend system is. Custom-built to do what your agency does — but YOU own it. $10,000 to build, then about $500-1,000/mo for the AI infrastructure — but that's Twilio, SendGrid, Claude, ads — paid to the vendors, NOT a retainer to us. Versus what you're paying your agency, you're cutting your monthly cost in half and you own the whole stack. Ben walks the mock-up on a 15-minute call. Tuesday at 3 or Thursday at 10?",
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
        "★ DON'T price-quote in the pitch. Hormozi rule: price-first calls close at 5%; value-first calls close at 25%. ★ When you DO quote (line 2), give the spread $997 / $10,000 + $500-1k/mo — anchors high, makes the website feel cheap. Always say the recurring upfront — surprise pricing later kills trust. Then immediately re-close.",
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
        "Eitthe caller's way, have a good one.",
      ],
      callerNotes:
        "★ The Hormozi exit offer. Calm, confident. ★ If TIMING → callback in 90 days. If GENERAL → mark NOT_INTERESTED, exit warm.",
    },
    {
      id: "isThisSpam",
      trigger: "Is this a robocall / spam / scam?",
      response: [
        "Real person — the caller here. I run a business with a web developer named Ben. We built {bizName} a website preview and I'm calling to walk you through it.",
        "Want me to text you the link instead? You decide if it's worth a closer look.",
      ],
      callerNotes: "Slow voice. Use first name. Don't over-explain — that confirms the suspicion.",
    },
    {
      id: "removeFromList",
      trigger: "Take me off your list / do not call",
      response: [
        "Done. Removed right now. You won't hear from me again. Sorry to botthe caller's you.",
      ],
      callerNotes: "Mark DO_NOT_CALL. Never argue. Never re-pitch.",
    },
    {
      id: "letMeLookAtItLater",
      trigger: "Let me look at it later / I'll call you back",
      response: [
        "Look at it later?",
        "[pause] Totally fair — but here's the thing. You looking alone, you'll see what's there. Ben on the call, you see what's there AND what's missing — what it's costing you AND what the backend would replace.",
        "Same 15 minutes eitthe caller's way. Tuesday at 3 or Thursday at 10?",
      ],
      callerNotes:
        "★ #1 escape line. Same play as Ben's script — mirror, reframe (alone vs with the architect), two-option close. If they STILL deflect → drop to TextTheLink and exit warm.",
    },
  ],
};

