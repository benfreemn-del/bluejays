/**
 * BlueJays Ad Templates — Full Library
 *
 * Research-backed ad copy for Meta (Facebook/Instagram) and Google Search.
 *
 * CAMPAIGN STRUCTURE (locked from competitive research 2026-04-27):
 *   Budget split: 70% Meta / 30% Google
 *   Meta: 1 CBO campaign, 2 ad sets (cold + retargeting), 4 active creatives per set
 *   Google: 1 campaign, Manual CPC, 2 ad groups (category intent + problem-aware)
 *   No Display, no YouTube until monthly ad budget exceeds $3,000/mo
 *
 * HOW TO USE:
 *   - Meta cold ads: run 4 at a time, retire losers weekly via Hyperloop
 *   - Meta retargeting: run all 3 simultaneously (tiny audience, low spend)
 *   - Video scripts: produce when scaling past $1,500/mo; use Reels format first
 *   - Google RSAs: paste all headlines + descriptions into a single RSA per ad group
 *
 * CHARACTER LIMITS ENFORCED:
 *   Google headlines: 30 chars max (verified on each entry)
 *   Google descriptions: 90 chars max (verified on each entry)
 *   Meta headlines: 45 chars (soft limit — shown under image/video)
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MetaAd {
  id: string;
  format: "single_image" | "carousel" | "video" | "static";
  placement?: string[];
  audience?: "cold" | "retargeting";
  hook: string;
  /** Primary body copy — field is named primaryText on cold ads, body on retargeting ads */
  primaryText?: string;
  body?: string;
  headline: string;
  description: string;
  cta: "LEARN_MORE" | "GET_QUOTE" | "SIGN_UP" | "WATCH_MORE";
  url: string;
  creativeNote: string;
  targetingNote: string;
}

export interface GoogleSearchAd {
  id: string;
  adGroup: "category_intent" | "category-intent" | "problem_aware" | "problem-aware";
  campaignType: string;
  headlines: string[];   // each ≤ 30 chars
  descriptions: string[]; // each ≤ 90 chars
  finalUrl: string;
  displayPath: string;
  targetingNote: string;
}

