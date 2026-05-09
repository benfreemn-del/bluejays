---
name: content-engine
description: Hormozi-aligned organic content engine for BlueJays. Use when generating a daily content brief, picking a hook, writing a script, mapping a CTA, planning b-roll, or reviewing post performance for Ben's IG / LinkedIn / YouTube Shorts cadence.
---

# Content Engine Skill

The canonical playbook for BlueJays' organic content. Ben records,
Claude plans + scripts + (later) edits. Output: 30s vertical videos +
text variants for IG Reels, LinkedIn, YouTube Shorts.

**Core thesis:** the brief is the product, the editor is the
convenience. Get the daily prompt right and 80% of the value is
captured. The render pipeline is leverage on top of that.

---

## When to use this skill

- Ben logs on in the morning → generate the day's content brief
- Ben asks "what should I post today?" → pick from 5-bucket rotation,
  produce 3 hooks, ask him to choose
- A draft script needs a CTA → use the CTA matrix below
- A render is finished → write the per-platform caption + hashtags
- Sunday → produce the weekly metrics digest (top 20%, kill bottom 50%)
- Adding a new piece of evergreen content → fit it to one of the
  6 hook structures + log to the swipe file

Don't use this skill for paid ads (use paid-ads-iteration), client
funnel emails (those use client_email_campaigns + hyperloop), or sales
scripts (use partners-script.ts). Organic only.

---

## Why most operator content fails (the tone-setter)

Hormozi rule: first 3 seconds beat the next 27. If your hook isn't
contrarian, specific, or stake-loaded, the algorithm drops you in the
first cohort. "Day in the life" alone is a vlog — viewers don't watch
vlogs from operators they don't know.

What works for an operator selling a $9,700 system:
- **proof** ("here's the close")
- **teardown** ("here's the leak i found")
- **build-in-public** ("here's what i shipped + what broke")
- **hot take** ("agencies are wrong about X")
- **behind-the-paywall** ("the prompt i use for ___")

DITL is fine as flavor, never as backbone.

---

## The 5-bucket rotation

Daily brief picks ONE bucket per day, ranked by leverage. The brief
generator should rotate so no bucket fires 2 days in a row.

| # | Bucket | Source data | Posting rhythm |
|---|---|---|---|
| 1 | **Prospect questions you answered yesterday** | inbound emails + DMs + slack | 2x / week |
| 2 | **Client outcomes / wins** | prospects.status='paid', client_leads booked, agent_signals kind=close | 2x / week |
| 3 | **What broke + how I fixed it** | git log, agent_signals severity=urgent that got acked | 1x / week |
| 4 | **Industry hot takes** | Ben's draft notes file, Hormozi-style reframes | 1x / week |
| 5 | **What I shipped today** | git log + commit messages | 1x / week max — easy to over-rely on |

**Empty-day rule:** if no bucket has fresh material (rare), pull from
the 30-day evergreen bank instead of skipping.

---

## The 6 hook structures (the hook bank)

Every video must open with one of these. The brief generator MUST
pick a hook from this list — never freestyle. If a hook doesn't fit
any structure, the topic isn't sharp enough yet.

```
1. SHOCK + STAKES
   "i lost a $9,700 deal yesterday because of [thing]"
   "my client almost shut down their ads — here's what i caught"

2. CONTRARIAN + AUTHORITY
   "every agency tells you to [X]. it's wrong. here's why."
   "everyone's automating outbound. that's the trap."

3. NUMBER + PROMISE
   "i automated 7 client funnels with one cron job. here's how."
   "this 22-line script makes my AI responder convert 2x"

4. QUESTION + CURIOSITY
   "what's the real reason most B2B ad campaigns die at $300/day?"
   "why does the same headline get 10x more leads on tuesday?"

5. OUTCOME + SPECIFIC
   "i just shipped per-tenant cost attribution in 4 hours. here's
   how it saves my clients $200/mo"
   "this client closed $9,700 — here's the EXACT email"

6. EXPOSE + INSIDER
   "agencies don't want you to know about [thing]. i'll show you."
   "here's the prompt every consultant charges $5k/mo for"
```

