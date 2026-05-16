---
name: video-editor
description: Hormozi-style brand-aligned video editing pipeline for BlueJays phone-recorded vertical clips (VSLs, daily content, client testimonials). Use when Ben has a raw .mov/.mp4 to edit. Trim → jump-cut silences → loudnorm audio → Whisper word-sync → burn karaoke captions → H.264 1080×1920 output. ~90 sec end-to-end per clip. Pairs with content-engine skill (which writes the scripts).
---

# Video Editor Skill — BlueJays vertical-clip pipeline

The canonical playbook for taking a raw phone recording from Ben and
producing a Hormozi-aligned brand-styled vertical clip ready for IG
Reels / TikTok / YouTube Shorts / LinkedIn.

**Core thesis:** the script + the recording are Ben's job. The edit is
mechanical: trim, tighten, sync, brand-style, burn. Done right, this
pipeline turns a 30-second phone selfie into a thumb-stop reel in 90
seconds of compute time.

Pairs with `content-engine` skill, which generates the scripts Ben
records FROM. Pairs with `vsl-audit-funnel.md` for the two VSLs that
live on `/audit`.

---

## When to use this skill

- Ben drops a raw `.mov` or `.mp4` in `04 Marketing Assets/` or `bluejays/edit-cache/`
- Ben says "edit this clip" / "make the video" / "render VSL #1" / etc.
- A daily content brief from `content-engine` is recorded and ready to ship
- A Pro-tier client wants a per-prospect personalized VSL (deferred build, but
  the editing template is the same)

Don't use this skill for:
- Cinematic editing (cuts on the beat, color grading, sound design) — use
  Descript / Opus Clip / a human editor
- Trending-audio matching for IG Reels — no API exists, Ben picks in CapCut
- Generating the script itself — use the `content-engine` skill
- Editing landscape (16:9) video — this skill is vertical-only

---

## The full pipeline (5 steps, ~90 seconds total)

### Step 1: Probe the source file

Confirm specs. iPhone recordings come in HEVC (h265) which needs transcode
to H.264 for universal mobile playback, often with an extra "spatial audio"
track that ffmpeg complains about (harmless — only map track 0).

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,codec_name,r_frame_rate,duration \
  -of default=noprint_wrappers=1 "<SOURCE>"
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "<SOURCE>"
```

Expected for iPhone vertical: 1080×1920, 30fps, HEVC, AAC stereo + 1 extra
unknown track (apac spatial). If horizontal or other dims, **stop and ask
Ben** — this skill is vertical-only.

### Step 2: Detect speech boundaries (silence-based jump cuts)

iPhone recordings always have 2-4 seconds of pre-roll (Ben setting up) and
1-3 seconds of post-roll (Ben relaxing). Plus natural inter-beat pauses
that Hormozi cuts out for tightness.

```bash
ffmpeg -hide_banner -nostats -i "<SOURCE>" \
  -af "silencedetect=noise=-32dB:duration=0.5" \
  -f null - 2>&1 | grep -E "silence_(start|end|duration)"
```

Output gives pairs of `silence_start` / `silence_end` timestamps. The
gaps BETWEEN those silences are speech blocks. Map them to ffmpeg trim
ranges with ~100ms margin on each side (so we don't clip the first/last
consonant).

Example from VSL #1 (4 speech blocks at threshold -32dB / 0.5s):
- Speech 1: 3.80–11.82 → trim 3.80–11.92
- Speech 2: 12.59–19.89 → trim 12.49–19.99
- Speech 3: 20.64–28.91 → trim 20.54–29.01
- Speech 4: 29.91–33.87 → trim 29.81–33.97

**Threshold tuning:** -32dB / 0.5s catches inter-beat pauses. Drop to
-26dB / 0.18s for sub-beat micro-pauses if you need finer cuts (rarely
useful for the trim step — that's for caption sub-cards, see Step 4).

### Step 3: Extract audio for Whisper

Audio-only mp3 (well under Whisper's 25MB limit):

```bash
ffmpeg -y -hide_banner -loglevel error -i "<EDITED_MP4>" \
  -vn -c:a libmp3lame -b:a 192k <out>/audio.mp3
