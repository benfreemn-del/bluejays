# Mock Backend Config — Locksmith

> **When to use:** residential / commercial / automotive lockout, rekey, lock install, smart-lock setup, safe service.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Auto lockout (24hr) | 32% | $80-$220 | Highest urgency |
| Residential lockout | 22% | $90-$250 | Emergency |
| Rekey (post-move) | 14% | $120-$400 | New-homeowner cohort |
| Lock / smart-lock install | 12% | $200-$1,200 | Smart-home upsell |
| Commercial access control | 10% | $400-$8K | Office / retail / multi-unit |
| Safe service | 6% | $200-$1,500 | Specialty |
| Property mgmt rekey | 4% | $200-$1,200 | Multi-unit recurring |

## Lead-quality signals
- **`emergency_flag`** = lockout / break-in / lost-key → HIGH
- **`recent_home_purchase`** = rekey within 30 days = candidate
- **`commercial_size`** = scale signal
- **`smart_home_signal`** = smart-lock fit
- **`affiliate_source`** = realtor / property-mgmt / GC / insurance

### Lead score formula
```
score = 30 + 26 if emergency_flag + 18 if recent_home_purchase
  + 14 if affiliate_source + 12 if commercial_size='multi-location'
  + 10 if smart_home_signal + 8 if seasonal_peak (move season May-Sep)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Post-close rekey referrals |
| Property managers | Tenant-turnover rekeys |
| Movers | Move-in/out rekey co-promo |
| Insurance | Break-in claim referrals |
| GCs | New-build hardware install |
| Smart-home installers | Smart-lock pairing |
| Auto dealerships | Key replacement |
| HOAs | Multi-property approved-vendor |

## 4 standard funnels
1. **24/7 emergency** — "stranded? text us" landing page + 30-min response promise
2. **New-homeowner rekey** — realtor-aligned welcome basket
3. **Smart-home upgrade** — feature comparison + install bundle
4. **Commercial access control** — multi-tier B2B nurture

## Industry calculator spec
**Smart-Lock Comparator** — pick door type + smart-platform (Apple/Google/Alexa) + budget. Returns: top 3 locks w/ install cost.

## Sizing/recommendation tool spec
**Security Assessment** — owner answers 6 questions. Returns: security score + top 3 upgrade priorities.

## Service-area heatmap spec
Overlay: home-sale density + crime/break-in zones + multi-unit property density.

## Real-world data anchors
- **Job mix**: auto-lockout 32% / residential lockout 22% / rekey 16% / install 14% / commercial 10% / other 6%
- **Sample affiliates**: Realtor.com top agents / regional property managers / smart-home installers
- **Avg deal**: $145 lockout / $280 rekey / $850 smart-lock install
