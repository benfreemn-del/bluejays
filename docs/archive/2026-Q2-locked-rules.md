# 2026 Q2 · Archived rules and plans

Sections moved out of CLAUDE.md on 2026-05-07 to keep the
always-loaded rules surface lean. Each section below was a
real, applied rule at the time it was locked — preserved here
verbatim for historical reference. NOT actively enforced unless
the rule was duplicated into the slim CLAUDE.md.

---

<!-- archived BEN'S HOME TODO LIST (updated 2026-04-22) -->

## ════════════════════════════════════════════
## BEN'S HOME TODO LIST (updated 2026-04-22)
## ════════════════════════════════════════════

---

### BLOCK 1 — MUST DO BEFORE FIRST EMAIL GOES OUT

- [ ] **Add `BEN_PHONE` env var on Vercel**: `BEN_PHONE=(253) 886-3753`
  - This shows up in every email signature and the claim page. Set it once, appears everywhere.

- [ ] **Run the email patch script** with your real Supabase credentials:
  ```
  SUPABASE_URL=https://[your-project].supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key] \
  npx tsx scripts/patch-prospect-emails.ts
  ```
  Adds emails to 8 prospects, moves Meyer Electric back to "generated".

- [ ] **Set up SendGrid domain authentication** (~20 min, one-time):
  1. SendGrid → Settings → Sender Authentication → Authenticate a Domain
  2. Enter `bluejayportfolio.com`
  3. Copy the 3 DNS CNAME records it gives you
  4. Add those records to your DNS (Vercel Domains or wherever bluejayportfolio.com lives)
  5. Click "Verify" in SendGrid once DNS propagates (~5-30 min)
  6. Vercel → Project Settings → Environment Variables → add `FROM_EMAIL=ben@bluejayportfolio.com`
  7. Redeploy

- [ ] **Set SendGrid Event Webhook**:
  - SendGrid → Settings → Mail Settings → Event Webhook
  - URL: `https://bluejayportfolio.com/api/email-tracking`
  - Enable: click, open, bounce, spam report

- [ ] **Approve prospects in dashboard** — review the pending prospects, approve the ones ready, funnel fires automatically.

- [x] **Stripe LIVE flip — DONE 2026-04-25**: see "Stripe LIVE Launch Procedure" section below for the full checklist run + post-launch monitoring.
- [ ] **Flip Namecheap to live** (still pending): remove `NAMECHEAP_SANDBOX=true` env var so domain registration goes against the production API. Verify with a `.com` availability check.
- [ ] **Flip Lob to live** (still pending): swap `test_pub_*` / `test_*` keys for `live_pub_*` / `live_*`. Verify with a postcard preview render. Unblocks the 21 queued postcards waiting on `/api/test-cohort/postcard-cron`.

---

### BLOCK 2 — CREDIBILITY (DO BEFORE SCALING TO 100+ EMAILS)

These are the things the code can't do for you. Without these, scaling outreach just means more people googling you and finding nothing.

- [ ] **Get 3 real paying clients first** — friends, family, a business you know personally. Charge $97 or free. The goal is testimonials, not revenue. Even one real client with a name and face is worth more than every line of copy on the claim page.

- [ ] **Create a Google Business Profile for BlueJays**:
  1. Go to business.google.com
  2. Create profile: "BlueJays Web Design" — Washington State
  3. Category: Web Designer
  4. Add your phone (253) 886-3753, website bluejayportfolio.com
  5. Ask your first 3 clients to leave you a Google review here
  This is what a skeptical business owner finds when they Google you. Right now there's nothing.

- [ ] **Add a short "About Ben" section to bluejayportfolio.com** — just your name, that you're local (Washington), and 1-2 sentences about why you do this. Business owners are buying from a person. Make it personal. A headshot helps.

- [ ] **Text or call Steadfast Plumbing**: (360) 797-2979 — no email found, but they're a warm prospect
- [ ] **Text or call Sequim Valley Electric**: (360) 681-3330 — same situation

---

### BLOCK 3 — FUNNEL IMPROVEMENTS (BUILT — NEED WIRING)

- [ ] **Add `BEN_PHONE` to Vercel env vars** — `(253) 886-3753` (see Block 1). Shows up in all emails automatically.

- [ ] **Set up Supabase tables for client features** (run in Supabase SQL editor):
  ```sql
  create table if not exists client_reviews (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    rating int not null check (rating between 1 and 5),
    feedback text,
    submitted_at timestamptz default now()
  );

  create table if not exists client_feature_configs (
    prospect_id text primary key,
    missed_call_config jsonb default '{}',
    updated_at timestamptz default now()
  );

  create table if not exists contact_form_submissions (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    customer_name text,
    customer_phone text,
    customer_email text,
    message text,
    service_requested text,
    submitted_at timestamptz default now(),
    sms_sent boolean default false,
    email_sent boolean default false
  );

  create table if not exists schedule_bookings (
    id uuid primary key,
    prospect_id text not null,
    business_name text,
    contact_name text,
    phone text,
    email text,
    slot_iso timestamptz not null,
    slot_label text,
    date text,
    notes text,
    status text default 'confirmed',
    created_at timestamptz default now()
  );
  ```

- [ ] **Test review funnel on your phone**:
  1. Open `bluejayportfolio.com/review/[any-prospect-id]`
  2. Tap 5 stars → should show Google review button
  3. Tap 3 stars → fill feedback → submit → you should get an email

- [ ] **Test scheduling modal**: open `bluejayportfolio.com/schedule/[any-prospect-id]` — should show a calendar, tap a date, pick a slot, fill in details, confirm. Check that you get an email/SMS.

- [ ] **Wire missed-call auto-texter for first paid client**:
  1. In Twilio: assign or buy a number for the client
  2. Set incoming call URL → `https://bluejayportfolio.com/api/missed-call/twiml/[prospectId]`
  3. Set status callback → `https://bluejayportfolio.com/api/missed-call/callback`
  4. PATCH `/api/missed-call/config/[id]` with `{ clientPhoneNumber: "+1XXXXXXXXXX" }`

- [ ] **Add ReviewRequestPanel to the ProspectDetail view** for paid clients — import from `src/components/dashboard/ReviewRequestPanel.tsx` and render it when `prospect.status === "paid"`.

---

### BLOCK 4 — GROWTH (LATER, AFTER FIRST 5 CLIENTS)

- [ ] **Lewis County Autism Coalition** — find the Claude session where you built it, bring the code in. Fix the mobile English→Spanish button.

- [ ] **Build a client dashboard at `/client/[id]`** — where paying clients can see their review stats, contact form submissions, and missed call logs. The reviews + scheduling system is already built; this is just a read-only UI over the data.

- [ ] **CSV uploader for review blast** — business owner pastes 50 past customer phone numbers, system sends review request SMS to all of them at once. Gets clients 20+ Google reviews fast. This is a major upsell.

- [ ] **Google Calendar integration** — let clients OAuth-connect their Google Calendar so bookings appear automatically. Right now it uses our custom slot system.

---

### BLOCK 5 — FULL SYSTEM ($10K) — MANUAL TASKS (updated 2026-04-30)

The Full System offer is built into the codebase (audit CTA hub, schedule page, agency landing page, email P.S. line, types). What's left is all manual work Ben does.

**STRIPE — Payment setup (do before first Full System sale):**
- [ ] Create a Stripe Payment Link for $9,700 paid in full: Product name "Full System — Full Payment"
- [ ] Create a Stripe Payment Link for the split deposit ($3,500): Product name "Full System — Deposit"
- [ ] Create a second split Payment Link for $3,500 at 30 days: Product name "Full System — Milestone 2"
- [ ] Create a third split Payment Link for $3,000 at 60 days: Product name "Full System — Final Payment"
- [ ] Set env vars `STRIPE_PRICE_FULLSYSTEM_FULL`, `STRIPE_PRICE_FULLSYSTEM_DEPOSIT`, `STRIPE_PRICE_FULLSYSTEM_M2`, and `STRIPE_PRICE_FULLSYSTEM_M3` on Vercel once price IDs are created
- Note: full payment = $9,700 (save $300); split = $3,500 + $3,500 + $3,000 = $10,000. Client chooses at discovery call. Email the chosen Payment Link manually; not self-serve checkout yet

**CALENDAR — Discovery call availability:**
- [ ] In your scheduling system, create a separate 30-minute block type for Full System discovery calls (vs. the 15-min website calls)
- [ ] Block at least 2 slots/week for discovery calls while volume is low
- [ ] When a prospect books via `/schedule/[id]?type=fullsystem`, the notes field pre-fills "Interested in The Full System" — look for that in your booking notifications

**DISCOVERY CALL AGENDA (use this every time):**
1. "Tell me what you're running now — ads, email, anything." (2 min — let them talk)
2. "What does a new customer look like for you and what's their average value?" (get the ROI math)
3. "Here's what the system looks like and why it's different from an agency…" (show the 10 components)
4. "The AI self-learning piece is what makes this different — it gets smarter every month without you doing anything"
5. "Here's the math on what you'd save vs. an agency…" (use the table on /agency)
6. "The way it works: $3,500 to start, $3,500 at 30 days, $3,000 at 60 days. Nothing's due until you've seen real progress."
7. Close: "Does this make sense for where you're at right now?"
- Key: Never pitch features. Pitch the outcome they told you they want in step 1 and 2.

**LEAD MAGNET — per business (Ben creates manually):**
- [ ] For each Full System client, identify what their best lead magnet is (quiz, checklist, guide, calculator, free estimate tool) based on their industry
- [ ] Build/write the lead magnet as part of onboarding (week 2 of delivery)
- [ ] Examples by category: dental → "5 Signs You Need to See a Dentist Before It Gets Expensive" PDF; electrician → "Is Your Panel Safe?" checklist; roofing → "Roof Age Calculator + Free Inspection"

**LOGO REVISION (Ben does manually):**
- [ ] When a Full System client has a weak logo, redesign in Canva or Adobe as part of onboarding week 1
- [ ] Deliver before site launch so everything is consistent
- [ ] Track in dashboard notes: "Logo revised: [date]"

