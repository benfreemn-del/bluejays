-- Hormozi KB additions — sourced from the Joel McDonald / Just Get
-- Out Of Town diagnosis ($6.4M ARR credit-card travel-hedging coaching
-- business, demand-constrained, 85% reliant on Meta ads, hitting a
-- $100K/mo creative ceiling, LTV/CAC at a skinny 1.4:1, sales team in
-- its first month). Adds 17 framework chunks covering the demand-
-- constraint scaling playbook (mirror to Coupleneurs supply-side
-- playbook), UGC mechanics, ad creative multiplication via AI,
-- platform-algorithmic likeness bias, lead scoring + parallel-dialer
-- throughput math, and the damaging-admissions sales-call opener.
-- Idempotent — WHERE NOT EXISTS guards each insert.

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Three Levers to Release a Demand Constraint', 'framework', null,
  array['leads', 'demand', 'paid-ads', 'strategy', 'scaling-stage'],
  $content$When a business is demand-constrained (can serve more, needs more leads — mirror to the supply-constraint 4-paths framework), three levers exist: (1) Spend more on the existing channel — works if not yet saturated. (2) Lower CAC — drives spending efficiency, three sub-paths: better creative (the most common unlock), conversion rate optimization on the landing/funnel, or better offer. (3) Open a new channel — usually slower than option (2). Most businesses spend more before fixing creative or CRO and hit a wall where each marginal $10K of spend returns less than the previous $10K. Decision tree: if existing channel converts at a profitable ratio, exhaust spending capacity through better creative FIRST. New channel is the last resort because channel diversification takes 6-12 months to stabilize and steals founder attention.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Three Levers to Release a Demand Constraint');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'UGC Loop (Decentralized Content Machine)', 'framework', null,
  array['marketing', 'creative', 'social-proof', 'ugc'],
  $content$Instead of the founder making 5-10 ads/month manually, build a system where 20-30 community-generated videos arrive every week. Mechanism: incentivize customers to post short-form videos of their results (vacations they booked, fitness transformations, business wins, etc.) by gating an additional reward behind it — access to a checklist, bonus training, private community status, or a points-based perk. Customers post, founder gets 20-30 weekly videos. Blast them all into ad accounts simultaneously, see which ones the algorithm rewards, then "juice" the winners (more budget + multiple cuts). Decentralized — every customer becomes an unpaid creative producer. Best for highly visual products (travel, food, fitness, transformation services) where customers naturally photograph their experience anyway.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'UGC Loop (Decentralized Content Machine)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Permission-for-Bonus UGC Mechanic', 'framework', null,
  array['marketing', 'ugc', 'incentives', 'retention'],
  $content$Customers don't think to share unless given a specific reason + reward. The mechanic: hold back a high-perceived-value asset (template, checklist, advanced training, members-only content) and gate it behind "post a 60-second montage of your [outcome] tagging us." Customer posts → gets the asset → business gets permission to repurpose. Two-sided benefit: customer feels rewarded; business gets perpetual rights to the creative. Variants: post-on-our-platform unlocks bonus, tag-us-on-Instagram unlocks bonus, email-us-the-video unlocks bonus. Pair with explicit usage rights language in the form/email confirmation so legal is clean. Avoid asking for free content without trade — customers want the exchange, not the favor.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Permission-for-Bonus UGC Mechanic');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Kaleidoscope Strategy (Multiply ONE Winner 20 Ways)', 'framework', null,
  array['marketing', 'creative', 'paid-ads', 'ai-tools'],
  $content$When you find a winning ad, don't make 20 NEW ads — multiply the proven winner 20 ways via AI. Variants to generate from a single static or video: (1) B&W version, (2) sepia / vintage filter, (3) cartoon / Ghibli stylization (especially when a trend is hot), (4) AI-generated 3-sec video from a still image, (5) refilm/remake with different operator, (6) different framing/crop, (7) different aspect ratios for each platform, (8) audio variation if video, etc. Goal: 20-30 versions of the same proven message + visual + offer. Algorithm tests each version against different audiences; winners surface fast. Lower-effort than producing 20 new concepts, and each variant inherits the original's signal — so failures fail faster + winners win cleaner.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Kaleidoscope Strategy (Multiply ONE Winner 20 Ways)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Likeness Algorithmic Bias (Avatar Diversity in Creative)', 'framework', null,
  array['marketing', 'paid-ads', 'creative', 'targeting'],
  $content$Modern ad platforms (Meta, TikTok, YouTube) read who is IN the ad — face, voice, body language — and disproportionately serve that ad to demographically-similar viewers, because likeness is one of the strongest predictors of conversion. Implication: if the founder appears in every ad and the founder is a 50-year-old business owner, the algorithm will keep serving to 50-year-old business owners, capping your reach to that demographic. To broaden: deliberately put DIFFERENT demographics IN the creative — different ages, ethnicities, body types, lifestyle markers. Same offer, same copy, different faces. Algorithm then targets each new pool. NOT racial profiling (you the founder are not selecting who sees the ad — the algorithm is); you're just casting diverse faces in your own content.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Likeness Algorithmic Bias (Avatar Diversity in Creative)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Old Spice Theoretical Maximum Ad', 'framework', null,
  array['marketing', 'creative', 'philosophy', 'strategy'],
  $content$For a product anyone could buy, there theoretically exists ONE ad good enough to convert the entire market. Old Spice "Guy On The Horse" campaign took Old Spice from a minor player in men's body wash to majority market share with essentially one creative. The implication for scaling spend: the ceiling on profitable ad-spend isn't market saturation — it's creative quality. Most businesses hit a wall around $X/day in spend because their best creative can convert the highest-intent pool, but isn't compelling enough to break the next pool. Diagnose this when CPA rises sharply after a specific daily-spend threshold: the audience saturation is fake; the real constraint is creative. Two responses: (1) better creative for the broader pool, (2) different creative variants targeting different audience-pools using likeness bias.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Old Spice Theoretical Maximum Ad');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'CPA Wall Reveals Creative Quality, Not Market Size', 'framework', null,
  array['marketing', 'paid-ads', 'metrics', 'scaling-stage'],
  $content$When daily ad spend scales, CPA rises in steps — not smoothly. Algorithm goes after the highest-intent pool first; once that pool saturates, it tries the next-most-intent pool, which converts at higher CPA, then the next, then the next. Each step up in CPA marks a pool transition. Most operators interpret this as "we've hit our market size" and stop scaling spend. Wrong interpretation: the wall reveals creative quality, not market size. The bigger pool exists; the creative isn't compelling enough to convert them at a profitable CPA. Fix: don't accept the wall. Run the kaleidoscope strategy + UGC loop + avatar diversity tactics until creative breaks through. Joel was at $150K/mo and getting +10% returns — that's a creative ceiling, not a market ceiling.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'CPA Wall Reveals Creative Quality, Not Market Size');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Gen-Z Native Content Operator (The Brain-Rot Hire)', 'framework', null,
  array['marketing', 'creative', 'staffing', 'content'],
  $content$The single most leveraged content hire for a brand: one young person (~20 years old) who lives on the short-form platforms and is plugged into trending audio, hook conventions, meme formats, and platform-native pacing. Older operators (and most agencies) make content that looks "professional" — overproduced, slow-paced, branded-but-stiff. Native content is iPhone-selfie style, vertical, captioned, audio-locked to trending sounds, fast-cut. The Gen-Z hire can immediately spot what's off about a brand's existing content. Title doesn't matter (Content Coordinator, Social Lead, whatever). Job description: post 5-10 short-form pieces per week across TikTok/Reels/Shorts, find trending audio, modernize the brand voice for the platform, identify viral formats to model. Cost: $40-70K/yr remote. The leverage is enormous — one hire can be the difference between a stagnating brand and a viral one.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Gen-Z Native Content Operator (The Brain-Rot Hire)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Pinned-Comment Trojan Horse for Short-Form Ads', 'framework', null,
  array['marketing', 'paid-ads', 'creative', 'content'],
  $content$On short-form video ads (TikTok, Reels, Shorts), don't put the CTA as overlay text on the video itself — viewers scroll past overlays without engaging. Use a pinned comment with the offer/CTA instead. Examples: "I did all this for $1,800 — link in pinned comment" or "Prove me wrong — pinned comment has the breakdown." Two effects: (1) comments drive engagement (likes, replies) which algorithmically boosts distribution; (2) the pinned-comment format reads as authentic / community-driven rather than advertiser-pushed, increasing click-through. Pair with meme-style hooks ("Tell me you've never traveled internationally without telling me" / "POV: you just realized X") so the ad feels native to the platform, not interruptive.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Pinned-Comment Trojan Horse for Short-Form Ads');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Double-Dip Organic-to-Ad Conversion', 'framework', null,
  array['marketing', 'creative', 'content', 'paid-ads'],
  $content$Test creative organically FIRST. Post short-form content on the brand's own social channels (Reels, TikTok, Shorts) and let the algorithm reveal which pieces resonate (views, watch time, shares, comments). Then take the winning organic pieces, add a 5-second CTA at the end, and run as paid ads. Two compounding benefits: (1) free testing budget — organic does the validation work that would otherwise cost paid-ad spend; (2) the ad is guaranteed to perform because the underlying content has already proven itself in the wild. Watch for: pieces with high watch-time + organic shares are the best paid-ad candidates because the engagement metrics signal genuine viewer interest, not paid-attention. Implementation: post 5-10 pieces/week, identify weekly winners by view-velocity in first 24 hours, run those as ads in week 2.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Double-Dip Organic-to-Ad Conversion');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Lead Scoring on Sale-Critical Factors at Opt-In', 'framework', null,
  array['sales', 'leads', 'lead-scoring', 'operations'],
  $content$Don't wait until the sales call to discover lead quality. Identify the 2-3 factors that most predict closing (for Joel: credit-card spend AND vacation spend, both >$5K/yr). Weave those qualifying questions INTO the opt-in form so the lead score is computed BEFORE the sales call. The dialer queue then sorts: 2-for-2 (perfect fit) called first, 1-for-2 called second, 0-for-2 deprioritized or routed to nurture. Implementation: 2-3 simple form fields on the lead-magnet opt-in ("approximately how much do you spend on [credit cards / vacations / etc.] per year?"), stored as numeric fields on the lead record, computed into a score. Combined effect: sales team works the most likely-to-close leads first, average rep performance increases without any skill improvement, low-fit leads still get nurtured email but don't burn dial time.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Lead Scoring on Sale-Critical Factors at Opt-In');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Parallel Dialer Throughput Math', 'framework', null,
  array['sales', 'operations', 'outbound', 'dialer'],
  $content$A parallel (power) dialer calls 5-10 phone numbers simultaneously per rep; when one picks up, the system instantly connects that prospect to that rep. With typical pickup rates of 3-7%, parallel dialing 10 numbers gives ~0.5-1 connect per blast — meaning the rep spends maximum time talking to live humans, minimum time listening to dial tones. The bigger the team, the better the throughput because if multiple lines pick up simultaneously, connects auto-route to whichever rep is free. 6 reps × parallel dialer = massive talk-time efficiency vs 6 reps × manual single-line dial (which leaves ~70% of rep time idle). Tools: Aircall, JustCall, PhoneBurner, Orum — all support parallel dialing. The right team size: count daily prospect inflow, divide by ~50 outbound attempts per rep per day, that's your team size.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Parallel Dialer Throughput Math');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Outbound Team Size from Prospect Flow', 'framework', null,
  array['sales', 'operations', 'outbound', 'staffing'],
  $content$Right-size the outbound sales team from inbound prospect flow, not from gut feel. Formula: count daily prospects-to-be-worked from each source (book sales, free-trial signups, free-group joins, lead-magnet opt-ins, etc.), sum them, divide by ~50 outbound attempts-per-rep-per-day (typical max throughput on a parallel dialer). Joel example: 320 prospects/day from book funnel + 30/day from Facebook group + low-ticket members = ~300+ daily prospects. At 50 attempts/rep/day that's 6 reps required to actually work the leads. Under-staffing the team means high-value leads sit in the queue and rot. Each unworked lead is silent money on the table. Pair with lead scoring so reps work the best leads first, but the team SIZE comes from prospect flow.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Outbound Team Size from Prospect Flow');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Damaging Admissions Frontloaded (Open With the Bad)', 'framework', null,
  array['sales', 'closing', 'objection-handling', 'framing'],
  $content$Counter-intuitive sales-call opener for "too-good-to-be-true" offers: before pitching the good, list the bad. "Here are all the reasons this won't work for you." Examples: "If you want to only travel on specific days of the year, this doesn't work for you. If you want top-shelf places but only on your exact schedule, this doesn't work. If you can't put $5K/yr on credit cards, this doesn't work." Two effects: (1) the prospect either self-disqualifies (saves you the rest of the call) or says "I can live with that" — a soft pre-commitment that makes the rest of the pitch land; (2) after hearing all the cons, the prospect actually BELIEVES the pros because you've established credibility by admitting the constraints. Skipping damaging admissions when the offer sounds too good drives skepticism through the roof. Frontload the friction-list, then pitch.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Damaging Admissions Frontloaded (Open With the Bad)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'Self-Qualifying via Friction List', 'framework', null,
  array['sales', 'closing', 'qualification'],
  $content$Companion to Damaging Admissions. When the rep lists the constraints up front, prospects self-sort into three buckets: (1) self-disqualify ("I can't do that") — the rep saves 30 minutes; (2) self-confirm ("I can live with that") — a verbal pre-commitment that anchors the rest of the call; (3) ask clarifying questions — engagement signal showing genuine interest. All three outcomes are better than hiding the constraints and discovering them as objections at minute 25. Friction-list also reframes the call: instead of selling AT the prospect, the rep is helping them figure out if they qualify — which inverts the social dynamic and makes the prospect work to convince the rep. "Sounds like this isn't the right fit" said sincerely is more powerful than a 15-minute close attempt.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'Self-Qualifying via Friction List');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select 'The Bigger-Avatar Bet (Algorithm Will Find Them)', 'framework', null,
  array['marketing', 'paid-ads', 'avatar', 'targeting'],
  $content$Most founders write off "the bigger market" prematurely: "I can't advertise to retirees, only to business owners" / "my audience is only X demographic." The reality: modern ad-platform algorithms will find adjacent and broader pools if the creative converts. The question isn't "can I target them?" — it's "can my creative convert them at a profitable CPA?" Don't gatekeep the broader pool from your own ads. The Joel example: he originally targeted business owners because that's who he is; the bigger market (everyday families wanting to travel) was 5-10x larger but he assumed they couldn't afford it. Wrong assumption — the right creative + avatar-diversity-in-the-ad would have unlocked the bigger pool. Test the bigger pool with 20+ creative variants before writing it off.$content$
where not exists (select 1 from hormozi_kb_chunks where title = 'The Bigger-Avatar Bet (Algorithm Will Find Them)');

insert into hormozi_kb_chunks (title, source_kind, source_url, topic_tags, content)
select '60%+ Outbound Floor for Demand-Constrained Service', 'framework', null,
  array['sales', 'outbound', 'leads', 'demand'],
  $content$For a demand-constrained service business with funnel inventory (book buyers, free-group members, lead-magnet opt-ins sitting in CRM), the outbound-to-inbound ratio should be at least 60% outbound. Most founders under-index outbound because inbound feels "easier" — leads come to them. But leads sitting in the queue without an outbound call are silent unrealized revenue. Joel was at 60% inbound / 40% outbound and Hormozi flagged that as too low on outbound. Diagnostic: if your funnel produces more prospects per day than your team can handle 1:1 follow-up on, you are leaving compounding revenue on the table. The fix is parallel-dialer + bigger team + lead-scoring (work the best first). Don't tolerate a high-volume funnel feeding a passive sales team — flip the ratio.$content$
where not exists (select 1 from hormozi_kb_chunks where title = '60%+ Outbound Floor for Demand-Constrained Service');
