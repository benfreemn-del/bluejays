# Domain registrar audit

> Generated 2026-05-06 from the codebase. Source files cited per row.
> Re-run by grepping `middleware.ts` (custom-domain map) and
> `client-site-urls.ts` (per-client site map) any time a new client
> goes live.

The point of this doc is: **never lose a client because a domain
auto-renewal failed silently.** Every domain that BlueJays owns or
points DNS at must show up here, with a known registrar + expiry +
2026 owner-of-record (you, Ben, on a personal credit card — flagged
to migrate to a business card once the business bank lands).

---

## 1. BlueJays-owned production domain

| Domain | Use | Wired in code | Registrar | Expiry | Auto-renew |
|---|---|---|---|---|---|
| **bluejayportfolio.com** | Main marketing site, audit funnel, client-portal host, partner program | hard-coded as `SITE_ORIGIN` fallback (`src/app/partners/work/page.tsx:31`), referenced ~10 places | **[FILL — Namecheap?]** | **[FILL]** | **[FILL]** |

**Critical:** This is the cookie domain for `bj_partner_ref`
(`src/lib/partners.ts:10`). If it lapses, every partner attribution
breaks AND every audit URL 404s simultaneously. Flag it as the #1
domain to never let auto-renew fail on.

**Action items:**
- [ ] Confirm registrar account login is in your password manager
- [ ] Confirm 2-year auto-renew is on (not 1-year — gives you a grace
      window if a card expires)
- [ ] Confirm registrar email = your primary email (not an alias that
      could break)
- [ ] Add expiry date to the BusinessSetupChecklist as a recurring
      annual reminder

---

## 2. Client-owned domains where BlueJays controls DNS

These are domains the **client** owns at their own registrar, but
where the DNS A/CNAME record points at Vercel (where this Next app is
hosted). If the client lets their domain lapse, the client's site dies
— BlueJays is not liable, but you need a heads-up so you don't get
blamed.

| Client | Domain | DNS target | Wired in code |
|---|---|---|---|
| Hector Landscaping & Design | **hectorlandscaping.com** | Vercel (CNAME → this Next app) | `src/middleware.ts:180` (custom-domain rewrite to `/clients/hector-landscaping`) |

**Action item:**
- [ ] Email Hector once a year (set a calendar reminder for the month
      before his domain expires) — "your domain is expiring next month,
      log into [his registrar] to renew."

---

## 3. Client-owned domains, BlueJays-hosted on a sub-path

These clients' production sites live under `bluejayportfolio.com/sites/{slug}/`
(static HTML) — they don't have their own apex. Listed for completeness
so you remember which static folders exist on YOUR domain.

| Client | URL | Lives at |
|---|---|---|
| Lewis County Autism Coalition | `bluejayportfolio.com/sites/lcac/` | `public/sites/lcac/` |
| Olympic Inspections & Testing | `bluejayportfolio.com/sites/olympic-inspections/` | `public/sites/olympic-inspections/` |
| Pine & Particle Co. (legacy, pre-rebrand) | `bluejayportfolio.com/sites/pine-and-particle/` | `public/sites/pine-and-particle/` |

These rely entirely on bluejayportfolio.com staying alive — see #1.

---

## 4. Internal showcase clients (no domain yet)

These clients have a built site under `/clients/{slug}` but no apex
domain wired to it. Sales-call demo URLs only. When any of these flip
to "live", they move into category #1 or #2.

From `src/lib/client-site-urls.ts`:

- `zenith-sports` → `/clients/zenith-sports`
- `itc-quick-attach` → `/clients/itc-quick-attach` (preview for tomorrow's 10 AM PST sales call)
- `ps-reiki` → `/clients/ps-reiki`
- `heale-counseling` → `/clients/heale-counseling`
- `tacos-yum` → `/clients/tacos-yum`
- `wholme-naturopathy` → `/clients/wholme-naturopathy`
- `greatminds-ae` → `/clients/greatminds-ae`
- `riv-inc` → `/clients/riv-inc`
- `visit-marfa` → `/clients/visit-marfa`
- `mountain-view-landscape` → `/clients/mt-view-landscaping`
- `consulting` → `/v2/consulting`
- `meyer-electric` → no entry in `client-site-urls.ts` yet (currently
  rendered inline at `src/app/clients/meyer-electric/page.tsx`)
- `laser-lakes` → no entry in `client-site-urls.ts` yet (rendered at
  `src/app/clients/laser-lakes/page.tsx`)

**Action item:**
- [ ] When ITC closes the $10,000 deal, decide: do they want
      `itcquickattach.com` → Vercel CNAME (we control DNS) or do they
      want their existing domain pointed at us? Add a row to category
      #2 either way.

---

## 5. Domains we should NOT own but might

If a previous Vercel deploy or onboarding script auto-purchased a
domain, it's probably parked + auto-renewing on your card. Things to
search for in your Namecheap / GoDaddy / Vercel-domains account:

- `bluejays.app`, `bluejays.io`, `bluejaybusiness.com`
- `tekkysports.com`, `zenithsports.com` (pre-rebrand)
- `pineandparticle.com` (pre-rebrand of Olympic Inspections)
- Any other client pre-rebrand domains

**Action item:**
- [ ] Log into every registrar account you've ever used. List every
      domain. Anything you don't recognize → release on next expiry
      (not auto-renew).

---

## 6. Renewal calendar (fill once, then add to BusinessSetupChecklist)

Once you've filled in expiries above, populate this table and set a
calendar reminder 30 days before each expiry. Same registrar can mass-
renew all in one transaction.

| Month | Domain | Estimated renewal cost |
|---|---|---|
| **[FILL]** | bluejayportfolio.com | ~$15/year |
| | | |

Total annual domain spend (BlueJays-owned, today): **[FILL once #1 is
known]**. This number rolls into `recurring_costs` table once you
move to per-client cost attribution (see Part 5 of the ITC plan).

---

## 7. Bus-factor mitigation

If you (Ben) get hit by a bus, the next person needs:

1. Login to the registrar that holds bluejayportfolio.com
2. Login to the Vercel team that has the deploy
3. Login to Supabase (where the cookie domain is referenced)
4. Login to whoever holds Hector's DNS (probably his own GoDaddy/Namecheap)

Document the first three in your password manager with the family-
emergency tag. The fourth is on Hector — out of scope.

---

## TL;DR follow-ups (most-impactful first)

1. Fill in the **[FILL]** rows in section 1 (your own domain — should
   take 2 minutes in your registrar dashboard)
2. Add bluejayportfolio.com expiry as a recurring annual reminder in
   `BusinessSetupChecklist.tsx`
3. Email Hector once with the "renew your domain in [month]" reminder
4. Audit your registrar accounts for orphan domains (#5)
