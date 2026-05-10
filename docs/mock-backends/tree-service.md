# Mock Backend Config — Tree Service

> **When to use:** tree removal, trimming, stump grinding, emergency storm cleanup, arborist consultations.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Storm emergency (24hr) | 28% | $800-$6,000 | Fallen-tree / hazard removal |
| Residential trim / maintenance | 24% | $400-$1,800 | Annual-cycle |
| Residential removal | 18% | $1,200-$5,500 | Hazard / dead / view |
| Stump grinding | 10% | $200-$700 | Standalone or tied-to-removal |
| Commercial / property mgmt | 12% | $2K-$22K | Multi-property recurring |
| Arborist consult / preservation | 8% | $250-$800 | Higher-value-property cohort |

## Lead-quality signals
- **`recent_storm_event`** = wind / ice within 14 days = HIGH urgency
- **`hazard_proximity`** = tree leaning over house / power line
- **`property_value`** = drives WTP for preservation vs. removal
- **`tree_count`** = single / few / lot-clearing
- **`affiliate_source`** = realtor / property-mgmt / insurance / arborist
- **`recent_arborist_consult`** = secondary-opinion shopper, time-bound

### Lead score formula
```
score = 30 + 24 if recent_storm_event + 20 if hazard_proximity='power-line/structure'
  + 14 if affiliate_source + 14 if tree_count='lot-clearing'
  + 12 if property_value >= $700K (preservation WTP) + 8 if seasonal_peak (Apr-Jun, Oct-Nov)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing tree health + view |
| Property managers | Liability + recurring |
| Insurance adjusters | Storm-claim referrals |
| Roofers | Storm-damage co-work |
| Utility companies | Power-line clearance subcontracts |
| Landscapers | Yard-overhaul partnerships |
| Pest / disease specialists | Tree-disease handoff |
| HOAs | Approved-vendor lists |

## 4 standard funnels
1. **Post-storm emergency** — "5 things to do AFTER a tree falls" magnet + 24hr response
2. **Annual-trim plan** — "spring assessment" recurring offering, member-tier pricing
3. **Lot-clearing project** — multi-tree quote tool, 30-day nurture w/ property-prep tips
4. **Preservation / arborist** — high-value-property cohort, consult-first funnel

## Industry calculator spec
**Tree Job Estimator** — pick tree height + species + access + complexity. Returns: cost range + insurance-claim eligibility flag + permit-required check.

## Sizing/recommendation tool spec
**Health Assessment** — owner uploads photo + answers 5 questions. Returns: tree health score + recommended action (treat / monitor / remove).

## Service-area heatmap spec
Overlay: NOAA storm cells last 14d + hazard-tree heatmap (older neighborhoods) + utility-line clearance zones.

## Real-world data anchors
- **Job mix**: emergency 30% / trim 26% / removal 20% / stump 10% / commercial 8% / arborist 6%
- **Sample affiliates**: State Farm Adjuster Network · regional utility (PSE, Duke, ConEd)
- **Avg deal**: $1,400 trim / $2,800 removal / $4,200 storm-emergency
