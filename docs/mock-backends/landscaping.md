# Mock Backend Config — Landscaping

> **When to use:** lawn-care / mowing / hardscape / design-build / commercial maintenance / tree care.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Recurring lawn maintenance | 38% | $40-$120/visit | Weekly/bi-weekly cycle, highest LTV |
| One-time cleanup / project | 16% | $400-$2,500 | Spring / fall cleanups |
| Hardscape (patio / retaining wall) | 14% | $4K-$28K | High-margin design-build |
| Landscape design / install | 12% | $3K-$22K | Architect-tier projects |
| Commercial / property mgmt | 10% | $400-$8K/mo | Highest recurring B2B |
| Tree / shrub planting | 6% | $400-$3,500 | Specialty seasonal |
| Pre-listing prep | 4% | $300-$1,200 | Realtor-driven |

## Lead-quality signals
- **`property_size_acres`** = drives ticket
- **`property_value`** = drives finish-tier WTP
- **`recent_listing`** = pre-sale prep window
- **`seasonal_signal`** = spring cleanup / fall prep / pre-event
- **`hardscape_intent`** = patio / wall = high-ticket
- **`affiliate_source`** = realtor / GC / interior-designer / property-mgmt

### Lead score formula
```
score = 30 + 18 if recent_listing + 18 if hardscape_intent
  + 16 if affiliate_source + 14 if property_size_acres >= 0.5
  + 12 if property_value >= $700K + 10 if seasonal_peak (Mar-Oct)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Pre-listing curb-appeal |
| Property managers | Multi-property recurring |
| GCs / new-build | Subcontracting on builds |
| Interior designers | Outdoor-living partnerships |
| Pool installers | Hardscape pair |
| Tree services | Cross-promo on yard projects |
| HOAs | Approved-vendor lists |
| Garden centers | Counter referrals |

## 4 standard funnels
1. **Recurring weekly mow** — "free first mow + curb-appeal assessment" magnet
2. **Spring cleanup** — March-April annual recurring kickoff
3. **Hardscape design-build** — 30-day high-ticket nurture with portfolio + financing
4. **Commercial / property mgmt** — quarterly recurring B2B contract

## Industry calculator spec
**Project Cost Estimator** — pick scope (lawn / patio / wall / planting) + sq ft / linear ft. Returns: cost range + timeline + permit-needed Y/N.

## Sizing/recommendation tool spec
**Yard Plan Recommender** — owner picks goals + budget + maintenance tolerance. Returns: top 3 project recommendations + sequencing.

## Service-area heatmap spec
Overlay: housing-value heatmap (premium-yard zones) + new-construction permit density + competitor-density.

## Real-world data anchors
- **Service mix**: lawn 38% / cleanup 16% / hardscape 14% / design 12% / commercial 10% / tree 6% / pre-listing 4%
- **Sample affiliates**: Realtor.com agents / regional property managers / Belgard / Pavestone
- **Avg deal**: $80/visit lawn / $14K hardscape / $14K design-install / $4K/mo commercial recurring
