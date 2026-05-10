# Mock Backend Config — Interior Design

> **When to use:** residential / commercial interior designer — full-service / virtual / staging-overlap / decorator.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Single-room redesign | 32% | $2K-$8K | Sweet-spot tier |
| Whole-home design | 22% | $14K-$80K | Highest-LTV per project |
| New-build design partnership | 12% | $20K-$120K | GC-aligned |
| Renovation design | 14% | $4K-$22K | Pair with GC |
| Virtual / e-design | 8% | $400-$2K | Acquisition + scale |
| Commercial / office | 8% | $8K-$45K | B2B project |
| Staging / pre-listing | 4% | $1.5K-$5K | Realtor-aligned |

## Lead-quality signals
- **`scope`** = single-room / whole-home / new-build / commercial
- **`property_value`** = drives finish-tier WTP
- **`recent_purchase`** = new-homeowner cohort = highest-conversion
- **`design_stage`** = idea / Pinterest-board / sketches / contractor-engaged
- **`affiliate_source`** = realtor / GC / architect / showroom
- **`budget_disclosed`** = serious-buyer signal

### Lead score formula
```
score = 30 + 22 if budget_disclosed + 18 if recent_purchase
  + 16 if affiliate_source + 14 if scope='whole-home'
  + 12 if property_value >= $1M + 10 if design_stage='contractor-engaged'
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | New-homeowner referrals |
| GCs / contractors | Design-build pair |
| Architects | Project partnership |
| Furniture / cabinet showrooms | Cross-promo |
| Stagers (peer) | Specialty handoffs |
| High-end appliance dealers | Kitchen-design pair |
| Painters | Cross-promo on color spec |
| HOAs / luxury condo developers | Approved designer lists |

## 4 standard funnels
1. **New-homeowner welcome** — "first-room consult $250 credit toward design" magnet
2. **Whole-home long-cycle** — 90-day nurture w/ portfolio + style-match quiz
3. **Renovation pair w/ GC** — pre-construction design package
4. **Virtual / e-design** — DIY-curious, scaling-volume tier

## Industry calculator spec
**Project Cost Estimator** — pick scope + sq ft + finish-tier (good/better/best). Returns: design-fee + projected furnishings budget + timeline.

## Sizing/recommendation tool spec
**Style Match** — quiz: 8 visual-preference questions. Returns: style profile + top 3 inspiration boards.

## Service-area heatmap spec
Overlay: home-purchase density (HVI) + new-construction permit density + property-value heatmap (premium-design zones).

## Real-world data anchors
- **Project mix**: single-room 32% / whole-home 22% / renovation 14% / new-build 12% / virtual 8% / commercial 8% / staging 4%
- **Sample affiliates**: AIA Architects / Realtor.com agents / Houzz Pro network / regional showrooms
- **Avg deal**: $4,800 single-room / $32K whole-home / $48K new-build / $1,200 virtual
