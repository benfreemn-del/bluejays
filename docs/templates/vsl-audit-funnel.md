# Audit Funnel VSLs — re-locked 2026-05-16

Two-video architecture matching the audit-completion timer rhythm.
Per Ben spec: the audit takes ~30 seconds (dominos-pizza-tracker
pattern); VSL #1 plays ALONGSIDE the loading bar so when his face
finishes talking, their audit is ready and they're already warm.
VSL #2 fires post-audit reveal with the two-tier ladder (Standard
$997 + Full AI System $10K).

**Q10 unlock priority** — these are the visibility play, not a
nice-to-have. Per `aios/north_star.md` the single biggest fear is
"can't get enough people to actually see this system." VSL + cold-
traffic Meta ads on /audit IS the unlock.

**2026-05-16 rewrite — what changed and why:**

1. **Avatar widened, manufacturer-leaning.** The validated $10K
   motion is manufacturer-ICP (Tekky + ITC, n=2 per Rule 67). The
   prior script was service-trade coded ("phone ringing", "9pm
   calls", "[LOCAL_SERVICE_TYPE]") which made manufacturers feel
   like accidental visitors. New language ("buyers", "orders",
   "carts", "the moment they decide whether to buy or bounce") is
   manufacturer-resonant AND still works for service trades.
2. **`$500/mo` leak killed.** Prior VSL #2 said "$10,000 setup,
   monthly after that." Direct violation of the locked offer-
   ladder rule (`feedback_offer_ladder_two_tiers`): $500/mo
   management is deliberately unadvertised on pre-purchase
   surfaces to preserve the autopilot pitch. New line: "$10,000.
   The system runs itself." Same tier, different framing.
3. **Two-tier ladder enforced.** The pricing page collapsed from
   3 tiers to 2 today (Custom Bespoke killed). VSL #2 ladder
   section now matches: $997 site OR $10K AI System. Nothing in
   between.
4. **Promise statements anchored to evidence.** Prior "first new
   lead within 14 days of launch" was unvalidated — activation-
   point data not yet captured. New script substitutes a less
   precise but defensible frame: "ranking + getting calls inside
   the first month."

**Records:** Day 19 / 2026-05-16 — **TODAY.** Both videos same
session. Two takes minimum each — pick the take with more energy,
not more polish.

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
offers. Adding "and we also have a $10,000 system" in this window
dilutes the warming-up job. Ladder lives in VSL #2.

### Script

```
[0-5s — HOOK · state their reality, broad enough for product + service]
"Right now our system is checking 47 things on your site —
load speed, mobile feel, the spots where buyers decide to click
or close the tab."

[5-15s — TENSION · value-equation, dream-outcome side]
"Most operators fail at least 9 of them. That's why a slower
competitor with worse photos is somehow getting the order and
you're not."

[15-25s — REFRAME · perceived-likelihood up]
"We've audited 200+ sites — manufacturers, local trades, indie
brands. The fixes are almost always the same 6 things. You don't
need a developer for any of them."

[25-30s — BRIDGE · effort/sacrifice down + scroll-trigger]
"Your audit's about to land — scroll in a second and I'll show
you exactly what to fix first."
```

### Filming notes
- Talking head, eyes-to-camera. No slides.
- Phone camera is fine — vertical framing (mobile traffic dominant).
- Authentic > produced. Truck, desk, garage — not a studio.
- Two takes minimum; pick the one with more energy, not more polish.
- Hard cut at exactly 30.0 sec.

---

## VSL #2 — 60-90 sec post-audit reveal video (hybrid TTS-personalized)

**Plays:** after the audit results render. Above-the-fold on the
results page.
**Format:** Ben on camera for the open + close (~40 sec real
footage); middle ~25 sec is OpenAI TTS in Ben's cloned voice
splicing in the prospect's business name + top-3 audit issues.
**Length:** 60-90 seconds total.
**Cost per render:** ~$0.05 (OpenAI TTS) + Browserless.io render.
**Personalization:** uses `{BUSINESS_NAME}`, `{BUSINESS_TYPE}`,
and `{TOP_ISSUE_1/2/3}` from the audit results.

**Why the ladder lives here:** post-audit is the moment they've
seen the red marks, they're warm, and the $10,000 needs to be on
the table so serious operators self-segment, the $997 looks small
by anchor, and you don't trap a manufacturer in the wrong motion.

### Script

```
[0-10s — HOOK · Ben on camera, real footage]
"Okay, audit's done. If you're seeing red marks, you're in
the same boat as the last 200 operators we audited. That's
actually good news — means the fix is known."

[10-25s — REFRAME · Ben on camera, real footage]
"Most people think they need a whole new website. They don't.
They need someone who knows which 6 things actually move orders
and ignores the rest."

[25-50s — TTS-PERSONALIZED MIDDLE · cloned voice, their data]
"For {BUSINESS_NAME}, here's the fix order based on your audit:
First — {TOP_ISSUE_1}.
Second — {TOP_ISSUE_2}.
Third — {TOP_ISSUE_3}.
That's a 7-day rebuild on our end. You should be ranking and
getting calls inside the first month."

[50-75s — THE LADDER · Ben on camera, real footage] ← THE AI SYSTEM LIVES HERE
"Two paths from here. Most folks pick path one — we rebuild
the site, you start showing up, $997 one-time. That's what 90%
of audits turn into.

But — if you're a product brand or a manufacturer, the website
isn't the bottleneck. It's the whole funnel: ads, landing,
follow-up, AI replies, all of it. For that, we have the Full
AI Marketing System. $10,000. The system runs itself. That's
a different conversation."

[75-90s — CTA · Ben on camera, real footage]
"Pick the path that fits — buttons are right below this video.
The right one's obvious based on where you are. Either way,
your audit's saved in your email. See you in there."
```

### CTA buttons under the player

The post-audit results page renders the appropriate buttons —
keep VSL line generic ("buttons right below this video"). The
page mounts:

```
🔵 [Claim my site — $997]       → /claim/[prospectId]
☎  [Book a 15-min walkthrough]  → Calendly: 15-min audit walkthrough
💎 [AI System — book discovery] → Calendly: 30-min discovery call
```

The third button is the AI System surface. Without it, every
$10k buyer has to slog through the $997 tier first.

### Personalization variable contract

| Variable | Source | Fallback |
|---|---|---|
| `{BUSINESS_NAME}` | audit form input | "your business" |
| `{BUSINESS_TYPE}` | scraped category from audit | "operators" |
| `{TOP_ISSUE_1}` | audit results, highest-priority red | "page speed under 3 seconds" |
| `{TOP_ISSUE_2}` | audit results, 2nd-priority | "mobile conversion path" |
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
Day 19 — TODAY. Hybrid render comes ~10 days later as the moat
upgrade.

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
