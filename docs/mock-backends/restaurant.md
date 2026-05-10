# Mock Backend Config — Restaurant

> **When to use:** independent restaurant — fine dining / casual / fast-casual / brewery / specialty. ICP unique: not "leads → deals" but "first-time visitor → repeat customer / loyalty member".

## Audience category mix
| Type | % | Visit value | Notes |
|---|---|---|---|
| First-time diner | 32% | $40-$120/visit | Acquisition |
| Repeat regular (3+ visits / 90d) | 22% | $40-$120/visit | Highest LTV recurring |
| Loyalty / rewards member | 14% | $40-$140/visit | Highest LTV w/ data |
| Private event / buyout | 10% | $1.5K-$22K | High-margin one-shot |
| Catering / off-site | 8% | $400-$3,500 | B2B-adjacent revenue |
| Delivery / takeout-only | 6% | $25-$80/order | Convenience tier |
| Birthday / anniversary | 4% | $80-$280 | Time-bound, opportunity |
| Corporate / business lunch | 4% | $80-$280 | Recurring B2B |

## Lead-quality signals (visitor / patron signals)
- **`visit_count`** = 1 / 2-3 / 4+ (loyalty cohort)
- **`life_event_signal`** = birthday / anniversary / engagement (drives reservation)
- **`reservation_made`** = serious-visitor commit
- **`loyalty_member`** = explicit signup
- **`affiliate_source`** = food-blogger / hotel-concierge / corporate-HR / friend
- **`event_inquiry`** = private-event / catering = high-ticket pivot

### Lead score formula
```
score = 30 + 22 if event_inquiry + 20 if visit_count >= 4 (regular)
  + 16 if affiliate_source + 14 if life_event_signal
  + 14 if reservation_made + 12 if loyalty_member
  + 8  if seasonal_peak (V-Day / Mother's Day / NYE)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Food bloggers / Yelp Elite | Discovery-driven volume |
| Hotel concierges | Tourist + business-traveler |
| Wedding planners | Private-event referrals |
| Corporate HR / executive assistants | Business-lunch + event |
| Other restaurants (peer) | Overflow / specialty referrals |
| Local sports teams / venues | Pre / post-game traffic |
| Real-estate agents | New-resident welcome packets |
| Wine / craft-beer suppliers | Pairing-event partnerships |

## 4 standard funnels
1. **First-time diner conversion** — post-visit "thanks for coming" + 10%-off-next-visit + loyalty signup
2. **Loyalty member retention** — birthday-month perk + recurring promotions
3. **Private-event inquiry** — buyout calculator + tasting-style consult
4. **Corporate / catering B2B** — recurring lunch program nurture

## Industry calculator spec
**Private Event Estimator** — pick guest count + meal style + bar / no-bar + day. Returns: cost range + buyout eligibility.

## Sizing/recommendation tool spec
**Reservation Recommender** — diner picks occasion + party size + dietary needs. Returns: time + table + special-touch suggestion (cake / champagne).

## Service-area heatmap spec
Overlay: residential density + tourist-density (hotels / attractions) + corporate-HQ density + competitor-density.

## Real-world data anchors
- **Visit mix**: first 32% / repeat 22% / loyalty 14% / event 10% / catering 8% / delivery 6% / occasion 4% / business 4%
- **Sample affiliates**: Yelp Elite / OpenTable hosts / hotel concierges / corporate HR / wedding planners
- **Avg LTV (per loyalty member)**: $4,800/yr (regular weekly) / $1,800/yr (monthly) / $24K (lifetime regular)
