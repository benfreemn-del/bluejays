# Mock Backend Config — Photography

> **When to use:** wedding / family / portrait / commercial / real-estate / event photographers.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Wedding | 28% | $2.5K-$8K | Highest-ticket, 6-12mo lead time |
| Family / portrait | 22% | $400-$1,500 | Annual recurring |
| Real-estate listings | 14% | $250-$800 | High-volume, recurring B2B |
| Commercial / brand | 12% | $1.5K-$8K | Corporate, recurring |
| Event coverage | 10% | $800-$3K | Galas, corporate events |
| Senior portraits | 8% | $400-$1,200 | Spring + fall windows |
| Newborn / maternity | 6% | $350-$900 | Time-sensitive cohort |

## Lead-quality signals
- **`event_date`** = wedding / event date locked = high commitment
- **`event_lead_time`** = how far out (closer = higher urgency, both directions)
- **`venue_booked`** = serious buyer signal
- **`recent_listing_pulled`** = real-estate agent pipeline
- **`affiliate_source`** = wedding planner / venue / realtor / referral
- **`engagement_session_signal`** = bride/groom pre-wedding = full-package shopper

### Lead score formula
```
score = 30 + 22 if venue_booked + 20 if engagement_session_signal
  + 16 if affiliate_source + 14 if event_lead_time <= 60d
  + 12 if recent_listing (B2B realtor) + 10 if seasonal_peak (May-Oct wedding)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Wedding planners | Premium-photographer referrals |
| Venues | In-house preferred-vendor lists |
| Florists / cake / DJ | Wedding-vendor cross-referrals |
| Real-estate agents | Listing-photography recurring |
| Stylists / makeup | Pre-shoot prep partnerships |
| OB-GYNs | Maternity / newborn referrals |
| Corporate HR / marketing | Brand-photo recurring |
| Event organizers | Conference / gala referrals |

## 4 standard funnels
1. **Wedding-couple inquiry** — engagement-session magnet + 6-month nurture
2. **Real-estate agent recurring** — listing-photo MRR tier offering
3. **Family / portrait annual** — birthday-month auto-rebook reminder
4. **Newborn / maternity** — time-sensitive 14-day-from-due-date scheduling

## Industry calculator spec
**Package Builder** — pick session-type + hours + edits + add-ons (album / prints). Returns: package price + add-on bundle savings.

## Sizing/recommendation tool spec
**Style Matcher** — couple/family answers 5 quiz questions. Returns: recommended package tier + style-fit confidence.

## Service-area heatmap spec
Overlay: wedding-venue density + real-estate listing density + corporate-HQ density.

## Real-world data anchors
- **Service mix**: wedding 28% / family 22% / real-estate 14% / commercial 12% / event 10% / senior 8% / newborn 6%
- **Sample affiliates**: The Knot / WeddingWire / Realtor.com agents / corporate marketing teams
- **Avg deal**: $4,800 wedding / $750 family / $400 real-estate / $3,200 corporate