```

Important: extract AFTER the jump-cut render, OR transcribe the source
and translate timestamps through the trim math. Easier to transcribe the
already-edited audio — timestamps come back in the output timeline.

### Step 4: Whisper transcription with word-level timestamps

OpenAI Whisper API. Reads `OPENAI_API_KEY` from `bluejays/.env.local`
(if missing, run `vercel env pull .env.local` from the bluejays/ dir).

```bash
set -a && source .env.local && set +a
curl -sS -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "file=@<out>/audio.mp3" \
  -F "model=whisper-1" \
  -F "response_format=verbose_json" \
  -F "timestamp_granularities[]=word" \
  -o <out>/transcript.json
```

Cost: ~$0.006 per minute, so a 30s clip = $0.003. Free for the first ~10
clips at platform.openai.com's free tier.

The response has a `words` array: `[{word, start, end}, ...]` with
millisecond-precision timestamps. ALSO has a `text` field with full
punctuation. The `words` array has bare tokens (no punctuation), so we
use the `text` field for phrase-boundary detection.

### Step 5: Generate karaoke ASS captions

Use `bluejays/scripts/video-editor/generate-karaoke-ass.mjs` as the reference
generator. It implements the four rules below.

**Card grouping rules:**
- Max 5 words per card
- Max 1.8 seconds per card
- Force-break when gap between words > 0.35s
- Force-break at punctuation in the `text` field (comma, period, em-dash)
- **Pull trailing connectors forward** to the next card — never end a
  card on `the / of / to / a / an / and / or / for / in / on / at / by /
  from / with / is / are / was / were / be`. The card flushes on a content
  word; the connector becomes the first word of the next card.
- Eliminate inter-card gaps (each card ends exactly when the next begins,
  no flicker)

**Brand-aligned styling (locked):**
- Font: Arial Black 92pt bold white
- Outline: 7px black
- Drop shadow: 4px, 60% alpha (`&HA0000000`)
- Alignment: top-center (ASS alignment=8)
- MarginV: 220 (from top — puts text firmly in sky zone above face)
- Emphasis color: sky-blue `#38bdf8` (BlueJays brand sky-400) → ASS BGR
  `&HF8BD38&`
- Emphasis target: load-bearing nouns/verbs from the script. Per-VSL
  emphasis word lists live in `vsl-audit-funnel.md`. For daily content,
  emphasize numbers, brand names, dollar amounts, and the verb in the
  CTA.

**Inline color override syntax (verified working):**
```
{\c&HF8BD38&}WORD{\rBJ}
```
Use `{\rBJ}` not `{\r&BJ&}` — the ampersands break the style-name lookup.

### Step 6: Final render (jump-cut + caption burn + loudnorm + H.264)

Single ffmpeg pipeline that does everything in one pass:

```bash
ffmpeg -y -hide_banner -loglevel warning -i "<SOURCE>" \
  -filter_complex "[0:v]trim=<S1>:<E1>,setpts=PTS-STARTPTS[v1]; \
    [0:v]trim=<S2>:<E2>,setpts=PTS-STARTPTS[v2]; \
    [v1][v2]...concat=n=N:v=1:a=0,subtitles='<ASS_PATH>'[v]; \
    [0:a]atrim=<S1>:<E1>,asetpts=PTS-STARTPTS[a1]; \
    [0:a]atrim=<S2>:<E2>,asetpts=PTS-STARTPTS[a2]; \
    [a1][a2]...concat=n=N:v=0:a=1,loudnorm=I=-16:LRA=11:TP=-1.5[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 19 \
  -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 \
  "<OUTPUT>"
```

**Locked encoder settings:**
- `libx264` codec, `yuv420p` pixel format → maximum compatibility (iOS,
  Android, IG Reels, TikTok, Shorts, LinkedIn)
- `crf 19` → visually lossless at this resolution (lower CRF = bigger file,
  19 is the sweet spot)
