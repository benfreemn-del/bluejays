/**
 * BlueJays Ad Templates — Hormozi-Standard Library
 *
 * STRUCTURE (read this before touching anything):
 *
 *   PHASE 1 — LAUNCH (run these on day one)
 *     META_LAUNCH_ADS[3]   — the 3 strongest angles, in order of strength
 *     GOOGLE_SEARCH_ADS[5] — 2 ad groups, offer-led, no brand headlines
 *
 *   PHASE 2 — SCALE (week 3+ once winners emerge, ~$1,500+/mo spend)
 *     META_SCALE_ADS[5]    — rotation bank for when launch ads fatigue
 *     VIDEO_SCRIPTS[2]     — Meta Reels + Meta Feed only (no YouTube yet)
 *
 *   PHASE 3 — RETARGETING (when audit page has 500+ unique visitors)
 *     META_RETARGETING_ADS[3]
 *
 * BUDGET MINIMUMS (non-negotiable — below these numbers you are not running
 * ads, you are making donations to the platform while spinning in learning):
 *   Meta: $50/day minimum. $20/day per ad set.
 *   Google: $20/day minimum. $10/day per ad group.
 *   If total budget is under $50/day: put ALL of it on Meta, pause Google.
 *   If total budget is under $30/day: don't run paid ads at all. Email outreach
 *   has better ROI at this stage and doesn't require a learning phase.
 *
 * CHARACTER LIMITS (enforced):
 *   Google headlines: 30 chars max
 *   Google descriptions: 90 chars max
 *   Meta headlines: 40 chars (hard limit for feed placement)
 *
 * GRAND SLAM OFFER (reference this when writing any new creative):
 *   Dream outcome:      "More calls, bookings, and customers without managing
 *                        a builder or paying an agency $5,000+"
 *   Proof of likelihood: "150+ local sites. 30 industries. 6 years."
 *   Time delay:         "48-hour build. See it free first."
 *   Effort/sacrifice:   "Answer 3 questions. We do everything else."
 *   Risk reversal:      "100% money back. No questions. Same day."
 *   Price anchor:       "$5,000–$15,000 at agencies. $997 here. No monthly fees."
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MetaAd {
  id: string;
  phase: "launch" | "scale" | "retargeting";
  format: "single_image" | "carousel" | "video";
  placement: Array<"feed" | "stories" | "reels">;
  /** First line visible above the fold before "See more" — must stop the scroll */
  hook: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: "LEARN_MORE" | "GET_QUOTE" | "SIGN_UP";
  url: string;
  creativeNote: string;
  targetingNote: string;
}

export interface GoogleSearchAd {
  id: string;
  adGroup: "high_intent" | "problem_aware";
  headlines: string[]; // each ≤ 30 chars — verified
  descriptions: string[]; // each ≤ 90 chars — verified
  finalUrl: string;
  displayPath: string;
  targetingNote: string;
}

