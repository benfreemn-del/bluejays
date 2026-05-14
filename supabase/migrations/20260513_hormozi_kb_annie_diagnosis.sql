-- Hormozi KB additions — sourced from the Annie / Amy Lash diagnosis
-- ($2.3M, 7 eyelash locations, partnership pain, demand-constrained).
-- Adds framework chunks covering scaling stages, prioritization
-- (ICE), constraint diagnosis, BAM-FAM rebooking, partnership unwind
-- mechanics, default-close upsell framing, front-end-promo economics,
-- service-business arbitrage, career-path retention, lead-followup
-- speed, surge pricing, profit-share vs equity, foot-in-door upsells,
-- bonus-stack-not-discount, owner-pay-market-rate, role-play training,
-- prepay lock-in, marketing-spend benchmark, reception funnel.
-- Picked up by hormozi-agent.ts tag selector via expanded topic_tags.
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '10-Stage Scaling Roadmap', 'framework', 'https://acquisition.com/roadmap',
  array['scaling-stage', 'strategy', 'prioritization'],
  $content$Hormozi + Leila spent ~200 hours mapping every company they have owned, invested in, and scaled. They found 10 distinct stages, each with its own constraints and graduation requirements. A $2M+ business with multiple locations is typically Stage 6 (Optimize). Stage 6 constraints: ad assembly process (must run more ads at higher volume), product-improvement process for both core + back-end product, sales training systems + individual coaching + team cadence to maximize upsells, second layer of management trained well enough to scale. Diagnostic flow: name the stage, then name the 2-3 constraints specific to that stage, then propose the graduation action. Often the visible problem (e.g. partnership friction) is downstream of skipping a stage (e.g. opening locations before nailing the manager-training system).$content$