- `preset medium` → 2x realtime encode on a modern laptop
- `+faststart` → moov atom at the head so streaming/preview starts instantly
- `loudnorm I=-16:LRA=11:TP=-1.5` → mobile-standard target loudness with
  -1.5dB true-peak ceiling (matches Reels/TT/Shorts auto-leveling targets)

A 30s clip renders in ~12-14 seconds on Ben's machine.

---

## File / folder conventions

```
04 Marketing Assets/                          # Ben drops raw recordings here
  Video May 16 2026, 11 15 29 AM VSL #1.mov   # iPhone default naming

bluejays/edit-cache/                          # gitignored working folder
  vsl-1-audio.mp3                             # intermediate, cleaned up after
  vsl-1-transcript.json                       # Whisper response, cleaned up after
  vsl-1-captions.ass                          # the final captions file (kept)
  vsl-1-edited.mp4                            # the final output (kept)
  generate-karaoke-ass.mjs                    # reusable Node generator
```

**Cleanup rule:** after a successful render + Ben's approval, delete
`*-audio.mp3` and `*-transcript.json` (intermediates). Keep `.ass`
(small text file, useful for diffs) and `.mp4` (the deliverable).

**Naming convention:**
- VSL #1 → `vsl-1-*.mp4`
- VSL #2 (post-audit reveal) → `vsl-2-*.mp4`
- Daily content batch → `content-<bucket>-<YYYYMMDD>.mp4` (e.g.
  `content-build-in-public-2026-05-16.mp4`)
- Client testimonials → `testimonial-<client-slug>.mp4`

---

## Hormozi-aligned visual principles (the WHY behind the locked rules)

These are stable design decisions — don't second-guess per clip unless
Ben explicitly asks. Cribbed from Hormozi's content team + adjusted for
BlueJays brand.

1. **Top placement, not bottom.** IG/TikTok/Shorts overlay their UI on
   the bottom 25% of the screen. Captions on the bottom get covered by
   the user handle, audio source, like/share buttons. Top stays clean
   on every platform.

2. **Big bold font.** 90+pt at 1080-wide. Captions should DOMINATE the
   frame, not float politely. Thumb-stoppage comes from visual punch.

3. **Karaoke pace (~1 card/second).** Cards changing this fast keeps
   the eye locked on the screen. Cards that linger 3+ seconds give the
   viewer permission to look away. Per content-engine skill:
   "first 3 seconds beat the next 27."

4. **End cards on content words.** A caption that ends on "the" or "to"
   reads as broken — the eye expects more. End on a noun, verb, or
   adjective and the card feels complete even if mid-sentence.

