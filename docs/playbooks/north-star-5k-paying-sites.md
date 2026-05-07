# North Star: 5,000 Paying Sites — The Failure-Is-Not-An-Option Plan

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read this file on demand when the topic comes up.

---

<!-- moved from CLAUDE.md: ## North Star: 5,000 Paying Sites — The Failure-Is-Not-An-Option Plan -->

## North Star: 5,000 Paying Sites — The Failure-Is-Not-An-Option Plan

This is the long-term operating thesis for BlueJays. Every system, every
hire, every channel decision, every CLAUDE.md rule must measurably move
the business toward this number. If a project doesn't, it's a
distraction.

### The math at 5,000 sites
- **5,000 customers × $997 setup = $4.985M one-time revenue** (acquired
  over 24 months ≈ $208K/mo run-rate at year 1)
- **5,000 × $100/yr renewal = $500K/yr recurring annuity** at full
  scale (assuming 80% year-2 retention)
- **Hitting 90%+ retention adds ~$160K/yr at the 5K mark** — that's
  why the customer portal + real-data monthly report + NPS funnel +
  Stripe dunning are non-negotiable infrastructure.

### Cost ceiling per acquired customer (CAC)
At $997 setup + ~$80/yr 5-year LTV, total LTV ≈ $1,400 over 5 years.
Sustainable CAC = ~$200–$300 per closed customer. Above $400 the
unit economics break.

### Margin per site at scale
- $997 setup minus ~$11 domain, ~$5 generation, ~$3 hosting, ~$50
  blended CAC = **~$925 margin per first-year customer**
- Renewal year: $100 - $11 - $3 = **$86/yr recurring margin per
  retained customer**

### Five milestones — each unlocks the next phase

**Milestone 1: 100 sites (~$100K revenue, $10K/yr annuity)**
- Operator: Ben alone. Manual review on every reply.
- Marketing: cold email + inbound SMS + LinkedIn manual + postcards.
- Failure mode: Ben burns out. Mitigation: PendingRepliesPanel + 3-step
  onboarding + customer portal + loss-reasons feedback loop.

**Milestone 2: 500 sites (~$500K revenue, $50K/yr annuity)**
- First hire: VA at $5–$8/hr × 20 hrs/wk for intake + support triage.
- Marketing: add Apollo ($30/mo), retargeting pixels ($100/mo), Day-7
  postcard ($200/mo at 100 prospects).
- Tech: enable HTML pitch email after Day 14 warmup; add 3rd warming
  domain for 300 sends/day combined.

**Milestone 3: 1,000 sites (~$1M revenue, $100K/yr annuity)**
- Second hire: junior designer at $15–$25/hr × 30 hrs/wk for
  customizations.
