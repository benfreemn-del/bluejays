# Mock Backend Config — General Contractor

> **When to use:** residential remodel, kitchen / bath, additions, whole-home renovation, design-build.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Kitchen remodel | 24% | $35K-$95K | Long-cycle (3-9mo close) |
| Bathroom remodel | 22% | $18K-$55K | Mid-cycle (1-4mo close) |
| Whole-home renovation | 14% | $120K-$650K | Highest-ticket, longest cycle |
| Addition / 2nd story | 10% | $80K-$280K | Permit-heavy |
| Repair / damage | 8% | $5K-$45K | Insurance-claim driven |
| Pre-purchase consult | 8% | $300-$800 | Realtor-aligned |
| ADU / DADU | 6% | $120K-$320K | Permit-driven new build |
| Commercial tenant improvement | 8% | $25K-$180K | B2B recurring |

## Lead-quality signals
- **`scope`** = kitchen / bath / whole-home / addition / ADU / commercial
- **`property_value`** = drives WTP (>$1M = high-end finish tier)
- **`design_stage`** = idea / sketches / architect-engaged / permit-ready
- **`budget_disclosed`** = $X budget = serious buyer signal
- **`recent_listing_pulled`** = stay-and-renovate cohort
- **`affiliate_source`** = architect / designer / realtor / lender

### Lead score formula
```
score = 30 + 22 if budget_disclosed + 18 if design_stage='permit-ready'
  + 16 if affiliate_source + 14 if property_value >= $800K
  + 12 if scope='whole-home' + 10 if scope in ['ADU','addition']
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Architects | Design-build partnerships |
| Interior designers | Project-flow partnerships |
| Realtors | Stay-and-renovate referrals |
| Lenders / mortgage brokers | Renovation-loan referrals |
| Sub-trades (electrician/plumber/HVAC) | Reciprocal referrals |
| Building supply / kitchen showrooms | Counter referrals |
| HOAs | Approved-contractor lists |
| Insurance adjusters | Damage-claim restoration |

## 4 standard funnels
1. **Kitchen remodel discovery** — design-magazine-style portfolio + 3-week-timeline guide
2. **Whole-home / addition** — long-cycle nurture w/ design-stage check-ins
3. **Pre-purchase consult** — realtor-aligned 48hr turnaround "remodel feasibility" report
4. **Insurance-claim restoration** — adjuster-aligned, fast-mobilization promise

## Industry calculator spec
**Remodel Cost Estimator** — pick scope + sq ft + finish-tier (good/better/best) + region. Returns: cost range + 4-week / 8-week / 12-week timeline + permit needed Y/N.

## Sizing/recommendation tool spec
**Scope-Stage Recommender** — homeowner picks where they are (idea / sketches / architect / permit-ready). Tool returns: next 3 actions + estimated cost-of-each + which sub-trades they'll need.

## Service-area heatmap spec
Overlay: home-permit density + housing-age zones (renovation candidates) + property-value heatmap (high-end remodel zones).

## Real-world data anchors
- **Job mix**: kitchen 26% / bath 24% / whole-home 14% / repair 12% / addition 10% / commercial 8% / other 6%
- **Sample affiliates**: AIA Architects / NKBA designers / Realtor.com agents / regional renovation lenders
- **Avg deal**: $48,000 kitchen / $32,000 bath / $245,000 whole-home / $185,000 ADU