where not exists (select 1 from hormozi_kb_chunks where title = '10-Stage Scaling Roadmap');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'ICE Framework (Impact, Confidence, Ease)', 'framework', null,
  array['prioritization', 'strategy', 'decision-making'],
  $content$ICE = Impact × Confidence × Ease. Used to prioritize fixes when multiple are possible. Impact = how big the outcome shift is. Confidence = how likely it is to actually work. Ease = how fast/cheap to execute. Hormozi splits Ease into two — speed and effort — making it ICE+ with 4 variables, mirroring the Value Equation (dream outcome / perceived likelihood / time delay / effort and sacrifice). Strategy = prioritization of resources. You can do many things; the discipline is allocating resources to the FEWEST things with the HIGHEST expected return. Apply by listing every candidate fix, scoring 1-10 on each axis, multiplying. Fix the top item first. Caveat: partnership/org-design items usually score high Impact + low Ease — still tackle them first because they unblock everything downstream.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'ICE Framework (Impact, Confidence, Ease)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Demand-vs-Supply Constraint Diagnostic', 'framework', null,
  array['leads', 'delivery', 'diagnosis', 'constraint'],
  $content$Opening diagnostic question: "Would you say you have more of a limitation on doing the work or on getting customers?" Forces the prospect to name whether they are demand-constrained (can serve more, need leads) or supply-constrained (can not serve what they already have, need capacity). Most service businesses self-report demand-constrained even when they are not — they assume more leads = more revenue, but if their team can not deliver well, more leads bounces. Follow-up probe: "Why the rush?" — when expansion / hiring / partnership decisions were made before infrastructure existed, the root cause is usually rush, not strategy. Demand-constrained businesses fix with Core Four lead-gen + ad spend. Supply-constrained businesses fix with delivery systems, manager training, hiring runway, and unit economics that include backfilling owner labor at market rate.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Demand-vs-Supply Constraint Diagnostic');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'BAM-FAM (Book A Meeting From A Meeting)', 'framework', null,
  array['retention', 'rebook', 'upsell', 'sales', 'churn'],
  $content$BAM-FAM = Book A Meeting From A Meeting. Sourced from Sharran Srivatsaa. Whenever a customer will need to return, book the next appointment BEFORE they leave the current one. Eliminates the admin burden of rescheduling later, removes the chance they forget, and converts a passive retention loop into an active one. Two versions: (1) book at end of current appointment (standard); (2) book BEFORE the service starts ("you have 60 minutes here, let us just get one thing done — your next visit"). Version 2 closes higher because customers are not yet trying to leave. Treat the rebook conversation as a SALES conversation, not an admin task — most businesses miss this. Sample close: "your lashes will be done in 2-3 weeks; I am getting booked up — let us put that on the calendar now." If they hesitate: "I have your card on file, just need to pick a time."$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'BAM-FAM (Book A Meeting From A Meeting)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Partnership Unwind: Three Paths', 'framework', null,
  array['partnership', 'org-design', 'equity', 'exits'],
  $content$When a partnership stops working (drifting goals, unequal effort, friend-not-coworker dynamics), there are three structurally clean unwinds. Path A — Profit Share / Salary Reset: working partner pays themselves market rate as a manager BEFORE profit split; non-working partners absorb proportional reduction. Preserves the partnership but recalibrates compensation to actual effort. Path B — Shotgun Offer: "I will buy you out at X but I will also accept X." Forces price-and-terms symmetry; whoever wants out more loses the asset. Cash-heavy and sometimes ugly. Path C — Equity Swap: when partners co-own multiple locations/assets, trade equity in-kind. "Take this one outright, I take that one." Clean break, no cash needed, no taxes on the swap, friendship preserved because both sides walk with an asset. For multi-location service businesses, Path C is usually best. Lead with Path A, fall back to C. Skip B unless A and C both fail.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Partnership Unwind: Three Paths');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Default Close (Opt-Out vs Opt-In)', 'framework', null,
  array['sales', 'closing', 'upsell', 'framing'],
  $content$Organ-donor study reference (from "50 Scientific Ways to Get to Yes"): one country had 80%+ opt-in to organ donation while peers averaged ~10%. The single difference — the high-conversion country had people opt OUT, not opt IN. Apply by framing the upsell as something the customer has already implicitly opted into. Example for memberships: instead of "do you want our membership?" say "you have been here six times in the last six months — you should have been getting the membership benefits this whole time; let us just formalize you getting what you already qualify for." Default closes work because they make saying NO require effort and identity-shift, while saying YES is the path of least resistance. Common 20-40% upsell close rates jump to 70-90% when the question is reframed from "do you want to start" to "let us just confirm you in the thing you already are."$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Default Close (Opt-Out vs Opt-In)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Front-End Promo Economics', 'framework', null,
  array['offer', 'pricing', 'upsell', 'unit-economics'],
  $content$The intro promo (e.g. $99 first-time lash set, or a $99 site audit) is a LEAD MAGNET, not a profit center. Customers walking into a $99 promo are pre-closed — close rate at the door is 95-100%, but those numbers are vanity. The real economics live in the upsell: how many of those promo customers convert to the $170-$300 service, the membership, or the higher tier. If the front-end barely breaks even after labor + materials + ads, the business profits ONLY through upsells. Diagnostic: track promo-to-upsell take-rate, not promo close-rate. If take-rate is below 50%, the upsell sequence is broken — usually missing a clear default-close, a bonus-stack worth the price, or a script the team is not running. Same applies to free audits / quizzes / consultations as front-ends.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Front-End Promo Economics');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Service Business Arbitrage', 'framework', null,
  array['service-business', 'delivery', 'staffing', 'unit-economics'],
  $content$Fundamental economic engine of every service business: hire someone with low skill, train them on your system fast, charge the market rate that the now-trained skill commands. The arbitrage is the spread between what you pay (entry-level) and what their post-training skill commands in the marketplace. If you can not train fast and well, you can not scale beyond your own labor — you are stuck. Implications: (1) your training system is the real product; (2) every hour spent on training is multiplied by years of output from that worker; (3) the locations or pods that fail are usually failing at training, not at sales or marketing; (4) when calculating per-location unit economics, you MUST factor in the cost of replacing yourself in the operator role — otherwise margins look artificially high and you can not actually leave.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Service Business Arbitrage');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Career Path with Skill Unlocks', 'framework', null,
  array['staff', 'retention', 'staffing', 'service-business'],
  $content$Service-business staff churn drops when there is a visible career ladder. Pattern: 6 title bumps over 2 years (junior tech → tech → senior tech → junior artist → artist → senior artist), each separated by 3-4 months, each tied to a pay bump AND a new skill unlock the worker can charge more for. Why 3-4 months not 6: closer milestones keep workers motivated; 6 months is too far away. Title + pay is psychological; skill unlock is economic — you make more from them because they can now do a higher-priced service. Combined effect: workers stay, train better, and the locations they staff retain customers longer. The owner only needs to write the training material once; it scales across every location and every new hire forever.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Career Path with Skill Unlocks');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Lead Follow-Up Within 60 Seconds = 2-3x Lift', 'framework', null,
  array['leads', 'operations', 'speed-to-lead'],
  $content$For most service businesses, the single highest-leverage operational hire is one person whose ONLY job is to call inbound leads within 60 seconds of submission. Annie diagnosis ranked this #0 — higher impact than pricing, membership, or partnership fixes. Why it works: response speed correlates inversely with conversion rate; a 60-second call beats a 5-minute callback by 5-10x, beats a same-day callback by 2-3x overall. The hire can be part-time, remote, $40-60K/yr. They do nothing else — no admin, no front desk. Combined with a check on whether the prospect actually completed the booking flow (often half of intro-promo "purchases" abandon at card-on-file), the speed-to-lead hire alone often pays for itself in the first 30 days.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Lead Follow-Up Within 60 Seconds = 2-3x Lift');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Surge Pricing on Demand-Constrained Times', 'framework', null,
  array['pricing', 'demand', 'unit-economics', 'service-business'],
  $content$When demand is concentrated on specific days/times (Thursday-Saturday for service businesses, weekend evenings for restaurants, December for retail), price should rise during peak and fall during off-peak. Two effects compound: (1) revenue per customer rises during peak; (2) some price-sensitive customers shift to off-peak, smoothing utilization across the week. Framing matters — "weekend prices are $X" reads as a surcharge and creates resentment; "weekday discount is $Y" reads as a benefit and feels like a win. Combine with a membership offer that grants non-surge pricing as a benefit — creates a problem (surge) and sells the solution (membership) in one move. Starting point: +10-20% on peak days; A/B test based on bookings, not feelings.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Surge Pricing on Demand-Constrained Times');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Profit Share Not Equity for Manager Incentives', 'framework', null,
  array['org-design', 'equity', 'incentives', 'staffing'],
  $content$Equity has four components: risk (downside), control (decision rights), profit (cashflow share), and sale (proceeds from exit). Most operators only want profit — and giving them all four creates partnership friction later (Annie problem). Better pattern: give profit share at the facility/pod level as a recurring bonus, not as ownership. Structure: "10% of facility profit year 1, 20% year 2, tied to running this specific location." Revocable for non-performance, scales naturally as locations open, no tax complexity, no exit cap-table negotiation. For star employees, layer a future-location-ownership-path on top: "once you pass 24 months, I will place you in the next location and you get 10-20% of THAT facility." Creates a long ramp for ambition without diluting the parent business or hard-locking misfit partners.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Profit Share Not Equity for Manager Incentives');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Foot-in-Door 3-Step Upsell Sequence', 'framework', null,
  array['sales', 'upsell', 'closing', 'sequencing'],
  $content$Stack upsells in escalating commitment order — small yes → medium yes → large yes. For Annie: (1) rebook next appointment (smallest commitment, just a calendar entry); (2) accept free bonus benefits like a free facial (smallest cost, biggest emotional yes); (3) join the membership (formalizes what they just accepted). Then a fourth step at checkout: prepay 6 or 12 months for a discount. The sequence works because each step assumes the previous one. If you skip to the membership before getting the rebook, you ask them to commit before they have even agreed to come back. If they will not rebook, they certainly will not buy a membership — use the small ask to disqualify and to grease the bigger ask. Always close downstream from prior commitments, not from cold.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Foot-in-Door 3-Step Upsell Sequence');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Bonus Stack Beats Discount for Memberships', 'framework', null,
  array['offer', 'pricing', 'membership', 'bonus-stack'],
  $content$When designing a membership/recurring offer, prefer adding bonus value over cutting price. Why: a 10% discount costs you 10% of every transaction; a free monthly facial might cost you 2-3% in materials but reads as a much bigger benefit. Each bonus should be worth roughly the same as the overall price — someone should be able to say "I would buy this membership just for the facials." Stack 3-5 bonuses, not 20 — too many bonuses dilute. For Annie: facials free with membership, product discounts, increased referral bonus ($10 → $50), birthday/anniversary gifts, monthly $500 giveaway with referral-bonus stacking (referrer also wins if their referee wins). Avoid pure discount memberships unless the entire industry expects them.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Bonus Stack Beats Discount for Memberships');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Owner Pays Self Market Rate (Scaling Prerequisite)', 'framework', null,
  array['unit-economics', 'scaling', 'org-design'],
  $content$Before scaling locations / pods / units, the owner MUST pay themselves the market rate of whatever role they fill within the business. If the owner is running a location while collecting an owner profit, the location is artificially profitable — you are double-counting your labor as both COGS and profit. When you eventually leave that location to open a second one, you have to backfill yourself at market rate (e.g. $80-150K for a manager), and the location margin collapses. Pre-empt by paying yourself the operator salary before profit is calculated; the true ROI per location is what is left after that. Worth it even on paper-only: you make the same money today, but the unit economics reflect what scaling will actually look like, so the next location decision is honest.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Owner Pays Self Market Rate (Scaling Prerequisite)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Prepay Annual Lock-In Math', 'framework', null,
  array['pricing', 'membership', 'churn', 'cashflow'],
  $content$Annual prepay (vs monthly subscription) wins on three vectors. (1) Lower churn — prepaid members churn at significantly lower rates than monthly because cancellation is psychologically harder mid-paid-year. (2) Cash-forward — capital arrives today for use today, enabling faster reinvestment in marketing, hiring, inventory. Cash today is worth more than cash next year on every measure. (3) Competitive lock-in — a customer who prepaid 12 months is not going to a competitor for those 12 months, removing them from the contestable market entirely. The pricing offer comes at checkout, post-membership-yes: "want to save $150? prepay 12 months." Then escalate: "want today to be free? sign up for 12 — your savings cover today." Frame the prepay as a benefit they unlock, not an upsell they pay for.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Prepay Annual Lock-In Math');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Marketing Spend Benchmark (1% of Revenue Floor)', 'framework', null,
  array['leads', 'paid-ads', 'unit-economics'],
  $content$For local service businesses with established attribution (or even just anecdotal "where did you hear about us"), marketing spend should target 1% of revenue minimum, scaling to 5-10% for growth-stage businesses. Annie was spending $12K on $2.3M = 0.5%, below floor. Two implications: (1) if ads are working at all at 0.5%, doubling the spend likely yields more than double the leads because you are not yet saturating the channel; (2) if you can not honestly say where customers come from, you are leaving money on every campaign — fix attribution before fixing budget. Tracking is the unlock: a single dropdown at sign-in ("where did you hear about us?") plus a referral-code field at checkout solves most attribution gaps for a service business.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Marketing Spend Benchmark (1% of Revenue Floor)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Reception Funnel Checklist', 'framework', null,
  array['operations', 'service-business', 'rebook', 'attribution'],
  $content$The waiting area / front-desk window is one of the most under-utilized assets in service businesses. Before service starts, run a 5-step checklist: (1) confirm ID, (2) confirm card on file, (3) sign-in form with where-did-you-hear-about-us dropdown + referral code field, (4) ask for next-appointment booking (BAM-FAM), (5) request a review on the way out. Sequencing matters — start with ID (lowest friction), end with review (after value delivered). All five steps are non-service operations the customer can do while waiting; no marginal cost in time. Combined effect: attribution gets clean, rebook rates climb, reviews compound, and conversion lifts measurably. Most operators leave $50-200/customer on the table by not running this checklist.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Reception Funnel Checklist');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Role-Play Training Cadence (30 min/day)', 'framework', null,
  array['staff', 'training', 'service-business', 'sales'],
  $content$The only way scripts actually get used in the field is repetition. Pattern: 30 minutes per day, paired role-play during natural gaps (open prep, post-lunch, slow afternoons). One person plays customer, one plays staff; swap. When the staff member messes up, the trainer says "cool — say it like this" and runs the exchange again. 5+ reps per script. Reading a script once does not work; repeated muscle memory does. Compounds: a script practiced 60 times across 30 days lands at 80%+ adherence in real interactions versus 10-20% adherence after a single review. Apply to: BAM-FAM rebook script, intro-to-membership upsell, front-desk attribution prompt, objection responses. The role-play time is non-billable but recovers itself within a week through higher take-rates.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Role-Play Training Cadence (30 min/day)');
