# BlueJays Voice Corpus

The data-sources folder for every customer-facing AI feature in
BlueJays. Required by **CLAUDE.md Rule 76**.

This is the "what TO do" reference (the prompts encode "what NOT
to do"). When AI features generate emails, replies, audit copy,
or anything else a prospect reads with Ben's name at the bottom,
they must inject excerpts from this corpus into a prompt-cached
system message so the output sounds like Ben — not like the
internet.

## What's in this folder

| File | What goes in it | Target volume |
|---|---|---|
| `cold-pitches.md` | Highest-performing cold-outreach emails Ben personally wrote that got replies. Anonymized recipients. | 10-20 emails |
| `replies.md` | Ben-written replies in engaged-prospect threads. Objection handling, discovery questions, soft closes. | 10-20 replies |
| `tweets.md` | Highest-engagement tweets/X posts Ben has personally written. Style fingerprint, not topic catalog. | 50-100 tweets |
| `linkedin-posts.md` | Highest-engagement LinkedIn posts Ben has personally written. | 20-30 posts |
| `sales-call-snippets.md` | Anonymized snippets from top-closed sales calls. Opener / discovery / objection / close. | 5-10 snippets |
| `vsl-scripts.md` | Actual scripts behind 1-2 best VSLs Ben has shipped. | 1-2 scripts |
| `voice-rules.md` | Distilled style guide derived from the above. Sentence-length tendencies, banned phrases, preferred openers, signature transitions. | One living doc |

## Curation rules

1. **Quality > volume.** 10 great pitches beat 1,000 average ones.
   Only paste content Ben himself reads back and nods at.
2. **Verbatim, never paraphrased.** Ship the actual emails. The
   messy human cadence IS the signal.
3. **Anonymize recipients only.** Replace `Hi Marcus` → `Hi {name}`.
   Don't sanitize otherwise — keep the typos, em-dashes, asides.
4. **Tag each entry.** Every email/reply/post starts with a
   one-line frontmatter block (see template below) so the prompt
   builder can subset by use case.

## Per-entry template

```
---
type: cold-pitch | reply | tweet | linkedin | call-snippet | vsl
date: 2026-XX-XX
recipient_category: dental | electrician | manufacturer | ...
context: cold | follow-up | warm-intro | reactivation | ...
outcome: replied | booked-call | closed | no-reply
note: (optional) why this one is in the corpus
---

[verbatim content here]
```

## Maintenance

- **Quarterly review** — drop stale entries (Ben's voice evolves),
  add new high-performers from the past 3 months.
- **When output quality of any AI feature degrades** — audit the
  corpus FIRST before tweaking the prompt (Hormozi's maintenance
  trigger).
- **When a sent email converts** — consider adding it to
  `cold-pitches.md` or `replies.md`.

## How features consume the corpus

Features import via the (TBD) helper at `src/lib/voice-corpus.ts`:

```ts
import { loadVoiceCorpus } from "@/lib/voice-corpus";

const corpus = loadVoiceCorpus({ types: ["cold-pitch", "voice-rules"] });
// returns { excerpts: string, tokens: number }
// inject as a CACHED system-prompt segment per AI Cost
// Optimization Rules — cache_control: { type: "ephemeral" }
```

Subset by use case so token budget is sane even with caching:

| Feature | Corpus subset to load |
|---|---|
| Cold-pitch generator | `cold-pitches` + `voice-rules` |
| AI reply drafter | `replies` + `call-snippet` + `voice-rules` |
| Audit-page copy | `linkedin` + `voice-rules` (long-form public voice) |
| SMS templates | `replies` + `voice-rules` (short, conversational) |
| Newsletter / mosy-minute style | `linkedin` + `voice-rules` |

## Why the corpus is here, not in `src/lib/`

`data/` is the right home because:
- Markdown files are content, not code
- Ben edits these directly without firing the type checker
- `src/lib/voice-corpus.ts` (the loader) reads from this folder
  via Node `fs.readFileSync` at module init
- Any future BlueJays Pro client gets their own version of this
  folder structure shipped to them as part of the AI Setup Day
  deliverable (per `aios/PRO_SYNTHESIS.md`)

## Status

| File | Filled | Last review |
|---|---|---|
| `cold-pitches.md` | 🟡 placeholder | — |
| `replies.md` | 🟡 placeholder | — |
| `tweets.md` | 🟡 placeholder | — |
| `linkedin-posts.md` | 🟡 placeholder | — |
| `sales-call-snippets.md` | 🟡 placeholder | — |
| `vsl-scripts.md` | 🟡 placeholder | — |
| `voice-rules.md` | 🟡 placeholder | — |

🟡 = waiting on Ben to paste real content
🟢 = filled
🔴 = needs review (stale)

## References

- **Rule 76** in `bluejays/CLAUDE.md` — the contract this folder satisfies
- **AIOS principle 13** in `aios/CLAUDE.md` — three-folder architecture (this corpus IS the "data sources" folder)
- **Hormozi reference** at `aios/references/hormozi_ai_principles.md` — the source insight + 10 prompt templates that consume this corpus
