# Outreach Email Template Rules (NON-NEGOTIABLE — locked in 2026-04-19)

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read on demand.

---

## Outreach Email Template Rules (NON-NEGOTIABLE — locked in 2026-04-19)

Ben tested the original multi-CTA pitch email against a fresh Gmail
account on 2026-04-19. SendGrid reported "Delivered and Received" but
the email never appeared in any folder — Google silent-quarantined it
because the body had every Promotions/spam-classifier trigger. After
rewriting to a minimal, personal template, Ben explicitly approved the
new format as permanent and asked for these rules to be codified.

**The email is a nudge. The claim page is the pitch.** The whole job of
the pitch/follow-up emails is to get a prospect to click the preview
link. Everything else — pricing, payment plans, ROI calculator, Calendly,
comparison table, guarantees — lives on the preview + claim pages where
context matters and conversion tooling can work.

### Body structure (ALL outreach emails — pitch, follow-up 1, follow-up 2)

- **Max 80 words** in the body. Short > long in cold outreach.
- **EXACTLY ONE link** — the preview URL (via `getShortPreviewUrl`). No
  exceptions. No portfolio link. No Calendly link. No second CTA.
- **Zero pricing language in the body.** No "$997", no "3 payments of",
  no "one-time", no "includes domain registration". The prospect sees
  those on the claim page.
