# Cold Pitches — Ben's Voice Corpus

Highest-performing cold-outreach emails Ben personally wrote that got
replies. Anonymized recipients (`Hi {name}`). Target: 10-20 entries.

This is the primary fuel for `getPitchEmail()` and any future
cold-outreach AI feature. The AI references these to match Ben's
cadence — opener style, effort hook, soft reply prompt, sign-off.

See `README.md` in this folder for the per-entry template + curation
rules.

---

## Status

🟡 **Awaiting content.** Ben to paste 10-20 of his best-performing
cold pitches here.

**How to find them:**
1. Run this query against the `emails` Supabase table to surface
   high-performers from the last 90 days:

```sql
select e.id, e.subject, e.body, e.sent_at, p.business_name, p.category
from emails e
join prospects p on p.id = e.prospect_id
where e.sent_at > now() - interval '90 days'
  and e.sequence = 'pitch'
  and exists (
    select 1 from email_events ev
    where ev.email_id = e.id
    and ev.event_type in ('reply', 'click')
  )
order by e.sent_at desc;
```

2. Cherry-pick the 10-20 that Ben actually nods at when he reads
   them back.
3. Anonymize recipient names → `{name}`. Keep everything else
   verbatim — typos, em-dashes, asides, the works.
4. Add the per-entry frontmatter from `README.md` above each one.

---

<!-- ENTRIES BEGIN HERE -->

<!-- Example template — replace with real entries:

---
type: cold-pitch
date: 2026-04-19
recipient_category: dental
context: cold
outcome: replied
note: the template the post-launch psych-stack pitch is built on
---

Hi {name},

I was looking at dental practices in Sequim and came across {business}.
Your 4.8★ across 67 reviews stood out.

I spent a few hours this week putting together what a new website for
you could look like — uses your actual services, photos, and contact
info:

{shortPreviewUrl}

No idea if it's what you had in mind, but figured you'd want to see it.
Curious what you'd change.

— Ben
bluejaycontactme@gmail.com

-->
