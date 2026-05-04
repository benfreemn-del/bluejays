# Full AI System — Build Playbook

The repeatable buildout for a "Custom AI Marketing Funnel" client (the
$9,700 + $500–1,000/mo offering on the audit page). One client = one
complete go-through of this playbook.

This file IS the system. When you sell the package to a new client, you
walk through these phases in order. Most of the code is already
abstracted per `client_slug`, so adding a new client is 60–80% config
and 20–40% bespoke content.

---

## What the AI Package includes (per the audit page)

1. Custom website
2. Google Ads — self-learning campaigns
3. Meta Ads — self-learning iterations per audience
4. Email + text + voicemail funnel (per audience)
5. Long-term SEO growth
6. Lead magnet (custom per business)
7. Logo revision if needed
8. Monthly performance reports

**Pricing tier**: `pricingTier = "fullsystem"` — renders with the
gold $ badge in the dashboard.

---

## Phase 0a — BUSINESS EMAIL ACCESS (the frictionless onboarding lever)

**Ask for this before anything else.** A delegated business email account
(`info@theirbusiness.com`) with permissions to:
- Receive verification emails
- Sign up for new accounts on the client's behalf

This is the unlock that makes the AI Package "frictionless." With this
access, BlueJays can stand up Twilio + Google Ads + Meta Business
Manager + Calendly + SendGrid in ONE day instead of dragging the client
through 4–8 hours of disjointed verification flows. Massive value
multiplier on the offer.

The accounts created are still OWNED by the client (they get the
billing + control), we just do the heavy lifting of standing them up.

Add to client_tasks at kickoff as a CLIENT-ACTION:
  "Grant Ben delegated access to {info@…} for 14-day account-stand-up
   sprint."

---

## Phase 0b — Subscription decisions

The client picks their Hyperloop + Claude tiers. See
`docs/AI_PACKAGE_HANDOFF.md` for the full pricing menu + recommendations.
Default new-client setup:
- **Hyperloop: Off** for the first 30 days (need data first), then upgrade
  to Starter ($99) once they have 50+ leads in the system.
- **Claude: Starter ($49)** from day 1 — reply drafting saves hours
  immediately even at low lead volume.

Both subscriptions tracked in `client_subscriptions` table. The runner
in `src/lib/client-hyperloop.ts` self-gates by capability — no
subscription = system runs static, no errors.

---

## Phase 0 — Ad-platform + tracking access (CRITICAL — request day 1)

The single biggest delay risk on AI Package builds is waiting for ad-
platform access. Ask for these on the discovery call so the pipeline
fills in parallel with the showcase build:

**Meta:**
- Add Ben as Admin in Meta Business Manager
- Pixel ID (15-16 digits) — create one if they don't have one
- Conversions API (CAPI) access token — Events Manager → Pixel → Settings → Generate Access Token
- Ad Account ID (`act_XXXXXXXXX`) — Ben needs Advertiser/Admin role

**Google:**
- Add Ben to their Google Ads account (Standard or Admin level)
- Customer ID (10-digit, e.g. `123-456-7890`)
- GA4 Measurement ID (`G-XXXXXXXXX`) — create a property if needed

**Microsoft Clarity (FREE — request day 1):**
- Sign in at https://clarity.microsoft.com/ (Microsoft / Google account)
- Create a new project, name = client business
- Site URL = the showcase URL (`https://bluejayportfolio.com/clients/{slug}`)
- Copy the 10-char Project ID — send to Ben
- Gives us free heatmaps + session recordings + dead-clicks → fuels
  the Hyperloop weekly UX optimization loop

**Shopify (if e-commerce):**
- Add Ben as Staff member with View Orders/Products/Customers/Marketing
  permissions, OR install our private Custom App
- Confirm storefront URL
- Once connected, portal Insights tab shows live revenue/AOV/repeat-rate

**Stripe (optional):**
- Only if processing payments through us. Add Ben as account user OR
  share a Stripe Connect account ID + restricted key.

Once received, set Vercel env vars (per-client prefix — slug uppercase
with hyphens replaced by underscores, e.g. `ZENITH_SPORTS_*`):
```
{SLUG}_CLARITY_ID=...
{SLUG}_META_PIXEL_ID=...
{SLUG}_META_CAPI_TOKEN=...
{SLUG}_META_AD_ACCOUNT_ID=act_...
{SLUG}_GA_MEASUREMENT_ID=G-...
{SLUG}_GOOGLE_ADS_ID=AW-...
{SLUG}_GOOGLE_ADS_CUSTOMER_ID=...
{SLUG}_TWILIO_NUMBER=+1...
```

