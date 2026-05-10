# Mock Backend Config — Pest Control

> **When to use:** general pest, termite, rodent, wildlife removal, mosquito, bed-bug, commercial.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Recurring quarterly (residential) | 38% | $80-$160/visit | Highest LTV |
| One-time emergency (rats / wasps / bedbugs) | 18% | $200-$1,200 | High urgency |
| Termite inspection / treatment | 12% | $400-$2,500 | Pre-listing or annual |
| Wildlife removal (raccoons / squirrels) | 10% | $300-$1,500 | Specialty |
| Mosquito / outdoor seasonal | 8% | $80-$140/treatment | Apr-Sep |
| Commercial / restaurant | 8% | $400-$2,500/mo | B2B recurring |
| Pre-listing inspection | 4% | $200-$500 | Realtor-driven |
| Bedbug treatment (specialty) | 2% | $1.5K-$4K | Premium urgent |

## Lead-quality signals
- **`emergency_signal`** = rats / wasp-nest / bedbug = HIGH urgency
- **`recent_listing`** = pre-sale termite-inspection window
- **`commercial_size`** = restaurant / office = B2B
- **`recurring_signal`** = wants quarterly plan
- **`affiliate_source`** = realtor / property-mgmt / restaurant-mgmt / inspector
- **`property_age_yrs`** = older = termite / rodent risk

### Lead score formula
```
score = 30 + 22 if emergency_signal + 18 if recent_listing
  + 16 if affiliate_source + 14 if commercial_size != null
  + 12 if recurring_signal + 10 if seasonal_peak (Apr-Sep)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Pre-listing termite inspections |
| Home inspectors | Inspection-flag referrals |
| Property managers | Multi-property recurring |
| Restaurant / hospitality | Code-compliance recurring |
| Daycare / school facilities | Compliance-driven |
| HOAs | Multi-home recurring |
| HVAC / plumbing | Cross-promo on rodent-entry-points |
| Wildlife rehab orgs | Humane wildlife removal partnerships |

## 4 standard funnels
1. **Quarterly recurring member** — "first treatment $99 + auto-rebook" magnet
2. **Emergency same-day** — text-to-quote, 4hr-arrival promise
3. **Pre-listing termite** — realtor-aligned, 48hr turn
4. **Commercial / restaurant** — code-compliance recurring B2B

## Industry calculator spec
**Service Plan Estimator** — pick property size + pest concerns + frequency. Returns: monthly tier + annual savings.

## Sizing/recommendation tool spec
**Pest ID Helper** — owner answers 6 questions or uploads photo. Returns: likely pest + treatment-urgency + service-recommendation.

## Service-area heatmap spec
Overlay: housing-age zones (older = termite/rodent) + restaurant-permit density + recent-listing density.

## Real-world data anchors
- **Service mix**: quarterly 38% / emergency 18% / termite 12% / wildlife 10% / mosquito 8% / commercial 8% / pre-list 4% / bedbug 2%
- **Sample affiliates**: Realtor.com agents / regional property managers / restaurant chambers
- **Avg deal**: $120/visit recurring / $480 termite treatment / $1,400/mo commercial recurring
