# Mock Backend Config — Daycare / Childcare

> **When to use:** licensed daycare center, in-home childcare, preschool, drop-in care, after-school program.

## Customer category mix
| Type | % | Avg monthly tuition | Notes |
|---|---|---|---|
| Full-time enrollment (toddler / preschool) | 56% | $900-$2,400/mo | Highest LTV recurring |
| Part-time enrollment | 16% | $400-$1,200/mo | Mid-tier |
| Drop-in / occasional | 8% | $40-$80/day | Acquisition + ad-hoc |
| Pre-K / school-age after-school | 10% | $200-$600/mo | Add-on tier |
| Summer camp | 4% | $1.5K-$3.5K | Seasonal one-shot |
| Subsidized (state-voucher) | 4% | varies | Compliance-heavy |
| Waitlist (pre-applied) | 2% | $50 deposit | Top-of-funnel |

## Lead-quality signals
- **`enrollment_target_date`** = start within 30/60/90d (closer = hotter)
- **`age_band`** = infant (rare slots) / toddler / preschool / school-age
- **`expecting_or_newborn`** = pregnant / newborn = early-list cohort
- **`affiliate_source`** = OB-GYN / pediatrician / mom-group / employer-benefit
- **`income_band`** = drives tier WTP + state-subsidy eligibility

### Lead score formula
```
score = 30 + 24 if enrollment_target_date <= 30d + 22 if age_band='infant' (rare-slot)
  + 18 if affiliate_source + 14 if expecting_or_newborn
  + 12 if income_band='middle-high' (full-pay) + 10 if employer_benefit
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| OB-GYNs | Expecting-mom referrals |
| Pediatricians | New-baby + early-childhood |
| Mom-group leaders / new-mom classes | Word-of-mouth |
| Employers / HR | Employer-childcare benefit |
| Schools / preschool networks | Sibling enrollment |
| Realtors | New-resident family welcome |
| Children's hospital / clinic | Cross-referrals |
| Faith communities / churches | Family-trust networks |

## 4 standard funnels
1. **Expecting-mom waitlist** — "join waitlist now" 6-9mo nurture w/ tour invite
2. **Toddler / preschool enrollment** — virtual tour magnet + 14-day-start promise
3. **Summer camp** — Jan-March early-bird recurring annual
4. **Subsidized / voucher families** — compliance-aware nurture, paperwork-help magnet

## Industry calculator spec
**Tuition Estimator** — pick child age + schedule + sibling-discount. Returns: monthly tuition + annual + savings.

## Sizing/recommendation tool spec
**Schedule Matcher** — parent picks work-schedule + drop-off / pick-up windows. Tool returns: recommended schedule tier + cost.

## Service-area heatmap spec
Overlay: residential family-density zones + employer-HQ density (commute proximity) + young-child population density.

## Real-world data anchors
- **Enrollment mix**: full-time 56% / part-time 16% / drop-in 8% / after-school 10% / camp 4% / subsidy 4% / waitlist 2%
- **Sample affiliates**: Local OB-GYN / pediatricians / La Leche League / corporate HR (childcare-benefit programs)
- **Avg LTV**: $24K (2yr full-time enrollment) / $9K (annual after-school) / $3K (summer camp)
