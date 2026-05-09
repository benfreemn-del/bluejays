# Audit Funnel VSLs — locked 2026-05-08

Two-video architecture matching the audit-completion timer rhythm.
Per Ben spec: the audit takes ~30 seconds (dominos-pizza-tracker
pattern); VSL #1 plays ALONGSIDE the loading bar so when his face
finishes talking, their audit is ready and they're already warm.
VSL #2 fires post-audit reveal with full ladder including the AI
System tier.

**Q10 unlock priority** — these are the visibility play, not a
nice-to-have. Per `aios/north_star.md` the single biggest fear is
"can't get enough people to actually see this system." VSL + cold-
traffic Meta ads on /audit IS the unlock.

**Records:** Days 12-15 (deadline 2026-05-12). Both videos shot in
the same session. Two takes minimum each — pick the take with more
energy, not more polish.

---

## VSL #1 — 30-second audit-companion video

**Plays:** alongside the audit-loading progress bar.
**Format:** vertical phone-camera (mobile-first traffic), talking
head, no slides, no music.
**Length:** exactly 30 seconds. Hard cut — no wave, no sign-off.
The audit reveal IS the sign-off.
**Word count:** ~75 words for natural conversational pacing.
**Goal:** problem-aware → solution-curious by the time the bar
finishes. Get them to scroll past the reveal.

**Why no ladder mention here:** 30 seconds is too tight for two
offers. Adding "and we also have a $9,700 system" in this window
dilutes the warming-up job. Ladder lives in VSL #2.

### Script

```
[0-5s — HOOK · state their reality]
"Right now, our system is checking your site against 47 things —
load speed, mobile experience, the stuff that actually makes the
phone ring."

[5-15s — TENSION · Hormozi value-equation, dream-outcome side]
"Most local businesses fail at least 9 of them. That's why their
competitor down the road is fully booked and they're refreshing
Yelp wondering why."

[15-25s — REFRAME · perceived-likelihood up]
"We've audited 200+ sites. The fixes are almost always the same
6 things. And you don't need a developer for any of them."

[25-30s — BRIDGE · effort/sacrifice down + scroll-trigger]
"Your audit's about to finish — scroll down in a second and
I'll show you exactly what we'd fix first."
```

### Filming notes
- Talking head, eyes-to-camera. No slides.
- Phone camera is fine — vertical framing (mobile traffic dominant).
- Authentic > produced. Truck or desk, not a studio.
- Two takes minimum; pick the one with more energy, not more polish.
- Hard cut at exactly 30.0 sec.

---

## VSL #2 — 60-90 sec post-audit reveal video (hybrid TTS-personalized)

**Plays:** after the audit results render. Above-the-fold on the
results page.
**Format:** Ben on camera for the open + close (~40 sec real
footage); middle ~30 sec is OpenAI TTS in Ben's cloned voice
splicing in the prospect's business name + top-3 audit issues.
**Length:** 60-90 seconds total.
**Cost per render:** ~$0.05 (OpenAI TTS) + Browserless.io render.
**Personalization:** uses `{BUSINESS_NAME}`, `{LOCAL_SERVICE_TYPE}`,
and `{TOP_ISSUE_1/2/3}` from the audit results.

**Why the ladder lives here:** post-audit is the moment they've
seen the red marks, they're warm, and the $9,700 needs to be on
the table so serious operators self-segment, the $997 looks small
by anchor, and you don't trap a manufacturer in the wrong motion.

### Script

