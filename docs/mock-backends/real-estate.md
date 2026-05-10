# Mock Backend Config — Real Estate Agent / Brokerage

> **When to use:** residential agent / team / brokerage. Buyer-side / seller-side / both.

## Customer category mix
| Type | % | Avg deal value | Notes |
|---|---|---|---|
| Buyer (first-time) | 28% | $4K-$22K (commission) | Long-cycle, education-heavy |
| Buyer (move-up / repeat) | 22% | $8K-$45K | Faster-cycle |
| Seller (listing) | 24% | $10K-$60K | Highest-margin |
| Investor / multi-property | 8% | $4K-$25K (per deal) | Highest-LTV repeat |
| Relocation | 8% | $6K-$30K | Corporate-driven |
| Pre-listing consult | 6% | $0 (lead-gen) | Top-of-funnel |
| Past-client / sphere | 4% | $8K-$40K | Highest close rate |

## Lead-quality signals
- **`pre_qualified`** = mortgage pre-approval = SERIOUS
- **`timeline_window`** = 0-3mo / 3-6mo / 6-12mo / 12+ (sooner = hotter)
- **`buyer_or_seller`** = drives funnel
- **`first_time_or_repeat`** = drives education depth
- **`affiliate_source`** = lender / past-client / referral-network / sphere
- **`local_or_relo`** = relo = corporate referral cohort

### Lead score formula
```
score = 30 + 24 if pre_qualified + 18 if timeline_window <= 3mo
  + 16 if affiliate_source='past-client' + 14 if affiliate_source='lender'
  + 12 if buyer_or_seller='seller' + 10 if first_time_or_repeat='repeat'
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Mortgage lenders | Pre-qualified buyer pipeline |
| Past clients (sphere) | Referrals = highest close |
| Title / escrow | Reciprocal cross-referrals |
| Stagers | Pre-listing partnerships |
| Photographers | Listing-photo recurring |
| Inspectors / contractors | Pre-listing repair work |
| Corporate relocation | Relo-buyer pipeline |
| Other agents (peer / network) | Referral fees on out-of-area |

## 4 standard funnels
1. **First-time buyer education** — 12-week nurture w/ "How to Buy" guide + lender intro
2. **Seller pre-list consult** — "What's My Home Worth?" calculator + 30-day prep nurture
3. **Past-client retention** — annual "home value report" + life-event triggered (divorce / kids / retirement)
4. **Investor / multi-property** — deal-flow newsletter + off-market opportunities

## Industry calculator spec
**Home Value Estimator** — owner enters address + answers 5 questions. Returns: estimated value range + market trend + "ready to list" CTA.

## Sizing/recommendation tool spec
**Buyer Match** — buyer answers 8 questions (price / area / commute / school / lifestyle). Returns: top 3 listings + saved-search auto-tag.

## Service-area heatmap spec
Overlay: recent listing density + sale-price-by-ZIP + days-on-market heatmap.

## Real-world data anchors
- **Deal mix**: buyer first-time 28% / buyer repeat 22% / seller 24% / investor 8% / relo 8% / consult 6% / past-client 4%
- **Sample affiliates**: Local lenders (Caliber / Rocket / Movement) / staging companies / RE/MAX referral network
- **Avg commission**: $14K avg per side / $25K avg per double-end / $4K-$8K referral fees
