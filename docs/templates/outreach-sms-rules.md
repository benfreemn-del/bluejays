# Outreach SMS Template Rules (NON-NEGOTIABLE — added 2026-04-19)

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read on demand.

---

## Outreach SMS Template Rules (NON-NEGOTIABLE — added 2026-04-19)

SMS templates follow the same philosophy as the email templates above —
adapted for the constraints of the channel. See `src/lib/sms.ts` for
the locked-in implementations of `getInitialSms`, `getFollowUpSms1`,
`getFollowUpSms2`, and `getPostVoicemailSms`.

### Core rules (mirror email rules)

- **ONE link only** — the short preview URL via `getShortPreviewUrl()`.
  Full UUIDs break on mobile line-wrapping and look like spam links in
  iMessage/Android. No portfolio URLs, no Calendly URLs.
- **Zero pricing language** — no "$997", no "3 payments of", no
  "one-time fee". Pricing lives on the claim page, reached by clicking
  the preview link.
- **Zero "book a walkthrough" CTAs** — no Calendly link in SMS ever.
  The soft reply prompt is the CTA.
- **Zero scarcity / urgency** — no "goes offline in 2 weeks", no "limited
  spots", no "expires soon". Feels like a scam text.
- **Personal 1-to-1 voice** — mention Ben by name in the initial SMS
  ("Ben from BlueJays") so the message doesn't look like a spam bot.
  Use the prospect's first name when we have one; "Hey there" fallback.
- **Include the effort hook** — "spent some time this week building..."
  carries the reciprocity psychology from the email pitch. Don't skip it
  on the initial SMS.
- **Closing reply prompt** — "Curious what you'd change" or "Take a look
  when you have a sec". Never "Would you like to schedule a call?".

### SMS-specific constraints

- **STOP compliance on EVERY message** — A2P 10DLC requirement. Append
  `Reply STOP to opt out` at the end of every single SMS we send to a
  prospect, regardless of message type. The kill-switch can be flipped
  via the `SMS_FUNNEL_DISABLED` env var while A2P approval is pending.
- **Stay under 2 segments (~306 chars)** — each segment = a Twilio bill.
  3+ segments also look spammy to carriers during the A2P scoring.
- **URL is the short URL** — the templates use `getShortPreviewUrl()`
  directly; the legacy `previewUrl` parameter on the function signatures
  is ignored (kept for backward compat with older callers).

### Banned phrases in SMS (never in any outgoing SMS body)

- Any price ($997, $349, etc.)
- Any Calendly / "book a call" / "schedule" language
- Any scarcity ("goes offline", "expires", "limited time")
- "Free website" (triggers SMS spam filters hard)
- Multi-link sequences (preview + portfolio + STOP = too many clickable
  elements in one message)

### Approved baseline templates

Locked in `src/lib/sms.ts`. The initial SMS reads:

```
Hey {name}, Ben from BlueJays — spent some time this week building a
website for {business}: {shortUrl} Take a look when you have a sec.
Reply STOP to opt out
```

Follow-up 1 (circle back):

```
{name} — circling back on the site I built for {business}:
{shortUrl} Curious what you'd change. Reply STOP to opt out
```

Follow-up 2 (graceful out):

```
{name} — last check on that {business} site: {shortUrl} If timing's
off, just say so and I'll stop reaching out. Reply STOP to opt out
```

Post-voicemail (right after a VM drop):

```
Hey {name}, just left you a voicemail about the site I built for
{business}: {shortUrl} Reply STOP to opt out
```

### Relationship to email + voicemail templates

The funnel schedule (from `FUNNEL_STEPS` in `src/lib/funnel-manager.ts`)
interlocks SMS, email, and ringless voicemail across 60 days. Verified
against code 2026-04-26.

| Day | Channels | Label |
|-----|----------|-------|
| 0 | email + SMS | Initial Pitch |
| 2 | voicemail | Voicemail Drop |
| 5 | email + SMS | Gentle Follow-Up |
| 12 | email + SMS | Value Reframe |
| 18 | voicemail | Follow-Up VM |
| 21 | email + SMS | Social Proof |
| 30 | email | Final Check-In |
| 45 | email | graceful_goodbye |
| 60 | email | final_seasonal_hook |

Notes:
- **Voicemails on Day 2 + Day 18 only** — two ringless drops per funnel.
  Pre-launch they're effectively paused because (a) A2P 10DLC is still
  pending approval and (b) the voicemail provider integration has been
  intermittently failing. When voicemails can't deliver, the funnel
  tries SMS as a fallback — which is also blocked by `SMS_FUNNEL_DISABLED`
  today. So Day 2 + Day 18 simply skip during warmup and the prospect
  advances to the next email step.
- **SMS-eligible days are Day 0, 5, 12, 21** — but SMS only actually
  fires for `source === "inbound"` prospects (Rule 35 + the A2P 10DLC
  gate). For cold-scouted prospects, SMS is gated off and only email
  goes out on those days.
- **Email fires on 7 days** — Day 0, 5, 12, 21, 30, 45, 60. Day 30 is
  the final-check-in, Day 45/60 are reactivation hooks for prospects
  who never replied.
- **The tone matches across channels** so a prospect who receives both
  email + SMS + voicemail feels like they're hearing from the same
  person, not a marketing machine. Every surface uses the effort hook,
  the same short URL via `getShortPreviewUrl()`, and the same soft
  reply-prompt CTA pattern.