- Marketing: outbound voice (Ben dials 10/day from
  opened-but-didn't-claim list), GBP claim, Chamber memberships.
- Tech: Vercel Pro 50-domain-per-project cap is hit. Shard across
  20+ projects via `vercel_project_id` column OR upgrade to Enterprise.

**Milestone 4: 2,500 sites (~$2.5M revenue, $250K/yr annuity)**
- Third hire: closer/sales rep at $50K base + 10% commission.
- Marketing: Apollo Sales Nav team license, paid LinkedIn ads,
  partner referrals from 2–3 designers who don't serve SMB.
- Tech: registrar spend = ~$70/day at this volume. Renewal cron
  MUST be airtight.

**Milestone 5: 5,000 sites (~$5M revenue, $500K/yr annuity)**
- Team: Ben + closer + 3 designers + VA + customer success hire.
- Marketing: brand spend kicks in. Local radio, event sponsorships,
  podcast sponsorship.
- Tech: Vercel Enterprise OR sharded Pro, Supabase Team ($599/mo for
  PITR), SendGrid Pro ($89/mo), Twilio short-code (~$1K/mo).
- Failure mode: regulatory exposure. Mitigated by airtight TCPA gate,
  working unsubscribe, state subscription disclosure on every surface.

### The 5 systems that must be airtight before scaling past 100

1. **Domain renewal cron** — Stripe-first, registrar-second policy is
   the load-bearing wall. One bug = systemic revenue leak.
2. **Card-failure dunning** — invoice.payment_failed + 30/7-day
   pre-renewal emails + customer portal must convert ≥60% of failed
   cards before suspending service.
3. **AI responder + Ben-review queue** — kill switch + drafts panel.
4. **Customer portal + monthly real-data report** — the "$100/yr"
   must feel like ongoing value, not a hidden subscription.
5. **Onboarding 3-step form + multi-stage reminder cron** — every
   paid customer who can't fill the form is a customer who never
   goes live.

### Channel mix at full scale (the 80/20)

The unsexy truth: **at 5K sites, 80% of acquisition will come from
outbound + referrals, not inbound.** SEO/content/PR are
brand-building, not pipeline-driving, until much higher scale.

Concrete revenue split target at 5K:
- Cold email + inbound SMS + voicemail: **45%**
- Referrals + customer-success NPS-promoter loop: **20%**
- LinkedIn outbound (manual + Sales Nav): **15%**
- Outbound voice (Ben + closer dialing warm leads): **10%**
- Paid retargeting + brand reinforcement: **5%**
- SEO + content + organic referrals: **5%**

The first $1M of revenue comes almost entirely from cold email +
inbound SMS + manual outbound. Don't get distracted building TikTok
funnels.

### Risk register — what kills this business

1. **SendGrid sender reputation collapse** — one bad batch tanks the
   domain. Mitigated: parallel domain warming, bounce auto-suppression,
   gradual ramp.
2. **Stripe account suspension** — chargeback rate >1% suspends the
   account. Mitigated: 100% money-back guarantee, Customer Portal,
   generous first-30-days refund.
3. **Vercel/AWS cost explosion** — viral growth = Lambda spikes.
   Mitigated: cost-per-call logging, spending dashboard,
   recurring-cost projection.
4. **Single-state regulatory action** — WA AG investigates "$100/yr
   in perpetuity." Mitigated: every paid customer sees the renewal
   cadence in welcome email, monthly report, and customer portal.
5. **Ben hit-by-bus** — single-founder risk. Mitigated: by Milestone
   3 the codebase + CLAUDE.md should be operable by a $20/hr VA
   + Claude in 90% of cases.

### How to know if we're on track — the 5 weekly numbers

Each Friday, Ben reviews these:
1. **Net new paid customers this week** (target: 5/wk at M1 → 50/wk at M5)
2. **Email open rate** (target: ≥30% — below = sender reputation slipping)
3. **Reply rate** (target: ≥3% on Day 0 pitch — below = copy/list quality)
4. **Onboarding form completion within 48 hrs of payment** (target: ≥70%)
5. **Year-2 retention** (target: ≥80%)

Numbers below target for 2 consecutive weeks = pause new acquisition
spend, fix the leaking surface first, then resume.

### Locked-In Rule 46 — Failure-Is-Not-An-Option Decision Framework

Every meaningful decision (new feature, new channel, new hire, new
expense, new tool) must answer: **"Does this measurably move us
toward 5,000 paid sites in 24 months?"** Default answer should be no.
Saying yes requires showing which milestone it unlocks AND which of
the 5 weekly numbers it improves. If neither applies, the answer is
no — even if the idea is "cool."

This rule is the antidote to the BlueJays codebase's recurring
problem: building 8 channels and only deploying 2.5. **Build less,
deploy more, measure everything.**

### Locked-In Rule 47 — Approved Prospects Must Auto-Enroll Daily

The 2026-04-25 audit found that the warming domains were under-utilized
(36 sends out of 100 capacity) NOT because of missing prospects, but
because the daily funnel cron only sends to ALREADY-ENROLLED prospects.
Approved-but-not-enrolled prospects sat in the pool while the warming
capacity went unused. Manual `enroll-batch` was the only path.

**Rule:** the daily funnel cron MUST auto-enroll up to (today's warming
limit − today's already-sent-day-0) approved-and-not-enrolled prospects
BEFORE running the funnel processor. Implementation lives in
`/api/funnel/run/route.ts`. Never let warming capacity sit idle while
approved prospects sit in the backlog — that wastes the most expensive
asset BlueJays owns: sender reputation runway.

### Locked-In Rule 48 — Ask 10+ Questions Before Any Big Job (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Big jobs that get started without enough
upfront context end up in rework — wrong assumptions baked in, scope
creep, mid-build pivots that waste hours. The fix:

**Before starting ANY big job, ask Ben at least 10 specific questions.**

A "big job" = anything that meets ANY of these:
- Multi-file refactor or new feature spanning 3+ files
- New customer-facing surface (page, email template, channel)
- New automation/cron or change to an existing cron's behavior
- New external integration (API, service, vendor)
- Anything Ben describes as "the next big move," "the big build,"
  "let's tackle X," or scopes broader than a single fix
- Any change touching pricing, billing, the funnel, or onboarding
- Any plan that would take more than ~30 minutes of execution

**Questions must be specific and load-bearing — not generic.** Bad:
"What's your goal?" Good: "Should the new SKU charge upfront or
defer to the year-2 sub like the rest?" The 10 questions should
collectively eliminate ambiguity around: scope, priority, success
criteria, edge cases, who/what is affected, what to leave alone,
deadline, dependencies, what done looks like, and what would make
this fail.

**Format (NON-NEGOTIABLE):** numbered list. Under each question, give
2-5 lettered multiple-choice options (A, B, C, D...) representing the
most likely answers. ALWAYS include a final option labeled "Other —
type your own" so Ben can override. No preamble. Wait for Ben's
answers before writing a single line of code or running a single
command.

Why multiple-choice: it's faster for Ben to pick a letter than to
type out a paragraph. The options also surface considerations Ben
might not have thought of yet — he sees what the realistic answer
space looks like before committing. The "Other" escape hatch keeps
him from feeling boxed in.

Good multiple-choice options are concrete and load-bearing:
- BAD: A) Yes  B) No  C) Other
- GOOD: A) Charge upfront like review_blast  B) Defer to year-2 sub
  like custom tier  C) Make it a separate $X/mo subscription
  D) Other — type your own

