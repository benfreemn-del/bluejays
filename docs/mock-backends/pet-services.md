# Mock Backend Config — Pet Services (Grooming / Boarding / Training / Daycare)

> **When to use:** pet groomer, dog daycare, boarding kennel, dog walker, in-home pet sitter, dog trainer.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Recurring grooming | 32% | $60-$140/visit | 4-8wk cycle |
| Daycare member | 18% | $30-$50/day | Highest-LTV recurring |
| Boarding (vacation) | 16% | $40-$90/night | Seasonal peaks |
| Training (puppy / obedience) | 10% | $250-$1,200 package | One-shot or recurring |
| Dog walking (recurring) | 10% | $20-$40/walk | High frequency |
| In-home pet sitting | 6% | $40-$90/visit | Vacation-driven |
| Specialty (deshedding / nail / spa) | 6% | $40-$120 | Add-on revenue |
| Premium training (board-and-train) | 2% | $1.5K-$8K | High-ticket specialty |

## Lead-quality signals
- **`pet_count`** = household pets (multiplies all services)
- **`new_pet`** = recent acquisition = puppy-training pipeline
- **`vacation_dates`** = boarding date-bound urgency
- **`recurring_signal`** = wants weekly daycare / monthly groom (recurring)
- **`affiliate_source`** = vet / pet store / breeder / friend
- **`pet_size`** = drives pricing tier

### Lead score formula
```
score = 30 + 20 if recurring_signal + 18 if new_pet
  + 16 if affiliate_source + 14 if vacation_dates within 14d
  + 12 if pet_count >= 2 + 10 if seasonal_peak (summer / holiday boarding)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Vets | Cross-referrals (grooming / boarding) |
| Pet stores | New-owner welcome packets |
| Breeders | New-puppy training referrals |
| Shelters / rescues | Adoption-day handoffs |
| Realtors | New-resident pet-services welcome |
| HOAs | Multi-tenant approved-vendor lists |
| Pet insurance | Network-tier listings |
| Travel agents | Boarding referrals during vacation prep |

## 4 standard funnels
1. **New-pet welcome** — "first groom 50% off" + puppy-training intro magnet
2. **Recurring daycare member** — multi-day-pack tiered pricing
3. **Boarding pre-vacation** — auto-reminder 30 days out + early-bird discount
4. **Training package** — puppy-class graduation funnel

## Industry calculator spec
**Service Bundle Estimator** — pick services + frequency + pet count. Returns: monthly tier + recurring savings.

## Sizing/recommendation tool spec
**Service Recommender** — owner answers 6 questions about pet + lifestyle. Returns: top 3 services + suggested cadence.

## Service-area heatmap spec
Overlay: pet-license density + recent-move-in zones + commuter-population density (daycare candidates).

## Real-world data anchors
- **Service mix**: grooming 32% / daycare 18% / boarding 16% / training 10% / walking 10% / sitting 6% / specialty 6% / board-and-train 2%
- **Sample affiliates**: Local vets / Petco / Banfield / regional shelters
- **Avg LTV**: $2,400 (grooming annual) / $4,800 (daycare annual member) / $8K+ (multi-pet recurring)
