# Bespoke Client Build Template (locked 2026-05-18)

The canonical pattern for every premium custom-tier or AI-System-tier
bespoke client build. Two surfaces, one bridge. Built from the lessons
of All In One Service's LLC (Sequim WA, Kyle Fritz) — that build is
the **reference example for every future bespoke build until a stronger
one ships**.

> Reference files (read these before building a new bespoke):
> - Marketing site: `bluejays/src/app/clients/all-in-one-services/page.tsx`
> - Dark admin demo: `bluejays/src/app/clients/all-in-one-services/portal-demo/page.tsx`
> - Logo mark: `bluejays/src/app/clients/all-in-one-services/aios-mark.tsx`
> - Sticky nav: `bluejays/src/app/clients/all-in-one-services/sticky-nav.tsx`
> - Hero animation: `bluejays/src/app/clients/all-in-one-services/house-animation.tsx`

---

## The pattern in one sentence

Every bespoke build = a **public marketing site** at `/clients/[slug]`
plus a **password-gated dark admin demo** at `/clients/[slug]/portal-demo`,
bridged by the **BlueJay bird logo in the footer** (acts as the hidden
owner hatch — colored BlueJay-blue `#2563eb`, links to portal-demo,
password-gated).

## 1 — Marketing site (the public surface)

### Section structure (11 sections, alternating Paper/Stone)

| # | Section | Purpose |
|---|---|---|
| 01 | Hero | Editorial split: copy left, real-work photo OR custom animation right. Headline uppercase, 3-part formula (end result + time period + emotional payoff). 3 above-fold trust pills. Hero CTA in copper gradient. |
| 02 | Manifesto | Cream-paper section. Who builds your project. Pull-quote from a real review. Founder name + city. |
| 03 | Transformations | Before/after pairs as the centerpiece. Real client jobs, not stock. 2-4 pairs minimum. |
| 04 | Named Projects | Magazine-style cards with real project names, locations, scope, optional highlight badge. |
| 05 | The Craft | 4 material/method callouts that show technical depth + standards. |
| 06 | What We Build | Services list (8-10 items) — numbered, with sub-line. |
| 07 | Timeline | Week-numbered process (not generic 4 steps). Contractor-specific. |
| 08 | Credentials | "Receipts, not slogans." 4 stat cards + 2 detail panels with real license/insurance/bond numbers. |
| 09 | Voices | 4 verbatim testimonials with real names + star count. |
| 10 | Coverage | Service area map / cities + counties + shop address. |
| 11 | Estimate | Contact form posting to `/api/contact-form/[prospectId]`. |

### Visual rhythm

- Alternate `BG` Paper (`#f5ede0`) and `BG_ALT` Stone (`#ebe1d0`) section
  backgrounds for editorial cadence — never two same-color sections in a row.
- Add a `<SectionTint>` radial gradient inside each section with unique color
  + position so each one feels like its own zone (moss / copper / gold).
- Hero + Footer = the only dark zones (`#1c1917` stone-black). Bookends.
- Sticky nav = translucent cream-blur (`rgba(245, 237, 224, 0.86)` + 12px
  backdrop-blur). Premium hospitality vibe (Aman / Soho House).

### Color palette (3-tier system)

```
TIER 1 — SURFACE (the page)
  BG       = Paper cream  (industry-adjusted base)
  BG_ALT   = Stone cream  (slightly deeper, alt sections)
  BG_PANEL = Panel        (brightest, for cards)
  INK      = Espresso text + dim variants

TIER 2 — ACCENT (the trade colors)
  PRIMARY  — industry-matched, used for 90% of accents
             · Construction/remodel: deep moss #2d4a35 (PNW)
             · Paving/excavating:    sunset orange #ea580c
             · Electrician:          yellow #facc15 (Meyer locked)
             · Cleaning/florist:     soft sage / blush
  SECONDARY — copper gradient, RESERVED for "buy now" moments only
              (hero CTA + h1 highlight + After badge on before/after)

TIER 3 — BOOKENDS (dark, used ONLY on hero + footer)
  DARK_BG, DARK_BG_PANEL, DARK_INK, DARK_RULE
```

### Industry color matching (NON-NEGOTIABLE)

- **Construction / remodel** → moss green primary (PNW heritage)
- **Paving / asphalt** → sunset orange + yellow (warm-laid-asphalt feel)
- **Electrician** → bright yellow (Meyer locked palette)
- **Plumber / HVAC** → deep blue + chrome
- **Landscaping** → forest green + earth
- **Salon / florist** → blush + cream + brass
- **Real estate** → navy + ivory + brass

