# Mock Backend Config — Cleaning Service (Residential / Commercial)

> **When to use:** house cleaning, deep-clean, move-in/out, Airbnb / vacation-rental turn, commercial janitorial.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Recurring residential (weekly/bi-weekly) | 36% | $120-$280/visit | Highest LTV |
| Move-in/out cleaning | 18% | $300-$800 | Realtor-driven |
| Deep clean / one-time | 14% | $250-$650 | Acquisition |
| Airbnb / vacation-rental turn | 12% | $90-$220/turn | Recurring high-frequency |
| Commercial / office | 10% | $400-$2,500/mo | B2B recurring |
| Post-construction | 6% | $400-$2,000 | GC partnerships |
| Specialty (carpet / window / fridge) | 4% | $80-$300 | Add-on |

## Lead-quality signals
- **`recurring_signal`** = wants weekly / bi-weekly = highest LTV
- **`move_event`** = move-in / move-out = time-bound urgency
- **`airbnb_signal`** = vacation-rental owner = recurring high-frequency
- **`commercial_size`** = sq ft = B2B scale
- **`affiliate_source`** = realtor / property-mgmt / Airbnb-host group / GC
- **`prior_cleaning_lapse`** = ex-customer of competitor

### Lead score formula
```
score = 30 + 22 if recurring_signal + 18 if airbnb_signal
  + 18 if move_event + 16 if affiliate_source
  + 14 if commercial_size != null + 12 if prior_cleaning_lapse
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Move-out cleaning referrals |
| Property managers | Tenant turnover recurring |
| Airbnb / VRBO host groups | Recurring turn referrals |
| Movers | Move-in/out cleaning pair |
| Stagers | Pre-listing partnership |
| GCs / remodelers | Post-construction cleanup |
| Office facility managers | Janitorial recurring |
| HOAs | Approved-vendor lists |

## 4 standard funnels
1. **Recurring residential member** — "first clean $99 + auto-rebook discount" magnet
2. **Move-in/out** — realtor-aligned 48hr turn
3. **Airbnb / VRBO turn** — host-aligned recurring tier with checklist photos
4. **Commercial / office contract** — quarterly recurring B2B with scope-of-work doc

## Industry calculator spec
**Cleaning Cost Estimator** — pick sq ft + bedrooms / bathrooms + pets + frequency. Returns: per-visit cost + recurring tier savings.

## Sizing/recommendation tool spec
**Service Recommender** — owner picks priorities (deep / surface / pet-friendly / eco). Returns: top tier match + checklist preview.

## Service-area heatmap spec
Overlay: real-estate listing density + Airbnb / VRBO listing density + multi-tenant property density.

## Real-world data anchors
- **Service mix**: recurring 36% / move-in/out 18% / deep 14% / airbnb 12% / commercial 10% / post-construction 6% / specialty 4%
- **Sample affiliates**: Realtor.com agents / Airbnb host meetups / regional property managers
- **Avg LTV**: $4,200 (annual recurring) / $480 (move-out one-shot) / $14K/yr (Airbnb host) / $24K/yr (commercial recurring)
