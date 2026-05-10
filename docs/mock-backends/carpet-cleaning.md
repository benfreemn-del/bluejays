# Mock Backend Config — Carpet Cleaning

> **When to use:** carpet, upholstery, tile/grout, area rug — residential and commercial.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential whole-home | 38% | $180-$650 | Annual or semi-annual cycle |
| Pre-listing / move-out | 18% | $250-$650 | Realtor-driven, fast-turn |
| Property mgmt turnover | 16% | $200-$700 | Multi-unit recurring |
| Tile & grout | 10% | $300-$900 | Higher-margin specialty |
| Upholstery | 8% | $150-$500 | Add-on or standalone |
| Commercial office | 8% | $400-$2,500 | Quarterly recurring |
| Pet-emergency / spot | 2% | $120-$350 | High-urgency one-offs |

## Lead-quality signals
- **`recent_pet_acquisition`** OR **`pet_accident_signal`** = HIGH urgency
- **`recent_listing`** = pre-sale window
- **`property_size_sq_ft`** = scale signal
- **`prior_service`** = annual-cycle repeat
- **`commercial_size`** = recurring B2B
- **`affiliate_source`** = realtor / property-mgmt / pet-store

### Lead score formula
```
score = 30 + 18 if pet_accident_signal + 18 if recent_listing
  + 16 if affiliate_source + 14 if commercial_size != null
  + 12 if prior_service + 10 if seasonal_peak (spring + holidays)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing prep |
| Property managers | Tenant turnover |
| Pet stores / vets | Pet-accident referrals |
| Movers | Move-out / move-in pair |
| Stagers | Pre-listing partnership |
| HOAs | Multi-property recurring |
| Allergists / health | Allergy-driven cleaning |
| Cleaning companies | Cross-promo bundle |

## 4 standard funnels
1. **Annual whole-home** — recurring member-tier offering
2. **Pre-listing prep** — realtor-aligned, 48hr turn
3. **Pet-accident emergency** — same-day promise, fragrance-safe magnet
4. **Commercial quarterly** — B2B recurring contract

## Industry calculator spec
**Square-Footage Quote** — pick rooms + carpet vs. tile vs. upholstery. Returns: cost + member-tier discount.

## Sizing/recommendation tool spec
**Stain-Type Recommender** — describe stain + age + carpet type. Returns: removal-confidence score + appropriate method.

## Service-area heatmap spec
Overlay: real-estate listing density + pet-license density + multi-unit property density.

## Real-world data anchors
- **Job mix**: whole-home 38% / pre-listing 18% / property-mgmt 16% / tile 10% / commercial 8% / other 10%
- **Sample affiliates**: Petco / regional vets / Realtor.com agents / property managers
- **Avg deal**: $320 residential / $480 pre-listing / $1,400 commercial