### Required (ship-gate) elements above the fold

Per CLAUDE.md Meyer Electric reference rule:

1. **Hero shows OUTCOME**, not the person at work. Finished kitchen, paved
   driveway at sunset, harvested orchard — never "happy contractor in
   uniform" stock.
2. **Hero headline benefit-driven + short** (3-part formula).
3. **3 believability markers visible above-fold** — real credentials
   with badges + service area named + years-in-business count.
4. **Theme matched to industry vibe** — dark for trades, light for
   feminine/elegant.

### Required surface pieces

- `page.tsx` — main site, ~1500-2000 lines, all 11 sections
- `layout.tsx` — SEO + JSON-LD schema (HomeAndConstructionBusiness /
  Electrician / etc. matching the trade)
- `sticky-nav.tsx` — desktop nav + mobile hamburger + cream-blur bg
- `contact-form.tsx` — posts to `/api/contact-form/[prospectId]`
- `[brand]-mark.tsx` — text-wordmark logo OR illustrated mark
- `scroll-progress.tsx` — 3px gradient bar at top, full brand sweep
- `google-review-badge.tsx` — floating bottom-left widget, dismissible
- `house-animation.tsx` / `[industry]-animation.tsx` — desktop-only
  signature animation. Sun rising, smoke, drifting clouds, fence
  pickets — show personality.
- `llms.txt` + `llms-full.txt` route handlers — AI crawler discoverability

### Required footer elements

- AIOS / brand-mark + wordmark
- "BlueJay bird" icon (color: `#2563eb`) linking to `/portal-demo` —
  hidden owner entrance, password-gated
- "Built by BlueJays — get your free site audit" credit linking to
  `bluejayportfolio.com/audit` (network-effect rule from CLAUDE.md)
- Service area + contact info + external profile links

---

## 2 — Dark admin portal-demo (the private surface)

### Why it exists

The marketing site sells. The portal-demo CLOSES. It's a password-gated
preview of the AI System backend with the client's REAL data so they
see their business reflected back and walk themselves into the upsell.

### Architecture

- **Single password gate** (rotate per-client, e.g. `kyle2016`, `1212`)
- **Sticky top header** with brand strip + business name + role badge
- **8 horizontal tabs** that switch in-place (no routing) — sub-nav
  with active-tab underline in industry-accent gradient
- **Per-tab content** = stat cards + dense tables + raised panels,
  modeled on the BlueJays /dashboard visual language

### 8-tab canonical structure

| # | Tab | Content |
|---|---|---|
| 1 | Overview | 4 KPI stat cards · activity feed (6 rows) · today's punch list |
| 2 | Projects/Jobs | 4 KPIs · sortable job table with status pills, crew, progress, contract value |
| 3 | Leads | 4 KPIs · unified inbox table (form/calls/DMs/referrals) · missed-call recovery feed · "AI Reply Drafter — Locked" upgrade panel |
| 4 | Reviews | 4 KPIs · review history with 4 states (captured/scheduled/never-asked/private-intercepted) |
| 5 | Schedule | Mon-Fri week view with color-coded job blocks, crew per event, inspection flags |
| 6 | Invoices | 4 KPIs · invoice table · drilled-in change-order detail panel |
| 7 | Credentials | Renewal cards with conic-gradient countdown rings · document vault |
| 8 | Settings | Team · Integrations status · Automation rules (with locked AI System ones) · Notification routing |

### Dark palette tokens (consistent across every portal)

```
BG              = #0a0a0a   (page)
SURFACE         = #141414   (panel)
SURFACE_RAISED  = #1c1c1c   (card)
SURFACE_HEADER  = #0f0f0f   (sticky header)
BORDER          = #2a2a2a
TEXT            = #fafafa  (.72/.48/.30 opacity tiers for soft/dim/faint)

PRIMARY         = [industry accent, brightened for dark legibility]
UPGRADE         = COPPER #d97706  (always reserved for AI System CTAs)
INFO            = #3b82f6  (blue, for pending/scheduled)
WARN            = #ef4444  (red, for overdue)
```

### Mock data rules

**Every mock data point must use the client's real info.** That's what
makes the demo close. The mock-data file should include:

- 5-7 named projects (use REAL project names if known, or plausible
  local names with REAL cities from the service area)
