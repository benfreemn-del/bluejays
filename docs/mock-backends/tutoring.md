# Mock Backend Config — Tutoring

> **When to use:** academic tutoring (math / reading / science / writing), test-prep (SAT / ACT / GRE), specialty (executive function / dyslexia / ESL).

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Subject tutoring (recurring) | 38% | $60-$120/hr | Weekly cycles, longest LTV |
| Test prep (SAT / ACT) | 18% | $1.5K-$5K package | High-margin, time-bound |
| Group / small-group session | 14% | $40-$80/hr | Lower-margin scale |
| College admissions consult | 10% | $1K-$8K package | Premium tier |
| Pediatric / IEP | 8% | $80-$140/hr | Specialty, often funded |
| Online / virtual | 8% | $50-$100/hr | Convenience tier |
| Group academic intervention | 4% | $400-$1,200 | School-district contracted |

## Lead-quality signals
- **`grade_level`** = drives subject + style fit
- **`urgency_event`** = SAT date / report-card / college deadline
- **`learning_diff_flag`** = dyslexia / ADHD / IEP = specialty cohort
- **`prior_tutor_lapse`** = ex-customer of competitor
- **`income_band`** = drives package WTP
- **`affiliate_source`** = teacher / school counselor / pediatrician / friend

### Lead score formula
```
score = 30 + 22 if urgency_event (test/deadline) + 18 if learning_diff_flag
  + 16 if affiliate_source + 14 if income_band='high'
  + 12 if grade_level='HS-junior/senior' (test-prep) + 10 if seasonal_peak (Aug back-to-school + Jan)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| School counselors | Cross-referrals on struggling students |
| Pediatricians | IEP / learning-diff referrals |
| Teachers (peer) | Out-of-class help recommendations |
| College admissions consultants | Test-prep handoff |
| Educational therapists | Specialty cross-referrals |
| Other tutors (peer / overflow) | Subject-specialty referrals |
| PTA / parent groups | Word-of-mouth multipliers |
| Homeschool co-ops | Group session contracts |

## 4 standard funnels
1. **Subject tutoring trial** — "free 1hr assessment + study plan" magnet
2. **Test-prep urgency** — SAT/ACT date-based 12-week package
3. **College admissions consult** — premium tier, multi-month nurture
4. **Specialty / IEP** — pediatrician-aligned, IEP-specialist landing

## Industry calculator spec
**Test-Score Improvement Estimator** — pick current score + target + weeks-to-test. Returns: program tier + total cost + improvement projection.

## Sizing/recommendation tool spec
**Subject Match** — quiz: struggle area + grade + learning style. Returns: recommended tutor + first-session topic.

## Service-area heatmap spec
Overlay: school-district density + high-school proximity + median-household-income heatmap (test-prep WTP).

## Real-world data anchors
- **Service mix**: subject 38% / test prep 18% / group 14% / admissions 10% / pediatric 8% / online 8% / district-contract 4%
- **Sample affiliates**: Local school counselors / pediatricians / Wyzant / Varsity Tutors network
- **Avg LTV**: $2,400 (year-long subject tutoring) / $3,800 (test-prep package) / $6K (admissions consult)
