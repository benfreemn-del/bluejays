# Touch-Logging System Build Plan

> **Target:** ship before wave-1 + Google Ads produce sustained inbound volume (~3-7 days).
> **Why:** today's instrumentation audit (2026-05-18) found ZERO logged touches across 75 inbound prospects in the past 30 days, including the 7 marked `status='contacted'`. The system records status flips, not actions. When wave-1 lands real volume, Ben + Madie need to see who-called-who-when-what-was-said without parsing free-text admin_notes.

## Current state (problems)

1. The "Just called" button at `src/app/dashboard/script/LeadPicker.client.tsx:984` POSTs to `/api/prospects/[id]/log-call`, which writes:
   - `prospects.last_contacted_at = NOW()` (single timestamp, last-write-wins)
   - Optional note appended to `prospects.admin_notes` with `[Date call]` prefix
2. **No button** for text / email / DM / in-person / voicemail-left.
3. **No timeline view** anywhere — `admin_notes` accumulates as one growing TEXT blob.
4. **Button only on `/dashboard/script`** (Madie's outbound tool). Not on:
   - `/dashboard/leads` (main inbound queue)
   - `/dashboard/clients/[slug]` (prospect detail)
   - Hot-lead SMS alert reply path
5. **Two operators (Ben + Madie) call separately** — no way to know "did Madie already reach this lead today?" → duplicate dials = wasted touches.

## Target architecture

### New table: `prospect_touches`

```sql
CREATE TABLE prospect_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  -- One of: 'call', 'voicemail', 'text', 'email', 'dm', 'in_person', 'note'
  kind TEXT NOT NULL CHECK (kind IN ('call', 'voicemail', 'text', 'email', 'dm', 'in_person', 'note')),
  -- One of: 'outbound', 'inbound' (who initiated)
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  -- One of: 'connected', 'no_answer', 'left_voicemail', 'declined', 'replied', 'no_reply', 'sent', 'received'
  -- Optional finer-grained outcome. NULL = unspecified.
  outcome TEXT,
  -- Free-form note. Max ~1KB. Surfaces in timeline + lead-card hover.
  notes TEXT,
  -- 'ben', 'madie', 'auto-ai', 'auto-funnel'. Defaults to current user.
  by_user TEXT NOT NULL DEFAULT 'ben',
  -- Channel ID where applicable (Twilio SID, SendGrid message ID, etc.)
  external_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX prospect_touches_prospect_idx
  ON prospect_touches (prospect_id, occurred_at DESC);

CREATE INDEX prospect_touches_by_user_idx
  ON prospect_touches (by_user, occurred_at DESC);

CREATE INDEX prospect_touches_kind_idx
  ON prospect_touches (kind, occurred_at DESC);
```

### One-click UI components

**`<TouchButtons prospectId="..." size="sm|md" />`** — drop-in button strip:
```
[📞 Called] [💬 Texted] [✉️ Emailed] [📝 Note]
```
Each button:
1. Optimistically POSTs to `/api/prospects/[id]/touches` with `{ kind }`
2. Opens a quick popover: outcome dropdown + 1-line note field + Save
3. Refreshes the timeline if visible

**`<TouchTimeline prospectId="..." />`** — vertical list of every touch:
```
2026-05-18 3:42 PM · 📞 Ben called · connected · "Asked about pricing, sending preview"
2026-05-17 10:15 AM · ✉️ Auto-funnel sent · Day-1 reactivation email
2026-05-15 9:03 AM · 💬 Madie texted · no_reply · "Checking in on the audit"
```

### API

- `POST /api/prospects/[id]/touches` — record a touch
- `GET /api/prospects/[id]/touches?limit=50` — fetch timeline for one prospect
- `GET /api/touches/today` — operator dashboard: every touch by every user in the last 24h (the "what got done today" view)

### Surfaces to mount the buttons

1. `/dashboard/leads` — each lead row gets a `<TouchButtons size="sm" />` strip
2. `/dashboard/clients/[slug]` — the per-client detail page gets `<TouchTimeline />` at top + `<TouchButtons />`
3. `/dashboard/script` — keep the existing "Just called" button (legacy) but route it through the new API
4. `/lead/[id]` — the prospect deep-link page gets the full timeline

### Backfill

A one-time migration script that scans `prospects.admin_notes` for patterns like `[<date> call]` and seeds `prospect_touches` rows so historical data isn't lost.

### Auto-logged touches (Phase 2 — not in this build)

These should fire automatically into `prospect_touches` so manual logging isn't required for systems-driven sends:

- SendGrid email sent → row with `kind='email', direction='outbound', by_user='auto-funnel', external_id=<sendgrid_message_id>`
- SendGrid email opened/clicked → row with `kind='email', direction='inbound', outcome='replied'`
- Vonage SMS sent → row with `kind='text', direction='outbound'`
- Vonage SMS inbound → row with `kind='text', direction='inbound', outcome='replied'`
- Twilio incoming call → row with `kind='call', direction='inbound', external_id=<call_sid>`

Phase 2 turns the timeline into the full activity stream automatically. Phase 1 just needs the manual buttons working.

## Build sequence (~2-3 hr)

1. **Migration** (10 min) — apply `prospect_touches` table via Supabase MCP
2. **Lib** (20 min) — `src/lib/prospect-touches.ts` with `logTouch()` + `listTouches()` + `recentTouchesByUser()`
3. **API route** (20 min) — `src/app/api/prospects/[id]/touches/route.ts` POST + GET
4. **Components** (45 min) — `<TouchButtons>` + `<TouchTimeline>` in `src/components/dashboard/`
5. **Mount on surfaces** (30 min) — `/dashboard/leads`, prospect detail, `/lead/[id]`
6. **Backfill script** (20 min) — parse `admin_notes` for `[Date call]` entries → seed touches
7. **Update existing log-call endpoint** (10 min) — write to BOTH `last_contacted_at` (legacy) AND `prospect_touches` (new) so Madie's existing `/dashboard/script` button stays working
8. **Commit + push + verify** (15 min)

## What this unlocks

- **Wave-1 + Google leads:** every call/text/email visible in one timeline per lead
- **Madie vs Ben coordination:** see "Madie already texted this lead 2 hours ago, don't double-touch"
- **Attribution audit (Q2):** structured query "leads that closed had avg 3.2 touches over 11 days"
- **2-min SLA telemetry chip (from 116-Funnels):** powered by `touches` not by `last_contacted_at` (more accurate)
- **AI responder honesty:** when AI auto-replies to an inbound text, it logs a touch → operator sees "AI responded, here's what it said" instead of being surprised

## Not in scope for this build

- Email tracking pixels (open / click) — Phase 2
- SMS reply auto-classification — Phase 2
- Twilio call recording / transcription — Phase 3
- Per-touch SLA timing aggregations — Phase 2 (powered by the data this build creates)

## Decision needed from Ben

- Approve build → I run sequence above tomorrow
- Tweak the touch `kind` enum (currently: call / voicemail / text / email / dm / in_person / note)
- Tweak the `outcome` enum (currently: connected / no_answer / left_voicemail / declined / replied / no_reply / sent / received)
- Decide if backfill from `admin_notes` is worth it (~20 min build) or skip (no historical touches in the new system)