- 6-9 leads (mix of contact-form, missed-call, DM, referral sources)
- 8-12 reviews (real reviewers when available, plus mock ones to
  demonstrate the 4 states including the "private intercepted" filter)
- Real credentials (WA L&I license, $1M insurance, bond, USDOT,
  industry-specific certs) with accurate renewal dates
- Real owners + crew in Team panel
- Real integrations status (Twilio + Google + SendGrid connected;
  AI-System-tier features locked)

### The 3 "Unlock with AI System" tax

Sprinkle 3 upgrade hooks throughout the portal:

1. One in the Leads tab — "AI Reply Drafter — Locked" upgrade panel
2. One in the Overview punch list — "Unlock AI auto-replies + auto-review-asks"
3. One in Settings automation rules — multiple "AI System" locked toggles
   (Database Reactivation · Hyperloop ads · auto-reply)

Closing CTA at the bottom of the page is optional — only if not on AI
System tier already.

---

## 3 — The bridge (BlueJay bird = owner hatch)

In the marketing-site footer, the BlueJay bird icon (`<BluejayLogo />`)
gets wrapped in an `<a>` linking to `/clients/[slug]/portal-demo`. The
bird is **explicitly colored blue** via `style={{ color: "#2563eb" }}`
(BlueJay royal blue), distinct from the moss/copper accents elsewhere.

The wordmark "BlueJays" link beside it still points to
`bluejayportfolio.com/audit` (the network-effect rule — every customer
site pulls free audit-funnel traffic).

This means the same footer line has TWO purposes:
1. **BlueJay text → /audit** = cold-traffic acquisition for BlueJays
2. **BlueJay bird → /portal-demo** = private owner-only entrance for
   the actual customer

The bird-as-hatch is meant to be subtle. Don't add a "click me" label
or a tooltip explaining it. Kyle, Cyril, and every owner who reads the
footer will eventually click it and discover their portal. That's the
delight moment.

---

## 4 — Building a new bespoke (checklist)

When Ben opens a new bespoke (e.g., Hector Landscaping, Bloodlines,
next manufacturer):

- [ ] Add prospect row to Supabase (per Rule 49 manual-managed=true)
- [ ] Add slug to `CLIENT_SITES` map in `src/lib/client-site-urls.ts`
- [ ] Create `/clients/[slug]/` directory with required files
- [ ] Pick the industry-matched primary accent color
- [ ] Pull real business data: license #, insurance #, bond, certs,
      crew names, service area, named projects, real reviewer names
- [ ] Build the marketing site (11 sections, all 4 ship-gate elements)
- [ ] Build the portal-demo (8 tabs, all real data, 3 upgrade hooks)
- [ ] Wire BluejayLogo footer link to `/portal-demo` with blue color
- [ ] Set the portal-demo gate code (use owner name + founding year as
      default convention, e.g., `kyle2016`, `cyril1985`, `1212`)
- [ ] Verify desktop + mobile (no horizontal scroll, animation hides
      on lg:hidden if too heavy)
- [ ] Function check: all anchors resolve, form validates, mobile
      hamburger works, external links have rel="noopener noreferrer"
- [ ] Commit + push (triggers Vercel auto-deploy)

---

## 5 — What NOT to do

- Don't reuse stock photos across clients — every site needs unique
  imagery (CLAUDE.md visual QC rule 1)
- Don't put copper-amber as the dominant accent for every client —
  every contractor uses copper-amber, it makes us look like every
  road-paving competitor. Industry-match the primary.
- Don't skip the BlueJay bird → portal-demo wiring — that's the
  bridge that makes the build feel cohesive
- Don't make the portal-demo a 4-card stub like the early AIOS version
  was. Use the 8-tab pattern + real data + 3 upgrade hooks
- Don't use generic feature descriptions in the portal — name real
  projects, real reviewers, real credentials, real industry pain
  points. Generic stock-feature copy = stock-demo = doesn't close

---

## 6 — Version history

- **v1 (2026-05-04)** — Meyer Electric reference standard locked
  (CLAUDE.md "Bespoke Client Showcase" rule)
- **v2 (2026-05-18)** — AIOS + Peninsula Paving expansion: PNW
  Heritage palette, dark portal admin pattern, BlueJay-bird-as-hatch
  bridge, scroll-progress + google-review-badge + house-animation
  surface pieces. THIS DOC.
- Future — when a stronger bespoke build emerges, lock it and update
  this template to point at the new reference example.
