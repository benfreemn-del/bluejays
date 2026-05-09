---
description: Onboard a new inspection-style service client (mold, pest, septic, home, asbestos/radon, HVAC, well-water, etc.) using the Olympic Inspections pattern as the reference.
---

# /onboard-inspection-client

Spin up a new inspection-style client end-to-end in ~90 minutes
instead of 8 hours. Follows the pattern Olympic Inspections & Testing
locked in 2026-05-09 — full audit + system review have validated it
works for any "small-business owner who books on-site jobs."

## Inputs needed from Ben before we start

1. **Slug** (e.g. `peninsula-pest`, `cascade-home-inspect`)
2. **Business name** + short name
3. **Owner first name + signature line**
4. **Owner phone** (the number that goes on confirmation emails)
5. **Public site URL** (or "TBD" if pre-domain)
6. **Service area** description (e.g. "King County", "the Olympic Peninsula")
7. **Three audiences** — the funnel splits 3 ways:
   - End-customer (default — usually homeowner / property owner)
   - Referral partner (usually realtors / brokers / vets)
   - Channel partner (usually insurance / claims / commercial)
8. **Pre-job prep checklist** (3-5 lines — owner-specific)
9. **Lab / accreditation language** (if applicable — "ISO/IEC 17025",
   "WSDA-licensed", "AIHA-LAP", etc.)
10. **Cities to scout** for affiliates — the scout runs Google Places
    queries across every city × query combination
11. **Affiliate-target queries** — what kind of partners does this
    business want to outreach to? Realtors + property mgmt are
    universal. Mold-remediation contractors apply to mold/water-damage
    inspectors. Pest-extermination doesn't apply to mold etc.

## Step-by-step (copy-paste workflow)

### 1. Register the config (1 file, 5 min)

Add an entry to `src/lib/inspection-clients.ts` `REGISTRY`. Use the
`OLYMPIC_INSPECTIONS` const above as the template. Every field is
documented inline. Once this lands, the rest of the system reads from
it — booking confirmation emails, partner-scout, audience detection,
funnel merge tags all hydrate from the registry.

### 2. Database seeds (Supabase SQL editor, 5 min)

Drop this in the Supabase SQL editor — replace `NEW_SLUG` + login
password placeholder + email:

```sql
-- 1. Owner login
insert into public.client_owners (client_slug, email, password_hash, name)
values (
  'NEW_SLUG',
  'OWNER_EMAIL',
  encode(
    digest(
      coalesce(current_setting('app.portal_salt', true), 'bluejays-portal-2026-default-salt')
        || ':OWNER_TEMP_PASSWORD',
      'sha256'
    ),
    'hex'
  ),
  'OWNER_NAME · BUSINESS_NAME'
)
on conflict (lower(email)) do nothing;

-- 2. Standing setup tasks (mirror OIT's 7-task pattern)
insert into public.client_tasks (client_slug, owner, category, priority, title, description)
select * from (values
  ('NEW_SLUG', 'ben', 'build', 'high',
   'Provision Twilio number',
   'Buy a dedicated Twilio number and add to env. Set smsEnabled=true in inspection-clients.ts after.'),
  ('NEW_SLUG', 'ben', 'build', 'high',
   'Set up SendGrid DKIM',
   'Authenticate the domain so funnel emails don''t land in spam.'),
  ('NEW_SLUG', 'client', 'asset', 'medium',
   'OWNER_NAME: send 3 real testimonials',
   'Replace placeholders.'),
  ('NEW_SLUG', 'client', 'asset', 'low',
   'OWNER_NAME: send 1 hero photo',
   'Replace stock.'),
  ('NEW_SLUG', 'ben', 'build', 'low',
   'Pre-populate 30 days of bookable slots',
   'Use the admin Calendar tab — there''s a "Pre-fill 30 days" preset button.')
) as v(client_slug, owner, category, priority, title, description)
where not exists (
  select 1 from public.client_tasks
  where client_slug = 'NEW_SLUG' and title = v.title
);
```

### 3. Funnel definition (1 file, 15 min)

Copy `src/lib/client-funnels/olympic-inspections.ts` →
`src/lib/client-funnels/NEW_SLUG.ts`. Edit:

