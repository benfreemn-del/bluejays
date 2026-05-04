# Full AI System — Build Playbook

The repeatable buildout for a "Custom AI Marketing Funnel" client (the
$9,700 + $500–1,000/mo offering on the audit page). One client = one
complete go-through of this playbook.

This file IS the system. When you sell the package to a new client, you
walk through these phases in order. Most of the code is already
abstracted per `client_slug`, so adding a new client is 60–80% config
and 20–40% bespoke content.

---

## What the AI Package includes (per the audit page)

1. Custom website
2. Google Ads — self-learning campaigns
3. Meta Ads — self-learning iterations per audience
4. Email + text + voicemail funnel (per audience)
5. Long-term SEO growth
6. Lead magnet (custom per business)
7. Logo revision if needed
8. Monthly performance reports

**Pricing tier**: `pricingTier = "fullsystem"` — renders with the
gold $ badge in the dashboard.

---

## Phase 0 — Discovery (1–2 hours)

### Inputs
- Their existing website
- Brand voice doc (if they have one)
- Customer demo list / past sales data (if available)

### Outputs
- A `client_tasks` row list seeded for the new client
- `pricingTier` flipped to `fullsystem` in the BlueJays prospects table

### Steps
```sql
-- Mark the prospect as a fullsystem buyer
update prospects
set pricing_tier = 'fullsystem'
where id = '<their-uuid>';
```

```bash
# Seed empty task list for them
curl -X POST https://bluejayportfolio.com/api/client-tasks \
  -H 'Content-Type: application/json' \
  -d '{ "client_slug": "their-slug", "title": "Discovery call notes",
        "category": "build", "owner": "ben" }'
```

Then visit `/dashboard/clients/their-slug` and add asset/decision/
build tasks for everything that surfaced in discovery.

---

## Phase 1 — Showcase site (1–3 days)

Build their bespoke `/clients/{slug}` page. Reference past clients:
- `zenith-sports/` — multi-page (main + shop)
- `wholme-naturopathy/` — single-page with booking
- `mt-view-landscaping/` — service-business with carousels
- `riv-inc/` — SaaS landing pattern

### Required components on every showcase
- Sticky nav (mobile menu rendered as sibling of header — not child —
  to avoid the backdrop-filter containing-block bug)
- Hero with primary CTA matching their #1 audience
- 3+ trust elements (testimonials, credentials, stats)
- Inquiry form wired to `/api/clients/inquire`
- Footer with proper © + trademark notice

### Wire to the inquire route
Add their slug + emoji + clientEmail to
`src/app/api/clients/inquire/route.ts → SLUG_CONFIG`.

---

## Phase 2 — Lead persistence (Sprint 1, ~1 hour per client)

Already built — no per-client code needed.

When a form submits on `/clients/{slug}`, the `/api/clients/inquire`
endpoint:
1. Logs the lead to `client_leads` table
2. Auto-detects audience via `detectAudience(slug, payload)` in
   `src/lib/client-leads.ts`
3. Fires owner SMS + email alert

**To add audience detection for a new client**:
edit `src/lib/client-leads.ts → detectAudience()` and add a
`if (clientSlug === "their-slug")` branch with the per-form mapping.

---

## Phase 3 — Funnel content (Sprint 2, ~4–8 hours per client)

The actual money-printer. Three parallel cadences typically — one
per primary audience (parent/coach/player for Zenith, decision-maker/
end-user/influencer for SaaS, etc.).

### Per-client setup
1. Create `src/lib/client-funnels/{slug}.ts` mirroring
   `zenith-sports.ts`. Define your per-audience FunnelStep arrays.
2. Add an entry to `src/lib/client-funnels/registry.ts → CLIENT_FUNNELS`
   with sender + sms config.
3. The runner picks them up automatically. No other code needed.

### Cadence rules of thumb
| Audience type | Touches | Window |
|---|---|---|
| Emotional / consumer | 4–5 | 10–14 days |
| B2B / decision-maker | 5–7 | 14–28 days |
| Short-attention / Gen Z | 2–3 | 5–10 days |

### Voice
- Source from their brand voice doc Copy Vault if they have one
- Single CTA per touch matching the audience-segment table
- Pass the "would they reply 'thanks' or hit unsubscribe?" test
- Flag any copy that needs client approval before it ships

---

## Phase 4 — Voice infrastructure (~1 day per client)

### Twilio
1. Client provisions their own Twilio account + buys a number
2. Set env vars on Vercel:
   - `<CLIENT>_TWILIO_NUMBER` — the number (E.164)
   - (Future) `<CLIENT>_TWILIO_SID` + `_TOKEN` if running on a
     sub-account
3. Update `registry.ts → sms.from` to read from the new env var
4. Set Twilio webhook on the number's Voice & Fax config to:
   `https://bluejayportfolio.com/api/client-funnels/missed-call?client={slug}`

### Voicemail recordings
Client records 6 clips (3 audiences × 2 follow-ups each). Upload to
Twilio Media or Vercel Blob. Set `mediaUrl` on the relevant
FunnelChannelTouch entries in their `{slug}.ts` funnel def.

---

## Phase 5 — Lead magnets (~1 day per client)

Three standard archetypes:
- **Coach guide / playbook** (B2B PDF) — see `zenith-sports/training-guide`
- **Camp finder / locator** (consumer geo lookup) — see `zenith-sports/camps`
- **Product story / origin** (brand) — typically baked into showcase

