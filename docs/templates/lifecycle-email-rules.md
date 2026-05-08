# Lifecycle Email Template Rules (NON-NEGOTIABLE — locked 2026-05-08)

Sister doc to `outreach-email-rules.md` (cold) and `outreach-sms-rules.md`.
This file covers every email a paid customer (or post-purchase prospect)
receives across their lifecycle. Read on demand when editing
`src/lib/email-templates.ts` or any cron/webhook that dispatches a
non-outreach email.

**Why this exists:** the lifecycle rules were scattered across
`bluejays/CLAUDE.md` (Rule 38 / 39 / 40 / 41 / 42 / 44 / 45),
`outreach_drafter` SKILL.md, and the helper-by-helper docstrings in
`email-templates.ts`. Captured here as a single portable AI-readable
reference so any future skill (`lifecycle_email_drafter`,
`monthly_report_drafter`, etc.) can ingest it without re-deriving.
Same pattern Hormozi recommends (3-folder architecture) and Anthropic's
Claude Design uses (separate "design system" + "rules MD" + "specific
prompt"). Per AIOS principle 13.

---

## The shape every lifecycle email follows

```ts
export interface EmailTemplate {
  subject: string;        // < 60 chars, no emojis, no ALL CAPS
  body: string;           // plain text + line breaks; ≤ 80 words
                          // unless explicitly noted otherwise
  htmlBody?: string;      // optional — set ONLY for emails that
                          // render HTML (e.g. NPS button row)
  sequence: number;       // monotonic dispatch order
                          // (see Sequence Numbers section below)
}
```

Every helper returns this shape. Every dispatch goes through
`sendEmail()` in `email-sender.ts`. Every failed send queues a retry
via `email-retry-queue.ts` (3 attempts, exponential backoff 1h → 4h
→ 24h, then SMS Ben).

---

## Universal rules (apply to EVERY lifecycle email)

- **≤ 80 words in body** unless explicitly listed otherwise (only the
  Service Agreement handoff and AI Package onboarding email exceed
  this — see exceptions in the per-template section).
- **EXACTLY 1 link** in the body. The link points at whichever surface
  the email expects the customer to act on next (claim page · billing
  portal · upsell page · `/client/[id]` · NPS thanks page · etc.).
  No portfolio link as a "by the way." No Calendly link. No second
  CTA.
- **Pricing wording (Rule 1 of End-to-End Pipeline):** if pricing is
  mentioned, ALWAYS use the verbatim phrase
  *"$997 one-time includes custom website design, domain registration,
  and hosting setup"* and *"$100/year covers domain renewal, hosting,
  ongoing maintenance, and support."* Never abbreviate.
- **Personal sign-off** — `— Ben @ BlueJays`. Never `— Ben @ BlueJays,
  CEO`. Never `BlueJay Business Solutions LLC`. Never the corporate
  legal name.
- **Greeting** — `Hi {name}` where `name = prospect.ownerName?.split(" ")[0] || "there"`. Never `Dear`. Never `Greetings`. Never `Hello!`.
- **No banned phrases** (per `outreach-email-rules.md` § Banned phrases).
- **Subject** — short, descriptive, no emojis, no ALL CAPS, no spam
  triggers. Optimized for the inbox preview.

---

## Sequence numbers — registration

`sequence` is monotonic and groups templates by lifecycle phase. When
adding a new helper, register the next available number in the right
range and document it here so two helpers never share a sequence.

| Range | Phase | Examples |
|---|---|---|
| 0 | Referral / one-shot manual | `getReferralEmail` |
| 1-9 | Cold outreach + recovery | pitch, follow-ups, abandoned-checkout |
| 100-109 | Onboarding | welcome (100), 30-min reminder (101), Day-2 (102), Day-5 (103) |
| 200-209 | Lifecycle / mid-relationship | handoff (205), monthly report (206) |
| 210-219 | Renewal / billing | renewal-30 (210), renewal-7 (211), payment-failed (212), payment-failed-urgent (213), domain renewal (214), domain paused (215) |
| 220-229 | NPS + win-loss + upsell welcomes | NPS survey (220), upsell welcomes (221-224 per SKU) |

When in doubt: GREP the existing helpers in `email-templates.ts` and
pick the next free number in the matching range.

---

## Per-template rules

### Welcome email (sequence 100) — `getWelcomeEmail`

- **Trigger:** Stripe webhook `checkout.session.completed` on payment
  success ($997 standard / $30 free / $100/yr custom-tier setup).
- **Body:** thank you + onboarding link (`/onboarding/[id]`) + ETA
  for first proof + small footer "Need more? See add-ons →
  /upsells/[id]" (Rule 40).
- **Tone:** warm, concise. ≤ 80 words.
- **Banned:** "Hope you're enjoying your purchase" / corporate language.

### Onboarding reminders (sequence 101 / 102 / 103)

- **Trigger:** `/api/onboarding-reminders/process` cron at 17:00 UTC
  daily. Status thresholds gate which template fires:
  - 30 min post-purchase: `getOnboardingReminderEmail` (sequence 101)
  - Day 2 if `_onboardingStatus IS NULL OR step1_complete`:
    `getOnboardingReminderDay2` (sequence 102)
  - Day 5 if still incomplete: `getOnboardingReminderDay5` (sequence 103)
  - Day 10 if still incomplete: SMS Ben directly (NO email — manual
    intervention required)
- **Escalating subjects** — Day-2 = "Quick — need 5 min from you to
  start your site"; Day-5 = "Stuck? Reply and I'll handle the form
  for you" (manual offer per Rule 41).
- **Each links** to `/onboarding/[id]` (single CTA).

### Handoff email (sequence 205) — `getHandoffEmail`

- **Trigger:** dashboard manual fire when site goes live. Marks the
  finish line.
- **Body:** site is live · here's the live URL · upsell footer
  (Rule 40).
- **Exception to ≤ 80 words rule** — handoff is allowed to run
  longer because it's a one-shot landing-on-the-finish-line moment
  with multiple bits of info (DNS notes / how to request edits /
  upsell pointer). Cap at ~150 words.

### Monthly report (sequence 206) — `getMonthlyReportEmail`

- **Trigger:** `/api/reports/monthly/run` cron, 1st of each month.
- **NON-NEGOTIABLE per Rule 39:** body MUST contain real per-customer
  counts (leads, missed-call recoveries, 5-star reviews, appointments)
  pulled from `getCustomerMonthMetrics` in `customer-metrics.ts`.
  **Generic tips/advice are BANNED.**
- **Zero-activity customers** get the encouragement template ("Your
  site was up 100% of [month] — reply with one thing you'd like to
  try"), NEVER "0 leads, 0 calls, 0 reviews."
- **Always links** to `/client/[id]` so customers can see full
  details.
- **Contextual upsell suggestion** in body based on metrics: 0
  reviews this month → suggest Review Blast SKU; 0 leads → suggest
  GBP Setup SKU; otherwise → neutral "browse add-ons" line.

### NPS survey (sequence 220) — `getNpsSurveyEmail`

- **Trigger:** `/api/nps/send` cron at 16:00 UTC daily. Sends to
  paid prospects with `paid_at <= now() - 14 days` AND
  `nps_sent_at IS NULL` AND `status = 'paid'`. Stamps `nps_sent_at`
  on success.
- **Body:** 11 score links pointing at `/r/[code]/[score]`. When
  `ENABLE_HTML_PITCH_EMAIL=true`, renders as colored button row
  (red 0-6 / yellow 7-8 / green 9-10).
- **Day 14 is locked** (Rule 44) — measures stable opinion, not
  honeymoon excitement.
- **NEVER replace with NPS at Day 7 or Day 30.**

### NPS-triggered referral (sequence 0 manual / sequence 220 auto)

- **`getPromoterReferralEmail`** auto-fires when a customer scores
  9-10 on the NPS survey. Marks `referral_email_sent=true` so the
  Day-30 cron skips them.
- **`getReferralEmail`** (Day-30 cron `/api/referral/send`) ONLY
  fires for prospects whose latest `nps_responses.category ===
  'promoter'`. Passives + detractors are SKIPPED entirely (Rule 44).

### Renewal reminders (sequence 210 / 211)

- **Trigger:** `/api/billing/check-upcoming-renewals` cron at 16:00
  UTC daily. Finds active subscriptions with `current_period_end`
  ~30 days or ~7 days out.
- **Templates:** `getRenewal30DayEmail` (sequence 210) +
  `getRenewal7DayEmail` (sequence 211).
- **Friendly tone** — they are not late. Frame as a heads-up + the
  Stripe billing portal link if they want to adjust before charge.
- **Dedupe** via `renewal_reminders` table keyed on (prospect, sub,
  kind, scheduled_charge_at).

### Payment failed (sequence 212 / 213)

- **`getPaymentFailedEmail`** — friendly card-failed notice, sent
  on `invoice.payment_failed` webhook. Bumps
  `payment_failure_count` + SMSes Ben.
- **`getPaymentFailedUrgentEmail`** — escalation after 3 consecutive
  failures. Status flips to `at_risk`. Stripe billing portal link
  is the single CTA.
- **Reset:** on `invoice.payment_succeeded`, status flips back to
  `active` and `payment_failure_count` resets to 0.

### Domain renewal (sequence 214 / 215)

- **`getDomainRenewalChargedEmail`** — receipt-style, fires after
  successful Namecheap renewal.
- **`getDomainRenewalPausedEmail`** — fires when the domain renewal
  cron sees a `past_due` Stripe sub for the customer; we DO NOT pay
  $11 for an unpaid customer. Domain status flips to `renewal_paused`
  + grace-period countdown in the body + Stripe portal link.
- **Order of operations matters** — Stripe FIRST, registrar SECOND
  (see `bluejays/CLAUDE.md` Renewal Cron section).

### Upsell SKU welcome emails (sequence 221-224)

One per SKU. Fires from the Stripe webhook on
`checkout.session.completed` events with `metadata.upsell === "true"`.
All follow the universal rules above.

| SKU | Helper | Sequence | What the email asks for |
|---|---|---|---|
| `review_blast` | `getReviewBlastWelcomeEmail` | 220 | CSV of past customers' phone numbers (or magic-link self-serve) |
| `extra_pages` | `getExtraPagesWelcomeEmail` | 221 | The 5 page topics + photos/copy |
| `gbp_setup` | `getGbpSetupWelcomeEmail` | 222 | Admin access to existing GBP listing |
| `monthly_updates` | `getMonthlyUpdatesWelcomeEmail` | 223 | (subscription) — sets expectations + Stripe portal link |
| `database_reactivation` | `getDatabaseReactivationWelcomeEmail` | 224 | CSV/export of past customers + dormant leads |

When adding a 6th SKU: add to the `UPSELL_CATALOG` in `upsells.ts`,
write a matching helper, register it in
`pickUpsellWelcomeTemplate()` switch in
`/api/webhooks/stripe/route.ts`, add the type to the
`email-retry-queue.ts` union, and append a row here.

### Win-loss probe (sequence 0 — appended) — `appendLossProbe`

- **Not a standalone email** — appended to the `not_interested`
  farewell that the AI responder sends. Per Rule 45.
- **Three randomized phrasings** in `LOSS_PROBE_PHRASINGS` chosen
  deterministically by `prospect.id` hash (consistency for the
  prospect, variety across the base).
- **Idempotency** — `farewellAlreadyHasProbe()` detects whether the AI
  organically wrote a similar question + skips duplicate appending.
- **NEVER use the probe as a sales hook.** Phrasing is intentionally
  neutral ("help me improve" — never "let me try one more time to
  convince you").

### Cut-My-Agency calculator auto-email — `getCutMyAgencyPlanEmail`

- **Trigger:** `/api/cut-my-agency/submit` synchronous response.
- **Industry-aware** — picks a case-study line based on the
  `cma_industry` slug (manufacturer / industrial / vs default).
- **One link** to the calculated plan / preview surface.

---

## What never goes in any lifecycle email

- A booking link (Calendly etc.) — calls happen after they reply.
- Pricing language outside the verbatim phrases above.
- Generic tips/advice (Rule 39 — banned in monthly report; same
  spirit applies everywhere).
- More than 1 link.
- Sales pitch language inside a transactional email (welcomes /
  receipts / renewal reminders are NOT pitch surfaces).
- An emoji in the subject line. Body emoji is allowed sparingly when
  the moment warrants it — but `outreach_drafter` rules forbid them
  entirely; lifecycle is slightly looser.

---

## When AI generates a lifecycle email

Same 4-part skeleton as outreach (Role + Task + Rules + Output format),
plus inject:

1. **Brand context** — the per-client brand system file (when those
   exist; `aios/.claude/skills/client_brand_system/` is the seed).
2. **Voice corpus** (Rule 76) — Ben's voice rules + relevant
   high-performer excerpts.
3. **Email rules** — THIS file.
4. **Customer context** — the `Prospect` row + their per-month
   metrics if relevant.

Output format is always: `EmailTemplate` shape — `subject` /
`body` / optional `htmlBody` / `sequence` — ready to pass to
`sendEmail()` without further reshaping.

---

## Maintenance

When a new lifecycle email type ships:

1. Write the helper in `email-templates.ts` returning `EmailTemplate`.
2. Register the next free `sequence` number in the matching range
   (see Sequence Numbers section).
3. Add a row in this file under the right Per-template subsection.
4. Update `bluejays/CLAUDE.md` if the new email touches a numbered
   rule (e.g., new monthly-report variant → update Rule 39 reference).
5. If the email can fail at high volume, add the type to
   `email-retry-queue.ts` so the retry cron can drain it.
