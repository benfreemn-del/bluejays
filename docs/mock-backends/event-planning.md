# Mock Backend Config — Event Planning

> **When to use:** wedding planner / corporate event planner / boutique event designer / multi-vendor coordination.

## Customer category mix
| Type | % | Avg planning fee | Notes |
|---|---|---|---|
| Full-service wedding | 30% | $6K-$22K | Highest LTV per couple |
| Day-of coordination | 20% | $1.5K-$3.5K | Acquisition + scale |
| Corporate event (gala / launch) | 14% | $5K-$45K | High-margin B2B |
| Birthday / milestone party | 10% | $1.5K-$8K | Niche specialty |
| Conference / multi-day | 8% | $15K-$80K | Premium B2B |
| Bar / Bat Mitzvah | 6% | $5K-$22K | Faith-niche specialty |
| Quinceañera / cultural | 6% | $4K-$15K | Cultural-niche |
| Non-profit fundraiser | 6% | $4K-$25K | Recurring annual |

## Lead-quality signals
- **`event_date`** = locked + venue booked = high-commitment
- **`event_type`** = wedding / corporate / multi-day (drives funnel)
- **`guest_count`** = drives scale + ticket
- **`venue_booked`** = serious buyer signal
- **`affiliate_source`** = venue / florist / caterer / corporate-HR
- **`budget_disclosed`** = number stated = serious buyer

### Lead score formula
```
score = 30 + 24 if venue_booked + 22 if budget_disclosed
  + 16 if affiliate_source + 14 if event_date <= 90d
  + 12 if guest_count >= 150 + 10 if recurring_signal (annual gala)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Venues | In-house preferred-vendor lists |
| Caterers | Co-vendor network |
| Florists | Co-vendor network |
| Photographers | Co-vendor network |
| Corporate HR / event committees | Recurring B2B referrals |
| Non-profit boards | Annual gala referrals |
| Faith-community leaders | Bat/Bar Mitzvah, cultural events |
| DJs / live music | Co-vendor network |

## 4 standard funnels
1. **Wedding inquiry** — engagement-couple 6-12mo nurture w/ portfolio + style match
2. **Day-of coordination** — fast-quote, 30-60 day pre-event scheduling
3. **Corporate / B2B** — annual-gala recurring nurture + vendor-network value-add
4. **Cultural / faith specialty** — Bat Mitzvah / Quinceañera dedicated landing

## Industry calculator spec
**Planning Fee Estimator** — pick service tier + guest count + event type. Returns: planning fee + recommended vendor budget.

## Sizing/recommendation tool spec
**Vision Match** — couple/host quiz: aesthetic + priorities + budget. Returns: top 3 style-fit case studies + recommended package.

## Service-area heatmap spec
Overlay: wedding-venue density + corporate-HQ density + non-profit-org density.

## Real-world data anchors
- **Event mix**: full-wedding 30% / day-of 20% / corporate 14% / birthday 10% / conference 8% / Bar/Bat 6% / cultural 6% / non-profit 6%
- **Sample affiliates**: The Knot / WeddingWire / corporate HR networks / non-profit board lists
- **Avg deal**: $14K wedding / $32K corporate / $45K conference / $18K Bar/Bat Mitzvah
