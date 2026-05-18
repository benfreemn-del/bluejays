---
name: draft-touch
description: Per-prospect outreach drafter. Reads prospect + most recent completed audit + touch history, auto-detects funnel stage (cold first-touch / follow-up / reply-to-reply), writes a Ben-voice email draft with the 5-step Psychology Stack baked in. Persists to the outbox table with an 8-char short_code, then SMSes Ben "Reply YES <code> to send · NO <code> to skip". Approve via dashboard one-tap (/dashboard/outbox), SMS reply, OR `bj outbox approve <code>`. Runtime source of truth lives at src/lib/ai-skills/skills/draft-touch.ts.
---

# draft-touch

Day-4 skill of the bj ai layer.

**Manual invoke:** `bj ai draft-touch --prospect-id <uuid>`
**Cost cap:** $0.06/run · Sonnet · 700 max tokens out
**Channels:** email only (v1). SMS auto-send is gated by Twilio A2P
10DLC approval per Rule 35; phone "drafts" are talking-point briefs
(future).

## Stage auto-detection
- 0 prior outbound emails → `cold_first_touch`
- 1+ prior emails, no inbound reply → `follow_up`
- inbound reply on file → `reply_to_reply` (drops cold opener,
  directly responds to their last message)

## Output shape
```
{
  "stage": "...",
  "subject": "<≤60 chars>",
  "body": "<≤80 words, Ben's voice, exactly 1 link>",
  "tone_notes": "...",
  "objection_addressed": "...",
  "reasoning": "...",
  "summary": "<≤140 chars>"
}
```

## What happens after
1. Skill's afterRun hook calls `createOutboxDraft()` — writes
   the draft to the `outbox` table with status=pending + a
   fresh 8-char `short_code`
2. Then calls `notifyOwnerOfDraft()` — Ben gets SMS:
   ```
   📝 New draft for <Business>:
   <body preview>...
   Reply YES <code> to send · NO <code> to skip
   Or review: bluejayportfolio.com/dashboard/outbox
   ```
3. Ben either:
   - Replies YES <code> → /api/inbound/sms handler triggers send
   - Taps Approve on the dashboard
   - Runs `bj outbox approve <code>`
4. On approve: outbox status flips approved → sent (or failed),
   email actually ships via existing email-sender.ts (sequence=900
   reserved for ad-hoc drafts)

## When you (Claude) might invoke this from chat
- Ben says "draft a follow-up to <business>" or "respond to the
  reply from <business>"
- During a triage walkthrough — after Ben/Madie pick a top
  prospect from the morning queue and want a ready-to-send touch
- During a debug session to test the outbox flow end-to-end

## Hard rules (locked, will fail QC if violated)
- ≤80 words in body
- Exactly 1 link (the prospect's audit URL)
- Zero pricing language ($, "free", "starts at")
- Zero booking CTAs ("book a call", Calendly)
- Lowercase greeting ("Hi <FirstName>" or "Hi there")
- Banned phrases: "just following up", "Hope this finds you well",
  "world-class", "Click here", "Learn more", etc.

## Runtime source of truth
`src/lib/ai-skills/skills/draft-touch.ts` — modify there, not here.