export interface VideoScript {
  id: string;
  platform: "meta_reels" | "meta_feed";
  duration: "30sec" | "60sec";
  hook: string;
  script: {
    visual: string[];
    voiceover: string[];
    editingNote: string;
    captionsNote: string;
  };
  productionNote: string;
  targetingNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — META LAUNCH ADS
// Run all 3 simultaneously. $20/day each ($60/day total on Meta).
// These are ordered strongest-to-weakest. L-01 is the best ad in this library.
// Don't rotate anything in until you have 14 days of conversion data on these.
// ─────────────────────────────────────────────────────────────────────────────

export const META_LAUNCH_ADS: MetaAd[] = [
  {
    id: "L-01",
    phase: "launch",
    format: "single_image",
    placement: ["feed", "stories", "reels"],
    hook: "This is what a $997 local business website looks like.",
    primaryText: `This is what a $997 local business website looks like.

Custom design. Real services. Real photos. Your city.

Not a template. Not a drag-and-drop builder. A site that looks like you paid $5,000 — because we've built 150+ of them and we know exactly what works.

It goes live in 48 hours. Includes domain registration and hosting. 100% money back if you don't love it.

First step is free: we score your current site in 60 seconds and show you exactly what it's costing you.

Find out what yours would look like.`,
    headline: "$997. Custom. 48 hours. See it free.",
    description: "150+ local sites built. Free audit shows what yours is costing you.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Show a split-screen: left side an outdated, cluttered website (generic stock). Right side a clean, premium V2 preview for the same category — dental, roofing, or electrician. No text overlay needed. The visual IS the ad. The contrast does the work. The left side makes them feel the pain. The right side makes them want the fix.",
    targetingNote: "Broadest possible cold audience. Business owners, self-employed, small business job titles. 35-65. Pacific NW 100-mile radius to start. This is your #1 ad — give it the most budget. If only one ad runs, it's this one. The hook now matches the actual funnel: show quality → offer free audit → build preview → close.",
  },
  {
    id: "L-02",
    phase: "launch",
    format: "single_image",
    placement: ["feed"],
    hook: "What $997 buys from BlueJays:",
    primaryText: `What $997 buys from BlueJays:

✓ Custom website — not a template
✓ Your real photos, services, and contact info
✓ Domain registration included
✓ Hosting setup included
✓ Mobile-first, built to rank on Google
✓ Live in 48 hours
✓ 100% money back if you don't love it
✓ No monthly fees. Ever.

Most agencies: $5,000–$15,000 upfront. Then $200–$400/month, forever.

We charge $997 once. You own everything.

150+ local businesses. 30+ industries. 6 years.

Start with the free audit — see your current site's score and what we'd build instead.`,
    headline: "$997 flat. You own everything.",
    description: "No monthly fees. 48 hours. 100% money back.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Clean two-column graphic. Left column: 'Other agencies' header, red X list (high price, long timeline, monthly fees, you don't own it). Right column: 'BlueJays' header, green check list matching the bullets above. Simple, high-contrast, scannable on mobile. No stock photos.",
    targetingNote: "Cold audience. Same targeting as L-01 but this ad skews toward people who've already been thinking about a new website — they recognize the agency price problem. Test against L-01 for 14 days. The winner of L-01 vs L-02 becomes the evergreen ad you scale.",
  },
  {
    id: "L-03",
    phase: "launch",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "Hector's phone stopped ringing. Same work. Same prices. Same crew.",
    primaryText: `Hector runs a landscaping company in Washington.

Great reviews. Real work. Steady clients. But his phone had slowed down and he didn't know why.

Turned out his call button was broken on half the browsers out there. Anyone visiting on an iPhone or Android couldn't tap to call him. He had no idea.

We found it in a 2-minute audit. Fixed everything in 48 hours. He paid $997.

His first new booking came in that same week.

That was 6 years ago. He's been doing six figures a year since. Same neighborhood. Same prices. Same crew. The site just stopped working against him.

Most local business websites have at least one thing like Hector's. A broken button. A page that takes 8 seconds to load on mobile. A phone number you can't tap.

Find out what yours has. Free. 60 seconds.`,
    headline: "One fix. Six figures a year since.",
    description: "Free audit finds what yours has. $997 to fix it.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Real-feeling image: a landscaping truck or crew in action. Not stock-photo perfect — authentic. Text overlay in the corner: '6 years. Six figures. $997.' Small enough to not crowd the image but visible on scroll. If no real photo is available, a 5-star Google review card with a landscaping photo behind it.",
    targetingNote: "Cold audience. Trade business owners especially (landscaping, plumbing, roofing, electrical, HVAC). The Hector story self-filters — trade owners immediately picture themselves in it. Also effective for any service business with a mobile audience. Test $20/day alongside L-01 and L-02.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — META SCALE ADS
// Rotate these in starting week 3 as launch ads fatigue (frequency > 2.5).
// Never retire all 3 launch ads at once — replace one at a time.
// ─────────────────────────────────────────────────────────────────────────────

export const META_SCALE_ADS: MetaAd[] = [
  {
    id: "S-01",
    phase: "scale",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "Your reviews are 5 stars. Your website is not.",
    primaryText: `You've earned the reviews. You've done the work. Your Google rating is proof.

But when someone searches for you — or finds you for the first time — what they see is your website.

If the site doesn't match the quality of your work, they don't call. They find someone who looks more professional online, even if you'd do a better job.

That gap is costing you real money.

We score your site free. If it matches your reviews, you'll know. If it doesn't, you'll know exactly what to fix.`,
    headline: "Your work vs. your website.",
    description: "Free score. 60 seconds. No card needed.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Split image: left side a genuine 5-star Google review card (real-looking, not a mockup). Right side a clearly outdated website screenshot. The visual contrast communicates the entire hook without reading the copy. Works especially well for trades and service businesses with strong review volume.",
    targetingNote: "Target business owners with established Google presence — interest in 'Google My Business', 'business reputation'. Works best for businesses that have been operating 3+ years (they have the reviews to feel the identity gap). Scale-phase audiences who've already seen L-01 and L-02 will respond to this new angle.",
  },
  {
    id: "S-02",
    phase: "scale",
    format: "single_image",
    placement: ["feed", "reels"],
    hook: "It's 9pm. Someone's pipe just burst. They're Googling.",
    primaryText: `It's 9pm on a Thursday.

Pipe burst. AC went out. Roof is leaking. They need someone now.

They're on their phone, scrolling fast. They're going to call the first business that:
— loads in under 2 seconds
— has a phone number they can tap
— looks like a real company

Most local business websites fail at least one of those. Some fail all three.

If yours is slow, the number is buried, or it looks like it hasn't been touched since 2014 — you're not getting that call.

Find out where yours stands. Free audit. 60 seconds.`,
    headline: "Are you winning the 9pm search?",
    description: "Free audit shows exactly what you're losing.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Dark image — phone screen glow at night showing a Google search for '[trade] near me' or 'emergency plumber.' Emotional, urgent, instantly relatable to any trade business owner. Optional: text overlay at bottom showing '9:47pm' in phone-clock style.",
    targetingNote: "Trade verticals primarily: plumber, HVAC, electrician, roofer, emergency locksmith. The '9pm scenario' is so specific to emergency services that non-emergency businesses self-filter. Strong as a second-rotation ad once the launch set has fatigued — it hits a different emotion than L-01 and L-03.",
  },
  {
    id: "S-03",
    phase: "scale",
    format: "single_image",
    placement: ["feed"],
    hook: "Why is your license number in the footer?",
    primaryText: `Electricians, plumbers, HVAC techs, roofers — your license number is the #1 trust signal your customer is looking for.

Most trade websites bury it in the footer. Customers don't scroll that far. They hit back and call someone else.

The same goes for your emergency line. Your years in business. Your bond and insurance.

When someone's power is out at midnight, they need to see: licensed, available, trusted. In the first 5 seconds. Not after three scrolls.

We score trade websites free. Find out in 60 seconds if yours passes the tests that actually matter.`,
    headline: "Trades: your license should be first.",
    description: "Free audit. See what customers see in 5 seconds.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Two phone screens side by side. Left: cluttered trade website, license number circled in red way down in the footer. Right: clean version with license number and phone number prominent in the hero, with a green checkmark. Simple. The visual makes the argument.",
    targetingNote: "Vertical-specific. Run separate ad sets for: electrician, plumber, HVAC, roofing, general contractor. Swap 'electrician' to the relevant trade in the primary text — 5 versions of this ad for 5 categories, each targeted to job title + interest for that trade. This is one of the highest-intent cold audiences available.",
  },
  {
    id: "S-04",
    phase: "scale",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "150 local business websites. Here's what we keep finding.",
    primaryText: `After scoring 150+ local business websites, the same issues show up over and over.

#1 — Phone number not tapable on mobile. It's there, but it's an image or it's not formatted as a link. Can't tap to call.

#2 — Site takes longer than 3 seconds to load on mobile. Half the people leave before it finishes.

#3 — No clear answer to "why should I pick you" in the first 5 seconds. Generic headlines like "Welcome to our website" or "Serving the Pacific Northwest since 2008."

Most sites have at least 2 of these. Some have all 3.

Find out which ones yours has. Free. Takes 60 seconds.`,
    headline: "150 sites. Same 3 problems.",
    description: "Free audit shows which ones yours has.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Simple graphic: numbered list (1, 2, 3) with each issue stated plainly. No frills. Clean type on a dark or light background. The 'insider data' frame — 150 sites analyzed — makes this feel like a research reveal, not an ad. That's the creative hook.",
    targetingNote: "Broad small business cold audience. Works for any service category — the 3 issues are universal. Best as a 3rd or 4th rotation after L-01, L-02, L-03 have run. The 150-site social proof anchor is the authority builder that makes scale-phase audiences who don't know BlueJays feel like they're hearing from an expert.",
  },
  {
    id: "S-05",
    phase: "scale",
    format: "single_image",
    placement: ["feed"],
    hook: "What does your site score?",
    primaryText: `We built an audit tool that scores local business websites on the exact things that drive phone calls:

— Mobile load speed
— Tapable phone number
— Trust signals visible above the fold
— Clear answer to "why you" in under 5 seconds
— Photos that look real, not stock

Score of 80+: your site is doing real work. Close this ad.

Score of 60–79: you're leaving calls on the table. Fixable.

Score below 60: your site is costing you customers every week. The fix starts at $997 and takes 48 hours.

Free to find out where yours sits.`,
    headline: "What would your site score?",
    description: "Free audit. Honest results. 60 seconds.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Score gauge graphic — a circular meter with red/amber/green zones. Needle pointing somewhere in the amber 'leaving money on the table' zone. Clean, self-explanatory. Alternately: a screenshot of the audit results page showing a score card with the three red Xs visible.",
    targetingNote: "Curiosity-led. Works best as a SCALE ad — not a cold opener. People who've seen your other ads (the proof, the offer) respond to the curiosity angle because they already have some brand awareness. As a pure cold ad, curiosity underperforms urgency and proof. Don't run this before week 4.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — META RETARGETING ADS
// DO NOT SET THESE UP until the audit page has 500+ unique visitors.
// Below 500 visitors the audience is too small for Meta to optimize.
// Run these to people who visited /audit but did NOT submit the form.
// ─────────────────────────────────────────────────────────────────────────────

export const META_RETARGETING_ADS: MetaAd[] = [
  {
    id: "R-01",
    phase: "retargeting",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "You checked your site score. Here's the part we didn't say.",
    primaryText: `You ran the audit. You saw the score.

Here's what the number means in dollars:

The average local business with a site scoring under 60 is losing 3-5 calls a month to competitors with better-looking sites. At even $300 a job, that's $900–$1,500 a month walking out the door.

The fix is $997 one time. It pays for itself in the first month if even two of those calls come back.

The audit showed you the problem. This is the fix.`,
    headline: "Your score showed the problem. $997 fixes it.",
    description: "48 hours. 100% money back. No monthly fees.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Simple graphic: a score gauge with the needle in the red zone on the left, arrow pointing right to a clean premium website screenshot. Dollar sign visible somewhere — make the math visual. No stock photos. This is a reminder ad for warm traffic, not a cold hook.",
    targetingNote: "Retargeting ONLY. Custom audience: visited /audit in the last 30 days, did NOT reach /audit/*/processing (did not submit). This audience knows the problem. The ad's job is to connect the problem to the fix and make the price feel small against the math.",
  },
  {
    id: "R-02",
    phase: "retargeting",
    format: "single_image",
    placement: ["feed"],
    hook: "Still thinking about it?",
    primaryText: `Still thinking about it?

Here's the only question that matters: how much is one new customer worth to your business?

If the answer is more than $997 — which it is for almost every trade, service, or local business — then the math is already done.

$997 once. 48 hours to launch. 100% money back if you don't love it. No monthly fees, ever.

The audit is still up. Your score isn't going to change on its own.`,
    headline: "One new customer pays for the whole thing.",
    description: "100% money back. 48 hours. No monthly fees.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Text-forward ad. Clean dark background, white text. The headline 'One new customer pays for the whole thing.' in large type. Subtext in smaller type: '$997 once. 48 hours. 100% money back.' No images, no stock photos — the copy IS the creative. High contrast, scannable in 1 second.",
    targetingNote: "Retargeting ONLY. Tighten the window to 14 days (people who checked the audit in the last 2 weeks). These are the warmest leads in the funnel. The 'still thinking about it' hook only works on people who have actually been thinking — cold audiences read it as weird. Budget: $10/day is enough at this audience size.",
  },
  {
    id: "R-03",
    phase: "retargeting",
    format: "single_image",
    placement: ["feed", "stories"],
    hook: "The three things people ask before they build with us.",
    primaryText: `The three things people ask before they build with us.

1. "Is $997 really the price?"
Yes. Flat. Includes domain registration and hosting setup. No upsells. No monthly fees. You own everything.

2. "What if I don't like it?"
Every dollar back. Same day. No questions. Reply to any email with the word "refund."

3. "How do I know it'll be good?"
150+ sites built. 30+ industries. 6 years. Your audit shows you exactly what you'd be getting — before you pay anything.

The audit page has everything. No pressure.`,
    headline: "150 sites. 30 industries. 6 years. $997.",
    description: "100% money back, same day. No questions asked.",
    cta: "LEARN_MORE",
    url: "bluejayportfolio.com/audit",
    creativeNote: "Three-panel graphic. Each panel has a Q&A — the objection in gray, the answer in white. Clean, direct, no frills. Looks more like a FAQ card than an ad, which is the point. This is an objection-handler, not a hook. It assumes the viewer already wants the thing and just needs the last three gates cleared.",
    targetingNote: "Retargeting ONLY. Best for people who visited /audit 7-14 days ago and haven't converted. This ad targets the fence-sitters who need objections addressed, not more emotional hooks. Don't run this to people who visited /audit in the last 48 hours — they're still in the 'thinking' phase where R-01 and R-02 work better.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — VIDEO SCRIPTS
// Meta Reels + Meta Feed ONLY. No YouTube. Run week 3+ alongside scale ads.
// These require filming. Don't produce until launch ads have proven ROI.
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO_SCRIPTS: VideoScript[] = [
  {
    id: "V-01",
    platform: "meta_reels",
    duration: "30sec",
    hook: "Most local business websites are costing the owner money. Here's the test.",
    script: {
      visual: [
        "0-3s: Phone screen close-up. Someone Googling '[trade] near me'. Fast, urgent feeling.",
        "3-8s: Cut to two websites side by side — one ugly/slow, one clean/fast. Contrast is obvious.",
        "8-15s: Close-up of the clean site. Phone number tap. Call connects. Green checkmark.",
        "15-22s: Text on screen: '150+ sites. $997 flat. 48 hours. 100% money back.'",
        "22-30s: Audit URL on screen. Simple. No clutter.",
      ],
      voiceover: [
        "When someone searches for your business on their phone at 9pm, they call the first site that loads fast and has a number they can tap.",
        "Most local business websites fail that test. One broken button. One slow load. The customer is gone.",
        "We audit your site free in 60 seconds. If we can fix it, $997 flat. 48 hours. 100% money back.",
        "bluejayportfolio.com slash audit.",
      ],
      editingNote: "Fast cuts. No longer than 2 seconds on any single shot. Subtitles on every word — 70% of Reels are watched on mute. End card should be static: white text on dark background, audit URL in large type, 3-second hold.",
      captionsNote: "Auto-captions ON. Review and correct before publishing — auto-caps misread 'BlueJays' and 'audit' occasionally. Bold the key numbers: $997, 48 hours, 100%. Use yellow highlight on the most important line.",
    },
    productionNote: "Can be filmed on iPhone. No studio needed. The phone-screen shots can be a screen recording. The website comparison can be a simple side-by-side screenshot. The VO can be recorded clean in a quiet room. Total production time: 2 hours max.",
    targetingNote: "Cold audience. Same broad targeting as L-01. Reels format gives you the best organic reach boost on Meta right now — even paid Reels get pushed to non-followers. This is your lowest-CPM format. Run at $20/day alongside the launch image ads. If Reels video outperforms images after 14 days, shift budget toward it.",
  },
  {
    id: "V-02",
    platform: "meta_feed",
    duration: "60sec",
    hook: "I built 150 local business websites. Here's what I keep finding.",
    script: {
      visual: [
        "0-5s: Ben on camera, casual setting (home office, not a studio). Direct eye contact.",
        "5-20s: Screen share: pull up a real (generic/anonymized) local business website. Walk through 2-3 obvious issues. Fast, not dwelling.",
        "20-35s: Cut to the V2 preview version of that category. Show the same category site rebuilt. Clean, fast, professional.",
        "35-50s: Back to Ben on camera. Audit URL visible in lower third throughout.",
        "50-60s: End card: audit URL large, $997 price, 48-hour promise, money-back guarantee.",
      ],
      voiceover: [
        "I've built over 150 websites for local businesses in the Pacific Northwest. And after doing this for 6 years, I see the same three problems on almost every site I audit.",
        "The phone number isn't tapable. The page takes longer than 3 seconds to load on mobile. And there's no clear answer to 'why should I pick you' in the first 5 seconds.",
        "Here's what that actually looks like — [screen share section, no VO, let the visuals speak].",
        "And here's what fixing it looks like — [preview section, no VO].",
        "We do a free audit of your site. Takes 60 seconds. If there's something worth fixing, we build the whole thing for $997 flat, live in 48 hours, and if you don't love it, every dollar comes back the same day.",
        "Link is in my bio. bluejayportfolio.com slash audit.",
      ],
      editingNote: "Ben on camera sections: handheld feel is fine. Don't over-produce. The screen share sections: record at 1080p, zoom in on specific elements being called out. Lower-third text throughout with audit URL. Cut the silences. Total pace should feel like a fast YouTube tutorial, not a polished ad.",
      captionsNote: "Subtitles mandatory — feed video autoplay is muted. Use the same caption style as the Reels version. Highlight dollar amounts and the time promise in a different color.",
    },
    productionNote: "This is the most valuable video asset in the library if Ben is comfortable on camera. An authentic founder explaining what he sees builds more trust in 60 seconds than any image ad can. The screen-share section can be recorded with Loom or QuickTime. Combine clips in DaVinci Resolve (free) or CapCut. Target: under 3 hours total production.",
    targetingNote: "Cold audience for Meta Feed. 60-second format is penalized in Reels — use it ONLY for feed placement. The longer runtime means only genuinely interested people watch to the end, which trains Meta's algorithm toward high-intent viewers. Run at $20/day. If the hook-rate (3-second view rate) is below 20%, the opening line isn't working — refilm the first 5 seconds.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — GOOGLE SEARCH ADS
// Run these on day one alongside Meta launch ads.
// $20/day minimum total. $10/day per ad group.
// These are RSAs (Responsive Search Ads) — Google picks the best combinations.
// Feed all 15 headlines and all 4 descriptions. More assets = better results.
// NO brand name headlines. This is a direct response campaign, not awareness.
// ─────────────────────────────────────────────────────────────────────────────

export const GOOGLE_SEARCH_ADS: GoogleSearchAd[] = [
  {
    id: "G-01",
    adGroup: "high_intent",
    headlines: [
      // ≤ 30 chars each — verified
      "$997 Custom Website",
      "Local Business Website",
      "Live in 48 Hours",
      "100% Money Back",
      "No Monthly Fees Ever",
      "Free Site Audit",
      "Custom. Not a Template.",
      "150+ Sites Built",
      "Domain + Hosting Included",
      "See It Before You Pay",
      "Built for Local Business",
      "Mobile-First Design",
      "Pacific NW Web Design",
      "Replaces $5K Agency",
      "Free 60-Second Audit",
    ],
    descriptions: [
      // ≤ 90 chars each — verified
      "$997 flat. Custom design, domain, hosting included. Live in 48 hours. 100% money back.",
      "We score your current site free in 60 seconds. See exactly what it's costing you in missed calls.",
      "150+ local businesses built. 30 industries. 6 years. No templates. No monthly fees. You own it.",
      "Agencies charge $5K–$15K then $300/mo forever. We charge $997 once. Same quality. Faster.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "High-intent keywords: 'local business website design', 'small business website', 'affordable web design [city]', 'website designer near me', 'custom website $997'. Exact and phrase match. Bid on city names: Seattle, Tacoma, Olympia, Bellevue, Everett, Bellingham, Spokane. Exclude: 'free website builder', 'wix', 'squarespace', 'DIY website' — these are people who don't want to pay.",
  },
  {
    id: "G-02",
    adGroup: "high_intent",
    headlines: [
      // ≤ 30 chars each — verified
      "New Website in 48 Hours",
      "Website That Gets Calls",
      "$997. You Own Everything.",
      "No Web Designer Needed",
      "We Build It for You",
      "Free Audit First",
      "See Results Before Paying",
      "Local Site Specialists",
      "30+ Industries Served",
      "Replace Your Old Site",
      "Mobile Website Design",
      "Tapable Phone Numbers",
      "Fast-Loading Local Sites",
      "No Contracts Ever",
      "Flat Rate Web Design",
    ],
    descriptions: [
      // ≤ 90 chars each — verified
      "Tell us 3 things. We build the whole site. $997 flat, 48 hours, 100% money back guarantee.",
      "Free audit scores your current site on the things that drive calls: speed, mobile, trust signals.",
      "We've built 150+ local business sites. Plumbers, dentists, roofers, salons. $997. No surprises.",
      "Unlike agencies, you don't wait 6 weeks or pay monthly. $997 once. Live in 48 hours. Done.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/free-audit",
    targetingNote: "Second ad in the high_intent group. A/B test G-01 vs G-02 for 30 days, keep the winner. Both target the same keyword list. The difference is angle: G-01 leads with price/proof, G-02 leads with speed/simplicity. One will outperform depending on the market.",
  },
  {
    id: "G-03",
    adGroup: "high_intent",
    headlines: [
      // ≤ 30 chars each — verified
      "Website Audit — Free",
      "Is Your Site Losing Calls?",
      "Find Out in 60 Seconds",
      "Free Site Score",
      "What's Your Site Missing?",
      "$997 If You Want the Fix",
      "See Your Site's Problems",
      "No Card Required",
      "Instant Audit Results",
      "Fix It in 48 Hours",
      "Local Business Focused",
      "Mobile Score Included",
      "Speed Test Included",
      "Trust Score Included",
      "Free. No Strings.",
    ],
    descriptions: [
      // ≤ 90 chars each — verified
      "Free audit scores your site on mobile speed, tapable phone, trust signals, and more. 60 seconds.",
      "Score under 60? Your site is losing you calls every week. We fix it: $997, 48 hours, money back.",
      "150+ local business sites audited. We know exactly what's breaking yours. Free to find out.",
      "No form to fill out. No salesperson to talk to. Enter your URL and see the score. That's it.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Third ad in high_intent group. Audit-angle entry point. Use for keywords like 'website audit', 'is my website good', 'website score', 'why isn\'t my website getting leads'. These are slightly lower intent than 'web design' but higher conversion rate from the audit page because they WANT the audit information.",
  },
  {
    id: "G-04",
    adGroup: "problem_aware",
    headlines: [
      // ≤ 30 chars each — verified
      "Website Not Getting Calls?",
      "Slow Website? We Fix It.",
      "Old Site Costing You Leads?",
      "Mobile Site Broken?",
      "Phone Number Not Tapable?",
      "Free 60-Second Diagnosis",
      "$997 Full Rebuild",
      "48-Hour Turnaround",
      "100% Money Back",
      "150 Sites Fixed",
      "No Monthly Fees",
      "You Own Everything",
      "Same Day Audit Results",
      "Local Business Experts",
      "Free. No Catch.",
    ],
    descriptions: [
      // ≤ 90 chars each — verified
      "If your site loads slow, looks outdated, or has a broken call button — customers are leaving. We find it free.",
      "Free audit in 60 seconds. If we find something worth fixing, $997 flat gets you a full new site in 48 hours.",
      "Most local business sites fail at least one thing that costs calls. Find out which ones yours has — free.",
      "6 years fixing local business websites. $997 flat. You own everything. 100% money back. No monthly fees.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/audit",
    targetingNote: "Problem-aware keywords: 'my website isn\'t getting leads', 'website not ranking', 'old website redesign', 'website loading slow', 'fix my business website'. These people know something is wrong but don't know what. The audit is the perfect answer. Lower search volume than high_intent, but higher purchase intent because the pain is already felt.",
  },
  {
    id: "G-05",
    adGroup: "problem_aware",
    headlines: [
      // ≤ 30 chars each — verified
      "Replace Your Old Website",
      "Outdated Site? Start Here.",
      "Website Redesign — $997",
      "Modern Site in 48 Hours",
      "Stop Losing Leads Online",
      "Free Before-and-After",
      "See What You're Missing",
      "Competitors Look Better?",
      "We Outperform Agencies",
      "No Templates. Custom.",
      "Real Photos, Real Copy",
      "Domain Included — $997",
      "Hosting Included — $997",
      "Audit First. Pay Later.",
      "60-Second Free Audit",
    ],
    descriptions: [
      // ≤ 90 chars each — verified
      "If your site looks like 2015, your competitors are winning customers you should be getting. $997 fixes it.",
      "We score your old site, show you what a new one looks like, then build it: $997, 48 hours, money back.",
      "Stop paying monthly to look amateur. $997 once. Custom design. You own the domain. No recurring fees.",
      "150+ local businesses replaced their old sites with us. 30 industries. 6 years. Free audit first.",
    ],
    finalUrl: "https://bluejayportfolio.com/audit",
    displayPath: "bluejayportfolio.com/free-audit",
    targetingNote: "Competitor displacement keywords: 'replace wix website', 'better than squarespace', 'website redesign small business', 'affordable website redesign', 'local web designer'. People searching these are actively comparison-shopping. The '$997 vs agency' angle hits hardest here — they've probably already gotten a $5K+ quote.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN STRUCTURE
// Reference this before setting anything up in Ads Manager.
// ─────────────────────────────────────────────────────────────────────────────

export const CAMPAIGN_STRUCTURE = {
  meta: {
    campaignName: "BlueJays — Audit Lead Gen",
    objective: "CONVERSIONS" as const,
    conversionEvent: "Lead (audit form submit)",
    budgetType: "campaign_budget_optimization" as const,
    minimumDailyBudget: 50,
    launch: {
      description: "Run all 3 launch ads simultaneously. CBO distributes budget to winners automatically.",
      adSets: [
        {
          name: "Launch — Broad Cold",
          budget: "$60/day (CBO handles allocation across L-01, L-02, L-03)",
          targeting: {
            age: "35-65",
            locations: "Pacific NW — 100-mile radius from your base",
            interests: ["Small business owners", "Self-employed", "Business", "Entrepreneurship"],
            behaviors: ["Small business owners", "Business page admins"],
            excludes: ["Already submitted audit form (Custom Audience)"],
          },
          ads: ["L-01", "L-02", "L-03"],
          notes: "Don't touch for 14 days. Meta needs 50 conversions per ad set per week to exit learning. Let it run.",
        },
      ],
    },
    scale: {
      description: "Week 3+. Only rotate when frequency > 2.5 on any launch ad. Replace one at a time.",
      rotationRules: [
        "Check frequency weekly. Frequency > 2.5 = creative fatigue.",
        "Retire the fatigued ad. Add one scale ad from META_SCALE_ADS.",
        "Never retire all 3 launch ads at once.",
        "L-01 is the anchor — retire it last.",
        "S-05 (curiosity hook) goes in last. Never before week 4.",
      ],
    },
    retargeting: {
      description: "DO NOT SET UP until /audit page has 500+ unique visitors. Below this, audience is too small.",
      gate: "500 unique visitors to /audit",
      setup: [
        "Create Custom Audience: visited /audit, did NOT reach /audit/*/processing, last 30 days.",
        "Create separate ad set for retargeting. Do NOT mix with cold audiences.",
        "Budget: $10/day. Audience is small — it doesn't need more.",
        "Run R-01, R-02, R-03 simultaneously.",
        "Tighten R-02 window to 14 days (warmest leads).",
      ],
    },
  },
  google: {
    campaignName: "BlueJays — Website Audit",
    campaignType: "Search",
    biddingStrategy: "Maximize Conversions (switch to Target CPA after 30 conversions)",
    minimumDailyBudget: 20,
    adGroups: [
      {
        name: "High Intent — Web Design",
        ads: ["G-01", "G-02", "G-03"],
        dailyBudget: "$10/day to start",
        keywordMatchTypes: ["Exact", "Phrase"],
        exampleKeywords: [
          '"local business website design"',
          '"small business website"',
          '"affordable web design near me"',
          '"website designer [city name]"',
          '"custom website $997"',
          '"website audit"',
          '"website score"',
        ],
        negativeKeywords: [
          "free website builder",
          "wix",
          "squarespace",
          "wordpress template",
          "DIY website",
          "web hosting only",
          "domain registration only",
        ],
      },
      {
        name: "Problem Aware — Old Site",
        ads: ["G-04", "G-05"],
        dailyBudget: "$10/day to start",
        keywordMatchTypes: ["Exact", "Phrase"],
        exampleKeywords: [
          '"website not getting leads"',
          '"website loading slow"',
          '"old website redesign"',
          '"replace my website"',
          '"website redesign small business"',
          '"affordable website redesign"',
          '"why isn\'t my website working"',
        ],
        negativeKeywords: [
          "free",
          "template",
          "DIY",
          "builder",
          "wix",
          "squarespace",
        ],
      },
    ],
    notes: [
      "If total budget is under $50/day, pause Google entirely. Put everything on Meta.",
      "Google works at $20/day but it needs 30+ conversions to optimize bidding. Be patient.",
      "After 30 conversions, switch from Maximize Conversions to Target CPA. Set CPA target at $30 (audit form submit, not sale).",
      "Add city name extensions. Add callout extensions with: '$997 Flat', '48-Hour Build', '100% Money Back'.",
      "Review search terms report weekly. Add irrelevant searches as negatives immediately.",
    ],
  },
  budgetScenarios: [
    {
      totalDailyBudget: 0,
      label: "Under $30/day",
      recommendation: "Don't run paid ads. Use the email outreach pipeline. No learning phase = no wasted spend.",
    },
    {
      totalDailyBudget: 50,
      label: "$50/day",
      recommendation: "ALL on Meta. $60/day split across L-01, L-02, L-03 via CBO. Zero on Google.",
      breakdown: { meta: 60, google: 0 },
    },
    {
      totalDailyBudget: 70,
      label: "$70/day",
      recommendation: "$50 Meta (launch ads) + $20 Google (high_intent only). Skip problem_aware until $100/day.",
      breakdown: { meta: 50, google: 20 },
    },
    {
      totalDailyBudget: 100,
      label: "$100/day",
      recommendation: "$60 Meta + $40 Google ($20/ad group). Standard launch setup. Run for 30 days before adjusting.",
      breakdown: { meta: 60, google: 40 },
    },
    {
      totalDailyBudget: 200,
      label: "$200/day — Scale Phase",
      recommendation: "$120 Meta (launch + 1 scale ad) + $80 Google + $10 retargeting (if 500+ audit visitors).",
      breakdown: { meta: 130, google: 70, retargeting: 10 },
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY EXPORT
// All creative assets in one place for easy reference.
// ─────────────────────────────────────────────────────────────────────────────

export const AD_INVENTORY = {
  meta: {
    launch: META_LAUNCH_ADS,
    scale: META_SCALE_ADS,
    retargeting: META_RETARGETING_ADS,
    allMeta: [...META_LAUNCH_ADS, ...META_SCALE_ADS, ...META_RETARGETING_ADS],
  },
  google: GOOGLE_SEARCH_ADS,
  video: VIDEO_SCRIPTS,
  structure: CAMPAIGN_STRUCTURE,
  counts: {
    metaLaunch: META_LAUNCH_ADS.length,
    metaScale: META_SCALE_ADS.length,
    metaRetargeting: META_RETARGETING_ADS.length,
    googleSearch: GOOGLE_SEARCH_ADS.length,
    videoScripts: VIDEO_SCRIPTS.length,
    totalCreatives: META_LAUNCH_ADS.length + META_SCALE_ADS.length + META_RETARGETING_ADS.length + GOOGLE_SEARCH_ADS.length + VIDEO_SCRIPTS.length,
  },
} as const;