The Clarity + pixel + tag scripts all auto-load on `/clients/{slug}/*`
once the envs are set — no code changes needed. Wired through
`src/components/client-tracking-scripts.tsx`, configured in
`src/lib/client-tracking.ts`. Each tracker is independent — missing
envs simply omit that script.

---

## Phase 0.5 — Discovery (1–2 hours)

### Inputs
- Their existing website
- Brand voice doc (if they have one)
- Customer demo list / past sales data (if available)

### Outputs
- A `client_tasks` row list seeded for the new client
- `pricingTier` flipped to `fullsystem` in the BlueJays prospects table

### Steps
```sql
-- Mark the prospect as a fullsystem buyer
update prospects
set pricing_tier = 'fullsystem'
where id = '<their-uuid>';
```

```bash
# Seed empty task list for them
curl -X POST https://bluejayportfolio.com/api/client-tasks \
  -H 'Content-Type: application/json' \
  -d '{ "client_slug": "their-slug", "title": "Discovery call notes",
        "category": "build", "owner": "ben" }'
```

Then visit `/dashboard/clients/their-slug` and add asset/decision/
build tasks for everything that surfaced in discovery.

---

## Phase 1 — Showcase site (1–3 days)

Build their bespoke `/clients/{slug}` page. Reference past clients:
- `zenith-sports/` — multi-page (main + shop)
- `wholme-naturopathy/` — single-page with booking
- `mt-view-landscaping/` — service-business with carousels
- `riv-inc/` — SaaS landing pattern

### Required components on every showcase
- Sticky nav (mobile menu rendered as sibling of header — not child —
  to avoid the backdrop-filter containing-block bug)
- Hero with primary CTA matching their #1 audience
- 3+ trust elements (testimonials, credentials, stats)
- Inquiry form wired to `/api/clients/inquire`
- Footer with proper © + trademark notice

### Wire to the inquire route
Add their slug + emoji + clientEmail to
`src/app/api/clients/inquire/route.ts → SLUG_CONFIG`.

---

## Phase 2 — Lead persistence (Sprint 1, ~1 hour per client)

Already built — no per-client code needed.

When a form submits on `/clients/{slug}`, the `/api/clients/inquire`
endpoint:
1. Logs the lead to `client_leads` table
2. Auto-detects audience via `detectAudience(slug, payload)` in
   `src/lib/client-leads.ts`
3. Fires owner SMS + email alert

**To add audience detection for a new client**:
edit `src/lib/client-leads.ts → detectAudience()` and add a
`if (clientSlug === "their-slug")` branch with the per-form mapping.

---

## Phase 3 — Funnel content (Sprint 2, ~4–8 hours per client)

The actual money-printer. Three parallel cadences typically — one
per primary audience (parent/coach/player for Zenith, decision-maker/
end-user/influencer for SaaS, etc.).

### Per-client setup
1. Create `src/lib/client-funnels/{slug}.ts` mirroring
   `zenith-sports.ts`. Define your per-audience FunnelStep arrays.
2. Add an entry to `src/lib/client-funnels/registry.ts → CLIENT_FUNNELS`
   with sender + sms config.
3. The runner picks them up automatically. No other code needed.

### Cadence rules of thumb
| Audience type | Touches | Window |
|---|---|---|
| Emotional / consumer | 4–5 | 10–14 days |
| B2B / decision-maker | 5–7 | 14–28 days |
| Short-attention / Gen Z | 2–3 | 5–10 days |

### Voice
- Source from their brand voice doc Copy Vault if they have one
- Single CTA per touch matching the audience-segment table
- Pass the "would they reply 'thanks' or hit unsubscribe?" test
- Flag any copy that needs client approval before it ships

---

## Phase 4 — Voice infrastructure (~1 day per client)

### Twilio
1. Client provisions their own Twilio account + buys a number
2. Set env vars on Vercel:
   - `<CLIENT>_TWILIO_NUMBER` — the number (E.164)
   - (Future) `<CLIENT>_TWILIO_SID` + `_TOKEN` if running on a
     sub-account
3. Update `registry.ts → sms.from` to read from the new env var
4. Set Twilio webhook on the number's Voice & Fax config to:
   `https://bluejayportfolio.com/api/client-funnels/missed-call?client={slug}`

