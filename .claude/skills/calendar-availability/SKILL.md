---
name: calendar-availability
description: Per-tenant booking availability + external-calendar sync (Google Calendar, Calendly, Cal.com). Use when wiring booking surfaces, computing free slots, or onboarding a new owner who needs the AI to know when they're available.
---

# Calendar Availability Skill

Centralized calendar + booking-availability system for any tenant
whose business requires scheduling. Replaces the OIT-specific
slot-management code that used to live in
`src/app/clients/olympic-inspections/admin/page.tsx`'s Calendar tab.

## When this skill applies

- **Inspection-style tenants** (OIT, future mold/pest/septic/home/HVAC inspectors)
- **BlueJays itself** (Ben's Calendly + future internal-team scheduling)
- **Service businesses** that book on-site or virtual appointments

## When this skill does NOT apply

- **Zenith Sports** — soccer drills + camps run on a published curriculum,
  not 1:1 scheduled appointments. Camp signups use `client_camps` (event
  catalog), not `client_booking_slots` (availability ledger).
- **Nevarland Outpost** — e-commerce, no scheduling.
- **Bloodlines** — author/marketing site, no scheduling.

The `calendarEnabled` field on `ServiceClientConfig` (in
`src/lib/service-clients.ts`) gates whether a tenant gets the calendar
surface at all.

## Two paths for owners

### Path A — Manual slot management (works today)

Owner opens the admin Calendar tab → adds slots one-by-one OR clicks
"Pre-fill 30 days (M-F · 9 / 12 / 3)" preset. Slots land in
`client_booking_slots` table; public booking form reads from there.

**When to use:** Owner doesn't have a digital calendar, or wants
totally manual control. Default for new tenants.

### Path B — External calendar sync (OAuth)

Owner connects Google Calendar / Calendly / Cal.com from a "Connect
calendar" button in their admin. Token encrypted at rest in
`client_calendar_accounts`. The system then:

  1. **Pulls free/busy** from the connected calendar (every 15 min via
     cron) → derives available slots within the owner's
     working-hours config.
  2. **Pushes new bookings** as calendar events the moment a customer
     reserves a slot — owner sees it in their phone calendar
     immediately.
  3. **Auto-blocks** owner-side calendar conflicts so the public
     booking form doesn't double-book a personal appointment.

**When to use:** Owner already lives in a calendar app and doesn't
want to maintain two sources of truth. Most OIT-style owners.

## Onboarding flow

When a new owner first logs into a `calendarEnabled` portal:

1. **CalendarSetupBanner** renders at the top of the admin (or
   portal Overview) until the tenant has either:
   - 3+ slots in `client_booking_slots`, OR
   - 1+ active `client_calendar_accounts` row.
2. Banner offers two CTAs:
   - "Connect Google Calendar / Calendly" → OAuth flow
   - "Skip — I'll add slots manually" → dismisses for 7 days, then re-shows
3. Once dismissed/completed, banner hides on subsequent logins.

This is what fires Ben's "prompts backend users when they signup to
complete their schedule or connect their calendar app" requirement.

## Schema

### `client_booking_slots` (existing)

The slot ledger. Owner-managed (manual) OR derived (sync). Public
booking form claims rows atomically.

### `client_calendar_accounts` (new — see migration 20260509)

Per-(slug, provider) OAuth state. Provider = google_calendar | calendly
| cal_com. Refresh tokens encrypted via the same pgp_sym pattern as
`client_ad_accounts`. Status: pending → active → expired/revoked/failed.

### `client_calendar_working_hours` (new — see migration 20260509)

Owner's weekly availability template, per slug. JSON shape:

```json
{
  "timezone": "America/Los_Angeles",
  "weekly": {
    "monday":    [{"start":"09:00","end":"12:00"},{"start":"13:00","end":"17:00"}],
    "tuesday":   [{"start":"09:00","end":"17:00"}],
    "wednesday": [{"start":"09:00","end":"17:00"}],
    "thursday":  [{"start":"09:00","end":"17:00"}],
    "friday":    [{"start":"09:00","end":"15:00"}],
    "saturday":  [],
    "sunday":    []
  },
  "buffer_minutes": 15,
  "slot_duration_minutes": 90
}
```

Used to derive bookable slots from connected-calendar free/busy.

## Files

- `src/lib/calendar.ts` — central library: slot helpers, working-hours
  computation, OAuth helpers, free/busy derivation
- `src/lib/calendar-rules.ts` — booking rules (min lead-time,
  slot-duration constraints, owner-blackout windows)
- `src/components/portal/CalendarSetupBanner.tsx` — onboarding nag
- `src/components/portal/CalendarTab.tsx` — admin slot-management UI
  (consumed by OIT admin + future tenants)
- `src/app/api/oauth/[provider]/start/route.ts` — calendar provider
  OAuth (google_calendar | calendly | cal_com) — same scaffold as ads
- `src/app/api/clients/[slug]/calendar/sync/route.ts` — pull free/busy
  + reconcile slots
- `src/app/api/cron/calendar-sync/route.ts` — every-15-min sync cron

## Tenants currently calendar-enabled

| Slug | Path A (manual) | Path B (OAuth) | Notes |
|---|:---:|:---:|---|
| `olympic-inspections` | ✅ active | 🟡 scaffold | Path A working today; owner can connect Google Calendar when env vars provisioned |
| `bluejays` | 🟡 scaffold | 🟡 scaffold | Ben's internal scheduling — feature-flagged for calendar-enabled when `BLUEJAYS_CALENDAR_ENABLED=true` |
| `zenith-sports` | — | — | Disabled (camp catalog, not appointments) |
| `nevarland-outpost` | — | — | Disabled (e-commerce) |

## OAuth provisioning (for Ben)

Same pattern as `ads-oauth-setup.md`:

### Google Calendar
1. Same Google Cloud project as Google Ads (already configured)
2. Enable Calendar API in APIs & Services
3. Add scope: `https://www.googleapis.com/auth/calendar.events`
4. Add redirect: `${SITE_URL}/api/oauth/google_calendar/callback`
5. Reuses `GOOGLE_ADS_CLIENT_ID` + `GOOGLE_ADS_CLIENT_SECRET` (same OAuth client)

### Calendly
1. dev.calendly.com → Create OAuth app
2. Redirect: `${SITE_URL}/api/oauth/calendly/callback`
3. Vercel env: `CALENDLY_CLIENT_ID` + `CALENDLY_CLIENT_SECRET`

### Cal.com
1. cal.com → API Keys → Create
2. Vercel env: `CAL_COM_API_KEY` (no OAuth — single API key)

## Don't

- **Don't store calendar credentials in plaintext.** Use the same
  pgp_sym RPC pattern (`calendar_account_upsert_token` /
  `calendar_account_get_token`) as `ad_oauth.ts`.
- **Don't expose owner free/busy to public booking form.** Only the
  derived "available slots" set ships to /api/clients/[slug]/slots/public —
  the underlying free/busy stays server-side.
- **Don't enable calendar surfaces for tenants where `calendarEnabled
  = false`.** Routes return 404 + UI hides the tab.

## When this is useful

- Adding a new inspection-style tenant — calendar is already wired
- Owner says "I want my Google Calendar to show my OIT bookings"
- Customer reports a double-booking — check sync state in
  `client_calendar_accounts.last_synced_at` + `consecutive_failures`
- Building a new appointment-flow feature (e.g. group bookings,
  recurring appointments, owner-vacation blocks)
