# B-roll Recording Session — One-Time Setup (~90 min)

This is the one-time investment that pays off forever. Record these
27 clips once → I splice them into every social-content video going
forward. Manifest at `./manifest.yml` lists each clip with the URL
to capture, action to perform, and tags for auto-matching.

---

## The 90-min plan

| Phase | Time | What |
|---|---|---|
| 1 | 10 min | Setup (lighting, phone mount, browser bookmarks) |
| 2 | 25 min | Capture site walkthroughs (OIT + Zenith + BlueJays — 16 clips) |
| 3 | 15 min | Capture dashboard/admin clips (5 clips) |
| 4 | 10 min | Capture operator/behind-scenes clips (4 clips) |
| 5 | 10 min | Brand end-cards (2 clips) — can do these in CapCut/Canva |
| 6 | 20 min | Review + re-shoot any shaky/blurry takes |

---

## Setup (Phase 1)

### iPhone screen recording
Settings → Control Center → Add **Screen Recording** to controls.
Then swipe down from top-right → tap the record icon → 3-sec
countdown → start your screen action.

### Browser setup
- **Mobile Safari** for vertical capture (gives you the right
  proportions natively — desktop browser caps look weird at 9:16)
- **Open all 16 capture URLs in tabs first** so you can swipe
  between them without typing each one mid-session
- **Cookie pre-warm:** log into the dashboard ONCE before
  starting so admin/portal clips don't show login screens

### Tap-to-show indicator
Settings → Accessibility → Touch → AssistiveTouch → ON.
This puts a small floating dot on screen that follows your
taps — viewers see WHERE you tap, which makes the b-roll
read as "interactive demo" not "static screenshot."

---

## Capture rules (apply to every clip)

✅ **DO**
- **Vertical** (phone in portrait — never rotate)
- **5-10 seconds each** — enough to read, short enough to splice
- **Slow scroll** — 2-3 sec per screen height, not flicker-fast
- **Stable** — phone in mount or both hands, no pan jitter
- **Natural pauses** at key visual moments (let the eye land)

❌ **DON'T**
- Don't narrate while recording — audio gets stripped, just the visual matters
- Don't let notifications appear — turn on Do Not Disturb first
- Don't leave the chrome battery/time bar visible if you can help it
- Don't include identifying info (real customer phone, real email) — use test data

---

## Per-clip workflow

For each entry in `manifest.yml`:

1. Open the URL in Safari
2. Settle on the starting state (top of page, neutral scroll position)
3. Start screen recording (Control Center → tap red dot)
4. Wait 1 sec (lets the cropper trim the recording-start glitch)
5. Perform the action described in `capture_action`
6. Wait 1 sec at the end
7. Stop recording (tap the red bar at top of screen)
8. Open Photos → trim head/tail to exact duration → save
9. AirDrop / iCloud / OneDrive sync to your laptop
10. Drop the file into `content-assets/broll/<category>/<filename>.mp4`
    — exact filename matching `manifest.yml`

When you finish a phase, the next time I edit a video I'll
auto-pick clips matching the script keywords. No manual selection
needed unless you want to override.

---

## Quality bar

Each clip will be re-encoded by the video editor as part of every
final mp4 it's used in (so file size at this stage doesn't matter
much). What matters is:

- **Sharp focus** (no blurry / out-of-focus / shaky)
- **Clean composition** (subject visible, no chrome obscuring the
  thing being demonstrated)
- **Reads in 2 sec** (a viewer scrubbing should grok what the
  clip shows from a single still)

If a take fails any of those, re-shoot. 30 sec to re-record beats
shipping a weak clip 30 times.

---

## Storage / git

By default `content-assets/broll/**/*.mp4` is **gitignored** (each
clip is 3-8 MB, total library would be ~150 MB if all committed).

Two paths:
- **Local-only:** clips live on your laptop in
  `content-assets/broll/<dir>/`. I read them when you run a video
  edit locally. Pro: no repo bloat. Con: only available on the
  laptop they're on.
- **Promote to repo:** for clips you use frequently (Luke's
  testimonial, the audit form, your hero brand reveal), `git add -f
  content-assets/broll/<file>.mp4` to bypass the gitignore. They
  ship to Vercel + can be embedded in production pages too.

When you finish the recording session, ship the manifest changes
(I'll auto-update the file as you add clips) and decide which
specific clips to promote based on usage.

---

## Future re-shoots

When you ship a NEW client or a NEW feature surface, just add a new
entry to `manifest.yml` + record one clip. The video editor picks
it up the next time it sees a matching script keyword. No code
changes needed on my side.

Good rule of thumb: when you lock a major new client showcase
(like Luke's OIT site shipped today), record 3-5 b-roll clips of
it within a week. Stale b-roll is worse than no b-roll — viewers
notice when "this client" videos use stock instead of the real site.

---

## Quick-reference shot list

For when you're in the recording session and just need the URL list
without re-reading the full manifest:

```
https://bluejayportfolio.com/sites/olympic-inspections/index.html       (×5 — hero/loc/reviews/booking/calc)
https://bluejayportfolio.com/clients/olympic-inspections/admin          (×3 — bookings/calendar/partner-map)
https://bluejayportfolio.com/clients/zenith-sports                      (×1 — showcase hero)
https://bluejayportfolio.com/clients/zenith-sports/build-your-player    (×1)
https://bluejayportfolio.com/dashboard/tekky-map                        (×1)
https://bluejayportfolio.com/clients/zenith-sports/portal               (×1)
https://bluejayportfolio.com/dashboard/clients/zenith-sports/drill-of-week (×1)
https://bluejayportfolio.com/audit                                      (×2 — form/results)
https://bluejayportfolio.com                                            (×1 — portfolio grid)
https://bluejayportfolio.com/cut-my-agency                              (×1)
https://bluejayportfolio.com/dashboard                                  (×3 — overview/clients/pipeline)
terminal                                                                 (×1 — git log)
physical (no URL)                                                       (×3 — typing/phone/notifications)
brand end-cards (CapCut)                                                (×3 — bluejays/oit/audit-cta)
```

= 27 clips total. ~90 min if you don't mess up takes.

Cycle this same shot list every 60-90 days as your sites/dashboards
evolve. Old b-roll showing outdated UI is the #1 way operator
content reads as "stale" or "not real."