### Voicemail recordings
Client records 6 clips (3 audiences × 2 follow-ups each). Upload to
Twilio Media or Vercel Blob. Set `mediaUrl` on the relevant
FunnelChannelTouch entries in their `{slug}.ts` funnel def.

---

## Phase 5 — Lead magnets (~1 day per client)

Three standard archetypes:
- **Coach guide / playbook** (B2B PDF) — see `zenith-sports/training-guide`
- **Camp finder / locator** (consumer geo lookup) — see `zenith-sports/camps`
- **Product story / origin** (brand) — typically baked into showcase

For PDF-style lead magnets, build a printable HTML page (not a real PDF)
at `/clients/{slug}/{magnet-name}`. Wire the EmailCapture component's
`successCta` prop to its URL for instant access on form submit.

---

## Phase 6 — Ads (Sprint 4, ~1 day per client)

### Creative library
1. Create `src/lib/client-ads/{slug}-creatives.ts` mirroring
   `zenith-creatives.ts`. ~27 variants total: 3 audiences × 3 ad sets
   × 3 creatives.
2. Register in `src/lib/client-ads/index.ts → REGISTRY`.
3. Hit `/dashboard/clients/{slug}/ads` and click "Sync seeds" to
   populate the DB.
4. Export to CSV (Meta or Google) and upload to their ad manager.
5. As you launch each ad, flip its `status` to "live" in the dashboard.

### Affiliate pipeline
Affiliate prospects (resellers, podcast hosts, niche influencers) live
in `client_affiliates`. Add manually via the dashboard `+ Affiliate`
form, OR seed in bulk via `/api/client-affiliates?client={slug}` POST.

The scoring function in `src/lib/client-affiliates.ts → scoreAffiliate`
needs a per-client branch — copy the Zenith pattern.

---

## Phase 7 — Reporting (~30 min per client)

Already built — no per-client code needed.

The weekly report at `/dashboard/clients/{slug}/reports` works for any
slug that has `client_leads` rows. To enable the weekly auto-email,
add to `vercel.json → crons`:

```json
{
  "path": "/api/client-reports?client={slug}&email=1",
  "schedule": "0 14 * * 1"
}
```

---

## Phase 8 — Activation + billing

1. Add the recurring revenue line in your `recurring_costs` table
   ($500–1,000/mo)
2. Update `pricingTier = "fullsystem"` on their prospect row → gold
   $ badge appears
3. Send the kick-off email with:
   - Showcase URL
   - Lead magnet URLs
   - Coach demo / consultation booking link (if applicable)
   - First weekly report date

---

## Per-client artifact checklist

When a new client is fully onboarded, every box should be checked:

```
☐ Showcase site at /clients/{slug}
☐ Layout + sticky nav + footer
☐ /api/clients/inquire SLUG_CONFIG entry
☐ src/lib/client-leads.ts → detectAudience() branch
☐ src/lib/client-funnels/{slug}.ts (3 audience funnels)
☐ src/lib/client-funnels/registry.ts entry
☐ Twilio number env var + webhook URL
☐ 6 voicemail clips uploaded + wired
☐ Lead magnet pages (1–3 typical)
☐ src/lib/client-ads/{slug}-creatives.ts (~27 variants)
☐ Ad creative seeds synced to DB
☐ Affiliate scoring branch
☐ Weekly report cron entry in vercel.json
☐ pricing_tier = 'fullsystem' set in prospects row
☐ recurring_costs row added
☐ client_tasks list seeded with their initial backlog
```

---

## Code surface (where to look for what)

| Capability | Location |
|---|---|
| Showcase page | `src/app/clients/{slug}/` |
| Inquiry endpoint | `src/app/api/clients/inquire/route.ts` |
| Lead persistence + audience detection | `src/lib/client-leads.ts` |
| Funnel definitions | `src/lib/client-funnels/{slug}.ts` |
| Funnel registry (sender config) | `src/lib/client-funnels/registry.ts` |
| Funnel runner (idempotent) | `src/lib/client-funnels/runner.ts` |
| Email/SMS/VM senders | `src/lib/client-funnels/sender.ts` |
| Reply detection | `src/lib/client-funnels/reply-detector.ts` |
| Missed-call webhook | `src/app/api/client-funnels/missed-call/route.ts` |
| Ad creative library | `src/lib/client-ads/` |
| Affiliate pipeline | `src/lib/client-affiliates.ts` |
| Weekly report generator | `src/lib/client-reports.ts` |
| Per-client task list | `src/lib/client-tasks.ts` + `/dashboard/clients/[slug]` |
| Per-client lead dashboard | `/dashboard/clients/[slug]/leads` |
| Per-client ads dashboard | `/dashboard/clients/[slug]/ads` |
| Per-client affiliates dashboard | `/dashboard/clients/[slug]/affiliates` |
| Per-client reports dashboard | `/dashboard/clients/[slug]/reports` |

