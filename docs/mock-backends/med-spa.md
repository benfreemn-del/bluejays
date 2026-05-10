# Mock Backend Config — Med-Spa

> **When to use:** medical aesthetics — Botox / filler / laser / peels / body contouring / IV-therapy / wellness.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Botox / Dysport (recurring) | 28% | $400-$900/visit | 3-4mo cycle, highest LTV |
| Dermal filler | 18% | $700-$2,500 | Annual-ish cycle |
| Laser hair removal | 14% | $200-$600/session | 6-8 session package |
| Skin treatments (peels / facials) | 12% | $150-$650 | Recurring add-on |
| Body contouring (CoolSculpting) | 10% | $1.5K-$4K | Higher-ticket one-shot |
| IV therapy / wellness drips | 8% | $120-$300 | Frequent recurring |
| Membership / monthly | 6% | $100-$300/mo | Highest-LTV tier |
| New-patient consult | 4% | $0-$150 | Acquisition |

## Lead-quality signals
- **`event_deadline`** = wedding / vacation / reunion = HIGH urgency
- **`prior_aesthetic_treatments`** = experienced buyer, faster close
- **`age_band`** = 25-35 (preventative) / 35-50 (corrective) / 50+ (rejuvenation)
- **`income_band`** = drives package WTP
- **`affiliate_source`** = dermatologist / OB-GYN / cosmetic-dentist / wellness clinic

### Lead score formula
```
score = 30 + 22 if event_deadline + 18 if prior_aesthetic_treatments
  + 16 if affiliate_source + 14 if income_band='high'
  + 12 if member_signal + 10 if seasonal_peak (Q4 holiday + summer)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Dermatologists | Cosmetic crossover referrals |
| Cosmetic dentists | Smile-makeover crossover |
| OB-GYNs | Postpartum-aesthetic referrals |
| Plastic surgeons | Non-surgical add-on |
| Wedding planners | Pre-wedding package referrals |
| Wellness / functional medicine | IV-drip + holistic crossover |
| Influencers (local) | Aesthetic-brand promo |
| High-end gyms / spas | Cross-promo bundles |

## 4 standard funnels
1. **New-patient consult** — "$50 consult credit toward first treatment" magnet
2. **Event-deadline package** — wedding / vacation 12-week prep
3. **Recurring Botox member** — 3-month cycle reminder + auto-rebook
4. **Body contouring high-ticket** — before/after gallery + financing

## Industry calculator spec
**Treatment Cost Estimator** — pick treatment + units / sessions + frequency. Returns: cost + member-tier savings.

## Sizing/recommendation tool spec
**Goal Recommender** — patient picks 3 cosmetic priorities (wrinkles / volume / texture / hair / body). Returns: top 3 treatments with timeline + cost.

## Service-area heatmap spec
Overlay: high-income ZIP density + cosmetic-dentist + dermatology clinic density + wedding-venue density.

## Real-world data anchors
- **Treatment mix**: Botox 28% / filler 18% / laser 14% / skin 12% / contouring 10% / IV 8% / membership 6% / consult 4%
- **Sample affiliates**: Local plastic surgeons / dermatologists / wedding planners / regional influencers
- **Avg LTV**: $4,800 (12mo membership) / $2,400 (recurring Botox annual) / $3,200 (CoolSculpting one-shot)
