# Tekky walkthrough — 2026-05-13 @ 10:00

Founders: **Paul Hanson** + **Philip Lund**
Portal: **https://bluejayportfolio.com/clients/zenith-sports/login**

This is the **backend tour** — Step 2 of the $10k AI System sales ladder.
Goal: Paul + Philip see the gap between "a website" and "a sales system."

---

## ✅ Pre-meeting DB prep — DONE

Applied 2026-05-12 via migration `zenith_walkthrough_prep_2026_05_13`.

- Paul + Philip `failed_attempts` reset to 0 (were sitting at 1)
- All 6 subscription rows live (claude=pro/$149, hyperloop=none/$0,
  twilio/sendgrid/meta-ads/google-ads seeded)

You can verify if you want (Supabase SQL editor):
```sql
SELECT service, tier, status FROM client_subscriptions
WHERE client_slug='zenith-sports' ORDER BY service;
```

---

## ⚠ One pricing reconciliation still on you

I synced the handoff doc's Claude line to live config (**Pro $149**,
not the stale Starter $49 the doc had).

**Resolved 2026-05-16:** AI System is **$10,000 base price, 4
quarterly installments of $2,500 each**. Tekky is on the
4-installment plan (pay-in-full discount of $300 not applied). The
$2,500/mo recurring sub (sub_1TTcUrRuVfGvONwtu4l9SZY2) gets
cancelled in the Sunday cutover and replaced with a $2,500 one-time
Stripe Payment Link for Q1.

---

## Login as Paul or Philip (password-only, no email)

The portal login is **password-only** per your 2026-05-10 spec.
Whichever temp password matches an owner row for `zenith-sports`
logs in AS that owner.

- Paul → `tekky-walkthrough-paul-2026`
- Philip → `tekky-walkthrough-philip-2026`

**Test BEFORE the meeting** — open
https://bluejayportfolio.com/clients/zenith-sports/login in incognito
and try both. If either fails, run the emergency reset block in the
next section.

---

## 🆘 Emergency: password reset if login fails

If a temp password fails (likely cause: `CLIENT_PORTAL_SALT` env var on
Vercel is set to something other than the in-code default
`bluejays-portal-2026-default-salt`), do this:

