-- Hormozi KB additions — sourced from the Luis Laura / Optimum Works
-- diagnosis ($2.5M railing e-commerce, 15% margin, 1:1 LTV/CAC, 81%
-- from Google Ads, 70% DIY / 30% custom, broken attribution). Adds 18
-- framework chunks covering attribution reconciliation, customer-
-- segment-by-margin optimization, custom-order funnel architecture
-- (VSL → calendar → BANT SMS → call-with-card close), the
-- price-anchor-as-free frame, sticky cross-page CTAs, and long-term
-- email nurture for low-frequency-purchase categories.
--
-- IMPORTANT: This diagnosis has a one-year follow-up (March 2026) that
-- validated which frameworks actually moved the needle: optimizing
-- for custom orders (30% → 50% of revenue), fixing attribution, and
-- raising prices delivered 44% revenue growth + 41% profit growth.
-- Frameworks in this batch carry validation tag where applicable.
--
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Attribution Reconciliation Diagnostic', 'framework', null,
  array['marketing', 'attribution', 'paid-ads', 'diagnosis', 'metrics'],
  $content$When LTV/CAC math doesn't reconcile with actual P&L (e.g. reported LTV/CAC is 1:1 but the business is profitable, or reported is 41:1 but you should be losing money), the attribution is broken. Common cause: marketing agency claims credit for organic/referral/word-of-mouth sales that would have happened without paid ads. Symptoms: (1) post-purchase survey says "found us on Google" at 90%+ but Google Ads dashboard shows you losing money; (2) doubling ad spend doubled revenue but you can't explain the path; (3) LTV/CAC ratios don't compute against margin reality. Diagnostic moves: shut off ads temporarily and watch sales change; OR fire the agency and rebuild attribution from scratch (UTM parameters, server-side tracking, post-purchase surveys with specific channel options not just "Google"). Without clean attribution, every scaling decision is a guess. Validated by Luis 1-year follow-up: fixing attribution + reallocating from losers to winners delivered 44% revenue growth.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Attribution Reconciliation Diagnostic');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Customer Segment by Gross Margin (Not Just Volume)', 'framework', null,
  array['strategy', 'unit-economics', 'pricing', 'avatar', 'segmentation'],
  $content$When ticket sizes are similar across customer segments but margins differ, segment selection drives profit even at constant revenue. Luis example: DIY buyers and contractor buyers both averaged ~$873 ticket, but DIY pays for design + experience (50%+ margin) while contractors shop you against 5 other suppliers (15-20% margin). Same revenue, 2-3x profit difference per ticket. Diagnostic: (1) compare AOV across segments; (2) ask each segment who they shop you against; (3) measure margin per segment, not just revenue per segment; (4) optimize for the segment that lets you charge for value, not the one that lets you compete on price. The "bigger market" of price-sensitive buyers is often a profit trap — same revenue, dramatically less profit, harder to retain. Pair with the Bigger-Avatar Bet only AFTER you've maxed out the high-margin segment.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Customer Segment by Gross Margin (Not Just Volume)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Optimize for the Customer You Already Have the Most Of', 'framework', null,
  array['strategy', 'segmentation', 'avatar', 'path-of-least-resistance'],
  $content$When a business is already profitable with a particular segment, double down on THAT segment rather than chasing the "bigger" or "better" one. Luis was profitable on DIY + custom; trying to win contractors would have required new infrastructure, new sales motion, and lower margins per ticket. Instead: amplify what already works. Validated by 1-year follow-up — Luis grew custom orders from 30% to 50% of business and revenue rose 44%. Path of least resistance beats path of biggest TAM most of the time, especially for businesses under $10M. The customer you already serve well is your moat; chasing the segment you don't serve well is a distraction. Diagnostic: who buys most easily today, who gives you the best gross margin, who refers — that's the segment to amplify.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Optimize for the Customer You Already Have the Most Of');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Custom-Order Funnel Architecture (VSL → Calendar → SMS → Call)', 'framework', null,
  array['funnel', 'sales', 'closing', 'high-ticket'],
  $content$Full funnel architecture for high-value custom/configurator orders, validated by Luis 1-year follow-up (custom orders 30% → 50% of business). Sequence: (1) Custom-order button on every product page → custom order intake page; (2) ONE-step form with calendar widget combined (info + calendar slot in same submit); (3) Post-opt-in Video Sales Letter explaining price ranges + setting expectations; (4) Pre-call SMS sequence asking BANT (Budget Authority Need Timing) to filter non-decision-makers and lock buying-frame; (5) Sales call with credit card or financing close, $200 move-forward discount pre-framed before call. Eliminates the multi-step drop-off, pre-qualifies leads, pre-frames the buying decision, and lands the customer on the call ready to choose between payment methods (not whether to buy).$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Custom-Order Funnel Architecture (VSL → Calendar → SMS → Call)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'One-Step Form + Calendar (Eliminates Drop-Off)', 'framework', null,
  array['funnel', 'CRO', 'conversion', 'forms'],
  $content$Don't separate "fill out form" and "book a call" into two steps. Each additional step in a high-value funnel kills 30-50% of opt-ins. Collapse into one: a calendar widget that collects the qualifying info as embedded fields (Calendly with custom questions, HubSpot scheduler with form fields, or a custom Cal.com setup). Customer fills name/email/phone/budget AND picks a calendar slot in the same submit action. Eliminates the "submitted form, never booked the call" failure mode that's the #1 leak in most B2B/high-ticket funnels. Tradeoff: slightly longer single form vs two short forms — research consistently shows single-form-with-calendar outperforms.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'One-Step Form + Calendar (Eliminates Drop-Off)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'VSL Anatomy: Hook-Proof-Promise-Plan + Open-Loop', 'framework', null,
  array['sales', 'vsl', 'content', 'sequencing'],
  $content$5-7 minute pre-call Video Sales Letter structure that converts 50-60% of opt-ins to booked-and-shown calls. Anatomy: (1) HOOK — pattern-interrupt opener tied to the buyer's specific desire ("Have you ever looked at your railings and thought..."); (2) PROOF — credibility anchor (case studies, recent report, authority signal — "A recent report shows railings add 3-5x their cost in home value"); (3) PROMISE — what they'll learn in this video; (4) PLAN — visual roadmap of the 3-5 things you'll cover. Mid-section: deliver value (teach them how to pick the right product, 3-4 key decision points). End: open-loop to the call ("That's why we have the call — it's an important decision and I can shepherd you through it"). Skip if you already have a high-converting written equivalent — the structure is what matters, not the format.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'VSL Anatomy: Hook-Proof-Promise-Plan + Open-Loop');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Price-Anchor-as-Free Frame', 'framework', null,
  array['pricing', 'positioning', 'framing', 'objection-handling'],
  $content$For products that add value greater than their cost, frame as "essentially free." Railings example: "A recent report shows new railings add 3-5x their cost in home equity. So aesthetically, railings are basically free." Same logic applies to: business coaching ("the program pays for itself in the first month of margin lift"), software ("the time saved exceeds the subscription cost"), home improvement ("the resale value lift exceeds the renovation cost"). Mechanism: reframes the buying decision from "is this worth $X" to "would you take free money?" Pairs with concrete proof point (study, case data, recent report). NOT a discount tactic — the price doesn't change. The FRAME changes how the buyer evaluates the price.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Price-Anchor-as-Free Frame');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'BANT Pre-Call SMS Sequence', 'framework', null,
  array['sales', 'qualification', 'closing', 'sms'],
  $content$Pre-qualify high-ticket leads via SMS BEFORE the sales call using the classic BANT framework: Budget, Authority, Need, Timing. Three short SMS over the 24-48 hours before the call: (1) "Just confirming — who else needs to be on the call to make this decision? Spouse / business partner / etc?" (Authority); (2) "About what budget were you thinking? I want to make sure we don't waste your time on options outside your range." (Budget); (3) "When are you looking to have this installed/delivered/launched?" (Timing — Need is implicit if they booked the call). Reframe softly: "We're not a sales company, but I want to make sure no one's time gets wasted." Effects: (1) non-decision-makers self-disqualify; (2) buying-frame is set before the call starts; (3) rep arrives armed with budget + authority + timing in hand. Pair with Damaging Admissions Frontloaded for the call opener.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'BANT Pre-Call SMS Sequence');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Move-Forward Discount Pre-Framed Before Call', 'framework', null,
  array['sales', 'closing', 'pricing', 'urgency'],
  $content$Tell prospects BEFORE the sales call: "I offer a $200 (or 5-10%) discount for prospects who move forward during the call — saves us both administrative headache for follow-up scheduling." Pre-frames the call as a buying decision, not an information-gathering session. Two effects: (1) prospect arrives expecting to either buy or pass — eliminates "I need to think about it" as a soft exit because they've been told the deal is for today; (2) the small discount funds itself by reducing the number of calls per closed deal (1 call vs 3). Different from a desperate end-of-call discount — this is a structural call-design choice mentioned before the call, so it doesn't read as pressure. Pair with damaging admissions frontload so prospects who CAN'T move forward self-disqualify before the call.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Move-Forward Discount Pre-Framed Before Call');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Card-on-Hand A/B Payment Close', 'framework', null,
  array['sales', 'closing', 'payment-plan'],
  $content$At the moment of close on a sales call, don't ask "would you like to move forward?" — that's a binary yes/no. Instead, present two yeses: "Do you want to use a credit card or financing? Same to us, same to you — which would you prefer?" The A/B forces the buyer to choose between two purchase paths, both of which mean yes. Financing options (Klarna, Affirm, Shop Pay, Afterpay) unlock customers who couldn't afford the full ticket upfront — and the business gets paid in full immediately by the financing provider. Combine with prepared card-on-file flow (Shopify, Stripe Checkout) so the close is one click away when they say their answer. Don't make them dig out a credit card during the heat of the close — have a payment link ready to text or screen-share.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Card-on-Hand A/B Payment Close');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'The Customer Dream Layout (Show 4 Wild Ideas)', 'framework', null,
  array['sales', 'closing', 'visual', 'consultative-selling'],
  $content$On a sales call for custom/configurable products, don't lead with price or specs. Instead, let the buyer DREAM. Show 4 wild design examples: "If you have a modern house, this style. If you have a traditional, this. If you have a country home, this. If you have wild ideas, here's what someone did with us last month." Customer imagines THEIR house in each scenario, gets emotionally invested in one or two, then the sale narrows to delivery + price. Visualization beats specification by orders of magnitude for emotionally-driven purchases (home improvement, design services, custom products, vacations). Don't list features; show outcomes. The dream is the close; the spec is the receipt. Pair with image gallery, mood-board PDF, or shared screen during the call.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'The Customer Dream Layout (Show 4 Wild Ideas)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Sticky Cross-Page CTA Banner', 'framework', null,
  array['ecommerce', 'CRO', 'conversion', 'persistent-visual'],
  $content$Replace auto-rotating top hero banners (free shipping, new arrivals, etc.) with a STICKY top-bar banner that persists across every page of the site. For Luis: "CUSTOM DESIGNS AVAILABLE" sits at the top of every product page, not just the homepage. Two effects: (1) every product viewer sees the high-margin custom-order CTA, not just homepage visitors; (2) the persistence eliminates the "saw it once, forgot it" failure mode. Cost: minimal — one CSS/HTML change. Same pattern as the Calvin & Air Table-Tent framework but applied to e-commerce. Variants: sticky bottom-bar (better mobile), header-pinned banner (better desktop), or a small floating widget bottom-right. The principle: the high-leverage CTA must follow the visitor across the site, not live on one page.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Sticky Cross-Page CTA Banner');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Custom-Order Path on EVERY Product Page', 'framework', null,
  array['ecommerce', 'upsell', 'high-ticket', 'conversion'],
  $content$Don't bury the high-margin custom-order CTA on just best-seller pages. Add it to EVERY product page. Every product is a potential entry point into the higher-margin custom-order funnel. Cost: zero — one template-level addition. Mechanism: visitor on a low-margin standard product sees the "customize this" CTA, clicks through, lands in the high-margin custom flow. Luis went from custom-orders being 30% of revenue (only surfaced on best sellers) to 50% of revenue after surfacing on all products — validated by 1-year follow-up. Generalizes: any e-commerce or service site with a high-margin upsell variant should make that variant visible from every product/service page, not just the homepage or best-sellers.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Custom-Order Path on EVERY Product Page');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '2-Theme + 1-Rotating Email Nurture Cadence', 'framework', null,
  array['email', 'nurture', 'retention', 'marketing'],
  $content$Long-term email nurture structure for product/service categories with low repeat-purchase frequency (railings, kitchens, cars, home renovation, etc.). 2 emails per week to the full list. Theme rotation: (1) Before/After transformation (visual proof + emotional spark); (2) Cool feature or recent install (lifestyle-driven, aspirational); plus rotating Theme 3: FAQ (top 20 customer questions, one per email, rotate through the year). Don't force continuity / subscription — the play is staying top-of-mind for the NEXT expansion (their next renovation in 3 years, their next car in 5 years). Math: 10K list × 2 emails/week × 30%+ open rate (visually obsessed categories open higher) × multi-year horizon = compounding relationship that delivers the next purchase when timing hits.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '2-Theme + 1-Rotating Email Nurture Cadence');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Email Anatomy: Subject → Image → CTA → PS', 'framework', null,
  array['email', 'creative', 'copy', 'nurture'],
  $content$Email structure that maximizes opens, clicks, and engagement for visually-driven product categories. Anatomy: (1) SUBJECT — curiosity hook in 5-8 words ("Check out this rail transformation"); (2) IMMEDIATE-REWARD IMAGE at top of body — gives the recipient instant visual payoff (the before/after, the cool feature) so they don't have to scroll to feel rewarded; (3) SINGLE CTA LINK — one click, one place to go; never 5 buttons competing; (4) PS LINE at bottom — light joke, small discount, or fun fact that gives the email a personal-not-corporate feel. Open rates for visually-obsessed categories (home, fashion, food, design) routinely hit 30-50% with this structure vs 15-20% for standard text-heavy emails. The audience WANTS to open these — they're emotionally invested in the category. Lean in.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Email Anatomy: Subject → Image → CTA → PS');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Marketing Compounds Like a Snowball (Low-Frequency Categories)', 'framework', null,
  array['marketing', 'nurture', 'philosophy', 'retention'],
  $content$For low-frequency-purchase categories (railings, kitchens, cars, home renos, custom products), retention strategy is fundamentally different from subscription-style retention. You don't force continuity — instead, you stay top-of-mind for the NEXT expansion. Mechanism: consistent long-term nurture (2 emails/week, 1-2 social posts/day, occasional retargeting) compounds over multi-year horizons. When the customer's next renovation/upgrade/purchase comes up in 3-5 years, you're the first call. The snowball effect: each year you stay in front of them, the cumulative impressions grow. By year 5, you're a household-name brand in their mind, even if you're a $2M business. Doesn't require continuity products; requires consistency of presence.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Marketing Compounds Like a Snowball (Low-Frequency Categories)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Funnel-Build Order: System → Traffic → Script → Nurture', 'framework', null,
  array['strategy', 'funnel', 'sequencing', 'execution'],
  $content$When redesigning a sales process from scratch, build in this exact order: (1) System — get the funnel infrastructure working (form, VSL, SMS, call booking, payment flow). Don't drive traffic to a half-built system. (2) Traffic — drive real prospects through the system to stress-test it; small ad spend or organic posts first. (3) Script — refine the call script + objection responses based on first 10-20 actual sales calls. Iterate the script before scaling. (4) Nurture — only AFTER the conversion engine works, add long-term nurture for the non-converters. Common failure: bolting nurture onto a broken funnel. Nurture multiplies whatever conversion exists; if conversion is 0%, more nurture = 0%. Fix the funnel first; nurture is the amplifier, not the engine.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Funnel-Build Order: System → Traffic → Script → Nurture');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'One-Year Follow-Up Validation Pattern (Luis Case Study)', 'framework', null,
  array['case-study', 'validation', 'strategy', 'follow-up'],
  $content$Validated outcomes from the Luis / Optimum Works diagnosis 12 months later (March 2025 → March 2026): revenue grew 44% ($2.5M → $3.6M), profit grew 41% ($384K → $540K). Validated levers (in order of impact): (1) Optimizing for custom orders — went from 30% of revenue to 50% of revenue; (2) Fixing attribution — discovered ad campaigns that were breaking even, killed the losers, scaled the winners; (3) Raising prices — close rate held at 20% (3x previous) with triple the lead volume on custom orders; (4) Improving the custom-order page + sales process. NOT validated as needle-movers (consistent with predictions): the long-term email nurture started but didn't yet show measurable revenue impact in year 1 (it compounds in years 2-3). Pattern: the BIG levers are segment selection + attribution + pricing — not marketing volume. Most operators chase more leads when the gap is downstream of the funnel.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'One-Year Follow-Up Validation Pattern (Luis Case Study)');
