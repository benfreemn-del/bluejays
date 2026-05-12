# Theoretical Backend Audit — 2026-05-12

Snapshot of how BlueJays' five operating systems interact today, what's
load-bearing, what's scaffolded, and what's missing. Source for the
companion live status page at `/dashboard/backend-audit`.

## The five systems

| System | What it does | Where it lives |
|---|---|---|
| **Claude + Hyperloop** | AI variant feedback loop. Tests ad creatives, picks winners by Wilson CI, kills losers, rebalances spend. | `src/lib/client-hyperloop*.ts` · `/api/client-hyperloop/run` |
| **Hormozi diagnostic** | Live sales-call business diagnoser. KB-backed by framework + YT chunks. | `src/lib/hormozi-agent.ts` · `/dashboard/diagnostic` |
| **Ad accounts** | OAuth refresh tokens for Meta + Google + Lob. Daily ROAS sync. | `client_ad_accounts` · `/api/cron/ad-roas-sync` |
| **Cost / spending** | Per-action + recurring P&L bucket. | `src/lib/cost-logger.ts` · `/spending` |
| **Daily metrics rollup** | One row per UTC date with key counts. | `daily_metrics` · `/api/cron/data-cycle` |

## Integration map (today)

```
                    ┌────────────────────────┐
                    │  /api/auto-scout       │   daily 14:00 UTC
                    │  Google Places scrape  │   → prospects
                    └──────────┬─────────────┘
                               │
                    ┌──────────▼─────────────┐
                    │  prospects (+ pipeline)│
                    └──────────┬─────────────┘
                               │
                ┌──────────────┼──────────────────────────────┐
                │              │                              │
        ┌───────▼────────┐ ┌───▼──────────┐         ┌─────────▼──────────┐
        │ /api/funnel/run│ │ Sales script │         │ Hormozi diagnostic │
        │ outreach       │ │ (Madie/Ben)  │         │ (manual today)     │
        │ daily 16:00    │ │              │         │                    │
        └───────┬────────┘ └──────┬───────┘         └────────────────────┘
                │                 │
                ▼                 ▼
        ┌─────────────────────────────────────┐
        │  conversions → checkout → onboarding │
        └──────────────────┬──────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  Per-client portal · 4 platforms wired:  │
        │  Stripe (card on file)   ← chat 5        │
        │  Meta OAuth              ← chat 5        │
        │  Google Ads OAuth        ← chat 5        │
        │  Lob (API key)           ← chat 5        │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────┐
        │  /api/cron/ad-roas-sync (daily 04:00)      │
        │  refreshes tokens, pulls yesterday's       │
        │  spend / impressions / clicks / convs      │
        └──────────────────┬─────────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────┐
        │  client_ad_creatives + system_costs        │
        │       ↓                       ↓             │
        │  Hyperloop                Spending dash    │
        │  variant analysis         /spending        │
        └────────────────────────────────────────────┘
```

## What's wired

- ✅ **OAuth tokens** stored encrypted (pgp_sym_encrypt) per tenant. Connect buttons live in portal Ads tab.
- ✅ **Stripe SetupIntent** for card-on-file (chat 5). Pass-through billing ready.
- ✅ **Hyperloop runner** with subscription tiers (none / manual / weekly / daily). Wilson-CI winner picker. Auto-pause losers when Pro+.
- ✅ **Cost logger** captures per-action (sendgrid, twilio, places, ai_processing) + recurring (Supabase, Vercel base).
- ✅ **Hormozi KB + diagnostic agent** with 5 seeded framework chunks + per-call prompt caching. Cost ~$0.024/run.
- ✅ **Daily metrics rollup** populates `daily_metrics` at 04:30 UTC.
- ✅ **18+ background crons** with CRON_SECRET gating + heartbeat logging.
- ✅ **Sales-portal multi-user** with per-rep prospect assignment + auto-promote on book.

## What's scaffolded (not yet wired)

