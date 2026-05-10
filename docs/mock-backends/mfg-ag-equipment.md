# Mock Backend Config — Custom Ag / Farm Equipment

> **Reference build:** ITC Quick Attach (Innovative Tractor Components,
> Blossvale NY · tractor toolboxes / SawBoss / brush guards / firearm
> mounts). Showcase live at `/clients/itc-quick-attach`.
>
> **When to use:** any niche-product manufacturer making implements,
> attachments, or specialty parts for the ag/tractor/livestock/fencing
> market. Owner-operator, sells via dealers + word-of-mouth + B2B.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Hobby tractor owner (consumer DTC) | 38% | $80-$1,200 | Single-product purchases — toolboxes, brush guards, hitches |
| Pro forester / land manager | 18% | $400-$3,500 | Multi-piece kits, repeat orders, recurring buyers |
| Tractor dealer (B2B / wholesale) | 14% | $4K-$28K | Inventory orders, recurring quarterly |
| Brand-specific owner (TYM / Kioti / Mahindra / Branson) | 16% | $200-$1,800 | Brand-fit accessory shoppers — highest CTR |
| Hunter / outdoor (firearm-mount buyer) | 8% | $180-$650 | Cross-niche; firearm + tractor cohort |
| Community / hobby builder | 6% | $50-$400 | Forum participants, low-margin but high-LTV-promoter |

---

## Lead-quality signals (what makes a hot ag-equipment lead)

### Consumer signals (encoded in `signals.*`)
- **`tractor_brand`** = TYM / Kioti / Mahindra / Branson / Kubota / John Deere / other. Brand-specific landing pages convert 3-4x.
- **`acreage`** = small (<5) / medium (5-50) / large (50+). Larger = bigger ticket.
- **`brand_fit_score`** = 0-100 by tractor model (e.g. T474, CK2610). Pre-existing brackets land them on the right fit.
- **`use_case`** = forestry / livestock / general-utility / hobbyist
- **`firearm_owner`** = ~22% of consumer pool — gateway to firearm-mount line

### B2B / dealer signals
- **`dealer_size`** = small (1-2 locations) / medium (3-5) / regional (6+)
- **`stock_velocity`** = how fast existing SKUs move (proxy for re-order frequency)
- **`current_competitor`** = brand they currently stock (TitanAttachments, EverythingAttachments, Etc.)

### Cross-cutting signals
- **`affiliate_source`** = ~28% of leads (forum / YouTube reviewer / referral) — boosts score significantly
- **`urgency`** = `high` if "spring planting prep" or "winter clearing" trigger keywords in seasonal window
- **`seasonal_peak`** = March-May (planting) and Sep-Nov (cleanup season)

### Lead score formula (0-100)
```
score = 30 (base)
  + 15 if brand_fit_score >= 70
  + 12 if dealer_size != null (B2B = recurring)
  + 18 if repeat_customer
  + 12 if affiliate_source
  + 16 if urgency=high (or +8 if medium)
  + 8  if seasonal_peak
  + 10 if acreage=large
  + 8  if firearm_owner AND firearm-mount product viewed
clamp 0-100
```

Color coding mirrors the universal: ≥80 emerald, 60-79 yellow, 40-59 orange, <40 slate.

---

## Affiliate categories (8 types — what partners refer ag-equipment makers)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Tractor dealer (TYM/Kioti/etc.)** | Owners ask "what attachments fit?" — dealer recommends | Toolboxes, brush guards, hitches |
| **YouTube tractor reviewer** | Audience trusts their picks → swap-link revenue | Any product, repeat content |
| **Forestry coop / land managers** | Refer pro-grade forestry kits | SawBoss, chainsaw carriers, mounts |
| **County extension office** | Refer hobbyists asking "what should I buy" | Beginner kits, safety gear |
| **Forum admin (TractorByNet etc.)** | Trust mods; their endorsement = sales | Brand-specific kits |
| **Firearm dealer / hunting shop** | Cross-promote firearm-mount line | Firearm mounts, tractor-mount holsters |
| **Implement fabricator (peer)** | Niche cross-refer when products complement | Hitch + lift combinations |
| **Ag trade show organizer** | Sponsor → discounted booth → branded recall | Show specials, dealer leads |

---

