---
description: Scan the BlueJays codebase + recurring_costs ledger for cost-leak patterns (chatty crons, image-optimizer drift, unbounded fan-out, dead recurring subs). Reports findings, lets Ben pick which to fix.
---

# /optimize-costs

A scheduled cost-audit pass across the live codebase + the
`recurring_costs` table. Catches the patterns that quietly inflate
the Vercel / Supabase / SendGrid / Twilio bills between manual
reviews.

Run this any time Ben says "my Vercel bill is creeping up", "audit
my SaaS spend", or "what's bleeding money."

## What to check (in this order — cheapest signal first)

### 1. Cron schedule audit (`vercel.json`)

For every entry in `vercel.json` `crons[]`:

- **Flag any `* * * * *` (every-minute) cron.** Each costs 43,200
  invocations/mo. Read the route handler — if it short-circuits when
  there's no work, it's still a hot waste of cold-start CPU. Suggest
  `*/5` or `*/10` instead.
- **Flag any `*/N` cron where N < 10** unless the route's purpose
  (latency-sensitive UX like polling an external API the user is
  actively waiting on) justifies it.
- **Sum the total monthly invocations.** Vercel Pro includes 1M
  function invocations; flag if the sum is > 200K (early warning) or
  > 500K (urgent).

### 2. Image optimizer drift (`next.config.ts` + `next/image` usage)

- **Check `images.unoptimized`.** If false (or absent — defaults to
  false), the optimizer is on. Then grep for `from "next/image"` —
  every consumer is potentially being billed per source-image
  transform.
- **Identify which `<Image>` instances actually need optimization.**
  Pre-sized `/public` assets and external CDN images (Shopify,
  Cloudinary, client-owned hosts) don't benefit from Vercel's
  transformer — they just pay the bill.
- **Recommend `unoptimized: true`** unless the codebase has Image
  consumers pulling from un-pre-sized user-uploaded sources.

### 3. Recurring-costs ledger sync (`recurring_costs` table)

- **Query `recurring_costs` where `active = true`** and total the
  monthly burn.
- **Cross-reference with the codebase** — for every active row, grep
  for usage. If a service has an active row but zero references in
  `src/`, ask Ben if the subscription should be cancelled.
- **Flag inverse drift** — services that ARE referenced in code (env
  vars, lib files) but DO NOT have a row in `recurring_costs`. Those
  are untracked monthly burns. Common suspects: HeyGen, Klaviyo,
  Cloudflare, Cursor, business cell, Stripe (fee-based), AWS
  one-offs.
- **Flag stale Vercel/Supabase/SendGrid amounts.** If `vercel_pro` is
  logged at $20 but Ben's last invoice was $220, the ledger lies to
  the spending dashboard. Ask Ben for actuals.

### 4. Fan-out / unbounded query patterns

- **Grep for `.select("*")` without `.limit()`** on tables that grow
  unboundedly (`client_leads`, `system_costs`, `client_email_log`,
  `client_purchases`, `prospects`). Each unbounded read on a hot
  endpoint compounds Supabase egress + Vercel function memory.
- **Grep for cron handlers that loop over all clients** without a
  per-client `if (last_run < now - 24h) continue` guard. Watchdog,
  digest, billing crons are common offenders.
- **Grep for `Promise.all(rows.map(fetch...))`** that fan out to
  external APIs (SendGrid, Twilio, Anthropic) without a concurrency
  cap. Each is a money explosion if the row count grows.

### 5. AI call patterns (Anthropic + OpenAI)

- **Grep for `anthropic.messages.create` and OpenAI equivalents.**
  Flag any:
  - Unbounded `max_tokens` (default 4096+)
  - Calls without `cache_control` on stable system prompts
  - Calls inside a loop (per-row generation when batching would work)
  - Calls on non-cron routes that run per page-view (audit pages,
    landing pages) without rate-limiting

### 6. SendGrid / Twilio fan-out

- **Check `cost-logger` rows for the last 30 days** grouped by
  service. If SendGrid spend > $20/mo above the plan flat fee, find
  the route driving it.
- **Audit recipient-list builders.** Any `.from("client_leads").select("email")`
  without a status filter is a list that grows forever.

### 7. Domain renewal sanity

- **Read `domain-registrar.ts`** + the live `recurring_costs.namecheap`
  amount. Each new client domain adds ~$10–15/yr ($1/mo amortized).
  If Ben has 20+ domains tracked but `namecheap` is still logged at
  $3/mo, ledger is stale.

## Output format

After the scan, print a single report grouped by severity:

```
🔴 URGENT (likely > $20/mo each)
  · [item] — [savings estimate] — [one-line fix]

🟡 WORTH FIXING (likely $5–20/mo each)
  · ...

🟢 LEDGER HYGIENE (no $$ but the dashboard lies)
  · ...

📋 NEEDS BEN'S INPUT
  · "Did you cancel Lob? Active row says yes, no usage in 60 days."
  · "Vercel Pro is logged at $20 — what was your last actual invoice?"
```

## Don't

- **Don't make changes silently.** Print the report, let Ben pick
  which to apply, then run the fixes in a second pass.
- **Don't kill crons that are user-latency-sensitive** (heygen-poll
  while a user is waiting on a video, replies/process during an
  active outreach campaign). Flag them as "consider" not "fix."
- **Don't update the `recurring_costs` ledger without confirmation.**
  Ledger is source-of-truth for the spending dashboard. Wrong numbers
  there mislead Ben's road-to-$5M.
- **Don't assume Vercel/Supabase pricing tiers.** Ben's invoice is
  authoritative — quote estimated savings, but flag they're estimates.

## When this is useful

- Monthly: as part of a "first-of-month spend review" rhythm
- Whenever a cloud bill comes in higher than expected
- After shipping a new feature that touches crons, image hosting, or
  AI generation
- After onboarding a new client (they often add new domains, new
  recurring rows, new cron-driven flows)
- Quarterly: alongside `/audit-business` for the full ops sweep
