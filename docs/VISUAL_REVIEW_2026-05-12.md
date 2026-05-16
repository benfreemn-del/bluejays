# BlueJays backend — visual review · 2026-05-12

**Target:** does the /dashboard backend feel like a $10K product? Simple,
clean, intuitive, Hormozi-approved?

**Method:** snapshot + DOM inspection on 4 representative surfaces
(/dashboard root, /dashboard/numbers, /dashboard/clients,
/dashboard/sales-pipeline), plus codebase grep for `max-w-*` and
header-pattern variants across all 27 backend surfaces.

**Verdict:** the *individual* components are good. The *whole* feels
inconsistent — every sub-page is its own island. Five cross-cutting
issues drag the perceived quality down. Fix those five and the
backend instantly reads as polished.

---

## The 5 cross-cutting issues (in priority order)

### 1. The new nav doesn't follow you (HIGH — biggest perceived-quality loss)

The 7-category dropdown nav only renders on `/dashboard` root. Click
"Numbers" → you land at `/dashboard/numbers` and the nav is **gone**.
Click "Sales Pipeline" → same. Every sub-page has its own bespoke
header. Net effect: you feel lost every time you navigate.

**$10K products always have persistent global nav.** Vercel, Linear,
Stripe — the top-level nav never disappears.

**Fix:** mount `<DashboardTopNav />` in a shared
`src/app/dashboard/layout.tsx` so every `/dashboard/*` route inherits
it. Sub-pages keep their existing in-page titles/content; the nav just
sits above them.

**Risk:** low — it's purely additive. Sub-pages get one strip of
navigation above their existing content. Visual cost = a few extra
pixels per page. Visual benefit = continuity across 27 surfaces.

---

### 2. Max-width chaos (HIGH — visible jank)

| Surface | Main max-width |
|---|---|
| /dashboard nav | 1536px (max-w-screen-2xl) |
| /dashboard main | **1280px** (max-w-7xl) ← mismatch |
| /dashboard/numbers | ~976px |
| /dashboard/clients | **768px** (max-w-3xl) |
| /dashboard/sales-pipeline | 1280px |
| /dashboard/hyperloop | 1280px |
| /dashboard/all-tasks | 1280px |

21 instances of `max-w-7xl`, `max-w-6xl`, `max-w-3xl` scattered across
17 files. Pages snap to different widths, creating a content-shift
flash on every navigation.

**Hormozi rule:** simpler beats more — pick ONE max-width and use it
everywhere unless there's a real reason to deviate (long-form
documents → narrower; data tables → wider).

**Fix:** standardize on `max-w-screen-2xl` (1536px) for all dashboard
surfaces. Form-heavy pages (numbers, settings) can opt down to
`max-w-4xl` (896px) for readability — but explicitly, with a
component-level decision, not by accident.

---

### 3. H1 typography drift (MEDIUM)

| Surface | H1 |
|---|---|
| /dashboard | `text-lg sm:text-xl font-semibold` (20px @ 600) |
| /dashboard/numbers | `text-3xl font-bold` (30px @ 700) |
| /dashboard/clients | `text-xl font-semibold` (20px @ 600) |
| /dashboard/sales-pipeline | `text-xl font-bold` (20px @ 700) |

"Dashboard" (the brand anchor) shouldn't be the SMALLEST h1 in the
product. /dashboard/numbers gets the best treatment — 30px bold —
and that page isn't the homepage.

**Fix:** dashboard root H1 → `text-2xl sm:text-3xl font-bold`
(24-30px, bold). Make every sub-page H1 match the same scale so
"page title" reads consistently across surfaces.

---

### 4. Dashboard root overview is 5,291px tall (MEDIUM — info-density violation)

The overview tab stacks 12 panels vertically: InFlightBuildsCard,
AIActivityCard, AutomationDailyDigest, MadieProductivity,
BusinessSetupChecklist, PaymentLinksPanel, PendingRepliesPanel,
NeedsPreviewPanel, DashboardStats, StatusTransitionsToday,
CalculatorStatsCard, LossReasonsPanel, DeliverabilityWidget.

