# Sales Call Snippets — Ben's Voice Corpus

Anonymized snippets from top-closed sales calls. Five buckets per
call: opener / discovery / objection-overcome / value-stack / close.
Target: 5-10 calls covered (20-50 snippets total).

Primary fuel for: AI-drafted SDR/closer scripts, VSL generators
(future), the audit-page CTA copy. The tone here is more direct than
written voice — Ben on the phone is a slightly different voice than
Ben writing an email. Both belong in the corpus, marked separately.

---

## Status

🟡 **Awaiting content.** Ben to drop transcript snippets from
top-closed calls.

**How to find them:**
1. From `bluejays/data/sales-calls/` (if it exists) or whatever
   transcription pipeline is in use, surface the calls that closed.
2. For each closing call, extract these 5 snippets verbatim:
   - **Opener** — the first 30-60 seconds. How Ben starts the call.
   - **Discovery** — the 1-2 best questions Ben asked + the
     prospect's response.
   - **Objection-overcome** — when the prospect pushed back +
     Ben's reframe.
   - **Value-stack** — how Ben described the offer.
   - **Close** — the moment the prospect committed.
3. Anonymize first names → `{prospect}` (or just generic `they`).

---

<!-- ENTRIES BEGIN HERE -->

<!-- Example:

---
type: call-snippet
date: 2026-04-25
recipient_category: roofing
context: closing-call
outcome: closed-997
---

OPENER:
"Hey {prospect}, Ben from BlueJays — thanks for jumping on. I'll
keep this to 15 minutes. Quick check before we dig in: did you
get a chance to look at the preview I sent?"

DISCOVERY (best Q):
"What's the #1 thing about your current site that's bugged you
the longest?"

PROSPECT: "It's mobile. It's terrible on phones."

OBJECTION-OVERCOME:
"Yeah, that's the most common one. Look — every site I build is
mobile-first. The preview I showed you, that's already what your
site would look like on a phone. So that one's already solved.
What else is on the list?"

CLOSE:
"Cool. So $997 one-time, $100/yr after the first year. I'd send
you the Stripe link right now. Sound good?"

-->
