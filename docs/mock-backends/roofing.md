# Mock Backend Config — Roofing

> **When to use:** residential roof repair / replacement / inspection.
> Storm-driven demand, insurance-claim heavy, very-high seasonal swings.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential storm-damage / claim | 38% | $8K-$32K | Insurance-claim driven |
| Residential planned replacement | 24% | $10K-$45K | Age-driven, 20-30yr cycle |
| Residential repair | 14% | $400-$3,500 | Leaks, missing shingles |
| Commercial flat-roof | 10% | $20K-$120K | Office, retail, warehouse |
| New-construction (GC sub) | 8% | $15K-$80K | Build pipeline |
| Inspection / pre-purchase | 6% | $250-$650 | Realtor-aligned |

## Lead-quality signals
- **`recent_storm_event`** = hail / wind / hurricane within 30 days = HIGH
- **`roof_age_yrs`** = 18+ = replacement window
- **`property_value`** = drives material tier (asphalt → metal → tile)
- **`insurance_claim_open`** = active-claim signal — premium lead
- **`affiliate_source`** = realtor / inspector / public-adjuster / contractor
- **`zip_storm_history`** = NOAA storm-cell density score for prior 12mo

### Lead score formula
```
score = 30 + 24 if recent_storm_event + 20 if insurance_claim_open
  + 16 if roof_age_yrs >= 18 + 14 if affiliate_source
  + 12 if zip_storm_history >= 70
  + 10 if property_value >= $500K (premium materials WTP)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Public adjusters | Insurance-claim referrals |
| Real-estate agents | Pre-listing repair / replacement |
| Home inspectors | Inspection-report driven |
| Insurance agents | Claim-network partnerships |
| Gutter contractors | Pair with new roof |
| Storm-restoration network | Catastrophe-cycle wholesale referrals |
| HOA managers | Multi-property recurring |
| Solar installers | Roof-replacement-before-solar pairing |

## 4 standard funnels
1. **Storm-damage claim** — "5 things to do AFTER a hailstorm" magnet + within-24hr inspection
2. **Age-driven replacement** — 30-day ROI nurture w/ material comparison
3. **Insurance-claim navigator** — public-adjuster-aligned, "claim documentation kit" PDF
4. **Pre-listing inspection** — realtor-aligned, fast turnaround report

## Industry calculator spec
**Roof Replacement Cost Estimator** — pick sq ft + pitch + material tier + region. Returns: range + financing options + insurance-claim coverage estimate.

## Sizing/recommendation tool spec
**Material Recommender** — pick climate + budget + aesthetic preference. Returns: top 3 materials w/ pros/cons + 30-yr cost projection.

## Service-area heatmap spec
Overlay: NOAA storm-cell density last 30/60/90d + insurance-claim-density zones + roof-age-by-zone (housing-stock data).

## Real-world data anchors
- **Job mix**: storm 38% / replacement 26% / repair 18% / commercial 10% / inspection 8%
- **Sample affiliates**: State Farm Adjuster Network · GAF Master Elite contractors · public-adjuster directory
- **Avg deal**: $14,800 residential / $42,000 commercial flat / $750 repair