Ben opens /dashboard. Scrolls past 5+ screens. By panel #6, the
"important top of mind" framing is lost.

**Hormozi:** "the customer can only act on what they can see in 3
seconds." A dashboard homepage that takes 30 seconds to scroll is
not a dashboard — it's a stack of widgets.

**Fix (medium effort, big visual lift):** reorganize the overview
into a 2-column grid above the fold:

```
LEFT (60%)                  RIGHT (40%)
┌────────────────────────┐  ┌──────────────────┐
│ Currently building for │  │ Today's tasks    │
│ (top-priority surface) │  │ Money in/out     │
└────────────────────────┘  │ Cron heartbeat   │
                            │ This week wins   │
┌────────────────────────┐  └──────────────────┘
│ AI activity (24h)      │
└────────────────────────┘
```

Everything currently below those becomes a "scroll for detail" section.
Top-of-page = today's pulse. Bottom = historical / less actionable.

---

### 5. Emoji icons vs SVG icons mixed across panels (LOW — but cumulative)

Some panels use emoji headers (🔧 Currently building for, 📥 Leads,
🧠 AI System). Others use SVG icons (the InFlightBuildsCard uses
proper React icons inside the cards). The mix reads as "different
people built different parts."

**Hormozi:** premium products feel monolithic. A single visual
vocabulary. Either go all-emoji (cute, casual, BlueJays-y) or
all-SVG (clean, professional, Linear/Stripe-y) — don't split.

**Recommendation:** keep emoji on TOP-LEVEL nav (where the playful
brand tone belongs), use SVG icons in cards/widgets/CTA buttons
(where polish reads as quality). Lucide-react is already installed
in many places — standardize there.

---

## Per-category quick scan

For each new category, the surface I'd visit first and whether it's
"close to $10K feel" or "needs work."

| Category | Primary surface | $10K? | Quick note |
|---|---|---|---|
| Overview | /dashboard | ⚠️ Close | Fix items 1-4 above and it lands |
| Leads | /dashboard?tab=leads | ⚠️ Close | Action row (+Add Lead / Scout) is fine. Table density could tighten. |
| Sales | /dashboard/sales-pipeline | ✅ Good | Kanban-style is strong. Standardize header. |
| AI System | /dashboard/hyperloop | ❓ Unverified | Need to visually check. |
| Clients | /dashboard/clients | ⚠️ Narrow | max-w-3xl is too narrow for a client list. Bump to max-w-screen-2xl. |
| Marketing | /dashboard/content | ❓ Unverified | Need to visually check. |
| Admin | /dashboard/numbers | ✅ Good | Best H1 in the product. Use as the typography reference for the rest. |

Surfaces marked ❓ should get a 5-min visual pass next session.

---

## Hormozi-fit scoring (current state vs target)

Scoring each principle 0-10 based on how the backend currently expresses it:

| Principle | Score | Why |
|---|---|---|
| **Value clear in 3 seconds** | 6/10 | Overview shows "currently building for" up top — good. But 5,291px of vertical sprawl below dilutes it. |
| **Simpler beats more** | 5/10 | 27 surfaces + 3 different design patterns = cognitive load. Standardize the chrome. |
| **Concrete numbers > vague status** | 8/10 | InFlightBuilds, MadieProductivity, DashboardStats all show real numbers. Strong. |
| **Reduce friction** | 6/10 | New nav helps a lot. Sub-pages dropping the nav reintroduces friction. |
| **Single source of truth** | 7/10 | client_tasks centralization is good. But 21 places ad-hoc declare their own max-width = drift risk. |
| **Show the work, not the process** | 7/10 | InFlightBuildsCard + AIActivityCard at the top of overview is exactly right. Pure proof-of-work. |
| **Premium products feel monolithic** | 5/10 | Emoji + SVG mix, per-page custom headers, inconsistent widths — feels stitched together. |
| **OVERALL** | **6.3/10** | Solid bones, inconsistent finish. The fixes are mechanical (width, layout, typography) — not structural. |

Target after the 3 fixes below = **8/10**. Target after working through
the per-page punch list = **9.5/10**.

---

## Top 3 fixes applied this session

