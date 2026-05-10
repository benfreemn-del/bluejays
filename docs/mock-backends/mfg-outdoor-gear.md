# Mock Backend Config — Outdoor + Hunting Gear

> **Reference build:** none yet — Nevarland Outpost has overlap on
> the apparel side; outdoor-specific anchor pending. Showcase target:
> `/v2/mfg-outdoor-gear`.
>
> **When to use:** any niche-product manufacturer making hunting,
> hiking, fishing, camping, or outdoor specialty gear. Owner-hunter /
> guide / outdoorsman typical, sells via niche shops + outfitters +
> word-of-mouth + outdoor forums.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Hunter / outdoorsman (DTC) | 40% | $80-$1,200 | Personal-use single purchases |
| Hunting outfitter / guide | 16% | $1,000-$8,000 | Gear for clients, recurring season prep |
| Specialty outdoor retailer | 14% | $4K-$28K | Wholesale recurring |
| Hiking / camping enthusiast | 12% | $60-$680 | Cross-niche overlap; gear-stack buyers |
| Fishing guide / charter | 8% | $400-$4,200 | Equipment for clients + boat outfit |
| Outdoor-content creator | 6% | varies | Content-first, revenue-share affiliate |
| Conservation / public-land org | 4% | $800-$5,000 | Bulk volunteer / education orders |

---

## Lead-quality signals

### DTC outdoor signals
- **`primary_activity`** = hunting / hiking / fishing / camping / overlanding (drives funnel)
- **`hunting_type`** = bow / rifle / waterfowl / big-game (sub-niche routing)
- **`gear_level`** = entry / mid / pro / expedition. Pro+ = high WTP.
- **`region`** = PNW / Rocky / Midwest / South / Northeast (drives season-fit + product-fit)
- **`activity_tenure`** = 0-2yrs (beginner) / 3-7 (committed) / 8+ (lifer)

### B2B / outfitter signals
- **`outfitter_type`** = guided hunt / charter / multi-sport / specialty
- **`client_count_per_year`** = proxy for gear-spend
- **`season_window`** = primary (e.g. fall waterfowl, spring turkey)

### Cross-cutting signals
- **`affiliate_source`** = pro hunter / podcast / forum / outfitter referral
- **`urgency`** = `high` if season-opener within 14 days
- **`seasonal_peak`** = depends on activity (waterfowl=Oct-Jan, turkey=Mar-May, hiking=May-Oct)

### Lead score formula (0-100)
```
score = 30 (base)
  + 18 if gear_level in ['pro','expedition']
  + 14 if outfitter_type != null (B2B)
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 10 if seasonal_peak
  + 12 if activity_tenure='8+'
  + 8  if region matches product seasonal-fit
clamp 0-100
```

---

## Affiliate categories (8 types)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Pro hunter / outfitter** | Field-tested endorsement | Specialty gear, bulk orders |
| **Outdoor podcast / YouTube** | Audience-trust influencer | Cross-promo + revenue share |
| **Specialty retail (e.g. Cabela's adjacent)** | Wholesale partnership | Recurring tier orders |
| **Hunting club / DU / RMEF chapter** | Conservation-org endorsement | Members-only deals |
| **Range / archery shop** | Local-community trust hub | Specialty gear featuring |
| **Outfitter network** | Multi-outfitter wholesale | Tier pricing + group buying |
| **Charter / guide group** | Boat outfit decisions | Marine-specific gear |
| **State conservation / DNR** | Education partnership | Educational gear, kid programs |

---

## Funnel taxonomy (4 standard funnels)

1. **First-year hunter / outdoorsman** — beginner, low-info.
   - Lead magnet: "First Hunt / First Hike Gear Checklist"
   - 5-step cadence: welcome → checklist → social proof → bundle offer → reactivation
2. **Pro outfitter** — proven high-WTP guide buyer.
   - Lead magnet: "Outfitter Spec Pack (heavy-use gear specs)"
   - 4-step cadence: peer testimonial → spec sheet → bulk-order pricing → consult call
3. **Sub-niche (waterfowl / bowhunting / etc.)** — deep-niche buyer.
   - Lead magnet: "[Sub-niche] Pro Tips + Gear Picks PDF"
   - 4-step cadence: niche welcome → pro tip → product fit → niche bundle CTA
4. **Wholesale retailer** — B2B funnel.
   - Lead magnet: "Wholesale Tier + MAP Policy"
   - 4-step cadence: tier sheet → ROI projection → first-order incentive → seasonal review

---

## Industry calculator spec (interactive feature 1)

**Pack Builder** — user picks activity + season + region + skill level. Calculator returns:
- Recommended gear list with priority order
- Estimated weight + total pack price
- "Why each piece" 1-liner
- Bundle savings if all picked

---

## Sizing/recommendation tool spec (interactive feature 2)

**Hunt-Type Recommender** — user picks the specific hunt (e.g. "PNW Roosevelt elk, archery, fall"). Tool returns:
- Top 3 product picks for that exact use case
- Tested-by testimonial from a guide who's hunted there
- Pre-segmented funnel auto-tag

---

## Service-area heatmap spec (interactive feature 3)

**Public-land + season-opener density map** — overlay shows:
- BLM / national forest / WMA hot zones
- Season-opener calendar density
- Outfitter cluster density
- Recent gear-purchase clusters

---

## Narrative simulator script (interactive feature 4)

**"Pro hunter post → first-time buyer"** 60-second timeline:
1. **0:00** — Pro hunter posts on Instagram with affiliate link.
2. **0:08** — Lead lands tagged `instagram-affiliate`, `bowhunting`, `archery`.
3. **0:20** — Pack Builder runs → tags as Sub-Niche Bowhunter funnel.
4. **0:35** — Welcome email + niche tip PDF arrives.
5. **0:50** — User clicks bundle CTA, places $480 order.
6. **0:60** — Pro hunter affiliate dashboard shows: "+1 sale, $96 commission."

---

## Real-world data anchors

- **Region mix in mock pool:** PNW 22% / Rocky Mountain 20% / Midwest 18% / South 18% / Northeast 12% / Alaska 6% / other 4%.
- **Activity mix:** hunting 48% / hiking 22% / fishing 14% / camping 10% / overlanding 6%.
- **Real publication / show names to seed:** MeatEater · Outdoor Life · Field & Stream · Backcountry Hunters & Anglers · Wired To Hunt podcast.
- **Real product types to seed:** [varies by sub-niche — populate per prospect's actual product line].
- **Sample affiliate names:** Steven Rinella (MeatEater) · The Hunting Public · Backcountry Hunters & Anglers · TheNorthernPursuit.
- **Avg deal size for ROI calc:** $260 (DTC), $3,800 (outfitter first order), $14,500 (retailer recurring annual).
