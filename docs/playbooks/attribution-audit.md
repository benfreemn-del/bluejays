# Attribution Audit Playbook

> **Owner:** Ben · **Target time:** 2 hours · **Frequency:** quarterly (next: end of Q2 2026)
>
> **Why:** Luis's #1 validated unlock — when LTV/CAC doesn't reconcile with actual P&L, the attribution is broken and every scaling decision becomes a guess. Pattern repeated in the Cory + Luis 1-year follow-ups: the operators who fix attribution + kill losing channels + scale winners grow 40-100% in year 1.
>
> **Decision rule:** kill channels where CAC > avg ticket. Scale channels where CAC < 60% of avg ticket. Marginal (60-100%) → fix funnel before scaling.

## Step 1 — Run these 3 SQL queries in Supabase

### Query A — Paid customers by channel (last 90 days)

```sql
select
  coalesce(source_channel, 'NULL/missing') as channel,
  count(*) as paid_customers,
  count(*) filter (where pricing_tier = 'fullsystem') as ai_system_count,
  count(*) filter (where pricing_tier = 'standard') as standard_997_count,
  count(*) filter (where pricing_tier = 'custom') as custom_100_count,
  count(*) filter (where pricing_tier = 'free') as free_count,
  round(avg(case when pricing_tier = 'fullsystem' then 10000
                 when pricing_tier = 'standard' then 997
                 when pricing_tier = 'custom' then 100
                 when pricing_tier = 'free' then 30
                 else 0 end)) as avg_ticket
from prospects
where status = 'paid'
  and paid_at >= now() - interval '90 days'
group by source_channel
order by paid_customers desc;
```

### Query B — Funnel volume by channel (all stages, last 90 days)

```sql
select
  coalesce(source_channel, 'NULL/missing') as channel,
  count(*) as total_leads,
  count(*) filter (where status = 'paid') as closed,
  count(*) filter (where pipeline_stage is not null) as in_pipeline,
  count(*) filter (where status in ('bounced','unsubscribed','dismissed','wont-do')) as dead,
  round(100.0 * count(*) filter (where status = 'paid') / nullif(count(*),0), 1) as close_rate_pct
from prospects
where created_at >= now() - interval '90 days'
group by source_channel
order by total_leads desc;
```

### Query C — Win-loss reasons by channel (last 90 days)

```sql
select
  coalesce(source_channel, 'NULL/missing') as channel,
  coalesce(win_loss_outcome, 'no-response') as outcome,
  count(*) as n
from prospects
where created_at >= now() - interval '90 days'
  and win_loss_outcome is not null
group by source_channel, win_loss_outcome
order by channel, n desc;
```

## Step 2 — Pull 4 numbers manually (~15 min)

| Number | Where | Note |
|---|---|---|
| **Meta Ads spend (90 days)** | business.facebook.com → Ads Manager → "Last 90 days" → total spend | |
| **Google Ads spend (90 days)** | ads.google.com → Campaigns → "Last 90 days" → total cost | |
| **Madie/Ben outbound "spend"** | Madie commission YTD prorated to 90 days + Ben hours × hourly equivalent | proxy for opportunity cost |
| **Other paid channels** | LinkedIn, podcast sponsorships, partner fees paid | sum |

## Step 3 — The CAC table (~15 min)

| Channel | 90-day spend | Paid (Query A) | CAC | Avg ticket | Profitable? |
|---|---|---|---|---|---|
| `agency-replacement-ad` (Google) | | | spend ÷ customers | | CAC < AOV × 0.6? |
| `ad-system-ad` (Google) | | | | | |
| Meta inbound | | | | | |
| `madie-cold-call` | | | | | |
| `ben-cold-call` | | | | | |
| `audit-inbound` (organic) | $0 | | $0 | | always profitable |
| `partner:*` | | | | | |
| `website-direct` | $0 | | $0 | | always profitable |
| `scout-mfg-icp` | scout tool costs | | | | |
| `referral` | $0 | | $0 | | always profitable |

## Step 4 — Decision rules (Luis framework, ~30 min)

For each paid channel:
- **CAC < 60% of avg ticket** → KEEP, consider scaling
- **CAC > avg ticket** → KILL or restructure (losing money per close)
- **CAC 60-100% of ticket** → marginal, fix funnel before scaling spend (this is where the /audit landing page refactor on Day 18 matters)
- **`NULL/missing` source_channel at >20% of paid customers** → tracking is broken, fix attribution before any other decision

## Step 5 — Red-flag patterns to watch for

1. **Agency-claimed credit > actual paid customers** — if Google Ads agency claims 80% but Query A shows `agency-replacement-ad + ad-system-ad < 50%`, agency is claiming credit for organic/referral conversions.
2. **High close-rate from "broken" channel** — low spend + high close rate (Query B) = highest-margin acquisition path. Don't kill just because volume is low.
3. **Madie/Ben outbound > paid channels** — if cold-call closes outperform paid, the lever isn't more ad spend; it's more outbound capacity.

## Step 6 — After the audit

1. Save the CAC table to `aios/memory/costs_dashboard.md` as a baseline
2. Decide kill/scale per channel — one yes/no per row
3. Update Friday FB launch budget based on what Meta actually delivered
4. Surface NULL-attribution % in the strategic review — if >20%, fixing attribution is more important than any spend decision

## Source

Derived from the Luis Laura / Optimum Works diagnosis (1-year validated). See `aios/memory/reference_hormozi_luis_frameworks.md` framework #1 (Attribution Reconciliation Diagnostic). Pairs with Cory ProShine 1-year validation (`reference_hormozi_cory_frameworks.md`) — both confirm attribution-fix is a top-3 year-1 lever.
