# Mock Backend Config — Plumber

> **When to use:** any residential / commercial plumbing service —
> drain cleaning, pipe repair, water-heater install, repipe, sewer.
> Mirrors electrician shape (emergency-driven home service).

## Customer category mix

| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential service | 58% | $250-$2,800 | Drain unclog → water-heater → repipe ladder |
| Property mgmt | 16% | $400-$5,000 | Multi-property recurring |
| Commercial service | 12% | $800-$8,000 | Restaurants, offices, retail |
| New-construction (GC sub) | 8% | $4K-$22K | Build pipeline + rough-in |
| Real-estate (pre-listing/inspection) | 4% | $400-$1,800 | Pre-sale repair |
| Emergency (24-hr after-hours) | 2% | $400-$3,500 | Highest-margin per-call |

## Lead-quality signals
- **`emergency_flag`** = burst-pipe / no-hot-water / sewer-backup. Highest urgency.
- **`property_age_yrs`** = older = more pipe failures (60+ years = repipe candidate)
- **`property_value`** = drives water-heater tier (tankless vs. tank)
- **`recent_water_event`** = freeze / storm / flood within 14 days = high urgency
- **`commercial_sq_ft`** = scale signal
- **`affiliate_source`** = realtor / inspector / property-mgmt / contractor referral

### Lead score formula
```
score = 30 + 22 if emergency_flag + 14 if affiliate_source
  + 18 if recent_water_event + 14 if property_age_yrs >= 60
  + 12 if repeat_customer + 10 if seasonal_peak (Dec-Feb freeze, Jul heat)
  + 10 if commercial_sq_ft > 10000
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why they refer |
|---|---|
| Real-estate agents | Pre-listing inspections flag plumbing |
| Home inspectors | Inspection reports trigger fixes |
| HVAC contractors | Mutual referrals, water-heater overlap |
| Property managers | Multi-property recurring needs |
| General contractors | Sub-contracting on every build |
| Restoration / water-damage | Post-loss repipe + cleanup pair |
| Insurance adjusters | Claim-driven referrals |
| Building supply / hardware store | Counter-staff recommendations |

## 4 standard funnels
1. **Emergency homeowner** — burst-pipe / no-hot-water lead magnet "5 things to do RIGHT NOW while you wait" + 24hr SMS-back
2. **Pre-purchase inspection** — realtor-aligned, "pre-listing plumbing checklist" PDF
3. **Property mgmt B2B** — "Multi-property quarterly maintenance plan" tier sheet
4. **Re-pipe / water-heater upgrade** — older-home owner, 30-day nurture w/ ROI calculator

## Industry calculator spec
**Water Heater Replacement ROI** — pick current heater type/age + monthly bill + household size. Returns: tankless vs. tank vs. hybrid recommendation + 10-yr cost projection + tax-credit eligibility.

## Sizing/recommendation tool spec
**Repipe Risk Assessment** — pick property age + pipe material + recent issues. Returns: risk score 0-100 + estimated cost range + "do it now vs. monitor" recommendation.

## Service-area heatmap spec
Overlay: storm/freeze events last 30d + permit-pull density (new construction signals) + age-of-housing zones (repipe candidate clusters).

## Real-world data anchors
- **Job mix**: drain 28% / water-heater 18% / leak repair 16% / repipe 12% / sewer 10% / fixture install 16%
- **Sample affiliates**: Coldwell Banker / RE/MAX / Pillar to Post / The Property Mgmt Co.
- **Avg deal**: $580 service / $4,200 water-heater / $14,800 repipe