export interface VideoScript {
  id: string;
  platform: "meta_reels" | "meta_feed" | "youtube" | "meta-reels" | "meta-feed" | "youtube-preroll";
  duration: string;
  format: string;
  title: string;
  script: {
    visual: string[];
    voiceover: string[];
    musicNote: string;
    captionsNote: string;
  };
  productionNote: string;
  targetingNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// META COLD ADS — 8 VARIANTS (2 Hyperloop flights of 4)
// Flight 1: ads MC-01 through MC-04 (launch first)
// Flight 2: ads MC-05 through MC-08 (rotate in as losers retire)
// ─────────────────────────────────────────────────────────────────────────────

export const META_COLD_ADS: MetaAd[] = [
  {
    id: "MC-01",
    hook: "money-leak-hector-story",
    audience: "cold",
    format: "static",
    primaryText: `Hector runs a landscaping company in Washington. Solid work. Great reviews. Busy every season.

His website had a broken phone button. Half the people visiting on their phones couldn't call him. He had no idea.

We fixed it. That was 6 years ago. He's been doing six figures a year since — same crew, same prices, same neighborhoods. The site just stopped working against him.

Most local business websites have at least one problem like that. A broken button. A page that takes 8 seconds to load. A phone number you can't tap.

Takes 60 seconds to find out if yours does.`,
    headline: "Something is costing you calls",
    description: "Free audit. No card needed.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Audit results page screenshot showing a landscaping or roofing site with a specific issue card highlighted in red. Or a before/after split of two phone screens.",
    targetingNote: "Broad small business owners. Job title: Owner, Business Owner, Self-Employed. Pacific NW 50-mile radius. Facebook + Instagram Feed only.",
  },
  {
    id: "MC-02",
    hook: "score-curiosity-game",
    audience: "cold",
    format: "static",
    primaryText: `We scored 150 local business websites last year.

Average score: 54 out of 100.

The most common problems:
— Phone number that can't be tapped on mobile
— No visible call-to-action above the fold
— Page loads in 6+ seconds on 4G
— Hero section that says what the business IS, not what it DOES for customers

Every one of those is a lead walking out the door.

Score yours free. Takes 60 seconds.`,
    headline: "What would your site score?",
    description: "Out of 100. Free. 60 seconds.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Screenshot of the audit result page showing a score badge (61/100 or 54/100) with colored issue cards below. The score number should be large and readable at small sizes.",
    targetingNote: "Same broad owner audience. Test this creative against MC-01 in Flight 1. Expect higher CTR but potentially lower conversion — curiosity clicks don't always convert.",
  },
  {
    id: "MC-03",
    hook: "competitor-winning-loss-aversion",
    audience: "cold",
    format: "static",
    primaryText: `Right now, someone in your city is Googling your trade.

They're going to call the first business that:
— Loads fast on their phone
— Shows a phone number they can tap immediately
— Looks like a real, trustworthy company

If that's not you, it's your competitor.

We score local business websites for free. 60 seconds. Shows you exactly where you're losing them — and what to fix first.`,
    headline: "Your competitor just got that call",
    description: "Free site score. 60 seconds.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Google search results screenshot showing a competitor's listing above a generic placeholder. Or a split: cluttered slow-loading site vs clean fast-loading site. Both on phone screens.",
    targetingNote: "Works well with vertical-specific interest targeting. Run against electricians, plumbers, HVAC owners specifically. Loss aversion hooks index higher with trade categories.",
  },
  {
    id: "MC-04",
    hook: "identity-gap-reviews-vs-website",
    audience: "cold",
    format: "static",
    primaryText: `Your Google reviews say one thing.

"Best in the city." "Showed up same day." "Fair price, no surprises." Five stars, 40 reviews.

Your website says something else.

Customers who find you through word of mouth already trust you. Customers who find you through search are forming their first impression right now — and most local business websites make a bad one.

We score sites for free. Find out if yours matches the quality of your work.`,
    headline: "Your reviews vs. your website",
    description: "Free score. Honest results.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Side-by-side: a real 5-star Google review card on the left, an outdated/cluttered website screenshot on the right. Strong visual contrast between quality signals.",
    targetingNote: "Best for businesses with established Google ratings (4.5+ stars, 20+ reviews). If Meta allows interest filtering by 'Google Business Profile' or similar, use it.",
  },
  // ── Flight 2 — rotate in as Flight 1 losers retire ──────────────────────────
  {
    id: "MC-05",
    hook: "we-already-built-yours",
    audience: "cold",
    format: "static",
    primaryText: `We scouted your business, looked at your current website, and built you a new one.

Custom design. Your real services, your real contact info, your neighborhood.

No charge to look at it.

If you want to launch it: $997 flat, live in 48 hours, 100% money back if you don't love it.`,
    headline: "We already built your new site",
    description: "See it free. Pay only if you love it.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Show a preview page screenshot — the generated V2 site for a specific category (dental, roofing, electrician). The visual IS the hook. Should look obviously premium and finished.",
    targetingNote: "This is the single most differentiating angle in the market — no competitor can say it. Test this broadly. If it converts, scale it first before everything else.",
  },
  {
    id: "MC-06",
    hook: "vertical-specific-electrician-license",
    audience: "cold",
    format: "static",
    primaryText: `Most electrician websites bury the license number in the footer.

Most customers won't scroll that far.

When someone's power is out, the first thing they check is: is this person licensed? If they can't see it in the first two seconds, they go back and call someone else.

We score electrician websites for free. Find out in 60 seconds if yours passes the tests that actually matter to your customers.`,
    headline: "Most electrician sites fail this",
    description: "Free score. No card needed.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Phone screen showing an electrician website with the license number visible and prominent in the hero — with a green checkmark overlay. Contrasted with a cramped footer screenshot.",
    targetingNote: "Run this as a vertical-specific ad targeting electrician/electrical contractor job titles and interests. Create separate variants swapping 'electrician' for plumber, HVAC, roofer, auto-repair.",
  },
  {
    id: "MC-07",
    hook: "9pm-search-scenario",
    audience: "cold",
    format: "static",
    primaryText: `It's 9pm on a Thursday.

Someone's pipe just burst. Their AC went out. They need a roofer before the storm hits. They chipped a tooth and can't sleep.

They're Googling on their phone. They're going to call the first business that loads fast, has a number they can tap, and looks like a real company.

Most local business websites fail at least one of those. Some fail all three.

Find out where yours stands — free.`,
    headline: "Are you winning the 9pm search?",
    description: "Free audit. 60 seconds.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Phone screen at night showing a Google search for '[trade] near me' or a panicked text thread. Dark background, phone screen glow. Emotional, urgent, relatable.",
    targetingNote: "Works especially well for emergency-service trades: plumber, HVAC, electrician, roofer, auto-repair. The scenario is specific enough that non-emergency businesses will self-filter.",
  },
  {
    id: "MC-08",
    hook: "offer-specificity-shock",
    audience: "cold",
    format: "static",
    primaryText: `Most web agencies: $5,000–$15,000 quote. 4–8 week timeline. $200–$400 a month after that.

Us: $997 flat. 48 hours. No monthly fees. Ever.

What you get: custom design, your real photos, your real services and contact info, domain + hosting setup, mobile-first build, 100% money back if you don't love it.

Start with the free audit to see what your current site is missing.`,
    headline: "$997 flat. Live in 48 hours.",
    description: "No monthly fees. Money-back guarantee.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Clean graphic: two columns. Left column header 'Other agencies' with a red list (long timeline, high price, monthly fees). Right column header 'BlueJays' with a green list. Simple, scannable.",
    targetingNote: "Best for warmer cold audiences — people who've searched 'web design' or 'website for my business' recently. Meta's interest targeting can approximate this. Also strong as a Flight 2 ad for fatigued audiences who've seen the hook-based ads.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// META RETARGETING ADS — 3 VARIANTS
// Audience: visited /audit, /preview/*, or /claim/* in last 30 days
// Run all 3 simultaneously — retargeting audience is small, budget is low (~$5/day)
// ─────────────────────────────────────────────────────────────────────────────

export const META_RETARGETING_ADS: MetaAd[] = [

  {
    id: "MR-01",
    format: "single_image",
    placement: ["feed", "stories", "reels"],
    hook: "Your audit score is still sitting there.",
    body: `You ran the audit. Got the score. Then closed the tab.

Here's the thing — that number doesn't change until something does.

The issues we flagged are still on your site right now. Every person who Googles you today sees the same thing they saw the day you took the audit.

One fix can change that. Sometimes it's just a headline swap. Sometimes it's adding your phone number where people can see it.

Your audit has the list. We can handle every item on it for $997.

Open your audit — it's still there.`,
    headline: "Your score hasn't changed.",
    description: "The issues we found are still live. See your audit.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Dark card with a big score number (generic, not personalized — e.g. '54/100') and a red pulsing dot. Text: 'Still unresolved.' Works well as a 6-second bumper animation if you do video retargeting later.",
    targetingNote: "Audience: visited /audit page but did NOT submit the form. 7-day window. This is the warmest possible cold audience — they were one form away.",
  },
  {
    id: "MR-02",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "You got the audit. Ready to fix it?",
    body: `A lot of business owners run the audit, read the report, think 'yeah, that's all true' — and then get busy.

Totally normal.

But you already did the hard part. You know what's wrong. Most business owners don't even know their site has a problem.

The fix is straightforward: $997, 48 hours, everything in the audit addressed. Real photos, real copy, real contact info.

If the timing's right, the audit's still live at the link below.`,
    headline: "You already know what to fix.",
    description: "$997. 48 hours. Everything in your audit addressed.",
    cta: "GET_QUOTE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Split screen: left side a messy, outdated-looking website screenshot (stock). Right side a clean, modern version. Simple arrow between them. No text overlay needed — the visual tells the story.",
    targetingNote: "Audience: submitted the audit form (visited /audit/*/processing or /audit/* with session data) but did NOT reach a /claim/* URL. 14-day window. These people know their problem and saw a solution — they just didn't commit.",
  },
  {
    id: "MR-03",
    format: "single_image",
    placement: ["feed"],
    hook: "One new customer and the site pays for itself.",
    body: `$997 sounds like a lot until you think about what one new customer is worth to your business.

For a plumber, one job is $400–$800.
For a dentist, one new patient is $3,000+ lifetime.
For a salon, one regular client is $1,500/year.

The average business that fixes their website sees 2-3 new inquiries per week that they weren't getting before.

That's not marketing math. That's people finding you, seeing something credible, and calling.

Your audit already showed where the leaks are. The $997 fixes them.`,
    headline: "How much is one new customer worth?",
    description: "Most business owners earn it back in the first week.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Simple ROI visual: a $997 bill on the left, an arrow, and a number that's clearly larger on the right (e.g. '$4,800' with a label 'avg. first-year value of one new dental patient'). Run 3 versions with different verticals in the right-side number.",
    targetingNote: "Audience: visited /claim/* URL but did NOT complete purchase. 30-day window. These people saw the price and left. ROI angle is the #1 objection handler for price hesitation.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO SCRIPTS — 3 VARIANTS
// VS-01: Meta Reels / TikTok — 30-sec screen recording format
// VS-02: Meta Feed — 60-sec Hector story (talking head or VO + B-roll)
// VS-03: YouTube pre-roll — 15-sec unskippable + 30-sec skippable companion
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO_SCRIPTS: VideoScript[] = [
  {
    id: "VS-01",
    platform: "meta_reels",
    duration: "30sec",
    format: "screen_recording",
    title: "Audit Reveal — 30-sec Reels",
    script: {
      visual: [
        "0:00–0:03 — Black screen. Big white text fades in: 'I typed this plumber's site into our audit tool...'",
        "0:03–0:08 — Screen recording: browser opens to a generic plumber's website. It looks outdated. Slow load.",
        "0:08–0:14 — Screen recording: audit results page loads. Score appears: '41/100'. Three red Xs visible under Speed, Mobile, and Hero Copy.",
        "0:14–0:20 — Zoom in on the issues panel. Text on screen: 'Phone number is below the fold. Site takes 6 seconds to load on mobile. No trust signals visible.'",
        "0:20–0:26 — Cut to the rebuilt site preview. Clean, fast, phone number huge in the hero. Scrolls smooth.",
        "0:26–0:30 — Text card: 'Free audit at bluejayportfolio.com/audit' with tap-here pointer animation.",
      ],
      voiceover: [
        "0:00–0:03 — (no VO, text-on-screen only)",
        "0:03–0:08 — 'This is a real plumbing site. Looks normal from the outside...'",
        "0:08–0:14 — 'But it scored a 41 out of 100 on our audit. Here's what that means in real life.'",
        "0:14–0:20 — 'Someone calls about a burst pipe at 9pm. They Google plumbers near them. Your site takes 6 seconds to load. They hit back and call someone else.'",
        "0:20–0:26 — 'This is the same business after we rebuilt it. First call came in within a week.'",
        "0:26–0:30 — 'Run your audit free — link in bio.'",
      ],
      musicNote: "Low-energy suspense music first half, small uptick/positive tone in second half. Common in 'reveal' Reels. No lyrics.",
      captionsNote: "Full captions required — 85%+ of Reels are watched muted. Large font, high contrast, centered at bottom third.",
    },
    productionNote: "Can be produced entirely with screen recording software (Loom, OBS, or QuickTime) + CapCut for the text cards. No camera required. Authentic screen-recording aesthetic outperforms polished video for this format.",
    targetingNote: "Cold audience, broad. Interest: 'small business,' 'self-employed,' contractor-adjacent categories. Run as a Reel first — if it hits >3% hook rate (3-sec views / impressions), duplicate to Stories.",
  },
  {
    id: "VS-02",
    platform: "meta_feed",
    duration: "60sec",
    format: "talking_head_or_voiceover",
    title: "Hector Story — 60-sec Feed",
    script: {
      visual: [
        "0:00–0:05 — Open on landscaping work footage (before/after, aerial if possible). Text overlay: 'Hector had been landscaping in Washington for 6 years.'",
        "0:05–0:15 — B-roll: close-up of a phone not ringing. Maybe a calendar with sparse bookings. Text overlay: 'His work was good. His website wasn't.'",
        "0:15–0:25 — Screen recording: his old site, broken call button visible on mobile. Text: 'His call button was broken on half the browsers out there. He had no idea.'",
        "0:25–0:40 — B-roll: crew working, trucks, finished yards. Text overlay: 'We rebuilt his site. Nothing fancy — just fixed the things getting in his way.'",
        "0:40–0:50 — Quick montage of the new site on desktop and mobile. Scrolling through it. Text: '48 hours later.'",
        "0:50–0:58 — Static card: 'That was 6 years ago. He's been doing six figures annually since.' Text fades in slowly.",
        "0:58–1:00 — CTA card: 'Free site audit — bluejayportfolio.com/audit'",
      ],
      voiceover: [
        "0:00–0:05 — 'Hector had been running his landscaping company in Washington for 6 years.'",
        "0:05–0:15 — 'Good work. Great reviews. But his phone wasn't ringing the way it should have been.'",
        "0:15–0:25 — 'Turns out, his call button was broken on half the browsers out there. He had no idea.'",
        "0:25–0:40 — 'We rebuilt his site. Nothing fancy — just fixed what was quietly working against him.'",
        "0:40–0:50 — 'Forty-eight hours later, he had a new site. Same service area. Same prices. Same crew.'",
        "0:50–0:58 — 'That was six years ago. He's been doing six figures annually since.'",
        "0:58–1:00 — 'Run your free audit at the link below.'",
      ],
      musicNote: "Understated acoustic or ambient. Nothing that competes with the voiceover. Slight swell at 0:50 when the result is revealed.",
      captionsNote: "Full captions — same as VS-01. This video will primarily be watched muted in-feed.",
    },
    productionNote: "Voiceover-only version (no talking head) is production-equivalent to the on-camera version for this story format. If Ben does talking-head, shoot in front of a laptop with a landscaping site visible on screen behind him — adds authenticity. No studio needed.",
    targetingNote: "Cold audience. Slightly warmer interest targeting — people who follow landscaping/contractor pages, home-improvement accounts, small business content. Also strong as a retargeting video for audit page visitors who didn't submit.",
  },
  {
    id: "VS-03",
    platform: "youtube",
    duration: "15sec_unskippable + 30sec_skippable",
    format: "direct_response",
    title: "YouTube Pre-Roll — 15/30-sec",
    script: {
      visual: [
        "UNSKIPPABLE 15-SEC VERSION:",
        "0:00–0:04 — Bold text on screen, Ben speaking directly to camera (or VO): 'Your website is costing you customers right now.'",
        "0:04–0:09 — Quick cut: before/after of a website side-by-side. Before: cluttered, no phone visible. After: clean, phone huge in hero.",
        "0:09–0:13 — Text: 'Free audit — 2 minutes. See exactly what you're losing.' URL visible.",
        "0:13–0:15 — URL card: bluejayportfolio.com/audit",
        "",
        "SKIPPABLE 30-SEC VERSION (first 5 sec must hook before skip button appears):",
        "0:00–0:05 — HOOK (must land before skip): 'If you have a website, there's a good chance it's losing you one or two customers a week. And you'd never know.'",
        "0:05–0:15 — 'We built an audit tool that scores your site on the exact things that cause people to leave and call your competitor instead.'",
        "0:15–0:22 — 'Speed. Mobile layout. Whether your phone number is visible. Whether people trust what they see in the first 5 seconds.'",
        "0:22–0:28 — 'The audit is free, takes 2 minutes, and shows you exactly what to fix.'",
        "0:28–0:30 — 'bluejayportfolio.com/audit — link in the description.'",
      ],
      voiceover: [
        "See visual script above — VO and visual are synced.",
      ],
      musicNote: "None recommended for the unskippable 15-sec — voice clarity is the priority. For the 30-sec, optional light background tone at low volume.",
      captionsNote: "YouTube auto-captions are acceptable here. Manual captions preferred if the video will also run on Meta.",
    },
    productionNote: "15-sec unskippable: can be a single talking-head shot with on-screen text. No B-roll required. The 30-sec version benefits from a quick screen-recording segment in the middle (0:05–0:15) showing the audit tool in action.",
    targetingNote: "YouTube targeting: keyword intent ('how to get more customers for my business', 'small business website', 'website redesign'). In-market audiences: small business owners. Run the 15-sec as a bumper on high-CPM placements, 30-sec as skippable on long-form content. DON'T run YouTube ads until Meta is profitable — YouTube is significantly harder to make work at sub-$2K/mo spend.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SEARCH ADS — AD GROUP 1: CATEGORY INTENT
// Keywords: "website design for [trade]", "small business website", "$997 website"
// 4 RSAs — Google rotates headlines/descriptions automatically
// Char limits: headlines ≤30 chars, descriptions ≤90 chars
// ─────────────────────────────────────────────────────────────────────────────

export const GOOGLE_SEARCH_ADS: GoogleSearchAd[] = [
  {
    id: "GS-01",
    adGroup: "category_intent",
    campaignType: "search",
    headlines: [
      "$997 Custom Website",         // 22 chars
      "Live in 48 Hours",            // 17 chars
      "No Monthly Fees Ever",        // 20 chars
      "Free Site Audit First",       // 21 chars
      "100% Money-Back Guarantee",   // 26 chars
      "Built for Local Businesses",  // 27 chars
      "Your Real Photos & Services", // 28 chars
      "Domain + Hosting Included",   // 26 chars
      "We Build It For You",         // 19 chars
      "Not a DIY Builder",           // 18 chars
      "See a Live Preview Free",     // 23 chars
      "Custom Design, Flat Price",   // 26 chars
      "BlueJays Web Design",         // 20 chars
      "Start With a Free Audit",     // 24 chars
      "Mobile-First, SEO-Ready",     // 24 chars
    ],
    descriptions: [
      "Custom website for your business — your real photos, services, and contact info. Flat $997, live in 48 hours.",
      "No monthly fees. No page limits. No builders to learn. We handle everything. 100% money-back guarantee.",
      "See your new site before you pay. Free audit shows exactly what your current site is missing.",
      "Domain registration + hosting setup included. You own everything. We just build it right.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Broad match: 'small business website design.' Phrase match: 'website for my [trade].' Exact: '[city] web designer.' Bid on competitors' brand terms only if budget allows ($50+/day). Negative keywords: 'free website builder,' 'wix,' 'squarespace,' 'wordpress tutorial,' 'diy website.'",
  },
  {
    id: "GS-02",
    adGroup: "category_intent",
    campaignType: "search",
    headlines: [
      "Trade Business Websites",     // 23 chars
      "$997 Flat, 48-Hr Delivery",   // 26 chars
      "Electrician? Plumber? HVAC?", // 27 chars
      "License # in Your Hero",      // 22 chars
      "Phone Visible on Mobile",     // 23 chars
      "Get Found. Get Called.",       // 22 chars
      "Real Reviews on Your Site",   // 26 chars
      "Free Audit — See Your Score", // 28 chars — note: em-dash is 1 char
      "No Monthly Fees",             // 15 chars
      "Done in 48 Hours",            // 16 chars
      "Your Services. Your Photos.", // 27 chars
      "100% Money Back",             // 15 chars
      "Local Trade Web Design",      // 22 chars
      "Not a Template Swap",         // 19 chars
      "Custom for Your Trade",       // 21 chars
    ],
    descriptions: [
      "Electricians, plumbers, HVAC, roofers — we build sites that put your license, number, and emergency line front and center.",
      "Flat $997. No monthly fees. Your real service area, real photos, real contact info. Live in 48 hours.",
      "Trade customers want 3 things in the first 5 seconds: license, phone, and trust. We put all three where they can see them.",
      "See your new site free. Free audit shows what your current site is missing. $997 flat — no surprises.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/trades",
    targetingNote: "Trade-vertical keyword list: 'electrician website design,' 'plumber website,' 'roofing contractor website,' 'HVAC company website.' Geo-target to Pacific NW first. Expand nationally once conversion data exists.",
  },
  {
    id: "GS-03",
    adGroup: "category_intent",
    campaignType: "search",
    headlines: [
      "No Monthly Website Fees",     // 23 chars
      "Pay Once. Own It Forever.",   // 26 chars
      "$997 One-Time Flat Price",    // 25 chars
      "vs. Wix: $300/yr Forever",    // 25 chars
      "No Subscriptions Ever",       // 21 chars
      "You Own Your Domain",         // 20 chars
      "Custom Site, No Monthly Bill",// 29 chars
      "Ditch the Website Tax",       // 21 chars
      "48-Hour Build Time",          // 18 chars
      "Free Audit First",            // 16 chars
      "Money-Back Guarantee",        // 21 chars
      "Real Design, Flat Rate",      // 22 chars
      "Stop Paying Monthly Fees",    // 25 chars
      "BlueJays Web Design",         // 20 chars
      "Switch to Flat-Rate Design",  // 27 chars
    ],
    descriptions: [
      "Wix costs $16–$45/month. That's $200–$540/year, forever. We charge $997 once and you own everything.",
      "No monthly platform fee. No per-page limits. No builder to learn. Flat price — you're done.",
      "Most website builders lock your content. We hand over the keys. You own the domain, the files, everything.",
      "Compare: $997 once vs. $300/year forever on a builder you still have to manage yourself. Run your free audit.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/pricing",
    targetingNote: "Keywords: 'website without monthly fee,' 'one-time website cost,' 'website ownership.' Also works against Wix/Squarespace/Weebly comparison searches. Adjust bid down if CTR is high but conversion is low — this audience includes researchers, not just buyers.",
  },
  {
    id: "GS-04",
    adGroup: "category_intent",
    campaignType: "search",
    headlines: [
      "Website Under $1000",         // 19 chars
      "$997 Full Custom Build",      // 22 chars
      "Affordable Web Design",       // 21 chars
      "Not Cheap — Just Flat Rate",  // 27 chars
      "See Price Before You Start",  // 27 chars
      "Custom Design, $997 Flat",    // 24 chars
      "No Hidden Costs",             // 15 chars
      "Transparent Pricing",         // 20 chars
      "Domain + Hosting Included",   // 26 chars
      "Free Preview — Then Decide",  // 27 chars
      "What You See Is What You Pay",// 29 chars
      "Money-Back Guarantee",        // 21 chars
      "48 Hours, Flat $997",         // 20 chars
      "Custom, Not a Template",      // 22 chars
      "BlueJays — Flat Price",       // 21 chars
    ],
    descriptions: [
      "Wondering what a custom website actually costs? $997 flat. Domain, hosting, design — everything included.",
      "No surprise fees. No upsells. No monthly bill. $997 gets you a full custom website, live in 48 hours.",
      "We show you the site before you pay. Free audit + free preview — then $997 if you want to move forward.",
      "Most agencies quote $3K–$10K+. We charge $997 flat because we've built 150+ sites and know exactly what we're doing.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/pricing",
    targetingNote: "Price-intent keywords: 'how much does a website cost,' '$997 website,' 'affordable website design for small business.' This audience already has purchase intent — don't waste it with awareness-level copy. Every headline should acknowledge the price question and answer it confidently.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AD GROUP 2: PROBLEM-AWARE
  // Keywords: "not showing up on Google," "get more customers online," etc.
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: "GS-05",
    adGroup: "problem_aware",
    campaignType: "search",
    headlines: [
      "Not Showing Up on Google?",   // 25 chars
      "Your Site May Be the Problem",// 29 chars — valid
      "Free Audit — See Your Score", // 28 chars
      "Fix What's Hiding Your Site", // 28 chars
      "Get Found in Local Search",   // 26 chars
      "Mobile Speed Kills Rankings", // 28 chars
      "Free Site Audit in 2 Min",    // 25 chars
      "See Why Google Skips You",    // 25 chars
      "Start With a Free Score",     // 24 chars
      "$997 Fix, 48 Hours",         // 19 chars
      "We Find the Exact Issue",     // 24 chars
      "100% Money-Back Guarantee",   // 26 chars
      "Local Business Web Design",   // 26 chars
      "BlueJays — Free Audit",       // 21 chars
      "Real Fix, Not a Template",    // 25 chars
    ],
    descriptions: [
      "If your site loads slow, isn't mobile-friendly, or has thin content — Google buries it. Our free audit shows exactly what's wrong.",
      "Most small business owners don't know why they're not ranking. A 2-minute audit tells you the exact 3 things to fix.",
      "We score your site on the same signals Google uses: speed, mobile, content, and trust. Free. No email required to start.",
      "Fix the issues and you show up. It's that simple — but only if you know what the issues are. Start free.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Keywords: 'why is my website not showing up on Google,' 'my business isn't on Google,' 'how to rank locally,' 'local SEO small business.' This audience is earlier in the funnel — they haven't committed to buying a new site yet. Lead with the audit (free, low-risk) rather than the $997. Convert on the audit page.",
  },
  {
    id: "GS-06",
    adGroup: "problem_aware",
    campaignType: "search",
    headlines: [
      "Need More Online Customers?", // 28 chars
      "See What's Blocking New Leads",// 30 chars — exactly at limit
      "Free Audit — Find the Leak",  // 27 chars
      "Get More Calls From Google",  // 27 chars
      "Stop Losing Leads Online",    // 25 chars
      "Your Site Might Be Costing You",// 31 chars — OVER LIMIT, must cut
      "Site Issues Cost You Calls",  // 27 chars  ← replacement
      "Find Out in 2 Minutes",       // 22 chars
      "$997 Full Fix, 48 Hours",    // 24 chars
      "Custom Design + Real Photos", // 28 chars
      "100% Money-Back Guarantee",   // 26 chars
      "Free Score — No Sign-Up",     // 24 chars
      "Built for Lead Generation",   // 26 chars
      "Local Business Web Design",   // 26 chars
      "BlueJays Web Design",         // 20 chars
    ],
    descriptions: [
      "If you're getting traffic but not calls, something on your site is breaking trust before people pick up the phone.",
      "Speed, mobile layout, trust signals, clear contact info — your audit tells you which one (or all four) is the problem.",
      "150+ local business websites built. We know exactly which issues kill conversion and how to fix each one. Free audit, then decide.",
      "Get your free site score in 2 minutes. See the top 3 fixes. If you want us to do them — $997 flat, 48-hour turnaround.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Keywords: 'get more customers from website,' 'why isn't my website getting leads,' 'how to get more calls from my website,' 'increase website conversions small business.' Similar to GS-05 but further along — they know their site is the problem, they just don't know the fix. Lead with audit + the fact that we fix it after.",
  },
  {
    id: "GS-07",
    adGroup: "problem_aware",
    campaignType: "search",
    headlines: [
      "Done With DIY Websites?",     // 23 chars
      "We Build It — You Run It",    // 25 chars
      "No More Website Headaches",   // 26 chars
      "Real Designer, Flat $997",    // 24 chars
      "Ditch Wix. Get a Real Site.", // 27 chars — period = 1 char
      "Custom Design, Done For You", // 28 chars
      "Stop Fixing It Yourself",     // 24 chars
      "48 Hours. Real Designer.",    // 24 chars
      "Your Site. Our Work.",        // 20 chars
      "Free Audit — Then We Build",  // 27 chars
      "No Builder to Learn",         // 19 chars
      "100% Money-Back Guarantee",   // 26 chars
      "Flat Price. No Surprises.",   // 25 chars
      "BlueJays Web Design",         // 20 chars
      "Upgrade From DIY",            // 17 chars
    ],
    descriptions: [
      "Wix, Squarespace, GoDaddy builder — they all put you in charge of something you shouldn't have to manage. We just do it for you.",
      "Custom design using your real photos, services, and contact info. No templates, no builders, no monthly fees.",
      "Flat $997 — that covers design, domain, hosting setup, and a site that's actually built to convert. Live in 48 hours.",
      "Most business owners waste 10–20 hours learning a builder and end up with a site that still looks like a template. Skip that.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Keywords: 'alternatives to Wix,' 'hire someone to build my website,' 'professional website instead of DIY,' 'website designer near me.' High-intent commercial keywords. This audience is actively looking to switch from DIY. Lead with 'we do it for you' and the flat price. Negative keywords: 'free website,' 'website template.'",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN STRUCTURE CONSTANTS
// Reference these when setting up campaigns in Meta Ads Manager / Google Ads
// ─────────────────────────────────────────────────────────────────────────────

export const CAMPAIGN_STRUCTURE = {
  meta: {
    budgetSplit: "70% of total paid budget",
    campaignType: "Advantage+ Shopping Campaign (ASC) or Manual CBO",
    objective: "Leads (audit form submission)",
    warmupBudget: "$15–20/day to start — don't scale until CPL < $30",
    scaleBudget: "$50/day once you have 15+ leads with purchase data",
    adSetsRecommended: 2,
    adsPerAdSet: 4,
    adSets: [
      {
        name: "Cold — Broad (Advantage+)",
        audience: "US, 35–65, small business interests, trades interests. Let Meta optimize.",
        ads: ["MC-01", "MC-02", "MC-03", "MC-04"],
        note: "Let this run 7–10 days before comparing performance. Don't pause after 3 days.",
      },
      {
        name: "Cold — Vertical Targeting",
        audience: "Contractor, electrician, plumber, HVAC, dental, salon — job title + interest stacking.",
        ads: ["MC-05", "MC-06", "MC-07", "MC-08"],
        note: "Narrower audience — expect higher CPM, should see better CTR if creative-vertical match is right.",
      },
    ],
    retargetingCampaign: {
      name: "Warm — Retargeting",
      budget: "$5–10/day — small audience, don't over-spend",
      audience: "Website visitors (audit page, preview page, claim page) — 30-day window",
      ads: ["MR-01", "MR-02", "MR-03"],
      note: "Run all 3 simultaneously. The audience is small enough that frequency won't be a problem at this budget.",
    },
    refreshCadence: "Swap in a new creative every 3–4 weeks, or when frequency > 2.5 on a cold ad set. Hyperloop system handles this automatically once it's seeded with conversion data.",
  },
  google: {
    budgetSplit: "30% of total paid budget",
    minimumBudget: "$15–20/day — Google Search needs impression volume to learn",
    campaignType: "Search — manual CPC to start, switch to Target CPA once you have 15+ conversions",
    targetCPA: "$40–60 per audit submission (adjust once real data exists)",
    adGroups: [
      {
        name: "Category Intent",
        bidStrategy: "Manual CPC — $2–4/click to start",
        matchTypes: "Phrase + Exact. No broad match until campaign is profitable.",
        ads: ["GS-01", "GS-02", "GS-03", "GS-04"],
        keywordExamples: [
          '"website design for small business"',
          '"small business website"',
          '"custom website $997"',
          '"affordable web design"',
          '"website no monthly fee"',
        ],
        negativeKeywords: ["free", "template", "diy", "wix", "squarespace", "wordpress tutorial", "learn"],
      },
      {
        name: "Problem Aware",
        bidStrategy: "Manual CPC — $1.50–3/click to start (lower intent, lower bid)",
        matchTypes: "Phrase match for problem-language queries",
        ads: ["GS-05", "GS-06", "GS-07"],
        keywordExamples: [
          '"not showing up on Google"',
          '"why isn\'t my website getting leads"',
          '"how to get more customers from website"',
          '"hire someone to build my website"',
          '"alternatives to Wix"',
        ],
        negativeKeywords: ["free", "template", "diy", "learn", "tutorial", "how to build yourself"],
      },
    ],
    extensions: {
      sitelinks: [
        { text: "Free Site Audit", url: "/audit" },
        { text: "See Live Examples", url: "/v2/dental" },
        { text: "How It Works", url: "/#how-it-works" },
        { text: "Pricing", url: "/#pricing" },
      ],
      callouts: ["$997 Flat Price", "48-Hour Delivery", "No Monthly Fees", "100% Money Back"],
      callExtension: "(253) 886-3753",
    },
  },
  holdoffChannels: {
    googleDisplay: "Don't run until Meta is profitable. Display audiences are broad and conversion intent is low.",
    youtube: "Don't run until Meta budget is $50+/day and profitable. YouTube needs creative volume to work.",
    linkedin: "Manual outreach only at this stage. LinkedIn ads are $8–15+ CPC — too expensive for a $997 product until LTV math improves.",
    tiktok: "Worth testing VS-01 as a TikTok after it's proven on Meta Reels. Same creative, same targeting. Don't set up a separate campaign before then.",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// QUICK REFERENCE: AD COUNTS BY PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

export const AD_INVENTORY = {
  metaColdTotal: META_COLD_ADS.length,           // 8
  metaRetargetingTotal: META_RETARGETING_ADS.length, // 3
  videoScriptsTotal: VIDEO_SCRIPTS.length,       // 3
  googleSearchTotal: GOOGLE_SEARCH_ADS.length,   // 7
  totalCreatives: META_COLD_ADS.length + META_RETARGETING_ADS.length + VIDEO_SCRIPTS.length + GOOGLE_SEARCH_ADS.length, // 21
} as const;
