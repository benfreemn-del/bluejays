# Mock Backend Config — Moving / Relocation

> **When to use:** local / long-distance moving, residential / commercial / specialty (piano / art / safe).

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Local residential (within 50mi) | 42% | $400-$2,500 | Most volume |
| Long-distance / interstate | 18% | $3K-$14K | Higher-margin |
| Apartment / studio | 14% | $300-$900 | Younger cohort, repeat |
| Commercial / office | 8% | $4K-$28K | Recurring B2B |
| Senior / assisted-living | 6% | $1.5K-$5K | Specialty white-glove |
| Storage + move | 6% | $400-$1,800 + storage | Mid-cycle |
| Specialty (piano / art / safe) | 4% | $400-$2,500 | High-margin specialty |
| Pre-listing staging move | 2% | $400-$1,500 | Realtor-driven |

## Lead-quality signals
- **`move_date`** = date locked = HIGH urgency
- **`distance_miles`** = drives ticket
- **`property_size`** = bedroom count + sq ft
- **`affiliate_source`** = realtor / corporate-relo / senior-advisor / property-mgmt
- **`commercial_signal`** = office-move B2B
- **`specialty_item`** = piano / safe / art = premium

### Lead score formula
```
score = 30 + 24 if move_date <= 30d + 18 if distance_miles >= 500
  + 16 if affiliate_source + 14 if commercial_signal
  + 12 if specialty_item + 10 if seasonal_peak (May-Sep peak season)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Move-coincides-with-close |
| Corporate HR / relo | Employee-relo referrals |
| Senior-living advisors | Downsizing referrals |
| Storage facilities | Storage + move bundles |
| Cleaners | Move-in/out cleaning pair |
| Property managers | Tenant move referrals |
| Stagers | Pre-listing move-out |
| Auto-shipping | Long-distance + auto pair |

## 4 standard funnels
1. **Local move (week-out)** — fast quote + same-week booking magnet
2. **Long-distance / interstate** — 30-day nurture, bonded-mover credentials
3. **Senior / downsizing** — sensitive-touch, "we handle it with respect" magnet
4. **Corporate relocation** — HR-aligned, group-rate B2B

## Industry calculator spec
**Move Cost Estimator** — pick bedroom count + distance + day-of-week + stairs. Returns: cost range + crew + truck-size.

## Sizing/recommendation tool spec
**Pack-Or-Pro Recommender** — picks pack-yourself / partial / full-service. Returns: time + cost + pro-tip checklist.

## Service-area heatmap spec
Overlay: real-estate listing density + corporate-HQ density (relo signals) + senior-living facility density.

## Real-world data anchors
- **Move mix**: local 42% / long-distance 18% / apartment 14% / commercial 8% / senior 6% / storage 6% / specialty 4% / pre-list 2%
- **Sample affiliates**: Realtor.com agents / corporate HR (Worldwide ERC) / regional senior-living advisors
- **Avg deal**: $1,400 local / $7,800 long-distance / $14K commercial / $3,200 senior