---

## DB tables (in dependency order)

| Table | Purpose | Migration |
|---|---|---|
| `client_tasks` | Per-client durable task list | `20260503_client_tasks.sql` |
| `client_leads` | Per-client lead capture | `20260503_client_leads.sql` |
| `client_lead_messages` | Funnel send + reply log | `20260503_client_lead_messages.sql` |
| `client_ad_creatives` | Per-client ad variant library | `20260503_client_ad_creatives.sql` |
| `client_affiliates` | Per-client affiliate pipeline | `20260503_client_affiliates.sql` |
| `client_funnel_runs` | Cron observability log | `20260503_client_funnel_runs.sql` |

All keyed by `client_slug` so cross-tenant queries are trivial. No
per-client schema work needed.

## Per-client artifact paths

```
src/app/clients/{slug}/                       # Showcase site
  page.tsx                                    # Main page
  layout.tsx                                  # Metadata
  sticky-nav.tsx                              # Nav (mobile menu sibling-of-header pattern)
  email-capture.tsx                           # Email-capture component
  photo-zoom.tsx                              # If product photos
  training-guide/                             # If coach lead magnet
  camps/ or {magnet}/                         # If parent lead magnet

src/lib/client-funnels/{slug}.ts              # 3-audience funnel definitions
src/lib/client-funnels/registry.ts            # ADD entry
src/lib/client-ads/{slug}-creatives.ts        # ~27 ad variants
src/lib/client-ads/index.ts                   # ADD to REGISTRY
src/lib/client-affiliates-seeds/{slug}.ts     # 30–50 starter targets
src/app/api/client-affiliates/seed/route.ts   # ADD to SEED_REGISTRY
src/app/api/clients/inquire/route.ts          # ADD to SLUG_CONFIG
src/lib/client-leads.ts                       # ADD detectAudience() branch
src/lib/client-affiliates.ts                  # ADD scoreAffiliate() branch + cold-email templates
vercel.json                                   # ADD weekly report cron
```

---

## Lessons learned from Zenith Sports (first AI Package client)

Patterns + gotchas that surfaced building the first one. Use these as
defaults for client #2.

### Defaults that work
- **Always start with the brand voice doc.** If they have one, treat it
  as gospel — pull H1/eyebrow/subhead/coach-section copy verbatim from
  their Copy Vault. If they don't, do a 30-min call before writing a
  single email and produce one yourself.
- **Three audiences is the right grain.** Don't split coach into "head
  coach + assistant" — over-segmenting kills funnel content quality.
  Three is optimal: emotional buyer, B2B decider, end-user.
- **Cadence rule of thumb:** parents 5-touch / 14d, coaches 6-touch /
  21d, players 3-touch / 7d. Adjust ± 1 touch per audience based on
  the brand voice doc's tone.
- **Lead magnets need to ship Phase 5, not earlier.** A coach guide
  PDF is the highest-leverage one — it doubles as the affiliate cold-
  email asset. Build it FIRST among the three magnets.
- **Affiliate seed list is non-negotiable.** Empty `/affiliates` page
  is the #1 thing Ben won't actually use. Pre-research 30-50 targets
  per client (mostly geo-warm + national category leaders) and seed
  them with `source='seed-list'` so the page is populated on day one.

### Gotchas to avoid (from Zenith QA)
- **Mobile menu in a sticky-nav with backdrop-filter** — the menu must
  render as a sibling of `<header>`, not a child. backdrop-filter
  creates a containing block for fixed descendants and the menu will
  be pinned to the header's 64px height. (See zenith-sports/sticky-nav.tsx
  for the fix pattern.)
- **Photo aspect ratios for headshots** — original headshot photos
  are usually portrait (~2:3). Default `aspect-[5/4]` + `object-cover`
  crops the top of the head off. Use `aspect-[4/5]` + `objectPosition:
  center top`.
- **® trademark superscript** — `<sup className="text-[0.4em]
  -ml-0.5 top-[-0.6em]">®</sup>` is the scale-correct treatment for
  inline body text. The default `<sup>` floats too high.
- **Phone normalization in reply detection** — Twilio sends E.164
  (`+12065551234`); forms typically capture `(206) 555-1234`. The reply
  detector must generate variants (raw / digits / last-10 / +1+last-10)
  and try each.
