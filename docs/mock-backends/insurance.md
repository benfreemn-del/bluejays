# Mock Backend Config — Insurance Agency

> **When to use:** independent agent / agency — auto / home / life / health / commercial / specialty.

## Customer category mix
| Type | % | Avg policy / commission | Notes |
|---|---|---|---|
| Auto + home bundle | 32% | $200-$600/yr commission | Highest-LTV recurring |
| Auto-only | 18% | $100-$280/yr | Acquisition channel |
| Homeowners | 14% | $150-$500/yr | Pair with auto |
| Life insurance | 10% | $400-$3K (one-shot) | Commission-heavy |
| Commercial GL / BOP | 10% | $500-$5K/yr commission | B2B recurring |
| Health / Medicare supplement | 8% | $200-$800/yr | Senior cohort |
| Umbrella | 4% | $80-$200/yr add-on | High-net-worth |
| Specialty (boat / RV / motorcycle) | 4% | $80-$300/yr | Recurring add-on |

## Lead-quality signals
- **`life_event`** = home purchase / new car / new baby / marriage / job-change = HIGH
- **`renewal_window`** = current policy expiring within 30/60/90d
- **`prior_claim`** = recent claim = shopping cohort
- **`bundle_potential`** = auto + home + umbrella signals
- **`affiliate_source`** = realtor / lender / car-dealer / financial-advisor
- **`net_worth_signal`** = drives umbrella + premium tier WTP

### Lead score formula
```
score = 30 + 22 if life_event (home/car/baby/marriage)
  + 18 if renewal_window <= 30d + 16 if affiliate_source
  + 14 if bundle_potential + 12 if prior_claim
  + 10 if commercial_signal
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Realtors | Home-purchase = home-insurance referral |
| Mortgage lenders | Loan-required insurance referral |
| Car dealers | New-car insurance referrals |
| Financial advisors | Life + umbrella + estate pair |
| Business attorneys | Commercial GL referrals |
| Wealth managers | Premium net-worth umbrella |
| Other agents (peer) | Out-of-state / specialty referrals |
| Boat / RV dealers | Specialty insurance referrals |

## 4 standard funnels
1. **Life-event capture** — "just bought a home? get instant quote" magnet
2. **Renewal-window switching** — "save when your policy expires" 30-60-90 day pre-renewal nurture
3. **Auto+home bundle** — "save 20% bundling" comparison calculator
4. **Commercial GL B2B** — small-business owner ROI calculator + biz-formation pair

## Industry calculator spec
**Bundle Savings Calculator** — pick policies + carriers + state. Returns: estimated bundle savings + carrier-comparison.

## Sizing/recommendation tool spec
**Coverage Match** — quiz: assets + life stage + risk tolerance. Returns: top 3 policy recommendations + estimated annual cost.

## Service-area heatmap spec
Overlay: home-purchase density + new-business formation density + high-net-worth ZIP zones.

## Real-world data anchors
- **Policy mix**: auto+home 32% / auto-only 18% / home 14% / life 10% / commercial 10% / health 8% / umbrella 4% / specialty 4%
- **Sample affiliates**: Realtor.com agents / regional lender network / car dealer F&I managers
- **Avg LTV (per household)**: $4,800 (5yr auto+home) / $2,400 (5yr auto-only) / $14K (commercial 5yr)
