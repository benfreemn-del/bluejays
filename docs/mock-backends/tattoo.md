# Mock Backend Config — Tattoo Studio

> **When to use:** custom tattoo, walk-in shop, fine-line specialist, traditional, cover-up specialist.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Custom large-piece | 22% | $800-$3,500 | Multi-session, highest-LTV |
| Walk-in / flash | 24% | $80-$400 | High-volume, low-ticket |
| Small custom (single-session) | 28% | $250-$650 | Sweet-spot tier |
| Cover-up / re-work | 10% | $400-$1,400 | Higher-margin specialty |
| Memorial / commemorative | 8% | $300-$900 | Time-bound urgency |
| Sleeve / body-suit (long-cycle) | 6% | $4K-$22K total | 12-30 session multi-year |
| Apprentice work | 2% | $40-$200 | Acquisition / training |

## Lead-quality signals
- **`design_attached`** = uploaded reference = serious buyer
- **`size_estimate`** = small / medium / large / sleeve (drives ticket)
- **`event_date`** = memorial / anniversary date-driven
- **`prior_tattoos`** = repeat-client cohort
- **`cover_up_signal`** = existing-tattoo-fix (premium)
- **`affiliate_source`** = artist / friend referral / Instagram / event

### Lead score formula
```
score = 30 + 22 if design_attached + 18 if cover_up_signal
  + 16 if affiliate_source + 14 if size_estimate in ['large','sleeve']
  + 12 if event_date <= 60d + 10 if prior_tattoos
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Tattoo artists (peer) | Specialty referrals |
| Body-piercer / mod-shops | Adjacent client base |
| Barbershops / salons | Style-conscious cohort |
| Concert / music venues | Event-cohort referrals |
| Streetwear / clothing brands | Aesthetic crossover |
| Influencers / IG creators | Visual-promo lift |
| Wedding photographers | Memorial / commemoration |
| Cosplay / convention orgs | Event-tied fan-art tattoos |

## 4 standard funnels
1. **Custom-design discovery** — "design submission" magnet, 7-day artist-quote turn
2. **Walk-in flash** — same-week availability + IG-flash gallery
3. **Cover-up specialist** — premium landing page w/ before/after gallery
4. **Long-cycle sleeve** — 12-month nurture w/ progress photos + per-session reminders

## Industry calculator spec
**Tattoo Cost Estimator** — pick size / placement / detail-level / color-vs-bw. Returns: hour estimate + cost range + session count.

## Sizing/recommendation tool spec
**Placement Helper** — quiz: pain-tolerance + visibility + healing time. Returns: top 3 placement recommendations.

## Service-area heatmap spec
Overlay: concert-venue density + tattoo-friendly demographics + cosplay-event calendar zones.

## Real-world data anchors
- **Service mix**: walk-in 24% / small custom 28% / large custom 22% / cover-up 10% / memorial 8% / sleeve 6% / apprentice 2%
- **Sample affiliates**: IG @inkmasters network / regional barbershops / streetwear brands
- **Avg LTV**: $4,800 (sleeve multi-year) / $1,200 (annual recurring client) / $480 (single-session avg)