**Exceptions (no 10-question gate required):**
- Bug fixes with a clear repro
- Single-file edits that Ben explicitly scoped
- Continuing a job already in flight where context is established
- Read-only investigation / answering a question Ben asked

If unsure whether a job qualifies as "big," default to asking the
questions. The cost of asking is 30 seconds; the cost of building
the wrong thing is hours.

### Locked-In Rule 49 — Manually-Added Prospects Must Be Tagged (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Caught the same day: the freshly-shipped
Rule 47 auto-enroll cron would have swept Lewis County Autism
Coalition, Meyer Electric, Hector Landscaping, and OPS Security into
the cold-outreach warming pool because all 4 sat in `status='approved'`.
These are warm relationships — gifted sites, custom builds, or
hand-picked closes — that Ben handles personally with custom outreach,
NOT the templated funnel.

**The rule:** any prospect that Ben adds manually to the system
(directly via dashboard, via SQL import, via custom-tier purchase, via
gift, via friend/family/referral introduction) MUST be tagged with
`prospects.manually_managed = true` BEFORE any automation can touch it.

**The mechanism:**
- Schema: `prospects.manually_managed BOOLEAN NOT NULL DEFAULT false`
  (migration `20260425_manually_managed.sql`).
- Type: `Prospect.manuallyManaged?: boolean` in `src/lib/types.ts`.
- Auto-enroll filter: `/api/funnel/run/route.ts` Step 0 already
  enforces `.eq("manually_managed", false)` on the candidates query —
  do NOT remove this clause.
- Default false so every existing scouted prospect retains current
  behavior. Only the manual ones get flipped to true.

**When ANY future code adds a manual prospect, it MUST set
`manuallyManaged: true` in the same `createProspect` / `updateProspect`
call.** Examples:
- Custom-tier purchases (`pricingTier === "custom"`) → always manual.
- Direct dashboard "Add prospect" form → manual by default unless
  operator explicitly opts in to auto-outreach.
- SQL imports / bulk uploads of warm leads → manual until proven
  otherwise.

**When in doubt, default to manual.** False positives are cheap (Ben
handles them himself), false negatives are expensive (warm relationship
gets the cold-pitch template, trust burned).

**Future surfaces that MUST respect this flag:**
- Auto-enroll (already done)
- Bulk-send scripts (`scripts/recover-broken-link-sends.ts` and any
  future bulk-outreach script)
- Daily SMS funnel sweeps
- Voicemail drop crons
- Postcard cron (when wired)
- Retargeting pixel triggers (when wired)
- Test group selection (Rule 50 below)