**Hook discipline rules:**
- 3 seconds max before the promise lands
- specific number > vague number ("$9,700" not "high ticket")
- name the stake ("you'll lose" / "you're paying" / "you don't see")
- if the hook is generic, kill it. don't soften it.

---

## Script structure (Hormozi 4-beat)

Every script follows this. Brief generator should fill a template:

```
[0-3s]  HOOK            (one of the 6 structures above)
[3-8s]  PROMISE         "in the next 22 seconds i'll show you exactly how"
[8-22s] PROOF           the receipts — screenshot, dashboard, code, email
[22-30s] CTA            ONE specific action, link in bio or comment trigger
```

**Tone guard:**
- lowercase casual, lots of natural pauses
- no "in this video we're going to discuss" filler
- ben's voice = "yeah so basically" / "the thing is" / "here's the trick"
- no corporate-speak: "leverage" / "synergy" / "scale" / "ecosystem"
- no emojis unless ben asks
- when in doubt: write it like a slack message, not a youtube intro

---

## CTA matrix

Every video ends with ONE CTA. Pick by content bucket:

| Bucket | Default CTA | Why |
|---|---|---|
| Prospect Q answered | "comment '[KEYWORD]' for the full breakdown" | high engagement, captures email via DM follow |
| Client outcome | "link in bio: free 30-second site audit" | proof → audit funnel |
| Build-in-public | "follow for the next teardown" | identity capture, not transactional |
| Hot take | "what would you change? drop it below" | comments are algorithm fuel |
| What I shipped | "want this for your business? bluejayportfolio.com" | direct funnel — only use ~1x/week |

**Rule:** every CTA must be one specific action. "follow + comment +
link in bio" is three actions and gets zero. Pick one.

---

## Platform variant rules

Same source script, three different renders.

### Instagram Reels
- 7-15s hook is critical, full clip 30s max
- vertical 9:16, captions burned in (most viewers muted)
- caption (under video): 1 line punchy + 5-8 hashtags max
- trending audio NOT required for operator content (counter-intuitive
  but: muted captions + strong hook beat trends for B2B)

### LinkedIn (native video)
- 60-90s sweet spot, 30s also works
- caption is the real reach driver — 3-5 paragraphs, hook → story →
  takeaway → CTA → P.S.
- vertical OR square 1:1 (LI auto-crops; safer to ship 1:1)
- no hashtags overload — 3-5 max, mostly broad ones

