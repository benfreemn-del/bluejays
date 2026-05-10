# Mock Backend Config — Law Firm

> **When to use:** personal injury / family / estate / criminal / business / immigration / real-estate. Adjust per practice area.

## Customer category mix (varies HEAVILY by practice area; defaults shown for personal-injury)
| Type | % | Avg case value | Notes |
|---|---|---|---|
| Auto accident (PI) | 38% | $8K-$180K | Contingency, highest-margin |
| Slip-and-fall / premises | 14% | $4K-$80K | Contingency |
| Workers' comp | 10% | $5K-$45K | Contingency |
| Wrongful death | 6% | $50K-$1M+ | Premium |
| Family law (divorce) | 12% | $4K-$45K | Hourly + retainer |
| Estate planning | 8% | $1.5K-$8K | Flat-fee |
| Criminal defense | 8% | $3K-$45K | Hourly + retainer |
| Consultation only | 4% | $0-$300 | Top-of-funnel |

## Lead-quality signals
- **`incident_date`** = recent = high urgency
- **`injury_severity`** = drives case value
- **`statute_of_limitations`** = days remaining = HIGH urgency if <90
- **`prior_attorney`** = switching = ready-to-act
- **`affiliate_source`** = chiro / MD / referral / past-client
- **`practice_area`** = drives funnel routing

### Lead score formula (PI default)
```
score = 30 + 24 if statute_of_limitations < 90d + 20 if injury_severity in ['severe','catastrophic']
  + 16 if affiliate_source + 14 if recent_incident <= 30d
  + 12 if prior_attorney='switching' + 10 if insurance-claim-open
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Chiropractors | MVA / PI cross-referrals |
| Physical therapists | Post-injury referrals |
| MDs / urgent-care | Treatment + legal pairs |
| Insurance adjusters | Claim-driven referrals |
| Other attorneys (peer / specialty) | Referral fees on out-of-area |
| Clergy / counselors (family law) | Divorce referrals |
| Realtors | Estate / RE-attorney referrals |
| Bail bondsmen (criminal) | Cross-promo |

## 4 standard funnels
1. **PI auto-accident** — "after-the-accident checklist" magnet + 24hr consult
2. **Family law divorce** — sensitive-touch nurture w/ "what to expect" PDF
3. **Estate planning** — "Will & Trust starter kit" magnet + flat-fee package
4. **Past-client retention** — annual check-in for life-event triggers

## Industry calculator spec
**Case Value Estimator (PI)** — pick injury type + medical bills + lost wages. Returns: estimated settlement range + contingency calculation.

## Sizing/recommendation tool spec
**Practice-Area Triage** — visitor answers 6 questions about their situation. Returns: recommended practice area + urgency + free-consult CTA.

## Service-area heatmap spec
Overlay: hospital density + accident-incidence zones + court-jurisdiction density.

## Real-world data anchors
- **Case mix (PI default)**: auto 38% / family 12% / slip 14% / WC 10% / wrongful death 6% / estate 8% / criminal 8% / consult 4%
- **Sample affiliates**: Local chiro network / urgent care / state bar referral lists / specialist attorneys
- **Avg case (PI default)**: $24K avg settlement (33% contingency = $8K to firm) / $14K family-law retainer / $4K estate-flat
