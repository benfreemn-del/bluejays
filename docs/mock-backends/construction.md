# Mock Backend Config — Construction (New Build)

> **When to use:** new home construction, custom builds, spec houses, multifamily ground-up. Distinct from general-contractor (which is remodel-led).

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Custom-home build | 36% | $400K-$2.5M | Lot-owned client, 12-18mo cycle |
| Spec house | 16% | $350K-$1.2M | Builder-led, owner = builder |
| Multifamily / townhome | 14% | $1.5M-$22M | Multi-unit, B2B |
| Pre-design consult | 14% | $500-$5K | Architect / lender-paired |
| Land-package + build | 10% | $450K-$1.8M | Land + build bundle |
| Commercial ground-up | 8% | $1.5M-$30M | B2B, very-long cycle |
| ADU / 2nd home | 2% | $180K-$650K | Backyard ADU |

## Lead-quality signals
- **`build_stage`** = idea / land-secured / architect-engaged / permit-ready / financed
- **`budget_disclosed`** = number stated = serious
- **`lot_owned`** = yes / no (no = land-package needed)
- **`financing_pre_qualified`** = yes / no
- **`architect_engaged`** = yes / no (yes = closer to permit)
- **`affiliate_source`** = architect / lender / realtor / land-broker

### Lead score formula
```
score = 30 + 22 if financing_pre_qualified + 18 if build_stage='permit-ready'
  + 16 if affiliate_source + 14 if lot_owned + 12 if architect_engaged
  + 12 if budget_disclosed
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Architects | Most-prized referral source |
| Construction lenders | Pre-qualified buyer pipeline |
| Realtors / land brokers | Land + build referrals |
| Civil engineers | Site-plan partnerships |
| Interior designers | Pre-construction selection partnerships |
| Trade-allies (electrician, plumber, HVAC) | Long-cycle reciprocal |
| HOAs / planned communities | Approved-builder lists |
| Commercial RE brokers | B2B ground-up referrals |

## 4 standard funnels
1. **Custom-home discovery** — long-cycle (90-day+) nurture, portfolio-magazine magnet
2. **Architect-aligned permit-ready** — fast-quote turn, 30-day-start promise
3. **Spec-house investor** — ROI-calculator focused, financing-package emphasis
4. **Pre-design consult** — feasibility study + cost-floor estimate

## Industry calculator spec
**Custom-Build Cost Estimator** — pick sq ft + region + finish-tier + complexity (single-story / multi / hillside). Returns: cost range + 12-month timeline.

## Sizing/recommendation tool spec
**Build-Stage Roadmap** — owner picks current stage + budget + timeline. Tool returns: next 5 actions in priority order + which professionals to engage at each step.

## Service-area heatmap spec
Overlay: vacant-land permit density + recent custom-build permit zones + median-home-value heatmap (premium-build zones).

## Real-world data anchors
- **Job mix**: custom 38% / spec 16% / multifamily 14% / pre-design 14% / land+build 10% / commercial 8%
- **Sample affiliates**: AIA Architects / construction-loan lenders / land-broker network / state HBA
- **Avg deal**: $850K custom / $4.5M multifamily / $1.2M spec / $250K ADU
