# Inspection-style client onboarding playbook

**Locked**: 2026-05-09 from Olympic Inspections & Testing (Luke).
**Reference slug**: `olympic-inspections`.
**Use this for**: any small-business owner who books on-site service jobs and wants the BlueJays AI marketing system. Mold inspectors, pest control, septic, home inspectors, asbestos/radon testers, HVAC tune-up, well-water testing, chimney sweep, pool inspectors, etc.

The "inspection-style" pattern is locked because it's load-tested through OIT's full audit. Every system on this list works end-to-end:

- ✅ Public marketing site with cost calculator + booking form
- ✅ Booking system with available-slots ledger + atomic claim
- ✅ Auto-confirmation email when owner confirms (registry-driven copy)
- ✅ Per-audience drip funnels (3 audiences, channel-aware)
- ✅ Affiliate scout that auto-discovers partner candidates weekly
- ✅ Partner map with mark-as-called outreach tracking
- ✅ Owner-portal admin: bookings / calendar / customers (with LTV) / partner map / "what's next"
- ✅ Generic portal tabs: Tasks / Leads / Funnels / Insights / Campaigns / Budget / AI Skills / Ads / Account
- ✅ Ads tab with Google + Meta connect-account boxes + per-tenant creative library
- ✅ Audience detection (homeowner / realtor / insurance) with keyword fallbacks
- ✅ Owner instant-alert on every new booking
- ✅ Cron heartbeats surfaced in /dashboard overview ("what ran today")

## The big idea

Adding the next inspection client = registering one config object + cloning ~6 boilerplate files. Everything else (booking emails, funnel runner merge tags, partner scout, audience map, ads creative library) reads from the registry.

If you find yourself hardcoding a new slug across the codebase, **stop and add the field to the registry**. The whole point of this work was DRYing up the per-tenant logic.

## Registry: `src/lib/inspection-clients.ts`

Single source of truth for per-tenant config. Every inspection-style client adds one entry. The `InspectionClientConfig` type documents every field; the OIT entry is the reference implementation.

Fields that drive system behavior:

| Field | Drives |
|---|---|
| `slug` | client_owners.client_slug, every URL `/clients/[slug]/...`, every API route under `/api/clients/[slug]/...` |
| `businessName` / `businessShortName` | Email subjects, signatures, headers |
| `ownerFirstName` / `ownerSignature` | Confirmation email signature, "From Luke at Olympic Inspections" style strings |
| `ownerPhone` | Phone link in confirmation email + SMS |
| `publicSiteUrl` | Generic merge-tag substitution in funnel emails |
| `serviceArea` | Funnel email body copy |
| `timezone` | Slot rendering in confirmation emails |
| `prepChecklist[]` | Pre-job prep bullets in confirmation email |
| `audiences[]` | The 3-audience funnel split |
| `scoutQueries[]` | Google Places searches the partner-scout runs |
| `scoutCities[]` | Geographic universe for the scout |
| `accreditation` | Lab / certification language in funnel + ads |
| `smsEnabled` | Per-tenant Twilio gating |
| `twilioNumberEnvVar` | Which env var holds the Twilio number for this tenant |

## What plugs into the registry today

- `src/app/api/clients/[slug]/bookings/route.ts` — booking-confirmation email body via `renderBookingConfirmationEmail()`
- `src/lib/oit-partner-scout.ts` — `runPartnerScout(slug)` reads cities + queries from registry. Heartbeat name is `partner_scout_<slug>`.
- `src/lib/client-funnels/runner.ts` — per-slug merge tags (`bookingUrl`, `calculatorUrl`, `partnersUrl`, `contactUrl`)
- `src/components/dashboard/AutomationDailyDigest.tsx` — every per-slug heartbeat surfaces here

## What still needs hand-cloning per tenant

(These are scoped to <30 min total and are mostly find-replace.)

- Funnel definition (`src/lib/client-funnels/SLUG.ts` + registry entry)
- Ad creatives (`src/lib/client-ads/SLUG-creatives.ts` + registry entry + AdsTab maps)
- Public site (`public/sites/SLUG/`)
- Admin page (`src/app/clients/SLUG/admin/page.tsx`)
- Bookings + slots API routes (`src/app/api/clients/SLUG/...`)
- Generic portal page entries: SLUG_DISPLAY_NAME, AUDIENCE_*, SAMPLE_LEADS_BY_SLUG, FUNNELS_BY_SLUG, QUICK_LINKS_BY_SLUG, tab gates
- Middleware public-API whitelist for the new slug

## Operational reality

**Setup tasks always seeded**: every new inspection client lands with these standing tasks for Ben:

1. Provision Twilio number → flip `smsEnabled: true` in registry
2. Set up SendGrid DKIM on the new domain
3. (If applicable) Domain transfer to Namecheap
4. Pre-populate 30 days of bookable slots via the Calendar admin tab

**Setup tasks always seeded for client**:

5. Send 3 real testimonials to replace placeholders
6. Send 1 hero photo to replace stock

**Time budget**: from "Ben says yes" to "client logs in and sees their portal" = ~90 minutes of focused work, mostly clone-and-edit.

## When the pattern breaks

This pattern fits service businesses with on-site bookings + 3 audiences + a referral economy. It does NOT fit:

- Pure e-commerce (use the Nevarland Outpost / Shopify pattern)
- Soccer / sports product (Zenith Sports pattern)
- Manufacturer DTC (ITC Quick Attach pattern)
- Real-estate brokerage itself (different — they ARE the realtor in the OIT funnel)
- Indie author / creative (Bloodlines pattern)

If the new client doesn't fit, don't force them through this playbook. Spawn a new playbook off the appropriate reference tenant.

## Where to start when running it

```
/onboard-inspection-client
```

That slash command walks the 11-step process. It assumes you've already
gotten the inputs from Ben in the order this playbook lists them.
