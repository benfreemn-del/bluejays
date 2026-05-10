# Mock Backend Config — Physical Therapy

> **When to use:** outpatient PT clinic — orthopedic, sports, post-surgical, neuro, pelvic-floor, pediatric.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Post-surgical recovery | 28% | $120-$220/visit | MD-referred, 12-30 visit cycle |
| Sports injury | 22% | $130-$240/visit | Higher self-pay willingness |
| Chronic pain (back/neck) | 18% | $110-$210/visit | 8-20 visit cycle |
| Auto / work injury | 12% | $150-$300/visit | Insurance / workers-comp |
| Pelvic-floor specialty | 8% | $150-$280/visit | OB-aligned, growing demand |
| Pediatric / developmental | 6% | $130-$240/visit | School / pediatrician referrals |
| Maintenance / wellness | 6% | $110-$190/visit | Self-pay continuity |

## Lead-quality signals
- **`MD_referral`** = signed Rx in hand → very high close rate
- **`surgery_date`** = post-surgical timeline = scheduled-care
- **`workers_comp_open`** = active claim = insurance-billed flow
- **`sports_event`** = injury-while-training, time-bound recovery
- **`affiliate_source`** = orthopedist / chiro / OB / coach / employer

### Lead score formula
```
score = 30 + 24 if MD_referral + 20 if workers_comp_open
  + 16 if affiliate_source + 14 if surgery_date <= 30d
  + 12 if sports_event + 10 if insurance_in_network
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Orthopedists | Post-surgical referral pipeline |
| OB-GYNs | Pelvic-floor referrals |
| Pediatricians | Developmental PT referrals |
| Neurologists | Stroke / neuro-rehab |
| Chiropractors | Pain-management cross-referrals |
| Personal-injury attorneys | MVA / workers-comp |
| Athletic trainers / coaches | Sports-injury pipeline |
| Workers-comp adjusters | Active-claim referrals |

## 4 standard funnels
1. **Post-surgical recovery** — MD-aligned, "first-visit-within-72hrs-of-surgery" promise
2. **Sports injury** — coach / trainer-aligned, "return-to-play" timeline magnet
3. **Workers-comp / MVA** — attorney + adjuster aligned, billing-handled-for-you
4. **Pelvic-floor / women's health** — OB-aligned, dignified-care nurture

## Industry calculator spec
**Recovery Timeline Estimator** — pick injury / surgery + age + activity level. Returns: visit count + 6-week / 12-week plan + return-to-activity date.

## Sizing/recommendation tool spec
**Injury Type Recommender** — patient locates pain on body diagram + describes activity. Tool returns: likely diagnosis category + recommended specialty (sports vs. ortho vs. pelvic).

## Service-area heatmap spec
Overlay: orthopedic-surgery density (post-op pipeline) + sports-event venue density + ergonomic-workplace concentrations (workers-comp signal).

## Real-world data anchors
- **Visit mix**: post-surgical 28% / sports 22% / chronic 18% / WC/MVA 12% / pelvic 8% / pediatric 6% / wellness 6%
- **Sample affiliates**: Local orthopedist / OB-GYN / DPT-network / regional workers-comp adjusters
- **Avg cycle revenue**: $2,400 (16-visit post-op) / $1,200 (8-visit sports) / $4,800 (workers-comp 24+ visits)
