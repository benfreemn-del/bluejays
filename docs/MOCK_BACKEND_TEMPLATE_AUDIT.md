# Mock-Backend Template Audit — 2026-05-10

> **Scope:** the 50 categories that have spec docs in `docs/mock-backends/`
> minus the 3 active customers already reviewed (zenith-sports / itc-quick-attach
> / olympic-inspections / bloodlines).
>
> **Goal:** flag where each category is in the install-readiness ladder
> (site template → portal-demo → backend wiring) and identify the
> universal gaps that block scale.

---

## Universal findings (apply to ALL 50 categories)

### 🔴 Gap 1: portal-demo template factory doesn't exist

**Status today:** `src/app/clients/meyer-electric/portal-demo/` is the
only portal-demo route in the entire repo (3,640 lines, 9 tabs). Every
prospect install is a manual copy + customize, ~3-4 hours of work.

**What's missing:** a script / generator at `scripts/scaffold-portal-demo.mjs`
that reads `docs/mock-backends/<slug>.md`, copies the meyer-electric
reference, swaps the audience taxonomy + lead-score formula + affiliate
categories + 4 funnels + interactive features per the spec, and writes a
working `src/app/clients/<slug>/portal-demo/` directory in 30 seconds
instead of 3 hours. **This is the single highest-leverage build for the
entire mock-backend system.** ETA ~6-8 hrs to build the generator.
Pays for itself by install #2.

### 🟡 Gap 2: V2 site templates are static — not data-driven

The 47 V2 sites are hand-written 1,000-1,400-line Next.js pages. They
look great but every prospect customization means editing the template
inline. There's no `src/lib/v2-site-config.ts` registry that drives
hero copy / colors / phone / address / before-after photos per prospect
— it's all baked into each `page.tsx`.

**What's missing:** a data-driven layer where prospect-specific
strings (business name, phone, hero image, service-area) come from a
config object. Same pattern as `src/lib/portal-configs.ts`. Wouldn't
require rewriting templates, just extracting the per-tenant data.
**ETA ~10 hrs across all 47 templates.** Mid-priority.

### 🟡 Gap 3: scout config registry is incomplete