For PDF-style lead magnets, build a printable HTML page (not a real PDF)
at `/clients/{slug}/{magnet-name}`. Wire the EmailCapture component's
`successCta` prop to its URL for instant access on form submit.

---

## Phase 6 — Ads (Sprint 4, ~1 day per client)

### Creative library
1. Create `src/lib/client-ads/{slug}-creatives.ts` mirroring
   `zenith-creatives.ts`. ~27 variants total: 3 audiences × 3 ad sets
   × 3 creatives.
2. Register in `src/lib/client-ads/index.ts → REGISTRY`.
3. Hit `/dashboard/clients/{slug}/ads` and click "Sync seeds" to
   populate the DB.
4. Export to CSV (Meta or Google) and upload to their ad manager.
5. As you launch each ad, flip its `status` to "live" in the dashboard.

### Affiliate pipeline
Affiliate prospects (resellers, podcast hosts, niche influencers) live
in `client_affiliates`. Add manually via the dashboard `+ Affiliate`
form, OR seed in bulk via `/api/client-affiliates?client={slug}` POST.

The scoring function in `src/lib/client-affiliates.ts → scoreAffiliate`
needs a per-client branch — copy the Zenith pattern.

---

## Phase 7 — Reporting (~30 min per client)

Already built — no per-client code needed.

The weekly report at `/dashboard/clients/{slug}/reports` works for any
slug that has `client_leads` rows. To enable the weekly auto-email,
add to `vercel.json → crons`:

```json
{
  "path": "/api/client-reports?client={slug}&email=1",
  "schedule": "0 14 * * 1"
}
```

---

## Phase 8 — Activation + billing

1. Add the recurring revenue line in your `recurring_costs` table
   ($500–1,000/mo)
2. Update `pricingTier = "fullsystem"` on their prospect row → gold
   $ badge appears
3. Send the kick-off email with:
   - Showcase URL
   - Lead magnet URLs
   - Coach demo / consultation booking link (if applicable)
   - First weekly report date

---

## Per-client artifact checklist

When a new client is fully onboarded, every box should be checked:

```
☐ Showcase site at /clients/{slug}
☐ Layout + sticky nav + footer
☐ /api/clients/inquire SLUG_CONFIG entry
☐ src/lib/client-leads.ts → detectAudience() branch
☐ src/lib/client-funnels/{slug}.ts (3 audience funnels)
☐ src/lib/client-funnels/registry.ts entry
☐ Twilio number env var + webhook URL
☐ 6 voicemail clips uploaded + wired
☐ Lead magnet pages (1–3 typical)
☐ src/lib/client-ads/{slug}-creatives.ts (~27 variants)
☐ Ad creative seeds synced to DB
☐ Affiliate scoring branch
☐ Weekly report cron entry in vercel.json
☐ pricing_tier = 'fullsystem' set in prospects row
☐ recurring_costs row added
☐ client_tasks list seeded with their initial backlog
```

---

## Code surface (where to look for what)

| Capability | Location |
|---|---|
| Showcase page | `src/app/clients/{slug}/` |
| Inquiry endpoint | `src/app/api/clients/inquire/route.ts` |
| Lead persistence + audience detection | `src/lib/client-leads.ts` |
| Funnel definitions | `src/lib/client-funnels/{slug}.ts` |
| Funnel registry (sender config) | `src/lib/client-funnels/registry.ts` |
| Funnel runner (idempotent) | `src/lib/client-funnels/runner.ts` |
| Email/SMS/VM senders | `src/lib/client-funnels/sender.ts` |
| Reply detection | `src/lib/client-funnels/reply-detector.ts` |
| Missed-call webhook | `src/app/api/client-funnels/missed-call/route.ts` |
| Ad creative library | `src/lib/client-ads/` |
| Affiliate pipeline | `src/lib/client-affiliates.ts` |
| Weekly report generator | `src/lib/client-reports.ts` |
| Per-client task list | `src/lib/client-tasks.ts` + `/dashboard/clients/[slug]` |
| Per-client lead dashboard | `/dashboard/clients/[slug]/leads` |
| Per-client ads dashboard | `/dashboard/clients/[slug]/ads` |
| Per-client affiliates dashboard | `/dashboard/clients/[slug]/affiliates` |
| Per-client reports dashboard | `/dashboard/clients/[slug]/reports` |

---

## DB tables (in dependency order)

| Table | Purpose | Migration |
|---|---|---|
| `client_tasks` | Per-client durable task list | `20260503_client_tasks.sql` |
| `client_leads` | Per-client lead capture | `20260503_client_leads.sql` |
| `client_lead_messages` | Funnel send + reply log | `20260503_client_lead_messages.sql` |
| `client_ad_creatives` | Per-client ad variant library | `20260503_client_ad_creatives.sql` |
| `client_affiliates` | Per-client affiliate pipeline | `20260503_client_affiliates.sql` |

All keyed by `client_slug` so cross-tenant queries are trivial. No
per-client schema work needed.

---

## Sales artifacts

When pitching the package:
- Show prospect a recent client's `/dashboard/clients/{slug}/reports`
  page (anonymized) to demonstrate the live data the client gets
- Walk through one funnel email touch from `{slug}.ts` to show the
  per-audience customization
- Show the gold $ row in the dashboard ("This is what your row will
  look like once you're onboarded")
- Quote $9,700 + $500–1,000/mo with a payment plan option (3x $3,500
  / $3,500 / $3,000 per the audit page)
