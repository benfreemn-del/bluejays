# Mock Backend Config — HVAC

> **When to use:** residential / commercial HVAC — install, repair,
> maintenance, indoor air quality, ductwork. Strong seasonal arc.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential service / repair | 48% | $200-$1,200 | Tune-up / repair |
| Residential install | 18% | $5K-$22K | Furnace/AC/heat-pump replacement |
| Commercial service | 14% | $800-$8K | Restaurants, retail, offices |
| Maintenance plan member | 10% | $200/yr | Highest LTV recurring |
| New construction | 6% | $8K-$45K | GC subs, build pipeline |
| Indoor air quality / IAQ | 4% | $800-$4,500 | Filtration, UV, humidifiers |

## Lead-quality signals
- **`unit_age_yrs`** = 12+ = imminent replacement
- **`property_sq_ft`** + **`current_unit_tonnage`** = sizing fit
- **`utility_bill_monthly`** = retrofit ROI candidate
- **`recent_failure`** = high urgency; emergency
- **`heat_pump_eligible`** = local rebates (drives cohort)
- **`affiliate_source`** = realtor / inspector / GC / property-mgmt

### Lead score formula
```
score = 30 + 22 if recent_failure + 16 if unit_age_yrs >= 12
  + 14 if affiliate_source + 14 if heat_pump_eligible (rebate window)
  + 18 if seasonal_peak (Jul-Aug, Dec-Feb) + 12 if utility_bill > $250
  + 12 if maintenance_plan_member
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing system inspection |
| Home inspectors | Inspection-report driven |
| Electricians | Heat-pump / panel-upgrade pair |
| Property managers | Multi-unit recurring |
| GCs / new-build | Subcontracting on every build |
| Restoration contractors | Post-loss replacement |
| Solar installers | Heat-pump + solar pairing |
| Utility rebate program | Rebate-tracking partnership |

## 4 standard funnels
1. **Emergency repair** — "what to check before you call" magnet + 24hr SMS callback
2. **System replacement** — 30-day nurture w/ rebate ROI calculator + financing offer
3. **Maintenance plan** — "free spring tune-up" → recurring annual member
4. **IAQ family-health** — allergy-driven funnel for purifier/UV/humidifier upsell

## Industry calculator spec
**System Replacement ROI** — current age + monthly bill + sq ft → recommended tonnage + heat-pump vs. furnace + 10-yr utility projection + rebate eligibility.

## Sizing/recommendation tool spec
**Manual-J Estimator (lite)** — sq ft + zone + insulation tier → BTU range + system tier recommendation.

## Service-area heatmap spec
Overlay: heat-wave / cold-snap events last 30d + housing-age zones + utility rebate program zones.

## Real-world data anchors
- **Job mix**: tune-up 30% / repair 25% / replacement 20% / maintenance plan 15% / IAQ 10%
- **Sample affiliates**: Pillar to Post · State Farm rebate program · regional utility (PSE/Duke/etc.)
- **Avg deal**: $320 repair / $9,800 system replacement / $600 IAQ install
