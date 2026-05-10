# Mock Backend Config — Chiropractic

> **When to use:** chiropractic clinic — adjustment, sports therapy, prenatal, accident recovery, wellness plans.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| New patient (first visit) | 32% | $90-$220 | Acquisition |
| Recurring care plan member | 26% | $40-$80/visit | Highest LTV (4-12 visits/mo) |
| MVA / personal-injury | 14% | $150-$400/visit | Attorney-aligned, insurance-billed |
| Sports / performance | 10% | $80-$180 | Athlete cohort |
| Prenatal / postpartum | 8% | $80-$150 | OB-GYN referrals |
| Pediatric / family | 6% | $60-$120 | Multi-member household |
| Maintenance ("tune-up") | 4% | $60-$100 | Lapsed-reactivation |

## Lead-quality signals
- **`pain_severity`** = mild / moderate / severe / debilitating
- **`new_patient`** = first-visit flag
- **`insurance_or_self_pay`** = drives plan-tier
- **`MVA_signal`** = recent accident → attorney-paired
- **`prenatal`** = pregnancy stage
- **`affiliate_source`** = MD / OB-GYN / attorney / gym / referral

### Lead score formula
```
score = 30 + 22 if pain_severity in ['severe','debilitating']
  + 20 if MVA_signal + 16 if affiliate_source
  + 14 if new_patient + 12 if prenatal
  + 10 if insurance_in_network
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Personal-injury attorneys | MVA referrals, mutual claim flow |
| OB-GYNs | Prenatal / postpartum |
| Primary-care MDs | Cross-treatment referrals |
| Massage therapists | Cross-promo bundles |
| Gyms / personal trainers | Athlete cohort |
| Acupuncturists | Holistic crossover |
| Insurance adjusters | Auto-claim referrals |
| Employers / wellness programs | Group corporate accounts |

## 4 standard funnels
1. **New-patient pain-relief** — "$49 first visit + assessment" magnet
2. **MVA / accident recovery** — attorney-aligned, insurance-billing nurture
3. **Wellness / care-plan member** — recurring tier with value-of-membership content
4. **Prenatal / postpartum** — OB-aligned, pregnancy-safe-care nurture

## Industry calculator spec
**Visit Frequency Calculator** — patient picks symptom + severity + activity level. Returns: recommended visit cadence + 8-week / 12-week plan cost.

## Sizing/recommendation tool spec
**Pain-Source Recommender** — patient locates pain on body diagram + answers severity questions. Tool returns: likely cause + recommended consult length.

## Service-area heatmap spec
Overlay: gym density (athlete cohort) + accident-incidence zones + OB-GYN clinic density.

## Real-world data anchors
- **Visit mix**: new 32% / care-plan 26% / MVA 14% / sports 10% / prenatal 8% / pediatric 6% / maintenance 4%
- **Sample affiliates**: Personal-injury attorneys (LegalMatch / state bar) / Local OB-GYN / Crossfit affiliate gyms / Anthem / BCBS
- **Avg deal**: $240 new-patient / $2,400 care-plan (12 visits) / $4,800 MVA case
