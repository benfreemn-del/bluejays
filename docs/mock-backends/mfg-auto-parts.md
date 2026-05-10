# Mock Backend Config — Custom Auto / Moto Parts

> **Reference build:** none yet — will likely anchor when first prospect
> closes. Showcase target: `/v2/mfg-auto-parts`.
>
> **When to use:** any niche-product manufacturer making aftermarket
> parts for cars, trucks, motorcycles, boats, ATVs, or off-road
> vehicles. Owner-fabricator typical, sells via enthusiast forums +
> events + word-of-mouth.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Enthusiast / DIY builder (DTC) | 48% | $80-$1,800 | Personal-build single purchases |
| Custom-build shop | 18% | $1,200-$8,000 | Recurring B2B for client builds |
| Performance racer / track-day | 12% | $400-$4,200 | High-WTP, repeat performance buyers |
| Vehicle-specific group (Jeep / Tacoma / RZR cohort) | 10% | $150-$1,400 | Brand-fit lookalike cohort |
| Aftermarket retailer / distributor | 8% | $5K-$22K | Wholesale recurring |
| Event sponsor / rally organizer | 4% | $400-$3,500 | Event-based bulk orders |

---

## Lead-quality signals

### DTC enthusiast signals
- **`vehicle_make_model`** = e.g. "2018 Tacoma Off-Road" / "JK Jeep Wrangler" — drives brand-fit landing page
- **`build_stage`** = stock / mild / built / track-only. Built/track = high WTP.
- **`use_case`** = daily driver / weekend toy / track / overland / show
- **`mod_history`** = # past mods × avg ticket — proxy for total spend
- **`forum_member`** = is in a known forum (TacomaWorld, JKowners, etc.)

### Shop / B2B signals
- **`shop_type`** = independent / chain / specialty (off-road / drift / restoration)
- **`build_velocity`** = avg builds per month
- **`current_supplier`** = brand currently stocked (proxy for switch likelihood)

### Cross-cutting signals
- **`affiliate_source`** = forum thread / influencer build / event / direct
- **`urgency`** = `high` if rally / track-day / season-opener within 21 days
- **`seasonal_peak`** = March-June (build season), Aug-Oct (rally cycle)

### Lead score formula (0-100)
```
score = 30 (base)
  + 18 if build_stage in ['built','track-only']
  + 14 if shop_type != null (B2B)
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 8  if seasonal_peak
  + 12 if mod_history >= 5
  + 10 if forum_member
clamp 0-100
```

---

## Affiliate categories (8 types)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Forum admin / mod** | Trust-gated audience | Brand-specific kits |
| **YouTube build creator** | Audience follows their picks | Featured part installs |
| **Custom build shop (peer)** | Cross-refer when product complements | Build kits |
| **Vehicle-specific group leader** | Cohort-trust influencer | Group-buy discounts |
| **Track-day organizer** | Event-based bulk needs | Performance parts |
| **Aftermarket retailer** | Wholesale stocking decisions | Tier pricing + co-marketing |
| **Event sponsor** | Sponsorship → branded recall | Event-spec parts |
| **Restoration / specialty shop** | Niche-segment trust | Reproduction parts |

---

## Funnel taxonomy (4 standard funnels)

1. **Enthusiast first-build** — personal owner, low-info, browsing.
   - Lead magnet: "First Mod Roadmap (vehicle-specific)"
   - 5-step cadence: welcome → roadmap PDF → social proof build → bundle offer → reactivation
2. **Track / performance** — proven high-WTP buyer.
   - Lead magnet: "Track-Day Parts Spec Sheet (vehicle-specific)"
   - 4-step cadence: pro testimonial → spec sheet → comparison vs. competitors → consult call
3. **Vehicle-cohort (Jeep/Tacoma/etc.)** — brand-fit landing page.
   - Lead magnet: "Owner Forum Top-10 Picks PDF"
   - 4-step cadence: cohort welcome → top-10 → group-buy offer → community CTA
4. **Shop / wholesale** — B2B funnel.
   - Lead magnet: "Wholesale Pricing Tier + MAP Policy"
   - 4-step cadence: pricing sheet → ROI calculator → first-order incentive → quarterly review consult

---

## Industry calculator spec (interactive feature 1)

**Vehicle-Fit Configurator** — user picks year + make + model + trim. Calculator returns:
- Compatible parts list with confidence score
- Estimated install difficulty (DIY / shop-required)
- Bundle pricing vs. piecewise
- "Mod stage" recommendation (stock → mild → built path)

---

## Sizing/recommendation tool spec (interactive feature 2)

**Mod-Path Builder** — user picks current build stage + intended use case. Tool returns:
- Next 3 recommended mods in priority order
- Why each one (weight savings / power / reliability / appearance)
- Estimated cost progression

---

## Service-area heatmap spec (interactive feature 3)

**Track / event density map** — overlay shows:
- SCCA / NASA / track-day venues
- Off-road / overland trail networks
- Rally calendar density by month
- Forum-mention activity clusters

---

## Narrative simulator script (interactive feature 4)

**"Forum thread → forum sale"** 60-second timeline:
1. **0:00** — TacomaWorld user posts "anyone running [Brand]'s skid plate?"
2. **0:10** — Forum mod (affiliate) replies with link → lead lands tagged `tacoma`, `forum-referral`.
3. **0:25** — Vehicle-fit calculator runs → confirms fit → puts in Vehicle-Cohort funnel.
4. **0:40** — Email 1 fires (cohort welcome + top-10 picks PDF).
5. **0:55** — User adds to cart from email link. Lead score crosses 80.
6. **0:60** — Owner-alert: "Hot Tacoma lead just bought from [forum-mod]'s referral."

---

## Real-world data anchors

- **Vehicle mix in mock pool:** Tacoma 18% / JK Wrangler 14% / 4Runner 10% / RZR 8% / Subaru WRX 8% / Mustang 6% / Civic Type R 5% / motorcycles 12% / other 19%.
- **Real forum names to seed:** TacomaWorld · JKOwners · Subaru Outback Forum · Honda-Tech · Pirate4x4 · MotoGPRiders.
- **Real event names:** SEMA · Overland Expo · Rebelle Rally · King of the Hammers · Goodguys.
- **Sample affiliate names:** TraildoutFab · OnAllCylinders · CRAWLPedia · The Track Dump · Brad Builds.
- **Avg deal size for ROI calc:** $340 (DTC enthusiast), $3,400 (shop first order), $12,800 (wholesale recurring).
