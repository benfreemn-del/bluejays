# Mock Backend Config — Garage Door

> **When to use:** residential / commercial garage door repair, install, opener, springs, panels.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Emergency / broken-spring | 38% | $250-$650 | Highest urgency |
| Opener replacement | 18% | $400-$1,200 | Smart-opener upsell |
| Full door replacement | 16% | $1,800-$5,500 | New-look upgrade |
| Tune-up / maintenance | 12% | $150-$300 | Member-tier candidate |
| Commercial / industrial | 10% | $1.5K-$25K | Storefronts, warehouses |
| Pre-listing repair | 6% | $250-$1,200 | Realtor-driven |

## Lead-quality signals
- **`emergency_flag`** = stuck-door / broken-spring / car-trapped → HIGH
- **`property_value`** = drives door-replacement WTP
- **`opener_age_yrs`** = 12+ = upgrade candidate
- **`recent_listing`** = pre-sale window
- **`affiliate_source`** = realtor / property-mgmt / contractor

### Lead score formula
```
score = 30 + 24 if emergency_flag + 18 if recent_listing
  + 14 if affiliate_source + 12 if opener_age_yrs >= 12
  + 12 if door_replacement_signal + 10 if seasonal_peak (winter freeze)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing curb appeal |
| Home inspectors | Inspection-flag referrals |
| Property managers | Multi-unit recurring |
| GCs / new-build | Subcontracting on builds |
| Insurance adjusters | Storm / vehicle-damage claims |
| HOAs | Approved-vendor lists |
| Hardware stores | Counter referrals |
| Smart-home installers | Smart-opener pairing |

## 4 standard funnels
1. **Emergency repair** — "what to check before you call" magnet + 24hr response
2. **Opener upgrade (smart)** — feature comparison + financing
3. **Full door replacement** — color/style visualizer + 30-day nurture
4. **Annual tune-up plan** — recurring maintenance member tier

## Industry calculator spec
**Door Replacement Quote** — pick door size + material + insulation + window-options. Returns: cost range + financing.

## Sizing/recommendation tool spec
**Style Visualizer** — upload garage photo + pick style. Returns: 3 mockups w/ style names.

## Service-area heatmap spec
Overlay: housing-age density + storm-event zones (panel damage) + new-construction permit zones.

## Real-world data anchors
- **Job mix**: emergency repair 38% / opener 18% / replacement 18% / tune-up 12% / commercial 10% / other 4%
- **Sample affiliates**: Pillar to Post / Realtor.com top agents / regional property managers
- **Avg deal**: $380 repair / $850 opener / $3,200 replacement