**Option A — quick fix: copy the salt-correct hash from your own
working ben-test row** (you logged in successfully 2026-05-12, so
ben-test's hash is salt-correct). This temporarily makes Paul + Philip
share your test password — fine for the walkthrough, rotate after.

```sql
-- Copy your working ben-test hash to Paul + Philip.
-- They'll log in with whatever password matches ben-test (you know it).
UPDATE public.client_owners SET password_hash = (
  SELECT password_hash FROM public.client_owners
  WHERE email = 'ben-test@bluejayportfolio.com'
)
WHERE client_slug = 'zenith-sports'
  AND email IN ('paul@zenithsports.org', 'philip@zenithsports.org');
```

**Option B — set a fresh known password.** Run on a server that has
the LIVE `CLIENT_PORTAL_SALT` env var (Vercel CLI: `vercel env pull
.env.live`, then):

```bash
node -e "const c=require('crypto');const fs=require('fs');require('dotenv').config({path:'.env.live'});const s=process.env.CLIENT_PORTAL_SALT||'bluejays-portal-2026-default-salt';['tekky-walkthrough-paul-2026','tekky-walkthrough-philip-2026'].forEach(p=>console.log(p,'=>',c.createHash('sha256').update(p+s).digest('hex')));"
```

Then paste the two output hashes into:

```sql
UPDATE public.client_owners
   SET password_hash = '<PAUL_HASH>',
       failed_attempts = 0, locked_until = NULL
 WHERE email = 'paul@zenithsports.org';

UPDATE public.client_owners
   SET password_hash = '<PHILIP_HASH>',
       failed_attempts = 0, locked_until = NULL
 WHERE email = 'philip@zenithsports.org';
```

---

## The script (90-minute window)

### 0–5 min — open with the framing

> "The website you saw is the storefront. What I want to show you
> today is what actually runs the sales engine behind it. The website
> is one of seven things this system does — and you're paying for the
> system, not the page."

### 5–25 min — Leads tab (this is the heart)

**⚠ DEMO PREP — audience tag coverage is uneven:**
- 986 total leads, but **only 82 are audience-tagged**
  (48 parent · 20 coach · 14 player · **0 club**)
- 904 leads have NULL audience_segment — they'll show with the
  default gray strip on the card. Looks empty if you scroll the
  raw list.
- **Lead the demo with the audience filter ON** — click the 🟡
  parent chip first, scroll the 48 results (all properly colored),
  then click 🔵 coach, 🟢 player. Skip 🟣 club (no data — frame
  as "club segment activates with Phase A institutional outreach").

**Show them:**
- "Almost 1,000 leads in the funnel system right now"
- Audience color strip — 🟡 parent · 🔵 coach · 🟢 player
  (Talk through the color-by-segment scan: "you see a wave of
  parents this week, you know to push parent creative")
- Cmd-K search — paste an ID, see the row, demo the speed
- Click any tagged lead → expand → show notes + history + the
  four touch actions (✉ email · ☎ call · 💬 text · ✕ dismiss)
- Bulk-select 5 tagged leads → toolbar appears → bulk "Log email"
  or bulk "Start funnel" — emphasize: "this is the operator
  surface, not a CRM you have to feed"

**Sell line:** *"Every parent that hits any of your touchpoints
shows up here within minutes. Not next week in a CSV. Now."*

**Audience-tag backlog item to surface as a future agenda:**
audience auto-tagger is in the AI Operator queue (week 1 skill).
Once Claude Pro is on, the 904 untagged leads get tagged
automatically. Frame this as a Phase A unlock, not a gap.

### 25–40 min — To-Do tab

**Show them:**
- ~25 active tasks (10 on you, 13 on them, 2 blocked)
- Filter by owner — "These 10 are mine, these 13 are yours, the
  blocked ones tell us where the bottleneck is right now"
- Bulk-actions: mark done, send back to Ben
- Walk through ONE of their pending items live so they get the
  feel: e.g. "Confirm authenticate email sends from zenithsports.org?"

**Sell line:** *"This isn't a Slack channel. You can see who's holding
the ball at every moment, and so can I. No 'I'm waiting on you' / 'I'm
waiting on you' weeks."*

### 40–55 min — Insights / Subscriptions panel

**Show them:**
- Claude Pro $149/mo (or Starter $49 — whichever you reconciled
  above) — frame it as "the AI gating: this is what unlocks the
  Reply Drafter and audience auto-detection skills"
- Hyperloop = Off — frame: "you don't need this yet. We'll flip it
  on once you're at 50+ leads/week and the data justifies optimization"
- Twilio, Meta Ads, Google Ads = Paused — frame: "Phase A stand-up,
  comes online once you give me access to your business email"

**Sell line:** *"This subscription model is the gear shift. We're not
trying to upsell you — we're trying to make sure you don't pay for
horsepower you don't need yet."*

### 55–70 min — Ads tab + AI Operator preview

**Show them:**
- Ads tab — 43 creatives across Meta + Google + Lob postcards (or
  whatever count is current — say "this is the library we'll iterate
  on weekly once you green-light Phase A")
- AI Operator tab — show the 5 mock skills:
  1. Lead Reply Drafter (week 1)
  2. Audience Detector (week 1)
  3. Drill of Week (LIVE — emphasize this is already shipping)
  4. Customer Save Agent (week 3)
  5. Lead Scorer (week 4)

**Sell line:** *"Each of these skills replaces an hour-per-week of
your time. Stacked, that's 5+ hours back to you. That's the actual
ROI calc."*

### 70–85 min — Their 5 walkthrough questions

Pulled from the existing onboarding doc — bring these up if Paul +
Philip don't:

1. Which of you is the primary portal user?
2. 4th audience added before Phase A, or stick with the 4?
3. Comfortable with temp passwords, or want fresh ones via Signal?
4. Twilio number preference — local Pacific NW or vanity?
5. When can Philip block 30 min to record the 3 voicemail templates?

### 85–90 min — close + next step

> "Two things to leave with: bookmark this portal URL, and change
> your passwords. I'll send you the onboarding-handoff PDF so you've
> got everything in writing. Phase A kicks off the moment you reply
> to that email with the access we discussed."

---

## Print/email this to them AFTER the meeting

The doc to send/print is
[`docs/clients/zenith-sports/onboarding-handoff.md`](onboarding-handoff.md).
Pre-edit the pricing rows to match what you reconciled above (see
the Pricing-Reference Sanity Check section).

You can convert to PDF with: `pandoc onboarding-handoff.md -o
zenith-tekky-handoff.pdf` (or just paste into the body of an email).

---

## Stuff I confirmed for you while you slept

- Portal route `/clients/zenith-sports/portal` exists + renders ✓
- Login route `/clients/zenith-sports/login` exists + renders ✓
- Owner rows for Paul + Philip exist in Supabase ✓
- 986 leads in the system, 75 enrolled ✓
- 41 client_tasks (16 done, 23 pending, 2 blocked) ✓
- Brand voice doc is intact ✓
- ben-test owner row works end-to-end (last login 2026-05-12 02:46) ✓
- TIERS uses `'none'` (not `'off'`) — pre-staged SQL above uses
  the correct value
- The in-repo migration file `20260510_zenith_owners_and_subscriptions.sql`
  has the wrong tier `'off'` AND would conflict on already-existing rows
  → don't run it. The staged SQL above is the corrected version.

## What's still on you in the AM

- **Test both temp passwords in incognito** at
  https://bluejayportfolio.com/clients/zenith-sports/login BEFORE
  the 10am meeting. Paul → `tekky-walkthrough-paul-2026`,
  Philip → `tekky-walkthrough-philip-2026`. If either fails, run
  the emergency reset block below. ⏱️ 60 sec.
- **Billing reconciled 2026-05-16:** $10,000 base in 4 installments
  of $2,500. Sunday cutover cancels the $2,500/mo sub and replaces
  with a one-time $2,500 Stripe Payment Link for Q1.
- **Daily habits** — LinkedIn post, IG post, 20 min warm outreach,
  affiliate replies, pipeline review. Don't skip Day 15. Demo prep
  is not an excuse — the habits run forever.

Total pre-meeting work: ~5 minutes.

Good luck. Make it rock.
