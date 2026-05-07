# AI Package — Onboarding + Handoff Deliverable

The closeout package every AI Package client receives. This file is a
template — copy/paste into a Loom + email when you're ready to formally
hand off the system.

The build itself is governed by `AI_PACKAGE_PLAYBOOK.md`. THIS file is
the post-build "here's what you bought + what you need to do" doc.

## What you paid (3 ways to pay)

You picked one of three plans on the contract. Here's a quick refresh
in plain English:

- **Pay it all up front** — $9,700 one time. You save $300.
- **Three milestones** — $3,500 to start. $3,500 at day 30. $3,000 at
  day 60. $10,000 total.
- **Four quarters** — $2,500 today. Then $2,500 every 90 days. Stops
  on its own after the fourth payment. $10,000 total.

The Total Fee covers the build. After it's built, you can keep us on
for monthly support ($500–$1,000/mo). That part is optional. You can
cancel any time on 30 days' notice. Your system keeps running either
way — you own it.

## How many clients we take

Ben builds 30 sites a month. Of those, 10 spots are for the AI
Marketing System (this package). Once those 10 are full for the month,
new builds roll into next month's batch. No rushed work. If you got a
spot, you got a spot.

---

## Phase A — Frictionless Onboarding (Day 0–14)

The "we set everything up while you focus on your business" promise.

**What we ask for on Day 1:**

1. **Business email account access** (e.g. `info@yourbusiness.com`)
   With permissions to:
   - Receive verification emails
   - Sign up for new accounts on your behalf

   We use this to create the accounts you'll OWN by Day 30:
   - Twilio (SMS + voicemail infrastructure)
   - Google Ads
   - Meta Business Manager (if not already created)
   - Calendly (or your booking platform of choice)
   - SendGrid (for outbound email at scale)

   Why this matters: standing up these accounts yourself takes 4–8 hours
   of fragmented work — verification calls, billing setup, ad-policy
   reviews, DNS configs. We do it in one day, hand you the keys.

2. **Brand voice doc / Copy Vault** (if you have one — most clients
   don't, we build it in Phase 0.5)

3. **3 photos** for your showcase site (optional — we can use stock or
   your existing site assets)

4. **Phone number** you currently use for the business (to forward to
   the new Twilio number once provisioned)

That's it. Everything else is on us.

---

## Phase B — Subscription Decisions (Day 14–30)

While we're building, you choose your AI tier. You can ALWAYS upgrade /
downgrade later — no contracts, no penalties.

### Hyperloop (Auto-Optimization)

The system that watches your funnel + ad performance and auto-tunes them.

| Tier | $/mo | What you get |
|---|---|---|
| **Off** | $0 | Funnel + ads run as-coded. Manual edits only. |
| **Starter** | $99 | On-demand variant analysis. You hit "Analyze" → see winners + losers → implement manually. |
| **Pro** | $249 | Weekly auto-optimization. System retires losing variants, promotes winners, generates new ones for review. |
| **Elite** | $499 | Daily optimization + auto budget rebalancing across audiences/platforms. The full self-tuning system. |

**Recommendation by stage:**
- 0–3 months in: Starter ($99) — collect data first, optimize on demand
- 3–9 months: Pro ($249) — system has enough data to auto-tune weekly
- 9+ months: Elite ($499) — once you've scaled past $5k/mo ad spend

### Claude (AI Content Layer)

Powers AI features: reply suggestions, variant generation, audience detection.

| Tier | $/mo | What you get |
|---|---|---|
| **Off** | $0 | No AI features. Manual everything. |
| **Starter** | $49 | AI drafts reply suggestions for inbound leads. ~100 requests/mo. |
| **Pro** | $149 | + AI variant generation + AI-written weekly report narrative. ~500/mo. |
| **Unlimited** | $399 | Soft-cap unlimited usage. For high-volume clients. |

**Recommendation by stage:**
- Most clients: Starter ($49) — the reply drafting alone saves 3–5 hours/week
- Once you're running ads with multiple audiences: Pro ($149) — variant gen pays for itself

### How billing works

**Phase A (Day 0–30):** All subscriptions run on BlueJays accounts at no
extra cost. You're trialing the system.

**Phase B (Day 30+):** Two options per service:

1. **You take over billing.** We help you create your own Hyperloop /
   Claude / Twilio / etc. accounts. You pay each provider directly. We
   keep the system pointed at your accounts. Best long-term cost.

2. **Stay BlueJays-managed.** We bill you a flat monthly add-on for each
   service. Slightly more expensive but zero account management on your
   side. Best for owners who want true white-glove.

You can mix — e.g. own Twilio + own Google Ads + BlueJays-managed Claude.

---

## Phase C — Handoff (Day 30)

By this point, every system is live and producing leads. Here's what
gets handed over:

### What you OWN
- Your custom AI showcase website at /clients/{your-slug}
- Your owner portal at /clients/{your-slug}/portal — log in to see leads,
  reports, manage your own account
- Your domain (if we registered it for you)
- Your Twilio account (with the dedicated number)
- Your Google Ads account (with the campaigns running)
- Your Meta Business Manager (with the Pixel + ads)
- Your Calendly account
- Your Stripe account (if processing payments through us)

### What BlueJays MAINTAINS
- The application (`/clients/{your-slug}/*` codebase)
- The funnel engine (per-audience email + SMS + voicemail cadences)
- The ad creative library
- The affiliate pipeline
- The weekly performance reports
- The dashboards for both you (portal) and us (operator)
- Hyperloop analysis (if subscribed)

### Recurring billing
- $500–1,000/mo BlueJays AI Package recurring (the management layer)
- + Hyperloop tier you chose (paid to BlueJays)
- + Claude tier you chose (paid to BlueJays OR direct to Anthropic)
- + Direct ad spend to Meta + Google (you control the budgets)
- + Twilio pay-per-use (~$0.0083/SMS, $1/mo per number)

---

## Phase D — Your Owner Portal

You can log in 24/7 at:

  **https://bluejayportfolio.com/clients/{your-slug}/login**

Or hit the subtle "·" in your site footer next to "Site by BlueJays" —
that's your secret entry.

Three tabs once logged in:

1. **Leads** — every form submission, with one-tap email/call/text,
   audience tag, funnel status. Flip leads to paused / responded /
   converted as you handle them.

2. **Weekly Report** — same data your operator (Ben) sees. Total leads,
   new this week, response rate, conversion rate, audience breakdown,
   highlights, suggested next moves.

3. **Account** — change your password, see last login.

You'll get a weekly report email every Monday at 14:00 UTC summarizing
everything.

---

## Phase E — When something goes wrong

**Email** bluejaycontactme@gmail.com — Ben personally responds within
one business day.

**Funnel paused itself unexpectedly?** Hit "Run funnel" in the leads
dashboard — it kicks off the engine manually.

**Lead replied but didn't get marked responded?** Check the lead detail
drawer in the portal — the inbound message may not have matched. Tag
it manually with the "Responded" status.

**Ad performance dropped?** If you're on Hyperloop Pro/Elite, the system
will auto-flag in your Insights tab. If on Starter, hit "Run analysis"
in your operator dashboard.

---

## Future-state add-ons (Sprint 5+)

When you're ready to scale further:

- **A/B test infrastructure** for funnel templates
- **Real Meta + Google performance sync** (live data into Hyperloop)
- **Affiliate auto-discovery** (programmatic outreach to your industry's
  category leaders)
- **Multi-language funnel content** (if you expand internationally)

Quote on request.

---

*This document is a living deliverable. Update + reshare on every major
phase shift. Last updated: 2026-05-04.*
