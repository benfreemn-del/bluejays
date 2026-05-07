# Manufacturer Lookalike Backlog

**Why this exists:** All validated $10k AI System closes + warm inbounds
to date (ITC Quick Attach, Zenith Sports / TEKKY, Nevarland Outpost)
are **niche product manufacturers**. This is the BlueJays $10k ICP.
Cold outreach + Google Ads + bespoke previews all target prospects
matching this shape.

**3-anchor data point lock (post-2026-05-06 deep dive):** the audience
taxonomy holds across radically different verticals — steel ag/farm
equipment (ITC), sports gear (Zenith), kids' apparel (Nevarland).
Pattern is vertical-agnostic. Every match has an end-buyer + influencer/
decision-maker + channel partner. See the deep-dive synthesis report
for evidence.

**Source of truth:**
- Sales motion: `memory/project_10k_sales_motion.md`
- Validation play: `aios/decisions/2026-05-05_10k_validation_play.md`
- 7-step action queue: `aios/decisions/2026-05-05_10k_validation_action_queue.md`

## ICP shape (every prospect must match all 4)

1. Makes a single hero physical product (or a small line around one specialty)
2. Owner-operated, founder still active in the business, US-based
3. Weak / outdated / nonexistent online presence
4. Currently sells via distributors, B2B, fairs, or word-of-mouth — no real DTC funnel

## Sales motion (3-step ladder — NEVER skip steps)

1. **Cold pitch with FREE preview website** — the $997 hook, given away
2. **Backend tour** on followup call — show them the AI System portal (leads / funnel / ad library / AI responder)
3. **Mock backend frame** on second followup, customized with THEIR product / audience / funnel → $10k close

The $10k close happens on Step 3, NEVER on cold email. Both validated closes followed this exact path.

## The 5 categories — bespoke portfolio site queue

Each row tracks: status (whether a V2 showcase + dynamic preview renderer exist), sub-niches to scout, and Google Places search-query templates ready to feed the scout.

Update the **Status** column as templates ship. When status flips to ✅, sales can immediately point cold prospects at the showcase URL + generate a real preview at `/preview/[id]`.

---

### 1. Custom ag / farm equipment — `mfg-ag-equipment`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | ITC Quick Attach (closed $10k) |
| Showcase URL when built | `/v2/mfg-ag-equipment` |
| Priority | **#1** (warmest — ITC may refer) |

**Sub-niches:**
- Implement / attachment fabricators (post-hole augers, hay rakes, plows)
- Custom small-tractor parts + bolt-on accessories
- Specialty livestock equipment (chutes, gates, feeders)
- Farm gate / fencing fabricators
- Hitch + tow accessory makers

**Google Places search queries** (paste into the scout tool):
```
custom tractor attachment manufacturer
farm implement fabricator
livestock equipment manufacturer
custom hitch fabricator
agricultural equipment maker
```

---

### 2. Specialty sports equipment — `mfg-sports-equipment`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | Zenith Sports / TEKKY (closed $10k) |
| Showcase URL when built | `/v2/mfg-sports-equipment` |
| Priority | **#2** (Zenith may refer) |

**Sub-niches:**
- Training-gear makers (weighted balls, agility tools, recovery equipment, plyo boxes)
- Custom mouthguard / pad / impact-gear makers
- Niche-sport gear (lacrosse heads, ultimate discs, custom pickleball paddles, archery gear)

**Google Places search queries:**
```
sports training equipment manufacturer
custom mouthguard maker
pickleball paddle manufacturer
lacrosse equipment maker
specialty fitness equipment manufacturer
```

---

### 3. Custom auto / moto parts — `mfg-auto-parts`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | none yet — but highest avg ticket + cleanest "fire your distributor" angle |
| Showcase URL when built | `/v2/mfg-auto-parts` |
| Priority | **#3** (highest expected ticket) |

**Sub-niches:**
- Specialty wheel / brake / exhaust fabricators
- Leather interior / seat upholstery makers
- Restomod parts + classic-car restoration shops
- Custom motorcycle parts (tanks, seats, exhaust)

**Google Places search queries:**
```
custom auto parts manufacturer
restomod parts shop
custom motorcycle parts maker
specialty exhaust fabricator
custom wheel manufacturer
```

---

### 4. Outdoor + hunting gear — `mfg-outdoor-gear`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | none yet |
| Showcase URL when built | `/v2/mfg-outdoor-gear` |
| Priority | **#4** (high passion, decent ticket) |

