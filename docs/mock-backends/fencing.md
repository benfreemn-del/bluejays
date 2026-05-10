# Mock Backend Config — Fencing

> **When to use:** residential / commercial fence install, repair, replacement — wood / vinyl / chain-link / aluminum / iron.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential install (new) | 42% | $3K-$14K | Pet / privacy / pool driver |
| Residential replacement | 22% | $4K-$16K | 15-25yr cycle |
| Commercial / industrial | 14% | $8K-$60K | Security fence, chain-link |
| Repair / storm damage | 10% | $400-$2,500 | Wind / fallen-tree |
| HOA / multi-property | 8% | $5K-$28K | Code-compliant repaint cycles |
| Pool-safety fence | 4% | $2K-$5K | Permit-driven |

## Lead-quality signals
- **`fence_purpose`** = pet / privacy / pool / security / aesthetic
- **`property_size_acres`** = drives linear-footage scale
- **`recent_pet_acquisition`** = high urgency (new dog = need fence)
- **`new_pool_permit`** = code-compliant safety fence required
- **`affiliate_source`** = realtor / dog trainer / pool installer / GC
- **`material_pref`** = wood / vinyl / aluminum / iron / chain-link

### Lead score formula
```
score = 30 + 20 if new_pool_permit + 18 if recent_pet_acquisition
  + 16 if affiliate_source + 14 if property_size_acres >= 0.5
  + 12 if fence_purpose='security' (commercial) + 10 if seasonal_peak (Mar-Oct)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Pre-listing curb-appeal upgrade |
| Pool installers | Code-compliant safety fence |
| Dog trainers / pet stores | New-dog-owner referrals |
| Landscapers | Yard-overhaul partnerships |
| GCs / new-build | Subcontracting on builds |
| HOA managers | Multi-property recurring |
| Tree services | Storm-damage joint-work |
| Insurance adjusters | Storm-claim referrals |

## 4 standard funnels
1. **New homeowner / pet** — "First-Year Fence Buyer's Guide" magnet + 7-day nurture
2. **Pool-safety code** — fast-turnaround permit-compliant install + 14-day promise
3. **Storm-damage repair** — "post-storm fence checklist" + 24hr quote
4. **Replacement (15+ year fence)** — material upgrade calculator + financing

## Industry calculator spec
**Linear-Footage Quote** — pick property line shape (rectangle / corner / irregular) + material + height. Returns: estimated cost range + permit-required Y/N.

## Sizing/recommendation tool spec
**Material Recommender** — pick purpose + maintenance tolerance + budget. Returns: top 3 materials w/ 25-yr cost projection.

## Service-area heatmap spec
Overlay: new-home-permit density + pool-permit density + dog-license registry density.

## Real-world data anchors
- **Material mix**: wood 38% / vinyl 24% / aluminum 14% / chain-link 14% / iron 6% / other 4%
- **Sample affiliates**: Pool Pros Network / Petco trainer referral / regional landscaper coops
- **Avg deal**: $7,400 residential / $26,000 commercial / $1,200 repair
