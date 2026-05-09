---
name: paid-ads-iteration
description: Hormozi 11-rule paid-ads iteration framework. Use when reviewing creatives, building recommendations, or evaluating budget changes for any tenant's ad account.
---

# Paid Ads Iteration Skill

The canonical Hormozi-aligned playbook for iterating paid ad creatives
across tenants. **The TS rule engine + helpers live at
`src/lib/paid-ads-rules.ts`** — that's the source of truth for code.
This file is the operator-facing explanation of what those rules do
and when each fires.

## When to use this skill

- An owner just clicked Pause / Budget / Copy / Image / Delete on a
  creative in their AdsTab — verdict whether the request is allowed.
- The weekly iteration cron is running across a tenant's
  `client_ad_creatives` rows — pick the recommendation per creative.
- Owner asks "what should I change this week?" — render the iteration
  nudges grouped by Hormozi rule.
- Building a new creative library — validate the 70/20/10 allocation
  before committing seeds.

Don't use this skill for organic content / emails / SMS — those have
their own iteration rules (Hyperloop A/B engine for emails).

## The 11 rules (canonical)

These ARE the rules the TS engine encodes. If you change wording here,
mirror in `paid-ads-rules.ts` so dashboard + engine stay in sync.

### Time + signal floor

1. **Don't kill creatives under 7 days old.**
   First 7 days = data-collection window. Algorithm needs ~50
   conversions to optimize delivery. Killing early = throwing away
   the learning. Hard floor — no exceptions.

### Iteration discipline

2. **Winners get 100 reskins before net-new.**
   When a creative wins (ROAS 5+, age 7+ days), squeeze it. B&W,
   sepia, hook swap, headline swap, music swap, scene cuts. Most
   creatives have 50-100 reskin permutations before they're truly
   tapped. Net-new is for when the well is dry.

3. **70/20/10 budget split.**
   70% on proven winners (compound ROI), 20% on active iteration
   (mid-conviction permutations), 10% on net-new wild swings. Drift
   over ±10pt = the system rebalances on the next iteration cron.

4. **80% reskins / 20% net-new in iteration bucket.**
   Within the 20% iteration budget, 80% of new creatives should be
   reskins of existing winners. Only 20% are genuine angle changes.
   Operators flip this ratio and waste creative-hours.

### Creative craft

5. **Mine the top 3 seconds for hooks.**
   70% of attention drop happens in the first 3 seconds. Watch
   top-performing reels — extract the literal opening shot + audio,
   port it to underperformers. Hook transplants are higher-leverage
   than rewriting the rest.

6. **Proof > promise.**
   Customer screenshots > tagline copy. Lab numbers > "proven
   results". Before/after photos > "transformative". Proof-led
   creatives outperform promise-led 3:1 in our cohort. When
   iteration looks "okay" — swap promise language for receipts.

### Operations gates

7. **Capacity check before any scale recommendation.**
   Scaling spend without fulfillment capacity = burn customer
   experience + reputation. Before 2× spend, confirm the operations
   side can handle the volume (booking slots, lab turnaround,
   shipping, etc.). Owner gates this; system flags + waits.

8. **Retargeting is the highest-ROAS lever.**
   Almost always positive ROI. Pixel + email-list custom audience +
   view-content + add-to-cart abandon. If the account isn't running
   retargeting, that's the FIRST suggestion the engine emits — almost
   always more impactful than any creative tweak.

### Budget hard caps

9. **Net-new bucket hard-capped at 10%.**
   Operators love testing — they over-allocate. Hard rule: never
   more than 10% of platform spend on creatives <14 days old AND <2×
   ROAS. Server enforces this; system rejects budget changes that
   would breach the cap.

### Decision thresholds

10. **Scale only at ROAS 7+.**
    ROAS 2-5× = iterate, don't scale. ROAS 5-7× = graduate to
    winners bucket. ROAS 7+ AND capacity-checked = scale (recommend
    +50% daily budget per pass). Scaling below 7× = risk a
    regression to mean.

11. **Kill at ROAS <1× AND age 21+ AND spend $200+.**
    All three thresholds must be true. ROAS <1 means losing money on
    the creative. Age 21+ means it had real time. Spend $200+ means
    we have signal-volume. ANY one of those missing = NOT a kill
    candidate yet — keep iterating.

## Rule → recommendation mapping

The engine in `runIterationEngine()` (paid-ads-rules.ts) emits ONE of
five actions per creative:

| Action | When | Rule | Confidence |
|---|---|---|---|
| `kill` | Rule 11 thresholds all met | 11 | 0.9 |
| `scale` | ROAS 7+, age 7+, spend $100+ | 10 | 0.85 |
| `reskin` | ROAS 5+, age 14+ (winners that have been static) | 2 | 0.75 |
| `iterate` | ROAS 2-5×, age 7+ | 2, 4 | 0.6 |
| `retarget` | No retargeting creatives in account | 8 | 0.95 |

Account-level: `checkRetargetingGap()` fires once per account, not
per creative.

## Bucket assignment (derived)

`assignBucket()` in paid-ads-rules.ts maps a creative's metrics to
its 70/20/10 bucket:

- **winners** — ROAS ≥5× AND age ≥7 days
- **iteration** — ROAS ≥2× AND age ≥7 days (and not a winner)
- **net-new** — age <14 days
- fallback **iteration** — older + sub-2× ROAS, re-test or eventual kill

A 1-day-old creative with one fluky high ROAS does NOT graduate to
winners. Rule 1 + Rule 10 in tandem.

## Server-side guardrails

The owner-portal request-change route enforces TWO hard locks:

- **Delete locked** when `ageDays < 7` (Rule 1)
- **Scale locked** when `roas < 2` and the request body's details/
  message contains "scale|increase|raise|grow|up" (Rule 10)

UI hides the buttons; server rejects the requests with 422 +
rule-citing error message. Bypass-via-curl impossible.

## What this skill is NOT

- **Not** a replacement for human judgment on brand voice, creative
  taste, or strategic angle changes. Engine emits signals; owner
  decides.
- **Not** an autopilot. Every recommendation lands as a task in
  `client_tasks` (or signal in `agent_signals`) for owner review +
  Ben push. Real money moves only with explicit owner approval.
- **Not** a budget-allocation calculator beyond 70/20/10 — doesn't
  optimize platform-mix (Meta vs Google vs Lob). That's a separate
  cross-platform skill (currently in design).

## Files

- `src/lib/paid-ads-rules.ts` — TS engine + canonical rule definitions
- `src/components/portal/AdsTabV2.tsx` — owner-facing dashboard
- `src/app/api/clients/[slug]/ads/request-change/route.ts` —
  server-side guardrail enforcement
- `src/app/api/ai/iteration-engine/run/route.ts` — autonomous engine
  (recommendations → agent_signals)
