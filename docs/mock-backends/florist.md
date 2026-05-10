# Mock Backend Config — Florist

> **When to use:** retail florist, wedding / event specialist, subscription, sympathy.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Holiday / event one-off | 32% | $50-$180 | V-Day / Mother's Day / etc. |
| Wedding | 18% | $1.5K-$8K | Highest-ticket per occasion |
| Sympathy / funeral | 14% | $80-$300 | Time-sensitive urgent |
| Birthday / anniversary delivery | 10% | $60-$140 | Recurring annual cycle |
| Subscription / weekly bouquet | 8% | $50-$120/wk | Highest LTV |
| Corporate gifting / B2B | 8% | $200-$2K/order | Recurring B2B |
| Event / bar mitzvah / quinceañera | 6% | $400-$3K | Specialty |
| Sympathy contract (church/funeral home) | 4% | $200-$800/event | Recurring B2B |

## Lead-quality signals
- **`event_date`** = wedding / event = 60-90 day lead time
- **`recurring_signal`** = subscription / corporate gifting = high LTV
- **`urgent_signal`** = sympathy / hospital = same-day delivery
- **`affiliate_source`** = wedding-planner / venue / funeral-home / corporate-HR
- **`gift_recipient_relationship`** = drives upsell (lover/spouse vs. mom vs. friend)

### Lead score formula
```
score = 30 + 24 if urgent_signal (sympathy/hospital) + 18 if event_date >= 30d (wedding lead)
  + 16 if affiliate_source + 16 if recurring_signal
  + 12 if seasonal_peak (Feb / May / Dec) + 10 if corporate_signal
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Wedding planners | Premium wedding referrals |
| Venues | In-house preferred-vendor lists |
| Funeral homes | Sympathy recurring B2B |
| Hospitals | Same-day delivery contracts |
| Corporate HR | Office gifting recurring |
| Event planners | Event-floral referrals |
| Real-estate agents | Closing-gift referrals |
| Restaurants | Centerpiece arrangements |

## 4 standard funnels
1. **Holiday push** — V-Day / Mother's Day / Christmas pre-order calendar
2. **Wedding consult** — 60-day nurture w/ portfolio + tasting-style design consult
3. **Subscription / corporate** — recurring tier nurture w/ "skip-a-week" flexibility
4. **Sympathy / urgent** — same-day delivery promise + sensitive-touch nurture

## Industry calculator spec
**Wedding Floral Estimator** — pick guest count + ceremony + reception + bridal-party size. Returns: floral budget range + 3 design tiers.

## Sizing/recommendation tool spec
**Occasion Matcher** — quiz: relationship + budget + recipient style. Returns: top 3 arrangements + price.

## Service-area heatmap spec
Overlay: wedding-venue density + funeral-home density + corporate-HQ density + hospital density.

## Real-world data anchors
- **Service mix**: holiday 32% / wedding 18% / sympathy 14% / birthday 10% / subscription 8% / corporate 8% / event 6% / funeral-contract 4%
- **Sample affiliates**: The Knot / WeddingWire / regional funeral homes / hospital concierges / corporate HR
- **Avg LTV**: $4,800 (corporate annual) / $2,400 (subscription annual) / $5K wedding one-shot
