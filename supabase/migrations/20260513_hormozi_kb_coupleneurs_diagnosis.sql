-- Hormozi KB additions — sourced from the Kyle & Ariel / Coupleneurs
-- diagnosis ($480K rev, $206K profit, 43% margin, 42 active couples,
-- two products: $5K Rise Together + $25K Accelerator, supply-constrained,
-- Slack-as-unlimited-access killing operator time, 5-day challenge funnel
-- with 9% day-1 show-up rate, cash-flow problem). Adds 19 framework chunks
-- covering offer reconstruction, supply-constraint solutions, coaching-
-- business scaling philosophy, event architecture, cash-flow mechanics,
-- self-sustaining ad loops, and the discipline of asking "what problem
-- are we solving?" before building anything new.
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '"What Problem Are We Solving?" Pre-Solution Diagnostic', 'framework', null,
  array['diagnosis', 'strategy', 'prioritization'],
  $content$Hormozi's #1 question when a team vomits information at him: "What problem are we solving?" Forces purpose-clarity before any solution-building. Most operators jump to new products, new tactics, new funnels — without naming the underlying problem they're trying to fix. Often the existing product could solve it differently. Kyle & Ariel built an entire second product (the $5K mentorship) instead of fixing the supply-constraint on their $25K accelerator. The discipline: state the problem in one sentence, then ask "can we solve this with what we already have?" before building anything new. Builds a habit of subtractive thinking — most growth comes from removing constraints, not adding products.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '"What Problem Are We Solving?" Pre-Solution Diagnostic');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Trim-and-Stack Offer Reconstruction (Two-Phase)', 'framework', 'https://www.acquisition.com/books/offers',
  array['offer', 'grand-slam', 'pricing', 'trim-stack'],
  $content$From $100M Offers, chapter "Creating Your Grand Slam Offer Part 2: The Trim and Stack." Two phases: (1) Trim — enumerate every deliverable, bonus, asset, and component currently in the offer. Don't filter yet. (2) Stack — cut what doesn't drive purchases or retention, combine what does into a leaner higher-perceived-value package. Default failure mode: founders add as much as possible to "increase value" and end up with bloated offers full of unused features (consumption discrepancy). Correct: each remaining bonus should INDIVIDUALLY be worth the price of the whole offer. Three strong bonuses beats twenty weak ones. Simplicity makes for simpler marketing, simpler selling, simpler delivery — complexity always rears its head.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Trim-and-Stack Offer Reconstruction (Two-Phase)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Four Paths to Release a Supply Constraint', 'framework', null,
  array['scaling-stage', 'capacity', 'delivery', 'strategy'],
  $content$When a service business is supply-constrained (more demand than delivery capacity), four solutions exist: (1) Raise price 2-4x — fewer customers, higher per-customer revenue, same topline but lower operational load. Works only if pricing-power headroom exists. (2) Change delivery ratio — 1:1 → 1:4 → 1:6 → 1:many. Preserves operator concentration while multiplying capacity. Easier to change cadence (quarterly → monthly) than ratio at first. (3) Productize — automate or template the delivery so it's not founder-dependent. Shifts the business to marketing/sales-heavy. (4) Hire delegate coaches — build a recruiting/training/culture business; highest risk for X-factor businesses because diluted delivery often kills the brand. Decision tree: small team + cash-constrained + brand built on founder = path (2) almost always wins.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Four Paths to Release a Supply Constraint');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Gatorade Shot-Glass: Concentrated Founder > Diluted Coaches', 'framework', null,
  array['scaling', 'coaching', 'service-business', 'philosophy'],
  $content$Analogy for coaching/service businesses considering hiring delegate coaches. Imagine you have a full bottle of "founder X-factor" Gatorade. Scenario A: pour into shot glasses (small concentrated servings across many clients). Scenario B: pour into full-size glasses, then top up with water from a junior coach (large volume per client, but heavily diluted). Most clients prefer A — a small dose of the real thing — over B — a large dose of mostly water. Coaching businesses cap out around $30M because at scale, diluted delivery kills the brand that founder built. Build the firm of partners only when you genuinely want a recruiting/training/culture business AND you'll pay enough to attract operators who are actually as good as the founder. Otherwise: stay concentrated.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Gatorade Shot-Glass: Concentrated Founder > Diluted Coaches');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Key-Man Risk: Solve at Scale, Not Pre-Emptively', 'framework', null,
  array['scaling', 'org-design', 'risk', 'philosophy'],
  $content$Most founder-led service businesses prematurely worry about key-man risk and try to remove the founder from delivery before the business can afford the dilution. Hormozi's heuristic: "Get to $4M/yr first, then deal with key-man risk." Pre-emptively diluting the X-factor to "de-risk" the founder often kills the brand growth that made the business work. The right time to solve key-man risk is AFTER product-market fit + scaled revenue, not before. Practical implication: when a founder asks "should we hire coaches now?", the answer is usually NO if revenue is under $3M AND the brand is built around the founder. Solve the constraint with ratio/cadence/productize first; build the team only after the cash + brand can absorb the dilution.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Key-Man Risk: Solve at Scale, Not Pre-Emptively');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Single-Day Event > Multi-Day Challenge for Conversion', 'framework', null,
  array['sales', 'event', 'funnel', 'conversion'],
  $content$Multi-day challenges (5-day virtual events at 60 min/day) average 9% day-1 show-up, dropping to 4-5% by day 2 — compounding attrition. A single 4-hour event delivers the same information density with materially higher conversion because: (1) participants stay in flow state, no transitions; (2) information weaves naturally instead of requiring re-engagement each day; (3) 2x as many people make it to the pitch since there's only one show-up moment; (4) the format frame can match the asset (e.g. "date night" = permission for a 4-hour evening commitment vs "training" = permission for 60 min). Single 4-hour event > 5 × 1-hour days when the audience can be reframed around the time-block. Test before swapping production effort.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Single-Day Event > Multi-Day Challenge for Conversion');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Frame Sells the Format ("Marriage Insurance" / "Getaway")', 'framework', null,
  array['offer', 'positioning', 'framing', 'pricing'],
  $content$The same product can read as a chore or a benefit depending on the frame. Kyle & Ariel's twice-a-year in-person event reads as "another conference to attend" when called a conference — and reads as "marriage insurance: two guaranteed amazing moments per year that will define your year in retrospect" when called a getaway. Same delivery, same cost, completely different perceived value. The frame is the marketing. Pick the strongest emotional frame that legitimizes the time/money commitment ("date night" for a 4-hour event, "investment" for a $25K coaching program, "savings plan" for a prepay layaway). Test frames by saying the offer out loud — if it sounds like work to attend, change the frame, not the product.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Frame Sells the Format ("Marriage Insurance" / "Getaway")');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Layaway Downsell + First-Quarter Cash-Up-Front', 'framework', null,
  array['pricing', 'cashflow', 'payment-plan', 'offer'],
  $content$For cash-constrained service businesses, restructure payment plans to pull cash forward. Main offer: $25K paid in full or $30K over 12 months at $2,500/mo. Downsell: layaway. First payment = first quarter's worth ($9K on the $25K plan), then start regular monthly payments immediately. Onboarding (the expensive deep-dive) doesn't start until first $9K lands. Why this works: (1) accelerates cash receipt without changing total revenue; (2) the $9K-or-three-payments fork lets price-sensitive buyers self-select into the slower plan; (3) the fast-action bonus (immediate event access + deep dive) creates urgency without discounting. Stack with "next event in 2-4 months" framing — prepay or you miss the experience cycle.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Layaway Downsell + First-Quarter Cash-Up-Front');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Customer Rebate-for-Video Loop', 'framework', null,
  array['marketing', 'social-proof', 'creative', 'self-sustaining'],
  $content$Raise the headline price by $2,500 (e.g. $25K → $27.5K). On signup, customer is told: "Make a 60-second video of your experience during onboarding and we'll rebate $2,500 back to you." Net price unchanged. What the business gets: a steady pipeline of authentic customer-experience video creative perfectly matched to the avatar of future buyers. The customer feels rewarded (visible $2,500 incentive), the business funds its own ad creative loop, and the testimonials are real because they're delivered after actual onboarding. Rebate timing matters — pay after the video lands, not before. Best for high-ticket services where $2,500 is small relative to deal size. Variant: lower rebate ($500-$1,000) for lower-ticket products.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Customer Rebate-for-Video Loop');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Ad Fusion Reactor (Self-Sustaining Marketing Loop)', 'framework', null,
  array['marketing', 'creative', 'self-sustaining', 'philosophy'],
  $content$Meta-framework for building a marketing engine that runs on customer success rather than founder effort. Sequence: (1) founder runs one big initial marketing push to start the engine; (2) customers come in and have great experience; (3) experience gets documented (video testimonials, photos, case studies); (4) documented experiences become ads; (5) those ads bring the next customer; loop closes. The only input required is initial activation energy + a documentation system. After that, the business produces its own ad creative through normal operations. Failure mode: founders manually create new ad creative every campaign forever, which is unsustainable. Build the documentation pipeline as part of onboarding (rebate-for-video loop, day-30 check-in video, event recording rights) so creative compounds passively.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Ad Fusion Reactor (Self-Sustaining Marketing Loop)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Video Ad Volatility + Camera-Roll Static Strategy', 'framework', null,
  array['marketing', 'creative', 'paid-ads'],
  $content$Video ads have HIGHER volatility than static images — the best ads tend to be video, but the WORST ads also tend to be video. Most operators making video without strong production muscle land in the worst-ad bucket. Static images often outperform mediocre video because viewer imagination fills in compelling context that bad video makes painfully literal. For cash-constrained advertisers: skip custom video production. Open the operator's phone camera roll, find 100+ existing images of the team/product/customers/events, and run all of them as static ads. Volume + variety beats production polish. The algorithm sorts winners. After identifying winning statics, only THEN invest in custom video versions of the proven angles.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Video Ad Volatility + Camera-Roll Static Strategy');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Best Copy Stays Constant, Creative Rotates', 'framework', null,
  array['marketing', 'copy', 'creative'],
  $content$Once ad copy is right, do not change it — change only the creative (visual, hook, format). School's ad team spent tens of millions in 2024 and never changed the headline copy once. Why: copy IS the message; creative is the medium. Most operators rotate copy every campaign and wonder why nothing scales — they're A/B testing the message instead of testing how to deliver a winning message to new audiences. Test copy hard until you find a winner, then lock it. After lock, your testing budget goes entirely toward fresh creative (new images, new hooks, new formats) carrying the same proven message. Implication: invest 90% of copy effort up front, then 90% of ongoing effort on creative iteration.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Best Copy Stays Constant, Creative Rotates');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'CPA at the Back, Not CPC at the Front', 'framework', null,
  array['marketing', 'paid-ads', 'attribution', 'metrics'],
  $content$The only marketing metric that matters is Cost Per Acquired Customer (CPA) at the back of the funnel — not Cost Per Click, Cost Per Lead, or any in-funnel proxy. Kyle & Ariel discovered counter-intuitively that lead-form ads (5.25% show-up rate, low quality on paper) delivered LOWER CPA than funnel-page ads (higher quality leads but more expensive). The lesson: ignore intermediate funnel metrics if back-end CPA tells you the campaign is profitable. A $1,500 CPA on a $2,500 product is fine; a $50 lead with a 5% close rate at $2,500 LTV is also fine. Track all the way through. Most agencies optimize CPC or CPL — that's the wrong unit. Make decisions on CPA, not on intermediate ratios.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'CPA at the Back, Not CPC at the Front');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Event Architecture + Tag-Team Personalization', 'framework', null,
  array['event', 'experience', 'operations', 'sales'],
  $content$Two-day event anatomy that maximizes both value and conversion. Day 1: intro (5-10 min — most important moment of the event), meeting 1, meeting 2, lunch, meeting 3, meeting 4, main pitch (15-30 min, NOT 60 min), dinner reserved for buyers only. Day 2: soft re-pitch (15-30 min framed as "my team flagged these objections from yesterday"), meetings 1-2, lunch, soft pitch again, meetings 3-4, wrap. Personalization mechanic: break attendee roster into staff rosters (A/B/C/D) with lanyard colors. Each staff member knows 2 facts about each assigned attendee and greets them by name at every break. Result: attendees feel seen at scale — "damn, these people are on top of it." Operations as experience.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Event Architecture + Tag-Team Personalization');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Free-Flights-for-Immediate-Renewal Loyalty Trade', 'framework', null,
  array['retention', 'renewal', 'event', 'loyalty'],
  $content$Renewal sales should happen at in-person events — highest close rate in the customer lifecycle. Mechanism: at the event, offer immediate renewers first-class flights to all three of next year's events. Cost to business: ~$6K (three round-trip first-class). Captures: a 5-figure annual renewal. The first-class frame works because (a) the experience starts when the client leaves home, not when they arrive; (b) it's a tangible benefit (specific dollar value) that converts cheap-feeling discounts into rich-feeling gifts; (c) it locks them into all three event attendances next year, deepening LTV. Alternative cash-action bonus: knock $5K off renewal price for renewals signed at the event. Pick whichever converts better in your audience — almost always the flights win for events.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Free-Flights-for-Immediate-Renewal Loyalty Trade');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Lifeline Frame for High-Touch Escalation', 'framework', null,
  array['retention', 'delivery', 'service-business', 'support'],
  $content$When clients demand unlimited access (Slack, text-anytime, 24/7 support) but the operator can't sustainably deliver it, replace unlimited with a discrete count. Reference: Who Wants To Be A Millionaire's lifelines. "You get 2 911-calls per year for genuine emergencies — anything else goes through scheduled coaching." Behavioral economics result: people hoard the lifelines and almost never use them. The safety-net feeling is preserved (clients feel covered for the unknown) while operator time is freed (vast majority of historical Slack noise was non-emergency questions). Pair with a community channel for non-emergency questions so the public benefit of answered questions compounds across clients. Cap-with-safety-valve beats either unlimited-access OR no-access.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Lifeline Frame for High-Touch Escalation');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '"I''m Not Married to Your Wife" Frame (Preempt Dependency)', 'framework', null,
  array['delivery', 'coaching', 'service-business', 'framing'],
  $content$Pre-empt client dependency on the operator by framing the service as judgment-building, not decision-outsourcing. Sample script: "If I made every decision for you, you would never learn — you would just outsource judgment to me. We are here for the big decisions, not the day-to-day. The handful of decisions that create the life you have are the ones we work on together — everything else, you should be doing without me." Reframes "less access" as "more growth for you" instead of "less value for me." Especially powerful for coaching, consulting, fractional-CFO, fractional-CMO — any service where the client could come to depend on the operator for trivial decisions. The 5% rule applies: clients realistically dedicate 5% of their time to the work; the goal is to crush that 5% for 80% benefit.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '"I''m Not Married to Your Wife" Frame (Preempt Dependency)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Reasons-to-Buy vs Reasons-to-Stay Distinction', 'framework', null,
  array['offer', 'retention', 'churn', 'marketing'],
  $content$The bonus that closes a sale is often NOT the bonus that drives retention. Planet Fitness pizza-night example: people imagine they'll get free pizza and join — but they almost never come for the pizza because they feel guilty about not working out. The pizza closed the sale; it didn't drive retention. Same with unlimited Slack access for coaching businesses: clients buy because it sounds great ("them in my back pocket") but the actual usage doesn't drive renewal — it just drains the operator. Build the offer with TWO bonus categories in mind: (a) close-bonuses that get prospects to say yes (often emotional, status, safety-net feeling); (b) retention-bonuses that drive renewal (visible wins, community belonging, identity reinforcement). Design each separately. Don't assume the bonus that sells is the bonus that keeps.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Reasons-to-Buy vs Reasons-to-Stay Distinction');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Invisible Belief-Chains Diagnostic', 'framework', null,
  array['diagnosis', 'strategy', 'philosophy', 'mindset'],
  $content$Hormozi quote (his preferred tombstone line): "We question all of our beliefs except for the ones we really believe in, and those we never think to question." When a business is stuck, the bottleneck is usually an unquestioned belief: "we must serve 1:1," "people won't pay $X," "we can't run this format," "X day of the week doesn't work for our audience." These beliefs feel like facts because nobody has tested them. Diagnostic move: when stuck, write down the 3 strongest "obvious" beliefs about the business — then deliberately ask "what if this is wrong?" for each. Kyle & Ariel's belief was "couples problems are too sensitive for group format" — Hormozi's reframe: shame lives in darkness; group format normalizes the very problems clients are ashamed of having alone. Belief audit unlocks paths that look impossible from inside the belief.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Invisible Belief-Chains Diagnostic');