- Audience names + emoji + funnel cadences
- Email subject lines + body copy (lean on OIT's homeowner / realtor /
  insurance shape — substitute the new business's specific angle)
- Reference the registry merge tags `{{bookingUrl}}`,
  `{{calculatorUrl}}`, `{{partnersUrl}}` — those resolve via the
  `substitutions()` helper in `runner.ts` once the registry
  entry is added.

Then register the funnel in `src/lib/client-funnels/registry.ts`:

```ts
import { getNewSlugFunnel } from "./NEW_SLUG";
// ...
const NEW_SLUG_FUNNELS: ClientFunnelConfig = { ... }
CLIENT_FUNNELS["NEW_SLUG"] = NEW_SLUG_FUNNELS;
```

### 4. Audience-detection branch (1 file, 5 min)

Add a per-slug branch in `src/lib/client-leads.ts` `detectAudience()`.
Copy OIT's branch (line ~152) — change keyword sniffs to match the new
audiences.

### 5. Ad creative library (1 file, 20 min)

Copy `src/lib/client-ads/oit-creatives.ts` →
`src/lib/client-ads/NEW_SLUG-creatives.ts`. Edit:

- ~12 creatives total (3 audiences × 4 platforms — meta-feed, meta-
  reels, google-search, google-pmax)
- Hooks should reflect the new business's actual pain/outcome angles
- UTM tags reference the new slug

Then register in `src/lib/client-ads/index.ts`:

```ts
import { NEW_SLUG_CREATIVES } from "./NEW_SLUG-creatives";
const REGISTRY = { ..., "NEW_SLUG": NEW_SLUG_CREATIVES };
```

And in `src/components/portal/AdsTab.tsx`:

- Add to `CREATIVES_BY_SLUG`
- Add a `AUDIENCE_FILTERS_BY_SLUG` entry

### 6. Per-tenant boilerplate updates (small, surgical)

- `src/lib/client-leads.ts` — extend `ClientLeadAudience` type if the
  new audiences aren't already there
- `src/app/clients/[slug]/portal/page.tsx`:
  - `SLUG_DISPLAY_NAME` — pretty business name
  - `AUDIENCE_EMOJI` + `AUDIENCE_LABEL_PLAIN` — emoji + label per
    audience
  - `audienceEmoji()` source-fallback — keyword sniffs
  - `AUDIENCE_DEFAULT_DEAL_USD` — average job value per audience
  - `AUDIENCE_DEFAULT_OPTIN_SLUGS` — add the slug
  - `SAMPLE_LEADS_BY_SLUG` — demo lead template
  - `FUNNELS_BY_SLUG` — register the visual `FunnelDef[]` array
  - `QUICK_LINKS_BY_SLUG` — 4 Overview tile shortcuts
  - Tab gates for `ai-skills` and `ads` — extend the
    `(slug === "itc-quick-attach" || slug === "zenith-sports" || ...)`
    chain

### 7. Public site (1 directory, 30 min)

Copy `public/sites/olympic-inspections/` → `public/sites/NEW_SLUG/`.
Edit:

- `index.html` — hero, services, FAQ, testimonials (placeholders OK
  on day-1)
- `js/main.js` — booking form posts to
  `/api/clients/NEW_SLUG/bookings`. Calculator pricing matrix.
- `css/styles.css` — color palette + brand tokens

### 8. Bookings API + admin (~20 min)

Copy:

- `src/app/api/clients/olympic-inspections/bookings/route.ts` →
  `src/app/api/clients/NEW_SLUG/bookings/route.ts`
- `src/app/api/clients/olympic-inspections/slots/route.ts` →
  `src/app/api/clients/NEW_SLUG/slots/route.ts`
- `src/app/api/clients/olympic-inspections/slots/public/route.ts` →
  `src/app/api/clients/NEW_SLUG/slots/public/route.ts`
- `src/app/api/clients/olympic-inspections/affiliates/...` (full dir)
- `src/app/clients/olympic-inspections/admin/page.tsx` →
  `src/app/clients/NEW_SLUG/admin/page.tsx`
- `src/app/clients/olympic-inspections/admin/login/page.tsx` →
  `src/app/clients/NEW_SLUG/admin/login/page.tsx`

Replace every `olympic-inspections` constant + `Olympic Inspections`
display name. The booking PATCH already pulls from the inspection-
clients registry for the confirmation email — no copy edits needed
there.

### 9. Affiliate scout cron (1 line in vercel.json)

Add to `vercel.json` `crons[]`:

```json
{
  "path": "/api/cron/partner-scout?slug=NEW_SLUG",
  "schedule": "0 14 * * 1"
}
```

If the generic `/api/cron/partner-scout` route doesn't exist yet,
clone `/api/cron/oit-partner-scout/route.ts` and parameterize it on
`?slug=` so all inspection clients share one route.

### 10. Middleware whitelist (1 file)

Add the new slug's public POST routes to `src/middleware.ts`
`PUBLIC_API_PATHS` (booking + slots/public). Same pattern as OIT.

### 11. Smoke test (15 min)

- Visit `/clients/NEW_SLUG/admin/login` → sign in with the seeded
  password
- Click "Pre-fill 30 days" on Calendar tab
- Submit a test booking from the public site
- Verify owner alert email arrived
- Verify booking → `client_leads` row + funnel runner picks it up
- Flip booking to "confirmed" → customer gets confirmation email
- Open `/dashboard/automation-digest` (or just `/dashboard` overview)
  and verify the heartbeat from `partner_scout_NEW_SLUG` shows up

## Don't

- **Don't fork the bookings PATCH email body.** Use
  `renderBookingConfirmationEmail()` from `inspection-clients.ts`.
  All per-tenant copy lives in the registry config.
- **Don't add a new audience type to `ClientLeadAudience`** unless
  the new client genuinely needs a NEW audience. Reuse `homeowner`,
  `realtor`, `insurance` for any inspection-style biz when possible
  — the funnel + ads infra is already wired for those three.
- **Don't hardcode the new slug across the codebase.** Every place
  OIT was hardcoded should now read from the registry. If you find
  something that doesn't, add it to the registry instead of forking.
- **Don't ship without DKIM + Twilio.** Both are on the standing setup
  tasks. The system runs without them but spam-rate is elevated +
  SMS sends silently skip until they're provisioned.

## When this is useful

- New inspection-style client signs the AI Package
- Existing client gets acquired or rebrands (e.g. Pine & Particle →
  Olympic Inspections — same playbook, just with the existing slug
  carried forward)
- Building a mock for a sales call (run steps 1-5 only — the public
  site + bookings API can come post-close)

## Sources / reference

- `docs/playbooks/inspection-client-onboarding.md` — long-form version
- `src/lib/inspection-clients.ts` — registry source-of-truth
- The OIT directory tree (every file we'd be cloning lives there):
  - `src/lib/client-funnels/olympic-inspections.ts`
  - `src/lib/client-ads/oit-creatives.ts`
  - `src/app/clients/olympic-inspections/`
  - `src/app/api/clients/olympic-inspections/`
  - `public/sites/olympic-inspections/`
