# Mock Backend Config — Fitness (Gym / Studio / Personal Training)

> **When to use:** boutique studio, personal trainer, CrossFit / yoga / HIIT, big-box gym, niche specialty.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Membership new | 40% | $90-$280/mo | Annual contract, highest LTV |
| Personal training (1:1) | 18% | $80-$180/session | Highest margin |
| Small group / semi-private | 14% | $60-$120/session | Sweet-spot tier |
| Class drop-in | 10% | $25-$45 | Acquisition channel |
| Membership lapsed-reactivation | 8% | $90-$280/mo | Win-back |
| Corporate wellness | 6% | $4K-$28K | B2B recurring |
| Specialty programs (postpartum / senior) | 4% | $200-$800 | Niche WTP |

## Lead-quality signals
- **`fitness_goal`** = weight-loss / strength / mobility / event-specific (drives funnel)
- **`urgency_event`** = wedding / vacation / sport-event date (high WTP, time-bound)
- **`prior_membership`** = lapsed = reactivation cohort
- **`age_band`** = 18-30 / 30-50 / 50+ (drives program fit)
- **`affiliate_source`** = trainer-referral / corporate / partner-gym / friend-referral
- **`commitment_signal`** = filled "ready to commit" question vs. browsing

### Lead score formula
```
score = 30 + 20 if urgency_event (date-bound) + 18 if commitment_signal
  + 16 if affiliate_source + 14 if prior_membership=lapsed
  + 12 if corporate_wellness_signal + 10 if seasonal_peak (Jan + May resolution windows)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Trainers (peer / freelance) | Cross-referrals on specialties |
| Nutritionists / dietitians | Cross-promo bundles |
| Chiropractors | Mobility / recovery referrals |
| OB-GYNs | Postpartum-fitness referrals |
| HR / wellness programs | Corporate B2B referrals |
| Sports clubs / leagues | Pre-season prep referrals |
| Med-spas | Wellness-aesthetic crossover |
| Real-estate agents | New-resident welcome packets |

## 4 standard funnels
1. **New member acquisition** — "free 7-day pass" magnet, soft-conversion nurture
2. **Event-deadline urgency** — wedding/vacation 8-12 week program
3. **Lapsed reactivation** — ex-member win-back, "we miss you" + new-class showcase
4. **Corporate wellness B2B** — HR-targeted ROI calculator + group pricing

## Industry calculator spec
**Goal-Timeline Estimator** — pick goal + current fitness + target date. Returns: recommended program + visit frequency + cost.

## Sizing/recommendation tool spec
**Program Matcher** — pick 3 priorities (strength / cardio / mobility / weight-loss). Returns: top 3 program-fit recommendations from your offering.

## Service-area heatmap spec
Overlay: residential density + corporate-HQ density (B2B targets) + competitor-gym density (drive-by ratios).

## Real-world data anchors
- **Member mix**: membership 56% / 1:1 PT 18% / semi-private 14% / drop-in 8% / specialty 4%
- **Sample affiliates**: MyFitnessPal blog / Chamber of Commerce / Realtor.com agents / regional dietitians
- **Avg LTV**: $1,800 (12mo membership) · $4,800 (12mo PT 2x/wk) · $14K (corporate annual)