These are the highest-impact, lowest-risk changes — applied inline
in this commit:

1. **Shared dashboard layout with persistent nav** — new file
   `src/app/dashboard/layout.tsx` mounts the title bar + new nav on
   every /dashboard/* route. Sub-page headers shrink to in-page
   titles only.
2. **Width consistency on /dashboard root** — main element switches
   from `max-w-7xl` (1280px) to `max-w-screen-2xl` (1536px) so it
   matches the nav width. No more nav-overshoots-content jank.
3. **H1 strengthened** — dashboard root H1 from
   `text-lg sm:text-xl font-semibold` to `text-2xl sm:text-3xl
   font-bold` so "Dashboard" reads as the brand anchor it should be.

---

## Punch list for next session

In priority order. None of these are blockers for shipping, but
working through them takes the backend from 8/10 to 9.5/10.

### Width standardization
- [ ] /dashboard/clients — bump `max-w-3xl` to `max-w-screen-2xl`
- [ ] /dashboard/numbers — bump centered content to `max-w-4xl`
      (form-heavy, narrower is fine — but explicitly)
- [ ] /dashboard/all-tasks, /dashboard/customers, /dashboard/partners
      — audit, align to `max-w-screen-2xl`
- [ ] Audit remaining 14 files in the grep result, fix the outliers

### Header standardization
- [ ] Remove duplicate sub-page headers now that the shared layout
      mounts the global nav (numbers, sales-pipeline, clients,
      hyperloop, all the rest)
- [ ] Standardize sub-page "page title" treatment:
      `text-2xl sm:text-3xl font-bold mb-2` + optional lede paragraph
      `text-sm text-muted max-w-2xl`

### Overview tab restructure
- [ ] Move "Currently building for" + "AI activity (24h)" to a 2-col
      grid (60/40 split) above the fold
- [ ] Demote BusinessSetupChecklist, PaymentLinksPanel,
      PendingRepliesPanel into a "Today" sidebar
- [ ] Move historical panels (LossReasonsPanel, DeliverabilityWidget,
      StatusTransitionsToday) below a "Detail" fold

### Visual vocabulary
- [ ] Pick: emoji-everywhere OR lucide-everywhere for non-nav UI
- [ ] If lucide: audit InFlightBuildsCard, AIActivityCard,
      AutomationDailyDigest, MadieProductivity for icon consistency
- [ ] Standardize card padding (currently varies: 16px, 20px, 24px)

### Per-category visual checks I didn't get to
- [ ] /dashboard/ai-bots
- [ ] /dashboard/hyperloop
- [ ] /dashboard/diagnostic
- [ ] /dashboard/content
- [ ] /dashboard/blog
- [ ] /dashboard/cold-traffic
- [ ] /dashboard/social-leads
- [ ] /dashboard/backend-audit
- [ ] /dashboard/team
- [ ] /dashboard/agency
- [ ] /dashboard/case-studies
- [ ] /dashboard/onboarding
- [ ] /dashboard/customers
- [ ] /dashboard/partners
- [ ] /dashboard/win-loss
- [ ] /dashboard/script

Each takes ~3 min to visually check + note issues. ~50 min total
for the deep-dive pass.

---

## What's already $10K-worthy (don't touch)

Things to preserve through any refactor:

- **DashboardTopNav** (just shipped this session) — 7 categories,
  dropdown UX, hint text under each item. Lands.
- **InFlightBuildsCard** — shows "X shipped, last shipped Y days ago,
  up next: Z" per active client. Pure proof-of-work density.
- **MadieProductivity tile** — sales-rep velocity at a glance.
- **/dashboard/numbers** typography — 30px bold h1, helpful lede
  paragraph. Use as the typography reference for every other page.
- **Sales pipeline kanban** at /dashboard/sales-pipeline — visual
  flow is strong, two-track (Website / $10K System) is clear.
- **The dark theme tokens in globals.css** — clean, consistent
  palette. No reason to change.

---

*Generated 2026-05-12 by Claude. Re-run this audit after the
per-page punch list is worked through to confirm the 8/10 → 9.5/10
delta.*
