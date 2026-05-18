# Full AI System — Build Playbook

The repeatable buildout for a "Custom AI Marketing Funnel" client (the
$10,000 + $500–1,000/mo offering on the audit page; $300 off for pay-in-full = $9,700). One client = one
complete go-through of this playbook.

This file IS the system. When you sell the package to a new client, you
walk through these phases in order. Most of the code is already
abstracted per `client_slug`, so adding a new client is 60–80% config
and 20–40% bespoke content.

## References — supporting discipline locked in CLAUDE.md / aios

This playbook is the build-side companion to a set of operator rules. Read
these before any new AI Package engagement so the discipline stays
load-bearing through delivery:

- **CLAUDE.md Rule 67** — multi-anchor ICP validation (≥3 anchors across
  radically different verticals before locking a customer-profile pattern)
- **CLAUDE.md Rule 68** — per-page metadata override mandatory for client
  showcases (canonical, OG, Twitter, JSON-LD)
- **CLAUDE.md Rule 69** — active client showcases must be in `sitemap.ts`
- **CLAUDE.md Rule 70** — animation discipline for trade-category
  illustrations (pure-CSS keyframes, prefixed class names,
  `prefers-reduced-motion` gated)
- **CLAUDE.md Rule 71** — defensibility-score concept for product-business
  prospects (place-of-origin / patent-IP / named-channel signals)
- **CLAUDE.md Rule 72** — content fidelity when porting from a real source
  (don't fabricate; soften or remove)
- **CLAUDE.md Rule 35** — TCPA-compliant SMS gate (smsConsent + source =
  inbound; Phase 4 below extends this to per-client funnels)
- **`aios/CLAUDE.md` working principles 8–10** — the AIOS-side mirror of
  the same discipline (multi-anchor ICP, content fidelity, active-customer
  filter on cold sales surfaces)
- **`aios/references/manufacturer_icp_synthesis.md`** — the canonical
  3-anchor (ITC + Zenith + Nevarland) ICP synthesis report
- **`aios/decisions/2026-05-06_manufacturer_icp_3anchor_lock.md`** — the
  lock-in decision record

---

## Vertical split: Universal + Manufacturer + Author (locked 2026-05-14)

Per the ICP niche-down (`memory: recent_locked_decisions.md` 2026-05-14),
the $10k AI System is product-makers + indie authors only — service-trade
businesses get the $997 site tier instead. EVERY $10k client gets the
**Universal** stack. Then their vertical adds a **bonus stack** on top —
no upcharge.

Both verticals' deliverables surface publicly on `/agency` page (single
source of truth — see `INCLUDED_UNIVERSAL`, `INCLUDED_MFG`, and
`INCLUDED_AUTHOR` arrays at `src/app/agency/page.tsx`).

### Universal (17 modules — every $10k client gets these)

1. Custom website
2. Google Ads — self-learning campaigns
3. Meta Ads — self-learning iterations per audience
4. Different pitch per customer type (up to 6 funnels)
5. Auto-reply to every email (Claude-drafted, 6 buckets)
6. Set-it-and-forget-it campaigns (scheduled blasts)
7. Text follow-ups (Twilio)
8. Missed-call text-back
9. Voicemail drops
10. Free-gift lead magnet (custom quiz)
11. Owner dashboard (9 tabs)
12. Auto A/B test engine
13. Long-term Google rank growth (SEO + backlinks)
14. Logo refresh
15. Live open/click tracking
16. Heatmap recordings
17. Weekly + monthly reports

### Manufacturer bonus stack (4 modules — Tekky + ITC pattern)

1. **DTC Storefront + Dealer Locator** — direct-to-consumer storefront
   for end-buyers PLUS a dealer locator that protects existing dealer
   network. Both run on the same product catalog. The "fire your
   distributor" infrastructure.
2. **Smart Postcards In The Mail** (Lob) — tractor-brand catalog for
   dealers, hunting-season checklist for end-buyers, back-to-school
   sports kit for parents. Mail steps work 3-5× better than email-only
   for B2B touch.
3. **Pick-Your-County Lead Finder** — clickable US county map → fresh
   leads land in inbox. Dealer territory expansion.
4. **Dealer / Distributor Partner Program** — signup page + per-audience
   script library (BUYER / PRO / SHOP). Commission tracking — flat fee
   or split (e.g. $50 retail / $250 dealer).

Build refs: `src/app/clients/zenith-sports/*` (Tekky anchor),
`src/app/clients/itc-quick-attach/*` (ITC anchor),
`src/lib/zenith-partners-script.ts`, `src/lib/itc-partners-script.ts`.

### Indie author bonus stack (5 modules — Bloodlines pattern)

1. **Interactive Book-World Showcase** — animated world map, character
   roster, magic-system explorer, parchment-style chapter reader,
   faction quiz. Each interactive feature is a newsletter capture
   point. Per Bloodlines: readers who play with these stay 3-5× longer
   than typical author sites.
2. **Amazon + Retailer Direct CTAs** — ASIN-aware buy buttons → Amazon,
   Apple Books, Kobo, IngramSpark. JSON-LD Book schema so each book
   gets Google's book carousel + author Knowledge Panel populates.
3. **Series-Aware Newsletter Capture** — different sequences for
   first-time visitors, book #1 finishers, pre-order signups, existing
   subscribers. Book-1-reader gets book-2 pitch, not generic welcome.
4. **Pre-Order + Launch Funnel** — book #2/#3 pre-order capture with
   countdown sequence. Email + text + retargeting until launch day,
   conversion-tracked through Amazon. Series-LTV math: one book-1
   reader → 5-10× lifetime value when properly funneled.
5. **Reader Retargeting** — pixel-tracked book-1 finishers who didn't
   pre-order book-2 → targeted ad sequence on Meta + Google. Lapsed-
   reader sequences run multi-year so when book-3 drops in 2 years,
   book-1 readers see it first.

Build refs: `src/app/clients/bloodlines/page.tsx` (Preston James
Hunsaker's Bloodlines saga — Phase 1 author anchor, 5 interactive
features all live).

### Auto-detection on intake

The vertical bonus stack auto-applies based on `prospect.category` or
`prospect.lookalikeCategory`:

| Category | Vertical | Bonus stack |
|---|---|---|
| `mfg-ag-equipment`, `mfg-sports-equipment`, `mfg-outdoor-gear` | manufacturer | INCLUDED_MFG (4 modules) |
| `indie-author` | author | INCLUDED_AUTHOR (5 modules) |
| anything else (legacy, edge case) | universal-only | flag for manual review — likely should be $997 tier instead |

**Pricing tier**: `pricingTier = "fullsystem"` — renders with the
gold $ badge in the dashboard. Same price ($10,000 base / $9,700 pay-in-full),
different module mix per vertical at no extra cost.

---

## Legacy section: "What the AI Package includes" (deprecated 2026-05-14)

This 8-item list above the Universal stack is the historical version
of the deliverables list. Kept for diff-history reference only. The
canonical list now lives on `/agency` page + the Vertical-split section
above.

1. Custom website
2. Google Ads — self-learning campaigns
3. Meta Ads — self-learning iterations per audience
4. Email + text + voicemail funnel (per audience)
5. Long-term SEO growth
6. Lead magnet (custom per business)
7. Logo revision if needed
8. Monthly performance reports

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

### Inbound — Madie books, Ben closes

As of 2026-05-06, **Madie is the primary inbound funnel** for AI Package
deals. Her appointment-setter script lives at `/dashboard/script` and
in `src/lib/partners-script.ts` (`MADIE_CALL_SCRIPT`). She runs the
discovery → website-or-backend pivot, books the 15-minute reveal call
on Ben's calendar, and earns $1,000 commission per backend close.

When a Madie-booked call hits Ben's calendar:
1. The booking notes carry her partner attribution code in the URL
   params (Calendly preserves them through to the webhook).
2. The webhook stamps `partner_attribution` on the prospect row.
3. On close, `partner_referrals` gets an `amount_cents = 100000` row
   in `owed` status.