**AD ACCOUNT SETUP — per Full System client (Ben does manually):**
- [ ] Create a NEW Google Ads account for the client (don't share accounts)
- [ ] Set up Google Ads conversion tracking tied to their website (form submit + call click)
- [ ] Create a NEW Meta Ads account or Business Manager sub-account for the client
- [ ] Set up Meta Pixel on their site (add prospectId to pixel events for tracking)
- [ ] Initial campaigns: 1 Google Search campaign (branded + category keywords) + 1 Meta awareness campaign
- [ ] Set AI/automated bidding from day 1 — the system learns faster with smart bidding enabled

**DASHBOARD TRACKING:**
- [ ] When a Full System prospect books a discovery call, manually flip their status to `fullsystem_inquiry` in the dashboard so they're tracked separately from $997 website prospects
- [ ] After close, create them as a new prospect with `pricingTier: "fullsystem"` so reporting is accurate

---

### BLOCK 6 — AGENCY-TARGETING AD CAMPAIGN (separate from main BlueJays campaign)

Landing page is live at `/agency`. This block covers the paid ad campaigns that target business owners currently paying agencies.

**The audience:** Business owners who are already sold on marketing (they're paying for it) but frustrated with their agency's results. These are the highest-intent prospects for the Full System — they don't need to be convinced marketing matters, just that there's a better way.

**GOOGLE ADS — Agency Replacement Campaign:**
- [ ] Create a new campaign: "Agency Replacement — Search"
- [ ] Destination URL: `https://bluejayportfolio.com/agency`
- [ ] Match type: Phrase and exact for high-intent, broad modified for discovery

**Google Ads keyword list (copy-paste into Google Ads):**
```
"fire my marketing agency"
"cancel marketing agency"
"marketing agency alternative"
"replace marketing agency"
"is my marketing agency worth it"
"marketing agency too expensive"
"marketing agency not working"
"ai marketing system small business"
"diy marketing system"
"stop paying marketing agency"
"marketing agency results"
"marketing agency cancel contract"
"better than marketing agency"
"affordable marketing agency alternative"
"cut marketing agency"
```

**Google Ads copy (3 headlines, 2 descriptions — mix and match):**
- Headline 1: Paying $4K/Month to an Agency?
- Headline 2: Replace Them for $10K — Once
- Headline 3: Custom AI Marketing System
- Headline 4: You Own It. Cancel Anytime.
- Headline 5: Google + Meta Ads + Email + SEO
- Headline 6: Built Custom. Not a Template.
- Description 1: Agencies charge $3–8K/month forever using cookie-cutter playbooks. BlueJays builds a custom AI system for your business. One setup. Yours to keep.
- Description 2: Stop renting. Start owning. Custom Google Ads, Meta Ads, email, text, SEO — connected and self-learning. Fraction of what you pay an agency.

**META ADS — Agency Replacement Campaign:**
- [ ] Create campaign: "Agency Replacement — Awareness"
- [ ] Destination: `https://bluejayportfolio.com/agency`
- [ ] Objective: Lead generation (drive to /audit or discovery call booking)

**Meta Ads targeting (set these in Ads Manager):**
- Age: 30–60
- Job titles: Owner, CEO, President, Founder, Principal, Director of Marketing
- Interests: HubSpot, SEMrush, Google Ads, Facebook Ads, Hootsuite, Mailchimp, marketing agencies, digital marketing
- Behaviors: Small business owners
- Location: Start with Washington, Oregon, Idaho (expand to all US once profitable)
- Lookalike: Upload your existing paid client emails as a custom audience → create 1% lookalike

<!-- Creative rewrite 2026-05-16 — ad-to-page-congruence fix.
     Prior version led with savings ("If you're paying an agency right
     now"). New /agency hero (rewritten same day) leads with the
     100-leads-in-90-days guarantee. Per landing_page_optimizer skill
     frameworks_video_03 chunk 15 — ad and hero must read like the same
     conversation. New copy leads with the guarantee (matches the hero
     headline verbatim) and retains the savings frame as proof in the
     body. Old copy preserved below in an HTML comment for reference. -->

**Meta Ads creative brief (give to a designer or build in Canva):**
- Format: Static image + short-form video (Reel)
- Hook text on image: "100 real leads in 90 days — for less than your agency's monthly retainer."
- Visual: Split screen — agency invoice ($4,800) on left, BlueJays summary ($750/mo) on right
- Body copy: "Agencies charge $3,000–$8,000/month for templates and rotating junior reps. BlueJays builds you a custom AI marketing system — Google Ads, Meta Ads, email, texts, voicemails, SEO — once. $750/mo all-in including ad spend. **Guaranteed 100 real leads in 90 days, or we keep working free.** You own everything. Cancel anytime."
- CTA: "See if you qualify" → /agency

**Video script (30-second Reel — record on phone, no production needed):**
"If you're paying a marketing agency right now, I want to show you something. [Show the math: $4,000 × 12 = $48,000/year] For $48,000 a year, they're running the same campaigns they run for every other client. Same templates. Same targeting. Junior reps who rotate every 6 months. **And guess what — no guarantee.** Here's what I do instead: I build you a custom AI marketing system — Google Ads, Meta Ads, email, texts, voicemails, SEO — all connected, all learning from your real customers. **100 real leads in 90 days, or I keep working for free.** You own it. Get your free audit at bluejayportfolio.com/agency."

<!-- ARCHIVED — pre-2026-05-16 ad copy (savings-led, did not match new
     hero). Kept here so future copy iterations can A/B against it.

     Hook text on image: "If you're paying an agency right now, read this."
     Body copy: "Agencies charge $3,000–$8,000/month. Same playbook for
       every client. You own nothing. BlueJays builds you a custom AI
       system — Google Ads, Meta Ads, email, text, voicemail, SEO. One
       setup fee. You own it forever. Cancel the monthly support
       anytime."
     CTA: "See how much you'd save" → /agency

     Video script line removed in 2026-05-16 rewrite:
       "One setup fee. You own it." (replaced with the guarantee line
       and "no guarantee" agitation per the same chunk 15 fix.)
-->


**Retargeting:**
- [ ] Once `/agency` has traffic, create a retargeting audience of everyone who visited `/agency` but didn't book a call
- [ ] Run a retargeting ad with social proof angle: "Other business owners who left their agency are seeing [X] results"
- [ ] Budget: $15–25/day on retargeting once main campaign is running

**Budget recommendation:**
- Test phase (first 30 days): $20/day Google + $20/day Meta = $1,200/month
- If one Full System client closes in month 1 ($3,500 deposit), ad spend is already 3× ROI
- Scale to $50/day per platform once you have 1 closed client

=======


---

<!-- archived Marketing Plan — Cold Outreach Without SMS (locked in 2026-04-20) -->

## Marketing Plan — Cold Outreach Without SMS (locked in 2026-04-20)

With SMS restricted to inbound opt-ins, the cold-outreach funnel relies
on email + voicemail only — which alone underperforms the
email+SMS+VM combo. These channels fill the gap and several convert
BETTER than SMS did. Ship in this order.

### Tier 1 — Highest impact

**1. Inline OG screenshot in pitch email (BUILT 2026-04-20, GATED OFF)**
- `EmailTemplate.htmlBody?` field added; `getPitchEmail` returns
  multipart text+HTML WHEN `ENABLE_HTML_PITCH_EMAIL=true` env var is set.
  HTML body embeds a clickable `<img>` of the prospect's thum.io preview
  screenshot above the link.
- `sendViaSendGrid` in `src/lib/email-sender.ts` accepts the optional
  `htmlBody` param and sends as multipart. Plain text stays as
  fallback for HTML-off clients.
- **Deliverability finding 2026-04-20 (live A/B test):** sending the
  multipart HTML+image pitch from a Day-5-of-14 warming domain to a
  brand-new Gmail inbox landed in SPAM every time. Same content as
  plain-text-only landed in Primary. Gmail's classifier treats
  HTML + inline image from unseasoned senders as commercial/promo
  material regardless of personalisation.
- **Gate:** HTML pitch is only built when `ENABLE_HTML_PITCH_EMAIL=true`
  on Vercel. Keep OFF during warmup. Turn ON only AFTER Day 14 of each
  domain's ramp, once the domain has reputation to absorb the HTML.
  Plan to A/B test primary-tab placement by flipping this on one
  domain at a time post-warmup.
- Shared helper: `getPreviewScreenshotUrl(prospectId)` returns the
  thum.io URL. Use it everywhere the screenshot is referenced (OG meta,
  email HTML, postcards) so cache keys stay consistent.
- **NEVER flip `ENABLE_HTML_PITCH_EMAIL=true` during warmup.** Every
  Spam/Promotions landing drags reputation. A single day of HTML
  sends to a cold inbox list can set warmup back 7+ days.

**2. Personalized video walkthrough pipeline (PARKED 2026-04-20 — post-launch)**

Status: All infrastructure wired, provisioned, and debugged through round 9
— still OOM-killing on Vercel Lambda at 3008MB memory + 4000px image cap.
The ffmpeg `split + 5x crop + concat` filter graph holds too much frame data
in memory simultaneously. Fixing requires rewriting `renderVideoFromPlan` to
stream segments sequentially to disk instead of parallel-processing in RAM.
Significant refactor — not worth the pre-launch risk.

**What's already in place (ready for post-launch pickup):**
- Browserless.io account provisioned with key on Vercel (paid, working)
- Supabase `generated-videos` bucket created (public, 50MB, mp4/webm)
- `BROWSERLESS_API_KEY` detected → `launchCaptureBrowser()` uses it
- ffmpeg auto-downloads to /tmp on cold start (no bundling issues)
- Screenshot capped at 4000px height (prevents most OOMs)
- Lambda memory bumped to Pro-max 3008MB
- `OPENAI_API_KEY` on Vercel working (TTS narration ready)
- `toAbsolutePreviewUrl` always prepends https:// (no more invalid URLs)
- Short codes backfilled for all 224 prospects
- Auto-generation wired into `enrollInFunnel()` — will kick in the moment
  rendering works

**The remaining blocker:** `renderVideoFromPlan` in `video-generator.ts` — the
  filter chain `[0:v]scale=W:-1,split=N...[concat]...` duplicates decoded
  frames N times in RAM. For 1440x4000 input, that's ~86MB per split × 5
  segments = 430MB + ffmpeg buffers + Node overhead. Sporadically OOM-kills
  on Vercel even at 3008MB. `SIGKILL` happens outside any try/catch so the
  client gets a generic Next.js 500 HTML page instead of our JSON error.

**Fix when revisited:**
1. Rewrite to process segments one at a time, write each to a tempfile, then
   `concat demuxer` the tempfiles into final output. Uses ~1/N the memory.
2. Alternative: call a dedicated video-service API (Shotstack $50/mo,
   Synthesia, HeyGen) — zero DIY debugging. Pass template + prospect data.
3. Interim workaround for high-value prospects: Ben records Loom videos
   manually (~5 min each). More personal than TTS anyway.

**Short-URL fact discovered along the way:** 224 prospects were missing
`short_code` in the DB. All backfilled via md5(uuid)[:8] — `/p/[code]`
route now resolves for everyone.
- `src/lib/video-generator.ts::launchCaptureBrowser()` detects
  `BROWSERLESS_API_KEY` and connects to Browserless.io via
  `wss://production-sfo.browserless.io/chrome?token=...&stealth=true`.
  Falls back to local @sparticuz/chromium for dev.
- Fixes the Vercel 250MB bundle limit that blocked video gen before.
- `enrollInFunnel()` already fires `generateProspectVideo()` async on
  every enrollment — no SKIP flag, no wiring changes needed. Once the
  env var is set, video gen runs automatically.
- `POST /api/videos/[id]` — manual trigger, synchronous, `maxDuration=300`.
- `GET /api/videos/[id]` — returns video URL when ready.
- Supabase storage bucket `generated-videos` created 2026-04-20,
  public, 50MB file-size limit, allows video/mp4 + video/webm.
- Output URL: appended to outreach via the existing `{videoUrl}`
  token in `email-templates.ts` (buildVideoBlock).
- **Action required before it runs:** Ben to provision Browserless.io
  account (7-day free trial, then $19/mo Starter = 10k sessions) and
  add `BROWSERLESS_API_KEY` to Vercel env vars in all three environments.
- Smoke test once key set:
  ```
  curl -X POST "https://bluejayportfolio.com/api/videos/{prospectId}" \
    -H "Authorization: Bearer $ADMIN_PASSWORD" -m 300
  ```
- Cost math: 1 video = 1 Browserless session ≈ $0.0019 on Starter plan,
  ~$0.30/video at full 100-per-day runs. Starter plan covers 10k videos/mo.

**3. Direct mail postcard pipeline (SCAFFOLDED 2026-04-20)**
- `src/lib/postcard-sender.ts` created. `sendPostcard(prospect)` sends
  via Lob API — renders HTML front (screenshot overlay) + back
  (handwritten-style note with QR + short URL).
- Gated by `isEligibleForPostcard()`: only fires for prospects with
  4.5+ star rating and 20+ reviews, protecting the ~$1.50 per-send cost.
- Cost logged via `logCost()` service=`lob_postcard` so the /spending
  dashboard tracks it.
- **Action required**: set env vars on Vercel:
  - `LOB_API_KEY` (start in test mode with `test_pub_...`, switch to
    `live_pub_...` when ready)
  - `LOB_FROM_NAME`, `LOB_FROM_LINE1`, `LOB_FROM_CITY`, `LOB_FROM_STATE`,
    `LOB_FROM_ZIP` — return address on every postcard
- **Wiring required** (not done yet): add a funnel step at Day 7 that
  calls `sendPostcard(prospect)`. Insert in `FUNNEL_STEPS` after email
  1 and before email 2.

### Tier 2 — Ship when Tier 1 is live

**4. LinkedIn outreach**
- Discover business owner's LinkedIn via Apollo.io API (~$30/mo) or
  manual search during review.
- Free-tier LinkedIn allows 15-20 connection requests/day.
- Template: "Saw your 5-star reviews in Sequim — built a website for
  you, happy to send the link if it is useful."
- Track connection responses in CRM as a new outreach channel.
- 100% compliant — no TCR, no CAN-SPAM, no DNC list overlap.

**5. Preview/claim page retargeting pixels**
- Install Facebook Pixel + Google Ads tag on `/preview/[id]` and
  `/claim/[id]`.
- When prospect opens preview, they enter a 30-day retargeting window.
- Spend $50-100/mo on brand-awareness retargeting ads across Meta +
  Google Display. Ambient exposure makes the eventual email/VM land
  warmer because "I have seen these guys before."
- Add to Privacy Policy: mention the retargeting pixel.

**6. Outbound voice calls (by Ben, not automated)**
- Voice calls are NOT under A2P 10DLC. TCPA + DNC list apply, but
  business-to-business voice is explicitly permitted.
- Script: "Hi, this is Ben from BlueJay. I built a website preview for
  [Business] — mind if I text or email you the link?" The ask flips
  them to inbound then legally SMS-eligible.
- Twilio outbound voice: $0.015/min. 100 calls/day ~ $5.
- Best for high-intent prospects (opened email, did not claim).

### Tier 3 — Nice-to-have adds

**7. "Text me back" form on `/preview/[id]`**
- Small widget at bottom: "Want me to text you when I am free? [phone]"
- Explicit opt-in captured then prospect becomes SMS-eligible.

**8. Chamber of Commerce / BBB data hook**
- Scrape chamber membership lists during extraction.
- Email opener: "Saw you are a Sequim Chamber member..." — zero cost,
  big local trust signal.

**9. Exit-intent modal on `/claim/[id]`**
- When cursor heads for close button, show: "Leaving without claiming?
  Want me to email the preview in 3 days as a reminder?"
- Captures lapsed interest.

**10. Automated warm-intro via shared LinkedIn connections**
- Scrape shared connections via Apollo. Mention 1 by name in email.
- Trust signal: mutual acquaintance reference.

### Implementation order (after May 1 launch)
1. Monitor inline-screenshot email performance (already live)
2. Provision Browserless.io then enable video pipeline (~$20/mo)
3. Provision Lob then enable postcard at Day 7 for 4.5+ star prospects
4. Add LinkedIn discovery to prospect enrichment (Apollo API)
5. Install retargeting pixels
6. Ship "text me back" widget on preview page

### Compliance + cost summary
| Channel | Legal basis | Cost per send | Shipped |
|---|---|---|---|
| Cold email | CAN-SPAM, unsubscribe link | ~$0 | ✓ |
| Inline screenshot in email | Same as above | ~$0 (thum.io free tier) | ✓ |
| Ringless voicemail | Drop law varies by state, generally OK | ~$0.10 | provider pending |
| SMS (inbound only) | TCPA express written consent via checkbox | $0.0075 Twilio | ✓ gate enforced |
| Outbound voice | TCPA B2B permitted | $0.015/min | manual |
| LinkedIn DM | Platform ToS only | $0 | pending |
| Direct mail postcard | No regulation | ~$1.20 | code ✓ / account pending |
| Personalized video | N/A (asset) | ~$0.30/video at Browserless | code ✓ / account pending |
| Retargeting ad | Pixel consent in privacy policy | ~$0.01/impression | pending |

---


---

<!-- archived Locked-In Rules — Session 2026-04-23 (post-launch hardening) -->

## Locked-In Rules — Session 2026-04-23 (post-launch hardening)

This section captures rules derived from bugs caught and patterns established
in the 2026-04-22/23 session. Every rule here prevents a real bug we shipped
or catches a pattern that took hours to discover. **Treat as non-negotiable
for future agents.**

### 1. Short URL Generation — NEVER build from UUID prefix

The `/p/[code]`, `/u/[code]`, and `/b/[code]` routes resolve by
`prospects.short_code`, which is `md5(id).slice(0,8)` — **NOT** the first 8
chars of the UUID. Those are two different values.

```ts
// ❌ WRONG — silently 404s for every prospect
const previewUrl = `${BASE_URL}/p/${prospect.id.slice(0, 8)}`;

// ✅ CORRECT
import { getShortPreviewUrl, getShortUnsubUrl, getShortBookUrl } from "@/lib/short-urls";
const previewUrl = getShortPreviewUrl(prospect);
```

**This bug shipped broken links for a week.** Every outreach email hit a 404
page until 2026-04-23. Any future outreach surface MUST use the helper — no
exceptions. The short URL helpers live in `src/lib/short-urls.ts`; extend
there if a new short route is added (e.g. `/c/[code]`).

### 2. Supabase Pagination — default cap is 1000, and it drops rows silently

PostgREST caps `.select("*")` at 1000 rows by default. There is no error, no
warning — rows past 1000 just vanish. The dashboard's Contacted/Approved
tiles shrank day over day for weeks because `getAllProspects()` was returning
the 1000 most recent and every new scout pushed an old contacted prospect off
the end.

**Rule:** Any `.select("*")` or `.select("X,Y,Z")` against a table that may
cross 1000 rows MUST paginate in 1000-row chunks with `.range(from, from + 999)`
until a short page returns. `getAllProspects()` in `src/lib/store.ts` is the
canonical example. Safety rail: abort after 50k rows (different conversation at
that scale — switch to server-side aggregate counts).

### 3. Image Proxy Allowlist — suffix matching for tenant-per-subdomain CDNs

Squarespace, Wix, and the like use one CDN domain for everyone. AWS
Cloudfront gives each tenant their own subdomain (`d14f1v6bh52agh.cloudfront.net`,
`d3abcdefg.cloudfront.net`, etc). When a prospect uses such a CDN, exact-
hostname allowlisting doesn't match anything.

**Rule:** `src/app/api/image-proxy/route.ts` has BOTH `ALLOWED_DOMAINS` (exact
hostname) and `ALLOWED_HOST_SUFFIXES` (suffix match via `endsWith`). When
adding a new image host, use suffix matching iff the subdomain is dynamic
per tenant.

Currently suffix-allowed: `.cloudfront.net`, `.amazonaws.com`. Add more
as prospects surface new CDNs.

### 4. Scraped Image URLs — copy verbatim, NEVER swap size segments

CDNs like Cloudfront pre-generate a per-variant hash in the URL. The URL
`.../DuCZykL4UDVfSxG8c9AH4OkkwZc=/fit-in/2800xorig/...` is signed for
`2800xorig`. Changing to `/fit-in/1600xorig/` with the same hash returns
**400 Bad Request**.

**Rule:** Scraped image URLs MUST be used verbatim from the source page's
HTML. Never fabricate resize variants. Never swap `800xorig` → `1600xorig`
etc. If you need a different size, scrape the page fresh to find the
variant with that size's real hash.

### 5. Deduplicate photos by underlying asset ID

Same underlying image at two different CDN resize variants counts as a
duplicate for rendering purposes — the template will render both and prospects
see the exact same photo twice. Templates consume `data.photos[0]` hero,
`[1]` hero-card, `[2]` about, `[2..9]` gallery — overlap in the indices
guarantees a duplicate if the array contains two sizes of the same image.

**Rule:** Prospect photos arrays MUST be de-duplicated by the underlying
asset ID (the path segment after `/uploads/` for Squarespace, or equivalent
opaque ID for other CDNs), not by full URL. One entry per underlying image.

### 6. PreviewImageGuard — retry proxied URLs once before falling back

Cloudfront returns transient 502s that resolve immediately on retry
(measured: 502 → 200 → 200 across 3 attempts, ~200ms apart). The old
`onErrorCapture` handler swapped to a stock Unsplash fallback on the first
error — permanently losing real photos to a 300ms CDN hiccup.

**Rule:** `src/components/preview/PreviewImageGuard.tsx` now retries proxied
URLs (those containing `/api/image-proxy`) ONCE with a 400ms delay and a
cache-buster query string before falling back. Bounded to 1 retry per image
so it can't loop. Don't remove this guard without replacing it with a
backoff-retry wrapper inside the image-proxy itself.

### 7. V2 Templates — category-specific color palette is mandatory

Every V2 preview template MUST have a `PALETTE` constant (4–6 harmonious
category-appropriate colors) plus a `pickPaletteColor(i)` helper, and MUST
rotate the palette through service/feature/ministry card icon tiles. The
single-accent-everywhere look reads templated the moment a prospect scrolls
past the fold.

**The pattern** (copied verbatim from V2ChurchPreview.tsx):

```tsx
const PALETTE = ["#hex", "#hex", "#hex", "#hex", "#hex", "#hex"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

// Inside the service/feature map:
{data.services.map((service, i) => {
  const tile = pickPaletteColor(i);
  return (
    <div ...>
      <div style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
        <Icon style={{ color: tile }} />
      </div>
      <span style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
      ...
    </div>
  );
})}
```

Brand accent (ACCENT / PRIMARY / GOLD / TEAL / whichever the template uses)
stays on section headers, CTAs, nav, stats — palette ONLY touches card-level
iconography. If a template has a second icon grid, use `pickPaletteColor(i + 2)`
offset so the two grids don't render the same color order.

Palettes should feel like the category. Tattoo = crimson + gold + ink. Florist
= rose + blush + sage. HVAC = sky + orange (hot/cold). Don't use gray/beige
in palettes (see existing "No Boring Colors Rule" above).

### 8. V2 Site Data — flexible optional fields (2026-04-23)

The V2 renderers honor several optional flags/arrays on `generated_sites.site_data`.
Populate these per prospect to tailor the rendered site:

| Field | Type | Effect |
|---|---|---|
| `hideBeforeAfter` | `boolean` | Hides the Before/After section (for prospects without a real transformation pair — the generic placeholder image is not a Hector- or Thrive-owned visual) |
| `suppressClaimUi` | `boolean` | Hides the floating "Claim this site →" CTA, the "Preview — will be customized" disclaimer banner, and the TextMeBack widget. Use for gifted / custom-built previews that shouldn't read as a sales pitch |
| `serviceAreas` | `string[]` | Rendered as city chips in the V2 "Areas We Serve" section. Landscaping template uses this today; pattern extends to any category |
| `resources` | `{label, description?, url, icon?}[]` | V2 church "Take the Next Step" grid. Links out to real pages on the prospect's own site (Watch Online / Connection Card / Give / Volunteer, etc.). icon: `watch` / `connect` / `give` / `volunteer` / `calendar` / `book` |
| `teamMembers` | `{name, role, bio?, quote?, photoUrl?}[]` | V2 church "Meet Our Team" grid. Initials avatar falls back when no photoUrl |
| `heroTagline` | `string` | Short hero h1 override. The longer scraped tagline stays in `data.tagline` for SEO / about usage, but the hero displays this short version (5–10 words). Used to satisfy CLAUDE.md's "hero copy short" rule without overwriting the preserved scraped tagline |
| `service.signupPath` | `string` (per-service) | When set on a service, the V2 card renders as an `<a>` link (click-through affordance + hover lift + tile-color "Learn more →" indicator) instead of a plain div. Route to `/inquire/[code]?program=slug&label=X` to open the inquiry form that emails the prospect's office |

### 9. /inquire/[code] form — contract

`/inquire/[code]?program=slug&label=Human+Readable` renders a public form that
collects name/email/phone/message and POSTs to `/api/inquire/[code]`. The
handler emails the prospect's contact email with `Reply-To` set to the
visitor's email (so the business replies directly to the inquirer), CCs
`bluejaycontactme@gmail.com` so Ben sees inquiry volume, and rate-limits
to 3 inquiries per prospect per minute.

**Rule:** any "Learn more" / "Sign up for program" / "Contact about event"
affordance on a V2 template should wire to `/inquire/[code]` via
`service.signupPath` or an equivalent href in a resource card. Don't build
per-category inquiry forms — this one handles all categories uniformly.

### 10. Pipeline batch loop — MUST thread Google Places pageTokens

`scout()` deduplicates against every active-pipeline prospect. Without
pagination across batches, batch N+1 re-queries Google Places for the same
`(location, category)` tuple and receives the same top-20 results, all of
which are now in-pipeline → dedup returns 0 → client's dry-batch circuit
breaker stops after 2 empty rounds. Symptom: "Run Pipeline always stops at
CHUNK_SIZE sites."

**Rule:** `/api/pipeline/batch` accepts and returns `pageTokens: Record<category, token>`.
`PipelineDashboard.tsx` carries the map across loop iterations and sends it
with every batch. Don't remove this without replacing with a different
de-duplication strategy (e.g. rotating cities per batch).

### 11. Client-side batch loop — resilience, not break-on-first-error

`PipelineDashboard.handleRunPipeline` MUST:
- Use `AbortController` with a <5min timeout per batch fetch (Vercel's function
  cap). Hangs without a timeout wedge the entire loop forever.
- Count consecutive failures and stop only after 3 in a row (circuit breaker).
  One flaky batch mid-run shouldn't kill the next 10.
- Parse non-JSON responses defensively (try/catch `res.json()`). A server-side
  HTML error page can crash a `.json()` call and exit the loop.
- Show the last error state in `loopState.lastMessage` on every failure so the
  user sees "Batch N timed out, continuing…" instead of a silent stall.

### 12. Image-mapper save preserves pool extras beyond mapped slots

`/api/image-mapper/save/[id]` builds the saved `scraped_data.photos`
array as:
1. **Slot-driven photos first** (in template-slot order — photos[0]
   is hero, [1] is hero-card, [2] is about, etc.), applying any
   replacements the operator made in the mapper.
2. **Pool extras appended after** — any URL already in
   `scraped_data.photos` that wasn't one of the mapper's scanned slots
   is preserved at the tail of the array.

This preserves scripted enrichment (Google Places photo scrapes, fix
scripts, bulk refreshes) even when the mapper was loaded before that
enrichment ran. The image-mapper UI still sees the extras in its
drag-source library.

**A prior implementation used a 409-shrink-guard** (reject if save
would reduce `photos.length` by >5 or >25%) — that guard surfaced as
"Conflict — mapping was modified by another session. Refreshing..."
for every operator who added photos outside the mapper. Removed
because preserving pool extras at save time is a strictly better
fix: no false positives, no information loss, no operator confusion.

The optimistic-concurrency check on `mapping.lastUpdated` is still
there — that one's a real concern and stays.

### 13. Recovery/bulk-send scripts — dynamic-import to avoid mock-mode trap

`src/lib/email-sender.ts` captures `SENDGRID_API_KEY` at module-evaluation
time. ES static imports hoist to the top of a file, BEFORE any `.env.local`
loader the script runs. In tsx scripts, a static import of `sendEmail`
captures `SENDGRID_API_KEY` as `undefined` → silent fall through to
mock mode → "Sent 48 emails!" with zero actual delivery.

**Rule:** scripts that invoke `sendEmail` (or any module that captures env at
module-level) MUST use `await import("...")` inside `main()`, AFTER the dotenv
loader has populated `process.env`. And bulk-send scripts MUST explicitly check
`process.env.SENDGRID_API_KEY` and exit 1 if missing — silent mock mode is
worse than a crash.

### 14. Scraper garbage email filter — always run before bulk sends

The scraper sometimes pulls mailto-like strings from page HTML that aren't
real addresses: image filenames (`flags@2x.webp`), placeholder domains
(`user@domain.com`, `example@mysite.com`, `contact@sansoxygen.com`), generic
demos. Hard-bouncing those during warming drags reputation for days.

**Rule:** Any bulk-send script MUST filter recipients through an
`isRealEmail()` check before hitting SendGrid:

```ts
function isRealEmail(email: string): boolean {
  const e = (email || "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif)$/.test(e)) return false; // image filenames
  const host = e.split("@")[1];
  if (["domain.com", "example.com", "mysite.com", "mail.com", "yoursite.com", "yourdomain.com"].includes(host)) return false;
  const local = e.split("@")[0];
  if (/^(user|email|example|info|contact|admin|test|demo|sample)$/.test(local)
      && /^(domain|example|mysite|sample)\./.test(host)) return false;
  return true;
}
```

Reference implementation in `scripts/recover-broken-link-sends.ts`.

### 15. SendGrid activity shows metadata only — bodies live in the `emails` table

The SendGrid Activity Feed shows subject/from/to/event timeline but NOT the
actual body text. If a prospect replies "what was in that email?" or Ben
wants to audit what went out, query the `emails` Supabase table which logs
every `sendEmail()` call with the full body.

Helper script: `scripts/show-last-sends.ts` (dumps the last N with full
body text). Table columns: `id, prospect_id, to_address, from_address,
subject, body, sequence, method, sent_at` — note `to_address`/`from_address`,
not `to`/`from`.

### 16. Hardcoded baseUrl for outreach email footers

`email-templates.ts` and `retargeting-emails.ts` MUST use hardcoded
`https://bluejayportfolio.com` for the unsubscribe + book URLs. Reading
`process.env.NEXT_PUBLIC_BASE_URL` is a trap — that variable on Vercel has
historically been set to a stale preview domain (`bluejays-three.vercel.app`),
which pointed the opt-out link in every sent email at a throwaway URL. Same
rule as `stripe.ts` `baseUrl` and `email-sender.ts` `FROM_EMAIL`.

### 17. Status-transition log is the only answer to "why did this number drop?"

The `prospect_status_changes` table (migration 20260421) logs every
`updateProspect({ status })` call with from/to/timestamp/source. When any
dashboard tile changes unexpectedly, query this table before speculating —
the answer is in the log. Dashboard component: `StatusTransitionsToday.tsx`
surfaces today's moves. For older investigations, query the table directly.

---


---

<!-- archived Locked-In Rules — Session 2026-04-23 evening (V2 showcase image audit) -->

## Locked-In Rules — Session 2026-04-23 evening (V2 showcase image audit)

Derived from a full visual audit of all 45 V2 portfolio showcases. 161
off-brand photos were replaced across the codebase in this session.
Every rule below prevents a specific failure caught on a real page.

### 18. Unsplash photo IDs don't describe their content — NEVER use a URL without visually inspecting it first

The canonical failure mode: an agent builds a template, searches
"construction contractor photo ID" in memory, emits a plausible-looking
`photo-XXXXXXX-XXXXXXX` URL, and the rendered page ends up with a
**PLAYMOBIL PIRATE**, **bread + wheat on a wooden table**, **Saint
Basil's Cathedral**, **a Black Pug**, **Scrabble tiles spelling
"CONTACT"**, or **DIAMONDS on a black background** — all real examples
caught in this audit.

**The rule:** every new Unsplash URL introduced into a template or
preview MUST be downloaded and visually inspected via the Read tool
before being committed. No exceptions. The ID alone is unreliable
because:
1. Unsplash photos get re-uploaded under new IDs or deleted
2. Agents frequently hallucinate plausible-looking IDs that don't exist
3. Even verified IDs from the `category-fallback-images.ts` library are
   sometimes contextually wrong (see rule 19)

The download-and-inspect pattern:
```
mkdir -p /tmp/audit
curl -sL --max-time 10 "https://images.unsplash.com/photo-XXX?w=600&q=60" \
  -o /tmp/audit/inspect.jpg
cp /tmp/audit/inspect.jpg "C:/Users/BenFr/AppData/Local/Temp/"
# Then use the Read tool to view the Windows-temp copy.
```
(Windows paths are required for the Read tool on this project.)

### 19. `src/lib/category-fallback-images.ts` is NOT a source of truth — it's contaminated

The library was populated from Unsplash API search results for queries
like "construction contractor", "wood fence", "tattoo design". Unsplash's
search returns surprising irrelevance for many categories:

- `construction` pool contained a Playmobil pirate figurine, colored
  pencils in a wood holder, daycare classrooms, paint trays, kids
  reading, and a wooden toy train. Only ~40% of "construction" entries
  are real construction photos.
- `tattoo` pool contained Hawaiian shirts, mountain lakes, Saint Basil's
  Cathedral, a turtleneck man, and various unrelated portraits alongside
  real tattoo work.
- `tutoring` pool had a male headshot of Marcus Chen (an older white
  man) — a photo that could not plausibly be Marcus Chen by any name.
- `landscaping` pool had a Mercedes hood ornament and a wine glass.

**The rule:** if you are pulling a replacement URL from
`category-fallback-images.ts`, you MUST download and visually inspect
the image before using it. The library is an *input to the inspection
process*, not a shortcut past it. Alts in the library are machine-
generated by Unsplash and often describe a tiny subject in the frame
rather than the main content (e.g. an image alt-captioned "a man
showing something with his finger" is actually a 10-story construction
site).

A follow-up cleanup pass on the fallback library itself is warranted —
audit each category's entries, tag the actually-usable ones, and
separate them from the contamination.

### 20. Staff photo name/gender/ethnicity must match the template's character name

Distinct failure mode: the template says "Dr. Priya Kaur" and the
photo is a masked male surgeon. "Marcus Chen (Asian male tutor)" and
the photo is an older white man. "Priya Patel (South Asian woman)" and
the photo is a blonde white woman. "James Okafor (Black male
attorney)" and the photo is a young white man.

**The rule:** every template that introduces a named character (team
member, attorney, stylist, tutor, chef, provider) MUST have the
portrait visually match the name's apparent gender and, where the
name is culturally specific, apparent ethnicity. If the stock pool
doesn't have a matching portrait, there are two valid fixes:
1. **Swap the photo** to one that matches the character name
2. **Rewrite the character** to match the photo (Agent 7's
   "Chef Adriana Reyes" → "Chef Adrian Reyes" with pronoun
   updates — preserving the existing photo by adjusting the copy
   around it)

Either is fine. What's NOT fine is shipping a mismatch — the cognitive
dissonance between named character and photo destroys every trust
signal the template was built to create.

Also required: every portrait/headshot `<img>` must have `object-top`
or `object-[center_20%]` class applied so `object-cover`'s default
center crop doesn't cut off the face. Check this on every template
with a named team member.

### 21. Parallel sub-agent audits need a cross-category dedup pass afterward

When 8 parallel agents each audit 5 categories and each pulls
replacements from the same `category-fallback-images.ts` library, they
WILL collide on the same photo IDs across categories. This session's
Wave 1 agents introduced 10 cross-category duplicates (e.g., the same
South Asian woman headshot appeared as Elena Vasquez on interior-design,
Priya Patel on tutoring, and a team member on law-firm).

**The rule:** any parallel image-replacement work MUST be followed by a
cross-category dedup check:
```
grep -rhoE "photo-[a-z0-9-]+" src/app/v2/*/page.tsx | sort | uniq -c \
  | awk '$1 > 1'
```
Every duplicate found must either be replaced in all-but-one category,
or (if genuinely category-agnostic like a generic office interior) be
explicitly whitelisted with a comment. Zero tolerance for unknown
cross-category duplicates.

### 22. Image API crashes on Read — have a no-Read fallback path

The Claude image-processing API returned `400 Could not process image`
twice in this session when an agent Read a downloaded image. Both
crashes happened deep inside long sub-agent runs and wasted the full
context window with no edits made.

**The rule:** any agent prompt that does visual image inspection MUST
include a fallback strategy:
1. Bound every download with `curl -sL --max-time 10`
2. Never retry a failed Read — skip the image and judge from caption
3. Have an alternate no-Read judgment path (URL-pattern + fallback
   library cross-reference) so the agent can still make progress when
   Read crashes

When building a batched parallel audit, prepare two versions of the
agent prompt: one "happy path" with Read, and one "no-Read" fallback
that judges by caption + URL + library-source only. If the first
version crashes, re-launch with the second.

### 23. When an image is contextually wrong, swap the image OR swap the caption — not both

A valid pattern used by Agent 7 this session: the template said
"Chef Adriana Reyes" next to a photo of a male chef. Rather than hunt
for a perfect Adriana photo in a library that didn't have one, the
agent renamed the character to "Chef Adrian Reyes" and updated every
"her/she" → "his/he" across the file. Five-minute fix, preserved all
existing brand context around the photo.

**The rule:** when caption and photo disagree, pick the cheaper fix:
- If the caption is generic ("Construction crew at job site") → easier
  to find a matching photo
- If the caption names a specific character → easier to rename the
  character than to find a matching photo in a thin library

Don't thrash back and forth. Pick one direction, commit, move on.

### 24. Google Places photos cap at 10 per Details response — script, don't re-scrape

The auto-scraper (`src/lib/data-extractor.ts:235`) caps photos at 5
with `.slice(0, 5)` to save on proxy bandwidth. But Google returns up
to 10 photo_references per business via `/place/details`. For
high-value manual enrichment (prospects Ben is customizing for a
specific sale), use `scripts/scrape-meyer-all-google-photos.ts` as
the template — it:
1. Resolves place_id via textsearch (doesn't require place_id stored)
2. Fetches full Details with photos field
3. Builds clean proxy-compatible URLs (no API key embedded, no
   trailing `\n`) from ALL photo_references
4. Merges with existing non-Google photos (preserves website scrapes)
5. Strips `data:` URIs and malformed entries during merge
6. Persists `googlePlaceId` on the prospect for future re-scrapes

**The rule:** never store raw `maps.googleapis.com/maps/api/place/photo?key=...`
URLs. Always build URLs WITHOUT the key — `/api/image-proxy` appends
it server-side, and the stored URL stays stable across API key
rotations. Also strip trailing `\r\n` characters on merge — the scraper
has historically corrupted entries with them, violating the QC
sanitize rule.

### 25. `data:image/...;base64,` URIs must never appear in `scraped_data.photos`

When the scraper finds an inline base64 image (logo, favicon, social-
share badge) in a business website's HTML, it sometimes dumps the raw
base64 into `photos`. These are:
- Useless as gallery/hero images (they're logos or icons, not photos)
- Visible noise in the image-mapper UI
- A QC-failure per rule 1 of the locked image rules ("malformed URLs,
  data: URIs ... are immediate QC failures")

**The rule:** any script that writes to `scraped_data.photos` MUST
filter with `!u.startsWith("data:") && /^https?:\/\//.test(u)`. The
Meyer photo-scrape script does this. Backfill scripts should strip
existing data: URIs on touch. Include this in the generator-side
photo-merge function so the corruption never enters the DB in the
first place.

---


---

<!-- archived Locked-In Rules — Session 2026-04-24 evening (Wave 1 sales-funnel hardening) -->

## Locked-In Rules — Session 2026-04-24 evening (Wave 1 sales-funnel hardening)

These rules were derived from the deep sales-funnel review (6 parallel
agent reports) and the bug-class fixes that immediately followed. Each
prevents a real bug we shipped or a class of regression we want
permanently dead.

### 26. Action-Button Hrefs Use Live Route Params, Never Derived State

The `/book/${info?.id || ""}` bug shipped to production with every
prospect tapping the "Book a 15-min walkthrough" CTA on the claim
page → `info.id` was never populated → `href="/book/"` → 404. Same
bug class as the short-URL `id.slice(0,8)` regression in rule 1.

**Rule:** When building action hrefs in client components, use the
URL param from `useParams()` directly — do NOT use derived state
(`info`, `prospect`, `data`) unless you've verified that field is
populated by every code path that renders the button. If a button
takes a prospect ID, get it from `useParams()`, not from a fetched
data object.

When in doubt: `const { id: prospectId } = useParams() as { id: string };`
then `href={\`/book/${prospectId}\`}`. Period.

### 27. List-Unsubscribe Header URL Must Match the In-Body Link

Gmail's RFC 8058 one-click unsubscribe verifies that the URL in the
`List-Unsubscribe` header is reachable AND aligned with the visible
in-body opt-out link. We shipped with the header pointing at
`/api/unsubscribe/${prospectId}` while the body footer used
`getShortUnsubUrl(prospect)` which renders `/u/[code]`. Header URL
404'd silently — Gmail's classifier downgraded the sender.

**Rule:** Both URLs MUST be the same canonical route. Today that is
`getShortUnsubUrl(prospect)` (resolves to `/u/[code]`). The route
MUST accept `POST` with empty body and return `200` on success
AND on unknown codes (per RFC 8058 — non-2xx responses cause Gmail
to downgrade the sender).

When adding any new opt-out surface, change all three: header, body
link, AND the route handler. They are a unit, not three separate
files.

### 28. Plain-Text Email Bodies Are UTF-8; Never ASCII-Strip

The `body.replace(/[^\x00-\x7F]/g, "")` line in `email-sender.ts`
silently removed every ★, em-dash, and curly quote from every
plain-text outreach email for months. "Your 4.8★ across 23 reviews
stood out" arrived as "Your 4.8 across 23 reviews stood out" —
killing the validation hook in CLAUDE.md's Psychology Stack.

**Rule:** Email bodies are UTF-8 by default. SendGrid handles UTF-8
plain-text natively via the `text/plain; charset=utf-8` content type
its API sets. Do NOT add ASCII-only filters, "sanitization", or
"safe character" strips to email bodies. If a future encoding bug
appears, fix the encoding header — don't drop characters.

The same rule applies to SMS (Twilio handles GSM-7 + UCS-2 charset
detection automatically) and voicemail TwiML.

### 29. Payment-Plan Buttons Call `redirectToCheckout(plan)` Directly

Already in CLAUDE.md "Claim Page Simplification Rules" but was being
violated: the "3 × $349 (Most Popular)" button mutated `?plan=...`
in the URL and triggered a full page reload, while the secondary
"$997 once" button called `redirectToCheckout("full")` directly.
The recommended path FELT broken vs the secondary one.

**Rule:** Every payment-plan-selector button on `/claim/[id]` MUST
call `redirectToCheckout(plan)` directly. Never use the
`window.location.href = ?plan=...` reload pattern. Never. If you
need to persist plan choice for analytics, use a hidden form input
or pass `?plan=` as a Stripe metadata param — but the user-facing
click goes straight to checkout.

### 30. Outbound Marketing Crons Hit US Business Hours

Vercel cron `0 8 * * *` (08:00 UTC) = 12am Pacific / 3am Eastern.
Every prospect for the entire 14-day warming ramp got cold emails
between midnight and 3am their local time. Gmail's classifier
clusters that pattern as commercial bulk sending and downgrades
inbox placement. The funnel cron is now `0 16 * * *` (16:00 UTC =
8am PT / 11am ET — peak cold-email open window for US East-and-West
combined).

**Rule:** Any outbound commercial cron (cold email, postcard send,
SMS to inbound prospects, voicemail drop) MUST fire between **15:00
and 19:00 UTC** to land in the US morning-window. Internal crons
(QC, dashboards, data sync, scout) are timezone-agnostic and can run
whenever. When adding a new outbound cron, document the local-time
target in the cron name comment.

### 31. Social Proof Must Use Real Data Or Be Removed (Reinforcement)

Already an existing rule, but `SmartSocialProof.tsx` shipped with
hardcoded "X hours ago" timestamps that never updated — a textbook
violation. The strings looked like data ("A roofing business in
Bellevue viewed their preview · 2 hours ago") which is the most
trust-destroying form of fakeness.

**Rule reinforcement:** It is a NON-NEGOTIABLE FAIL to ship any
component that renders fake-looking dynamic data. Specifically:
- Hardcoded relative timestamps ("3 hours ago", "yesterday")
- Hardcoded counts ("47 sites built this week")
- Hardcoded named-business strings ("A {category} in {city}…")

If real data isn't available, REMOVE the component. Don't ship a
placeholder. The empty state is always more trustworthy than a fake
one. If a future dev needs to add a fake-data placeholder for
component preview, it MUST be gated by `process.env.NODE_ENV !==
"production"` AND visually obvious as a placeholder ("[mock]
preview...").

### 32. Domain Registration System (NON-NEGOTIABLE)

The 5,000-site target is real. Domain registration + Vercel hosting +
$100/yr renewal is the spine of the business — every rule below is
designed to prevent failures that compound at scale.

**Architecture:**
- Registrar abstraction lives in `src/lib/domain-registrar.ts` —
  `RegistrarClient` interface with `namecheap`, `mock`, future
  `porkbun` / `cloudflare` impls. Routes NEVER call the registrar
  REST API directly; always go through `getRegistrar()`.
- Vercel hosting integration lives in `src/lib/vercel-api.ts` —
  same mock-when-env-absent pattern.
- All domain rows live in the `domains` table (migration
  `20260424_domains.sql`); FK to `prospects.id` (UUID).
- Cost-logging service names: `domain_registration` (initial buy),
  `domain_renewal` (yearly auto-renew), `vercel_domain` ($0, audit only).

**Eligibility:**
- Domains can ONLY be registered for prospects with `status === "paid"`.
  Pre-paid speculation is forbidden — we don't own a domain we
  haven't been paid for. Enforced in `/api/domains/register/route.ts`.
- Every register call MUST log cost via `logCost(prospectId, ...)`
  so per-customer CAC/LTV math works.

**Mock-mode policy:**
- When `NAMECHEAP_API_KEY` (or required env vars) absent, the lib
  silently uses `mockClient` which returns deterministic responses
  + still logs $0 cost rows (so end-to-end UI testing works).
- Same for Vercel: `isVercelConfigured()` gates the live branch;
  mock returns deterministic verification info.
- It is FORBIDDEN to remove the mock fallback. Local dev, CI, and
  any dashboard demo MUST continue to work without external API keys.

**Failure handling:**
- If the registrar call succeeds but Vercel auto-add fails, do NOT
  roll back the registration. Persist `status='registered'` +
  `last_error` and let the operator retry the Vercel add via
  `POST /api/domains/[id]/vercel-add`. Never make a half-purchased
  domain disappear.
- If the registrar call itself fails, persist `status='failed'` +
  `last_error` and DO NOT charge the customer (cost only logs on
  success path).

**Nameserver flow (DON'T CHANGE):**
- Namecheap = registrar of record (renewal billing, transfer rights).
- Vercel = delegated DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
- After register, ALWAYS call `registrar.setNameservers(domain, …)`
  to switch DNS authority to Vercel. Vercel then auto-verifies via
  the delegation — no TXT-record dance for the customer.

**Renewal alignment with Stripe (CRITICAL — at scale this is the
biggest bug surface):**
- Customer paid Day 0. Stripe deferred mgmt sub fires Day 365 ($100).
- Domain registered Day 0 (or Day 1-2 after onboarding). Namecheap
  renewal due Day 365 + buffer.
- The `next_renewal_at` column MUST be set to `expires_at - 30
  days` (the auto-renew window). Renewal cron MUST charge the
  customer's Stripe sub BEFORE auto-renewing the domain at Namecheap.
  If the Stripe charge fails (card expired etc), pause the domain
  renewal and trigger dunning — do NOT pay $11 for a domain whose
  customer hasn't paid us $100 yet.

**5,000-site scaling notes:**
- Vercel Pro caps domains per project at 50. At 5K sites, shard
  across ~100 projects OR migrate to Enterprise (unlimited). The
  `vercel_project_id` column on `domains` is the sharding seam —
  it's already populated per-row so future migration can rebalance.
- Namecheap API has rate limits (~50 req/min). Batch operations
  (renewal cron) MUST throttle; never hammer the API in a tight loop.
- DNS propagation is the slowest step (5–60 min). Renewal cron MUST
  fire 30+ days before expiry to absorb propagation delays.

### 33. Built-But-Unwired Detection (Meta-Rule)

The single most-recurring pattern in the 2026-04-24 sales-funnel
review: feature exists in code, sits inert because UI/cron/wiring
was never added. Examples we found: `getSubjectVariant()` (returns
A/B but never called), `engagement-tracker.ts` (data populated, AI
prompt never reads it), Apollo integration (`src/lib/apollo.ts`
fully built, never called from auto-scout), `ReviewRequestPanel`
(component built, mounted nowhere), `Compare page` (`/compare/[id]`
404s in incognito because it calls a protected API), open-tracking
pixel (env config exists, no `<img>` ever emitted), `ENABLE_HTML_PITCH_EMAIL`
(coded with no auto-flip-trigger).

**Rule:** When you build any feature, you MUST in the same commit:
1. Wire it into a customer-facing surface OR a cron OR an operator
   dashboard
2. Document the env vars / dashboards / triggers required
3. Verify the happy path renders / fires once

A PR that adds a function with no caller is a bug, not a feature.
If you can't wire it in the same commit (legitimate reason — depends
on a separate system not yet built), open a TODO entry in the BLOCK
3 section of CLAUDE.md so it doesn't drift.

### 35. AI Responder Kill-Switch (`AI_AUTO_REPLY_ENABLED`)

A single env var gates whether the AI responder auto-sends replies to
prospects.

- **Default:** unset OR `true` → current behavior. Replies get drafted,
  classified, and queued via `queueDelayedReply()` then auto-sent on the
  next 1-minute cron tick (with high-intent speed-bypass).
- **`AI_AUTO_REPLY_ENABLED=false`** → replies still get classified and
  drafted, but `queuePendingReview()` parks them in the
  `queued_replies` table with `status='pending_review'`. The
  `processQueuedReplies` cron explicitly ignores that status, so the
  draft sits until Ben approves it via the dashboard. An owner SMS
  fires immediately ("Inbound from {biz} — AI drafted reply, needs
  review: {dashboardUrl}") so Ben isn't surprised.

**Recommendation:** set `AI_AUTO_REPLY_ENABLED=false` for the first
30 days post-launch when reply volume is low — it costs ~5 minutes
of manual approval per inbound but eliminates the "one bad AI reply
burns a $997 sale" risk while we tune the prompt.

When the kill-switch is enabled the speed-bypass logic still computes
intent normally — high-intent items just sit at the top of the
review queue (sorted by created_at desc on the dashboard tile).

### 36. AI Responder Speed-Bypass (5-min cliff)

In `src/lib/delayed-replies.ts`:

- High-intent replies (`interested`, `custom_request`) bypass the
  random delay entirely — `scheduledFor = now()` so the 1-minute cron
  picks them up immediately. Replies under 5 minutes are 9× more likely
  to convert (Lead Response Management Study, MIT/InsideSales).
- All other intents get a randomized **30-90 SECOND** delay (was 1-10
  minutes pre-Wave-2). Even objection / question replies should land
  inside the 5-minute conversion window.

When new high-intent intents are added to `IntentType` (e.g. an
explicit `ready_to_buy` / `schedule_call` once the responder
classifies them), add them to the `HIGH_INTENT_BYPASS` Set in the
same file.

### 37. AI Responder Conversation History

`buildPrompt()` in `src/lib/ai-responder.ts` now injects a
`CONVERSATION HISTORY:` block above the current incoming message
listing the last 6 outbound messages (mixed email + sms + prior
queued AI replies for this prospect). Format:

```
[2026-04-22] outbound email: [Made something for Acme] Hi Sam, ...
[2026-04-21] outbound sms: Hey Sam, Ben from BlueJays — ...
```

When no prior history exists the section is omitted entirely (not
left empty). The history fetch is wrapped in a try/catch so a
flaky DB read can never break the responder — worst case the AI
sees no history and responds as it did before Wave 2.

### 34. CTA Copy Includes the Offer (Reinforcement)

Existing claim-page CTAs say "Claim this site →" with no price, no
guarantee. Prospects mid-scroll don't know what tapping commits them
to → reduces tap-through rate.

**Rule:** Every primary conversion CTA on customer-facing surfaces
MUST include either the price OR the guarantee in its label.
Examples (use these patterns):
- "Claim — $997 · 100% money-back"
- "Claim — from $349/3mo"
- "Get started — 30-day guarantee"
- "Book free walkthrough — no card required"

Naked "Claim →" or "Get Started →" buttons are banned from the
preview/claim/book surfaces. Internal admin tools can use them.

---

### 38. Needs Review Workflow (`PendingRepliesPanel`)

When `AI_AUTO_REPLY_ENABLED=false` (Rule 35 kill-switch), every AI-drafted
reply parks in `queued_replies` with `status='pending_review'` and waits
for Ben to clear it via the dashboard's `Needs Review` tile (top of
`/dashboard`, `#pending-review` anchor). Without this loop the queue
silently grows and prospects never get answered.

**Operator obligations (NON-NEGOTIABLE):**

- **Clear the Needs Review queue at least once per day** while the
  kill-switch is on. A draft sitting overnight blows past the 5-minute
  conversion cliff (Rule 36) and effectively wastes the inbound. Treat
  it like email — empty inbox daily.
- **High-intent intents (`interested`, `custom_request`) approve FIRST.**
  The list is sorted newest-first by created_at, but high-intent badges
  (green for `interested`, amber for `objection`, blue for `question`)
  exist precisely so they're scannable in the queue. Don't approve a
  90-minute-old `unclear` before clearing today's `interested`.
- **Every approve goes through the 30-second buffer by default.** The
  "Approve & Send" button schedules `send_after = now() + 30s` to keep
  the cadence feeling human (no instant-reply tell). Use "Send now"
  only when the prospect is actively waiting on a reply (e.g. a phone
  call follow-up they expect within seconds).

**Editing rules (preserve the psychology stack — Rule from outreach
templates):**

- The AI draft already encodes the Ben-approved hooks: validation,
  reciprocity, humility ("no idea if it's what you had in mind, but…"),
  soft reply-prompt. Edits should TIGHTEN those hooks — never strip
  them. If you find yourself deleting the entire draft and writing
  fresh, reject + reply manually instead. The audit trail (rejected vs
  edited-and-approved) feeds back into prompt-tuning.
- **Keep edits short.** A 2-sentence draft that's 90% correct beats a
  6-sentence "improvement" — short replies convert.
- **Don't add pricing into the body.** Same rule as outreach emails
  (CLAUDE.md "Outreach Email Template Rules"): pricing lives on the
  claim page, not in the reply.
- **Don't add a Calendly / booking link** unless the prospect explicitly
  asked to schedule. The whole point of the soft reply prompt is to
  keep the conversation open.

**Reject vs Edit decision matrix:**

| Situation                                     | Action |
|---|---|
| AI got the intent right, copy is 90% there    | Edit + Approve |
| AI got the intent right, copy is wrong tone   | Edit (preserve psychology hooks) + Approve |
| AI misclassified the intent (e.g. flagged objection but it's interest) | Reject + reply manually from prospect detail |
| Prospect already replied to a different channel about same thing | Reject (reason: "already handled in [channel]") |
| Prospect is angry / unsubscribing             | Reject + handle manually |

**Rejection reasons matter.** Always supply one — even a 3-word note
("wrong intent", "tone off", "already replied"). They become the
training signal for AI responder prompt updates.

**API contract (for future tooling):**

- `GET /api/replies/pending-review` → `{ replies: PendingReply[], total: N }`
- `POST /api/replies/[id]/approve` body `{ editedBody?, sendImmediately? }`
- `POST /api/replies/[id]/reject` body `{ reason? }`

The cron (`/api/replies/process`) picks up `status IN ('pending', 'queued')`
and ignores `'pending_review' | 'rejected' | 'sent' | 'failed'`. Approving
flips the row to `'queued'`; the cron sweeps it up on the next minute.

**When to flip the kill-switch back to true:** after 30 days of clean
manual review (no rejections in 7 days) AND after the AI responder
prompt has been re-tuned with rejection-reason signal. Until then
treat the panel as the daily must-clear inbox.


---

<!-- archived Stripe LIVE Launch Procedure (locked 2026-04-25) -->

## Stripe LIVE Launch Procedure (locked 2026-04-25)

The exact sequence Ben follows when flipping Stripe from TEST to LIVE.
Every step here is gating — skip one and the launch is a partial
migration that risks customer-impacting bugs.

### Pre-flip code (must be on master before touching env vars)

- [x] `STRIPE_LIVE_ENABLED` kill-switch in `/api/checkout/create`
      and `/api/checkout/upsell` (Rule 52)
- [x] `STRIPE_ALLOW_NON_STANDARD_TIERS` gate in `/api/checkout/create`
      (Rule 53 — standard-only self-serve at launch)
- [x] CLAUDE.md updated with Rules 52/53/54 + this procedure

### Stripe Dashboard work (Ben does in browser — ~30 min)

1. **Create 8 LIVE Products** at https://dashboard.stripe.com/products
   (LIVE mode, NOT test mode). Note the `price_xxx` IDs:
   - $997 one-time setup → `STRIPE_PRICE_SETUP_ID`
   - $100/yr maintenance subscription → `STRIPE_PRICE_MGMT_ID`
   - $100/yr custom-tier subscription → `STRIPE_PRICE_CUSTOM_ID`
   - $99 one-time review_blast → `STRIPE_PRICE_REVIEW_BLAST`
   - $400 one-time extra_pages → `STRIPE_PRICE_EXTRA_PAGES`
   - $150 one-time gbp_setup → `STRIPE_PRICE_GBP_SETUP`
   - $50/mo monthly_updates subscription → `STRIPE_PRICE_MONTHLY_UPDATES`
   - $349 installment payment → no env var needed (inline price_data)

2. **Configure Customer Portal** at https://dashboard.stripe.com/settings/billing/portal
   - Enable: update payment method, view invoices, cancel subscription
   - Save the LIVE login URL (looks like `https://billing.stripe.com/p/login/...`)
   - This becomes `STRIPE_CUSTOMER_PORTAL_URL` on Vercel

3. **Enable Stripe Tax** at https://dashboard.stripe.com/settings/tax
   - Add EIN / business tax registration
   - Enable auto-collect for the relevant US states
   - This auto-applies to all LIVE checkout sessions going forward

4. **Create the LIVE Webhook Endpoint** at https://dashboard.stripe.com/webhooks
   - Endpoint URL: `https://bluejayportfolio.com/api/webhooks/stripe`
   - Events to send (matches the code's handler list):
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.expired`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - After creating, click "Reveal" on the Signing Secret — copy it.
     This becomes `STRIPE_WEBHOOK_SECRET` on Vercel.

5. **Get the LIVE secret key** at https://dashboard.stripe.com/apikeys
   - Copy the `sk_live_*` value. This replaces `STRIPE_SECRET_KEY`.

### Vercel env vars (single deploy after all set)

Update on Vercel → Project Settings → Environment Variables → Production:

```
STRIPE_SECRET_KEY=sk_live_*                  (REPLACE existing test key)
STRIPE_WEBHOOK_SECRET=whsec_*                (REPLACE existing test secret)
STRIPE_PRICE_SETUP_ID=price_*                (NEW — was unset)
STRIPE_PRICE_MGMT_ID=price_*                 (REPLACE existing test ID)
STRIPE_PRICE_CUSTOM_ID=price_*               (REPLACE existing test ID)
STRIPE_PRICE_REVIEW_BLAST=price_*            (NEW — was unset)
STRIPE_PRICE_EXTRA_PAGES=price_*             (NEW — was unset)
STRIPE_PRICE_GBP_SETUP=price_*               (NEW — was unset)
STRIPE_PRICE_MONTHLY_UPDATES=price_*         (NEW — was unset)
STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/*
STRIPE_LIVE_ENABLED=true                     (NEW — Rule 52 kill-switch)
```

After all 11 are set, redeploy (any push triggers it, OR
"Redeploy latest" in the Vercel dashboard).

### Post-flip verification (do not skip)

1. Hit the env-check endpoint in browser — confirm all 11 vars show present:
   `https://bluejayportfolio.com/api/admin/env-check`
2. Open a test prospect's claim page → click "Get Started" → confirm
   you reach Stripe Checkout (NOT the 503 error from the kill-switch).
3. Smoke-test the kill-switch: temporarily set
   `STRIPE_LIVE_ENABLED=false` → redeploy → confirm checkout returns
   503 → set back to `true` → redeploy. (Verifies the kill-switch
   actually works before you need it in an emergency.)
4. Watch the Stripe webhook log at https://dashboard.stripe.com/webhooks
   for the next inbound event — confirm signature validation succeeds
   (HTTP 200 in the webhook log, not 401).

### Rollback (if something breaks)

```
Vercel → Settings → Environment Variables → Production:
  STRIPE_LIVE_ENABLED=false   (kill new transactions immediately)
```

Redeploy. New checkouts return 503. In-flight Stripe events still
process via webhook (so customers who paid in the last few minutes
still get their welcome email).

If the issue is broader (signing secret mismatch, key swap mistake),
revert STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to the test values,
redeploy, and diagnose with the test webhook before re-flipping.

---


---

<!-- archived Review Blast Wave 1 — Customer-Facing Fulfillment (Locked 2026-04-25) -->

## Review Blast Wave 1 — Customer-Facing Fulfillment (Locked 2026-04-25)

The $99 Review Blast SKU now has end-to-end self-serve fulfillment.
Per Ben's 10-question gate (Rule 48) answers locked 2026-04-25:

**Spec:**
- **Submission UX:** magic link in the welcome email → public page
  `/review-blast/[upsellId]` → paste up to 50 phone numbers (one per
  line, any format) → pick category template → submit. Optional +
  fillable whenever — no urgency banner.
- **Phone format:** customer pastes any format (parens, dashes,
  spaces, leading +, etc.) — server normalizes to E.164 via
  `normalizePhone()` in `src/lib/review-blast.ts`. Invalid lines are
  surfaced back, not silently dropped.
- **Per-customer data:** phone numbers only. No customer names — keeps
  the submission frictionless.
- **SMS template:** category-tuned pre-built templates (dental, vet,
  salon, electrician, plumber, hvac, roofing, auto-repair, landscaping,
  cleaning, fitness, real-estate, law-firm, default fallback). Customer
  picks from a dropdown; preview updates live in the form.
- **Tokens:** `{businessName}` + `{reviewLink}` only. The reviewLink
  resolves to `/review/[prospectId]` — the existing 5-star-filter
  funnel page (5★ → Google review CTA, <5★ → private feedback to
  business owner email).
- **Dispatch timing:** all 50 SMS land within ~3 seconds of the cron
  picking up the submission (50ms delay between sends to stay under
  Twilio's unthrottled rate limit). Spec target was "within 1 hour" —
  we beat that.
- **Pre-A2P fallback:** submissions queue in `pending_a2p` status.
  Once `SMS_FUNNEL_DISABLED` flips off (A2P approved), the next cron
  tick auto-dispatches the backlog. No customer action required.
- **Reply routing:** customer-of-customer replies route to the
  BUSINESS's `prospect.email` (NOT Ben's). Each business handles its
  own customer relationship. Implementation: `tryHandleReviewBlastReply()`
  in `src/lib/review-blast.ts` runs BEFORE the normal prospect-by-phone
  match in `/api/inbound/sms` — short-circuits when the inbound is
  from a phone we recently SMS'd via Review Blast.
- **Operator dashboard:** minimal — just the existing upsell row in
  `/dashboard/customers`. No separate Review Blast firehose page.
- **Cost:** Twilio ~$0.008/SMS × 50 SMS = $0.40 raw. We charge $99 →
  ~$98.60 margin. Logged via `logCost()` service `twilio_sms` so the
  spending dashboard captures the cost.

**Files:**
- `supabase/migrations/20260425_review_blast.sql` — schema
- `src/lib/review-blast.ts` — submission + dispatch + reply-handle module
- `src/lib/review-blast-templates.ts` — category-tuned SMS templates
- `src/app/review-blast/[id]/page.tsx` + `ReviewBlastForm.tsx` — public submission UI
- `src/app/api/review-blast/submit/[id]/route.ts` — POST endpoint
- `src/app/api/review-blast/dispatch/route.ts` — daily cron (17:30 UTC)
- Updated `getReviewBlastWelcomeEmail()` to inject the magic link
- Updated `/api/webhooks/stripe` to capture upsell row ID + pass to welcome
- Updated `/api/inbound/sms` to detect + forward Review Blast replies

**Path additions to PUBLIC_API_PATHS in `src/middleware.ts`:**
- `/api/review-blast/submit/` (customer-facing POST, URL-as-secret)
- `/api/review-blast/dispatch` (Vercel cron, gated by CRON_SECRET)
- `/review-blast/` (customer-facing page, URL-as-secret)

**Vercel cron schedule:** `30 17 * * *` (17:30 UTC = 9:30am PT).
Sits AFTER funnel-run (16:00) + postcard-cron (17:00) so all the
regular SMS volume from those flows finishes first per Rule 30
(outbound commercial crons hit US business hours).

**Wave 2 candidates (post-A2P + initial customer feedback):**
- Operator dashboard with per-SMS delivery + reply tracking
- CSV upload alternative to paste-textarea
- Customer-name personalization (`{customerName}` token)
- Send-window picker (customer chooses business-hours window)
- Direct Google review link option (vs the 5-star filter we use today)

---


---

<!-- archived Test Group Wave 1 — Full-Stack Outreach Test (Locked 2026-04-25) -->

## Test Group Wave 1 — Full-Stack Outreach Test (Locked 2026-04-25)

The first controlled outreach test. Built so we can measure if the
full-stack channel mix is worth the per-prospect spend before scaling
it across the whole pipeline.

**Spec (locked by Ben 2026-04-25):**
- Cohort ID: `wave1-2026-04-25` (constant in `src/lib/test-cohort.ts`)
- 50 prospects, Pacific NW only (WA / OR / ID)
- 6 categories: dental, electrician, salon, landscaping, veterinary, roofing
  — auto-picked by `googleRating × log(reviewCount + 1)` quality score
- Manual prospects (Rule 49) excluded automatically
- Killer-site + franchise prospects (Rule 50) — gated by Ben's manual
  review of the dry-run output BEFORE commit
- **Channels:** email (current funnel + UTM `pitch_day0`) + ringless
  voicemail (Day 2 + 18 — already in funnel) + Lob postcard (Day 7 — new
  cron) + manual Loom for top 10 (Ben records)
- **NOT in Wave 1:** SMS (waiting on A2P 10DLC; Wave 2 add), Browserless
  video (parked due to OOM)
- **Launch gate:** flip after A2P 10DLC approval AND Lob live keys flipped
- **30-day window** → at Day 30, stop entirely (no auto-roll-forward)
- **Budget cap:** $300-500 total
- **Success bar:** ≥1 closed-paid (1% conversion of 50)
- **If < 1% by Day 30:** kill worst-performing channel, double best,
  run Wave 2 with revised mix

**Data model (migration `20260425_test_cohort.sql`):**
- `prospects.test_cohort_id TEXT` (nullable, indexed-where-set)
- `prospects.cohort_postcard_sent_at TIMESTAMPTZ` (dedupe key for postcard cron)
- `prospects.loom_video_url TEXT` (manual capture, drives email token)

**Endpoints:**
- `GET/POST /api/test-cohort/select` — dry-run by default. POST with
  `{ "confirm": true }` to commit. Override auto-pick with
  `{ "confirm": true, "prospectIds": [...] }`.
- `GET /api/test-cohort/[cohortId]` — full firehose stats JSON
- `GET/POST /api/test-cohort/postcard-cron` — daily cron (17:00 UTC) that
  fires Lob postcards for cohort prospects past Day 7. Mock-safe when
  `LOB_API_KEY` absent. forceTier:true bypasses the standard
  rating/review tier-gate (cohort selection already filtered for quality).

**Dashboard:** `/dashboard/test-group/[cohortId]` (e.g.
`/dashboard/test-group/wave1-2026-04-25`). Firehose: hero metrics
(paid / spent / projected ROI / CPA), email funnel breakdown,
postcards / Looms / VMs sent, status / category / state breakdowns,
action queues (Loom recording queue + postcard queue), per-prospect
table with day-since-enrollment + postcard / Loom status.

**Email integration:**
- `getPitchEmail()` reads `prospect.loomVideoUrl` and injects a
  "Quick 60-sec walkthrough I recorded for you: {loomUrl}" line above
  the preview URL. Cohort-only — never injected for prospects without
  the URL set, so non-cohort emails are unchanged.

**Launch checklist (run in this order, all gates must be GREEN):**

1. Apply the migration in Supabase SQL editor:

```sql
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS test_cohort_id TEXT,
  ADD COLUMN IF NOT EXISTS cohort_postcard_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS loom_video_url TEXT;

CREATE INDEX IF NOT EXISTS prospects_test_cohort_id_idx
  ON public.prospects (test_cohort_id)
  WHERE test_cohort_id IS NOT NULL;
```

2. Dry-run the cohort selection (browser, while logged into dashboard):
   `https://bluejayportfolio.com/api/test-cohort/select`
   Inspect the JSON output — should show ~50 prospects across the 6
   categories. Reject any franchises or killer-site prospects.

3. Commit the cohort (curl from terminal with admin session cookie):

```bash
curl -X POST https://bluejayportfolio.com/api/test-cohort/select \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_COOKIE" \
  -d '{"confirm": true}'
```

   Or to override the auto-pick with a hand-curated list:

```bash
curl -X POST https://bluejayportfolio.com/api/test-cohort/select \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_COOKIE" \
  -d '{"confirm": true, "prospectIds": ["uuid1","uuid2","..."]}'
```

4. Verify cohort tag landed:

```sql
SELECT business_name, category, state, status
FROM public.prospects
WHERE test_cohort_id = 'wave1-2026-04-25'
ORDER BY category, business_name;
```

5. Verify A2P 10DLC approval is in (TCR campaign status = APPROVED) AND
   `LOB_API_KEY` env var is set to a `live_pub_*` value on Vercel.

6. Open the dashboard:
   `https://bluejayportfolio.com/dashboard/test-group/wave1-2026-04-25`

7. The cohort prospects will be auto-enrolled in the funnel by the
   16:00 UTC cron (Rule 47). At 17:00 UTC the postcard cron will
   queue postcards for any cohort prospects past Day 7. As Ben
   records Looms for the top 10, paste the Loom URL via:

```sql
UPDATE public.prospects
SET loom_video_url = 'https://www.loom.com/share/XXXXXXXX'
WHERE id = 'PROSPECT_UUID';
```

   The next outbound email pitch from the funnel will inject the Loom
   URL automatically.

**Wave 2 plan (post-A2P approval):**
- Add SMS to the channel mix
- Same 50-prospect-cohort structure, fresh cohort ID `wave2-YYYY-MM-DD`
- Reuse the same dashboard infrastructure
- Compare reply / paid rates against Wave 1 to isolate SMS contribution

---

### Locked-In Rule 55 — Stripe Env Vars Use `price_*` IDs, NEVER `prod_*` (NON-NEGOTIABLE)

Established 2026-04-25 during the LIVE flip. All 7 `STRIPE_PRICE_*`
env vars on Vercel were initially set to Product IDs (`prod_*`) instead
of Price IDs (`price_*`). Result: the $997 button silently 400'd with
"No such price: prod_xxx" while the installment $349 button worked
(it uses inline `price_data` and doesn't depend on these env vars).

**Why it happened:** the Stripe product detail page shows BOTH IDs
within ~200 pixels of each other — the `prod_*` Product ID at the top
of the page (header), and the `price_*` Price ID inside the "Pricing"
section card lower down. Both look like `xxx_XXXXXXXXXXXXXX`. Easy
copy-paste mistake.

**The rule:** every Stripe env var named `STRIPE_PRICE_*` MUST contain
a value starting with `price_`. NEVER `prod_`. The two IDs serve
different purposes:
- `prod_*` — the Product object (name, description, metadata, tax
  category). Useful for `stripe.products.retrieve()` calls.
- `price_*` — a specific Price + recurring-interval combination on
  that product. Required in checkout `line_items` and subscription
  creation.

**Verification:** the `/api/admin/env-check` endpoint includes a
`stripePricePrefixes` field that reports the prefix group of each
`STRIPE_PRICE_*` env var. After any Stripe env var change, hit the
endpoint and confirm every entry shows `"price"` (not `"prod"` or
`"other"` or `null` for vars that should be set).

**When adding a NEW SKU** (e.g., a new upsell or pricing tier):
1. Create the Product in Stripe — note the `prod_*` ID for reference
2. Inside that product, create a Price — note the `price_*` ID
3. Set the `STRIPE_PRICE_NEW_SKU` env var to the **`price_*` value
   only**
4. Add the new var name to the `STRIPE_PRICE_KEYS` list in
   `src/app/api/admin/env-check/route.ts` so the prefix audit covers it
5. Hit env-check, confirm the new entry shows `"price"`
6. Smoke-test the new checkout path before relying on it

**This rule extends to scripts:** any script that programmatically
creates Stripe checkout sessions (e.g., bulk-send promotion scripts,
email-attached checkout links) MUST validate price IDs with a
`startsWith("price_")` check before submitting to Stripe. Don't trust
hardcoded values in scripts — they tend to drift from the real
configuration.

### Locked-In Rule 51 — Runnable Code Must Be One-Click Copyable (NON-NEGOTIABLE)

Established 2026-04-25 by Ben. When giving Ben code, SQL, env vars, or
shell commands to run, the snippet MUST be presented in a single clean
fenced code block so most terminals/IDEs let him click-to-copy without
selecting text by hand.

**The format:**
- ONE fenced code block per runnable thing — no splitting it across
  paragraphs with explanation interleaved.
- NO leading prompt characters (`$`, `>`, `PS>`) inside the block.
- NO inline commentary inside the block — comments belong in the
  language's native comment syntax (`-- ...` for SQL, `# ...` for
  bash, etc.) so the whole thing pastes and runs as-is.
- NO truncation, no `...`, no "etc." inside the block — the snippet
  must be complete and ready to execute.
- Specify the language on the fence (`````sql, `````bash, `````ts) so
  syntax highlighting works.
- Put the explanation BEFORE the block ("Run this in Supabase SQL
  editor:") and verification steps AFTER the block — never inside it.

**Bad example (don't do this):**
```
First, run:
$ psql -c "ALTER TABLE prospects..."
Then run:
$ psql -c "SELECT * FROM..."
```

**Good example (always do this):**

Run this in Supabase SQL editor:

```sql
ALTER TABLE prospects ADD COLUMN manually_managed BOOLEAN DEFAULT false;

UPDATE prospects SET manually_managed = true
WHERE business_name ILIKE '%lewis county autism%';
```

Verify with:

```sql
SELECT business_name, manually_managed FROM prospects WHERE manually_managed = true;
```

**This applies to:** SQL migrations, env var blocks, bash one-liners,
PowerShell commands, npm/npx scripts, curl commands, JSON config
snippets — anything Ben needs to copy and execute.

**Exception:** when explaining a code pattern (not running it), inline
fragments and prose-interleaved snippets are fine. The rule applies to
RUNNABLE artifacts only.

---


---

<!-- archived Locked-In Rules — Session 2026-04-26 evening (audit funnel hardening) -->

## Locked-In Rules — Session 2026-04-26 evening (audit funnel hardening)

These rules came out of the audit-funnel build session that shipped
commits `718d248` through `7b6fe47` on 2026-04-26. Each captures a
pattern that's now the default for similar problems.

### Locked-In Rule 56 — Validate Public Env Vars Before Mounting Scripts (NON-NEGOTIABLE)

Any `NEXT_PUBLIC_*` env var that gets injected into a `<script>` tag
or used as the source of an external resource URL (Meta Pixel, Google
Ads tag, Hotjar, Stripe.js, etc.) MUST run through a defensive
validator BEFORE the script mounts. The validator's job is to reject
copy-pasted-from-docs placeholder values that look syntactically
valid but reference non-existent IDs.

**Why:** when Ben configured the retargeting pixels (2026-04-26), he
pasted the docs-example values `1234567890123456` and `AW-XXXXXXXXXX`
literally. Without a validator, the next deploy would have injected
scripts that 404'd at Meta/Google, polluted the browser console with
invalid-pixel errors, and burned a few hundred ms of useless network
on every audit-page paint. The validator now silently rejects those
exact strings + any other obvious placeholder pattern.

**The pattern (used in `src/components/RetargetingPixels.tsx`):**

```ts
function isValidMetaPixelId(v: string | undefined): v is string {
  if (!v) return false;
  const trimmed = v.trim();
  if (!/^\d{15,16}$/.test(trimmed)) return false;
  if (trimmed === "1234567890123456" || trimmed === "0000000000000000") return false;
  return true;
}

const META_PIXEL_ID = isValidMetaPixelId(RAW_META_PIXEL_ID) ? RAW_META_PIXEL_ID : undefined;
```

**Required for every new public env var:**
1. A regex shape check (length, character class, prefix)
2. An exact-match blacklist of known docs-example strings
3. A dev-mode `console.warn` so misconfigured values are LOUD, not silent
4. A graceful fallback (treat as if the env var was unset) so the
   page still renders cleanly

**Apply to:** any tracking pixel (Meta, Google, Hotjar, LinkedIn,
Pinterest, TikTok), any third-party widget script (Stripe Elements,
Calendly embed, chat widgets), any analytics SDK that takes a key in
the URL.

**Don't apply to:** server-side env vars (`STRIPE_SECRET_KEY` etc.) —
those validate at use-time via the API call itself. Rule 56 is about
pre-mount validation for client-side script injection specifically.

### Locked-In Rule 57 — 3-CTA Hub Pattern for Lead-Magnet Conversion Surfaces

When a prospect reaches the conversion surface of any lead-magnet
funnel (audit, free preview, free strategy session, free template
download, etc.), the page MUST present THREE forks of intent —
ascending in commitment but each capturing the lead — instead of a
single "Buy now" CTA.

**The Hormozi pattern ("stack the slip"):**
1. **High-intent fork** — the immediate paid conversion ("Fix it now"
   → Stripe checkout). Most popular badge.
2. **Medium-intent fork** — a phone/video commitment ("Schedule a
   call" → /schedule/[id]). Captures warm leads who need more info.
3. **Low-intent fork** — a slow-yes lead capture ("Get my free
   preview" → POSTs to backend, alerts Ben). Captures the "not ready
   to buy or talk" prospects who'd otherwise bounce, and gives Ben a
   second swing at them.

**Why three:** a single CTA forces a binary yes/no. Three CTAs let
the prospect pick their own commitment level, and they're 3× more
likely to pick ONE of three options than to pick a single forced
choice. Reference implementation: `src/app/audit/[id]/AuditCTAHub.tsx`.

**Visual rules:**
- All three cards same size, equal weight on the page
- High-intent fork gets a "Most Popular" or similar amber badge
- Each card has: icon → title → headline number → 1-line value prop
  → 1-line trust line → CTA button
- Trust strip below all 3 cards (money-back, delivery time, no fees)
- Secondary fallback option (e.g. "Or pay $997 once") as a small text
  link below the cards — discoverable but doesn't crowd the trio

**Backend contract for the low-intent fork:**
- Endpoint MUST be idempotent (re-clicking returns ok:true +
  already:true without re-firing the SMS alert)
- Marks prospect with `manually_managed=true` (Rule 49) so the
  auto-funnel skips them — Ben handles them personally
- Sends owner-alert SMS with biz name + audit URL + dashboard link
- Persists state BEFORE firing the SMS (Rule 43)

### Locked-In Rule 58 — Auto-Suggest Defaults at Page Load (NOT on Field Submit)

Any onboarding / form flow where we can pre-fill a field via API
call MUST fire the API call at page-mount time, not at field-blur or
form-submit time. The picks should already be on screen by the time
the user scrolls down to that field.

**Why:** every additional click is a drop-off. If the user has to
type a business name and then click "Get suggestions", we lose a
percentage of users at the click step. Firing on mount means the
moment they see the field, the picks are already there.

**Reference implementation:** auto-domain suggestions in onboarding
Step 1 (`src/app/onboarding/[id]/page.tsx`). On mount the page fires
`/api/domain-suggestions/[id]`, displays a spinner while loading,
swaps to 3 radio-style domain picks the moment the API resolves.

**Pattern:**
1. Fire the API call from a `useEffect` keyed only on `prospectId`
   (NOT on any user input — page-load means page-load)
2. Show a loading state (spinner + "Checking…" message) while the
   call is in flight
3. Render the picks as easy one-click buttons + ALWAYS-on text input
   as escape hatch for "I want a different one"
4. The endpoint loads its data server-side (don't depend on a
   protected `/api/prospects/[id]` route returning 200 to unauth
   customers)

**Apply to:** anywhere we can show a smart default — domain picks,
brand colors (sample from the existing site), business hours
(default to category norms), service lists (prefill from scrape),
testimonials (prefill from Google reviews scrape).

### Locked-In Rule 59 — Deterministic Math for Trust-Sensitive Numbers (NOT AI)

Any number we show to a customer that anchors a buying decision
(money-leak estimate, recovery projection, lead-value chip,
testimonial-implied results) MUST be computed by a deterministic
formula, NOT an AI prompt. The formula's inputs (vertical avg
customer value, conversion lift %, close rate) live as named
constants the operator can tune.

**Why:** AI numbers vary across runs. The same prospect re-running
the audit could see "+$5,100/mo" once and "+$8,200/mo" the next time
— that variance kills trust instantly. Deterministic = same input →
same number, every time. Customers can re-run the audit, screenshot
both, and the numbers match.

**Reference implementations** (`src/lib/site-audit.ts`):
- `estimateMoneyLeak()` — vertical avg × monthly visitors × lift %
  × 0.7 safety margin
- `recoveryProjection.totalMonthly` — leak × `RECOVERY_CAP_PERCENT`
  (0.60 — conservative)
- Per-fix recovery — severity-weighted share of total recovery pool
- Leads vs customers translation — `DEFAULT_CLOSE_RATE` = 0.4

**The rules:**
1. Constants at the top of the file with comments explaining the
   source / why this number (industry benchmark, conservative bias,
   Hormozi research deliverable, etc.)
2. Round to nearest $50 / nearest 5% / similar so the numbers feel
   deliberate not algorithmic
3. Apply a safety margin (0.6×–0.7×) so we ALWAYS underclaim
4. Document the methodology to the customer (footnote text under
   the big number) — transparent math earns trust
5. NEVER let the AI prompt suggest numbers. The AI generates copy
   ABOUT the deterministic numbers.

**Apply to:** money-leak math, recovery math, "you'll get X new
customers" claims, ROI calculators, before/after metrics, anything
the customer might screenshot and forward to their accountant.

### Locked-In Rule 60 — Auto-Improvement Loops Need Dormancy Gates

Any cron that uses AI to analyze data and suggest improvements
(prompt tuning, ad copy generation, email subject A/B tests,
retargeting audience optimization) MUST have a minimum-data
dormancy gate that prevents it from running until the dataset is
big enough for the AI's analysis to be meaningful.

**Why:** AI analyzing 3 audits + 0 paid customers is just noise
generation. The model will confabulate trends from random variance
and suggest "improvements" that are statistically meaningless. Worse,
those suggestions get rolled out as A/B tests, polluting the dataset
further. Dormancy guards against this.

**Reference implementation:** Hyperloop cron (`src/app/api/hyperloop/run/route.ts`).
Two thresholds at top of file as named constants:

```ts
const MIN_READY_AUDITS_TO_WAKE = 100;
const MIN_PAID_CUSTOMERS_TO_WAKE = 5;
```

Below either threshold → log a `dormant` heartbeat row in
`hyperloop_runs` + return gate-reason without firing the AI call.

**The rules:**
1. Dormancy thresholds as named constants the operator can tune
2. Heartbeat insert on every tick (active OR dormant) so we have
   continuous evidence the cron is firing on schedule
3. `gate_reason` field on the runs table explains WHY this tick was
   dormant
4. Active path stays minimal at first (Day-1 = log + obvious-loser
   retirement only). Claude-suggested-new-variants step lands as a
   follow-up commit AFTER signal exists
5. The gate constants stay editable — bumping `MIN_PAID_CUSTOMERS_TO_WAKE`
   from 5 to 50 once we have data is just a one-line change

**Apply to:** any future AI-driven optimization cron — ad-copy
generator, email-subject A/B test cron, prompt-tuning loop,
audience-segment generator, scheduling-optimizer.

### Locked-In Rule 61 — 3rd-Grade Reading Level for Customer-Facing AI Output

All AI prompts that generate text for the customer-facing audit, or
any future customer-facing AI surface, MUST enforce 3rd-grade reading
level via TWO hard constraints in the prompt:

1. **Banned words** list — the explicit jargon that fails (`optimize`,
   `leverage`, `enhance`, `streamline`, `maximize`, `utilize`,
   `facilitate`, `sub-optimal`, `prioritize`, `conversion`,
   `methodology`, `UX`, `above-the-fold`, `social proof`,
   `positioning`, `V2`, `template`, `tag`)
2. **Yes words** list — concrete verbs the model is encouraged to
   use instead (`fix`, `swap`, `drop`, `slow`, `fast`, `big`, `small`,
   `lose`, `win`, `miss`, `beat`, `grab`, `lift`, `sink`)

PLUS a sentence-length cap (~12-20 words per sentence) and a
"if a 9-year-old can't read it out loud and get it, rewrite it"
acceptance criterion.

**Why:** Hormozi-research-validated. SMB owners read at ~7th-grade
level on average; 3rd-grade hits universally. Any jargon costs
comprehension AND trust simultaneously.

**Reference:** `buildHeroPrompt()` + `buildTechnicalPrompt()` in
`src/lib/site-audit.ts`. Same banned/yes lists in both prompts so
output style stays consistent across Claude + GPT.

**Static UI copy follows the same rules:**
- Section headers: "Top of Your Page" not "Hero & Above the Fold"
- Buttons: "Fix it now" not "Initiate purchase"
- Tooltips, error messages, form labels — all 3rd-grade

**Defensive render-time stripper:** for legacy data already
generated under older prompts, ship a render-time `stripJargon()`
helper (see `src/app/audit/[id]/page.tsx`) that catches the most
common offenders. New audits won't generate jargon (prompt
enforcement); old audits in Supabase get cleaned at render.

### Locked-In Rule 62 — Lob Postcards Target High-Intent Self-Identifiers

Lob postcards cost ~$1.20 each. Per-prospect economics only work
when the recipient has already self-identified as warm — not on a
cold list, not on a list of "scraped potential prospects".

**The rule:** Lob postcard crons MUST gate by EXPLICIT high-intent
signal:
1. The prospect performed an opt-in action (submitted an audit form,
   clicked through a preview link, replied to email)
2. AND has a quality bar (4.5★+ rating, established business)
3. AND hasn't already taken the next-step action (paid, booked,
   requested preview)
4. AND is past the silent-rejection window (5+ days from the
   self-identifying action)
5. AND `manually_managed = false` (Rule 49 — never auto-touch)
6. AND `<column>_postcard_sent_at IS NULL` (idempotent — never
   re-send to the same person)

Reference implementation: `/api/audit/postcard-cron/route.ts`
(2026-04-26). Targets prospects who submitted an audit AND have
4.5★+ AND haven't acted in 5 days. Migration adds a per-trigger
`audit_postcard_sent_at` column distinct from
`cohort_postcard_sent_at` so the two crons don't fight.

**NEVER fire postcards at:**
- Cold-scraped prospect lists (no opt-in signal)
- Anyone with manually_managed=true (Ben handles personally)
- Prospects below the rating bar (cost vs. expected close rate)
- Anyone already in the funnel's later stages (paid, booked, dismissed)

**Schema pattern for new postcard crons:**
- New `<trigger>_postcard_sent_at TIMESTAMPTZ` column on prospects
- Partial index `WHERE that_column IS NULL` (cron's hot path)
- Stamp on success AND on permanent-skip (no_address, below_tier,
  already_sent) so the cron doesn't keep retrying tomorrow
- Don't stamp on transient-error skips (so retries work next tick)

---


---

<!-- archived Locked-In Rules — Session 2026-04-27 (Stage-2 Hyperloop hardening) -->

## Locked-In Rules — Session 2026-04-27 (Stage-2 Hyperloop hardening)

These came out of the adversarial Hormozi review of the Hyperloop
self-improving ad system. Each captures a class of failure that's
expensive in money OR debuggability.

### Locked-In Rule 63 — Cost caps protect the EXPENSIVE thing, not the cheap one (NON-NEGOTIABLE)

When building any AI-driven autonomous system that triggers downstream
spend on a paid platform (ads, registrar fees, API mailings, infra),
the cost cap MUST bound the largest downstream cost surface, NOT just
the AI/inference cost.

**Why this rule exists:** Hyperloop v1 had a $50/wk cap on Anthropic
credits but ZERO cap on the platform-side ad spend it could trigger.
Claude could generate 10 bad-tone variants for $0.20 in credits and
Hyperloop would auto-roll-out all 10 to Meta + Google, where the
combined daily ad budgets (e.g. $50 Meta + $50 Google = $100/day)
would burn ~$700 over the 7-day analysis window before the Bayesian
loop could pause them. **The cheap input was capped; the expensive
output wasn't.**

**The rule:**
1. For every autonomous loop that creates downstream spend, identify
   the single largest dollar leak surface (usually NOT the AI cost).
2. Add a cap on THAT surface FIRST. AI cost cap is secondary.
3. The cap belongs at the ENTRY of every cron tick — read current
   spend (from internal logs OR platform API) and short-circuit
   variant generation/rollout if cap is breached.
4. Make the cap configurable from a DB row (`hyperloop_config`,
   `system_settings`, etc.) so Ben can adjust without redeploy.
5. Surface week-to-date spend on the operator dashboard as a
   progress bar against the cap, color-graded (green/amber/red).

**Apply to:** any future "AI generates → platform creates → platform
spends" loop. Same shape: ad gen, content posting, programmatic
outreach, automated marketplace listings.

### Locked-In Rule 64 — Mock implementations must self-flag at the data layer (NON-NEGOTIABLE)

Any mock client that returns data which gets persisted (mock ad IDs,
mock user IDs, mock domain IDs, etc.) MUST include a sentinel prefix
(`mock_`) in those values. The cron/route writing the data MUST
detect mock-prefixed values and refuse to persist them when env
configuration says we're in LIVE mode for that platform.

**Why this rule exists:** mock-mode pollution is silent and
catastrophic. If a deploy ever runs with one platform configured
(LIVE) but another not yet configured (mock), the mock client
happily returns `mock_meta_ad_xxx` strings, the cron stamps them
into `platform_ad_id` columns, and the next sync hits the real
Meta API with `mock_meta_ad_xxx`, gets a 400, logs `[ERROR]`, and
the row is broken forever. Manual SQL cleanup required.

**The rule:**
1. Every mock client returns a value with `mock_` prefix on any field
   that gets persisted to a column whose name reads as a foreign-key
   to the platform (`platform_ad_id`, `stripe_customer_id`,
   `namecheap_order_id`, etc.).
2. Every route/cron that PERSISTS such a value MUST call a guard
   helper (e.g. `isSafeAdId()`) before INSERT/UPDATE.
3. The guard returns `true` ONLY when EITHER:
    - the value is non-mock (no `mock_` prefix), OR
    - ALL relevant platforms are unconfigured (i.e. we're fully in dev mode)
4. On guard failure: `console.error()` with a clear message naming
   the env var that should be set, and SKIP the persist (don't crash
   the cron — just refuse the dirty write).

**Reference:** `isSafeAdId()` in `src/app/api/hyperloop/run/route.ts`.

**Apply to:** any new platform integration that has a mock fallback
+ persistent state. Same shape: domain registrar, payments, email
service providers, SMS providers, file storage providers.

### Locked-In Rule 65 — Every platform API mutation must have a retry-on-orphan path (NON-NEGOTIABLE)

If a cron creates a row in our DB and ALSO mutates external state
(creates an ad on Meta/Google, registers a domain, sends a postcard,
fires a payment), the cron MUST have a separate retry pass at the
NEXT tick that finds rows in inconsistent state (DB row exists but
external write didn't land) and retries the external mutation
idempotently.

**Why this rule exists:** Without retry, network blips become
permanent orphans. A single Meta 429 during rollout means the variant
lands in `hyperloop_variants` with no `platform_ad_id`. The cron's
existing rollout-step only fires for FRESHLY generated variants, not
older orphans. Sync skips the variant (no platform_ad_id to query).
Bayesian sees 0 impressions, parks it as 'insufficient_data', forever.
The variant is invisible to every subsequent cron tick.

**The rule:**
1. At the START of every cron that creates DB rows + external state,
   add an "orphan retry" pass:
    - Query rows where DB exists, external write missing, age >
      threshold (typically 1 hour)
    - For each, retry the external mutation
    - On success: stamp the missing field
    - On error: log + leave for next tick
2. The retry must be idempotent — calling the platform API twice
   for the same logical operation must not duplicate state on the
   platform side.
3. Surface orphan-retry stats in the run summary so Ben sees if a
   particular orphan keeps failing (signals deeper API issue).

**Reference:** orphan-retry pass at top of active path in
`src/app/api/hyperloop/run/route.ts`. Retries variants where
`status='active' AND kind in (ad_copy_meta, ad_copy_google) AND
platform_ad_id IS NULL AND created_at < now() - 1 hour`.

**Apply to:** any future cron that does the "create DB row →
external mutation" two-step. Domain registration, postcard send,
ad creation, Stripe customer creation, etc.

### Locked-In Rule 66 — Every cron must have a heartbeat alert path (NON-NEGOTIABLE)

A daily check MUST alert Ben if any expected cron hasn't logged a
row in N×schedule_period (e.g. weekly cron without a run in 8 days,
daily cron without a run in 36 hours, per-minute cron without a run
in 5 minutes). Silent crons are systemic disasters that go undetected
for weeks.

**Why this rule exists:** Vercel cron platform issues, env-var
deletions, Supabase RLS changes, Stripe key rotations, A2P 10DLC
revocations — any of these can silently break a cron. Without a
dedicated heartbeat check, the failure is invisible until the
downstream impact (e.g. "no audits getting generated", "no welcome
emails sent") is noticed manually. By that point you've burned days
of pipeline time.

**The rule:**
1. EVERY cron (scheduled task, weekly Hyperloop, daily renewal
   check, hourly digest, per-minute reply processor) MUST log a row
   in a runs/heartbeat table at the END of every tick — including
   ticks where the cron decided to no-op.
2. A separate watchdog cron (daily) MUST check each expected cron's
   most recent heartbeat row. If older than the threshold, SMS Ben
   via `sendOwnerAlert()` with the cron name + last-seen timestamp.
3. Watchdog thresholds default to 2× the cron's schedule period
   (e.g. weekly cron → 14-day threshold). Tunable per-cron via
   config row.
4. Watchdog's own failure must also alert (canary problem) — make
   the watchdog itself a tick-counted cron that logs to a
   `watchdog_runs` table the same way.

**Reference (built 2026-04-26):** `/api/watchdog/run` (daily 13:00 UTC,
self-logs to `watchdog_runs`) scans 18 entries in `WATCHED_CRONS`. As
of commit 57771f1, every cron in `vercel.json` writes a `cron_heartbeats`
row at end-of-success via `logHeartbeat(cron_name, metadata)`, and the
watchdog scans by `cron_name` filter. Stale heartbeats SMS Ben.

**Still open (canary-of-canary):** the watchdog itself logs to
`watchdog_runs` every tick, but nothing reads that table for staleness.
A second-level "watchdog-watcher" or external uptime monitor would
catch the case where the watchdog cron itself silently fails.

**Apply to:** every existing + future cron. Audit `vercel.json`
crons periodically — any cron without a corresponding heartbeat-table
INSERT is a silent-failure risk.

---

### Locked-In Rule 67 — Namecheap Live Kill-Switch (NON-NEGOTIABLE)

Established 2026-05-06 by Ben as part of the Namecheap LIVE flip,
mirroring Rule 52 (Stripe). Every customer-touching mutation that
hits the Namecheap API MUST honor a single env-var kill-switch so
any incident can stop new registrations + renewals in <2 minutes
without code changes.

**The contract:**
- When `NAMECHEAP_LIVE_ENABLED=false`, every gated endpoint short-
  circuits BEFORE any prospect lookup, DB write, or registrar API
  call. Returns HTTP 503 with `{ killSwitchEngaged: true, ... }`.
- Default unset OR `NAMECHEAP_LIVE_ENABLED=true` (or any value
  !== "false") = LIVE operation. The check is fail-OPEN by design —
  a missing env var doesn't accidentally disable the registrar on
  a fresh Vercel project.
- Helper: `isNamecheapLiveEnabled()` exported from
  `src/lib/domain-registrar.ts`. Friendly 503 payload constant:
  `NAMECHEAP_KILL_SWITCH_RESPONSE`.

**Endpoints that MUST honor the kill-switch:**
- `POST /api/domains/register` — initial $11 registration
- `POST /api/domains/[id]/retry-renewal` — manual retry after
  card update
- `POST/GET /api/billing/check-domain-renewals` — daily renewal
  cron (logs `kill_switch_engaged` heartbeat so Rule 66 watchdog
  doesn't alert about a stale cron)

**NOT gated (read-only / no spend):**
- `POST /api/domains/check` — availability lookup, $0 cost
- `GET /api/domains/[id]` — single-row read
- `GET /api/domains/list` — list operator's domains
- `GET /api/domains/[id]/vercel-status` — read-only Vercel state
- `getExpiry()` — read-only registrar lookup, $0 cost

**When to flip:**
- Namecheap account suspension or API rate-limit lockout
- Bad customer email / contact data flowing into registrant fields
- Any chargeback spike on the deferred mgmt sub (don't pay $11
  for a customer who'll dispute the $100 renewal)
- Maintenance windows where an incompatible code change is deploying
- Suspected bug in the renewal cron's Stripe-first ordering

**Recovery:**
1. Set `NAMECHEAP_LIVE_ENABLED=true` (or remove the env var) on
   Vercel
2. Redeploy (~60-90 sec)
3. Next cron tick (or next manual register call) processes the
   queue normally
4. In-flight registrations from before the flip were unaffected
   — the kill-switch only gates NEW starts, NOT operations
   already in progress at the registrar API

**Forbidden:**
- Don't add a UI surface that bypasses this gate
- Don't add a different env var for the same purpose — this is
  the single canonical kill-switch for Namecheap
- Don't make the kill-switch fail-CLOSED (default off when env
  var missing) — that bricks new Vercel projects on first deploy
- Don't gate read-only endpoints (availability, getExpiry) — they
  cost $0 and gating them freezes the operator dashboard

**Pre-flip checklist (Rule 54 ordering):**
1. ✓ Code-level kill-switch shipped + deployed (this rule)
2. → Get Namecheap API key + whitelist Vercel function IPs
3. → Set `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`,
     `NAMECHEAP_USERNAME`, `NAMECHEAP_CLIENT_IP` on Vercel
4. → REMOVE `NAMECHEAP_SANDBOX=true` (delete the row, don't set
     to false)
5. → Smoke-test via `/api/domains/check` for a known-available
     `.com` — should return `{ available: true, price: ~11 }`
6. → Verify cost logging by checking `system_costs` for a
     `service='domain_registrar'` row

---

### Locked-In Rule 68 — Per-Page Metadata Override Mandatory for Client Showcases (NON-NEGOTIABLE)

Established 2026-05-06 after the SEO audit on Meyer Electric caught
the root `app/layout.tsx` leaking BlueJays-homepage values into every
child page's `<head>`. The leaks were catastrophic — wrong canonical
URL (told Google "this page is a duplicate of the homepage, don't
index it"), wrong Open Graph (every social share showed BlueJays
branding instead of the client's), wrong JSON-LD schema (described
BlueJays selling $997 websites instead of the actual client business).

**Every page at `/clients/[slug]` (or any other route hosting client-
specific content) MUST override the following Metadata fields in its
own `layout.tsx`:**

1. **`alternates.canonical`** → MUST point at the page-specific URL,
   never the bluejayportfolio.com homepage. Without this Google treats
   the page as a duplicate of the canonical target and won't index it
   independently.
2. **`openGraph`** — full override (NOT just title/description):
   - `title`, `description`, `url`, `siteName` — all client-specific
   - `images` — array with at least one client photo (ideally hero or
     a 1200×630 og-image), with explicit `width`, `height`, `alt`
   - `type: 'website'` (or `business.business` if appropriate)
   - `locale: 'en_US'` (or relevant)
3. **`twitter`** — full override:
   - `card: 'summary_large_image'`
   - `title`, `description`, `images` — all client-specific
4. **`keywords`** — replace BlueJays-generic terms ("web design, local
   business website") with client-/niche-/geo-specific terms (e.g.
   "Tesla Powerwall installer Sequim, Generac Authorized Dealer Sequim,
   Olympic Peninsula electrician, license MEYERE*862P1"). Most search
   engines ignore meta keywords today but Bing still uses them and it
   doesn't hurt.
5. **JSON-LD structured data** (`<script type="application/ld+json">`)
   injected directly in the layout's JSX (NOT via the `metadata.other`
   shape — Next.js escapes it):
   - Use the appropriate Schema.org type (`Electrician`, `Plumber`,
     `Restaurant`, `Dentist`, `LocalBusiness`, etc.)
   - Required fields: `name`, `url`, `image`, `telephone`,
     `address` (PostalAddress), `geo` (GeoCoordinates), `priceRange`,
     `areaServed` (array of `City` objects), `openingHoursSpecification`
   - `hasOfferCatalog.itemListElement` with each Service the client
     offers + a description per service
   - `identifier` for the license number as PropertyValue
   - `sameAs` linking to the client's existing website / social profiles
   - Coexists ADDITIVELY with the root BlueJays
     `ProfessionalService` schema — Google treats multiple JSON-LD
     blocks fine, treats them as additive context.

**Reference implementation:**
`src/app/clients/meyer-electric/layout.tsx` — sets all 5 fields with
SITE_URL + PAGE_PATH constants at the top, full openGraph + twitter
overrides, and an `Electrician`-typed JSON-LD with all required fields
populated from real Meyer data.

**How to verify after deploy** (use this exact command — Chrome MCP
freezes on heavy CSS animations):

```bash
curl -s https://bluejayportfolio.com/clients/[slug] \
  | grep -E '(canonical|og:title|og:image|og:url|twitter:title|application/ld\+json)' \
  | head -10
```

Expected: every value should reference the client's URL/business name,
NOT bluejayportfolio.com or "BlueJays | Premium Web Design."

If you see `<link rel="canonical" href="https://bluejayportfolio.com"/>`
(no path) or `<meta property="og:title" content="BlueJays | ..."` —
the override is broken or didn't deploy yet.

**This applies retroactively:** every existing `/clients/[slug]`
page should be audited via the curl command above. Any page leaking
homepage values gets the same treatment as Meyer's layout.

---

### Locked-In Rule 69 — Active Client Showcases MUST Be in sitemap.ts (NON-NEGOTIABLE)

Companion to Rule 68. Found during the same 2026-05-06 audit:
`src/app/sitemap.ts` had 81 entries (homepage + portfolio showcases +
city pages + guides + case studies + previews) but ZERO `/clients/[slug]`
entries. Google Search Console had no way to discover the bespoke
client pages from sitemap crawl — they could only be found by chance
via internal links from the BlueJays homepage (which doesn't link to
them by default).

**Every active bespoke client showcase MUST have a slug entry in the
`ACTIVE_CLIENT_SHOWCASES` array in `src/app/sitemap.ts`.** Priority
0.85 — high local-SEO value because each carries unique long-tail
queries (real business name + city + niche → unique rankings).

**When to add:** in the SAME commit as the new
`/clients/[slug]/page.tsx` ships. Don't let it drift.

**When to remove:** if a client churns + we tear down their page.
Keeping a sitemap entry that 404s is worse than no entry — Google
penalizes broken-link-in-sitemap signals.

**Currently active (verified 2026-05-06):**
meyer-electric, hector-landscaping, masters-window-tinting, kr-ranches,
olympic-inspections, itc-quick-attach, zenith-sports, laser-lakes, lcac.

**Verify after deploy:**

```bash
curl -s https://bluejayportfolio.com/sitemap.xml \
  | grep -oE '<loc>[^<]*clients[^<]*</loc>'
```

Should return one `<loc>` line per active showcase.

---

### Locked-In Rule 70 — Animation Discipline for Trade-Category Illustrations (NON-NEGOTIABLE)

Established 2026-05-06 after the Meyer Electric Powerwall + Generac
diagram animations shipped. The pattern that works (and that should
be reused on every future trade-illustration build — HVAC airflow,
plumbing pressure, solar panel charging, cleaning before/after, etc.):

**1. Pure CSS keyframes inside `<style jsx>`.** No framer-motion
runtime, no Lottie, no GIFs. Reasons:
- ~zero JS overhead, no hydration cost
- No external library load (Lottie ~70KB, lottie-web ~250KB)
- Animations start the moment paint completes (no JS init delay)
- GIFs lose every quality battle vs CSS

**2. Class names MUST be prefixed with section identifier.** e.g.
`.me-pw-bolt` (Meyer Powerwall bolt), `.me-gen-arrow` (Meyer Generac
arrow). Why: a single page can have 10+ animations and unprefixed
class names collide.

**3. Wrap every animation in `@media (prefers-reduced-motion: reduce)`
that disables it.** Required for accessibility (vestibular disorder
users). Pattern:

```css
@media (prefers-reduced-motion: reduce) {
  .me-pw-ring,
  .me-pw-core,
  .me-pw-bolt,
  .me-pw-charge,
  .me-pw-led {
    animation: none;
  }
  .me-pw-charge { height: 100%; }  /* charge bar stops at full */
}
```

**4. Animations must NARRATE the user's mental model.** Don't animate
for animation's sake — every motion should reinforce the sales claim:
- Powerwall: charge bar fills 0→100% (battery is charging up).
  Lightning bolts strike (storm rolls through, Powerwall absorbs energy).
  Ring waves expand outward (energy radiating).
- Generac: arrow pulses left→right (grid energy crossing to backup).
  Switch icon rotates -2°↔+2° (ATS lever flipping back and forth).
  Home indicator shimmer-sweeps left→right (continuous power flow).

**5. Subtle wins over flashy.** Default duration: 2-4s for breathing
loops, 4-6s for "process" loops (charging, traveling), 1.5-2s for
quick pulses (status LEDs). Default amplitude: ±5% scale for breaths,
±2-4px translate for levitates, 0.4-1.0 opacity for glows. Anything
more starts to distract from the headline.

**6. Reference implementation:** the Powerwall + Generac diagrams in
`src/app/clients/meyer-electric/page.tsx` (search for `me-pw-` and
`me-gen-` class prefixes). 13 distinct animations across both
diagrams, total CSS additional ~3KB, zero JS impact, all
prefers-reduced-motion gated.

**Forbidden:**
- GIFs/MP4s for diagram animation (use CSS)
- Lottie/lottie-react for trade illustrations (overkill for keyframes)
- framer-motion for ambient loops (it's for orchestrated entrance/exit
  animations, not 24/7 background loops)
- Unprefixed keyframe names (collision risk)
- Animations without prefers-reduced-motion override (a11y violation)

---


---

<!-- archived Daily Task System — 30-Day Growth Ramp (started 2026-04-28) -->

## Daily Task System — 30-Day Growth Ramp (started 2026-04-28)

**HOW TO USE:** When Ben asks "what are my daily tasks?" or "what should I do today?", calculate `currentDay = (today - 2026-04-28) + 1` (capped at 30 for day-specific tasks, the three permanent habits continue forever). Then present tasks in this format:

```

---

<!-- archived 6-Month Marketing Ramp Plan (started 2026-04-28) -->

## 6-Month Marketing Ramp Plan (started 2026-04-28)

This extends the 30-day ramp into a full 6-month machine. Each month builds on the last. The five permanent daily habits (LinkedIn post, Instagram post, warm outreach/referrals, affiliate check, pipeline review) NEVER stop — they are the spine of everything.

At the start of each session, calculate what month Ben is in:
- Month 1: Days 1–30 (2026-04-28 to 2026-05-27)
- Month 2: Days 31–60 (2026-05-28 to 2026-06-26)
- Month 3: Days 61–90 (2026-06-27 to 2026-07-26)
- Month 4: Days 91–120 (2026-07-27 to 2026-08-25)
- Month 5: Days 121–150 (2026-08-26 to 2026-09-24)
- Month 6: Days 151–180 (2026-09-25 to 2026-10-24)

Show Ben which month he's in and what the focus is. Ask about the three daily habits every single session.

---

### Month 1 — PLANT (Days 1–30, 2026-04-28 to 2026-05-27)

**Theme:** Build the machine. Send the emails. Post every day. Show up before results exist.

**Daily habits (115 min/day):**
- LinkedIn post (30 min)
- Instagram post (15 min)
- Warm outreach / referral messages (20 min)
- Affiliate check (10 min)
- Pipeline review (20 min)

**Email volume:**
- Days 1–7: 20/day (10/domain)
- Days 8–14: 100/day (50/domain)
- Days 15+: 200/day (100/domain)

**Month 1 milestones:**
- [ ] 100 warm messages sent
- [ ] 30 LinkedIn posts published
- [ ] 30 Instagram posts published
- [ ] 19 affiliate partners contacted (DONE Day 1)
- [ ] 2+ affiliates replied and engaged — follow up every session
- [ ] LinkedIn + Instagram accounts live (DONE Day 1)
- [ ] 3,000+ cold emails sent
- [ ] 1 paid client minimum ($997)

**Month 1 content themes:**
- Week 1: origin story, the local biz website gap, pipeline stats
- Week 2: what makes the $997 worth it, objection reframes, process transparency
- Week 3: V2 showcase features, real email data, educational value
- Week 4: affiliate program, 30-day full numbers post

**Month 1 end targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 3,000 | 4,500+ |
| Warm messages sent | 100 | 150+ |
| LinkedIn posts | 30 | 30 |
| LinkedIn impressions | 5,000 | 15,000+ |
| Instagram posts | 30 | 30 |
| Affiliate partners active | 2 | 5+ |
| Paid clients | 1 | 3–5 |
| Revenue | $997 | $3,000+ |

---

### Month 2 — WATER (Days 31–60, 2026-05-28 to 2026-06-26)

**Theme:** Double down on what got replies. Let the flywheel start turning. Your first clients become your first testimonials.

**New actions this month:**
- Follow up EVERY affiliate contact from Month 1 — anyone who opened but didn't reply gets a second touch
- Collect first testimonials from any paid clients (video preferred, written fine)
- Post testimonials/results on LinkedIn and Instagram — real proof performs better than any other content
- Add Instagram Reels: repurpose your best LinkedIn posts as 30-second vertical videos
- Flip `ENABLE_HTML_PITCH_EMAIL=true` on Vercel (domains are warmed — HTML email with preview screenshot unlocks)
- If open rate is below 25%, test 3 new subject lines this month — run each for 5 days before calling it
- Follow up all 19 affiliate emails with a second personal touch (phone or email)
- Add Google Business Profile for BlueJays (30 min, compounds forever)

**Daily habits (same 115 min/day — never changes):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Email volume:** 200/day stable (100/domain)

**Month 2 content themes:**
- Week 1: first client result (anonymized if needed), affiliate program, email stats update
- Week 2: "Here's what 60 days of cold email taught me", showcase deep-dives
- Week 3: repurpose best Month 1 posts with updated data, objection handling posts
- Week 4: 60-day numbers, what's working, what's not

**Month 2 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 6,000 | 9,000+ |
| Affiliate referrals received | 1 | 3+ |
| LinkedIn followers gained | 100 | 300+ |
| Instagram followers gained | 50 | 200+ |
| Testimonials collected | 1 | 3 |
| Paid clients this month | 2 | 5 |
| Cumulative revenue | $2,000+ | $6,000+ |

---

### Month 3 — SPROUT (Days 61–90, 2026-06-27 to 2026-07-26)

**Theme:** The machine should be running. Your job this month is to find the bottleneck and eliminate it. One fix to the weakest stage compounds across everything else.

**New actions this month:**
- Run a full funnel audit: open rate → click rate → claim page → checkout. Find the single weakest link and fix only that
- Add LinkedIn Sales Navigator ($79/mo) — reach decision-makers directly, not just cold email
- Add Apollo.io ($30/mo) — enrich prospect data, find LinkedIn profiles of business owners
- Enable Lob postcards for Day 7 cohort (high-intent prospects only — 4.5★+ rating)
- Start 1 new outreach channel: either LinkedIn DMs OR outbound voice calls (pick one, commit for the full month)
- Expand affiliate outreach — add 10 more contacts from new counties

**Daily habits (115 min/day):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 3 content themes:**
- Week 1: "The funnel audit — here's what I found", results from Month 2
- Week 2: deep-dive on the new channel you added
- Week 3: before/after showcase for a real paid client (with permission)
- Week 4: 90-day numbers — raw, honest, specific

**Month 3 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Cold emails sent | 6,000 | 9,000+ |
| LinkedIn DMs or calls | 200 | 500+ |
| Affiliate referrals received | 2 | 6+ |
| LinkedIn followers total | 300 | 800+ |
| Paid clients this month | 3 | 8 |
| Cumulative revenue | $5,000+ | $15,000+ |

---

### Month 4 — GROW (Days 91–120, 2026-07-27 to 2026-08-25)

**Theme:** You have proof now. Use it. Social proof is the highest-leverage asset you own — a real testimonial does more work per post than any cold pitch ever will.

**New actions this month:**
- Hire part-time VA ($5–8/hr, 10 hrs/wk) for inbox triage and outreach support — frees 2 hrs/day of Ben's time
- Add retargeting pixels to /preview and /claim pages (Meta Pixel + Google Ads tag) — start $50/mo in retargeting ads
- Publish a case study post: one client, real numbers, real result — this single post will outperform everything else you wrote in Month 1
- Add a "Results" page or highlight reel to bluejayportfolio.com — let the work sell itself
- Start A/B testing email subject lines systematically — one variable at a time
- Expand to 3rd email warming domain if volume needs to exceed 200/day

**Daily habits (115 min/day — same forever):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 4 content themes:**
- Week 1: case study deep-dive (the client, the site, the result)
- Week 2: "What I learned building 10 websites" — patterns, surprises, mistakes
- Week 3: retargeting and paid ads explainer (builds personal brand as a smart operator)
- Week 4: 120-day numbers

**Month 4 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 5 | 12 |
| Cumulative revenue | $10,000+ | $25,000+ |
| LinkedIn followers total | 600 | 1,500+ |
| Active affiliates | 3 | 8+ |
| Retargeting ads live | Yes | Yes |
| VA hired | Yes | Yes |

---

### Month 5 — SCALE (Days 121–150, 2026-08-26 to 2026-09-24)

**Theme:** The system works. Now make it bigger. Everything you do this month is about increasing capacity without proportionally increasing your own time.

**New actions this month:**
- Hire part-time junior designer ($15–25/hr, 20 hrs/wk) — offload template customizations
- Systemize the handoff: create a documented process so the VA can run intake without you
- Run NPS on every paid client from Months 1–4 — collect promoters and activate them
- Launch a referral blast to all NPS promoters — personal message from Ben, not automated
- Record 5 Loom walkthroughs for top prospects (high-signal, clicked-but-didn't-claim)
- Add 4th email warming domain if needed for 400+/day volume

**Daily habits (115 min/day):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 5 content themes:**
- Week 1: "I hired my first person — here's what changed"
- Week 2: NPS results, what clients actually said
- Week 3: "The referral machine — how I'm getting clients from clients"
- Week 4: 150-day update — cumulative everything

**Month 5 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 8 | 20 |
| Cumulative revenue | $20,000+ | $45,000+ |
| LinkedIn followers total | 1,000 | 2,500+ |
| Referrals from NPS promoters | 2 | 8+ |
| Team (VA + designer) | 2 | 3 |

---

### Month 6 — MACHINE (Days 151–180, 2026-09-25 to 2026-10-24)

**Theme:** This is the proof-of-concept month. If the system works, it runs mostly without you. Your job is closing deals, managing the team, and planning Month 7+.

**New actions this month:**
- Closer/sales rep hire if volume warrants it ($50K base + 10% commission)
- Full funnel review: which channel produced the most paid clients? Double it in Month 7
- Publish "6 months of BlueJays" post — this will be the most viral content you've ever written
- Plan Month 7+ based on real data: which channel, which category, which county is the winner
- Evaluate Vercel Enterprise if domain count is approaching 50 on Pro plan
- Set up proper bookkeeping: revenue, costs, margins, CAC, LTV — know your numbers cold

**Daily habits (115 min/day — still, always):**
- LinkedIn post
- Instagram post
- Warm outreach / referral follow-ups
- Affiliate check
- Pipeline review

**Month 6 content themes:**
- Week 1: "6-month milestone" post — real numbers only
- Week 2: "Here's the exact system" — full transparency, builds massive credibility
- Week 3: team spotlight, process post
- Week 4: "What Month 7 looks like" — forward-looking, creates anticipation

**Month 6 targets:**

| Metric | Minimum | Strong |
|---|---|---|
| Paid clients this month | 12 | 25+ |
| Cumulative 6-month revenue | $30,000+ | $75,000+ |
| Total paying sites | 30 | 75+ |
| LinkedIn followers total | 1,500 | 5,000+ |
| Active affiliates | 5 | 15+ |
| Monthly recurring (renewals) | $3,000/yr | $7,500+/yr |

---

### 6-Month Summary Scorecard

| Month | Theme | Paid Clients (min) | Cumulative Revenue (min) |
|---|---|---|---|
| Month 1 | PLANT | 1 | $997 |
| Month 2 | WATER | 3 | $4,000 |
| Month 3 | SPROUT | 6 | $10,000 |
| Month 4 | GROW | 11 | $21,000 |
| Month 5 | SCALE | 19 | $40,000 |
| Month 6 | MACHINE | 31 | $71,000 |

Miss minimum 2 months in a row → stop adding channels and fix the conversion bottleneck first. The problem is never volume. It's always the weakest stage in the funnel.

---

### Marketing Stats Tracking Rules (NON-NEGOTIABLE)

Every session where Ben reports completing a habit or outreach action, Claude MUST update the Progress Log below immediately. The log is the single source of truth for whether Ben is on track against the Hormozi ramp targets.

**What gets logged every session:**
- LinkedIn posts published (running total toward 30/month)
- Instagram posts published (running total toward 30/month)
- Warm messages sent (running total toward 100/month)
- Affiliate emails sent + delivered vs bounced
- Affiliate replies received + follow-ups done
- Cold emails sent (from dashboard)
- Pipeline actions (approvals, replies)
- Paid clients signed + revenue

**How to check progress vs targets:**
At the start of every session, compare the progress log totals against the current month's targets table. If any metric is behind pace, call it out specifically: "You need X more LinkedIn posts this month to hit 30. You're on pace for Y at current rate."

**Pace math (Month 1):**
- LinkedIn: 1/day = 30 total. Behind if cumulative < (current day - 1)
- Warm messages: ~3.3/day = 100 total. Behind if cumulative < (current day × 3.3)
- Cold emails: auto-send, just verify it's running
- Affiliate follow-ups: any reply gets a same-day response

### Progress Log (updated each session — Ben's running scoreboard)

**Day 1 — 2026-04-28: ✅ COMPLETE**
- ✅ LinkedIn account created (business)
- ✅ Instagram account created (business)
- ✅ LinkedIn post published
- ✅ Warm outreach: 20 messages sent to friends/family
- ✅ Pipeline review: done
- ✅ 19 affiliate partner emails attempted (Fobian, Pratt, Hadlock, Castell, Haguewood + 14 Mason/Kitsap targets)
- ⚠️ 8 of 19 affiliate emails bounced — need correct addresses, resend pending
- ✅ 11 of 19 affiliate emails delivered
- Cold emails: warming ramp starting (20/day)
- Paid clients: 0
- Notes: Perfect Day 1. All three habits done. Strongest possible start.

---


---

<!-- moved from CLAUDE.md: ## Today's Tasks — Day [N] ([date]) -->

## Today's Tasks — Day [N] ([date])

### GROWTH RAMP
[day-specific tasks from the schedule below]

### PERMANENT DAILY HABITS (every day, no exceptions)
- [ ] Warm Outreach / Referral follow-ups (20 min)
- [ ] 1 LinkedIn post (30 min) — see content ideas by week below
- [ ] 1 Instagram post (15 min) — repurpose the LinkedIn post, vertical format
- [ ] Affiliate check (10 min) — reply to any affiliate replies, follow up open conversations
- [ ] Pipeline review: approve previews, reply to engaged leads (20 min)
```

Always show the GROWTH RAMP category first, then PERMANENT DAILY HABITS. Never merge them. Always include checkboxes.

---

### Permanent Daily Habits (115 min/day — run forever past Day 30)

| Habit | Time | Target |
|---|---|---|
| Warm outreach / referral follow-ups | 20 min | Days 1-14: 10 new personal contacts/day. Days 15-21: follow up open conversations only. Day 22+: pure relationship mode — respond and nurture. |
| LinkedIn post | 30 min | One post per day. Use content ideas by week below. Never skip. |
| Instagram post | 15 min | Repurpose the LinkedIn post — same message, vertical format. Reels perform best. Never skip. |
| Affiliate check | 10 min | Reply to any affiliate replies that came in. Follow up open affiliate conversations. Days 1-30: also track who hasn't replied yet and re-approach. |
| Pipeline review | 20 min | Approve pending-review previews, review AI reply drafts, personally reply to any engaged lead (clicked preview or submitted /audit). |

**Email volume targets (auto-send — just verify it's running):**
- Days 1-7: 10/domain/day = 20 total
- Days 8-14: ~50/domain/day = 100 total
- Days 15+: 100/domain/day = 200 total (hold indefinitely)

---

### Week 1 Day-Specific Tasks (Days 1–7)

**Day 1:**
- Compile your full warm contact list (target 100+ names: friends, family, ex-coworkers, gym, church, neighbors, anyone who knows a business owner)
- Publish origin post on LinkedIn: "I'm building websites for local businesses using AI. Here's why."
- Add /audit link to every email signature
- Approve 3–5 prospects in dashboard

**Day 2:**
- Send 10 personal warm messages (use script below — NOT the cold email)
- Post LinkedIn: before/after screenshot of one V2 preview + one line of caption
- Review any overnight email replies

**Day 3:**
- Send 10 more warm messages
- Post LinkedIn: "The local business website problem" — describe the gap you're solving in one paragraph
- Approve pipeline batch
- Draft your referral program one-pager ($150 cash per closed referral)

**Day 4:**
- Follow up any Day 2 warm contacts who replied
- Post LinkedIn: one real pipeline stat (e.g. "Sent 60 emails this week. 3 people clicked their preview.")
- Identify 5 potential affiliate partners: local SEO agency, Google/Meta ad freelancer, business coach, accountant, print shop

**Day 5:**
- Send 10 more warm messages
- Post LinkedIn: "Here's how I find businesses with outdated websites" — describe the Google Places scout process plainly
- Check email open rates — is subject line hitting >25%?

**Day 6:**
- Send 10 more warm messages
- Post LinkedIn: category story — "I built a site for a [dental/electrician/salon] in [city] before they knew I existed."
- Approve pipeline batch

**Day 7 (weekly review):**
- Send 10 more warm messages
- Post LinkedIn: Week 1 numbers post — emails sent, open rate, preview clicks, conversations started
- Weekly review checklist: email open rate >30%? Pipeline healthy? 50 warm messages sent this week?

---

### Week 2 Day-Specific Tasks (Days 8–14)

**Day 8:**
- Send 10 warm messages + follow up any Week 1 non-responders
- Post LinkedIn: "What makes a $997 website worth it" — show the 10 sections the V2 templates include
- Check domain warming stats — both domains healthy?
- Personally text Steadfast Plumbing (360) 797-2979 — warm human call, not the cold email script

**Day 9:**
- Send 10 warm messages
- Post LinkedIn: screenshot your dashboard stats (sites built, pipeline count) — transparency builds trust
- Reach out to the first affiliate target from Day 4 (personal email, not cold)

**Day 10:**
- Send 10 warm messages
- Post LinkedIn: "One thing every local business website is missing" — give real actionable value, no pitch
- Add the $100 referral incentive to the NPS promoter email (Rule 44 in codebase)

**Day 11:**
- Follow up any Day 2-3 warm contacts who showed interest
- Post LinkedIn: address a real objection you've received ("I already have a website" → your reframe)
- Text Sequim Valley Electric (360) 681-3330

**Day 12:**
- Send 10 warm messages
- Post LinkedIn: "The hardest part about cold pitching local businesses" — honest and relatable
- Follow up the 5 affiliate targets identified on Day 4

**Day 13:**
- Send 10 warm messages
- Post LinkedIn: before/after (different category than Week 1)
- Weekly email performance review

**Day 14 (warmup milestone):**
- 100 warm messages sent total across 2 weeks — relationship mode begins
- Post LinkedIn: 14-day update — real numbers, real honesty
- PRIMARY DOMAIN WARMUP COMPLETE — verify 100/day sending is active
- Milestone check: open rate target hit? First reply conversations? LinkedIn getting traction?

---

### Week 3 Day-Specific Tasks (Days 15–21)

Email volume now at 200/day. Focus shifts to optimizing the bottleneck.

**Day 15:**
- Shift warm outreach: stop cold personal messages, start following up everyone who showed interest in Weeks 1-2
- Post LinkedIn: feature one specific V2 showcase with link — "This is what a [category] site should look like."
- Identify the #1 funnel bottleneck (open rate → click rate → claim page → checkout — which step is weakest?)
- Build the affiliate partner page at /partners: one paragraph, the $150 offer, a simple form

**Day 16:**
- 5 targeted warm follow-ups (quality over quantity)
- Post LinkedIn: "I sent 200 cold emails yesterday. Here's what came back." — real data
- Reach out to 3 more affiliate targets with the /partners link

**Day 17:**
- Follow up any referral intros received from warm outreach
- Post LinkedIn: educational value post — teach something about local SEO or web design a business owner would use
- Full reply queue review

**Day 18:**
- Post LinkedIn: social proof — if you have a paid client, share it (anonymized or with permission). If not, share a real preview reaction.
- Implement one change at the identified bottleneck (subject line test, claim page headline test, email opener variant — ONE THING ONLY)

**Day 19:**
- Post LinkedIn: "The business category I'm most excited to build for" + showcase link
- Start tracking the bottleneck change from Day 18 — open a note to record results daily

**Day 20:**
- Post LinkedIn: Week 3 numbers — impressions, emails sent, open conversations
- Follow up all open affiliate conversations

**Day 21 (first paid client target):**
- Post LinkedIn: Month 1 halfway point — what's working, what isn't
- Weekly review: if no paid client yet, audit the claim page flow in incognito — is there friction you're not seeing?
- Confirm referral incentive is live in NPS emails

---

### Week 4 Day-Specific Tasks (Days 22–30)

Lock in habits. Optimize. Let compound effects build.

**Day 22:**
- Follow up all open warm conversations
- Post LinkedIn: "The affiliate program — if you know local business owners, here's how to make $150 per referral"
- Check bottleneck test results from Day 18 — is the metric moving?

**Day 23:**
- Post LinkedIn: deep-dive on one premium feature (comparison table, interactive quiz, Google review header) — teach it like you're showing a business owner what they're getting

**Day 24:**
- Post LinkedIn: repurpose your best-performing Week 1 post with updated data
- Walk any active affiliate partners through the referral process personally

**Day 25:**
- Post LinkedIn: "Month 1 of BlueJays. What I learned." — full transparency post. This one should be long.
- Implement bottleneck test #2 (different variable from Day 18)

**Day 26:**
- Post LinkedIn: one category-specific post for the vertical you're pitching most this week

**Day 27:**
- Post LinkedIn: "How the AI pipeline works in 5 steps" — process transparency for marketers/builders in your audience

**Days 28–30 (Month 1 close):**
- Post LinkedIn: 30-day final numbers post — every metric, every lesson. This post will perform well.
- Clear entire reply queue — respond to every engaged lead personally
- Full month review against targets (see below)
- Plan Month 2: which channel showed the most traction? Double it.

---

### Warm Outreach Script (Days 1–14, personal text/DM — NOT the cold email)

> "Hey [name] — I started a company building premium websites for local businesses. I build the site first and show it to them before asking for anything. Do you know any business owner whose website looks outdated? I'll build theirs for free to show what I do. No pressure at all."

When they reply with a name: ask for a three-way text introduction. "Could you intro us over text? That way I can follow up directly."

---

### LinkedIn Content Ideas by Week

**Week 1 — Origin and Problem:**
origin story, before/after visual, the local business website gap, pipeline stat, how I find businesses, category story, Week 1 numbers

**Week 2 — Value and Process:**
what makes the $997 worth it, dashboard stats transparency, one thing every website is missing, objection reframe, the hardest part of cold pitching, before/after (new category), 14-day update

**Week 3 — Proof and Education:**
V2 showcase feature, real email results data, local SEO teaching post, social proof / reaction, favourite category + link, Week 3 numbers, halfway point reflection

**Week 4 — Scale and System:**
the affiliate program, premium feature deep-dive, repurpose best Week 1 post, Month 1 full transparency, category-specific pitch week post, how the pipeline works, 30-day final numbers

**Universal rules for every post:**
- Specific numbers always beat vague claims ("3 out of 47 replied" beats "some people responded")
- Before/after visuals are the highest-performing format — use them whenever possible
- End every post with one question to drive comments
- Never pitch in the post body — let the content pull people to your profile where the /audit link lives

---

### Day 30 Success Targets

| Metric | Minimum | Strong |
|---|---|---|
| Total cold emails sent | 3,000 | 4,500+ |
| Warm messages sent | 100 | 150+ |
| LinkedIn posts | 30 | 30 |
| LinkedIn impressions | 5,000 | 15,000+ |
| Open prospect conversations | 15 | 40+ |
| Affiliate partners active | 2 | 5+ |
| Paid clients | 1 | 3–5 |
| Revenue | $997 | $3,000+ |

If Day 30 lands below minimum on paid clients: do NOT add new channels. Audit the claim page in incognito, personally call every prospect who clicked the preview link but didn't claim, and run one more week before expanding. The bottleneck is conversion, not volume.

---

### The Compounding Flywheel (reference when explaining progress to Ben)

```
Warm Outreach ──► First clients ──► Testimonials ──► Social proof
                                                          │
Cold Email ───► Preview clicks ──► Claim page ──► Revenue │
                                                          │
Content ──────► Inbound DMs ───► Warm leads ─────────────┘
                     │
                     └──► Affiliates find you ──► Passive lead flow
```

After Day 30, every channel feeds every other channel. The goal of Month 1 is to start all three flywheels spinning. Month 2 is where they start pulling each other.

---


---

<!-- moved from CLAUDE.md: ## Locked-In Rules — Session 2026-05-06 evening (manufacturer ICP buildout + Madie's portal) -->

## Locked-In Rules — Session 2026-05-06 evening (manufacturer ICP buildout + Madie's portal)

These came out of the manufacturer-ICP deep-dive day. Each captures a pattern that's now non-negotiable for future agents.

### Locked-In Rule 67 — Multi-anchor ICP validation (NON-NEGOTIABLE)

Don't lock a customer-profile pattern on 1-2 anchors. **Need ≥3 anchor data points across radically different verticals before treating a shape as "the ICP."** One close = anecdote. Two closes = correlation. Three closes across radically different verticals = the pattern is real, vertical-agnostic, and worth coding against.

**Why this rule exists:** It's tempting to lock the ICP on the first big close. Two closes in the same niche feel like a pattern but they're often selection bias. Three closes across different verticals (today: ITC steel ag-equipment + Zenith sports gear + Nevarland kids' apparel) prove the shape is structural, not vertical-specific.

**Apply to:**
- New customer-profile decisions (e.g. "is this our Pro tier ICP?")
- Scout-category buildouts (don't add a category until 3 anchors confirm the shape works there)
- Pitch-asset decisions (don't productize a lead-magnet pair until 3 different verticals adopted it)

**The 2026-05-06 reference run:** 3-segment audience taxonomy (end-buyer + influencer + channel-partner) locked across ITC + Zenith + Nevarland. See `aios/decisions/2026-05-06_manufacturer_icp_3anchor_lock.md`.

### Locked-In Rule 68 — Color-coded high-ticket cold leads (pink/purple/layered)

Every BlueJays admin surface that lists prospects MUST visually distinguish high-ticket cold leads with a 3-element treatment (left-strip + bg tint + chip):

- **Pink** = manufacturer-lookalike (`lookalikeCategory IS NOT NULL` — any of the 6 mfg-* slugs)
- **Purple** = Full System / agency-replacement (`pricingTier === 'fullsystem'` — covers Cut-My-Agency calc submitters + agency landing-page bookers + manual fullsystem flips)
- **Layered** when both apply: pink strip + purple chip both render

**Surfaces that MUST honor this** (any new admin/sales view added later inherits the requirement):
- `bluejays/src/components/dashboard/ProspectTable.tsx` (admin /dashboard)
- `bluejays/src/app/dashboard/script/LeadPicker.client.tsx` (Madie's sales portal)
- Any future operator dashboard that renders BlueJays prospects

The chip text is locked: `MFG · {lookalikeCategory.replace("mfg-", "").toUpperCase()}` for pink, `AGENCY $10K` for purple. Don't rename without updating both surfaces atomically.

### Locked-In Rule 69 — Active customers filtered out of cold sales selection

Any sales-portal / cold-outreach selection mechanism MUST exclude paying customers and clients-with-built-sites. **Hard exclusion** (filter the row out entirely), NOT dim/strikethrough.

**The conditions that mark a prospect as "already a client":**
- `status === 'paid'`
- `status === 'live'`
- `status === 'deployed'`
- `status === 'dns_transfer'`
- `siteLiveAt` is set
- `customSiteUrl` is set

**Why hard exclusion:** cold-calling an existing customer kills the relationship. Madie / Ben should never see a customer in their cold-call queue, even dimmed.

**Surfaces enforcing this** (don't add a new cold-call selection surface without inheriting the filter):
- `bluejays/src/app/dashboard/script/LeadPicker.client.tsx` (Madie's portal)
- Any future "build a call list" / "build a cold-email batch" selection UI

### Locked-In Rule 70 — Manufacturer-lookalike scout auto-tags `manuallyManaged=true`

Every `mfg-*` category prospect created by the auto-scout MUST be auto-tagged with `manuallyManaged=true` at intake (before reaching the auto-pitch funnel). Per Rule 49, the daily auto-enroll cron skips manually-managed prospects.

**Why:** the 6 mfg-* slugs are in `ACTIVE_CATEGORIES` so the scout pulls them, BUT they don't have V2 templates yet. Auto-pitching with a generic-template preview burns the highest-leverage cold-lead segment we have. Hard rule: until a V2 template exists for a manufacturer slug, every prospect in that slug gets the manual-review gate.

**Where enforced:** `bluejays/src/lib/scout.ts` — the `MANUFACTURER_LOOKALIKE_CATEGORIES` Set + the `isMfgLookalike` check at prospect-construction time (line ~84). DON'T remove this gate without first shipping a V2 template for the affected slug AND updating the rule.

**Removal trigger** (when this rule expires for a specific slug): when V2 template ships at `/v2/<slug>`, the slug graduates from manufacturer-lookalike (`manuallyManaged=true`) to standard-tier auto-pitch. At that point: drop the slug from `MANUFACTURER_LOOKALIKE_CATEGORIES` Set, ship a follow-up commit, update the `MANUFACTURER_BACKLOG.md` Status column to ✅.

### Locked-In Rule 71 — Defensibility score for product-business prospects (concept locked, scoring logic pending)

Every product-business prospect (manufacturer / brand / niche-DTC) gets a `defensibilityScore` 0-100 computed at extraction time, scoring 3 signals:

1. **Place-of-origin specificity** — does the prospect's copy name a specific manufacturing location, region, or hometown?
2. **Patent / IP / trademark / fitment data** — does the copy claim defensible product engineering (patent-pending, trademark, machine-fitment specs, lab-certified)?
3. **Named-channel relationship** — does the copy name specific dealers / clubs / camps / influencers / retailers carrying the product?

A prospect needs at least 2 of 3 to be worth pitching. Sub-30 scores get flagged for manual review BEFORE any preview build / cold pitch is sent.

**Why:** Both validated $10K closes (ITC + Zenith) win on hyper-specific identity copy. Generic manufacturers ("Quality wholesale jewelry — call us today") die in cold paid. Cheaper to filter at scout than burn pitch cycles.

**Status:** field exists on `Prospect.defensibilityScore` (added in commit `f70cc59`). Auto-compute logic in `data-extractor.ts` is pending — open task in `Bluejay Business/TASKS.md`.

**When the scoring logic ships:** wire a `defensibilityScore < 30` filter into the auto-enroll cron's candidates query so weak prospects never enter the pitch funnel automatically. Manual override available via dashboard.

### Locked-In Rule 72 — Content fidelity when porting a real source's copy (NON-NEGOTIABLE)

When the directive is "use the real source content" (e.g. porting a client's existing site to a new build, rebuilding a prospect's site under a new brand name, migrating between platforms), every claim on the new build MUST be grounded in the source. Claims not in the source are fabrications.

**Default behavior:**
1. Scrape the source-of-truth URL
2. Diff its claims against the derivative
3. Surface fabrications (P0 specifics like dollar amounts / certifications / page counts; P1 softer like service offerings / geographic claims)
4. Soften (rephrase to source-grounded alternative) OR remove (delete the section entirely if source has nothing comparable)
5. NEVER invent specifics — pricing, certifications, page counts, time-frames, staff names, customer counts

**Why:** Specificity gaps are TBD-able. Invented claims poison trust forever — and are libel-adjacent for healthcare / financial / legal verticals.

**The 2026-05-06 reference run:** Olympic Inspections rebuild from `pineparticle.com`. Stripped fabricated "AIHA-LAP labs" / "10-25 page PDF" / "homes over 30 years old" / 3 fake "Coming soon" services. Replaced with source-grounded language ("ISO/IEC 17025-accredited laboratory" / "fast turnaround" / Pine & Particle's actual founder origin story).

**Skill that runs this audit:** `aios/.claude/skills/content_fidelity_audit/SKILL.md` (added 2026-05-06).

---

### Locked-In Rule 73 — Locked Decisions Cascade Forward As Defaults (NON-NEGOTIABLE)

Established 2026-05-06 by Ben after the MOCK BACKEND build. Re-asking
the same Rule 48 questions on every instance of a repeating-pattern
build wastes Ben's time AND signals the agent didn't learn from the
first round. Once Ben locks decisions on a pattern, those decisions
become DEFAULTS for the next instance until he explicitly changes them.

**The rule:**

When a repeating-pattern build (MOCK BACKEND install, bespoke client
showcase, V2 template, animated trade illustration, funnel sequence,
etc.) gets done for the first time AND Ben locked specific decisions
during the Rule 48 question gate, those decisions get captured into:

1. **The relevant operational playbook** under a "Locked defaults — DO
   NOT re-ask" section (e.g. `docs/MOCK_BACKEND_PLAYBOOK.md`)
2. **The matching AIOS skill** under "Defaults — don't re-ask"
   (e.g. `aios/.claude/skills/mock_backend/SKILL.md`)

When a future instance of that pattern hits, the agent:
1. **Reads the locked-defaults section first** — this is the new
   baseline
2. **Skips the locked questions entirely** — don't re-ask "what URL
   pattern" / "what password" / "what tab list" / etc.
3. **Asks only NEW questions** that focus on:
   - What's UNIQUE to THIS instance (the prospect, the industry, the
     specific data, the geography)
   - Decisions the prior build didn't surface (genuinely new ground)
   - Anything Ben explicitly flags as different from default
4. **Confirms defaults at the end** — single-line "applying defaults
   X / Y / Z unless you say otherwise" so Ben can override if needed
   without burning 10 questions on it

**The compounding payoff:**

- First instance of a pattern: 10 questions, ~30 min of Q&A
- Second instance: 3-5 questions on what's unique, ~5 min
- Third+ instance: 1-2 confirmations, ~1 min

The rule applies to ANY repeating-pattern build, not just MOCK BACKEND:

| Pattern | Playbook | First instance | Locked defaults examples |
|---|---|---|---|
| MOCK BACKEND install | `docs/MOCK_BACKEND_PLAYBOOK.md` | Meyer Electric (2026-05-06) | URL pattern, password, scale, tab list, persistence, branding, doc location |
| Bespoke client showcase | `docs/bespoke-client.md` (TBD) | Hector / Meyer / Masters / KR / OIT | metadata override pattern, sitemap entry, 1/3 padding default, photo dedup audit |
| V2 template build | `docs/V2_UPGRADE_CHECKLIST.md` | Per CLAUDE.md V2 upgrade rules | section count, premium features list |
| Animated trade illustration | (in CLAUDE.md Rule 70) | Powerwall + Generac (Meyer) | CSS keyframes only, namespace prefix, prefers-reduced-motion |
| Funnel sequence | `src/lib/client-funnels/zenith-sports.ts` | Zenith | step shape, audience taxonomy, cadence rules |

**Failure modes the rule prevents:**

- Re-asking "what URL pattern should the demo use" when /portal-demo
  is already locked → wastes Ben's time AND makes him distrust the agent
- Defaulting to a different password than 1212 because the question
  wasn't asked → breaks the demo on the sales call
- Inventing a different scale (50 leads instead of 200) because the
  prior decision wasn't carried forward → the demo feels light
- Each agent run starting from zero — no compounding

**The agent's responsibility:**

When invoking a repeating-pattern build, the FIRST thing the agent
does (BEFORE asking any questions) is check for the playbook + AIOS
skill and read the "Locked defaults" section. The questions that come
AFTER are what's not yet decided, what's unique to this instance, OR
what Ben explicitly wants to deviate on.

**Forbidden:**

- Re-asking a locked question without explicit "I'm reconsidering X"
  signal from Ben
- Treating a default as soft / "well I'd ask anyway in case you
  changed your mind" — defaults stand until Ben overrides
- Adding new decisions to a pattern without writing them into the
  playbook (otherwise the next agent doesn't know about them)

**When Ben changes his mind on a previously-locked default:**

He says "actually let's switch X to Y." The agent:
1. Confirms the change in chat
2. Updates the playbook locked-defaults section in the SAME commit
3. Updates the AIOS skill if that pattern has one
4. Notes the date of the override

This way the system learns. Locked-decisions are durable but not
frozen — they evolve in lockstep with Ben's evolving operating taste.

---

### Locked-In Rule 74 — Funnel Stages Are Monotonic + Bar Visualization REQUIRED (NON-NEGOTIABLE)

Established 2026-05-06 by Ben after the Meyer mock-backend Funnels tab
shipped a per-step conversion bar that visually went 100 → 38 → 81 →
64 → 51. Per-step conversion RATE is fine domain data, but rendered as
a funnel-shaped bar chart it reads as "we lost people, then got them
back" — structurally impossible in a funnel and an instant realism
killer for prospects on the sales call.

**The rule:** any UI that visualizes a funnel — bar widths, vertical
heights, tapering nodes, reach pills, dot sizes per stage, ANY visual
rhythm that maps "step N" to a magnitude — MUST display **CUMULATIVE
REACH** (% of the original 100% who reach this step) AND that sequence
MUST be monotonically non-increasing across the steps.

A funnel only scales down. Period.

**What this means in practice:**

1. **Data layer.** When a `FunnelStep` (or equivalent) exposes a
   `conversion_pct` / `reachPct` / similar field, the documented
   semantic is **cumulative reach**, not per-step rate.
   - `conversion_pct[0] === 100` (entry point)
   - `conversion_pct[i] <= conversion_pct[i-1]` for all i
   - Last step's value should match the funnel's overall close-rate
     (e.g. `conversion_rate = 25.5%` → final step's reach = 25.5)
   - If a per-step conversion RATE is genuinely useful for the
     business reader, surface it as a SEPARATE field
     (`step_close_rate_pct` or similar) — never re-use the cumulative
     field for it.

2. **Reference type.** `FunnelStep` in
   `src/app/clients/meyer-electric/portal-demo/mock-data.ts` documents
   the cumulative-reach semantic. Future funnel types in other
   surfaces (e.g. `FunnelStepLite` in
   `src/components/portal/FunnelVisualModal.tsx`,
   per-client `client-funnels/*.ts`) MUST follow the same convention.

3. **Defensive rendering.** Any rendering surface that takes per-step
   reach numbers from outside (props, API response, scraped data,
   fixture) MUST run them through `monotonizeReach()` from
   `src/components/portal/FunnelVisualModal.tsx` before using them
   for visual sizing. This is the backstop — it can't fix bad upstream
   data, but it guarantees the rendered visual still reads as a
   monotonically narrowing funnel.

4. **Industry-typical baselines** (e.g. `REACH_BASELINE_BY_INDEX` in
   `FunnelVisualModal.tsx`) MUST also be monotonic by construction.
   When adding new baselines, eyeball the array — if any value is
   greater than its left neighbor, fix it before merging.

5. **Mock data.** The 4 funnels in Meyer's `mock-data.ts FUNNELS`
   array are the canonical reference. When seeding a new mock-backend
   industry, copy that shape — every step's `conversion_pct` is
   cumulative-monotonic, last step matches `conversion_rate`.

**The trap to avoid (caught 2026-05-06):**

Storing `conversion_pct` as the per-step conversion RATE
(e.g. "81% of people who reached step 3 convert to step 4") IS
domain-accurate. But the moment a UI renders that value as a bar
width, the visual reads as a non-monotonic funnel — and prospects on
the sales call notice immediately. The fix is to store cumulative
reach in `conversion_pct` AND surface per-step rate (when needed) in
a separately-named field. Never let one field carry both meanings.

**What the rule covers:**

- Per-step bar charts (Meyer mock-backend's old inline view —
  removed 2026-05-06)
- Tapering vertical funnel nodes (FunnelVisualModal)
- Reach pills next to each step
- Dot-size-by-step on map overlays
- Any future "show me the funnel" visualization Ben builds

**Forbidden:**

- Hardcoding non-monotonic values into a fixture / mock dataset
- Reading per-step conversion rate from a "rate" field and rendering
  it as a bar width without cumulative-multiplying first
- Adding a new baseline curve to any "reach by step index" array
  without verifying it's monotonic
- Skipping `monotonizeReach()` on the rendering side because "the
  data is correct" — defensive guards exist precisely so a future
  data bug can't silently bypass the rule
- Inventing creative "curved" funnel shapes that scale up between
  steps for any reason (engagement spike, viral re-share, etc.) —
  if the business story genuinely is non-monotonic, that's a
  separate visualization (re-engagement loop chart), NOT the
  audience funnel

**This rule cascades:**

- Update the AIOS `mock_backend` skill so future mock-backend
  installs apply this rule by default
- Update the AI Package Playbook so every new client's Funnels tab
  inherits the convention
- Reference this rule in code comments where cumulative-reach data
  is defined or rendered, so the next agent sees the constraint
  inline

**Bar visualization is REQUIRED on every funnel surface (locked
2026-05-06).** Beyond the monotonic-data constraint above, every
funnel rendering MUST display the per-step cumulative reach as a
horizontal bar — not optional. Ben's catch: the tapering vertical
funnel boxes alone aren't dense enough; prospects need to see at a
glance "where am I losing people, and how much?" The bars answer
that.

**Required UI on every step row:**

1. **Cumulative-reach bar** — full-width below the step label,
   yellow→orange gradient fill (`linear-gradient(90deg, #facc15 0%,
   #f97316 100%)`), height ≈ 6px (`h-1.5`), track in `bg-white/[0.06]`.
   Width = the step's cumulative reach %. Bars must monotonically
   shrink left-to-right across steps (data is already monotonic per
   the rule above; defensive `monotonizeReach()` is the backstop).
2. **Reach % number** — bold, tabular-nums, white text, right-aligned
   above the bar (e.g. `25%`).
3. **Drop-off pill** — when step N's reach is less than step N-1's,
   show a `−{X} pp` pill in rose
   (`text-rose-300/90 bg-rose-500/[0.08] border-rose-500/20`) next to
   the % number. Step 1 has no drop-off pill (it's the entry point).
4. **Close-rate pill (REQUIRED — added 2026-05-07)** — a green
   `→ {X}% close` pill in the right cluster above the bar (between
   the drop-off pill and the reach % number). Shows what % of the
   people who reached THIS step eventually closed as a sale.
   Mathematically derived: `closeRatePct = finalReach / cumulativeReach[i] × 100`.
   Naturally monotonically NON-DECREASING across steps (people deeper
   in the funnel are higher-quality leads; their close rate is higher).
   Last step always 100% (those people ARE the closes — that's the
   punchline of the funnel). Pill styling:
   `text-emerald-300/90 bg-emerald-500/[0.08] border-emerald-500/25`
   to match the existing "Won · converted" emerald theme. Required on
   EVERY step including step 1 and the final step — the visual rhythm
   compounds the realism. Never suppress on the last step ("100% close"
   is the proof the math is consistent + lands the funnel's sales
   story). The reasoning: the cumulative reach bar tells the prospect
   "where am I losing people"; the close-rate pill tells them
   "but the people who DO get here convert at X%" — together they
   carry the full funnel story.
5. **Measured-vs-baseline label** — small italic note below the bar.
   `Cumulative reach` when `step.cumulativeReachPct` came from
   measurement; `Cumulative reach · est. baseline` when the surface
   fell back to `REACH_BASELINE_BY_INDEX`. Lets prospects tell what's
   real per-client data vs industry-typical estimate.

**Reference implementation:** `FunnelStepRow` inside
`src/components/portal/FunnelVisualModal.tsx`. The reach math (prefer
real `cumulativeReachPct`, else baseline curve, ALWAYS via
`monotonizeReach()`) lives in the IIFE wrapping the steps map in the
parent component. Don't duplicate this logic — reuse the modal.

**Forbidden:**

- Shipping a funnel-surface step row WITHOUT the cumulative-reach bar
- Showing reach % only as text without the visual bar
- Inverting the bar (filling from the right, growing instead of
  shrinking) for any "creative" reason
- Using a non-monotonic gradient that visually implies an upward
  bump between steps
- Omitting the drop-off pill on steps where reach actually dropped
  (it's the highest-signal element on the row — that's where the
  business problem is)
- Omitting the close-rate pill on ANY step (including step 1 and the
  final step). The pill is required on all rows for visual rhythm.
  "100% close" on the final step is intentional — it's the punchline
  that proves the funnel math is consistent
- Showing the close-rate pill in any color OTHER than emerald
  (must match the existing "Won · converted" green theme — color
  carries the "this is the conversion signal" semantic)
- Suppressing or hiding the close-rate pill when step 1's close rate
  equals the funnel's overall close rate (it does — that's correct,
  step 1 = whole funnel audience). Showing it is the proof the math
  works end-to-end

**Cascades:**

- Per-client owner portal Funnels tab (already shipped via
  `FunnelVisualModal` — Zenith + Meyer mock both inherit)
- Future BlueJays admin funnel surfaces (e.g.
  `/dashboard/clients/[slug]/funnels` if/when it ships) MUST use the
  shared modal, not roll their own renderer
- Mock-backend installs (any new industry config) inherit
  automatically because they go through the shared modal
- AI Package Playbook + Mock Backend Playbook updated in lockstep

### Locked-In Rule 75 — Cross-project ripples (every commit checks for cascade)

Locked 2026-05-06 by Ben. The bluejays / aios / LCAC codebases share a
gravitational field — patterns shipped in one often need to ripple into
the others. Today this happens hit-or-miss; this rule makes it
mechanical.

**Every bluejays/ commit MUST check for these cascade triggers and
update the relevant aios/ artifact IN THE SAME COMMIT WAVE:**

1. **New locked decision (anything Ben says "lock this in")** →
   - Append entry to `~/.claude/projects/.../memory/recent_locked_decisions.md`
   - If it's a repeating-pattern decision (Rule 11) → also write to relevant playbook's "Locked defaults" section

2. **New productizable pattern (something a Pro client could use)** →
   - Add row to `aios/PRO_SYNTHESIS.md` synthesis log (Rule 64)

3. **New CLAUDE.md rule** →
   - If it affects Ben's personal workflow → mirror in `aios/CLAUDE.md` working principles
   - If it's project-specific (this codebase only) → no aios/ ripple needed

4. **New skill scaffolded** →
   - Add to `aios/.claude/skills/{name}/SKILL.md` if it's reusable across projects
   - Reference in `aios/CLAUDE.md` skill index if applicable

5. **New question template (5+ Q gate that would repeat)** →
   - Capture at `aios/references/question_templates/{type}.md` for future cascade

6. **Active client state change** (paid / live / churned / status flip) →
   - Update `~/.claude/projects/.../memory/business_state_snapshot.md`
   - Update `~/.claude/projects/.../memory/active_commitments.md` if it adds/removes a thread

7. **Cost / MRR / financial event** (new SKU, price change, infra cost added) →
   - Update `~/.claude/projects/.../memory/costs_dashboard.md` watchlist

8. **Pricing language touched** →
   - Run grep on `997` + `100/year` + new value across the codebase per
     existing Rule 1 of End-to-End Pipeline Rules
   - Update Service Agreement + PLAYBOOK + HANDOFF + public landing pages
     in lockstep

**The inverse** — `aios/` work that affects bluejays/ — also applies. New
working principle in aios/CLAUDE.md that changes how I work on bluejays/?
Ship the matching CLAUDE.md update in the same batch.

**Audited weekly by `/sync-state`** — the Monday tick scans last 7 days
of commits across all 3 codebases and surfaces ripples that should have
fired but didn't. Per `aios/CLAUDE.md` Working Principle 17 (friction
self-audit).

**When AIOS forgets to ripple** — this is itself a friction pattern
that should be self-surfaced. End-of-batch footer line "🔄 Cross-project
ripples" is non-negotiable on customer-impacting commits.



---

### Locked-In Rule 76 — Customer-facing AI features ground in a Ben-voice corpus (NON-NEGOTIABLE)

Established 2026-05-07 after the Hormozi training synthesis (see
`aios/references/hormozi_ai_principles.md`). The talk's load-bearing
insight: AI sounds like the internet ONLY when given no anchors.
With a curated corpus of YOUR work as a data source, it sounds like
YOU. BlueJays today has the prompts (cached, banned-phrases-filtered,
psychology-stack-encoded) but does NOT have the corpus. That's the
single highest-leverage missing layer in every customer-facing AI
feature.

**The rule:** every BlueJays AI feature that generates
customer-facing copy MUST reference a real Ben-voice corpus as
part of its prompt context. Banned-phrases lists + structured
prompts are necessary but not sufficient — they encode what NOT
to do, not what TO do. The corpus encodes what TO do.

### Where the corpus lives

`bluejays/data/voice-corpus/` — markdown files, version-controlled.
Each file is a curated set of REAL Ben-written work tagged by use
case:

| File | Contents | Source |
|---|---|---|
| `cold-pitches.md` | 10-20 highest-performing cold-outreach emails Ben personally wrote that got replies. Anonymized recipient (e.g. "Hi {name}"). | Ben's sent folder, top performers per `emails` table |
| `replies.md` | 10-20 Ben-written replies to engaged prospects (objection handling, discovery questions, soft closes). | Sent folder, manual curation |
| `tweets.md` | 50-100 highest-engagement tweets Ben has personally posted. Style fingerprint, not topic catalog. | X export (one-button) |
| `linkedin-posts.md` | 20-30 highest-engagement LinkedIn posts Ben has personally written. | LinkedIn export |
| `sales-call-snippets.md` | 5-10 anonymized snippets from top-closed sales calls — opener / discovery / objection-overcome / close. | Sales-call recordings, transcribed |
| `vsl-scripts.md` | The actual scripts behind the 1-2 best VSLs Ben has shipped. | His own video assets |
| `voice-rules.md` | Distilled style guide derived from the above — sentence-length tendencies, banned phrases, preferred openers, signature transitions, "what makes this Ben and not GPT." | Generated from the corpus, manually curated by Ben |

The corpus is **CURATED, not exhaustive.** 10 great pitches beat
1,000 average ones — quality of the corpus directly determines
quality of the output. Don't paste every email Ben ever sent;
paste the ones that converted or that Ben himself reads back and
nods at.

### Which AI features are gated

**MUST reference the corpus** (customer-facing copy generation):

- `getPitchEmail()` and the rest of `src/lib/email-templates.ts`
  — every cold-pitch / follow-up / nurture / dunning email
- `src/lib/sms.ts` — every SMS template
- `src/lib/ai-responder.ts` — AI auto-reply / draft-reply (the
  pending-review queue surface from Rule 38)
- `src/lib/site-audit.ts` — the human-facing copy on the audit
  page (NOT the deterministic numbers per Rule 59 — those stay
  formula-derived; the surrounding paragraphs ground in voice)
- Any future AI feature that produces text the prospect reads
  with Ben's name at the bottom

**Don't need to reference the corpus** (internal scoring /
classification — not customer-facing):

- QC scoring (`src/lib/color-review.ts`, image-quality agents,
  etc.) — these grade outputs, they don't generate them
- Intent classifier inside the AI responder (the classification
  happens upstream of the draft step; only the draft needs voice
  grounding)
- Loss-reasons classifier, engagement scoring — internal
- Scout / data-extraction pipelines — extracting facts, not
  writing voice

### How features reference the corpus (implementation contract)

1. **Read at startup, not per-request.** Voice corpus is loaded
   once at module init via `loadVoiceCorpus()` (helper to be
   added at `src/lib/voice-corpus.ts`) — caches in memory.
2. **Inject as a CACHED system-prompt segment.** Per the
   existing AI Cost Optimization Rules, voice corpus is exactly
   the kind of stable, high-token, repeated-across-calls content
   that pays for itself instantly with prompt caching
   (90% savings on cache reads). MUST be sent with
   `cache_control: { type: "ephemeral" }`.
3. **Subset by use case.** A cold-pitch generator loads
   `cold-pitches.md` + `voice-rules.md`. A reply drafter loads
   `replies.md` + `voice-rules.md`. Don't dump everything into
   every call — token budget matters even with caching.
4. **Verbatim, not paraphrased.** Ship the actual emails as
   reference samples. Never let an agent rewrite the corpus
   "for clarity" — the messy cadence and personality IS the
   signal.

### Maintenance triggers

- **When a sent email gets a reply that converts** → consider
  adding it to `cold-pitches.md` (or `replies.md` if it was a
  follow-up turn).
- **When output quality of any feature degrades** → first audit
  the corpus (stale entries? missing patterns?) before tweaking
  the prompt. Hormozi's maintenance trigger: update prompts
  when outputs stop being good. Same logic for the corpus.
- **Quarterly review** — drop entries that read stale (Ben's
  voice has evolved), add new high-performers from the past 3
  months.

### Forbidden

- Shipping a NEW customer-facing AI feature without wiring it to
  the corpus. The PR / commit gets blocked at review.
- "Improving" the corpus by sending it through GPT for cleanup
  — defeats the entire point; the human cadence is the asset.
- Storing the corpus outside `bluejays/data/voice-corpus/` —
  single source of truth so Ben can find + edit fast.
- Letting the corpus go stale (>6 months without review) — set
  a calendar reminder if needed.

### Cascade

This rule mirrors AIOS principle 13 (three-folder architecture).
The corpus IS the "data sources" folder for BlueJays-the-business.
When BlueJays Pro launches the "AI Setup Day" deliverable
(PRO_SYNTHESIS 2026-05-07 row), the per-client corpus is what
each client receives — same architecture, different filings.

---

