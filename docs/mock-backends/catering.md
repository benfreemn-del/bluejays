# Mock Backend Config — Catering

> **When to use:** wedding / corporate / drop-off / boutique / specialty (BBQ, kosher, vegan).

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Wedding | 28% | $4K-$28K | Highest-ticket, 6-12mo lead |
| Corporate / lunch-meeting | 22% | $300-$2,500 | Recurring B2B |
| Private event / party | 18% | $400-$3,500 | Birthday / graduation / anniv |
| Drop-off / pickup | 14% | $150-$700 | Lower-touch |
| Recurring corporate contract | 8% | $4K-$22K/mo | Highest LTV |
| Funeral / sympathy | 4% | $300-$1,500 | Time-sensitive |
| Holiday catering (Thanksgiving / etc.) | 4% | $200-$1,200 | Seasonal one-shot |
| Specialty diet (kosher / vegan / etc.) | 2% | varies | Premium niche |

## Lead-quality signals
- **`event_date`** = locked = high-commitment
- **`guest_count`** = drives ticket scale
- **`event_type`** = wedding / corporate / party (drives funnel)
- **`recurring_potential`** = corporate / weekly / monthly = HIGH LTV
- **`affiliate_source`** = wedding-planner / venue / corporate-HR / event-coordinator
- **`venue_provided`** = full-service vs. drop-off = scope signal

### Lead score formula
```
score = 30 + 22 if recurring_potential + 20 if event_date locked
  + 16 if affiliate_source + 14 if guest_count >= 100
  + 12 if event_type='wedding' + 10 if seasonal_peak
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Wedding planners | Premium wedding-catering referrals |
| Venues | Preferred-vendor lists |
| Corporate HR / office managers | Lunch-meeting recurring |
| Event coordinators | Multi-event referrals |
| Florists / DJs / photographers | Wedding-vendor cross-referrals |
| Funeral homes | Sympathy catering |
| HOAs / community centers | Event hosting |
| Specialty grocers (kosher / etc.) | Niche cross-promo |

## 4 standard funnels
1. **Wedding inquiry** — engagement-magnet + 6-12mo nurture w/ tasting offer
2. **Corporate lunch-meeting** — recurring B2B "office-lunch program" pitch
3. **Private event party** — fast-quote + 14-day-from-event scheduling
4. **Funeral / sympathy** — sensitive-touch, same-day-quote promise

## Industry calculator spec
**Event Cost Estimator** — pick event type + guest count + meal style + bar service. Returns: cost range + optional add-ons.

## Sizing/recommendation tool spec
**Menu Matcher** — quiz: cuisine pref + dietary needs + service style. Returns: 3 recommended menu options.

## Service-area heatmap spec
Overlay: wedding-venue density + corporate-HQ density + event-venue + funeral-home density.

## Real-world data anchors
- **Event mix**: wedding 28% / corporate 22% / private 18% / drop-off 14% / recurring 8% / funeral 4% / holiday 4% / specialty 2%
- **Sample affiliates**: The Knot / WeddingWire / corporate HR networks / regional event coordinators
- **Avg LTV**: $14K (corporate annual recurring) / $12K wedding one-shot / $4,800 (event-cohort multi-year)
