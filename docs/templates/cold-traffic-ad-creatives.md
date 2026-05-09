# Cold-Traffic Validation Ads — May 2026

3 ad creatives × 2 audiences for the $210 Meta cold-traffic validation
experiment per `aios/north_star.md` Gate 1. Ben uploads these to Meta
Ads Manager Days 12-19 (deadline 2026-05-16). Each variant points at
`/audit` with the matching UTM so `/dashboard/cold-traffic` can split
performance by hook AND audience.

**Two audiences per north_star.md Q9 + Gate 1:**
- **Local-service** (the $997 motion — primary cold-traffic test target)
- **Manufacturer** (the $10k AI System motion — parallel validation)

**Per the "No client names in paid ads" rule (locked 2026-05-06):**
Cold-traffic ad creative + above-the-fold landing-page trust strips
use AGGREGATE framing only. No client names anywhere in this kit.

---

## ⚠ PRE-LAUNCH CHECKLIST — verify all 7 before publishing

| # | Item | How to verify |
|---|------|---------------|
| 1 | `NEXT_PUBLIC_META_PIXEL_ID` set on Vercel | Vercel → Settings → Env Vars. Format: `1234567890123456` (16 digits, no `meta.` prefix). After setting, redeploy. |
| 2 | Pixel actually fires on /audit | Open https://bluejayportfolio.com/audit in Chrome → DevTools Network tab → filter `facebook.com` → reload. You should see a `tr/` request with `ev=PageView`. |
| 3 | `Lead` event fires on form submit | Submit a test audit (use your own email). Network tab should show another `tr/` with `ev=Lead`. |
| 4 | Meta Events Manager shows the events | Meta Business Suite → Events Manager → Your Pixel → Test Events tab. Submit again from /audit; events should appear within 5 sec. |
| 5 | Conversion campaign optimizes for `Lead` | When creating the campaign, conversion event = "Lead" (NOT PageView, NOT View Content). |
| 6 | UTM URLs route correctly | Open each ad's destination URL in incognito. Check `/dashboard/cold-traffic` after 30 sec — your visit should show under the matching variant. |
| 7 | Dashboard cookie persistence | After clicking ad URL, navigate to /audit, close browser, return to /audit. The variant should still match (cookie sticky for 30 days). |

---

## Campaign settings (apply to BOTH audiences)

- **Objective:** Conversions (NOT Traffic — Traffic is a $300 lesson)
- **Conversion event:** `Lead`
- **Total budget:** $210 over 7 days
  - Local-service audience: **$15/day × 7 = $105** (primary test)
  - Manufacturer audience:  **$15/day × 7 = $105** (parallel validation)