- **Zero booking / walkthrough CTAs.** No "book a call", no "schedule",
  no Calendly URL. The soft reply prompt at the end ("curious what you'd
  change") is the CTA.
- **Personal tone only.** First-person, no titles, no company name in the
  sign-off. "— Ben" beats "— Ben @ BlueJays, CEO".
- **Closing question that invites a soft reply**, not a booking. Examples:
  "Curious what you'd change", "What you'd change about it", "Let me
  know if it's a fit or not". Never "Would you like to schedule a call?".
- **Subject line: short, lowercase-feeling, curiosity-inducing.** "Made
  something for [Business]" beats "[Business] — a $997 custom website
  opportunity". No pricing in subject. No emojis. No ALL CAPS.
- **Soft "re:" treatment on follow-ups.** `Re: [Business Name]` as
  follow-up 1 subject signals "continuing a conversation" which Gmail
  treats more favorably than a new commercial send.
- **"Thanks for being one of the ones I spent time on"** or similar in
  the final follow-up. Reciprocity framing converts better than urgency.

### Tone principles

- Should read like a developer or designer emailing a stranger about
  something interesting they noticed, not a sales rep pitching a service.
- Use casual phrasing: "I spent a few hours this week putting together"
  beats "I've designed a professional website solution"
- Validate THEIR work first (reviews, rating, reputation), then mention
  what you built. Never lead with what you want.
- Never apologize for reaching out, never explain why you have their
  info, never say "sorry if you're not interested". Ironically, those
  hedges reduce response rates.

### Banned phrases (never in any outreach email body or subject)

- "Book a call" / "schedule a walkthrough" / "15-min demo"
- "$997" / pricing in any form
- "No pressure" (defensive, sounds like a pushy salesperson backpedaling)
- "Limited time" / "expires soon" / "only a few spots left"
- "Custom design, domain registration, and hosting setup all included"
  (marketing copy in the body — move to claim page)
- "The full build is..." (transactional framing)
- "Click here to..." / "Learn more" (calls-to-action in link text)
- "Premium" / "professional" / "state-of-the-art" (brochure language)

### Psychology Stack (NON-NEGOTIABLE — every pitch must include all 5)

The body copy carries 5 distinct psychological hooks in a specific order.
Each one is small enough to feel natural but together they compound into
a meaningfully higher reply rate than a neutral pitch. Don't skip any.

1. **Discovery + specificity** — open with a real observation about how
   you found them: `"I was looking at {category} businesses in {city} and
   came across {business}"`. Signals real research, not mass blast.
   Never open with "Hope this finds you well" or any other filler.

2. **Validation of their work** — reference their rating/reviews/real
   achievement: `"Your 5★ across 23 reviews stood out"`. Rewards the
   reader's ego for work already done. They feel SEEN before they feel
   SOLD. Skip only if the data isn't there (fewer than 5 reviews).

3. **Reciprocity + effort** — mention specific time invested: `"I spent
   a few hours this week putting together..."`. This is the #1 reply-rate
   driver in cold email research. Classical reciprocity: "they worked for
   me, I should at least look." To avoid Gmail pattern-matching across a
   daily batch of 20+ sends, the codebase rotates across several natural
   phrasings (see `EFFORT_PHRASES` in `email-templates.ts`). Deterministic
   by prospect.id so the same person always gets the same phrasing across
   multiple follow-ups (consistency).

4. **Humility + implicit gap** — disarm the sales-pitch threat while
   subtly implying they have taste: `"No idea if it's what you had in
   mind, but figured you'd want to see it"`. This line does two things
   simultaneously — it lowers the reader's defenses ("he's not pushing
   me"), and it primes them to compare what you built against an
   internal standard they already hold (classic gap technique).

5. **Soft reply prompt / curiosity** — close with an open question that
   invites conversation, not a commitment: `"Curious what you'd change"`.
   Reply rate on "Curious what you'd change" is materially higher than
   on "Would you be open to a 15-min call?" because the former requires
   no commitment — the reader can reply with literally any thought.

**Other hooks from the broader Sales & Outreach section** (loss aversion,
scarcity, social proof, future self, identity) are appropriate on the
claim page, voicemail scripts, and follow-up SMS — but **NOT in the
pitch email body**. They read as marketing copy and trip Gmail's
Promotions classifier. Keep the pitch email pure psychology-first,
pricing/scarcity/CTA-zero.

### Effort phrase rotation rule

Ben explicitly requested (2026-04-19) that every pitch mention a
specific amount of time invested personally — "a few hours this week",
"all afternoon yesterday", "a chunk of the weekend", etc. The codebase
maintains an array `EFFORT_PHRASES` in `email-templates.ts` with 6-8
natural variations.

- ADD new phrases to that array, NEVER replace existing ones without
  Ben's approval — different businesses across the funnel history may
  have seen specific phrasings.
- Every phrase must be casual, specific, and first-person ("I" not "we"
  or "our team").
- Never say "the team" or "our designers" — Ben is one person, that
  personal thread is part of the psychology.
- Time references can be vague ("recently", "this week") or specific
  ("yesterday afternoon", "Sunday night"). Mix is fine.

### Approved baseline template (Day 0 pitch)

Locked in `src/lib/email-templates.ts::getPitchEmail()`. If you rewrite
it, you must preserve all of the rules above. The approved body format:

```
Hi {greeting},

I was looking at {category} businesses in {city} and came across
{businessName}. Your {rating}★ across {reviewCount} reviews stood out.

{effortPhrase} — uses your actual services, photos, and contact info:

{shortPreviewUrl}

No idea if it's what you had in mind, but figured you'd want to see it.
Curious what you'd change.

— Ben
bluejaycontactme@gmail.com
```

Where `{effortPhrase}` is deterministically picked from `EFFORT_PHRASES`
based on prospect.id — e.g. "I spent a few hours this week putting
together what a new website for you could look like" or "Worked on this
for a chunk of the afternoon yesterday — a website concept for you".

The follow-ups (Day 5 + Day 12) use the same principles with slightly
different framings: "Re: [Business]" + "just circling back" for follow-up
1, "Last check on [Business]" + graceful out for follow-up 2.

### Why this matters

Email deliverability compounds on volume + content. Bad body copy kills
sender reputation even if DKIM/SPF/DMARC are perfect. **Every single
email that lands in Promotions or Spam instead of Primary drags the
domain's reputation down.** One clean template at 80 words with 1 link
outperforms a polished 300-word template with 3 links every time. And
because we warm up over 14 days, the cost of a bad template during
warmup is 14 days of compounding reputation damage that takes 30+ days
to recover from. The template lives at the foundation — treat it as such.

