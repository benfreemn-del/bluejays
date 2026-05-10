# Mock Backend Config — Pool / Spa Service & Install

> **When to use:** pool / hot-tub install, weekly maintenance, repair, equipment replacement, opening/closing.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Weekly maintenance (recurring) | 36% | $120-$280/mo | Highest LTV recurring |
| Opening / closing seasonal | 16% | $200-$500 | Spring + fall windows |
| Equipment repair / replacement | 14% | $300-$3,500 | Pump / heater / filter |
| New pool install | 10% | $35K-$120K | Highest ticket, long cycle |
| Hot tub / spa install | 8% | $5K-$22K | Mid-ticket |
| Resurfacing / renovation | 8% | $4K-$28K | 10-15yr cycle |
| Pre-listing service | 4% | $300-$900 | Realtor-driven |
| Salt-conversion / energy upgrade | 4% | $1.5K-$5K | Specialty upgrade |

## Lead-quality signals
- **`pool_or_spa`** = pool / spa / both
- **`existing_owner_or_buyer`** = buying-house-with-pool = HIGH urgency new-customer
- **`equipment_age_yrs`** = 12+ = upgrade candidate
- **`recent_listing`** = pre-sale window
- **`new_pool_permit`** = active permit = high-ticket pipeline
- **`affiliate_source`** = realtor / builder / hot-tub-dealer / pool-store

### Lead score formula
```
score = 30 + 22 if new_pool_permit + 20 if existing_owner_or_buyer='buyer'
  + 16 if affiliate_source + 14 if equipment_age_yrs >= 12
  + 12 if recent_listing + 10 if seasonal_peak (Apr-Jun open / Sep-Oct close)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Pool-home sale referrals |
| Pool builders | Maintenance handoff post-build |
| Hot-tub / spa dealers | Service + install partnerships |
| Landscapers | Hardscape / pool-deck pair |
| Fence installers | Code-compliant safety fence pair |
| Property managers | Multi-property rental pools |
| Pool stores (chemical) | Counter referrals |
| HOAs | Approved-vendor lists |

## 4 standard funnels
1. **Spring opening + member tier** — annual recurring kickoff
2. **Equipment failure repair** — 24hr-promise + financing for replacement
3. **New pool install** — 90-day high-ticket nurture w/ design + financing
4. **Pre-listing pool service** — realtor-aligned, 48hr turn

## Industry calculator spec
**Pool Service Cost** — pool size + equipment age + service tier (basic / premium). Returns: monthly cost + annual savings of member tier.

## Sizing/recommendation tool spec
**Equipment Health Check** — owner enters age + symptoms. Returns: replace-now / replace-soon / monitor recommendation + cost.

## Service-area heatmap spec
Overlay: existing-pool-permit density + new-construction permit zones + property-value heatmap (premium pool zones).

## Real-world data anchors
- **Service mix**: maintenance 36% / open/close 16% / repair 14% / install 10% / spa 8% / resurface 8% / pre-list 4% / upgrade 4%
- **Sample affiliates**: Pool Pros Network / Realtor.com agents / regional property managers
- **Avg deal**: $200/mo recurring / $14K equipment / $65K new install / $14K resurface