- ⚠️ **QuickBooks / accounting export** — marketing page exists at `/v2/accounting` advertising "QuickBooks Setup" service, but no integration code. `system_costs` rows would map cleanly into QBO journal entries; no bridge built.
- ⚠️ **Diagnostic auto-trigger on pipeline stage** — `/dashboard/diagnostic` is manual-only. Could auto-run when a prospect hits stage 2 (Meeting scheduled) so Madie walks into the call with the diagnosis pre-rendered.
- ⚠️ **Cycle-time controls** — `MIN_IMPRESSIONS_FOR_VERDICT = 200` + `MIN_IMPRESSIONS_FOR_LOSER_HEURISTIC = 400` hardcoded in `hyperloop-analysis.ts`. No operator dial. (Cycle-time slider in this commit fixes that.)
- ⚠️ **YouTube transcripts for the KB** — chat 6's `hormozi-yt-scan` ingests metadata only. Title + description is useful; the actual transcripts require manual `scripts/ingest-hormozi-kb.mjs` runs.
- ⚠️ **Per-tenant Lob routing** — key is captured in `client_ad_accounts` but `src/lib/lob.ts` still reads `LOB_API_KEY` env. Switch needs a small follow-up.
- ⚠️ **MCC linking for Google Ads** — OAuth connect works; binding under BlueJays' Manager Account (linkInvitation API) is a separate call not yet wired.

## What's missing

- ❌ **Health / status dashboard** — no consolidated green/yellow/red panel. Each cron heartbeats individually; no aggregation surface. (Backend Audit page in this commit fixes that.)
- ❌ **2-way QBO sync** — pull invoices, push journal entries. The right pattern is a per-day rollup batch (QBO API has aggressive rate limits).
- ❌ **Hyperloop A/B history viewer** — winners table renders, but no time-series view of "this winner displaced that loser on this date for this reason."
- ❌ **Per-tenant cost attribution audit** — `system_costs.client_slug` is populated by some callers but not all. Spending dashboard's per-client slice is best-effort, not authoritative.

## Priority moves (recommended order)

1. **Cycle-time slider live in /dashboard/hyperloop** (this commit). Highest leverage per LOC — Ben can dial kill-window without redeploy.
2. **QBO journal-entry export endpoint** — one-way push. `/api/dashboard/qbo/export?from=…&to=…` returns a CSV the bookkeeper can import. Skip the OAuth dance until volume justifies it (~50 hrs work for full sync).
3. **Diagnostic auto-run on stage flip** — when `pipeline_stage` advances to "2", queue a diagnostic and email it to the assigned rep. ~3 hrs.
4. **Backfill `client_slug` on `system_costs`** — write a one-shot migration that fills the column for the ~6 known per-tenant cost services (twilio, sendgrid, places). Without this the spending dashboard's per-client slice undercounts. ~2 hrs.
5. **Per-tenant Lob routing** — read `client_ad_accounts.lob.refresh_token_encrypted` from `src/lib/lob.ts` instead of the master env. ~1 hr.
6. **Hyperloop A/B history viewer** — append-only `hyperloop_decisions` table + UI. ~6 hrs.

## Open architectural questions

- **Should diagnostics persist in the prospect record itself?** Today `hormozi_diagnostics.prospect_id` is optional. If we move to auto-trigger, every prospect at stage 2 will have one — at which point a denormalized `prospects.latest_diagnosis_id` column would speed up the sales-pipeline cards.
- **Where does QBO live in the dependency graph?** It's a destination, not an upstream. Cleanest is: nightly cron reads `system_costs` + `client_subscriptions` + `prospects.payments`, writes a per-day batch to QBO. Skip event-driven sync — QBO rate limits kill that pattern.
- **Should the cycle-time slider be per-client or global?** Today the constants are global. Per-client makes sense once tenants are paying — Zenith might want a faster iteration cycle than a $30/yr tenant. Default per-client to inherit from global; override when needed.

## Files referenced

- [src/lib/client-hyperloop.ts](../src/lib/client-hyperloop.ts)
- [src/lib/hyperloop-analysis.ts](../src/lib/hyperloop-analysis.ts)
- [src/lib/hormozi-agent.ts](../src/lib/hormozi-agent.ts)
- [src/lib/cost-logger.ts](../src/lib/cost-logger.ts)
- [src/app/api/cron/ad-roas-sync/route.ts](../src/app/api/cron/ad-roas-sync/route.ts)
- [src/app/api/cron/data-cycle/route.ts](../src/app/api/cron/data-cycle/route.ts)
- [supabase/migrations/20260512_daily_routines.sql](../supabase/migrations/20260512_daily_routines.sql)
- [src/app/dashboard/backend-audit/page.tsx](../src/app/dashboard/backend-audit/page.tsx) ← new this commit
- [src/app/dashboard/hyperloop/page.tsx](../src/app/dashboard/hyperloop/page.tsx) ← cycle-time slider added
