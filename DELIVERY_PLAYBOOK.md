# Post-Purchase Delivery Playbook

Everything that happens from the moment a prospect clicks "Buy" to the
moment their site is live. Written so Ben can plug-and-play: each step
lists who does it (Ben or the system), the tool, and the gate to clear
before moving on.

**Target turnaround:** Day 0 (purchase) → Day 2 (site live). Most customers
should be on their live domain within 48 hours.

---

## Stage 0 — Purchase lands

**Trigger:** Stripe `checkout.session.completed` webhook fires.

**What the system does (automatic, no Ben action):**

1. Marks the prospect `status = 'paid'` in Supabase (`prospects.paid_at` stamped).
2. Pauses the outreach funnel (`funnel_paused = true`) so no more pitch emails fire.
3. Creates the deferred $100/yr management subscription with a 1-year trial
   (first charge on Day 365).
4. For 3×$349 installment plans: patches the Stripe subscription with
   `cancel_at = now + 92 days` so it auto-ends after 3 charges.
5. Sends Ben a SMS via `alertProspectPaid()` + a detailed HTML email to
   `bluejaycontactme@gmail.com`.
6. Sends the **welcome email** to the customer (from `ben@bluejayportfolio.com`)
   pointing them at `/onboarding/[id]`. Idempotent via
   `prospects.welcome_email_sent_at`.

**Ben's action:** None. Just confirm the SMS + Ben payment email arrived.

**Gate to clear before moving on:** Prospect status flips to `paid` in the
dashboard. Stripe shows the payment in the Bluejay Business Solutions
account (not Benjamin Freeman — see CLAUDE.md).

---

## Stage 1 — Onboarding form submission

**Trigger:** Customer clicks the link in the welcome email and fills out
`/onboarding/[id]`.

**What the form collects:**
- Legal + DBA business names
- Owner name, title, phone, email, preferred contact channel
- Current domain (if any) + registrar + hosting situation
- Brand colors, logo (or request for Ben to design one)
- Full service list
- Service area (cities, zip codes)
- Social media handles
- Google Business Profile URL
- Real testimonials
- Theme preference (light/dark)
- Translation needs (Spanish, other languages)
- Year founded
- Additional features requested (booking system, live chat, etc.)
- Special requests / content notes

**What the system does on submit:**