## Funnel taxonomy (4 standard funnels)

1. **Hobbyist first-year setup** — homeowner with new tractor, doesn't know what they need yet.
   - Lead magnet: "First-Year Tractor Owner Checklist" PDF
   - 6-step email cadence: welcome → "what bracket fits your tractor" → safety story → social proof → bundle offer → reactivation
2. **Pro forester / land manager kit** — heavy-duty buyer with proven need.
   - Lead magnet: "Forester Gear Spec Sheet" — comparison vs. 3 competitors
   - 5-step cadence: case study → calculator email → 24-hr warranty offer → testimonial → consult call CTA
3. **Brand-fit (TYM/Kioti/etc.) buyer** — highest-converting segment.
   - Lead magnet: "TYM-Compatible Accessory Catalog"
   - 4-step cadence: brand-specific welcome → product fit (linked to tractor model) → price-stack vs. dealer → bundle CTA
4. **Dealer ROI pitch** — B2B funnel for stocking inventory.
   - Lead magnet: "Dealer ROI Calculator + Stocking Tier Pricing"
   - 4-step cadence: ROI sheet → MAP/UMAP policy → wholesale price tier → first-order incentive

---

## Industry calculator spec (interactive feature 1)

**Brand-Fit Configurator** — owner picks their tractor (year + brand + model). Calculator returns:
- Compatible toolbox size (light/medium/heavy duty)
- Brush guard fitment (Y/N + part number)
- SawBoss compatibility
- Estimated bundle price + standalone-piece total (showing bundle savings)
- "Confidence: this fits" indicator (high/medium/needs-call)

Drives the "Brand-fit" funnel auto-segmentation.

---

## Sizing/recommendation tool spec (interactive feature 2)

**Use-Case Recommender** — owner picks "What do you actually do with the tractor?" (4-pick chips: forestry / mowing / livestock / hauling / hobby). Tool returns:
- Top 3 product picks ranked by use-case fit
- Why each one (1-line each)
- Pre-filled "Add to bundle" CTA

Reduces decision fatigue for first-year hobbyists. Funnel-tags `use_case` field on the lead row.

---

## Service-area heatmap spec (interactive feature 3)

**National dealer-density map** — overlay shows:
- TYM / Kioti / Mahindra / Branson dealer concentrations (by ZIP)
- Recent snowstorm / drought / planting-window indicators (drives urgency signal)
- Cluster of forum-mention activity (ProspectMap style)

Drives Luke-style "where to allocate ad spend this week" recommendations on the AI Skills tab.

---

## Narrative simulator script (interactive feature 4)

**"A day in the funnel"** auto-plays a 60-second timeline:
1. **0:00** — Forum poster on TractorByNet asks "anyone using a SawBoss with their CK2610?"
2. **0:08** — Affiliate (forum-mod referral link) fires; lead lands tagged `forum-referral`, `kioti`, `forester`.
3. **0:18** — AI responder drafts welcome email referencing the CK2610 model + linking to the SawBoss product page.
4. **0:30** — Calculator runs: brand_fit_score = 92 → puts lead in the "Brand-fit (Kioti) buyer" funnel.
5. **0:45** — Email 1 fires (welcome + product fit). Open + click → trigger SMS bump.
6. **0:55** — Lead score crosses 80 → owner-alert SMS to founder: "Hot Kioti lead, ready for a quote."

Demonstrates the AI System turning forum noise → traceable revenue.

---

## Real-world data anchors

- **Cities/regions for mock leads:** rural NY (Blossvale anchor), PA, OH, KY, IN, MI, NC, GA, MO, TX. Skew rural/small-town.
- **Tractor brand mix in mock pool:** TYM 18%, Kioti 16%, Mahindra 12%, Branson 8%, Kubota 22%, John Deere 18%, other 6%.
- **Real product names to seed:** SawBoss · Chainbox · brush-guard-T474 · tractor-toolbox-light/medium/heavy · firearm-mount-rifle/shotgun · hitch-low-pro.
- **Sample affiliate names:** Cascade Tractor Supply · TractorByNet · TractorTime with Tim · TractorMike · Outdoors With The Morgans.
- **Avg deal size for ROI calc:** $385 (consumer), $4,800 (dealer first order), $11,200 (dealer recurring annual).
