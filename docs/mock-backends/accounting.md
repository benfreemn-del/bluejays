# Mock Backend Config — Accounting / Bookkeeping / CPA

> **When to use:** tax prep, bookkeeping, payroll, audit, advisory, fractional-CFO, business-formation.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Individual tax prep | 28% | $300-$1,200 | Annual cycle, predictable |
| Small-business bookkeeping (recurring) | 22% | $400-$2,500/mo | Highest LTV |
| Business tax / S-corp / LLC | 16% | $800-$3,500 | Annual + quarterly |
| Payroll service | 10% | $80-$300/mo + per-employee | Recurring |
| Advisory / fractional-CFO | 8% | $1.5K-$8K/mo | Premium tier |
| Audit / IRS resolution | 6% | $1.5K-$15K | Specialty urgent |
| Business formation (LLC / S-corp) | 6% | $400-$2,500 | One-shot, top-of-funnel |
| Estate / trust tax | 4% | $1.5K-$5K | Specialty |

## Lead-quality signals
- **`tax_deadline`** = April / extension Oct = HIGH urgency
- **`new_business`** = LLC formed in last 12mo = onboarding cohort
- **`existing_bookkeeping_lapse`** = behind books = urgency
- **`revenue_size`** = drives package WTP
- **`affiliate_source`** = attorney / banker / other-CPA / SCORE-mentor
- **`audit_signal`** = IRS letter received = HIGH urgency premium

### Lead score formula
```
score = 30 + 26 if audit_signal + 22 if tax_deadline <= 60d
  + 16 if affiliate_source + 14 if new_business
  + 12 if revenue_size >= $500K + 10 if existing_bookkeeping_lapse
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Business attorneys | Cross-referrals on biz formation |
| Bankers | New-business + commercial loan referrals |
| Insurance brokers | Cross-referrals on biz coverage |
| Wealth managers | Tax + estate planning pair |
| SCORE / chamber-of-commerce | Small-biz advisory referrals |
| Other CPAs (peer / specialty) | Niche-area referrals |
| Realtors (commercial) | Real-estate-attorney pair |
| Payroll vendors (Gusto / ADP) | Cross-referrals |

## 4 standard funnels
1. **Tax-deadline urgency** — March + September push, "don't miss the deadline" magnet
2. **Recurring bookkeeping** — "first month free + auto-recurring" magnet for new-business
3. **IRS resolution / audit** — premium urgent landing page, "we handle the letter" promise
4. **Advisory / fractional-CFO** — high-ticket nurture w/ revenue-tier filter

## Industry calculator spec
**Service Cost Estimator** — pick services (tax / bookkeeping / payroll / advisory) + business size. Returns: monthly tier + annual savings of bundle.

## Sizing/recommendation tool spec
**Service Match** — business owner picks 3 priorities (lower tax / clean books / grow / exit). Tool returns: recommended package tier.

## Service-area heatmap spec
Overlay: business-license density + commercial-real-estate density + new-LLC formation density.

## Real-world data anchors
- **Service mix**: individual tax 28% / bookkeeping 22% / business tax 16% / payroll 10% / advisory 8% / audit 6% / formation 6% / estate 4%
- **Sample affiliates**: Local attorneys / regional banker network / SCORE chapters / Gusto / ADP
- **Avg LTV**: $7,200 (recurring bookkeeping annual) / $2,400 (annual tax+payroll) / $24K (fractional-CFO annual)