**Sub-niches:**
- Custom call makers (duck, elk, predator, turkey)
- Specialty decoy + treestand makers
- Custom fishing tackle / lure / fly makers
- Bow / archery accessory fabricators

**Google Places search queries:**
```
custom duck call maker
custom hunting decoys manufacturer
specialty fishing lure maker
archery accessory manufacturer
custom treestand maker
```

---

### 5. Kids' apparel — `mfg-apparel-kids`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | Nevarland Outpost (inbound, prospect id `2948ccc0-cb20-4a6d-a9aa-822291845ea2`, status=contacted, email `maxwell.five@outlook.com` — needs enrichment for real website / city / state / product line) |
| Showcase URL when built | `/v2/mfg-apparel-kids` |
| Priority | **#3** (warm inbound — Nevarland already engaged) |

**Sub-niches:**
- Made-in-USA kids' clothing brands
- Children's outdoor / hiking apparel makers
- Organic / natural-fiber kids' brands (cottagecore, vintage Americana, neutrals aesthetic)
- Kids' uniform / costume / matching-family-set makers
- Specialty children's footwear

**Audience segments per the deep-dive 3-segment template:**
- **End-buyer:** parents (warm-buy, like Zenith parents — emotional, multi-touch nurture, lead magnet = look-book / size-fit guide / sustainable-source story)
- **Influencer / decision-maker:** parenting bloggers / mom-influencers / kids' boutique buyers (B2B retail buyers similar to Zenith coaches — lead magnet = wholesale catalog with margin math)
- **Channel partner:** kids' boutiques, daycares, gift shops, Instagram/Etsy resellers (commission tier 25-40%)

**Google Places search queries** (also in `scout-optimizer.ts` SMART_QUERIES):
```
kids clothing manufacturer USA
children apparel brand made in usa
small batch kids clothing maker
kids boutique clothing brand
children outdoor apparel manufacturer
```

---

### 6. Specialty food + bev — `mfg-food-bev`

| Field | Value |
|---|---|
| Status | ⏳ backlog (no V2 template yet) |
| Anchor proof | KR Ranches (custom-tier client, not $10k yet) |
| Showcase URL when built | `/v2/mfg-food-bev` |
| Priority | **#5** (high volume, low avg ticket — last priority) |

**Sub-niches:**
- Small-batch jerky / sauce / hot-sauce makers
- Specialty coffee roasters with DTC ambition
- Honey / maple / cottage-food producers
- Niche spice / seasoning blenders

**Google Places search queries:**
```
small batch hot sauce maker
specialty coffee roaster
artisan jerky maker
craft honey producer
specialty spice blender
```

---

## Process — adding a new manufacturer prospect

1. Use one of the search queries above against Google Places (manual scout via dashboard)
2. Tag every prospect created from this list with:
   - `source = cold-email-mfg-lookalike`
   - `lookalike_category = <one of mfg-ag-equipment / mfg-sports-equipment / etc>`
   - `manually_managed = false` (per Rule 49 — auto-funnel eligible)
3. Filter out (per Rule 50):
   - Killer existing websites (≥80 quality score)
   - Franchise / national-chain locations
4. Send the standard preview-site cold pitch (Step 1 of the 3-step ladder)
5. For replies → book Step 2 (backend tour) → Step 3 (mock backend frame) → close

## Process — building each V2 manufacturer showcase

When a category gets prioritized for a V2 build:

1. Follow the V2 Upgrade Checklist in `CLAUDE.md`
2. Use this category's anchor proof (ITC, Zenith, KR) as the visual / copy reference
3. Hero, services, testimonials should be DTC-focused — "sell direct, replace your distributor margin" is the message
4. Add the slug to `ACTIVE_CATEGORIES` in `src/lib/scout.ts`
5. Add Google Places search queries to `getSmartQueries()` in `src/lib/scout-optimizer.ts`
6. Update the Status column in this doc to ✅ + paste the live showcase URL
7. Notify Ben so he can re-trigger preview generation for any prospects already in the pipeline tagged with this `lookalike_category`

## Day 21 review (2026-05-26)

At Day 21 of the validation play, this doc gets revisited alongside `aios/decisions/2026-05-05_10k_validation_play.md`. Top question: **which sub-niche produced the most replies?** That category becomes the priority for the next V2 build.
