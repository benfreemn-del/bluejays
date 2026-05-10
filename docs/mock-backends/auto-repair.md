# Mock Backend Config — Auto Repair

> **When to use:** independent repair shop, specialty (transmission / European / diesel), tire / lube / quick-service, fleet / commercial.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Routine maintenance (oil / inspect / tire) | 32% | $60-$280 | Acquisition + recurring |
| Diagnostic + repair | 24% | $280-$1,500 | Sweet-spot tier |
| Major repair (transmission / engine) | 12% | $1.5K-$5K | Highest-margin specialty |
| Brakes / suspension | 12% | $300-$1,200 | Frequent recurring |
| Recurring fleet / commercial | 8% | $400-$3K/mo | B2B recurring |
| Pre-purchase inspection | 6% | $100-$200 | Used-car buyer cohort |
| Specialty (European / diesel) | 4% | $400-$3K | Premium niche |
| Body / collision | 2% | $400-$8K | Insurance-billed |

## Lead-quality signals
- **`urgency_signal`** = won't-start / overheating / brake-grinding = HIGH
- **`mileage`** = service-cycle position (60K / 90K / 120K = major-service due)
- **`vehicle_age_yrs`** = older = more frequent repairs
- **`prior_shop_lapse`** = ex-customer of competitor = ready to switch
- **`affiliate_source`** = auto-dealer / insurance / fleet / referral
- **`fleet_signal`** = commercial fleet = recurring B2B

### Lead score formula
```
score = 30 + 24 if urgency_signal + 18 if mileage_milestone (60K/90K/120K)
  + 16 if affiliate_source + 14 if fleet_signal
  + 12 if prior_shop_lapse + 10 if vehicle_age_yrs >= 8
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Auto dealers (post-warranty handoff) | Out-of-warranty service |
| Used-car dealers | Pre-sale / sale-prep referrals |
| Insurance adjusters | Body / collision referrals |
| Fleet managers | Commercial B2B recurring |
| Towing companies | Tow-to-shop partnerships |
| Other shops (peer / specialty) | Cross-niche referrals |
| Auto-parts stores | Counter referrals |
| Driving schools / clubs | Maintenance-cohort referrals |

## 4 standard funnels
1. **Maintenance reminder** — mileage / time-driven oil + inspection auto-text
2. **Major-service milestone** — 60K / 90K / 120K nurture w/ peace-of-mind package
3. **Fleet / commercial B2B** — quarterly ROI + recurring contract pitch
4. **Pre-purchase inspection** — used-car buyer landing page, fast turnaround

## Industry calculator spec
**Service Cost Estimator** — pick service + vehicle type. Returns: cost range + recommended-service-bundle.

## Sizing/recommendation tool spec
**Symptom Helper** — owner answers 6 questions about symptom. Returns: likely repair + cost range + safety-to-drive flag.

## Service-area heatmap spec
Overlay: vehicle-registration density + commuter-corridor density + competitor-shop density.

## Real-world data anchors
- **Service mix**: maintenance 32% / diagnostic 24% / major 12% / brakes 12% / fleet 8% / pre-purchase 6% / specialty 4% / body 2%
- **Sample affiliates**: Local AAA / regional fleet managers / used-car dealers / Yelp shop network
- **Avg LTV**: $2,400 (annual residential customer 4 visits) / $24K (fleet annual recurring) / $4,800 (specialty European customer multi-yr)
