-- Hormozi KB additions — sourced from the Cory / ProShine HVAC duct-
-- cleaning diagnosis ($1.25M revenue → $2.4M revenue 12 months later,
-- 38% net margin, 82% close rate, 99% show rate, $60K debt at start,
-- one active affiliate sending $30K/mo, demand-constrained with new
-- vans + hires). Adds 17 framework chunks covering sub-$5M pricing
-- math, debt-avoidance philosophy, dedicated-ad-landing-page CRO,
-- the Hormozi Affiliate Offer 2 mechanic (lead-magnet-as-affiliate-
-- product), outbound HOA / community event strategy, "I Owe You"
-- reactivation email frame, savings-based email angles, multi-
-- seasonal pain-point messaging, brand-term-bidding, and 3-email
-- mini-campaign structure.
--
-- VALIDATED: Cory's 12-month outcome (Apr 2025 → Apr 2026) was
-- ~100% revenue growth ($1.25M → $2.3-2.5M), driven primarily by
-- the marketing/funnel improvements (new agency, optimized landing
-- page, upped ad spend, 120 → 200 leads/mo with higher quality).
-- Pattern matches Luis: funnel + segment + pricing > volume in year 1.
--
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Sub-$5M Pricing: 65% Close-Rate Floor Math', 'framework', null,
  array['pricing', 'unit-economics', 'closing', 'sub-5m'],
  $content$For businesses under $3-5M revenue, raising prices is often the single highest-leverage change because customers actually believe you can deliver when you charge more. Concrete decision rule: if your current close rate is 80%+, you have room to raise prices. The math floor: (new price × new close rate) > (old price × old close rate). For a 10% price raise, the breakeven close rate floor is roughly 65%. As long as the close rate stays above 65% after the raise, you make MORE money than before. Cory ProShine: 23% price raise → close rate stayed at 80%+ → ~25% increase in net profit. Many newer business owners are afraid of charging money and sell themselves out of sales because the low price reads as "seedy duct-tape operation" rather than premium. Test in 5-10% increments, measure close rate against the floor, ratchet up.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Sub-$5M Pricing: 65% Close-Rate Floor Math');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Veblen Good vs Normal Good + Virtuous Cycle of Pricing', 'framework', 'https://www.acquisition.com/books/offers',
  array['pricing', 'philosophy', 'unit-economics', 'value-equation'],
  $content$Economic distinction for raising prices. (1) VEBLEN/LUXURY GOODS: higher price = MORE demand because price IS the status signal (Rolex, Hermès). Rare in service businesses — no one brags at the Rotary Club about how much they spend on their HVAC duct cleaning. (2) NORMAL GOODS (most businesses): higher price = lower demand mathematically, BUT for service/coaching/expertise businesses, raising price ALSO increases the perceived likelihood that you can actually deliver. This is the Virtuous Cycle of Pricing (Offers book page 48): higher price → more emotional investment from buyer → more perceived value → better results → less demanding customer → more money to actually deliver → cycle compounds. The opposite is the death spiral: low price → seedy perception → poor delivery → bad reviews → harder to raise prices. Diagnose which bucket your business is in: if you sell expertise or specialty services, you're in bucket 2 — raise prices.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Veblen Good vs Normal Good + Virtuous Cycle of Pricing');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Debt-Avoidance Philosophy (Risk × Time Horizon)', 'framework', null,
  array['finance', 'risk', 'philosophy', 'longevity'],
  $content$On the Dave-Ramsey-to-Wall-Street debt spectrum, Hormozi skews close to the Ramsey side for operating businesses. Core argument: debt increases risk, and risk multiplied over a long time horizon tends to come due. Most businesses have seasons of volatility — restaurants slow in winter, HVAC slows in mild weather, retail concentrates around holidays. Debt magnifies the downside of any season that runs long. The original reason most operators take on debt is "I wanted to grow faster" — but most enduring companies (Chick-fil-A example, never went public, never took outside debt for operations) operate debt-free. Recommendation: pay down operating debt aggressively even when the math says you "could" leverage it for higher returns. The math optimizes for expected value; the philosophy optimizes for survival across many cycles. Cory had $60K debt at start; recommended 10% of profit toward paydown, debt-free in 4-5 months. Different from real-estate debt or one-time acquisition debt — operating debt is the dangerous kind.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Debt-Avoidance Philosophy (Risk × Time Horizon)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Dedicated Ad Landing Page (Not Your Homepage)', 'framework', null,
  array['CRO', 'paid-ads', 'funnel', 'landing-page'],
  $content$Never send Google/Meta/TikTok ads to your homepage. Build a dedicated ad-only landing page with ONE function: conversion. Anatomy: (1) tiny header bar — small logo + hamburger menu only, NO nav links, NO social icons. (2) above-the-fold: one clear offer headline + ONE clear CTA (form OR phone), shrink everything else. (3) brief value props (3-4 bullets max). (4) social proof (1-3 testimonials with photos). (5) FAQ at bottom for objection-handling. (6) location/service area. That's it. No site nav, no blog feed, no "About Us" section. Doesn't even need to be navigable from the main site. The reason: every additional element on the page reduces conversion. Homepage serves dozens of intents (existing customers, browsers, job seekers, press); the ad landing page serves ONE intent (turn paid click into qualified lead). Variant: if you have a homepage that's currently the ad destination, A/B test the dedicated landing page against it — expect 1.5-2.5x conversion lift.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Dedicated Ad Landing Page (Not Your Homepage)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Every Funnel Step Loses 50% (Drop-Off Rule)', 'framework', null,
  array['CRO', 'funnel', 'conversion', 'metrics'],
  $content$Rule of thumb for funnel math: every additional step in a high-value funnel costs you roughly 50% of remaining traffic (range: 30-70% depending on friction). Cory example: ad → homepage with one CTA → click that CTA → contact page → fill form. That's 3 unnecessary steps after the ad click, each losing ~50%. End-to-end: 100 ad clicks → 50 → 25 → 12 form fills. Collapse to ad → dedicated landing page → form fill (1 step) and you might get 50 form fills from the same 100 clicks — 4x lift. Diagnostic: count the EXACT number of clicks/scrolls/decisions between ad click and form submit. Each one is a 50% knife. Eliminate every step that isn't necessary for qualification or trust-building. The form itself is the destination, not the homepage.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Every Funnel Step Loses 50% (Drop-Off Rule)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Refer-Out Strategy for Non-Competing Service Scope', 'framework', null,
  array['affiliates', 'strategy', 'positioning', 'service-business'],
  $content$Counter-intuitive growth strategy for local service businesses: deliberately LIMIT your service scope to NOT compete with adjacent businesses, so they can affiliate-partner with you. Cory only does HVAC cleaning + minor patching, NOT full HVAC replacement. This lets him partner with full-replacement HVAC companies — they refer him cleaning work, he refers them replacement work. Both sides win because their service catalogs don't overlap. Generalizes: many local businesses try to expand into adjacent services to capture more revenue per customer — but the hidden cost is they kill all potential affiliate relationships in those adjacent spaces. By staying narrow, you become the trusted partner for 5, 10, 20 other businesses. Limiting scope often unlocks more revenue than expanding scope, because affiliate-driven lead flow at near-zero CAC beats self-driven lead flow at high CAC.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Refer-Out Strategy for Non-Competing Service Scope');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Affiliate Offer 2: Sell-My-Lead-Magnet (Hormozi Leads p.237)', 'framework', 'https://www.acquisition.com/books/leads',
  array['affiliates', 'offer', 'leads', 'partnerships'],
  $content$From $100M Leads book, page 237-239, Affiliate Offer 2 mechanic. Structure: affiliate sells YOUR low-ticket front-end product (lead magnet equivalent) AND KEEPS ALL THE MONEY. You eat the cost of delivering it. Then when you arrive on-site to deliver, you upsell the core offer. For Cory: affiliate sells his $175 dryer-vent cleaning to their customers, keeps the full $175. Cory's cost to deliver: ~$100 (technician time + travel). When Cory arrives, his technicians push the duct-cleaning inspection (the core $1,575 offer). Conversion math: even at 50% upsell rate (close 1 of 2 inspections to full cleaning at $3,150 avg revenue), Cory's CAC is roughly $200 — exceptional for service business. Why affiliates love it: they make free money on a service they don't have to deliver. Why you love it: customer acquisition at near-zero cost AND zero conflict (the affiliate has zero competing product). Best for businesses with high upsell conversion from front-end product. NOT for businesses with poor inside-the-house close rates.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Affiliate Offer 2: Sell-My-Lead-Magnet (Hormozi Leads p.237)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Affiliate Cap: Need Structured Offer, Not Promises', 'framework', null,
  array['affiliates', 'partnerships', 'sales'],
  $content$Most "affiliate programs" fail because the offer is "we'll refer business to each other." Promises are easy to make, hard to track, easy to forget. Symptom: out of 10 affiliate partners, 1 sends most of the volume and 9 are dormant. The fix is NOT more partners — it's a STRUCTURED OFFER with clear $$$ in it for the affiliate, zero work to deliver. Affiliate Offer 2 (sell-my-lead-magnet) is the prototypical example: clear price, clear margin, clear delivery (you handle it), affiliate just refers + collects. Without a structured offer, expanding from 1 to 20 partners doesn't 20x your affiliate revenue — most stay dormant because there's no concrete incentive structure. Build the offer FIRST, then recruit partners against it. Don't recruit partners hoping you'll figure out the offer later.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Affiliate Cap: Need Structured Offer, Not Promises');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Outbound HOA / Community Event Strategy + BAM-FAM Applied', 'framework', null,
  array['outbound', 'local', 'community', 'partnerships'],
  $content$For local service businesses, the highest-leverage outbound move is showing up at HOA / chamber-of-commerce / community events. Mechanic: NOT showing up the day of (everyone does that). Instead, reach out BEFORE the event season — "I'd love to know your community event calendar so I can plan to be there." Once you're "in" with one HOA, every event you attend, ask "when's the next one?" — book a meeting from a meeting (BAM-FAM applied to community events). One event delivered Cory 55 booked inspections. Math vs paid ads: a single 2-hour event with one team member showing up can deliver more pipeline than a $5K Meta ad spend, often at lower acquisition cost. The play scales linearly with team capacity — 1 event/week → 50 events/year × 30-55 inspections/event = 1,500-2,750 pipeline opportunities/year. Bottleneck: 1 full-time person needed to manage the calendar + show up.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Outbound HOA / Community Event Strategy + BAM-FAM Applied');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '"I Owe You" Reactivation Email Frame', 'framework', null,
  array['email', 'reactivation', 'nurture', 'framing'],
  $content$Counter-intuitive reactivation email opener for past customers. Instead of "Hey, we'd love to have you back" (low open rate, reads as solicitation), reframe as: "Hey, I owe you a free [X]" or "We messed up — let me make it up to you." Sample: "When you signed up, we didn't communicate that you qualified for a free yearly checkup. I want to make sure we're doing right by you — let us come out at no cost and confirm everything's working." Open rates jump dramatically because the subject reads as personal/restorative, not promotional. Per Cory: 20-30%+ of revenue can come from reactivation emails alone, and it's all-profit revenue (no acquisition cost). Variants: "We're behind on a service we promised — let us catch up," "Found a discrepancy in your account — let me fix it." The frame must be true (always honor the offer). Pair with "at no cost to you" bolded + underlined in the body.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '"I Owe You" Reactivation Email Frame');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Savings-Based Email Angle (Concrete $$ Beats Everything)', 'framework', null,
  array['email', 'social-proof', 'pricing', 'reactivation'],
  $content$For service businesses where the product affects ongoing costs (HVAC efficiency, energy bills, time savings, business margin), the strongest email angle is showing concrete dollar savings. Mechanism: collect 12 months of energy bills (or comparable cost metric) from existing customers. Build before/after comparisons. Sample: "Casey was paying $600/month on energy. After we cleaned her ducts, she's at $150/month. Same family, same house, same usage." Then run that as an email subject + body. Per Cory: this angle pairs with higher pricing — customer thinks "$3,400 for service that pays for itself in 18 months" instead of "$3,400 random expense." Generalizes to: SaaS time-saved math, marketing ROAS math, energy-efficiency math, anything where the product reduces an ongoing cost. Concrete dollar savings beats every other angle by 2-3x in click-through-rate.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Savings-Based Email Angle (Concrete $$ Beats Everything)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Multiple Seasonal Pain Points for Year-Round Coverage', 'framework', null,
  array['marketing', 'seasonality', 'nurture', 'planning'],
  $content$Most local service businesses have 1-2 obvious seasonal pain points but use only 1, leaving 8-9 months/year of weak messaging. Hormozi gym example: summer-shape pain (May-August) + New-Year resolution pain (Dec-Feb) = year-round signups. Cory HVAC example: pollen-allergy pain (April-June) + mildew-smell pain (October-November when heat kicks on). Identify 2 seasonal pain points specific to your industry. For each: build pre/during/post messaging (see Pre/During/Post Messaging framework). Result: 6 mini-campaigns × 2 seasons = 12+ campaigns/year covering every month. Diagnostic: write down what you currently market each month. If 6+ months have no clear seasonal hook, you have unrealized seasonal lift. Industries with strong seasonal patterns: fitness, HVAC, landscaping, tax services, retail. Industries with weak natural seasons: SaaS, ongoing-services — invent artificial seasons (Q1 planning, summer prep, year-end review).$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Multiple Seasonal Pain Points for Year-Round Coverage');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Pre/During/Post Messaging Pattern (3-Phase Seasonal Lift)', 'framework', null,
  array['marketing', 'seasonality', 'sequencing', 'planning'],
  $content$For each seasonal pain point, structure messaging across 3 phases that compound: (1) PRE — "If you want to be ready for [season], do it now before everyone scrambles. We're booking out 2 weeks." (2) DURING — "Are you suffering from [seasonal issue]? Don't wait for it to get worse. Same-day appointments available." (3) POST — "Missed [season]? Don't let it happen next year. Prepay your spring slot now for X discount." Three messages × two seasons = 6 mini-campaigns = year-round relevance. Hormozi gym example: pre-summer ("get in shape for bikini season") → during-summer ("look terrible in your bikini? Come in now") → post-summer ("didn't lose what you wanted? Don't let it happen next year"). Pre = anticipation. During = urgency. Post = regret-avoidance. Each phase taps a different emotion to capture customers who didn't act on the prior phase.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Pre/During/Post Messaging Pattern (3-Phase Seasonal Lift)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Brand-Term Bidding + Cross-Platform Retargeting', 'framework', null,
  array['paid-ads', 'retargeting', 'attribution', 'defensive'],
  $content$Two defensive ad mechanics that protect existing demand. (1) BID ON YOUR OWN BRAND TERMS — "Hormozi", "Acquisition.com", "BlueJays Business Solutions", every permutation people search for after seeing your content. Low cost because no competitor outbids your own brand. Prevents competitors from scooping your customers by outbidding you on YOUR name. Common objection: "they'd find me anyway, why pay?" Hormozi response: "get bigger problems." Mandatory for any business with brand awareness, especially businesses with weak organic SEO. (2) CROSS-PLATFORM RETARGETING — set up tracking pixels on ALL ad platforms (Meta, Google, TikTok, LinkedIn, YouTube). Visitor who came in from Google sees your Meta ads too. Multi-touch retargeting lift is significant (often 20%+ over single-platform). Cost: trivial — both moves combined are usually <5% of total ad spend. Defensive moats are easier than offensive lift.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Brand-Term Bidding + Cross-Platform Retargeting');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '3-Email Mini-Campaign Structure (Theme Stacking)', 'framework', null,
  array['email', 'nurture', 'sequencing'],
  $content$Instead of sending ONE-OFF reactivation/nurture emails, structure each theme as a 3-email mini-campaign. Per theme: (1) Email 1 — theme hook ("Did you know spring pollen reduces home air quality by 60%?"); (2) Email 2 — case study / proof ("Here's Casey, who cut her allergy symptoms by 80% after we cleaned her ducts"); (3) Email 3 — CTA + scarcity ("Spring slots fill fast — book your free 18-point inspection by [date]"). Spread the 3 emails over 5-10 days. Then move to next theme. Across a year, run 6+ themes (allergies, mildew, savings, environment, case studies, FAQ-rotating) × 3 emails each = 18+ emails to past customers that compound trust + conversion. Generalizes to onboarding sequences, sales cadences, retargeting drips — any time you'd otherwise send 1 email, structure as 3.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '3-Email Mini-Campaign Structure (Theme Stacking)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Customer Profile Portal as Trust Signal + Brand Asset', 'framework', null,
  array['retention', 'trust', 'service-business', 'differentiation'],
  $content$Give every customer access to a profile portal showing photos / data / proof of work delivered (before-and-after vent photos for Cory, build screenshots for BlueJays sites, audit dashboards for marketing services). Two compounding benefits: (1) Trust signal during sales — "you'll get a portal to track everything we do" reads as transparency + professionalism that competitors lack. (2) Brand asset for the customer — they can show the portal to friends, future buyers of their house, business partners. Generates word-of-mouth at no marginal cost. Cory's portal turns into a home-resale asset: "look at the documented duct-cleaning history" is a selling point when the house transfers. Generalizes: any service business should ship a customer-facing portal as part of every delivery, NOT as an extra feature. The portal IS the differentiator. Cost to build: usually <$5K one-time. Lifetime trust/referral lift: substantial.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Customer Profile Portal as Trust Signal + Brand Asset');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'One-Year Follow-Up Validation Pattern (Cory Case Study)', 'framework', null,
  array['case-study', 'validation', 'strategy', 'follow-up'],
  $content$Validated outcomes from the Cory / ProShine HVAC diagnosis 12 months later (April 2025 → April 2026): revenue grew ~100% ($1.25M → $2.3-2.5M), lead flow grew from 120/month to ~200/month with higher quality, new agency partnership, optimized landing page, increased ad spend, planning second location. Validated levers in order: (1) Switched marketing agency — replaced underperformer with one that "had been there, done that"; (2) Optimized landing page (dedicated ad-conversion asset, not homepage); (3) Increased ad spend now that funnel converts; (4) Higher-quality leads through better targeting + better landing page. NOT validated as year-1 needle-movers: the affiliate Offer 2 strategy was deferred to 2026 (takes longer to spin up); the outbound HOA strategy contributed but wasn't the dominant lever; the reactivation email campaigns compound over time. Pattern matches Luis: the BIG year-1 levers are funnel improvements + ad spend optimization + pricing — NOT volume strategies (affiliates, events, content). Operators chasing more leads when the gap is downstream of the funnel lose the year.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'One-Year Follow-Up Validation Pattern (Cory Case Study)');
