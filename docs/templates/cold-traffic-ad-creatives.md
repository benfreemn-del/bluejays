# Cold-Traffic Validation Ads — May 2026

3 ad creatives for the $200 Meta cold-traffic validation experiment
locked 2026-05-08. Ben uploads these to Meta Ads Manager. Each variant
points at `/audit` with the matching UTM so the dashboard can split
performance by hook.

**Campaign settings:**
- Objective: **Conversions** (NOT Traffic)
- Conversion event: `audit_lead`
- Budget: **$30/day × 7 days = $210**
- Audience: **Manufacturer-niche local business owners** (3-anchor ICP)
  - Lookalike audience seeded from BlueJays customer email list (1k+ contacts)
  - Interest layer: "tractor implements" / "manufacturing equipment" /
    "small business owner" / "B2B equipment"
- Placement: **Meta Feed only** (skip Reels/Stories for v1)
- Optimization: **Lowest cost** (let Meta find the converters)

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

**Destination URL:**
```
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_content=hook-a-control
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

**Destination URL:**
```
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_content=hook-b-diagnostic
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

**Destination URL:**
```
https://bluejayportfolio.com/audit?utm_source=meta&utm_medium=cpc&utm_campaign=cold-validation-2026-05&utm_content=hook-c-5clog
```

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