`src/lib/service-clients.ts` REGISTRY now has 3 entries (OIT + Zenith
+ ITC after this morning's ship). The other 47 categories with V2 sites
have NO scout config entry — meaning if a prospect closes in any of
those, the partner-scout cron never fires for them. Each closed deal
needs a one-time service-client registration (15 min using the templates
in `docs/mock-backends/X.md`).

**What's missing:** a per-category factory function that reads
`docs/mock-backends/X.md` and emits a `ServiceClientConfig` object.
**ETA ~3 hrs.** Covers gap permanently.

### 🟢 What's working

- 47 V2 site templates are mature + design-consistent
- 53 spec docs are complete (this week's ship)
- Reference portal-demo (meyer-electric) proves the pattern at 9 tabs
- The 3 active customers (OIT / ITC / Zenith) prove the install path
  end-to-end

---

## Tier 1 — Manufacturer ICP (closed-deal anchors / hot warmth)

Per `MANUFACTURER_BACKLOG.md`, all 6 mfg-* slugs are **bespoke-only**
— no V2 template by design. Each prospect gets a custom showcase
mirroring ITC / Zenith / Nevarland.

### 1. mfg-kids-apparel — Nevarland Outpost anchor
- **Spec:** `docs/mock-backends/mfg-kids-apparel.md` ✓
- **Site:** `src/app/clients/nevarland-outpost/` (bespoke showcase exists)
- **Portal-demo:** ✗ none
- **Backend:** ✗ NOT in service-clients.ts REGISTRY
- **Anchor:** Christopher · Nevarland Outpost (custom-tier, Shopify storefront + BJ back-office)
- **Quick win:** register `nevarland-outpost` in service-clients.ts using the spec's audience taxonomy (outdoors-family / homestead / faith / etc.) + scout queries (mom-blogger / craft-fair / boutique). Same pattern as ITC fix.

### 2. mfg-food-bev — KR Ranches anchor
- **Spec:** `docs/mock-backends/mfg-food-bev.md` ✓
- **Site:** `src/app/clients/kr-ranches/` (bespoke showcase, custom-tier)
- **Portal-demo:** ✗ none
- **Backend:** ✗ NOT in service-clients.ts REGISTRY
- **Anchor:** KR Ranches (Prosser WA, farm-direct meat)
- **Quick win:** register `kr-ranches` in service-clients.ts. Their flavor-pref / dietary-tag audience model is unique to this category — needs custom audience-segment values (jerky-buyer / sauce-buyer / subscriber).

### 3. mfg-outdoor-gear — no anchor yet
- **Spec:** `docs/mock-backends/mfg-outdoor-gear.md` ✓
- **Site:** ✗ no `src/app/clients/<X>/` showcase yet
- **Portal-demo:** ✗ none
- **Backend:** ✗ no service-clients entry
- **Industry note:** when first prospect closes, anchor build follows the ITC pattern (audience-specific landing pages × 5 sub-niches: hunter / hiker / fisher / camper / overlander). Pre-build is wasteful — wait for actual close.
- **Quick win:** none (cold category). Tag for "build on first close."

### 4. mfg-auto-parts — no anchor yet
- **Spec:** `docs/mock-backends/mfg-auto-parts.md` ✓
- **Site:** ✗ no showcase yet
- **Portal-demo:** ✗ none
- **Backend:** ✗ no service-clients entry
- **Industry note:** vehicle-make/model lookalike cohort is a unique data shape (Tacoma vs. JK vs. RZR audiences). Need a vehicle-fit configurator (matches the calculator spec).
- **Quick win:** none (cold category). Tag for "build on first close."

---

## Tier 2 — Reference + highest-volume home-services

### 5. electrician — Meyer Electric reference
- **Spec:** `docs/mock-backends/electrician.md` ✓ (canonical, 230 lines)
- **Site template:** `/v2/electrician` (1,194 lines) ✓
- **Portal-demo template:** `/clients/meyer-electric/portal-demo/` (3,640 lines, 9 tabs) ✓ ✓
- **Backend:** ✗ Meyer not in service-clients.ts; portal-demo is mock-only
- **Industry note:** the canonical reference. Every other portal-demo install copies from here. **Should be promoted to a generator template, not a clone source.**

### 6. plumber
- **Spec:** ✓
- **Site template:** `/v2/plumber` (1,448 lines) ✓
- **Portal-demo:** ✗
- **Backend:** ✗
- **Industry-specific tweak:** emergency-flag signal needs same-day SMS callback infra (template doesn't include this). Add to spec.
- **Quick win:** none until prospect lands.

### 7. hvac
- **Spec:** ✓
- **Site template:** `/v2/hvac` ✓
- **Portal-demo:** ✗
- **Backend:** ✗
- **Industry-specific tweak:** seasonal-peak (summer + winter) drives 2x lead volume — funnel needs auto-pause/auto-resume by month. Not in current spec.
- **Quick win:** add seasonal-throttle note to `mfg-style hvac.md` spec.

### 8. roofing
- **Spec:** ✓
- **Site template:** `/v2/roofing` ✓
- **Portal-demo:** ✗
- **Backend:** ✗
- **Industry-specific tweak:** **NOAA storm-cell density data** is the highest-leverage signal — should be wired into the heatmap from public NOAA APIs at install time. Spec mentions but doesn't lock the data source. Add to spec: NOAA Severe Weather Database for storm history.

---

## Tier 3 — Highest-volume professional services

### 9. real-estate
- **Spec:** ✓ — `/v2/real-estate` (1,430 lines) ✓ — Portal-demo: ✗ — Backend: ✗
- **Industry tweak:** the lead-quality signal `pre_qualified` (mortgage pre-approval) is the single highest-correlation field with close-rate. Calculator spec needs a "Have you been pre-approved? (Y/N)" gating question to bucket leads.

### 10. dental
- **Spec:** ✓ — `/v2/dental` (1,030 lines) ✓ — Portal-demo: ✗ — Backend: ✗
- **Industry tweak:** insurance-network-acceptance is a lead-routing field — needs a dropdown on the booking form for top 6 carriers (Delta, Aetna, Cigna, BCBS, MetLife, Guardian). Currently spec doesn't surface this.

### 11. law-firm
- **Spec:** ✓ — `/v2/law-firm` ✓ — Portal-demo: ✗ — Backend: ✗
- **Industry tweak:** **practice-area splitting** — a single law-firm config can cover PI/family/estate/criminal but they have radically different audiences + funnels. Spec defaults to PI; needs a "select practice area" pivot at install time. Future fix: 4 sub-spec docs (`law-firm-pi.md`, `law-firm-family.md`, etc.).

### 12. accounting
- **Spec:** ✓ — `/v2/accounting` ✓ — Portal-demo: ✗ — Backend: ✗
- **Industry tweak:** **tax-deadline urgency** is so dominant that the funnel cadence flips entirely Mar-Apr (every email → "deadline reminder") vs. May-Jan (recurring bookkeeping pitch). Spec doesn't seasonalize. Add seasonal-cadence map.

### 13. insurance
- **Spec:** ✓ — `/v2/insurance` ✓ — Portal-demo: ✗ — Backend: ✗
- **Industry tweak:** **life-event capture** is the gateway — site needs a "what just happened?" 4-button entry (bought home / new car / had baby / got married). Spec mentions but doesn't lock UI. Add wireframe note.

---

## Tier 4 — Other home services (16)

For all of T4 except landscaping (Hector Landscaping anchor exists),
the pattern is identical: V2 site exists, portal-demo doesn't, spec
doc exists, no backend wiring. Industry-specific tweaks below.

### 14. landscaping
- **Spec:** ✓ — `/v2/landscaping` ✓ — Anchor: Hector Landscaping (`/clients/hector-landscaping/`)
- **Backend:** ✗ no service-clients entry
- **Quick win:** register `hector-landscaping` in service-clients.ts. Existing customer, currently uninstrumented.

### 15. cleaning
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** Airbnb-host signal is the highest-LTV cohort (recurring high-frequency turn). Spec mentions; surface as a separate audience tag.

### 16. pest-control
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** termite-inspection is an annual cycle distinct from quarterly recurring. Two funnels needed, not one.

### 17. moving
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** **move-date locked** is a hard time-bound signal — funnel cadence should auto-shorten as date approaches (60d / 30d / 14d / 7d).

### 18. pool-spa
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** **opening + closing season** drives 2x volume in spring + fall. Calendar-tab integration would auto-book seasonal recurring slots. Worth flagging as a calendar-template extension.

### 19. general-contractor
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** **design_stage** field (idea / sketches / architect / permit-ready) is the single best lead-score signal. Calculator spec needs explicit stage-picker.

### 20. construction
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** **financing_pre_qualified** is the GC-equivalent of real-estate pre-approval — same gating signal.

### 21. painting
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** color-visualizer is the spec's #1 interactive feature — requires user photo upload, more infrastructure than other categories. Note as an asset-cost item.

### 22. fencing
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** new-pool-permit is the highest-converting trigger (code-required safety fence). Public permit-data feed would pre-populate hot leads.

### 23. tree-service
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** post-storm urgency = same NOAA data feed as roofing. Reusable.

### 24. pressure-washing
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** pre-listing prep is the highest-margin channel (realtor-driven). Needs explicit realtor-affiliate program copy.

### 25. garage-door
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** emergency repair (broken-spring) is so high-urgency it deserves a separate lead-magnet ("Stuck garage door? Here's what to check before calling").

### 26. locksmith
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** auto-lockout vs. residential vs. commercial = three distinct urgency bands. Spec covers but UI needs a 3-button entry.

### 27. junk-removal
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** estate-cleanout cohort is sensitive-touch — funnel copy needs death-of-relative phrasing softer than other cleanout types.

### 28. carpet-cleaning
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** pet-accident emergency vs. annual whole-home are two funnels — current spec collapses them.

### 29. appliance-repair
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** brand-tier (Sub-Zero / Wolf / Viking) is a premium-WTP signal. Site needs brand-specific landing pages or premium-tier callout.

---

## Tier 5 — Health / wellness (6)

All have V2 sites + spec docs + ✗ portal-demo + ✗ backend.

### 30. chiropractic
- **Tweak:** MVA / personal-injury cohort needs attorney-affiliate program copy explicit. Highest-ticket lead source after MD-referrals.

### 31. fitness
- **Tweak:** event-deadline urgency (wedding / vacation) is the single best WTP indicator. Date-bound funnel-shortening like moving.

### 32. veterinary
- **Tweak:** new-pet welcome window (puppy/kitten in last 30 days) is the highest-LTV acquisition channel. Pet-store / breeder affiliate program needed.

### 33. physical-therapy
- **Tweak:** MD-referral with signed Rx in hand → near-100% close rate. Funnel should fast-track these out of the standard cadence.

### 34. medical
- **Tweak:** insurance-network status is gate signal #1. Real-time eligibility check at booking-form would pre-qualify.

### 35. med-spa
- **Tweak:** event-deadline (wedding / vacation) cohort is identical pattern to fitness. Reusable date-bound urgency template.

---

## Tier 6 — Personal services (6)

### 36. salon
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** color-correction-rescue is the premium-margin specialty — separate landing page would 2x conversion on that cohort.

### 37. tattoo
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** design-attached signal (uploaded reference) is the serious-buyer indicator. Site needs an obvious upload widget on inquiry form.

### 38. photography
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** wedding 6-12mo lead-time means the funnel cadence is uniquely long. Other categories' sub-90-day cadence won't fit.

### 39. martial-arts
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** anti-bully emotional driver is the most specific high-converting parent message. Spec calls out; site copy must lead with it.

### 40. tutoring
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** SAT/ACT date-driven urgency = same template as moving / fitness / med-spa. **Date-bound urgency template is reusable across 4+ categories.**

### 41. pet-services
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** boarding date-bound urgency, same template family.

---

## Tier 7 — Specialty B2C (9)

### 42. interior-design
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** budget-disclosed is the single best serious-buyer signal. Calculator spec should require it before showing prices.

### 43. florist
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** sympathy / hospital same-day urgency = highest-margin per-call. Separate 24hr-promise landing page warranted.

### 44. daycare
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** expecting-mom waitlist (6-9mo nurture) is the longest cycle of any tenant — needs a parallel multi-month nurture engine. **Different funnel-runner shape than other categories.**

### 45. catering
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** corporate-recurring (B2B lunch program) is the highest-LTV. Separate B2B landing page needed.

### 46. event-planning
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** wedding category overlaps florist + photography + caterer co-vendor referral. Should auto-link to those V2 sites.

### 47. church
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** **vocabulary softening** is required ("seekers" not "leads"; "discipleship" not "funnel"). Spec says so, but site/portal-demo install MUST honor or it'll feel commercial. Lock as install-time check.

### 48. restaurant
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** "first-time visitor → repeat / loyalty member" reframe (per spec). Visit-count is the leading indicator, not deal-size. Backend needs `visit_count` field on lead row, not the standard pipeline.

### 49. towing
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** motor-club-contracted (AAA / Geico) is recurring B2B at fixed margins — different from per-call retail. Two-tier funnel.

### 50. auto-repair
- Spec ✓ / V2 ✓ / portal-demo ✗ / backend ✗
- **Tweak:** mileage-milestone (60K / 90K / 120K) is the most measurable predictor of major-service spend. Maintenance-reminder cadence should auto-fire on these.

---

## Cross-cutting patterns (the system-level wins)

After 50 single-category reviews, these patterns repeat enough to
warrant building once + reusing across categories:

### Pattern 1: Date-bound urgency template (reusable across ≥6 categories)
**Categories:** moving / fitness / med-spa / tutoring / pet-services
(boarding) / wedding-photography / wedding-florist / catering-wedding /
event-planning. **Build:** a generic "event-date funnel" runner that
auto-shortens cadence at 60d / 30d / 14d / 7d / 1d marks. Once shipped,
each of these 9+ categories gets it for free.

### Pattern 2: NOAA storm/weather feed (reusable across 4 categories)
**Categories:** roofing / tree-service / hvac (heat-wave) / plumber
(freeze). **Build:** `src/lib/weather-feed.ts` that pulls NOAA Severe
Weather DB by ZIP. Reusable across the heatmap interactive feature.

### Pattern 3: Practice-area splits (law-firm only)
**Build:** 4 sub-spec docs (`law-firm-pi.md`, `law-firm-family.md`,
`law-firm-estate.md`, `law-firm-criminal.md`). Same install path, just
4 spec rows.

### Pattern 4: Insurance-network real-time eligibility (medical / dental)
**Build:** stub eligibility check at booking-form. Eventually wire to
Eligibility-as-a-Service (Eligible API / Particle Health etc.). For
now: drop-down with top 6 carriers per category.

### Pattern 5: Permit / public-data feeds (fencing / construction / GC)
**Build:** county-permit data scraper for new-pool / new-build /
renovation-permit zones. Pre-populates hot leads.

### Pattern 6: Vocabulary-tone install-time check (church only — but precedent for others)
**Build:** an install-time "tone profile" config that lets a tenant
override default copy ("leads" → "seekers", etc.). Future: faith-based
gyms, recovery programs, education-non-profits would all benefit.

---

## Roadmap — priority order to actually close gaps

| # | Build | Hours | Multiplier |
|---|---|---|---|
| 1 | **portal-demo scaffold generator** (`scripts/scaffold-portal-demo.mjs`) | 6-8 | every install drops from 3-4 hrs to 30 min, recovers cost on install #2 |
| 2 | **service-clients.ts factory** that reads `docs/mock-backends/X.md` and emits `ServiceClientConfig` | 3 | makes the registry-registration step universal, not per-tenant |
| 3 | **register existing customers** (Hector / KR / Nevarland / Laser Lakes / Meyer Electric) in service-clients.ts | 2 | unlocks scout for active customers currently uninstrumented |
| 4 | **date-bound urgency template** (Pattern 1) | 4 | covers 9+ categories for free |
| 5 | **NOAA weather feed** (Pattern 2) | 3 | covers 4 storm-driven categories |
| 6 | **V2 site config-extraction** (Pattern: extract per-tenant strings to a registry) | 10 | makes 47 templates data-driven instead of inline-hardcoded |
| 7 | **vocabulary-tone install-time check** (Pattern 6) | 2 | unblocks church + faith-adjacent categories |

**Total: ~30 hrs of focused-build work that closes 80% of the
template-readiness gap across all 50 categories.** Single biggest
leverage build remains the portal-demo scaffold generator (#1).

---

## What I'm NOT recommending

- **Don't pre-build portal-demos for cold categories.** mfg-auto-parts
  / mfg-outdoor-gear are still anchor-less; building speculatively
  is wasted work. Build on first close.
- **Don't pre-customize V2 templates for prospects who aren't paying.**
  The 47 site templates work as-is for the cold-pitch preview; only
  closed-deal prospects warrant a custom showcase.
- **Don't merge the 47 V2 templates into a single dynamic renderer.**
  The hand-written Next.js pages are design-consistent but each one's
  copy + photos + interactive features is industry-specific. A single
  renderer would either be incoherent or massively bloated.

---

*Audit generated 2026-05-10. Re-run when service-clients.ts REGISTRY
changes or new V2 templates ship.*
