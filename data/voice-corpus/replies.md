# Replies — Ben's Voice Corpus

Ben-written replies inside engaged-prospect threads. Objection handling,
discovery questions, soft closes, "we're a fit / we're not a fit"
assessments. Target: 10-20 entries.

Primary fuel for `src/lib/ai-responder.ts` (AI auto-reply drafter +
the pending-review queue from Rule 38). The AI references these to
match Ben's tone WHEN A PROSPECT REPLIES — different shape from the
cold-pitch tone (more conversational, more direct, more responsive
to what they just said).

---

## Status

🟡 **Awaiting content.** Ben to paste 10-20 of his best replies in
prospect threads.

**How to find them:**
1. Pull the `inbound_replies` table joined against the AI responder's
   `queued_replies` to find threads where Ben took over from the AI:

```sql
select ir.body as prospect_message,
       qr.edited_body as ben_reply,
       p.business_name,
       qr.created_at
from inbound_replies ir
join queued_replies qr on qr.in_response_to_id = ir.id
join prospects p on p.id = ir.prospect_id
where qr.status = 'sent'
  and qr.edited_body is not null
  and qr.edited_body != qr.draft_body
order by qr.created_at desc
limit 50;
```

2. Pick the 10-20 where Ben's edited version is materially different
   from the AI draft (those are the high-signal "Ben taught the AI
   something" moments).
3. Format as paired turns:

```
[prospect message]

[Ben's reply]
```

4. Anonymize recipient names; keep all the substance + cadence.

---

<!-- ENTRIES BEGIN HERE -->

<!-- Example template:

---
type: reply
date: 2026-04-22
recipient_category: roofing
context: objection-price
outcome: replied + booked-call
note: "the 'pay one customer's worth' reframe Ben uses constantly"
---

PROSPECT:
> $997 is too much right now.

BEN:
Totally fair. One customer's worth is the right way to think about it
— at $997, you'd need one new job to break even on the whole thing.
What's a typical roof job for you?

-->