```
[0-10s — HOOK · Ben on camera, real footage]
"Okay, your audit's done. If you're seeing red marks, you're in
the same boat as the last 200 [LOCAL_SERVICE_TYPE] we audited.
That's actually good news — means the fix is known."

[10-25s — REFRAME · Ben on camera, real footage]
"Most operators think they need a whole new website to fix this.
They don't. They need someone who knows which 6 things actually
move the needle and ignores the rest."

[25-50s — TTS-PERSONALIZED MIDDLE · cloned voice, their data]
"For {BUSINESS_NAME}, the fix order based on your audit is:
First — {TOP_ISSUE_1}.
Second — {TOP_ISSUE_2}.
Third — {TOP_ISSUE_3}.
That's a 7-day rebuild on our end. Most clients see their first
new lead within 14 days of launch."

[50-75s — THE LADDER · Ben on camera, real footage] ← THE AI SYSTEM LIVES HERE
"Two paths from here. Most folks pick path one — we rebuild your
site, get the phone ringing, $997 one-time. That's what 90% of
audits turn into.

But — if your bottleneck isn't getting leads, it's REPLYING to
leads — answering the phone at 9pm, following up with the people
who didn't book, sorting the tire-kickers from the real buyers —
we have a full AI Marketing System that runs your funnel for you.
$9,700 setup, monthly after that. That's a different conversation."

[75-90s — CTA · Ben on camera, real footage]
"Pick the path that fits. Three buttons right below this video —
the right one's obvious based on where you are. Either way, your
audit's saved in your email. See you in there."
```

### Three CTA buttons under the player

```
🔵 [Claim my site — $997]      → /claim/[prospectId]
☎ [Book a 15-min walkthrough]  → Calendly: 15-min audit walkthrough
💎 [AI System — book discovery] → Calendly: 30-min discovery call
```

The third button is the AI System surface. Without it, every $10k
buyer has to slog through the $997 tier first.

### Personalization variable contract

| Variable | Source | Fallback |
|---|---|---|
| `{BUSINESS_NAME}` | audit form input | "your business" |
| `{LOCAL_SERVICE_TYPE}` | scraped category from audit | "local businesses" |
| `{TOP_ISSUE_1}` | audit results, highest-priority red | "page speed under 3 seconds" |
| `{TOP_ISSUE_2}` | audit results, 2nd-priority | "mobile-friendly contact form" |
| `{TOP_ISSUE_3}` | audit results, 3rd-priority | "Google Business Profile claim" |

**Fallback rule:** if any variable resolves to empty/null, the TTS
splice swaps in the generic phrasing above. Never render a video
with `{BUSINESS_NAME}` literally in the audio.

### Render pipeline (deferred ~10 days — Browserless route per `bluejays/CLAUDE.md` Video Generation Status)

1. Audit submission triggers a `/api/videos/render-post-audit` queue
2. Worker pulls Ben's pre-recorded segments (open + close) from
   Supabase Storage
3. Worker generates the middle TTS clip with the prospect's data
4. FFmpeg concats segments via Browserless.io Chrome instance
5. Resulting MP4 uploaded to Supabase Storage; URL written to
   `prospects.post_audit_video_url`
6. Audit results page renders the video player when the URL is set;
   falls back to VSL #2 generic-Ben recording if not yet generated

The fallback recording (generic-Ben, no personalization) ships
Day 12. Hybrid render comes ~10 days later as the moat upgrade.

---

## Cold-traffic Meta ad alignment

These VSLs work in concert with the Meta ad creatives already
locked in `docs/templates/cold-traffic-ad-creatives.md`. The ad's
job is to drive cold traffic to /audit. VSL #1 retains them
through the wait. VSL #2 converts them after the reveal.

Funnel math at the locked Gate-1 thresholds:
- Ad CTR ≥ 1% → /audit landing
- Audit submission rate ≥ 5% (claim rate)
- VSL #2 → claim or call rate ≥ 1% (purchase rate)
- CAC ≤ $50 / lead

---

## Productization (Pro tier seed — captured in `aios/PRO_SYNTHESIS.md` 2026-05-08)

The audit-paced two-video architecture is the IP. Every BlueJays
Pro client's funnel uses the same pattern: a short hook video on
the loading screen + a personalized post-reveal video with their
ladder. The pacing matches user attention rhythm vs. the standard
"5-minute VSL nobody watches" trap.

When Pro tier launches, this rule cascades to every per-client
audit funnel.