4. Payout is GATED on the **Partner First-Payout Gate** (CLAUDE.md):
   signed IC agreement + W-9 + banking handle. Self-serve W-9 upload
   at `/partners/[code]/w9` — no payout until all three are filled.

If Ben is running his own discovery (not Madie-booked), he uses
HORMOZI_CALL_SCRIPT in the same file — same shape, different opener.

### Locked diagnostic question (default opener — added 2026-05-07)

The first beat after rapport on every $10k discovery call:

> *"If 500 new clients showed up at your business tomorrow, what would
> break first?"*

Use verbatim. Do not soften, paraphrase, or add a windup. The phrasing
forces the prospect to walk their operation step-by-step and surface
the actual bottleneck. Whatever they say first IS the clog to lead
with in the backend tour.

**Map the answer to one of 5 clogs** (5-Clog Automation Framework,
locked 2026-05-07 — full reference at
`aios/decisions/2026-05-07_5-clog-framework.md`):

| Prospect quote shape | Clog | Backend-tour lead |
|---|---|---|
| "couldn't answer fast enough" / "leads would fall through" | Speed to Lead | Auto inbound responder + missed-call texter + contact-form auto-SMS |
| "follow-up would die" / "reps don't do enough touches" | Follow-up & Nurture | Lifecycle email cron + NPS Day-14 + retention suite |
| "tons of past customers we never re-engage" / "CRM is a graveyard" | Database Reactivation | `database_reactivation` upsell SKU ($499) |
| "no idea what's happening day-to-day" / "reports take hours" | Internal Reporting | Monthly report cron + daily SMS digest + owner-portal dashboard |
| "drown in paperwork" / "manual data entry would crush us" | Document Processing | ⚠ Out-of-ICP — pivot to clog they name SECOND |

After they answer, confirm verbatim: *"So if I'm hearing it right —
the thing that breaks first isn't leads, it's [clog]."* Wait for the
nod, then lead the backend tour with the feature that fixes that clog.

The AIOS skill `discovery_question` (in
`aios/.claude/skills/discovery_question/SKILL.md`) returns the question
+ parsing guide on demand for any pre-call prep.

### Inputs
- Their existing website
- Brand voice doc (if they have one)
- Customer demo list / past sales data (if available)

### Outputs
- A `client_tasks` row list seeded for the new client
- `pricingTier` flipped to `fullsystem` in the BlueJays prospects table

### Audience taxonomy — look for the 3-anchor pattern

Locked 2026-05-06 across ITC + Zenith + Nevarland (3 anchors,
radically different verticals — steel ag / sports / kids' apparel).
Manufacturer-style clients consistently break into 3 audience segments:

| Segment | Who | Buying motion |
|---|---|---|
| **End-buyer** | The actual user/owner of the product | DTC, direct purchase from the brand |
| **Influencer** | The trusted advisor between buyer + product | Product recommendations, embedded in education |
| **Channel-partner** | Distributor / dealer / retailer | Wholesale orders, drop-ship, white-label |

When the client is a manufacturer, ask in discovery:
- Who buys directly? (end-buyer)
- Who recommends you to the end-buyer? (influencer — coaches, vets,
  contractors, financial advisors, etc.)
- Who resells you? (channel-partner — distributors, big-box retailers,
  Amazon FBA partners, regional reps)

### When 3 anchors isn't enough — segment the end-buyer

The 3-anchor pattern is the MINIMUM. Multi-channel manufacturers often
need to break the **end-buyer** anchor into sub-segments because the
buying motion + lead-magnet + ad creative differ wildly between them.

**ITC Quick Attach (Wave 4 example, locked 2026-05-06)** runs 6 audience
segments because their end-buyer splits cleanly along usage + brand:
- `hobbyist` — weekend tractor owner (SawBoss, toolboxes)
- `forester` — professional forester / commercial cutter
- `tym` — TYM tractor owner (highest-leverage upsell — 28+ T474 reviews)
- `hunter` — outdoor/firearm-mount buyer
- `dealer` — Cascade Tractor Supply-style channel-partner
- `community` — homepage testimonials, "real operators"

Phase 3 (funnel content) and Phase 6 (ad creatives) scale linearly with
segment count. Budget time accordingly:
- **3 segments**: 4-8 hours funnels + 1 day ads (the canonical baseline)
- **5-7 segments**: 8-16 hours funnels + 2 days ads (manufacturer-style)

Don't artificially compress 6 audiences into 3 — losing the segmentation
loses the headline-relevance lift. If a vertical genuinely needs 6, the
playbook scales; just plan for the extra week of bespoke content.

Each segment gets:
- Its own audience badge color in the lead inbox
  (parent=amber / coach=cobalt / player=lime / club=violet for Zenith
  — adapt for the specific client)
- Its own funnel sequence in `client-funnels/{slug}.ts`
- Its own ad creative angle in `client-ads/{slug}-creatives.ts`

If the client doesn't cleanly map to 3 segments, that's a flag —
either they're a single-audience B2C brand (skip the multi-audience
infrastructure) or they haven't done the discovery work yet (push
back, get them to articulate it).

See `decisions/2026-05-06_manufacturer_icp_3anchor_lock.md` (in aios)
for the full reasoning + the 3 anchor data points.

### Discovery warning signs (advisory — not deal-breakers)

These don't block a sale. They tell you to go in eyes-open and either
(a) raise scope/timeline expectations, (b) push back on weak signals
before contract, or (c) flag inside Notion/Tasks so the build team
treats the deal as elevated-risk:

- **Defensibility-score signal weak** — does the prospect's copy /
  product page name a specific manufacturing location, patent / trademark
  / fitment data, OR a named channel partner (dealer / distributor /
  influencer)? Aim for at least 2 of those 3 signals. Zero signals on
  all 3 = the prospect is a commodity reseller — cold paid will burn
  through ad-spend without conversions. Generic "Quality wholesale
  jewelry — call us today" copy fails this gate. (See CLAUDE.md Rule 71
  for the field + scoring concept; auto-compute logic still pending in
  `data-extractor.ts`.)
- **Audience taxonomy doesn't cleanly split into 3 classes** — if the
  prospect can't articulate end-buyer + influencer/decision-maker +
  channel-partner clearly, the 6-funnel build will overfit to 1-2
  audiences and the Hyperloop loop won't have enough variants to learn
  from. Either narrow scope (single-audience build, lower price) or push
  back to discovery and force the articulation.
- **No existing customer base / 0-1 closed deals** — the lead-magnet
  pair (Phase 5) is most powerful when seeded with REAL past-customer
  language (testimonial pulls, frequently-asked-questions, etc.). A
  prospect with 0 closed deals can still buy the System, but the first
  60 days will lean heavier on hypothesis than data.
- **Copy is voice-less or ghost-written** — if the brand voice doc is
  empty AND the existing site reads as generic SEO filler, expect to
  spend an extra 30 min per audience on Phase 3 funnel content because
  there's no authentic voice to mirror.

Treat these as inputs to the close conversation, not blockers. Most
deals can absorb 1-2 weak signals; a deal with all 4 weak signals is
worth pausing to re-scope.

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

### SEO Hardening (NON-NEGOTIABLE — Rules 68/69)

The root `app/layout.tsx` leaks BlueJays-homepage values into every
client showcase's `<head>` unless the per-page layout explicitly
overrides them. Without these overrides:
- Canonical URL points at `bluejayportfolio.com` (not the showcase)
  → Google treats the page as a homepage duplicate, never indexes it
- og:title / og:image / og:url all describe BlueJays
  → social shares (FB, iMessage, Slack, LinkedIn, Discord) display
    BlueJays branding, NOT the client's
- JSON-LD describes BlueJays as a ProfessionalService selling websites
  → no rich-result eligibility for the client's actual business

**Every `/clients/{slug}/layout.tsx` MUST override these 5 fields:**

1. `alternates.canonical` → page-specific URL
2. `openGraph` → full set (title/description/url/siteName/images/type)
3. `twitter` → card/title/description/images
4. `keywords` → client-/niche-/geo-specific (replace BlueJays-generic)
5. JSON-LD `<script>` with appropriate Schema.org type
   (LocalBusiness, Electrician, Plumber, Restaurant, Dentist, Contractor,
   etc.) + full structured-data fields