- **Bid strategy:** Lowest cost · let Meta auto-optimize
- **Placement:** Meta Feed ONLY for v1 (Facebook + Instagram feeds; skip
  Reels/Stories — vertical video creatives aren't built yet)
- **Schedule:** Run continuously; pause if any individual ad's CAC
  crosses $150 BEFORE 50 leads (early-kill rule per Hormozi paid ads
  iteration skill)

---

## AUDIENCE 1 — Local-service (primary $997 cold-traffic test)

**Why this is primary:** locked $997 cold-paid-traffic motion per Q9.
We're testing whether $997 closes from cold ad clicks at all.

**Targeting (paste into Meta Ads Manager → Audience):**
- **Location:** United States (state-level: WA, OR, ID, MT to start —
  matches Ben's home market + delivery range)
- **Age:** 30-65 (small-business-owner skew older)
- **Gender:** All
- **Detailed targeting (broad):**
  - Behaviors → Small business owners
  - Demographics → Job title: Owner, Founder, President, General Manager
  - Interests: Marketing, Local SEO, Google Ads, Yelp, Better Business Bureau
- **Detailed targeting (narrow within above):**
  - Industry interests: Plumbing services, Electrical services,
    Landscaping, Roofing, HVAC, Auto repair, General contractors,
    Cleaning services, Painting services, Pest control
- **Audience size:** Aim for 500K-2M (Meta's "specific" sweet spot).
  Too narrow = high CPM; too broad = low intent.
- **Lookalike layer (optional):** 1% lookalike of existing BlueJays
  customers (export from Supabase: `prospects` where `status='paid'`
  → CSV → upload as Custom Audience → seed lookalike).

**Why no Reels/Stories:** static creative is what's built. Reels need
vertical 9:16 video — out of scope for v1.

---

## AUDIENCE 2 — Manufacturer (parallel $10k validation)

**Why parallel:** locked manufacturer-niche motion per Q9. We're not
expecting cold-paid-traffic to close $9,700 directly — but the audit
+ post-audit video DO surface the AI System tier, so we measure
discovery-call books from this audience as a leading indicator.

**Targeting:**
- **Location:** United States (national — manufacturer ICP isn't
  geo-bound)
- **Age:** 35-65
- **Detailed targeting (broad):**
  - Job title: Owner, President, VP Operations, VP Marketing,
    Marketing Director, Operations Manager
  - Industries: Manufacturing, Industrial machinery, Equipment rental,
    Agricultural equipment, Sporting goods manufacturer, Hunting goods,
    Outdoor equipment, Food & Beverage manufacturer, Auto parts
- **Detailed targeting (narrow):**
  - Interests: Trade shows, B2B marketing, Channel partnerships,
    Distributor management, Sales operations
- **Audience size:** 200K-800K (smaller pool by design — manufacturer
  ICP is narrow, but high-LTV)
- **Lookalike layer:** 1% lookalike of `prospects` where
  `pricing_tier='fullsystem'` (currently small but seedable).

---

## Tracking (UTM contract)

Each ad's destination URL includes `utm_audience` AND `utm_content`
so the dashboard can split by both axes:

```
?utm_source=meta
 &utm_medium=cpc
 &utm_campaign=cold-validation-2026-05
 &utm_audience=local-service|manufacturer
 &utm_content=hook-a-control|hook-b-diagnostic|hook-c-5clog
```

Six total ads:
- `local-service` × 3 hooks
- `manufacturer` × 3 hooks

The audit page reads `bj_audit_variant` cookie set by middleware.
UTM tag overrides the cookie for first-touch attribution.

**Tracking:**
Each ad's destination URL includes the variant in `utm_content` so
post-click conversion data ties back to the hook that earned the click.
The audit page reads `bj_audit_variant` cookie set by middleware (per
the variant-routing infra) — even if a visitor's cookie was set BEFORE
they clicked the ad, the UTM tag overrides for first-touch attribution.

---

## Creative A — "Why isn't your site booking jobs?" (control)

**Why this is the control:** it's the existing `/audit` page hero copy.
Tests "current state baseline." If Hooks B or C beat it, you have signal
to update the live page hero.

**Image brief:** Top-down phone shot of a small-business owner staring
at their analytics dashboard, looking concerned. Soft natural light.
Real-feel photography (not stock).

**Headline (40 chars max):**
```
Why isn't your site booking jobs?
```

**Primary text (125 chars):**
```
Free 60-second audit. We score your site 0–100 and show you the 3 fixes worth real money. No credit card.
```

**Description (30 chars max):**
```
3 fixes worth real money
```

**CTA button:** Get Quote *(or "Learn More" if Get Quote unavailable)*

**Destination URLs (one per audience):**
```
LOCAL-SERVICE:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=local-service&utm_content=hook-a-control

MANUFACTURER:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=manufacturer&utm_content=hook-a-control
```

**Image-generation prompt (Midjourney / DALL-E / Sora):**
```
Top-down phone-camera shot, small business owner's hands on a desk, 
holding a phone showing a Google Analytics dashboard with low traffic. 
Soft natural window light from upper-left. A coffee cup, notebook, 
and pen visible at edges. Photorealistic, candid, no faces visible. 
Aspect ratio 1:1 for Meta Feed. Color palette warm earth tones with 
muted accent of concern. No text overlay — text added in Ads Manager.
```

---

## Creative B — Hormozi 500-clients diagnostic

**Why this:** the locked diagnostic question from the 5-Clog Framework
(`aios/decisions/2026-05-07_5-clog-framework.md`). Forces a prospect
to walk their entire operation step-by-step. High pattern-interrupt on
a Meta feed scroll because it's not a standard ad opening.

**Image brief:** Split-screen photo. Left: empty parking lot at a
service-business storefront. Right: same lot at peak hours, full of
customers + workers. Caption underline: "What would break first?"

**Headline (40 chars max):**
```
500 new clients tomorrow — break what?
```

**Primary text (125 chars):**
```
The honest answer is the bottleneck costing you money right now. 60-sec audit shows you which fix to ship first.
```

**Description (30 chars max):**
```
The 5 most common money-leaks
```

**CTA button:** Get Quote

**Destination URLs (one per audience):**
```
LOCAL-SERVICE:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=local-service&utm_content=hook-b-diagnostic

MANUFACTURER:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=manufacturer&utm_content=hook-b-diagnostic
```

**Image-generation prompt (Midjourney / DALL-E / Sora):**
```
Split-screen photo composite. LEFT: empty service-business parking 
lot at dawn, single truck with company decals removed, gray morning 
light. RIGHT: same parking lot at peak hours, full of customers and 
workers in motion, bright daylight, sense of bustle. Center vertical 
divider in faint white. Photorealistic, no faces visible, no text 
overlay. Aspect ratio 1:1. Color contrast between dim/empty and 
bright/full conveys "before vs. after demand spike."
```

---

## Creative C — 5-clog reframe

**Why this:** the 5-clog framework reframed as a Google-Ads-buyer's
specific pain. Targets owners who are ALREADY spending on ads but feel
they're not converting. Higher-intent audience.

**Image brief:** Phone screen showing a Google Ads dashboard with a
high spend number ($4,200) and a low conversion number (3 leads). Red
arrow pointing at the 3. Hand holding the phone, partial face visible.

**Headline (40 chars max):**
```
5 reasons your Google Ads aren't converting
```

**Primary text (125 chars):**
```
Speed-to-lead. Missed calls. No follow-up. We score the 5 leaks every local business has — free, in 60 sec.
```

**Description (30 chars max):**
```
Free 60-sec audit
```

**CTA button:** Get Quote

**Destination URLs (one per audience):**
```
LOCAL-SERVICE:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=local-service&utm_content=hook-c-5clog

MANUFACTURER:
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_audience=manufacturer&utm_content=hook-c-5clog
```

**Image-generation prompt (Midjourney / DALL-E / Sora):**
```
Photorealistic close-up of a hand holding a phone in landscape 
orientation, screen showing a Google Ads dashboard. Visible numbers: 
"Spent: $4,200" in white, "Conversions: 3" in red with downward 
arrow. Background: blurred office desk with keyboard partially in 
frame. Lighting: cool blue from screen, warm yellow ambient from 
desk lamp upper-right. Aspect ratio 1:1, no text overlay, no faces. 
Mood: alarmed, money-leaking, urgency without being aggressive.
```

---

## DAY-BY-DAY EXECUTION PLAYBOOK (Days 12-19)

| Day | Date | Action | Decision threshold |
|-----|------|--------|-------------------|
| **12 (Sun)** | 2026-05-10 | Set `NEXT_PUBLIC_META_PIXEL_ID` on Vercel · run pre-launch checklist (7 items above) · upload all 6 ad creatives to Meta Ads Manager (3 hooks × 2 audiences) · enable campaign | All 7 checklist items green or DON'T launch |
| **13 (Mon)** | 2026-05-11 | Campaign goes live morning. Check spend rate at noon — confirm Meta is delivering, not stuck "Pending Review" | If any ad still "In Review" by 5pm → repeat-submit + ping Meta support |
| **14 (Tue)** | 2026-05-12 | First 24hr data. Open `/dashboard/cold-traffic`. Look for: any hook with CAC > $200 after 30 leads → KILL that ad early | Hormozi early-kill rule: if CAC > 4× target ($50) at 30+ leads, the ad isn't going to recover |
| **15 (Wed)** | 2026-05-13 | 48hr checkpoint. Compare audience performance side-by-side. If one audience has 3× the other's CTR → consider rebalancing budget tomorrow | Don't rebalance YET — Meta optimization takes 3-5 days to settle |
| **16 (Thu)** | 2026-05-14 | 72hr checkpoint — Meta optimizer is now stable. Identify top hook per audience. Pause bottom hooks ONLY if their CAC is > 3× the top hook's | Per Hormozi: don't kill the bottom 2 unless top hook has 50+ conversions to confirm signal |
| **17 (Fri)** | 2026-05-15 | Mid-week summary. SMS Ben the dashboard link. Decide: continue current allocation, rebalance toward winner, or kill underperforming audience | If BOTH audiences are CAC > $150 at 100+ leads → audit page or offer wrong, NOT the ads |
| **18 (Sat)** | 2026-05-16 | Day 6 — last day before final-call decision. Note the leading hook + audience + CAC | — |
| **19 (Sun)** | 2026-05-17 | Make the call: scale winner / iterate / kill. Document outcome in `aios/decisions/2026-05-17_cold-traffic-test-result.md` | See decision matrix below |

---

## After 7 days — decision rule

| Outcome | Meaning | Action |
|---|---|---|
| **Top hook CAC ≤ $50, audit→claim ≥ 5%, claim→purchase ≥ 1%** | Cold motion validated at $997 tier | Scale spend on the top hook to $100/day Days 20-30 |
| **Top hook CAC $50-150, downstream conversion weak** | Hook works, funnel has friction | Iterate the audit page (use the variant-routing infra), re-test |
| **All hooks CAC > $150** | Audience or offer wrong | Pause spend. Rethink — try Tekky-niche audience or a non-Meta channel |

---

## Where the variant data shows up

After Vercel deploys the variant-routing build:

- `/dashboard/cold-traffic` — UTM-filtered prospect view, broken down by
  hook + funnel step + per-variant conversion rate
- Meta Ads Manager — automatic `audit_lead` conversion attribution per
  ad set
- Google Analytics — `audit_lead` event with `utm_content` dimension for
  cross-platform attribution

---

## Maintenance

- When a variant is declared a winner (after 100+ submits per variant +
  Wilson-CI significance), promote the winning copy to the live `/audit`
  hero and retire the variant routing.
- Document the test outcome in `aios/decisions/YYYY-MM-DD_audit-page-variant-test.md`
  so the WHY of the change is preserved.
