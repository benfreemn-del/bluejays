# Zenith Sports / TEKKY® — Owner Portal Onboarding

For Paul Hanson + Philip Lund.

Live walkthrough + cutover: **Sunday 2026-05-17, 9am PT.**
Going live on: **tekky.org** (pending Paul's domain confirmation).

This is the doc Paul + Philip use as their portal reference. Print it,
email it, or bookmark it — everything they need to operate the cockpit
is in here.

---

## Your portal — bookmark this URL

**Portal URL:** https://bluejayportfolio.com/clients/zenith-sports/portal

**Login email:**
- Paul → `paul@zenithsports.org`
- Philip → `philip@zenithsports.org`

**Temporary password (change on first login):**
- Paul → `tekky-walkthrough-paul-2026`
- Philip → `tekky-walkthrough-philip-2026`

> ⚠ Change your password as soon as you log in. Click the avatar
> in the upper-right of the portal → "Change password."
> The temp password assumes you got it from Ben verbally or via
> a secure channel — never paste it into Slack or email.

---

## What each tab does

The portal is the cockpit. You'll spend ~80% of your time on
**Leads**. The rest is occasional check-ins.

### 🎯 Leads (the heart of it)
Every parent / coach / player / club inquiry that lands in your
funnel shows up here. Color-coded per audience:
- 🟡 **Amber** = Parent
- 🔵 **Cobalt** = Coach
- 🟢 **Lime** = Player
- 🟣 **Violet** = Club

**Per-lead actions:**
- Click any lead to expand notes + history
- Update status (new → enrolled → won / dismissed)
- Log an email/call/text touch
- Send a reply (drafted by AI Reply Drafter once Claude tier is on)

**Bulk actions:**
- Select multiple leads with checkboxes → toolbar appears at top →
  bulk-update status, bulk-log a touch, bulk-enroll/pause funnel

**Search:** Cmd-K (or `/`) anywhere on the page focuses the search
bar — search by name, email, phone, or paste an ID.

### 📋 To-Do
Your team's task list — what BlueJays owes you, what we're building,
what decisions you need to make. Each task has an owner (`ben` or
`client`) so it's clear who's holding the ball.

### 📣 Ads
Read-only view of your ad creative library: 43 creatives across
Meta, Google, and Lob postcards, broken down by audience. Stats
(impressions, spend, ROAS) populate once campaigns go live.

### 📊 Reports
Weekly auto-generated report (fires every Monday 14:00 UTC).
Pipeline value, leads by audience, top-performing ads, week-over-
week deltas.

### 🤝 Partners
Your affiliate partner roster. Once partners go live, this shows
their referral activity + commissions accrued.

### 🤖 AI Operator (preview)
Five AI skills that come online over the next 30 days:
1. **Lead Reply Drafter** (week 1) — drafts personalized email
   replies to parent inquiries in your voice. You hit send.
2. **Audience Detector** (week 1) — auto-tags new leads as
   parent/coach/player/club from message content.
3. **Drill of Week** (LIVE) — Tuesday 9am PT auto-broadcast to
   coach list. Picks one of 26 drills, ships it as an email.
4. **Customer Save Agent** (week 3) — re-engages leads who go
   dormant for 14+ days.
5. **Lead Scorer** (week 4) — ranks new inquiries by likelihood-
   to-buy so you respond to the hottest ones first.

The cards on the AI Operator tab are labeled "mock" today — that's
intentional. Once each skill ships, the label flips to "live."

---

## What's automated, what's not

**ON AUTOPILOT:**
- Weekly drill broadcast to coach list (Tuesday 9am PT)
- Funnel touches via email (parent 5-touch / coach 6-touch / player
  3-touch sequences) — fire automatically by day offset from when
  the lead enters
- Weekly report email to Paul + Philip (Monday 14:00 UTC)
- Lead inquiries via /clients/zenith-sports/portal contact form
- Map-based scout dispatch (Tekky Map → click county → cron picks
  it up Tuesday 14:00 UTC)

**STILL ON YOU (until Phase B handoff):**
- Reviewing AI-drafted replies before sending (week 1+)
- Calendly bookings (we'll wire your calendar after Phase A)
- Recording the 3 voicemail clips (script hints in your portal —
  18-24 sec each, casual founder voice)

**STILL ON BEN'S TEAM:**
- Ad creative iteration based on weekly performance data
- Hyperloop variant optimization once data warrants the upgrade
- Funnel copy tweaks (use the "+ Note" button on any funnel step
  to flag changes — Ben sees them within an hour)

---

## How feedback works

Anything you want changed in the portal — copy, layout, a missing
field, a broken link — use the in-portal feedback path:

1. **For funnel changes:** click "View funnel" on any audience card
   → "+ Note" button → type your note → Send. Ben gets it via SMS
   + email and ships within one business day.

2. **For everything else:** text or email Ben directly. Phone
   number was in your kickoff email; team email is
   `bluejaycontactme@gmail.com`.

---

## Brand-voice doc

Every email, SMS, ad, and AI-drafted reply that goes out in TEKKY's
name follows the locked voice rules at:

**`docs/clients/zenith-sports/brand-voice.md`** *(in your delivery package)*

Read the "Voice rules" + "Forbidden words" sections once. If you
notice copy drifting from this voice, flag it via the feedback
path above.

---

## Pricing reference

For your records — what you're paying for + when each piece bills:

| Service | Tier | Monthly | Status |
|---|---|---|---|
| AI System (BlueJays setup) | $10,000 | one-time | 4 quarterly installments of $2,500. Q1 due at launch (Sunday 2026-05-17). |
| Hyperloop (auto-optimization) | Off → Starter | $0 → $99 | recommend flip after 50+ leads |
| Claude (AI replies + drafting) | Pro | $149 | live from Phase A |
| Twilio (SMS + missed-call texter) | TBD | ~$10-30 | starts when number provisions |
| SendGrid (email delivery) | Starter | $0 | included in BlueJays setup |
| Meta Ads · Google Ads | TBD | ad spend only | starts Phase A account stand-up |

> **Pay-in-full discount:** $300 off the $10,000 program is available for
> clients who pay the full amount up front. Not applied on the
> 4-installment plan — Tekky is on installments.

**Tax breakdown:** Each $2,500 installment = ~$2,463 services + ~$37 WA
B&O tax reserve (1.5%). Total program = $9,850 services + $150 tax
reserve = $10,000. BlueJays remits the WA B&O tax directly to the
state — no extra charge to you.

**Installment schedule:**
- Q1 — $2,500 at launch (Sunday 2026-05-17)
- Q2 — $2,500 on 2026-08-17
- Q3 — $2,500 on 2026-11-17
- Q4 — $2,500 on 2027-02-17

Q1 is due before the DNS flips Sunday morning.

**When the build clock starts:** Phase A account stand-up and build
work begin the business day Q1 payment clears. This is standard for
engagements at this scope — keeps the launch timeline honest on both
sides and ensures your accounts aren't sitting half-provisioned while
an invoice is open. The 30-day onboarding window starts the moment
the first installment lands.

**Phase B handoff (target: 30 days post-launch):**
Account ownership transfers from BlueJays-managed → Zenith-managed
for Twilio, Google Ads, Meta Business Manager. You start paying
those vendors directly. BlueJays still operates them.

---

## Questions during the meeting

Bring these to the walkthrough so we're all aligned by close:

- Which of you is the primary portal user (Paul vs. Philip)?
- Do you want a 4th audience (e.g., "trainer" / "academy") added
  before Phase A launches, or stick with parent/coach/player/club?
- Are you comfortable with the temp passwords or want fresh ones
  generated and shared via signal?
- Twilio: do you want a local Pacific NW number or a vanity
  number? (e.g. `1-855-TEKKY-01` if available)
- Voicemail clips: when can Philip block 30 min to record the 3
  templates (script hints already locked)?

---

Last updated: 2026-05-15 ahead of 2026-05-17 launch (added Q1
installment schedule + tekky.org domain reference).
Maintained at: `bluejays/docs/clients/zenith-sports/onboarding-handoff.md`