If a new automated-touch surface gets built and skips this filter, that's
a regression. The filter is part of the Rule 47 contract — auto-touch
without `manually_managed = false` is forbidden.

### Locked-In Rule 50 — Cold Outreach Skips Killer-Site & Franchise Prospects (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. Two prospect classes that should never
get cold pitches because the $997 offer doesn't fit their reality:

**1. Already-killer existing websites.** If a prospect's current website
is genuinely good — modern design, clear CTAs, mobile-responsive,
recent content, real photography — pitching them a $997 redesign feels
desperate and ill-informed. They'll dismiss us, and rightly so. The
prospects worth pursuing are the ones with visibly outdated, broken,
template-generic, or missing sites where the upgrade is obvious.

**2. Franchise locations.** Franchise businesses (chain pizza, chain
auto-repair, chain real-estate offices, chain gyms, etc.) have
corporate-mandated websites — the local owner can't change them. The
$997 pitch is dead on arrival. Even if the franchisee LOVES the
preview, they can't act on it.

**The rule:** every cold-outreach selection mechanism (auto-scout,
auto-enroll, test-group picker, bulk-send scripts, retargeting list
builder) MUST filter out:
- Prospects flagged as `franchise = true` (when the column exists).
- Prospects whose `qualityNotes` or scraped data indicates a
  high-quality existing website (use `qualityScore` heuristics: skip
  prospects whose CURRENT site scores ≥ 80 on the QC review).

**Implementation guidance:**
- For auto-scout: tag franchise listings during scrape (Google Places
  often has "Franchise" in the business type or the website URL is a
  subdomain of a national chain like `www.midaschain.com/store/123`).
- For auto-enroll: add `.lt("current_site_quality_score", 80)` once
  the scoring column exists. Until then, lean on manual review during
  approval — Ben should reject obvious franchises and killer-site
  prospects at the approval gate.
- For test-group selection: Rule 50 is load-bearing. The whole point of
  a test group is to spend extra ($/prospect) on the highest-converting
  segment. Wasting Browserless videos + Lob postcards on a franchise
  Sears Auto Center destroys the per-prospect economics.

**Heuristics for "killer existing website" detection** (use any 2+):
- Site loads cleanly on mobile (no horizontal scroll, no broken layout)
- Has booking/scheduling system embedded
- Recent blog content (within last 12 months)
- Custom photography (not generic stock)
- Modern framework (Next.js, Webflow, Squarespace 7.1, modern Wix)
- Site speed score > 80 on PageSpeed Insights
- HTTPS + valid SSL + sitemap.xml present

If a prospect hits 2+ of those, treat them as killer-site and exclude
from cold outreach. Ben can still pitch them manually if there's a
relationship angle, but the templated funnel stays away.

**Until automated detection ships, the gate is the dashboard approval
step.** Ben must consciously reject killer-site and franchise prospects
when they hit `pending-review` — never approve them and let auto-enroll
do its thing.

### Locked-In Rule 52 — Stripe Live Kill-Switch (NON-NEGOTIABLE)

Established 2026-04-25 by Ben as part of the LIVE flip. Every public
checkout entry-point MUST honor a single env-var kill-switch so any
incident can stop new transactions in <2 minutes without code changes.

**The contract:**
- When `STRIPE_LIVE_ENABLED=false`, every public checkout endpoint
  returns HTTP 503 with a friendly "temporarily unavailable, email Ben"
  message BEFORE any other logic runs (rate limit, prospect lookup,
  Stripe call). No partial transactions possible.
- Default unset OR `STRIPE_LIVE_ENABLED=true` (or any value !== "false")
  = normal operation. The check is fail-OPEN by design — a missing env
  var doesn't accidentally disable checkout.
- Webhook handler does NOT honor the kill-switch. In-flight transactions
  (already at Stripe) MUST still process when they fire so customers
  who paid get their welcome email + mgmt sub created. Stopping new
  starts is the goal; stopping in-flight finishes is a worse outcome.

**Endpoints that MUST honor the kill-switch (verify when adding any new
checkout surface):**
- `POST /api/checkout/create` — main $997 / installment checkout
- `POST /api/checkout/upsell` — 4-SKU upsell checkouts
- Any future checkout route MUST check `STRIPE_LIVE_ENABLED !== "false"`
  at the top of the handler. If a new route forgets, that's a regression.