### YouTube Shorts
- vertical 9:16, 30-60s
- title is more important than caption — first 5 words matter
- hashtag in title (#shorts) + 3 in description
- thumbnail = first frame, so script the first frame deliberately

→ One source clip + script generates 3 variants. Don't post the same
caption across all 3 — each platform has its own vibe.

---

## Recording cadence

**Wrong:** 1 video / day.
**Right:** 1 batch session / week → 5-7 atomic clips → daily ship.

Hormozi-aligned cadence:
- Sunday: batch record 5 clips (90 min)
- Mon-Fri: 1 ship per day from the batch + 1 repurpose (quote card,
  carousel, LinkedIn longpost) — total 10 atomic posts/week
- Saturday: weekly digest + plan next week's batch

If a "live" day produces something noteworthy (close, breakthrough,
breakdown), interrupt the batch with a same-day record — those are
the highest-performing posts.

---

## Volume realism check

| Persona | Posts/week | Notes |
|---|---|---|
| Hormozi (with team) | 30+ | not your bar |
| Gary V | 64+ | not your bar |
| Solo b2b operator who actually moves the needle | **15-25 atomic posts** | this is your bar |
| Ben target Q3 2026 | 12 atomic / 3 video / week | start here, ramp later |

12 atomic posts/week = 3 video + 4 text-with-screenshot + 3 carousels
+ 2 quote cards. The render pipeline only needs to nail the 3 video.
The rest is markdown + canva.

---

## Measurement (what gets tracked weekly)

Without this, daily posting becomes performance theater. Weekly digest
fields:

```
PER POST:
  - platform
  - bucket
  - hook structure used
  - views
  - saves + comments (engagement = better signal than likes)
  - profile visits → website clicks → opt-ins
  - DMs received

WEEKLY ROLLUP:
  - top 20% by engagement → double-down on bucket + hook
  - bottom 50% by views → kill the bucket OR kill the hook structure
  - which platform performed best for this content?
  - DMs converted to booked calls
```

**Sunday digest auto-emails Ben.** Action items, not vanity metrics.

---

## The empty-day plan (no-show fallback)

When Ben doesn't record / doesn't have content:

1. Auto-ship a quote card from yesterday's video (top comment OR best line)
2. Re-post the highest-performing post from 30+ days ago to the
   platform it did NOT originally hit
3. Write a 3-paragraph LinkedIn text post from the previous video's
   transcript (no recording needed)

The system never silently misses a day. Empty days produce SOMETHING.

---

## Asset library requirements

The "splice in backend / website b-roll" feature needs a pre-built
library. Without it the render pipeline outputs talking-head only.

Required assets (build BEFORE the render pipeline ships):
- 30-50 vertical 9:16 screen recordings, 5-10s each, of:
  - dashboard surfaces (overview, ads tab, leads, spending, audit)
  - per-tenant portals (zenith, ITC, OIT) with sample data
  - public pages (cut-my-agency, bluejayportfolio.com home, audit form)
  - terminal / git activity / commit messages
  - Stripe checkout, SendGrid logs, Twilio dashboard
- Each tagged with: surface name, topic keywords, tenant slug (if any)
- Stored in `content-assets/broll/<slug>/<filename>.mp4` with a
  YAML manifest at `content-assets/broll/manifest.yml`

**Capture method:** Playwright headless browser → ffmpeg screen
record at 1080×1920 vertical → trim to 5-10s → output mp4.

---

## What this skill does NOT do

- Cinematic editing (cuts on the beat, color grading, sound design) —
  use Descript / Opus Clip / human editor instead
- Trending audio matching for IG Reels — there's no API for that;
  Ben picks audio in capcut after render if he wants
- Cross-posting automation — manual until meta business + LinkedIn
  OAuth land
- Comment / DM automation — separate problem; don't confuse with this

---

## Files (when implementation lands)

```
src/lib/content-engine/
  briefs.ts          # daily brief generator (5-bucket rotation)
  hooks.ts           # hook bank + structure validators
  scripts.ts         # 4-beat template + tone guard
  ctas.ts            # CTA matrix + bucket → CTA mapping
  metrics.ts         # weekly digest builder
  evergreen.ts       # 30-day fallback bank

src/app/dashboard/content/
  page.tsx           # morning brief UI + hook picker + script editor

src/app/api/content/
  brief/route.ts     # GET — today's brief
  draft/route.ts     # POST — save script, link source mp4
  metrics/route.ts   # GET — last week's perf rollup

content-assets/
  broll/             # 30-50 tagged 9:16 screen recordings
  manifest.yml       # asset → tag mapping
  swipe-file.md      # ben's best lines (hook source)
  evergreen/         # 30-day fallback bank
```

DB migration adds:
- `content_briefs` (id, date, bucket, hooks_offered, hook_chosen,
   script, b_roll_plan, cta, status)
- `content_drafts` (id, brief_id, platform, mp4_url, caption,
   hashtags, posted_at, post_url)
- `content_metrics` (id, draft_id, fetched_at, views, saves,
   comments, profile_visits, link_clicks, dms)

---

## Operator quickstart (for Ben)

1. Log on → `/dashboard/content` — morning brief is already generated
2. Pick 1 of 3 hooks (or write your own — engine logs the rejection
   so it learns what hooks you skip)
3. Engine writes a 30s script in your tone with timed b-roll cues
4. Record on phone, drop in `dropbox/inbox/`
5. Cron renders 3 platform variants → `dropbox/ready/`
6. You post manually (until automation lands)
7. Sunday: read the weekly digest. Kill what didn't work. Double-down
   on what did.

Recording habit > render automation. Ship the brief first, build the
editor second. **You are the bottleneck — the system is leverage on
your reps, not a replacement for them.**
