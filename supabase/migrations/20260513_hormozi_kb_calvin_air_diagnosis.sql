-- Hormozi KB additions — sourced from the Calvin & Air / Basil & Co
-- Thai Cuisine diagnosis ($3.5M, 19% net, 7-year run, 1 location peak,
-- 1% alcohol attach, opening location #2). Adds 18 framework chunks
-- covering menu psychology, micro-pricing, table-service operations,
-- training scenarios, loyalty design, peak-end bias, affiliate launches,
-- and the product-comes-first principle. Tags overlap with the Annie
-- batch where applicable; new tags include menu, restaurant, takeout,
-- pricing-micro, review-velocity, training-skit, loyalty, affiliate,
-- peak-end, anchor-pricing.
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Micro-Pricing Lift Math (.99 + Processing Fee)', 'framework', null,
  array['pricing', 'pricing-micro', 'unit-economics', 'menu'],
  $content$On high-volume low-margin businesses, single-character price changes generate disproportionate profit. A flat $16 entree shifted to $16.99 adds ~6% to topline revenue with zero observable effect on order velocity. On a 19% net-margin business, 6% revenue = ~30% profit increase. The same logic applies to any plate-style menu — restaurants, mechanic shops, salons, contractors with line-item invoices. Stack with a "+3% processing fee for credit cards" line printed on the menu (industry-standard, ignored by 95% of customers) for another ~15% profit increase. Combined: ~45-50% profit lift from two changes, both reversible, both cheap. Test on the menu reprint, not on existing customers. Caveat: do not use .99 pricing on true luxury brands ($29+ entrees, $500+ services) — there the higher anchor signals quality and 0-cent endings stay clean.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Micro-Pricing Lift Math (.99 + Processing Fee)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Menu Order by Gross Profit + High Anchor', 'framework', null,
  array['menu', 'pricing', 'anchor-pricing', 'ordering'],
  $content$Three rules for any structured menu (food, services with tier lists, e-commerce category pages): (1) Anchor high — place the most expensive item first in each section; the high anchor makes everything below it feel reasonable by comparison. Wine-list research validates this. (2) Order each section by gross-profit margin top to bottom — the first item read is the most likely to be chosen; ensure that "first item" is your most profitable, not just your favorite or your newest. Two items at $16 retail might have $1 vs $6 of cost; shift order flow to the $1-cost item. (3) Highlight the box that says "first time? do not miss this" with the most profitable signature dish — most diners want to be told what is good. Combining all three: a same-revenue menu can deliver 10-20% more profit just by reordering. Cheap to implement, no operational change required.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Menu Order by Gross Profit + High Anchor');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '"Pairs Well With" Passive Upsell Copy', 'framework', null,
  array['upsell', 'menu', 'sales', 'service-business'],
  $content$Under each entree on the menu, print "pairs well with [drink/side]." Two-sided friction reduction: (1) The customer sees the pairing while reading the menu, starts considering the add-on before the server arrives — passive priming. (2) The server has a built-in script — they can read or point to the line as the upsell prompt without remembering it on their own. Calvin & Air ran 1% alcohol attach rate vs the 5-15% industry standard; the printed pairing alone should lift to 6%+ without any other change. This is one of the eight customer-value levers (cross-sell). Same logic applies beyond restaurants: any quote-builder, configurator, or services menu can print "pairs well with" to drive multi-line orders without sales pressure.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '"Pairs Well With" Passive Upsell Copy');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Single-Item Rotating Special > 10 Specials', 'framework', null,
  array['offer', 'menu', 'paradox-of-choice'],
  $content$When showcasing specials/featured items, surface ONE at a time, not a list of ten. Reason: paradox of choice. Ten specials read as another menu (decision paralysis, default to "the usual"); one special with a single image + benefit copy + clear name reads as "the chef recommends this." Take rate on a single-item rotating special is materially higher than on a 10-item specials list. Refresh the single special weekly (or by season for slower-rotation businesses) so the surprise stays fresh. Apply to: restaurant specials boards, e-commerce homepage hero, SaaS upgrade pop-ups, service-business featured offer of the month. The constraint is the feature, not a limitation.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Single-Item Rotating Special > 10 Specials');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Table-Tent / Tabletop Prompt (Persistent Visual)', 'framework', null,
  array['operations', 'service-business', 'upsell', 'menu'],
  $content$Place a small upscale-looking card/tent on every table (or every transaction surface — counter card, screen overlay, sticky CTA) with the current rotating special. Two compounding benefits: (1) the customer sees it the whole time, even if the server forgets to mention it — eliminates the staff-memory failure mode; (2) the server can point to it during the order conversation, lowering the cognitive load of remembering specials. Design matters — a cheap neon flyer cheapens the brand; a clean elegant card with one photo + benefit copy + signature/tag feels intentional. Same pattern: floating sticky CTA on a webpage, end-of-cart prompt at checkout, post-purchase modal — anything persistent that survives the user-or-staff-forgets failure.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Table-Tent / Tabletop Prompt (Persistent Visual)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'First-Time Customer Signal + Peak-End Surprise', 'framework', null,
  array['retention', 'experience', 'first-time', 'peak-end'],
  $content$Identify first-timers at the entry point ("first time dining with us?" / form checkbox / order-history check). Mark them with a subtle staff-visible signal — colored napkin, specific drink coaster, internal flag — so the entire team knows. End of experience: surprise them with a free small item (free dessert for restaurants, free add-on for services, bonus mailpiece for e-com). Why this works: peak-end bias — humans remember experiences by their emotional peak + how they ended; the surprise gift at end gets remembered + retold. Pair with a comeback offer (a card with manager handwritten "free X next visit") to convert the goodwill into a repeat visit. Cost is tiny (the cheapest dessert), retention lift is meaningful, word-of-mouth amplification is the real prize.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'First-Time Customer Signal + Peak-End Surprise');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Manager Card Handwritten Comeback Offer', 'framework', null,
  array['retention', 'experience', 'rebook', 'first-time'],
  $content$For the comeback offer to a first-time customer or a delighted regular, use the manager''s actual business card with a handwritten "free [item] next visit" on the back — instead of a printed coupon. Same dollar cost, completely different psychological frame: a coupon is a discount-seeker tool; a personalized handwritten card from the manager is a gift. People keep gifts and bring them back; people lose coupons and feel cheap using them. Side effect — guests often photograph the card and share on social, multiplying reach for free. If the guest loses the card, instruct staff to honor a phone photo of it. Trade: 3 seconds of manager attention per first-timer vs a measurable repeat-visit lift.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Manager Card Handwritten Comeback Offer');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Immediate Free-for-Review at Point of Sale', 'framework', null,
  array['reviews', 'review-velocity', 'social-proof'],
  $content$The ask "leave us a review and your next visit will be free" almost never converts — the reward is too distant. Reframe to immediate: when the check arrives, the manager (or server) says "I can take one of these drinks off your bill right now if you leave us a review while you''re here." Immediate dollar-savings unlock the immediate review-while-still-seated. Per-table math: 5 people at the table, 5 reviews in exchange for $25 of comp''d drinks — asymmetric in your favor because reviews compound forever in search rankings. Alternative no-cost version: server-bonus framing — "your server Judy gets a $50 bonus for hitting 10 five-star reviews this month; could you take 30 seconds?" Uses reciprocity without comp''ing anything. Pick the framing that fits the venue.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Immediate Free-for-Review at Point of Sale');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Review-Count Is Its Own Credibility Signal', 'framework', null,
  array['reviews', 'social-proof', 'marketing'],
  $content$Customers evaluating a local business compare two signals: rating (4.7 vs 4.5) AND volume (1,300 vs 50). Volume often beats rating: a 4.7 with 13,000 reviews beats a 5.0 with 50 reviews every time. High review count reads as "iconic, tested at scale, real business" — low count with high rating reads as "small, possibly review-stuffed, unknown." Implication: review-velocity is a separate KPI from review-quality. A service business should aim for thousands of reviews, not just five-star averages, and design the operational pipeline (immediate-free-for-review at every point of sale, manager-card asks, per-table multi-review math) to drive volume over the year. A 100K-customer-year business with 1,300 reviews is leaving an order-of-magnitude on the table.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Review-Count Is Its Own Credibility Signal');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'AOV Breakpoint Free Gift', 'framework', null,
  array['upsell', 'aov', 'pricing', 'unit-economics'],
  $content$To lift average order value, set a breakpoint just above current AOV with a free gift unlocked above it. Calvin & Air''s weekday AOV is $60, weekend $80 — set "free sticky rice over $80" weekday menu / "free over $100" weekend menu. The gift should be high-perceived-value + low-actual-cost (free dessert costs $1, reads as $8). Especially powerful on takeout / online orders where the cart total is visible and the customer can self-adjust upward. Different threshold per day-part (weekday/weekend) or per channel (dine-in/takeout/delivery). Apply beyond restaurants — e-com free shipping over $X, services bundle bonus, SaaS plan-tier free month if upgrading by Y date. The mechanic: a small nudge above an inflection point recovers a measurable % of "just-below" carts.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'AOV Breakpoint Free Gift');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Running-Start Loyalty + 3-Benefit Frame', 'framework', null,
  array['retention', 'loyalty', 'membership'],
  $content$If you do a punch-card / point-based loyalty program, give 2-3 pre-filled punches at signup (endowed-progress effect — studies show ~2-3x completion vs same-remaining-punches on a shorter card). For benefit design: most loyalty programs over-index on discounts, which train customers to wait for sales. Replace with three concrete benefits — (1) birthday freebie (one-shot, no recurring discount); (2) one free thing on signup (e.g. first drink free, first appointment add-on free); (3) line-skip / priority access during peak times. Number 3 is the strongest because it''s a status benefit, not a discount — customers feel they''re getting VIP treatment, not just saving money. Avoid pure-discount loyalty programs unless the entire industry expects them (cafes, gas).$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Running-Start Loyalty + 3-Benefit Frame');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Skit-Based Staff Training (When-Then Scenarios)', 'framework', null,
  array['training', 'training-skit', 'staff', 'service-business'],
  $content$Train staff on behavior rules, not general guidelines. Format every rule as "when [trigger], then [behavior]" — a skit. For table service: (S1) when a customer enters, ask if first-time; if yes, mark the table; (S2) when seated, pitch the single rotating drink special; (S3) when entree is ordered, mention the "pairs well with" line; (S4) when entree is confirmed, offer the side add-on with directive phrasing; (S5) when check is requested, present the comeback card (first-timer) or the review-for-comp ask (regular). Five skits, 30 minutes per day of paired role-play during natural gaps (open prep, pre-shift), 20+ reps each. One person plays customer, one plays staff; trainer says "say it like this" on mistakes. Behavior rules in scripted skits land at 80%+ adherence vs ~15% adherence from script-on-paper or verbal-once briefings.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Skit-Based Staff Training (When-Then Scenarios)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Closing-Question Phrasing Engineers the Yes', 'framework', null,
  array['sales', 'closing', 'upsell', 'training'],
  $content$Tiny phrasing shifts move take rate measurably. "Would you like a drink?" leaves the answer open. "Do you want to go ahead and take one of those?" is directive — the prefix "go ahead" implies the decision is already moving toward yes and just needs confirmation. Add a normalizing phrase: "A lot of people do" / "Most of our regulars get the X" / "What most first-timers love is..." — three formats that legitimize the recommendation without pressuring. Senior salespeople do this unconsciously; junior staff can be trained explicitly in 5 minutes. Combined with the "pairs well with" menu copy, the directive phrasing converts a passive prompt into an active recommendation that feels like guidance rather than upselling.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Closing-Question Phrasing Engineers the Yes');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Server Leaderboard + Tip-Dollar Translation', 'framework', null,
  array['training', 'staff', 'incentives', 'service-business'],
  $content$To get staff to actually run the upsell scripts, do two things. (1) Public leaderboard in back-of-house: per-server attach rate on specials/alcohol/desserts (or whatever metric you''re trying to move). Top performer wins something concrete — schedule pick, $50-100 bonus, parking spot, name on the board. Public visibility activates competition without management micro-managing. (2) Translate the abstract sale into the worker''s actual outcome. Don''t say "ask every table about the drink special" — say "every alcohol drink sold puts ~$1 in your tip on a 5-person table; that''s $3-5 per upsell-yes." Concrete numbers tied to their behavior multiply adherence. Combine with the skit training cadence — leaderboard creates the pull, skits create the skill.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Server Leaderboard + Tip-Dollar Translation');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Affiliate Pre-Opening / VIP Launch Night', 'framework', null,
  array['launch', 'affiliates', 'partnerships', 'new-location'],
  $content$Before a new location''s grand opening, host an invitation-only "VIP launch night" for local affiliates — micro-influencers, neighborhood business owners, community-org leaders. Format: free or deep-discounted experience in exchange for content (Instagram stories, posts, reviews) + word-of-mouth. Difference from a standard customer: an affiliate is a lead-getter — their normal business is exposing your brand to dozens or hundreds of additional people. Trading $50-200 of free product for 100-1000 impressions to a targeted local audience is asymmetric. Use the night to (a) seed reviews on day-one (no empty Google profile), (b) capture content for paid ads, (c) test operations under real load before the public open. Build a target list 30-60 days before launch.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Affiliate Pre-Opening / VIP Launch Night');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Product Beats Marketing on a Long Time Horizon', 'framework', null,
  array['strategy', 'product', 'philosophy'],
  $content$Marketing accelerates a good product''s timeline and accelerates a bad product''s death. With zero marketing, a great product where 1 person tells 5 who tell 5 hits capacity in a few growth doublings. With great marketing, a bad product gets people in the door — they leave, never return, tell their friends not to come, and now the marketer has to outpace the negative word-of-mouth, becoming permanently a marketing business instead of a product business. Implication for diagnosis: if a business is struggling AND the product is mid, fixing marketing rearranges deck chairs. Fix product first, then marketing accelerates compounding. Conversely, if the product is strong (good reviews unsolicited, organic word-of-mouth), then marketing is the right next lever — it just adds speed to an already-good vehicle.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Product Beats Marketing on a Long Time Horizon');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'No Discounts, Free Items Only (Brand Integrity)', 'framework', null,
  array['offer', 'pricing', 'branding'],
  $content$Avoid percentage-off promotions (20% off, 30% off) for ongoing customer acquisition or loyalty. Reason: discount-seekers anchor on the discounted price, train themselves to wait for the next sale, and erode pricing power on every future transaction. Replace with full-price-or-free: either the item costs what it costs, or it''s a free bonus given as a gift. A free side-item costs a fraction of a 20% percentage discount but reads as a generous gift, not a sale. Holiday/seasonal promos can run free-item-with-purchase (Mother''s Day free dessert with entree) instead of "20% off everything." Reserve discounts only for legitimate prepayment incentives (annual prepay vs monthly) or genuine time-limited sales-call closing incentives — never as a perpetual customer-acquisition lever.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'No Discounts, Free Items Only (Brand Integrity)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Culture = 2x Strategy Success (McKinsey)', 'framework', null,
  array['org-design', 'culture', 'strategy', 'execution'],
  $content$McKinsey study reference: across companies, ~1 in 3 strategies actually succeed. But businesses with strong culture see ~2 in 3 strategies succeed — double the success rate. Culture = the rewards and punishments inside a business that determine actual behavior (not the values poster on the wall). Implication for any diagnosis: handing over a list of tactics without an execution mechanism (skit training cadence, leaderboard, daily standup, reward structure) means tactics sit unimplemented. The 30% strategy success rate becomes 0% if no one runs the strategy. When recommending changes, always pair each tactic with a behavior-rule + reward/punishment loop. Otherwise the diagnosis is entertainment, not transformation.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Culture = 2x Strategy Success (McKinsey)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Restaurant + Service Industry Benchmarks', 'framework', null,
  array['benchmark', 'restaurant', 'service-business', 'unit-economics'],
  $content$Diagnostic anchors for restaurant + brick-and-mortar service businesses. (1) Restaurants have the highest failure rate of all business categories — typical net margin is 3-7%, so 15-20% is exceptional and 25%+ is industry-leading. (2) Alcohol attach rate at a casual-to-upscale restaurant: 5-15%, sometimes 20%; <2% is broken (huge unrealized profit). (3) Average ticket: dine-in vs takeout typically differs 20-40% (dine-in higher due to multi-person tables + sides + drinks). (4) Word-of-mouth share for restaurants: 30-50% is normal; >50% suggests strong product, <20% suggests reputation problem. (5) Review-to-customer ratio: 1-3% is normal at scale; <1% means review-ask is broken; >5% means strong active funnel. Use these to anchor whether a "problem" is actually a problem or just baseline.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Restaurant + Service Industry Benchmarks');
