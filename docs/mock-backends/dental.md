# Mock Backend Config — Dental

> **When to use:** general dental practice, family dentistry, cosmetic, ortho-overlap. Insurance-driven recurring care.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| New-patient cleaning + exam | 36% | $200-$450 | Acquisition cost-of-acquisition |
| Restorative (filling / crown) | 24% | $300-$2,500 | One-shot per tooth |
| Cosmetic (whitening, veneers) | 12% | $400-$8K | Self-pay, high-margin |
| Pediatric | 10% | $150-$400 | Family-acquisition pipeline |
| Emergency (broken tooth) | 8% | $300-$1,800 | Highest urgency |
| Implant / prosthodontic | 6% | $3K-$22K | High-ticket specialty |
| Ortho consult / Invisalign | 4% | $150 (consult) | Cross-promo to ortho |

## Lead-quality signals
- **`new_patient`** = no prior records (acquisition signal)
- **`emergency_flag`** = pain / broken / swelling = HIGH
- **`insurance_in_network`** = drives close speed
- **`cosmetic_intent`** = whitening / veneer / smile-makeover (self-pay WTP)
- **`family_size`** = drives multi-appointment LTV
- **`affiliate_source`** = referring-dentist / OB-GYN / employer-benefits / patient

### Lead score formula
```
score = 30 + 22 if emergency_flag + 18 if cosmetic_intent
  + 16 if affiliate_source + 14 if new_patient AND insurance_in_network
  + 12 if family_size >= 3 + 10 if implant_consult_signal
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Specialist dentists (oral surgeon / ortho / endo) | Reciprocal referrals |
| OB-GYN | Pregnancy-safe-dentistry referrals |
| Pediatrician | Pediatric-dental referrals |
| Employer HR / benefits | Group plan onboarding |
| Insurance brokers | Network-tier listings |
| Cosmetic dermatologists | Smile-makeover crossover |
| Realtors (high-end) | New-resident referral packets |
| Country club / wellness center | Adult cosmetic cohort |

## 4 standard funnels
1. **New-patient acquisition** — "Free first cleaning + X-ray" magnet, insurance-verified
2. **Emergency same-day** — text-to-triage, 4hr-arrival promise
3. **Cosmetic / smile makeover** — virtual smile preview, financing offer
4. **Family / pediatric** — kid-friendly nurture, household-bundle pricing

## Industry calculator spec
**Treatment Plan Estimator** — pick procedure + insurance carrier + tier. Returns: out-of-pocket estimate + financing options + alternate-procedure comparison.

## Sizing/recommendation tool spec
**Smile Goal Recommender** — patient picks 3 cosmetic priorities. Tool returns: recommended procedures + virtual-preview link.

## Service-area heatmap spec
Overlay: insurance-network density + new-resident move-in zones + employer-HQ density (group-plan opportunities).

## Real-world data anchors
- **Procedure mix**: cleaning 32% / filling 18% / crown 12% / cosmetic 12% / pediatric 10% / emergency 8% / implant 6% / other 2%
- **Sample affiliates**: Local oral-surgeon / pediatrician / OB-GYN / Delta Dental / Aetna / Cigna network reps
- **Avg deal**: $280 new-patient / $1,200 restorative / $4,800 cosmetic / $4,200 implant
