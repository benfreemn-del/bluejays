# Cold-Traffic Ads — Wave 1 (2026-05-17)

3 audiences × 4 hooks = **12 ads** for the FB launch. Targets the
locked manufacturer / DTC brand / indie author ICP. Each ad's
destination URL carries `utm_audience` which auto-selects the
matching toggle on `/audit` (see `FourReasonsAudience.tsx` —
`UTM_AUDIENCE_MAP`).

Wave 2 (next week, after Wave 1 data picks a winner) layers in 3-4
fresh Ben-recorded selfie videos tuned to the winning ICP. This doc
is Wave 1 only.

**Per the "No client names in paid ads" rule (locked 2026-05-06):**
all creative uses aggregate framing. Zero client names.

**Per the "Offer ladder — two public tiers + autopilot rule"
(Rule 65):** the $500/mo management line stays OFF cold-traffic
creative. The two front doors are the free audit (entry) and the
$10K AI System (eventual close). No middle pricing on cold surfaces.

---

## ⚠ PRE-LAUNCH CHECKLIST — 8 items, ALL must be green

| # | Item | How to verify |
|---|------|---------------|
| 1 | `NEXT_PUBLIC_META_PIXEL_ID` set on Vercel | Vercel → Settings → Env Vars. Format: 16-digit string, no `meta.` prefix. After setting, redeploy. |
| 2 | Pixel fires on /audit (PageView) | Open https://bluejayportfolio.com/audit in Chrome → DevTools Network → filter `facebook.com` → reload. Expect `tr/` request with `ev=PageView`. |
| 3 | `Lead` event fires on form submit | Submit a test audit with your email. Network tab should show `tr/` with `ev=Lead`. |
| 4 | Meta Events Manager sees the events | Meta Business Suite → Events Manager → Pixel → Test Events tab. Submit again from /audit; events appear within 5 sec. |
| 5 | Conversion campaign optimizes for `Lead` | Campaign create → conversion event = `Lead`. NOT PageView. NOT View Content. |
| 6 | Each ad URL routes correctly | Open each destination URL in incognito. Confirm: (a) /audit loads, (b) the "Sound familiar?" audience toggle is pre-selected to the matching ICP, (c) `/dashboard/cold-traffic` shows the visit under the right utm_audience/utm_content within 30 sec. |
| 7 | Audience-toggle UTM auto-select works | Visit `https://bluejayportfolio.com/audit?utm_audience=dtc` — the toggle should land on "I run a DTC brand" not "I make a product". Repeat for `=mfg` (→ manufacturer) and `=author` (→ indie author). |
| 8 | HyperAgent (or other image gen) has output for all 12 image prompts | Each ad needs both a 1:1 (Feed) and 9:16 (Stories/Reels) variant. 24 images total. |

---

## Campaign settings — apply to all 3 audiences

- **Objective:** Conversions (Sales). NOT Traffic.
- **Conversion event:** `Lead` (matches the `tr/` event the /audit form fires).
- **Budget per audience:** **$15/day × 7 days = $105 per audience**.
  Total **$45/day · $315 over 7 days**. Up from the original $210
  cold-validation budget to fund a third audience (author) and pay
  for the Reels/Stories placements now possible with VSL #1 + #2.
- **Bid strategy:** Lowest cost. Let Meta optimize.
- **Placements (per audience):**
  - **Feed** (Facebook + Instagram) — static image creatives (4 hooks)
  - **Reels** (Facebook + Instagram) — VSL #1 (60-sec vertical) as
    the universal video creative + 1 audience-specific text overlay
  - **Stories** (Facebook + Instagram) — VSL #2 (the BAM-FAM piece)
    repurposed as 15-sec Story trim
- **Schedule:** Continuous. Pause any single ad if CAC > $150 BEFORE
  50 leads (early-kill per Hormozi paid ads rule).

---

## AUDIENCE 1 — Product Manufacturer (default + biggest TAM)

**Pitch line:** equipment / parts / outdoor gear / food & bev makers
whose distributor owns the customer relationship. The audit shows
them which leaks let the distributor keep them captive.