1. Upserts into the `onboarding` Supabase table keyed by `prospect_id`.
2. Keeps prospect status as `paid` (doesn't change it).
3. Fires `alertOwner()` → Ben gets an SMS: *"[Business] just submitted
   onboarding! Time to build. Open: /lead/[id]"*.

**If the customer hasn't submitted within 30 minutes of paying:**
The `/api/onboarding-reminders/process` cron (runs every 5 min) sends a
single reminder email pointing them back at the form. Idempotent via
`prospects.onboarding_reminder_sent_at`.

**Ben's action:** Open `/lead/[id]` in the dashboard. Read through every
answer. Make a mental inventory of:
- Does the brand color they gave you match a V2 template accent? If no,
  plan to patch `scrapedData.accentColor` on the generated site.
- Do they have a logo? If yes → download it, trace to SVG if needed,
  slot it into the nav. If no → plan text logo using the category font.
- How many real photos? Under 3? → plan to use high-quality stock in the
  gallery slots.
- Any custom features requested (booking, chat, language toggle)?
  Triage: in-scope for $997 (add) or out-of-scope (note + follow up).

**Gate to clear:** You have a clear picture of what needs to change from
the V1 preview to the final site. Write it down as `adminNotes` on the
prospect if it's complex.

---

## Stage 2 — Customize the site (target: 4-8 hours of work, max 48 hours wall time)

**Order of operations — keep this list in order, don't skip ahead:**

1. **Extract real brand color from their live site (if they have one).**
   Open their URL in Chrome DevTools. Check `<meta name="theme-color">`,
   then common buttons/links for `background-color`. Paste the hex into
   `scrapedData.accentColor` via the dashboard PATCH flow.

2. **Pull their real photos.** Their Google Business Profile + their
   current website are the goldmine. Use the scraper or manually grab:
   - 1 hero-quality exterior or team shot
   - 1 interior/at-work shot for about
   - 3-5 gallery photos (real jobs, real customers, real work)
   - Their logo (separately, not as a photo)

3. **Regenerate** via `/api/generate?id=[id]&force=true`. The generator
   auto-merges new photos with existing `scrapedData.photos` (won't
   overwrite manually curated ones).

4. **Verify in Chrome** — open `/preview/[id]`. Desktop + mobile (DevTools
   responsive 375px). Check:
   - Brand color applied everywhere (nav, buttons, accents)
   - Logo in nav (not text-only fallback)
   - Real photos in hero, about, gallery — no generic stock
   - Real services with descriptions (not category filler)
   - About text mentions owner name + city
   - Real phone + clickable `tel:` link
   - Address is a clickable Google Maps link
   - Gallery has at least 3 unique images, none repeat across hero/about
   - Hero text readable on top of background image
   - No `initial={{ opacity: 0 }}` blocking content

5. **QC pass** — run `/api/qc/review/[id]` from the dashboard. Score must
   be 70+ with zero Instant Fail gates (broken images, duplicates, wrong
   city, placeholder testimonials). If fail → fix, regen, re-QC.

6. **Manual visual review** (Ben) — side-by-side compare with the V2
   showcase at `/v2/[category]`. It should feel AT LEAST as premium. If
   not, keep iterating.

**Gate to clear:** Preview at `/preview/[id]` is indistinguishable from
the `/v2/[category]` showcase in quality level, except it has THEIR real
data baked in.

---

## Stage 3 — Customer review + approval

**What Ben does:**

1. Email the customer from `ben@bluejayportfolio.com`: *"Your site's
   ready for review — take a look at [preview URL] and let me know if
   anything needs adjusting. Reply or text me at [number]."*
2. Give them 24-48 hours to respond.
3. If they request changes: make them, push, reply to confirm when live.
4. If they approve: move to Stage 4.

**Common change requests to expect:**
- "Can you swap this photo?" → 5-min fix via the image mapper tool.
- "My hours are wrong." → dashboard PATCH, regen.
- "Can you add [service]?" → dashboard edit, regen.
- "The color is too bright/dark." → adjust `accentColor`, regen.
- "Can we change the tagline?" → edit in the generator output, regen.

**Gate to clear:** Customer explicitly says "looks great, go ahead."
Screenshot the message if it's over text/email so there's a record.

---

## Stage 4 — Domain + hosting setup

**If the customer already owns a domain:**

1. Ask for their registrar login OR have them update their DNS themselves
   (send DNS instructions — A record → Vercel IP `76.76.21.21`, or CNAME
   pointing to `cname.vercel-dns.com`).
2. In Vercel, add the domain under the `bluejays` project → Domains.
3. Verify HTTPS is live (Vercel provisions Let's Encrypt automatically).
4. Test the live domain in incognito — confirm site loads, preview/claim
   pages are NOT linked from the public version.

**If the customer needs a new domain:**

1. Search their preferred name (from onboarding form) in a registrar
   (Namecheap, Name.com, Google Domains). Prefer `.com`; fallback `.net`,
   `.co`, `.us`.
2. Register under Ben's account — $10-15/yr absorbed by the $100/yr
   management fee.
3. Add to Vercel, same as above.

**Finalize site — remove preview markers:**

1. Create a new "production" generated site entry in Supabase pointing
   at the same data but accessed through the custom domain.
2. Remove the "Preview — images and content will be customized" banner
   (lives on the preview page, not the live site — double-check).
3. Remove any floating "Claim this site" CTA (only on `/preview/[id]`,
   not on the live domain).

**Gate to clear:** Customer's domain loads the site over HTTPS. No
"Preview" or "Claim" CTAs visible. Meta tags show their business name.

---

## Stage 5 — Handover

**What Ben does:**

1. Send the "you're live" email with:
   - Live URL
   - Short Loom walkthrough (2-3 min) showing them the site on mobile +
     desktop
   - Instructions for requesting changes ("reply to this email or text
     me — I'll turn around updates within 48 hours")
   - Reminder that the $100/yr management fee starts on their 1-year
     anniversary (Stripe auto-bills — no action needed from them)

2. Tag the prospect as `deployed` in the dashboard.

3. If they agreed to a testimonial/case study: schedule a 10-min call in
   ~2 weeks to grab a quote + screenshot.

**Gate to clear:** Customer confirms they received the handover email
and the site looks right. Status = `deployed`. Done.

---

## Ongoing — Management subscription

- Day 365: Stripe auto-charges $100 via the deferred mgmt subscription.
- Covers: domain renewal, hosting, ongoing minor edits, ongoing support.
- Major redesigns are scoped separately (quote as a fresh project).
- If the customer cancels the mgmt sub early: retain the site but warn
  that domain renewal + hosting will stop at the next renewal cycle.

---

## Reference — Tables + columns touched

| Table | Column | Set by |
|-------|--------|--------|
| `prospects` | `status = 'paid'` | Stripe webhook |
| `prospects` | `paid_at` | Stripe webhook |
| `prospects` | `funnel_paused = true` | Stripe webhook |
| `prospects` | `stripe_customer_id` | Stripe webhook |
| `prospects` | `subscription_status = 'active'` | Stripe webhook |
| `prospects` | `mgmt_subscription_id` | Stripe webhook |
| `prospects` | `welcome_email_sent_at` | Stripe webhook (idempotency) |
| `prospects` | `onboarding_reminder_sent_at` | Reminder cron (idempotency) |
| `onboarding` | new row | `/api/onboarding/[id]` POST |

## Reference — Endpoints + crons

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/webhooks/stripe` | inbound | Payment handler — welcome email, mgmt sub, alerts |
| `/api/onboarding/[id]` | inbound | Saves form submission, alerts Ben |
| `/api/onboarding-reminders/process` | `*/5 * * * *` | Sends 30-min reminder to stragglers |
| `/api/funnel/run` | `0 8 * * *` | Daily outreach (pre-purchase only) |
| `/api/replies/process` | `* * * * *` | AI reply queue (pre-purchase only) |

## Reference — Troubleshooting

**Welcome email didn't send.** Check `prospects.welcome_email_sent_at` —
if NULL, the webhook failed or SendGrid was down. Resend manually via
the dashboard. If set but customer says they didn't get it, check spam +
verify their email matches Stripe's `customer_email`.

**Reminder fired too early.** The cron uses `paid_at <= now - 30min`. If
a customer submits onboarding in under 30 min, the reminder is skipped
(cron excludes anyone with a row in `onboarding`).

**Stripe webhook not firing.** Verify:
- Webhook endpoint is registered in the **Bluejay Business Solutions**
  Stripe account (not Benjamin Freeman)
- `STRIPE_WEBHOOK_SECRET` on Vercel matches the endpoint's signing secret
- `STRIPE_SECRET_KEY` on Vercel is from the same account
- Event logs in Stripe show delivery attempts (not just "pending")

**Onboarding form 404.** The page is at `/onboarding/[id]` — verify the
prospect ID in the URL matches a real row in `prospects`. Ben can open
it directly via the dashboard's "View onboarding" link per prospect.

**Customer wants changes after domain goes live.** Not a problem — edit
in the dashboard, regen, redeploy. Vercel's static cache invalidates on
the next build. Let customer know it may take 1-2 min to propagate.
