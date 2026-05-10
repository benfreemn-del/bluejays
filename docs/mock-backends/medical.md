# Mock Backend Config — Medical (Primary Care / Family Practice)

> **When to use:** primary care, family medicine, internal medicine, pediatrics solo / group practice. Insurance-driven recurring care.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| New-patient establish-care | 28% | $250-$450 | Acquisition |
| Annual physical / wellness | 24% | $180-$320 | Insurance-covered |
| Sick visit | 18% | $120-$240 | Episodic |
| Chronic-care management | 14% | $150-$280/visit | Highest LTV (recurring) |
| Pediatric / well-child | 8% | $120-$220 | Family-acquisition |
| Telemedicine / virtual | 6% | $80-$160 | Convenience tier |
| Concierge / direct-pay | 2% | $1.5K-$5K/yr | Premium tier |

## Lead-quality signals
- **`new_patient`** = no records (acquisition signal)
- **`urgency_signal`** = symptom severity → same-day vs. routine
- **`chronic_condition`** = diabetes / HTN / etc. = recurring-care candidate
- **`insurance_in_network`** = drives close speed
- **`family_size`** = drives multi-member household LTV
- **`affiliate_source`** = OB-GYN / specialist / employer / urgent-care

### Lead score formula
```
score = 30 + 22 if urgency_signal='same-day' + 18 if chronic_condition
  + 16 if affiliate_source + 14 if new_patient AND insurance_in_network
  + 12 if family_size >= 3 + 8 if concierge_signal
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Specialists (cardio / endo / GI / etc.) | Reciprocal referral network |
| OB-GYNs | New-mom + postpartum referrals |
| Urgent care | Continuity-of-care handoffs |
| Employer HR | Group plan onboarding |
| Insurance brokers | Network-tier listings |
| School / college clinics | Parent-of-student referrals |
| Senior-living / care facilities | Residents needing PCP |
| Pharmacies | Med-management partnerships |

## 4 standard funnels
1. **New-patient establish** — "same-week new-patient appointment" magnet
2. **Annual wellness reminder** — recurring annual cycle, insurance-covered emphasis
3. **Chronic-care management** — diabetes / HTN protocol nurture
4. **Concierge / direct-pay** — premium-tier landing page + benefits comparison

## Industry calculator spec
**Insurance Coverage Estimator** — pick visit type + insurance carrier. Returns: out-of-pocket estimate.

## Sizing/recommendation tool spec
**Symptom Triage** — patient answers 8 questions. Returns: same-day / routine / specialist routing recommendation.

## Service-area heatmap spec
Overlay: insurance-network density + new-resident move-in zones + employer-HQ density.

## Real-world data anchors
- **Visit mix**: new-patient 28% / wellness 22% / sick 18% / chronic 14% / pediatric 8% / virtual 6% / concierge 4%
- **Sample affiliates**: Local OB-GYN / specialists / Aetna / BCBS / Cigna network reps / employer HRs
- **Avg LTV per patient**: $1,800 (avg multi-yr) / $4,800 (chronic-care multi-visit) / $5,000+ (concierge annual)