**Targeting:**
- **Location:** United States (national — manufacturer ICP isn't geo-bound)
- **Age:** 35-65 (owner skew)
- **Detailed targeting:**
  - Job title: Owner, President, VP Operations, VP Marketing, GM
  - Industries: Manufacturing, Industrial machinery, Agricultural
    equipment, Sporting goods, Outdoor/hunting equipment, Auto parts,
    Food & Beverage manufacturer
  - Interests: Trade shows, B2B marketing, Channel partnerships,
    Distributor management, Sales operations
- **Audience size goal:** 200K-800K
- **Lookalike (optional):** 1% lookalike of `prospects` where
  `pricing_tier='fullsystem'` (ITC, Zenith, etc. — small seed but real)

**utm_audience value:** `mfg`

---

## AUDIENCE 2 — DTC Brand (the volume ICP)

**Pitch line:** Shopify / WooCommerce / standalone brands running ads
at 1-2% conversion, watching CPMs climb 30% YoY. The audit shows them
why the landing page is the leak, not the ads.

**Targeting:**
- **Location:** United States (national)
- **Age:** 28-55 (DTC operator skew younger)
- **Detailed targeting:**
  - Job title: Founder, Owner, Head of Growth, Head of E-commerce,
    Marketing Director
  - Industries: E-commerce, Consumer goods, Beauty/cosmetics,
    Apparel, Pet products, Food & Beverage (DTC), Home goods
  - Interests: Shopify, Klaviyo, Meta Ads, ROAS, Conversion rate
    optimization, DTC, Triple Whale
- **Audience size goal:** 500K-1.5M
- **Lookalike (optional):** 1% lookalike of paid prospects in
  `prospects` where category contains `ecommerce` (small seed
  today; grows with each Wave-1 conversion)

**utm_audience value:** `dtc`

---

## AUDIENCE 3 — Indie Author / Book Series (highest-LTV-per-dollar)

**Pitch line:** self-published fiction authors with 1+ books on
Amazon. The audit shows them why their book page is an Amazon dead-
end with no email capture, no series funnel, no way to retarget the
"read sample, didn't buy" segment.

**Targeting:**
- **Location:** United States (national)
- **Age:** 25-65
- **Detailed targeting:**
  - Job title: Author, Writer, Novelist, Self-Published Author
  - Interests: Amazon KDP, BookBub, IngramSpark, BookFunnel,
    Sanderson, Brandon Sanderson, Hugh Howey, NaNoWriMo, Indie
    publishing, Self-publishing
  - Behaviors: Engaged with Amazon Author Central, follow
    20BooksTo50K, follow Reedsy
- **Audience size goal:** 100K-500K (smallest of the three but
  highest signal — authors who buy ads understand funnel ROI)
- **Lookalike (optional):** custom audience built from the
  Bloodlines client's reader list once exported

**utm_audience value:** `author`

---

## UTM contract

Every ad's destination URL is `/audit` plus:

```
?utm_source=meta
 &utm_medium=cpc
 &utm_campaign=wave1-2026-05-17
 &utm_audience=mfg | dtc | author
 &utm_content=<hook-id>
```

Hook IDs (one per creative below): `mfg-pain`, `mfg-distributor`,
`mfg-vsl1`, `mfg-vsl2` (and the same 4 suffixes for `dtc-*` and
`author-*`). 12 ads total.

`/audit` reads `utm_audience` on mount and pre-selects the matching
toggle (see `FourReasonsAudience.tsx` → `readAudienceFromUrl`).

---

## THE 12 ADS

For each audience, **4 hooks**: 1 pain-led + 1 specific-leak + 2 VSL
placements (Reels + Stories). The VSL placements share the same
video file across all 3 audiences — only the headline + text overlay
changes per audience.

Every hook below ships with:
- Headline (40 chars max)
- Primary text (125 chars max)
- Description (30 chars max)
- CTA button: **Get Quote** (fallback: **Learn More**)
- Image prompt (for Feed) OR Video file (for Reels/Stories)
- Destination URL with utm tags

---

### Manufacturer — Hook 1: Pain-led (Feed, static image)

```
HEADLINE:  Your product page leaks orders
PRIMARY:   4 reasons your product isn't selling — free 60-sec audit. Score, money-leak estimate, top 5 fixes ranked. No signup.
DESC:      60 seconds. No signup.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=mfg&utm_content=mfg-pain
```

**Image prompt (1:1 + 9:16 variants):**
```
Top-down photorealistic shot of a manufacturer's product (industrial
part, equipment piece, or similar) sitting on a desk next to a
phone showing a Shopify orders dashboard with low numbers. Soft
warm natural light. No faces, no text overlay. Color palette warm
earth tones with muted accent of concern.
```

---

### Manufacturer — Hook 2: Distributor-owns-the-customer (Feed)

```
HEADLINE:  Your distributor owns your customer
PRIMARY:   They take the order, the email, the repeat purchase, the LTV. You're a vendor on someone else's audience. We show you how to flip it.
DESC:      Free audit. Top 5 fixes.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=mfg&utm_content=mfg-distributor
```

**Image prompt:**
```
Wide-angle photorealistic shot of a manufactured product on a
warehouse pallet, with a faded distributor logo on cardboard
packaging in the background. Slight motion blur on a forklift
moving past. Conveys "your product, their customer." Aspect ratio
1:1 + 9:16. No text overlay, no faces.
```

---

### Manufacturer — Hook 3: VSL #1 (Reels)

```
HEADLINE:  4 reasons most product brands lose orders
PRIMARY:   60-second walkthrough. The 5 leaks costing you money + the fix that pays for itself in week 1.
DESC:      Free audit at end.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=mfg&utm_content=mfg-vsl1
```

**Video file:** `/public/audit-assets/vsl-1.mp4` (19MB, 9:16, captions
baked in). Upload as Reels placement.

---

### Manufacturer — Hook 4: VSL #2 (Stories, 15-sec trim)

```
HEADLINE:  Two paths. The right one's obvious.
PRIMARY:   $997 site or the full AI system. 60-second pitch + free audit shows you which fits.
DESC:      No credit card.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=mfg&utm_content=mfg-vsl2
```

**Video file:** `/public/audit-assets/vsl-2.mp4` trimmed to 15-sec
(open + close beats only). Upload as Stories placement.

---

### DTC Brand — Hook 1: Conversion-rate pain (Feed)

```
HEADLINE:  Stuck at 1.5% conversion?
PRIMARY:   Your CPMs went up 30%. Your conversion didn't. The leak is the landing page, not the ads. Free 60-sec audit shows you the 3 fixes.
DESC:      60 seconds. No signup.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=dtc&utm_content=dtc-pain
```

**Image prompt:**
```
Hand holding a phone, screen showing a Shopify dashboard with:
"Conversion rate: 1.4%" in red, "Sessions: 12,400" + "Add to cart:
180" + "Checkout: 41" in muted gray. Soft blue light from the
screen, warm yellow ambient from a desk lamp. Aspect ratio 1:1 +
9:16. No text overlay, no faces. Mood: alarmed, money-leaking.
```

---

### DTC Brand — Hook 2: No-retargeting leak (Feed)

```
HEADLINE:  95% of your visitors are gone forever
PRIMARY:   No email capture. No SMS. Your cart-abandon emails barely fire. You're paying $25 CPMs to chase them back. Free audit shows what to fix.
DESC:      Free 60-sec audit.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=dtc&utm_content=dtc-retarget
```

**Image prompt:**
```
Side-angle photorealistic shot of an open laptop on a coffee shop
table showing a Shopify storefront. A blurred figure (no face) is
walking out of frame in the background, conveying "the customer who
just left." Warm cafe lighting. Aspect ratio 1:1 + 9:16. No text
overlay.
```

---

### DTC Brand — Hook 3: VSL #1 (Reels)

```
HEADLINE:  Why your product isn't selling online
PRIMARY:   60-second walkthrough of the 5 leaks every DTC brand has + the fix that pays for itself in week 1.
DESC:      Free audit at end.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=dtc&utm_content=dtc-vsl1
```

**Video file:** same `/public/audit-assets/vsl-1.mp4`. Upload as Reels.

---

### DTC Brand — Hook 4: VSL #2 (Stories)

```
HEADLINE:  Built for DTC brands
PRIMARY:   Two paths: $997 site or the full AI system. 60-sec pitch + free audit shows which fits your funnel.
DESC:      No credit card.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=dtc&utm_content=dtc-vsl2
```

**Video file:** `/public/audit-assets/vsl-2.mp4` 15-sec trim.

---

### Indie Author — Hook 1: Amazon-dead-end pain (Feed)

```
HEADLINE:  Your book page is an Amazon dead-end
PRIMARY:   No email capture, no series funnel, no way to tell readers when book 2 drops. Free 60-sec audit shows the fix.
DESC:      No signup needed.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=author&utm_content=author-pain
```

**Image prompt:**
```
Top-down photorealistic shot of a paperback book on a wooden desk
next to a phone showing an Amazon Author Central page with "Total
followers: 142" highlighted. Soft warm reading-lamp light. A coffee
cup and reading glasses at edges. Aspect ratio 1:1 + 9:16. No text
overlay, no faces.
```

---

### Indie Author — Hook 2: Reader-silence-between-launches (Feed)

```
HEADLINE:  6 months of silence kills launches
PRIMARY:   Readers forget you exist between books. Free 60-sec audit shows the 3 funnel fixes that keep your audience warm.
DESC:      Built for series authors.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=author&utm_content=author-silence
```

**Image prompt:**
```
Close-up photorealistic shot of an open journal/notebook with the
last entry dated 6+ months ago, slightly dusty, next to a closed
laptop. Soft natural window light. Conveys "the audience went quiet."
Aspect ratio 1:1 + 9:16. No faces.
```

---

### Indie Author — Hook 3: VSL #1 (Reels)

```
HEADLINE:  4 reasons readers stop following authors
PRIMARY:   60-second walkthrough. The 5 leaks costing series authors readers + the fix that compounds across every book.
DESC:      Free audit at end.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=author&utm_content=author-vsl1
```

**Video file:** same `/public/audit-assets/vsl-1.mp4`. Reels placement.

---

### Indie Author — Hook 4: VSL #2 (Stories)

```
HEADLINE:  Built for series authors
PRIMARY:   Two paths: $997 author site or the full reader-funnel system. 60-sec pitch + free audit shows which fits.
DESC:      No credit card.
URL:       https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=wave1-2026-05-17&utm_audience=author&utm_content=author-vsl2
```

**Video file:** `/public/audit-assets/vsl-2.mp4` 15-sec trim.

---

## DAY-BY-DAY EXECUTION (Days 1-7)

Day numbering relative to launch, not the original May 6 plan
(which slipped). Wave 1 launches whenever the pre-launch checklist
goes green.

| Day | Action | Decision threshold |
|---|---|---|
| **Launch − 1** | Set Meta env vars on Vercel. Generate all 24 images via HyperAgent (1:1 + 9:16 per Feed hook). Trim VSL #2 to 15s. Run pre-launch checklist 1-8. | ALL 8 green or DON'T launch |
| **Day 1** | Upload all 12 ads to Meta Ads Manager. 3 audiences, 4 hooks each. Submit for review. | Meta review typically 24-48hr; ads sit "In Review" |
| **Day 2** | Campaign goes live morning. Confirm Meta delivery at noon. Check `/dashboard/cold-traffic` for visits. | If any ad still "In Review" by 5pm → repeat-submit + ping Meta support |
| **Day 3** | First 24hr data. Open `/dashboard/cold-traffic`. Kill any ad with CAC > $200 at 30+ leads. | Hormozi early-kill: CAC > 4× target ($50) at 30+ leads = won't recover |
| **Day 4** | 48hr checkpoint. Compare audience CTRs side-by-side. Don't rebalance budget yet — Meta needs 3-5 days to settle. | Note the leading audience; don't act yet |
| **Day 5** | 72hr checkpoint. Meta optimizer stable. Identify top hook per audience. Pause bottom hooks ONLY if top hook has 50+ conversions. | Per Hormozi paid-ads rule: don't kill bottom 2 without strong signal |
| **Day 6** | Mid-week summary. SMS Ben the dashboard link + leading hook/audience/CAC. | If BOTH audiences > $150 CAC at 100+ leads → audit page / offer is wrong, not the ads |
| **Day 7** | Make the call: scale winner / iterate / kill. Document in `aios/decisions/YYYY-MM-DD_wave1-result.md`. Use the result to lock the Wave-2 selfie script focus. | See decision matrix below |

---

## After 7 days — decision matrix

| Outcome | Meaning | Action |
|---|---|---|
| **Top hook CAC ≤ $50, audit→claim ≥ 5%, claim→purchase ≥ 1%** | Cold motion validated at the tier matching the winning audience | Scale that hook to $50/day on its winning audience Days 8-14; record Wave 2 selfies tuned to it |
| **Top hook CAC $50-150, audit submissions strong, downstream conversion weak** | Hook works, funnel has friction | Iterate the /audit page for that audience (already supports per-audience copy via toggle); re-test |
| **All hooks CAC > $150** | Audience or offer wrong | Pause spend. Rethink — try narrowed lookalike or pivot the offer entirely |

---

## Where the data shows up

- `/dashboard/cold-traffic` — UTM-filtered prospect view, broken down
  by `utm_audience` × `utm_content` × funnel step
- `/dashboard/ai-activity` — surfaces any AI spend that fires off of
  these audit submissions (qualify, draft-touch, etc., once those
  skills land Days 2-3 of the bj ai layer)
- Meta Ads Manager — automatic `audit_lead` conversion attribution
  per ad set
- Google Analytics — `audit_lead` event with full UTM dimensions

---

## Maintenance

- Update this doc whenever the audience-toggle on /audit changes
  (the UTM contract must stay in sync with `FourReasonsAudience.tsx`).
- When a hook is declared a Wave-1 winner (100+ submits + Wilson-CI
  significance), promote its angle into the audit hero copy + Wave 2
  selfie script.
- Document the final outcome in
  `aios/decisions/YYYY-MM-DD_wave1-cold-traffic-result.md`.
