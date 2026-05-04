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
- Quote $9,700 + $500–1,000/mo with a payment plan option (3x $3,500
  / $3,500 / $3,000 per the audit page)
