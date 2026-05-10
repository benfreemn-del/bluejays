# Mock Backend Config — Junk Removal

> **When to use:** residential / commercial junk removal, hauling, estate cleanouts, demolition debris, dumpster rental.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Single-load residential | 36% | $200-$650 | Garage / single-room |
| Estate cleanout | 18% | $1.2K-$5,500 | Death-of-relative cohort |
| Pre-listing prep | 14% | $400-$1,800 | Realtor-driven, fast-turn |
| Construction debris | 12% | $400-$2,500 | GC / remodeler partnerships |
| Multi-load whole-house | 10% | $1.5K-$4K | Move/declutter |
| Commercial / office | 8% | $300-$1,800 | Recurring tenant turnover |
| Hot-tub / heavy-item | 2% | $250-$650 | Specialty |

## Lead-quality signals
- **`urgency_signal`** = same-day / next-day / this-week
- **`scope_size`** = single-load / multi-load / whole-house / commercial
- **`recent_listing`** = pre-sale prep cohort
- **`estate_signal`** = death-of-relative or downsizing language
- **`affiliate_source`** = realtor / mover / property-mgmt / contractor

### Lead score formula
```
score = 30 + 18 if urgency_signal='same-day' + 16 if affiliate_source
  + 14 if estate_signal + 14 if scope_size='whole-house'
  + 12 if recent_listing + 10 if commercial
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing prep |
| Movers | Move-out cleanout pair |
| Estate attorneys | Estate-cleanout referrals |
| Property managers | Tenant turnover |
| Senior-living advisors | Downsizing referrals |
| GCs / remodelers | Construction debris |
| Stagers | Pre-listing partnership |
| HOAs | Bulk-day events |

## 4 standard funnels
1. **Same-day urgency** — text-to-quote + 4hr arrival promise
2. **Estate cleanout** — sensitive-touch nurture, "we handle it with respect" magnet
3. **Pre-listing prep** — realtor-aligned, 48hr turn promise
4. **Construction debris** — GC-tier B2B recurring

## Industry calculator spec
**Load-Size Estimator** — pick room count + visible debris size. Returns: 1/4 / 1/2 / 3/4 / full-truck estimate + cost.

## Sizing/recommendation tool spec
**Cleanout-Type Recommender** — pick scenario (move-out / estate / declutter / construction). Returns: prep checklist + recommended scope + timeline.

## Service-area heatmap spec
Overlay: real-estate listing density + senior-population density (estate-cleanout proxy) + recent-permit zones (construction debris).

## Real-world data anchors
- **Job mix**: single-load 38% / estate 18% / pre-listing 14% / construction 12% / multi-load 10% / commercial 8%
- **Sample affiliates**: Realtor.com top agents / regional movers / estate-attorney directories
- **Avg deal**: $380 single-load / $2,400 estate / $1,200 pre-listing
