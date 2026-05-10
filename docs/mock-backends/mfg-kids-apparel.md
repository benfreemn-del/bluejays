# Mock Backend Config — Kids' Apparel + Specialty Apparel

> **Reference build:** Nevarland Outpost (Christopher · handmade kids'
> + adult apparel, Shopify storefront + back-office on BlueJays).
> Showcase live at `/clients/nevarland-outpost`.
>
> **When to use:** any niche-product apparel manufacturer making
> handmade / small-batch / specialty kids' or family clothing — outdoor
> kids, faith-based, niche-fandom, homestead/farm aesthetic, etc.
> Owner-maker typical, sells via Shopify + craft fairs + Instagram.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Family / parent (DTC repeat) | 50% | $35-$220 | Single-product orders, returns ~40% |
| Gift-buyer (grandparent / aunt / friend) | 18% | $40-$140 | Higher gift-cart, lower repeat |
| Niche-cohort buyer (homestead / outdoors-family / faith) | 14% | $50-$320 | Brand-fit, very-high LTV |
| Boutique / retailer (small wholesale) | 8% | $400-$2,800 | Wholesale recurring per drop |
| Maker-fair / market organizer | 4% | $200-$1,400 | Event-only bulk |
| Influencer / mom-blogger | 4% | varies | Cross-promo + revenue share |
| School / homeschool group | 2% | $200-$1,200 | Group orders, season-driven |

---

## Lead-quality signals

### Family / parent signals
- **`kids_count`** = 1 / 2 / 3+. Bigger family = bigger bundle WTP.
- **`age_band_mix`** = baby / toddler / kid / preteen (drives sizing recs)
- **`niche_affinity`** = outdoors / homestead / faith / classic / minimalist (drives funnel)
- **`shopping_pattern`** = single-piece / bundle / drop-camper. Drop-campers preorder every drop.

### Wholesale signals
- **`boutique_size`** = solo / small / regional / online-only
- **`drops_per_year`** = how many seasonal pushes the boutique runs
- **`niche_match_score`** = how aligned their store is with the brand aesthetic

### Cross-cutting signals
- **`affiliate_source`** = mom-blog / influencer / craft-fair / referral / direct
- **`urgency`** = `high` if drop-window within 7 days OR back-to-school window
- **`seasonal_peak`** = back-to-school (Aug), holiday gifting (Nov-Dec), mother's-day window (Apr-May)

### Lead score formula (0-100)
```
score = 30 (base)
  + 16 if shopping_pattern='drop-camper'
  + 14 if boutique_size != null (B2B)
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 10 if seasonal_peak
  + 12 if niche_match_score >= 70
  + 10 if kids_count >= 3
clamp 0-100
```

---

## Affiliate categories (8 types)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Mom-blogger / IG-momfluencer** | Audience trusts gear picks | Drop-launch promo, bundles |
| **Niche-cohort blogger (homestead / faith)** | Cohort-trust | Niche-themed product features |
| **Boutique / store owner (peer)** | Cross-stocks similar brands | Wholesale orders |
| **Craft fair / maker market organizer** | Event-based bulk needs | Event-spec drops |
| **Mom-group leader (HOA / school / church)** | Word-of-mouth multiplier | Family bundle orders |
| **Photography / family-portrait studio** | Outfit-source for sessions | Sample-set partnerships |
| **Homeschool co-op / community** | Group-buying organizer | Bulk seasonal orders |
| **Etsy / handmade marketplace partner** | Cross-platform discovery | Featured listings |

---

## Funnel taxonomy (4 standard funnels)

1. **New parent / first-time buyer** — discovery shopper.
   - Lead magnet: "Sizing Guide + First-Order 10% Off"
   - 5-step cadence: welcome → sizing PDF → social proof → bundle offer → reactivation
2. **Drop-camper (returning superfan)** — already loyal, primed for next drop.
   - Lead magnet: "Drop-Day Early Access" list
   - 4-step cadence: drop preview → drop launch → restock window → next-drop tease
3. **Niche-cohort (homestead / faith / outdoors)** — values-aligned buyer.
   - Lead magnet: "Cohort-themed lookbook PDF"
   - 4-step cadence: niche welcome → values story → product-fit → niche bundle CTA
4. **Boutique wholesale** — B2B funnel.
   - Lead magnet: "Wholesale Linesheet + MOQ + Drop Calendar"
   - 4-step cadence: linesheet → drop preview → first-order incentive → seasonal review

---

## Industry calculator spec (interactive feature 1)

**Outfit Builder** — parent picks kid age + occasion (every-day / outdoors / dressy / matching-family). Calculator returns:
- 3-5 piece outfit recommendation
- Sizing-range warning (between sizes? size up advice)
- Bundle savings vs. piecewise
- Pre-segmented funnel auto-tag

---

## Sizing/recommendation tool spec (interactive feature 2)

**Sizing Helper** — parent enters kid age + height + weight + recent-brand-fit ("they wear 4T in OldNavy"). Tool returns:
- Recommended size for THIS brand's actual fit
- Confidence indicator + back-up size
- Link to closest fit guide / size chart

Reduces returns dramatically (handmade-apparel return rate is the silent margin killer).

---

## Service-area heatmap spec (interactive feature 3)

**Customer-cluster + craft-fair density map** — overlay shows:
- Existing repeat-customer clusters (where loyal fans live)
- Major craft-fair calendar density
- Boutique partnership density
- Niche-cohort affinity zones (e.g. homesteading hot states)

---

## Narrative simulator script (interactive feature 4)

**"Mom-blog post → drop-camper sale"** 60-second timeline:
1. **0:00** — Mom-blogger posts an outfit pic with affiliate link.
2. **0:08** — Lead lands tagged `mom-blog-affiliate`, `outdoor-niche`.
3. **0:20** — Outfit Builder runs → segments into Niche-Cohort funnel.
4. **0:35** — Welcome email + lookbook + 10% off code.
5. **0:50** — User opts into Drop-Day list, places $128 first order.
6. **0:60** — Mom-blogger affiliate dashboard: "+1 sale, $25 commission."

---

## Real-world data anchors

- **Cohort mix in mock pool:** outdoors-family 28% / homestead 22% / faith-based 16% / classic-modern 14% / niche-fandom 12% / matching-family 8%.
- **Real platform names to seed:** Shopify · Instagram · Etsy · TikTok Shop · ShopApp.
- **Real cohort-influencer types:** homestead-mom blog · trad-life IG · outdoor-family YT · faith-based mom podcast.
- **Real product types to seed:** kids tees · adult tees · hoodies · onesies · matching-family sets · seasonal limited drops.
- **Sample affiliate names:** TheBoldAbode (faith) · OurHandcraftedLife (homestead) · TheTinyHikers (outdoors) · ModernMomBlogger.
- **Avg deal size for ROI calc:** $85 (DTC), $1,200 (boutique first order), $4,800 (boutique recurring annual).
