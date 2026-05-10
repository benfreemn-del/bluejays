# Mock Backend Config — Veterinary

> **When to use:** small-animal practice, mixed-animal, exotic, emergency / specialty.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Wellness / annual exam | 36% | $120-$320 | Recurring annual cycle |
| Sick visit | 22% | $180-$650 | Diagnostic + treatment |
| Surgery / dental | 14% | $400-$3,500 | Higher-margin scheduled |
| Emergency / after-hours | 10% | $300-$2,500 | Highest urgency |
| Boarding / grooming | 8% | $40-$120/day | Recurring auxiliary |
| Senior / chronic care | 6% | $150-$500/visit | Highest-LTV per pet |
| New puppy/kitten package | 4% | $300-$650 | Acquisition pipeline |

## Lead-quality signals
- **`new_pet`** = puppy/kitten in last 30 days = HIGH acquisition value
- **`pet_count`** = household pet count
- **`urgency_signal`** = symptom severity (vomit / blood / collapse → emergency)
- **`pet_age`** = senior (7+ for dog, 10+ for cat) = chronic-care candidate
- **`insurance_carrier`** = drives plan-tier acceptance
- **`affiliate_source`** = breeder / shelter / pet-store / groomer

### Lead score formula
```
score = 30 + 24 if urgency_signal='severe' + 18 if new_pet
  + 16 if affiliate_source + 14 if pet_count >= 3
  + 12 if pet_age='senior' + 10 if seasonal_peak (Apr-Jun parasite, Oct-Nov holiday)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Breeders | New-puppy / kitten pipeline |
| Shelters / rescue orgs | Adoption-day welcome partnerships |
| Pet stores | New-owner welcome packets |
| Groomers | Cross-promo bundles |
| Trainers | New-puppy training referrals |
| Specialty vets (cardio / onco / derma) | Cross-referrals |
| Pet insurance | Network-tier listings |
| Dog walkers / sitters | Cross-promo network |

## 4 standard funnels
1. **New-pet welcome** — "First-Year Pet Care Guide" + intro-visit discount
2. **Annual wellness reminder** — recurring vaccines + dental cleaning bundle
3. **Senior-care preventive** — "is your dog/cat aging well?" diagnostic-package magnet
4. **Emergency same-day** — text-to-triage, 30-min response promise

## Industry calculator spec
**Pet Care Cost Estimator** — pick species + age + health status. Returns: annual care budget + 5-yr projection + insurance ROI.

## Sizing/recommendation tool spec
**Symptom Triage Helper** — owner answers 6 questions about pet symptom. Returns: urgency level + visit-or-monitor recommendation + safe-to-wait window.

## Service-area heatmap spec
Overlay: pet-license density + pet-store density + emergency-care zones (after-hours coverage gaps).

## Real-world data anchors
- **Visit mix**: wellness 36% / sick 22% / surgery 14% / emergency 10% / boarding 8% / senior 6% / new-pet 4%
- **Sample affiliates**: Local breeders / Humane Society / Petco / regional groomers / Nationwide / Trupanion / Healthy Paws insurance
- **Avg LTV per pet**: $4,800 (lifetime wellness) / $14K (chronic-care senior) / $850 (annual avg)
