# Mock Backend Config — Martial Arts

> **When to use:** karate / BJJ / MMA / kickboxing / Muay Thai / TKD / kids-self-defense school.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Kids program (recurring) | 38% | $130-$220/mo | 12-24mo retention |
| Adult program (recurring) | 22% | $130-$280/mo | Higher commitment, longer LTV |
| Family bundle | 14% | $250-$450/mo | Multi-member household |
| Trial / intro pass | 10% | $20-$80 | Acquisition |
| Birthday party / events | 6% | $250-$650 | Acquisition + community |
| Private lessons (PT) | 6% | $80-$180/session | Premium tier |
| Adult competitor / fight team | 4% | $200-$400/mo | High-ticket specialty |

## Lead-quality signals
- **`student_age`** = drives program-fit (kids vs. teen vs. adult)
- **`primary_goal`** = self-defense / fitness / competition / discipline (drives funnel)
- **`prior_martial_arts`** = experienced student = faster close
- **`family_size`** = drives bundle WTP
- **`affiliate_source`** = school / pediatrician / competitor-school / friend
- **`anti_bully_signal`** = parent worried about bullying = HIGH urgency emotional driver

### Lead score formula
```
score = 30 + 22 if anti_bully_signal + 18 if affiliate_source
  + 14 if family_size >= 3 + 14 if prior_martial_arts
  + 12 if primary_goal='competition' + 10 if seasonal_peak (Aug back-to-school + Jan resolution)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Pediatricians | Anti-bully / discipline referrals |
| Schools / PTAs | Anti-bullying program partnerships |
| Other martial arts schools (peer) | Style-specific cross-referrals |
| Gyms / fitness centers | Fitness-cohort cross-promo |
| Birthday-party venues | Event referrals |
| Realtors | New-resident welcome |
| Sport coaches | Cross-training referrals |
| Therapists / counselors | Discipline-building referrals |

## 4 standard funnels
1. **Kids intro / anti-bully** — "free 2-week trial + free uniform" magnet, parent-angle
2. **Adult fitness intro** — "free intro class + assessment" no-pressure pitch
3. **Family bundle** — "save when whole family enrolls" multi-member promo
4. **Competitor / fight-team** — premium tier landing, advanced students only

## Industry calculator spec
**Program Cost Estimator** — pick student count + ages + goal. Returns: monthly tier + bundle savings + commitment options.

## Sizing/recommendation tool spec
**Style Recommender** — quiz: goal + age + temperament. Returns: top 3 style-fit recommendations (e.g. BJJ vs. karate vs. Muay Thai).

## Service-area heatmap spec
Overlay: school district density (kids cohort) + competitor-school density + family-residential ZIP zones.

## Real-world data anchors
- **Program mix**: kids 38% / adult 22% / family 14% / trial 10% / parties 6% / private 6% / competitor 4%
- **Sample affiliates**: Local pediatrician / PTA contacts / school athletic directors
- **Avg LTV**: $3,200 (kids 18mo retention) / $4,800 (adult 24mo) / $7,200 (family bundle 18mo)
