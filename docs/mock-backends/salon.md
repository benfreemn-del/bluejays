# Mock Backend Config — Salon (Hair / Color / Stylist Suite)

> **When to use:** independent stylist, salon suite, full-service salon, color specialist, barbershop.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Recurring color/cut client | 38% | $80-$280/visit | 4-8wk cycle, highest LTV |
| New-client referral | 16% | $80-$320 | Acquisition |
| Event / special-occasion | 14% | $120-$650 | Wedding / prom / shoot |
| Color-correction (rescue) | 10% | $200-$900 | Premium, high-ticket |
| Extensions / specialty | 8% | $400-$2,500 | High-margin specialty |
| Bridal package | 8% | $400-$1,800 | Pre-wedding |
| Walk-in / ad-hoc | 6% | $40-$120 | Low-margin, occasional |

## Lead-quality signals
- **`event_date`** = wedding / event ≤ 90 days = high urgency
- **`recent_move`** = looking-for-new-stylist signal
- **`prior_stylist_lapse`** = ex-client of competitor
- **`color_correction_signal`** = "fix what someone else did" = premium WTP
- **`affiliate_source`** = referral / wedding-planner / influencer / friend

### Lead score formula
```
score = 30 + 22 if event_date <= 60d + 18 if color_correction_signal
  + 16 if affiliate_source + 14 if recent_move
  + 12 if prior_stylist_lapse + 10 if seasonal_peak (May-Oct wedding, Nov-Dec holiday)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Wedding planners | Bridal package referrals |
| Photographers | Pre-shoot prep referrals |
| Med-spas | Aesthetic crossover |
| Dress / bridal boutiques | Wedding cohort |
| Influencers (local) | Style-driven promo |
| Real-estate agents | New-resident welcome |
| Other stylists (peer / overflow) | Capacity overflow referrals |
| HR / employer wellness | Group event-styling discounts |

## 4 standard funnels
1. **New-client first-cut** — "$25 first-visit credit + complimentary consult" magnet
2. **Bridal package** — 6-month nurture, trial-run + day-of bundle
3. **Color-correction rescue** — premium-tier landing, "fix the disaster" promise
4. **Recurring client retention** — birthday-month perk + 4-week-rebook auto-text

## Industry calculator spec
**Service Cost Estimator** — pick service (cut / color / extensions / event) + length / complexity. Returns: estimate + duration + bundle savings.

## Sizing/recommendation tool spec
**Style Recommender** — quiz-style: face-shape + lifestyle + maintenance tolerance. Returns: 3 stylist-recommended looks.

## Service-area heatmap spec
Overlay: wedding-venue density + new-resident move-in zones + competitor-salon density.

## Real-world data anchors
- **Service mix**: cut/color 40% / new 16% / event 14% / correction 10% / extensions 8% / bridal 8% / walk-in 4%
- **Sample affiliates**: The Knot wedding planners / regional photographers / influencer-network
- **Avg LTV**: $2,400 (annual recurring color client) / $1,200 (bridal package) / $4,800 (extensions multi-year)