**Reference impl:** `src/app/clients/meyer-electric/layout.tsx` — pulls
SITE_URL + PAGE_PATH + HERO_OG_IMAGE constants at the top, full
openGraph + twitter overrides, embedded `Electrician`-typed JSON-LD
with all Schema.org fields (address, geo, telephone, priceRange,
areaServed array of cities, openingHoursSpecification, hasOfferCatalog
of services, identifier with state license #, sameAs to existing site).

**Sitemap entry MUST be added in the SAME commit:**
- Edit `src/app/sitemap.ts`
- Add the slug to `ACTIVE_CLIENT_SHOWCASES` array
- Priority 0.85 (high local-SEO value)

**Verify-after-deploy** (use curl, NOT Chrome MCP — it freezes on
heavy CSS animations):

```bash
curl -s https://bluejayportfolio.com/clients/{slug} \
  | grep -E '(canonical|og:title|og:image|og:url|twitter:title|application/ld\+json)' \
  | head -10
```

Every line should reference the client's URL/business name, NOT
`bluejayportfolio.com` or "BlueJays | Premium Web Design."

If you see `<link rel="canonical" href="https://bluejayportfolio.com"/>`
(no path) the override is broken or didn't deploy yet.

### Animated trade-illustration polish (optional — Rule 70)

For trade-category clients (electrician, plumber, HVAC, solar, lawn
care with seasonal calendars, etc.), the showcase site can ship 1-2
hand-tuned animated CSS diagrams that visually narrate the service:
- Powerwall: charge bar fills + lightning bolts strike + ring waves
- Generac: grid OFFLINE → arrow pulses → Generac RUNNING → home shimmer
- HVAC: airflow particles travel through ductwork
- Plumbing: water drop falls + pressure gauge needle moves

Pattern locked at CLAUDE.md Rule 70: pure CSS keyframes inside
`<style jsx>`, class names prefixed (`me-pw-` / `me-gen-` / etc.),
prefers-reduced-motion gated. Reference impl in
`src/app/clients/meyer-electric/page.tsx` (search `me-pw-` and
`me-gen-` class prefixes — 13 distinct keyframes, ~3KB CSS, zero JS).

**Why this matters at the AI Package price point:** $10K clients
expect bespoke polish that pure-template builds can't fake. A
hand-tuned animated diagram is the visual differentiator — reads
as "agency-built" without the agency-rate hours.

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

### TCPA-compliant SMS gate (NON-NEGOTIABLE — extends CLAUDE.md Rule 35)

Per-client SMS funnels MUST honor the same belt-and-suspenders consent
gate the BlueJays funnel does. TCR rejected the BlueJays A2P 10DLC
campaign twice (April + May 2026) for opt-in-language defects;
shipping a per-client SMS pipeline that doesn't replicate the same
defenses risks a third rejection AND exposes Client to TCPA liability.

**The contract** (per-client adaptation of Rule 35):

1. Every per-client `client_leads` row needs an explicit `sms_consent`
   boolean + `sms_consent_at` timestamp + `sms_consent_source` text.
   Add columns to the migration when standing up Phase 2 for the
   client.
2. The per-client funnel runner (`src/lib/client-funnels/runner.ts` or
   per-slug equivalent) MUST gate every SMS-channel send on:
   ```ts
   const smsAllowedForLead =
     lead.source === "inbound" &&
     lead.smsConsent === true;
   ```
3. The lead-capture form on `/clients/{slug}` MUST NOT make the SMS
   consent checkbox `required` — TCPA 47 CFR 64.1200(a)(7)(i) forbids
   making consent a condition of service. Phone is OPTIONAL on submit
   unless the SMS-consent box is ticked.
4. Checkbox copy MUST start with an "Optional" badge AND state
   explicitly: "Consent is not required to submit this form or receive
   a response." Reference wording is in `bluejays/src/app/get-started/page.tsx`.
5. Every outbound SMS MUST end with "Reply STOP to opt out". HELP
   replies must auto-respond with the business name + a privacy/terms
   link + a STOP reminder.
6. If the client doesn't have their own A2P 10DLC campaign approved,
   route SMS through the BlueJays campaign during the first 30 days
   (must use BlueJays-issued numbers) and migrate to the client's own
   approved campaign at handoff. Track campaign status in
   `client_subscriptions.metadata.a2p_status`.

**What does NOT count as consent:** scraped phone numbers, "the number
is publicly listed," past purchase history, employer-provided contact
info, anyone who didn't tick an explicit affirmative box on a form
written to TCPA standards. If in doubt, route to email + voicemail
only — never SMS.

**Operator action at every kickoff:** confirm in writing with Client
that THEY are responsible for verifying their lead capture sources
honor TCPA, and that BlueJays' build will REFUSE to fire SMS to leads
that don't carry the consent flags. Add a row to `client_tasks`:
"Confirm SMS consent capture path — only fire to opted-in inbound
leads."

---

## Phase 5 — Lead magnets (~1 day per client)

Standard archetypes:
- **Coach guide / playbook** (B2B PDF) — see `zenith-sports/training-guide`
- **Camp finder / locator** (consumer geo lookup) — see `zenith-sports/camps`
- **Product story / origin** (brand) — typically baked into showcase
- **Configurator + gated reference doc PAIR** (manufacturer-ICP — see below)

For PDF-style lead magnets, build a printable HTML page (not a real PDF)
at `/clients/{slug}/{magnet-name}`. Wire the EmailCapture component's
`successCta` prop to its URL for instant access on form submit.

### Configurator + reference doc pair (canonical manufacturer-ICP play)

Locked 2026-05-06 across the 3 manufacturer anchors (ITC + Zenith +
Nevarland). Every product-business client gets TWO complementary lead
magnets that map cleanly to two of the three audience classes from
Phase 0.5:

**1. Interactive configurator → end-buyer audience** — a "Build Your X"
tool that lets the visitor co-construct their own version of the
product. The reveal at the end is a personalized recommendation +
lead-capture + auto-route into the matching segment funnel.

**2. Gated professional reference doc → influencer / channel-partner
audience** — a substantive PDF or printable HTML page (coaching plan,
wholesale catalog with margin math, methodology guide, dealer pack)
that an industry pro would actually want on their desk. Email-gated.

Why pairs win for manufacturers: a single archetype only converts ONE
audience. A configurator alone misses the coach / dealer / vet who
recommends the product. A whitepaper alone misses the end-buyer who
just wants to play. The pair captures both intent levels in one
launch — and both feed segment-routed funnels under Phase 3.

**Anchor reference examples:**

| Anchor | Configurator | Reference doc |
|---|---|---|
| ITC Quick Attach | "Build Your Dream Tractor" — toggle accessories on a real tractor SVG, live price + parts-fit summary, auto-routes by tractor brand | Wholesale dealer catalog with 35–40% margin math, MAP-pricing protection, Cascade Tractor Supply peer-proof letter |
| Zenith Sports / TEKKY | "Build Your Player" — skill tier × age bracket character builder w/ rendered PNG cards, height + years-to-mastery chips | TEKKY Coaching Plan — 26 drills, ECNL/MLS-Next credibility, Touch-per-minute methodology, 60-second BAE drill video |
| Nevarland Outpost (kids' apparel) | TBD on enrichment — likely "Find Your Style" matchmaker (cottagecore / vintage Americana / neutrals × age × occasion → curated bundle) | TBD — likely a buyer's guide for boutique resellers (handmade-in-USA story, organic-cotton sourcing, gift-shop wholesale terms, small-MOQ pricing) |

**Build pattern for a new client:**

1. Discovery call — surface the end-buyer's biggest co-build moment
   (what do they actually want to customize?) AND the influencer's
   biggest "send me the deck" moment (what reference would make them
   recommend the brand?). Two distinct asks, two distinct outputs.
2. Configurator: build as a Next.js client component at
   `/clients/{slug}/build-your-{thing}` with PNG / SVG layered visuals,
   live state, and a final form that POSTs to `/api/clients/inquire`
   with audience tagged as `end-buyer`.
3. Reference doc: build as a printable HTML page at
   `/clients/{slug}/{ref-doc-slug}` gated behind an EmailCapture
   component that POSTs with audience tagged as the influencer or
   channel-partner class (whichever the doc is written for).
4. Wire BOTH magnets into Phase 3 funnels — the configurator submission
   triggers the end-buyer cadence, the reference-doc capture triggers
   the influencer cadence.
5. Drop on the showcase hero AND on the audience-specific
   landing-page nav; they should be impossible to miss.

This pair IS the productizable manufacturer-ICP deliverable surfaced
in `aios/PRO_SYNTHESIS.md` and named explicitly in § 2(p) of the
Service Agreement. Don't skip the pair on a manufacturer client.

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

### NEVER pitch active customers (NON-NEGOTIABLE)

Any sales-portal / cold-outreach selection mechanism that feeds the
ads pipeline (or the Madie-style appointment-setter flow) MUST exclude:
- Paid customers (`status='paid'`)
- Live-site clients (`siteLiveAt IS NOT NULL`)
- Custom-tier clients (`customSiteUrl IS NOT NULL`)
- Deployed/DNS-transferred clients (`status IN ('live','deployed','dns_transfer')`)

Hard exclusion (filter row OUT entirely from selectable lists), NOT
visual dim/strikethrough. Cold-pitching an existing customer kills the
relationship instantly — the ad-creative + appointment-setter pipelines
must never surface them as targets.

Reference impl: `src/app/dashboard/script/LeadPicker.client.tsx` —
Madie's lead-picker filters out active customers at the database query
level, not the render layer. Copy that pattern for any new sales/ads
selection surface.

This is locked as AIOS working principle #10 (`aios/CLAUDE.md`).

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

### Capacity scarcity is real — drop it on the close

BlueJays caps at **30 sites/month + 10 backend (AI Package) builds/month**.
This is real (Ben's bandwidth, not marketing fiction) and is the
strongest closing lever in the script. Drop it ONCE on the discovery
call when a prospect is hesitating:

> "One thing — Ben does 30 sites a month max, and only 10 of these
>  backend systems. We still have a few spots left this month."

Don't say it twice (feels desperate). Don't fake it (says all 10 are
gone if 4 are gone). When the cap is genuinely hit for the month, push
the client to next month's batch — that scarcity is more valuable than
a rushed build.

The cap is also why `prospects.status = fullsystem_inquiry` matters —
it's how Ben tracks the backend pipeline against the 10/month ceiling
before close.

### Launch-day artifacts (NON-NEGOTIABLE — locked 2026-05-18 after Tekky)

The first AI System client launch (Tekky / Zenith Sports, 2026-05-18)
shipped a packet of 4 PDFs + 3 sign URLs + a payment CTA flow. That
pattern is now the standard for every $10k client. NEVER re-derive
it ad-hoc — copy-extend the Tekky scaffolding instead.

#### The 4 PDFs per client

Generated by `scripts/generate-zenith-onboarding-pdfs.py` (clone +
customize per client). All land in `public/clients/[slug]/pdfs/`.

| PDF | Audience | Sign URL? |
|---|---|---|
| `[slug-prefix]-onboarding-handoff.pdf` | Client | ✓ `/sign/[slug]/handoff` |
| `[slug-prefix]-brand-voice.pdf` | Client | ✓ `/sign/[slug]/brand-voice` |
| `[slug-prefix]-walkthrough-prep.pdf` | Ben (internal) | ✗ |
| `[slug-prefix]-sunday-cutover.pdf` | Ben (internal) | ✗ |

Plus the **shared SLA** at `public/onboarding/bluejays-sla.pdf`
(generated by `scripts/generate-sla-pdf.py`). Registered per slug in
`onboard-docs.ts` so every client gets their own ack row, but the PDF
file is one. Sign URL: `/sign/[slug]/sla`.

#### The 3 sign URLs sent to the client

After registering in `src/lib/onboard-docs.ts`, the URLs auto-wire:
- `https://bluejayportfolio.com/sign/[slug]/handoff` (welcome packet +
  extraQuestions + value-proof + payment CTA)
- `https://bluejayportfolio.com/sign/[slug]/brand-voice` (voice rules ack)
- `https://bluejayportfolio.com/sign/[slug]/sla` (service-level ack)

NEVER send the raw PDF URL (`/pdfs/...`). Always send the `/sign/...`
URL — it embeds the PDF + captures the acknowledgment + fires SMS to
Ben + adds the value-proof strip above the embed.

#### onboard-docs.ts schema (extended 2026-05-18)

The OnboardDoc registry entry for an AI System client's handoff doc
MUST include all four optional fields below. Brand-voice + SLA entries
typically skip `valueProof` and `paymentLinks` (those belong on the
handoff entry).

```typescript
{
  slug: "[client-slug]",
  doc: "handoff",
  title: "Owner Onboarding Packet",
  brand: "[BRAND NAME] · [Legal entity]",
  pdfPath: "/clients/[slug]/pdfs/[prefix]-onboarding-handoff.pdf",
  alertSubject: "[Brand] onboarding signed",
  description: "Welcome packet for [Owner name] — ...",

  // 12+ launch-day questions: account permissions, voicemail date,
  // existing accounts to take over, customer list import, ad geography,
  // business hours, card-on-file (with presets), etc.
  extraQuestions: [
    { id, label, placeholder, presets?: string[] },
    ...
  ],

  // First impression = VALUE, not paperwork. 5-6 outcome bullets
  // customized to this client's vertical/numbers.
  valueProof: {
    headline: "Everything already running for [BRAND]",
    subhead: "Live on [domain] today ([day] [date]). ...",
    bullets: [
      { title: "Bespoke [domain]", detail: "..." },
      { title: "[N] leads pre-loaded + color-coded", detail: "..." },
      { title: "[N] ad creatives + [N]-touch funnels", detail: "..." },
      // ALWAYS include the SEO bullet — it's the long-tail value lever
      { title: "SEO that compounds (the long-tail engine)", detail: "llms.txt + JSON-LD + lead-gen feedback loop ... $1.5k/mo byproduct framing" },
      { title: "Tracking layer already firing", detail: "Clarity + Pixel + GA4 ..." },
      { title: "AI Reply Drafter + [client-specific automation]", detail: "..." },
    ],
  },

  // Pricing MUST mirror the PDF pricing table. PDF is single source of
  // truth; CTAs are the in-page action. Empty url => placeholder state.
  paymentLinks: [
    {
      label: "Pay Q1 — $2,500",  // amount matches PDF installment row
      url: process.env.STRIPE_PAYMENT_LINK_[CLIENT]_Q1 || "",
      description: "Quarterly installment 1 of 4 — the launch payment. Unlocks Phase A build work the business day funds clear.",
      badge: "Due at launch ([day] [date])",
      primary: true,
    },
    // For pay-in-full closes only: add a second link with label "Pay
    // full $9,700 (save $300)" pointing at STRIPE_PAYMENT_LINK_[CLIENT]_FULL
  ],
}
```

#### Pricing-alignment rule (NON-NEGOTIABLE)

The pricing table inside the PDF is the single source of truth. Every
in-page CTA (payment links, value-proof bullets, sign-form copy) MUST
mirror those numbers exactly. If you change the PDF pricing, update the
sign page CTAs in the same commit. Mismatch = trust killer.

For the standard AI System tier (locked 2026-05-16):
- Base: **$10,000** total
- Installment plan: 4 × **$2,500** quarterly (Q1 due at launch)
- Pay-in-full: **$9,700** ($300 discount, NOT applied to installment plans)

#### Stripe Payment Link env-var convention

```
STRIPE_PAYMENT_LINK_[CLIENT_SLUG_UPPER]_Q1  =https://buy.stripe.com/...
STRIPE_PAYMENT_LINK_[CLIENT_SLUG_UPPER]_FULL=https://buy.stripe.com/...
```

Set on Vercel Production AND in local `.env.local`. Empty env var →
the sign page renders a clear placeholder ("Stripe Payment Link not
yet wired — Ben will text you the link directly during the call")
instead of a broken button.

Stripe Dashboard → Payment Links → New:
- Product: `[BRAND] AI Marketing System — Q1 of 4`
- Price: `$2,500.00 USD, one-time` (or $9,700 for FULL)
- Collect: name + email
- Receipt text: `Quarterly installment N of 4 — AI Marketing System buildout for [BRAND].`

#### Launch-date sync checklist

When a launch slips (Tekky moved from Sunday 2026-05-17 → Monday
2026-05-18), update ALL of these in the same batch:
- [ ] PDF generator script — cover pages, pricing schedule table, walkthrough copy
- [ ] `onboard-docs.ts` — value-proof `subhead` + payment badge `badge`
- [ ] `memory/project_[client].md` — `status_updated` + launch date
- [ ] `memory/active_commitments.md` — strike old date, add new
- [ ] `memory/recent_locked_decisions.md` — log the slip
- [ ] CLAUDE.md "Client Tenant Status" table — Notes column

The SLA `effective` date auto-syncs via `date.today()` in the generator
— re-run the script on launch day, it picks up today.

#### Sign-form UX rules (locked 2026-05-18)

Every `/sign/[slug]/[doc]` page enforces these:
1. **Submit button disabled until required fields filled** (name +
   acknowledgment checkbox). Renders `disabled:bg-slate-800
   disabled:text-slate-500 disabled:cursor-not-allowed`.
2. **Helper text shows what's missing**: "Fill in your name and the
   acknowledgment checkbox to enable submit."
3. **Button text reads "✓ Completed — submit & notify Ben"** — clearer
   completion semantic than "Submit".
4. **Autosave to localStorage** keyed by
   `bluejays:sign-draft:[slug]:[doc]`. Restores on reload with a
   "Picked up where you left off" banner + "Start fresh" reset.
5. **Preset chips** on long-form questions (card-on-file etc.) with
   the action-oriented option FIRST and "Will get later" SECOND — nudge
   toward yes while leaving the punt path open.
6. **Success state reinforces the primary payment CTA** — never lose
   the payment-link CTA after submit. The success message links the
   client straight to Stripe.

#### Pre-launch visual verification

Before sending any sign URL, render every PDF page to PNG and inspect
visually. Use `pypdfium2`:

```python
import pypdfium2 as pdfium
from pathlib import Path
pdf = pdfium.PdfDocument('public/clients/[slug]/pdfs/[file].pdf')
for i, page in enumerate(pdf):
    page.render(scale=1.5).to_pil().save(f'/tmp/check-p{i+1}.png')
```

Look for: table headers white-on-navy (not black-on-black), amber
callouts not overlapping the line above, all "Target length" /
section labels visible, signature lines fillable.

Then load `/sign/[slug]/handoff` in the browser and verify:
- Value-proof strip renders above the PDF (6 bullets in 2-column grid)
- Submit button disabled initially
- Type name + check ack → button enables
- Click preset chip → input fills
- Payment CTA section at bottom (or placeholder if env var unset)

#### ReportLab PDF generator gotchas (locked 2026-05-18)

Discovered the hard way on the Tekky launch:
1. **Table header text on dark backgrounds**: `TableStyle.TEXTCOLOR`
   CANNOT override a `Paragraph`'s baked-in `textColor`. Use a
   dedicated white-text style (`body_head` / `BODY_HEAD`) for header
   cells. Setting `BACKGROUND=NAVY + TEXTCOLOR=WHITE` is NOT enough.
2. **`quote_amber` overlap**: `borderPadding=10` extends the amber
   box 10pt above its text. `spaceBefore` MUST be ≥ 14 (= 10 padding
   + 4 visible gap) or the box covers the line above. Tekky launch
   shipped with `spaceBefore=4`; we caught it post-launch.
3. **Long subsections orphan across pages**: wrap any multi-bullet
   section (h3 + 4+ bullets) in `KeepTogether(seo_block)` to force
   header + bullets onto one page. Otherwise the header sits alone
   at the bottom of one page with the bullets stranded on the next.
4. **`FillLine` Flowable pattern** (in zenith script) is the canonical
   way to render a clickable AcroForm text field overlaid on a hairline
   rule — works in any PDF reader (Preview/Acrobat/Edge/Chrome) AND
   prints cleanly. Reuse for any client signature, date, or fillable
   field. Don't re-implement.

### Partner attribution — the payout gate

If the close came through a partner (Madie or any future appointment-
setter), payout follows the **Partner First-Payout Gate** in CLAUDE.md:
- Signed IC Agreement (`docs/contracts/<Name> - Independent Contractor Agreement.md`)
- W-9 on file (`partners.w9_received_at IS NOT NULL` — partner uploads
  via `/partners/[code]/w9`)
- `partners.payout_handle` populated

Until all three are filled, the payout is parked in `owed` status. Send
the partner the W-9 link the moment the deal signs so the gate clears
in parallel with the build sprint, not after.

---

## Phase 9 — AI Operator (skills library + scheduled workflows)

The flagship feature the $10,000 + monthly tier earns. Replaces the
v1 static "AI Skills" calculator tools with a real per-client agentic
Claude system. Ships as Service Agreement § 2(q). Locked spec
2026-05-06 — see `bluejays/CLAUDE.md` "Locked decisions cascade
forward as defaults" rule.

### What every Client gets (5-skill library, locked)

1. **Lead Reply Drafter** — owner types/voices "draft a follow-up to
   the [name] lead, mention [context]"; agent reads CLAUDE.md +
   client_leads + last 6 outbound messages, drafts in plan-mode,
   shows preview, owner taps Send / Save Draft / Edit. Re-uses the
   existing `src/lib/ai-responder.ts` infra.
2. **Quote Drafter** — agent ingests a lead + the client's last 3
   winning quotes + standard pricing → drafts a fully-formatted PDF
   quote with cover letter. Plan-mode confirms before render.
3. **Weekly Digest Author** — replaces the static Monday digest with
   an interactive author. Owner can ask follow-up questions ("which
   counties slowed down?", "draft a post about the Davis close").
4. **Customer Save Agent** — fires when a churn signal hits (payment
   failed, repeat-customer 90-day silence, NPS detractor). Drafts a
   personal save-the-deal message in the owner's voice. Always
   plan-mode + preview.
5. **Client-selected skill** — one (1) skill of Client's choosing
   tuned to their recurring workflow. Common picks: Quarterly Check-
   in (commercial), Storm-Trigger Campaign (electrical), Booking
   Reschedule (services), Wholesale Order Builder (manufacturer).

### Per-client artifacts (Phase 9 specific)

```
src/lib/client-skills/{slug}.ts                # per-client skill registry
src/lib/client-claudemd/{slug}.md              # Client's brand-voice CLAUDE.md
supabase/migrations/{date}_client_skills.sql   # DB schema (see below)
```

### DB schema (locked)

- `client_skills` — slug, skill_id, name, description, prompt_template,
  enabled, version, updated_at
- `client_skill_runs` — id, client_slug, skill_id, owner_id, input,
  plan, output, plan_approved, sent, cost_cents, latency_ms, created_at
- `client_scheduled_skills` — id, client_slug, skill_id, schedule_natural
  ("every Monday 7am"), schedule_cron (resolved), last_run_at, next_run_at,
  enabled, owner_id

### Locked operational rules (Q1-Q12 answers 2026-05-06)

- **Voice input** — text-only for V1. Voice (Web Speech API) lands V2 once
  Anthropic's native `/voice` ships broadly. Mock the voice button on
  client portals + Meyer demo so the roadmap is visible (Q3D).
- **Pricing model** — bundled into Section 4.5 ongoing support fee. No
  per-call billing visible to Client. Soft cap with notification at 80%
  monthly Anthropic spend; tier-upgrade prompt at 100% (Q4A + Q11B).
- **Skills library storage** — DB-backed (`client_skills` table) AND
  per-Client GitHub export so Client sees their skills as readable .md
  files matching Anthropic's pattern (Q5C). Path:
  `<bluejays-client-skills>/{slug}/skills/*.md`.
- **Plan-mode default** — ON for irreversible actions (send email, send
  SMS, dispatch call, register domain, charge card, modify ad budget).
  OFF for read-only (drafting, summarizing, querying). Owner-toggleable
  in portal Settings (Q6B).
- **Screenshot self-verify** — ON for outbound communications only
  (email preview render, SMS render check, postcard preview). OFF for
  internal-only outputs (Q7A).
- **Scheduled workflows** — Ben curates 5 canonical schedules per Client
  at onboarding (Monday digest / Wednesday lead-quality summary / Friday
  win-recap / 1st-of-month KPI / quarterly check-in). Owner can add
  custom natural-language schedules via portal Settings tab (Q8C).
- **Voice + outbound SMS interaction** — voice input can DRAFT SMS only,
  never auto-send. Owner must tap-confirm. Preserves Rule 35 belt+
  suspenders (smsConsent + source=inbound) gate (Q12A).

### Cost ceiling per Client (rough)

Assuming a Client uses skills ~50 times/month at average ~5K input +
1K output tokens per call, on Sonnet 4 ($3/MTok in / $15/MTok out):
- ~$0.022 per call × 50 = ~$1.10/mo at light usage
- ~$0.022 × 500 = ~$11/mo at heavy usage
- Heavy + Quote Drafter (more tokens) = realistic ceiling ~$25/mo

Soft cap defaults: Starter $20/mo · Pro $50/mo · Unlimited $200/mo.
Maps cleanly onto existing `client_subscriptions` Claude tiers.

### Build sequence (3-4 week prod buildout)

**Wave 1 (Days 1-7):**
1. Migration: `client_skills` + `client_skill_runs` + `client_scheduled_skills`
2. API: `POST /api/client-portal/skills/run` with plan-mode + screenshot-verify
3. Type + skill-registry pattern (mirror `client_funnels/registry.ts`)
4. Wave 1 skill: Lead Reply Drafter — wired to existing AI Responder
5. Owner-portal AI Skills tab refactor on Zenith (first prod client)
6. Soft-cap usage tracker + 80% notification email

**Wave 2 (Days 8-14):**
7. Quote Drafter
8. Weekly Digest Author
9. Customer Save Agent
10. Client-selected skill scaffolding (Ben fills per client at onboarding)
11. /loop scheduled workflows infra (cron + natural-language schedule editor)

**Wave 3 (Days 15-21):**
12. Per-Client CLAUDE.md authoring tool (Ben edits via internal admin →
    saved to DB → exported to GitHub)
13. Per-Client GitHub export pipeline
14. Mobile-portal optimizations (touch-first skill drawer)
15. 3-anchor validation prep (Zenith + ITC + 3rd AI Package client)

**Wave 4 (Days 22-28):**
16. Voice input wiring (Web Speech API V2)
17. Documentation + per-Client onboarding playbook for the 5-skill library
18. Lock spec into BlueJays Pro tier (post-3-anchor)

### Mock version on Meyer demo (sales asset, not real impl)

Meyer Electric is custom-tier ($100/yr), NOT an AI Package client — but
the portal-demo at `/clients/meyer-electric/portal-demo` is a sales
artifact for prospects. Adds a 4th card to the AI Skills tab labeled
"AI Operator (NEW)" with a mock Lead Reply Drafter flow. Pure mock data
per Q8=A; no API calls fire. Demonstrates the locked spec to prospects
on sales calls before the real implementation lands on Zenith.

### Productization seed (per Rule 64)

Logged in `aios/PRO_SYNTHESIS.md` as "BlueJays Pro: AI Operator with
custom CLAUDE.md + skills library + voice + /loop." Treat as the
flagship Pro-tier feature. Do NOT lock the spec into Pro tier marketing
until 3-anchor validation hits (Rule 67) — need 3 AI Package clients
adopting before declaring this the Pro centerpiece.

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
- **Content fidelity when porting from a real source (NON-NEGOTIABLE).**
  When the directive is "use the real source content" (their existing
  site, their voice doc, their case studies), refuse to fabricate. If
  a claim isn't in the source, soften or remove — never invent
  specifics. Specificity gaps are TBD-able; invented claims poison
  trust forever. Default behavior on every port: scrape source, diff
  against derivative, surface fabrications, soften. Locked as AIOS
  working principle #9 after the Olympic Inspections rebuild stripped
  fabricated "AIHA-LAP labs / 10-25 page PDF / homes over 30 years
  old" claims that weren't in the original `pineparticle.com` source.
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
- **NEVER nest interactive form controls inside a `<button>`** — a
  `<input type="checkbox">` (or any `<input>`) inside a parent
  `<button>` is invalid HTML. Browsers proxy click events into the
  inner control AND React surfaces the click on both — so any tap on
  the row fires the checkbox `onChange`, marking it "done"
  unintentionally. Always split into sibling elements with their own
  click handlers (label+input vs separate button), or use `pointer-
  events-none` on the inner control if it's truly decorative. Bug
  found in TaskCard 2026-05-04 — two Zenith tasks were auto-completed.
- **Long stat tile values break layout in 3-column grids** — `text-3xl
  + tracking-tighter` will wrap on hyphens (e.g. "Match-day"). Use a
  non-breaking hyphen `‑` (U+2011) + `whitespace-nowrap` and/or step
  down a font size (text-2xl) so all values sit on one line. Pair with
  `flex flex-col + min-h` to lock equal tile heights regardless of
  content length.
- **Long-tail age sliders need to handle adult bracket** — a
  "Build Your Player" / character-builder age slider that maxes at 18
  excludes adult-league players and returning amateurs. Extend to 35
  and switch the display from `U-{age}` to `Adult · {age}` for ≥24.
  Pattern in `build-your-player/page.tsx`.
- **Never let raw Postgres errors leak to clients (NON-NEGOTIABLE)** —
  caught during 2026-05-04 funnel review. Bad ids passed to bulk
  endpoints were producing 500s with `"invalid input syntax for type
  uuid"` text exposed to the caller. Fix pattern (now mandatory on
  every portal API endpoint):
    1. UUID-validate every path param + every id in a bulk array
       BEFORE the DB call.
    2. Validate `action.kind` (and nested fields like `action.status`,
       `action.channel`) BEFORE the DB read on any discriminated-union
       endpoint. Don't burn a query on a bogus action.
    3. No user-reachable code path should return 500 with a raw
       Postgres error. Input-shape failures = 400 + friendly string.
       Internal failures = 500 + generic message; real error logged.
  See `Owner Portal Rules → 4a` in CLAUDE.md for the canonical regex
  + code snippets. Applied across all `client-portal/[id]` routes
  + `client-portal/{leads,tasks}/bulk` in commit aa19d06.
- **Sticky-nav anchors must match real ids (NON-NEGOTIABLE)** — every
  href like `/clients/{slug}#section` must resolve to a real
  `id="section"` somewhere in the page DOM. Run a quick crawl script
  before launch (one already in
  `funnel-review/audit-anchors.js` pattern). Broken anchors fail
  silently — visitor clicks, page does nothing, conversion lost.
- **Vertical section padding standard** — `py-20 sm:py-24 lg:py-32`
  for content sections (hero + final CTA may go heavier). See the
  "Vertical Padding Standards" rule in CLAUDE.md for the math.
  Default Tailwind starter templates often use `py-28 sm:py-36
  lg:py-44` which feels luxurious but eats ~640px of mobile scroll
  on a typical 10-section showcase. Don't ship heavy by default.
- **Custom-domain rewrites need a `CLIENT_DOMAIN_MAP` entry** —
  see `src/middleware.ts`. Whenever a client transfers their domain
  to Namecheap + points DNS at Vercel, the domain serves the
  bluejays homepage by default. Map it to their showcase path
  (`/clients/{slug}` for custom/fullsystem, `/preview/{prospect-id}`
  for template/standard). Rule covered in CLAUDE.md.
- **Vercel 404 cache stickiness** — if you push assets in a deploy
  and the corresponding URL was previously hit and 404'd, Vercel
  edge will keep serving the cached 404 even after the new deploy
  lands (saw this with the avatar PNGs). Push a no-op empty commit
  (`git commit --allow-empty`) to force a fresh build that
  invalidates the cache. The redeploy itself takes ~60-90s.
- **Root layout SEO leak (NON-NEGOTIABLE — Rules 68/69)** — caught
  during the 2026-05-06 Meyer Electric audit. Without per-page
  metadata override, EVERY client showcase ships with:
    - Canonical pointing at `bluejayportfolio.com` → Google treats
      the page as a homepage duplicate, never indexes it
    - og:title / og:image / og:url describing BlueJays → social shares
      display BlueJays branding, NOT the client's
    - JSON-LD describing BlueJays as a ProfessionalService
  This is silent + catastrophic. Verify-after-deploy curl recipe:
  ```bash
  curl -s https://bluejayportfolio.com/clients/{slug} \
    | grep -E '(canonical|og:title|og:image|og:url|application/ld\+json)' \
    | head -10
  ```
  Every line MUST reference the client's URL/business name. If you
  see `bluejayportfolio.com` (no path) in `<link rel="canonical">`
  or "BlueJays | Premium Web Design" in og:title, the override is
  broken.
- **Sitemap drift (NON-NEGOTIABLE — Rule 69)** — every new
  `/clients/{slug}` page MUST be added to `ACTIVE_CLIENT_SHOWCASES`
  in `src/app/sitemap.ts` in the SAME commit. Otherwise Google can't
  discover the page from sitemap crawl. Verify after deploy:
  ```bash
  curl -s https://bluejayportfolio.com/sitemap.xml \
    | grep -oE '<loc>[^<]*clients[^<]*</loc>'
  ```

---

## Cross-cutting patterns from Meyer Electric (custom-tier bespoke build)

Patterns shipped 2026-05-06 on Meyer Electric (a $100/yr custom-tier
client, NOT a $10K AI Package client). Every pattern below transfers
cleanly to AI Package showcase sites and should be considered the
"polish standard" for any bespoke `/clients/{slug}` build.

### Animated trade-illustration diagrams (Rule 70)
Powerwall + Generac diagrams on Meyer's deep-dive sections. 13 distinct
CSS keyframes total, ~3KB CSS, zero JS overhead. Pattern:
- Pure CSS keyframes inside `<style jsx>` (no framer-motion runtime,
  no Lottie, no GIFs)
- Class names prefixed with section identifier (`me-pw-` / `me-gen-`)
  to prevent collisions
- Wrap every animation in `@media (prefers-reduced-motion: reduce)`
  that disables them cleanly
- Animations must NARRATE the user's mental model — Powerwall's
  charge bar fills 0→100%, Generac's energy pulse travels Grid →
  ATS → Home, switch icon rotates ±2° like a real ATS lever

For trade clients (electrician, plumber, HVAC, solar, lawn care)
ship 1-2 hand-tuned animated diagrams as polish at the AI Package
price point. Reference impl: `src/app/clients/meyer-electric/page.tsx`.

### Recolored client logo (SVG inline pattern)
When the client's existing logo doesn't fit the new dark theme but
you want to honor the brand identity, recreate the mark as inline
SVG with the new palette. Reference: `meyer-mark.tsx` — original
blue+white plug-in-circle → yellow→orange gradient circle with black
plug. Each instance gets a unique gradient ID (uniqueId counter
pattern) so multiple instances on the same page don't collide.

Apply when:
- Client's existing logo is a JPEG/PNG with white background that
  clashes with a dark theme
- The brand glyph (plug, wrench, leaf, paw) is recognizable enough
  to recreate as a 64×64 SVG
- You don't have time to design a whole new logo from scratch

Don't replace with a generic Phosphor icon — that loses brand identity.

### ~1/3 padding reduction default
The CLAUDE.md "Vertical Padding Standards" guidance. Apply to every
new bespoke build:
- Sections: `py-14 sm:py-16 lg:py-20` (instead of py-20 sm:py-24 lg:py-32)
- SectionHeader margin-bottom: `mb-8 sm:mb-10` (instead of mb-12 sm:mb-14)
- Internal grid gaps: `gap-8 lg:gap-12` (instead of gap-10 lg:gap-16)

Saves ~720px page height (~11%) on a typical 10-section showcase.
Mobile scroll-velocity gain is significant.

### Photo dedup audit before shipping (Rule 1.5)
After integrating real client photos, run a JS audit in browser
console:
```js
const counts={};Array.from(document.querySelectorAll('img'))
  .forEach(i=>{const s=(i.currentSrc||i.src);counts[s]=(counts[s]||0)+1});
console.log(Object.entries(counts).filter(([_,c])=>c>1));
```
ANY entry with count > 1 = Rule 1.5 violation. Restructure to use
icon-led visuals OR get more unique photos. Caught a 3-image
duplication on Meyer that would have shipped otherwise.

### Even out columns when one side has a tall photo
If you put a portrait photo in one column of a 2-col grid, the
opposite column ends short → visible void next to the photo. Fix
by adding balancing content (CTA + license/trust strip) so both
columns end at the same vertical position. Reference: Why-Us section
on Meyer Electric (commit `4345774` for the exact pattern).

### Mobile menu sibling-of-header (containing-block fix)
Already documented above under Phase 1 + Zenith gotchas. Confirmed
again on Meyer 2026-05-06 — the `<header>` element's
`backdrop-blur-md` (which compiles to `filter: backdrop-filter`)
creates a containing block for fixed descendants. The `position: fixed`
mobile menu rendered inside the header gets pinned to the header's
64px height, NOT the viewport. Fix: hoist the menu div up to be a
SIBLING of `<header>`, both wrapped in a fragment.

---

## Domain Onboarding Checklist (when a client transfers their domain to Namecheap)

Standard sequence after the registrar transfer completes:

1. **Namecheap → Domain List → Manage → Domain tab → Nameservers**:
   change "Custom DNS" to "**Namecheap BasicDNS**". Save (✓).
2. **Advanced DNS tab** — delete any old Squarespace/Wix records,
   add:
   ```
   A Record       @       76.76.21.21
   CNAME Record   www     cname.vercel-dns.com
   ```
3. **Redirect Email tab** — add forwards:
   `info@theirdomain.com` → their personal email,
   plus `contact@`, `hello@`, etc. as aliases.
4. **Vercel** → bluejays project → Settings → Domains → Add
   `theirdomain.com` AND `www.theirdomain.com` (set www to redirect
   to root). Vercel auto-issues SSL.
5. **Add `CLIENT_DOMAIN_MAP` entry** in `src/middleware.ts` mapping
   the apex domain to their showcase path. Push.
6. **Set per-client owner email env** on Vercel:
   `{SLUG_UPPER}_OWNER_EMAIL=their@email.com` so contact-form
   submissions email them directly.
7. **Verify in incognito**: `https://theirdomain.com` loads showcase,
   `/sitemap.xml` returns valid XML, contact form submits and
   delivers to their inbox.
8. **Submit / re-verify Google Search Console** — DNS TXT record
   verification, submit the new sitemap. If they had a GSC property
   before (e.g. from Squarespace), re-verify with the token now at
   their new registrar; old impressions data carries over since
   the domain is unchanged.
9. **Audit old URLs** if migrating from a prior site — list every
   path the old site had (`/services`, `/contact`, etc.) and
   either match them on the new showcase or 301-redirect via Vercel
   rewrites (preserves Google rank + external backlink value).

Each step is also a row in `client_tasks` for the client (cf. the
`20260507_zenith_*` and `20260504_hector_landscaping_*` migrations
for the canonical seed pattern).

---

## Avatar / Character-Builder Pattern (when a client wants a "Build Your X" tool)

Reference: Zenith TEKKY's "Build Your Player" character builder.

### What works (canonical pattern)

1. **Use rendered PNGs, not SVG** — premium 3D / Pixar-style character
   cards key the user's inputs (skill tier × age bracket × etc.) to a
   manifest of pre-rendered images. SVG hits a quality ceiling fast;
   2K PNG cards look like a $59 product mockup.
2. **Manifest at `/src/data/{client}-avatars.json`**, assets at
   `/public/avatars/{client}/{NN}_{tier}_{age}.png`. Filename
   convention `seqNN_tierSlug_age_brackets.png` lets you compute the
   filename deterministically from inputs.
3. **3:4 portrait aspect** — match container aspect ratio to image
   aspect for edge-to-edge fill. Pattern:
   ```jsx
   <div style={{ aspectRatio: "3 / 4" }}>
     <Image fill className="object-cover" ... />
   </div>
   ```
   No letterbox, no crop, no white seam — when source = container
   aspect, object-cover is a 1:1 fit.
4. **Cross-fade on swap** — wrap with `key={filename}` + inline
   `@keyframes` animation (opacity 0→1 + scale 1.04→1, 350ms
   ease-out). Reads as a soft camera-focus pull, not a hard pop.
5. **Things to BAKE INTO the cards** (so they look canonical):
   - Tier label + age range printed at the bottom of each card
   - Stars / equipment / kit colors per tier
   - Background gradient — no transparent backgrounds
6. **Things to keep LIVE-WIRED** in the React layer:
   - Card swap on input change (the headline UX)
   - Live counter / chip overlays (Height, Years-to-Mastery, etc.)
   - Anything that doesn't show in the image (Height is invisible
     in a portrait card — surface as a stat chip below)

### Promo strip on homepage

When the same builder is the page's lead-magnet promo, render a
"growth journey" row of 3 avatars (youngest → oldest, lowest tier
→ highest tier) instead of a single image. Tells the value-of-tool
story before the visitor reads. Justify-center so the middle card
sits dead-center on phone.

Drop-shadow on each card uses that tier's accent color (e.g.
sky-blue / violet / gold) so the trio feels distinct, not three
duplicates.

### Anti-patterns to avoid

- Don't try to live-color-shift a baked-in jersey via CSS overlays —
  that's why we use 15 distinct PNGs, not 5 with a color filter.
- Don't drive a PNG-character size off the height slider — the
  card's canonical proportions read correctly at all heights;
  scaling makes the head-to-body ratio look wrong. Surface height
  as a stat chip below instead.
- Don't render the SVG fallback in production code paths. If the
  PNGs aren't deployed yet, hide the character zone entirely; never
  show a degraded version to users.

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

### Client access model — Owner Portal (SHIPPED)

Each client gets a per-client owner portal at
`/clients/{slug}/portal` — self-serve, password-gated. Both co-founders
(Philip + Paul for Zenith) get their own `client_owners` row keyed by
`client_slug`, share the same view of the data.

Auth: separate cookie `client-portal-session` (NOT the admin cookie).
Signed with `sha256(owner_id + password_hash + CLIENT_PORTAL_SALT)`.
Bcrypt would be better — kept simple for sub-millisecond verify in
edge runtime. Lockout: 5 failed attempts → 15-min lock.

**Tabs:**
- **Overview** — pipeline value, weekly trend, action-required, "Action
  items from Ben" peek (top 3 open client-action tasks), outreach
  contacted-vs-uncontacted progress bar, recent leads with quick contact.
- **Funnels** — audience-funnel card grid. Each card = one audience
  segment (parent / coach / player / etc.) with: emoji + segment chip,
  touchpoint sequence (D{n} blocks per step), 4-stat row (Total / New /
  Active / Won), "View funnel" button → opens **shared `FunnelVisualModal`**
  (`src/components/portal/FunnelVisualModal.tsx`), and "View landing
  page ↗" button. Locked UX requirements (2026-05-06 — same as
  MOCK_BACKEND_PLAYBOOK row 11):
  - **Per-step inline edit** inside the modal — click any step to edit
    the label, channel (email / sms / voicemail / postcard), and day
  - **Up/down arrows on the day number** for ±1 day nudges (and a
    direct number input for bigger jumps)
  - **Voicemail steps render a read-only transcript block** in the
    edit pane — the message label is editable but the transcript itself
    requires the "+ Note" channel (Ben re-records via the feedback flow)
  - **"+" pill in the top-right of every funnel card** opens the modal
    with a free-form note panel pre-expanded — the owner writes a quick
    request and "Send to BlueJays" delivers it
  - **All edits + notes route through `POST /api/funnel/feedback`**
    which fires `sendOwnerAlert` SMS + structured email to Ben with
    a step-by-step diff. Edits do NOT mutate the live funnel directly
    (human-in-the-loop) — Ben implements the change in code + redeploys
    after eyeballing the request, mirroring the rest of the portal's
    "every owner-driven mutation goes through Ben" pattern
  - **Per-step cumulative-reach bar REQUIRED** on every step row
    (CLAUDE.md Rule 74). Yellow→orange gradient fill, h-1.5 height,
    width = step's cumulative reach %. Bars only ever scale DOWN
    across steps — defensive `monotonizeReach()` is the backstop.
    Drop-off pill (`−{X} pp`, rose) shows pp lost from the previous
    step. Reach % is bold tabular-nums in white text above the bar.
  - **`cumulativeReachPct` on `FunnelStepLite`** is the field clients
    populate when they have measured per-step reach. Until then the
    modal falls back to the industry-typical baseline curve and
    labels it "est. baseline" so prospects can tell what's measured.
  - **The shared modal is the standard.** Don't inline a custom
    funnel editor per client. Every new client funnels-tab uses
    `FunnelVisualModal` + `FUNNELS_BY_SLUG` (same path Zenith + Meyer
    mock-backend already use)
- **Leads** — full lead list with audience badges, manual contact logging
  (Email/Call/Text — opens native handler AND records the touch),
  manual funnel enroll, AI reply drafts (Claude Sonnet 4, locked to the
  client's brand voice — gated on Claude subscription). Multi-select
  checkboxes + bulk-action toolbar with: Mark won / Mark responded /
  Start funnel / Pause / Log email-call-text touch in bulk.
- **To-Do** — `client_tasks` filtered to `owner='client'`. Both co-
  founders share this list. Clicking the title expands the task;
  the checkbox SELECTS the task for bulk actions (it does NOT mark it
  done — see Owner Portal Rules in CLAUDE.md). Bulk toolbar surfaces:
  Mark done / In progress / Blocked / Pending / Send back to Ben.
  Each task has a "Reply / paste here" textarea so the client can
  drop the Clarity Project ID, Pixel ID, etc. directly into the task
  and Ben sees it on his admin dashboard. Stamps
  `last_updated_by_owner_id` so the audit trail knows which co-founder
  did what.
- **Insights** — weekly report rendered visually: lead-volume trend
  chart with 7d/30d/90d/All filter, leads-by-hour, leads-by-day,
  funnel performance, top template, Shopify revenue strip (when
  Shopify is connected — gracefully degrades to a "Connect Your Store"
  placeholder until then).
- **Account** — name/email/role/last-login, active subscriptions,
  notification preferences (instant / daily-digest / off for new-lead
  emails + texts), Shopify connect placeholder, change password.

**Footer entry**: the small Bluejay bird mark in the client site footer
("Built by BlueJays") IS the portal login link. Outwardly reads as a
designer credit; auth is email+password so visibility is safe.

**Notification fan-out**: `/api/clients/inquire` reads
`client_owner_preferences` and fires an instant email to every owner
opted in. SMS fan-out lands when per-client Twilio sub-accounts exist.

**Subscription gating**: AI reply drafts require
`hasCapability(slug, "claude.reply-draft")`. Endpoint returns 402
`upgrade_required: true` if the client isn't on a Claude tier — UI
shows "Email Ben to enable."

Code surface:
- `src/app/clients/[slug]/portal/page.tsx` — single ~1900-line client component
- `src/app/api/client-portal/{leads,leads/bulk,leads/[id]/log-contact,leads/[id]/enroll,tasks,tasks/bulk,tasks/[id],preferences,shopify,ai-reply,me,login,logout,change-password,subscriptions,report}/`
- `src/lib/client-{auth,owner-preferences,shopify,ai-reply,tasks-portal,leads}.ts`
- Bulk endpoints (`/leads/bulk`, `/tasks/bulk`) always pre-fetch by id
  + `client_slug` filter to enforce tenant isolation regardless of
  what ids the caller posts. Cap at 200 ids per request.

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
- Quote $10,000 + $500–1,000/mo with a payment plan option (3x $3,500
  / $3,500 / $3,000 per the audit page = $10,000) or $9,700 pay-in-full