5. **Brand-color emphasis, not rainbow chaos.** ONE accent color (BlueJays
   sky-400 / #38bdf8) on the 3-5 load-bearing words per clip. Hormozi
   uses yellow + green; this is operator content, so we use the brand
   sky. Consistency = identity.

6. **Hard cuts, no fades.** Algorithm reads fades as drop-offs. Hard
   cuts at every jump and at the final frame. No "thanks for watching"
   outro card — the last word of the script is the last frame.

7. **Burned-in captions, not soft subtitles.** 80% of mobile viewers
   watch muted. Soft subtitles requiring user activation = wasted reach.
   Burn them in. Yes it's destructive (no language switching later); the
   reach math always wins.

8. **Audio loudnorm to -16 LUFS.** Mobile platforms normalize during
   playback, but recordings vary wildly. Pre-normalizing means your
   clip sounds at the right volume from the first millisecond and
   competes with whatever the user was watching before yours.

---

## Common gotchas (learned the hard way)

- **iPhone .mov has a 3rd "apac" audio track** (Apple Positional Audio Codec
  / spatial audio). ffmpeg warns "unknown codec" — harmless. Only map
  track 0 (`[0:a]` in filter graph) and the warning is cosmetic.
- **HEVC source needs H.264 transcode.** Don't try `-c:v copy` — many
  Android browsers + IG Reels' web preview can't decode HEVC.
- **`subtitles=` filter path must use forward slashes OR escape
  backslashes** on Windows. Inside a filter_complex, use forward
  slashes (`bluejays/edit-cache/captions.ass`) even on Windows — ffmpeg
  handles it.
- **ASS inline `{\rSTYLENAME}` reset** wants the style name WITHOUT
  ampersands. `{\rBJ}` works; `{\r&BJ&}` produces "no style named
  '&BJ&' found" warnings but visually falls through to default.
- **Whisper sometimes misses content** that's in the script — Ben
  ad-libs, drops phrases. Always sync captions to what Whisper heard,
  not what the script said. The transcript is ground truth, the script
  is the plan.
- **Whisper's `words` array has NO punctuation.** Use the `text` field
  (which has commas/periods) for phrase-boundary detection. Walk word-
  to-text positions to find which word ends with a punctuation mark.
- **`vercel env pull` overwrites `.env.local`.** Pulls REMOVE any local-
  only vars not in Vercel. Always warn Ben before running it (see his
  prior incident with ADMIN_PASSWORD, TWILIO_*, FROM_EMAIL going missing
  2026-05-16).

---

## Reusing the generator script

`bluejays/scripts/video-editor/generate-karaoke-ass.mjs` is the canonical
generator. Reads from `edit-cache/vsl-1-transcript.json`, writes to
`edit-cache/vsl-1-captions.ass`. To reuse for other clips:

1. Copy the script with a new name (e.g. `generate-content-ass.mjs`)
2. Update `TRANSCRIPT_PATH` and `OUT_PATH` at the top
3. Update `EMPHASIS_PHRASES` to match the clip's load-bearing words
4. Run with `node <script>.mjs`

Or generalize: pass in/out paths as CLI args. Not done yet — first VSL
hard-codes paths for simplicity. Future Pro-tier work will need the
generalized version.

---

## What this skill does NOT do (yet)

- **B-roll cutaways.** `content-assets/broll/` has placeholders but no
  capture flow yet. When ready, splice via `overlay` filter with
  timestamps from the transcript.
- **Animated zoom-punches on emphasis words.** Doable with `zoompan` or
  scale-keyframes, but adds rendering complexity. Static captions are
  good enough for v1.
- **TTS-personalized middle section** (per VSL #2 in vsl-audit-funnel.md).
  Render pipeline deferred ~10 days per CLAUDE.md Video Generation
  Status. When it ships, this skill will absorb the worker logic.
- **Multi-platform variant rendering.** Currently outputs ONE 1080×1920
  vertical. If LinkedIn 1:1 square needed, add a second pass that crops
  +centers.
- **Auto-upload to Supabase Storage / social platforms.** Manual upload
  for now.

---

## Cost ledger (per clip)

| Component | Cost |
|---|---|
| OpenAI Whisper API | ~$0.003 per 30-sec clip |
| ffmpeg compute (local) | ~$0 (Ben's machine, ~14 sec) |
| Storage | ~50 MB per finished clip — local + Supabase Storage |
| **Total** | **~$0.003 per clip** |

Annual at content-engine target cadence (3 video posts/week):
- 156 clips × $0.003 = **$0.47/year in Whisper**

Practically free.

---

## Operator quickstart (when Ben says "edit this clip")

1. Get the source path. If unclear, check `04 Marketing Assets/` for
   `*VSL*` and recent date.
2. Probe → confirm 1080×1920 vertical. If not, stop and ask.
3. Silence-detect → derive trim ranges. Show Ben the proposed cuts
   before rendering (one round-trip is cheap insurance).
4. Render once with placeholder captions (or no captions) → preview to
   Ben → confirm trim/audio feel right.
5. Extract audio → Whisper → generate ASS → final render.
6. Sample 4-6 frames at varied moments → visually verify position +
   emphasis colors land + no awkward breaks.
7. Drop the file path. Cleanup intermediates.

Sample-frames step is non-negotiable. Caption rendering has bitten me
enough times (style-reset warnings, font fallback, off-screen text)
that visual verification is cheaper than a re-render.