- **Pricing-tier rendering** — both `custom` AND `fullsystem` should
  resolve via `customSiteUrl` in `hasPreviewAvailable()` and
  `getThemedPreviewHref()`. Otherwise fullsystem rows show "Build Site"
  instead of "View Site" and Copy Link copies the wrong URL.
- **Funnel runner enrollment guard** — only enroll a lead if
  `cfg.getFunnel(audience)` returns non-null. Audiences without a defined
  funnel (e.g. "club" for Zenith) must stay `not_enrolled` for manual
  review, not silently sit at `enrolled` with no sends happening.
- **Section padding makes empty rows look bad** — any section with
  py-44 (176px) on a desktop layout where the right column is empty
  reads as broken. Either fill the right column with decorative content
  (mint glow + pattern grid) or drop the column entirely.

### Operational patterns added since v1
- **Funnel-runs observability log** (`client_funnel_runs` table) writes
  one row per cron pulse so Ben can confirm "the funnel is firing,
  no errors." Surfaced as a one-liner at the top of the leads page.
- **Bulk actions on the leads dashboard** — Pause / Force Enroll /
  Mark Responded / Mark Converted with multi-select checkboxes.
  Standard pattern, ship it on every client dashboard.
- **Affiliate seed bulk-loader** — `/api/client-affiliates/seed?client=...`
  reads from `src/lib/client-affiliates-seeds/{slug}.ts` and bulk-inserts
  with idempotent dedupe on `lower(org_name)`. Add a "Seed list" button
  to the affiliates page header for one-click load.
- **Lead magnets cross-reference funnel templates** — every per-audience
  funnel email should mention the magnet that fits that audience
  (parents → camps url, coaches → coach guide url, players → training
  url). Use template variables `{{campsUrl}}`, `{{coachGuideUrl}}`,
  `{{trainingUrl}}`, `{{shopUrl}}`, `{{contactUrl}}` from the runner's
  `substitutions()`.
- **Always log skipped sends, not just sent ones.** If SMS can't fire
  because Twilio isn't provisioned, write a `client_lead_messages` row
  with `status='skipped'` so the timeline still shows what *would* have
  happened. Never silently no-op.

### Client access model (NOT YET BUILT)

The current system assumes Ben (or Claude) operates the dashboard. The
client (Philip + Paul) does NOT have a login to `/dashboard/clients/...`
— that's gated by the admin password.

If a future AI Package client wants self-serve access, it'd be a Phase
9 add-on: a per-client read-only portal at `/clients/{slug}/portal`
with magic-link auth (URL-as-secret pattern, like `/client/[id]`
already uses for paid customers). Scope: ~1 day of work.

For now: forward the weekly performance email + send Loom walkthroughs
of the showcase + new lead magnets when they land.

---

## Phase 9 — Auto-optimization layer (Hyperloop client integration)

`src/lib/hyperloop-*.ts` is the BlueJays auto-optimization brain — it
runs Wilson-confidence-interval analysis on variant performance, retires
losers, promotes winners, and seeds the Claude generator with proven
patterns. Currently scoped to BlueJays' own prospect/ad data.

**Per-client extension** (apply to each AI Package buyer):
- Funnel template performance — which subject lines / SMS bodies are
  getting opens + replies? Surfaces in `/dashboard/clients/{slug}/insights`.
- Ad creative performance — once Meta/Google data syncs into
  `client_ad_creatives.impressions/clicks/conversions`, run the same
  Wilson analysis to auto-flag winners + losers per audience.
- Audience conversion lift — which audience (parent/coach/player) is
  converting hottest? Auto-suggest budget reallocation to winning
  audience.
- Generator seed — feed top-performing template_ids back into the
  Claude generator so future per-client builds start from proven copy.

**Build status:** scaffolding TBD — flagged as Sprint 5 on the next
client engagement (or refit on Zenith once we have 4+ weeks of real
funnel data to analyze).

---

## Sales artifacts

When pitching the package:
- Show prospect a recent client's `/dashboard/clients/{slug}/reports`
  page (anonymized) to demonstrate the live data the client gets
- Walk through one funnel email touch from `{slug}.ts` to show the
  per-audience customization
- Show the gold $ row in the dashboard ("This is what your row will
  look like once you're onboarded")
- Quote $9,700 + $500–1,000/mo with a payment plan option (3x $3,500
  / $3,500 / $3,000 per the audit page)
