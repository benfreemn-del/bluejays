# Mock Backend Config — Appliance Repair

> **When to use:** in-home repair of refrigerator / dishwasher / washer / dryer / stove / oven / microwave.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Single-appliance repair | 56% | $180-$550 | Diagnose-fee + parts + labor |
| Warranty / extended-warranty | 16% | $0 (covered) | Insurance referrals |
| Multi-appliance same-visit | 10% | $400-$900 | Up-sell on call |
| Property mgmt | 8% | $250-$700 | Multi-unit recurring |
| Pre-listing repair | 6% | $200-$650 | Realtor-driven |
| Repair-vs-replace consult | 4% | $100-$200 | Low-cost diagnostic |

## Lead-quality signals
- **`appliance_type`** = fridge / dishwasher / washer / dryer / oven / stove
- **`appliance_age_yrs`** = drives repair-vs-replace recommendation
- **`urgency_signal`** = food spoiling / no-laundry-for-week / no-cooking
- **`brand`** = drives parts availability + complexity (Sub-Zero, Wolf, Viking = high-value)
- **`affiliate_source`** = realtor / property-mgmt / appliance-retailer / warranty-network

### Lead score formula
```
score = 30 + 22 if urgency_signal='food-spoiling' + 16 if affiliate_source
  + 14 if brand in ['Sub-Zero','Wolf','Viking','Miele'] (premium WTP)
  + 12 if appliance_age_yrs <= 8 (worth-fixing) + 10 if property_mgmt
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Appliance retailers | Sale + install + service-plan referrals |
| Realtors | Pre-listing repairs |
| Property managers | Multi-unit recurring |
| Home warranty companies | Network referrals |
| Insurance adjusters | Loss-claim referrals |
| Plumbers | Dishwasher / washer overlap |
| Electricians | Oven / range / dryer overlap |
| HOAs | Approved-vendor lists |

## 4 standard funnels
1. **Same-day repair** — text-to-diagnose + 4hr arrival promise
2. **Repair-vs-replace** — calculator-led nurture w/ "is it worth fixing?" content
3. **Property mgmt B2B** — recurring tier with multi-unit pricing
4. **Premium-brand specialist** — Sub-Zero / Wolf / Viking landing page (margin protector)

## Industry calculator spec
**Repair-vs-Replace** — pick appliance + age + repair-cost-quoted. Returns: replace-recommendation Y/N + 5-yr cost projection.

## Sizing/recommendation tool spec
**Diagnostic Helper** — owner answers 6 questions about symptom. Returns: likely cause + repair-cost range + DIY-safety check.

## Service-area heatmap spec
Overlay: housing-age density + multi-unit property density + recent-appliance-purchase zones (warranty-window cohort).

## Real-world data anchors
- **Brand mix**: Whirlpool 22% / GE 18% / Samsung 16% / LG 12% / Sub-Zero 6% / Wolf 4% / other 22%
- **Sample affiliates**: AHS Home Warranty / Fidelity / regional appliance retailers (Lowe's pro contacts) / regional property managers
- **Avg deal**: $290 single-repair / $520 multi-appliance / $850 premium-brand
