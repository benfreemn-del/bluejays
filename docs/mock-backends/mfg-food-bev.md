# Mock Backend Config — Specialty Food + Beverage

> **Reference build:** KR Ranches (Prosser WA · farm-direct meat,
> custom-tier client, Shopify storefront + back-office on BlueJays).
> Showcase live at `/clients/kr-ranches`.
>
> **When to use:** any niche-product food/bev manufacturer making
> small-batch or specialty consumables — sauces, jerky, coffee, honey,
> hot sauce, spices, farm-direct meat / dairy / produce. Owner-maker
> typical, sells via farmer's market + DTC + a handful of co-op
> retailers + word-of-mouth.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Repeat consumer (DTC subscribe-and-save candidate) | 44% | $40-$180 | Low ticket, high frequency, high LTV |
| First-time consumer (gift / discovery) | 22% | $35-$120 | Convert to subscriber within 60 days |
| Restaurant / café buyer | 12% | $200-$1,400 | Recurring monthly orders |
| Specialty retailer / co-op | 10% | $400-$2,800 | Wholesale recurring per drop |
| Gift-shop / tourist-market buyer | 6% | $300-$1,800 | Seasonal volume |
| Subscription / club member | 4% | $40-$120/mo | Highest LTV — protect at all cost |
| Event / catering buyer | 2% | $200-$2,400 | Event-spec one-offs |

---

## Lead-quality signals

### DTC consumer signals
- **`flavor_pref`** = mild / medium / hot / smoky / sweet (drives flavor-fit funnel)
- **`use_case`** = everyday / cooking / gift / dietary-need / specialty-event
- **`subscription_likely`** = score 0-100 based on browsing pattern (visited "subscribe" page? ordered 2+ times?)
- **`region`** = local (in delivery / market range) / regional / national (drives shipping-eligibility)
- **`dietary_tag`** = keto / paleo / gluten-free / vegan / kosher / halal (drives sub-niche funnel)

### B2B signals
- **`buyer_type`** = restaurant / café / specialty-retail / gift-shop
- **`order_frequency`** = monthly / quarterly / seasonal
- **`reorder_risk`** = score for likelihood of churn (proxy: time since last order)

### Cross-cutting signals
- **`affiliate_source`** = food-blogger / podcast / market-customer / referral
- **`urgency`** = `high` if seasonal-product limited window OR holiday-gifting cycle
- **`seasonal_peak`** = depends on product (BBQ-sauce: May-Aug, hot-coffee: Oct-Mar, gift: Nov-Dec)

### Lead score formula (0-100)
```
score = 30 (base)
  + 18 if subscription_likely >= 70
  + 14 if buyer_type != null (B2B)
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 10 if seasonal_peak
  + 14 if dietary_tag != null AND product matches dietary
  + 12 if order_frequency='monthly'
  + 8  if region='local'
clamp 0-100
```

---

## Affiliate categories (8 types)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Food-blogger / recipe creator** | Recipe content uses the product | Featured-recipe posts |
| **Podcast / YouTube food show** | Audience trusts host picks | Sponsorships + revenue share |
| **Restaurant / café (peer)** | Cross-promo when products complement | Co-marketed bundles |
| **Specialty retailer (peer)** | Cross-cohort customer share | Co-promotions + tier orders |
| **Farmer's market organizer** | Event-based promotion | Market-day specials |
| **Gift-box / subscription curator** | Curated bundles include the product | Quarterly / seasonal feature |
| **Dietary-niche community (keto / paleo)** | Niche-trust influencer | Sub-niche-tagged offers |
| **Local food co-op** | Member loyalty drives brand discovery | Co-op-member discounts |

---

## Funnel taxonomy (4 standard funnels)

1. **First-time consumer (discovery)** — landed via market / blog / IG.
   - Lead magnet: "First-Order 15% Off + Recipe Pack PDF"
   - 5-step cadence: welcome → recipe → social proof → subscribe-and-save offer → reactivation
2. **Subscribe-and-save (committed buyer)** — primed for monthly cadence.
   - Lead magnet: "Insider Drop Calendar + Member-Only Flavors"
   - 4-step cadence: subscriber welcome → first-shipment story → upsell-bundle → loyalty rewards
3. **Restaurant / café B2B** — recurring buyer.
   - Lead magnet: "Wholesale Linesheet + Sample Pack offer"
   - 4-step cadence: linesheet → sample-pack send → first-order incentive → quarterly review
4. **Dietary niche (keto / paleo / etc.)** — cohort-aligned buyer.
   - Lead magnet: "[Dietary] Recipe Pack + Compliant Product Guide"
   - 4-step cadence: niche welcome → certified-compliance proof → compliant-product picks → niche subscribe CTA

---

## Industry calculator spec (interactive feature 1)

**Flavor-Profile Picker** — user picks heat level + cuisine style + use-case + dietary needs. Calculator returns:
- Top 3 product picks ranked by fit
- Recipe pairing for each
- Bundle pricing vs. piecewise
- Pre-segmented funnel auto-tag

---

## Sizing/recommendation tool spec (interactive feature 2)

**Subscription Builder** — user picks delivery cadence (monthly / quarterly) + household size + flavor variety. Tool returns:
- Recommended box content list
- Estimated cost per shipment
- Savings vs. ad-hoc DTC orders
- Cancel-anytime + skip-shipment promise

Drives the highest-LTV path (subscribers).

---

## Service-area heatmap spec (interactive feature 3)

**Local market + delivery-eligible map** — overlay shows:
- Active farmer's-market routes (where the brand currently sells)
- Local co-op / specialty-retailer concentration
- DTC repeat-customer clusters (where loyal customers live)
- Dietary-cohort density (where keto/paleo buyers cluster)

---

## Narrative simulator script (interactive feature 4)

**"Recipe blog → subscriber"** 60-second timeline:
1. **0:00** — Food blogger posts a recipe using the product, affiliate link.
2. **0:10** — Lead lands tagged `food-blog-affiliate`, `cooking-use-case`.
3. **0:25** — Flavor-Profile Picker runs → segments into First-Time funnel.
4. **0:40** — Welcome email + recipe pack + 15% off code.
5. **0:55** — User upgrades to monthly subscription on first checkout.
6. **0:60** — Affiliate dashboard: "+1 subscriber (LTV $480), $25 first-cycle commission."

---

## Real-world data anchors

- **Region mix in mock pool:** PNW 22% / South 22% / Midwest 18% / Northeast 18% / Mountain 12% / Coastal-CA 8%.
- **Real platform names to seed:** Shopify · Instagram · TikTok Shop · Local farmer's market apps.
- **Real cohort affinities:** keto · paleo · BBQ-enthusiast · coffee-snob · health-conscious-gift-buyer · homestead-cooking.
- **Real product types to seed:** [varies by prospect — sauce/jerky/honey/coffee/spice/meat].
- **Sample affiliate names:** TheKetoBlog · BBQ Master Class podcast · LocalFoodHero (regional) · GiftBoxCurator · HomesteadingFamily.
- **Avg deal size for ROI calc:** $58 (DTC), $720 (restaurant first order), $96/mo (subscriber MRR · LTV $1,200+).