**When to flip:**
- Stripe account suspension warning (rare, but immediate trigger)
- Webhook signing-secret mismatch detected in logs (transactions
  succeed but our webhook 401s → customers pay but get nothing)
- Any chargeback rate spike that risks Stripe account health
- Maintenance windows where an incompatible code change is deploying
- Suspected fraud / unusual transaction volume

**Recovery:**
1. Set `STRIPE_LIVE_ENABLED=true` (or remove the env var) on Vercel
2. Redeploy (~60-90 sec)
3. New checkouts work again
4. Webhook handling for in-flight events was unaffected throughout

**Forbidden:**
- Don't add a UI surface that bypasses this gate
- Don't add a different env var for the same purpose — this is the
  single canonical kill-switch
- Don't make the kill-switch fail-CLOSED (default off when env var
  missing) — that bricks new Vercel projects on first deploy

### Locked-In Rule 53 — LIVE Launch: Standard Tier Self-Serve Only

Established 2026-04-25 by Ben at LIVE launch. At launch, ONLY the
`standard` ($997) tier is self-serve through the `/claim/[id]` →
Stripe Checkout flow. The `free` ($30) and `custom` ($100/yr) tiers
are gated behind a "request" path — prospects on those tiers must
email Ben directly so the relationship can be handled personally.

**Why:**
- `free` tier is for friends/family — never auto-served, always tagged
  manually by Ben (existing rule)
- `custom` tier is for bespoke builds with hand-off relationships
  (Lewis County Autism, Hector Landscaping, etc.) — these prospects
  shouldn't see the templated checkout flow because their experience
  is supposed to feel personal
- The auto-enroll cron (Rule 47) + cohort selection (Rule 49) already
  exclude manually-managed prospects from automated outreach. This
  rule extends the same logic to the conversion surface — even if a
  custom prospect somehow lands on `/claim/[id]`, they get routed to
  Ben rather than self-serving.

**Implementation:** `/api/checkout/create` returns HTTP 403 with a
"please email bluejaycontactme@gmail.com" message when the prospect's
`pricingTier !== 'standard'`. Override available via env var
`STRIPE_ALLOW_NON_STANDARD_TIERS=true` if Ben needs to re-open
self-serve on those tiers for a specific batch (e.g. friends-and-
family promotion).

**The override env var is for specific campaigns, not the new normal.**
After re-enabling for a batch, flip back to default (unset) so the
gate stays in place by default. If you find yourself wanting it on
permanently, that signals the policy is wrong — talk to Ben before
making it the default.

**Existing custom-tier customers:** prospects already in `paid` status
on a custom tier are unaffected — they've already paid and the route
gate only fires on NEW checkout attempts. Their renewal flow runs
through Stripe subscriptions independently of the checkout surface.

### Locked-In Rule 54 — Pre-Flip Code Changes Ship Before Env Vars Flip

Established 2026-04-25 by Ben. When migrating any third-party service
from test/sandbox to LIVE (Stripe, Namecheap, Lob, Twilio, SendGrid),
the order is:

1. Code changes that gate the new behavior (kill-switches, tier gates,
   feature flags, mock-mode fallbacks) ship + deploy to Vercel FIRST
2. Verify the deploy succeeded (gh api commit status check)
3. THEN flip the env vars in the third-party dashboard + Vercel
4. THEN run a dry-run verification (test charge / webhook trigger /
   address availability check)
5. THEN remove the kill-switch / feature flag if appropriate (not
   immediately — leave it in place for a few days as a safety rail)

**Why:** flipping env vars before the gating code exists creates a
window where the system is half-migrated and any incident has no
fast recovery path. Code-first means there's always a one-liner
revert: flip the env-var kill-switch back on.

**This rule generalizes:** applies to Namecheap going live (a NAMECHEAP_LIVE_ENABLED kill-switch should be added before flipping NAMECHEAP_SANDBOX off), to Lob going live (LOB_LIVE_ENABLED), to Twilio if/when SMS launches at scale, etc. Don't trust env vars alone as the gate — always pair with a code-level kill-switch.

---


---

