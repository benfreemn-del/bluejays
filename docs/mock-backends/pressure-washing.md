# Mock Backend Config — Pressure Washing

> **When to use:** residential / commercial pressure washing — house exterior, driveway, deck, roof soft-wash, concrete cleaning.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential exterior | 38% | $250-$900 | House siding + driveway |
| Pre-listing prep | 16% | $400-$1,200 | Realtor-driven, fast-turn |
| Roof soft-wash | 14% | $400-$1,500 | Algae / moss / stain |
| Commercial / storefront | 12% | $300-$2,500 | Recurring-cycle |
| Deck / fence wash | 10% | $200-$650 | Pre-stain prep |
| Recurring maintenance | 10% | $250/visit | Member-tier |

## Lead-quality signals
- **`recent_listing`** = pre-sale window, high urgency
- **`property_value`** = drives WTP
- **`spring_summer_window`** = Apr-Sep peak season
- **`mold_visible`** = explicit pain-point trigger
- **`affiliate_source`** = realtor / stager / property-mgmt
- **`prior_service`** = repeat-customer signal

### Lead score formula
```
score = 30 + 18 if recent_listing + 16 if affiliate_source
  + 14 if mold_visible (explicit pain)
  + 12 if seasonal_peak + 12 if prior_service
  + 10 if property_value >= $500K
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing curb appeal |
| Stagers | Pre-listing partnerships |
| Painters | Pre-paint surface prep |
| Property managers | Multi-property recurring |
| Roofers | Soft-wash extends roof life |
| HOAs | Multi-home recurring |
| Window cleaners | Cross-promo bundle |
| Cleaning companies | Indoor + outdoor combo |

## 4 standard funnels
1. **Pre-listing prep** — realtor-aligned, 48hr turnaround promise
2. **Annual spring kickoff** — member-tier recurring offering
3. **Mold / algae remediation** — soft-wash specialist landing page
4. **Commercial storefront contract** — quarterly recurring B2B

## Industry calculator spec
**Square-Footage Quote** — pick surfaces (siding/driveway/deck/roof) + sq ft. Returns: bundle cost + standalone-piece cost.

## Sizing/recommendation tool spec
**Surface-Specific Recommender** — pick surface material + visible issue. Returns: appropriate cleaning method (PSI / detergent / soft-wash) + before/after expectation photos.

## Service-area heatmap spec
Overlay: real-estate listing density + housing-age zones + recent-rain density (algae cycle).

## Real-world data anchors
- **Job mix**: house-exterior 35% / driveway 22% / roof soft-wash 14% / deck 12% / commercial 10% / fence 7%
- **Sample affiliates**: Realtor.com top agents / regional staging companies / regional roofers
- **Avg deal**: $480 residential / $1,800 commercial / $750 roof soft-wash
