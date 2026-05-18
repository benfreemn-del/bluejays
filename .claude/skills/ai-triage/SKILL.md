---
name: triage
description: Daily Mon-Fri 8am PT morning queue. Pulls every audit completed in the last 24h whose prospect doesn't yet have an ai_qualification cached, ranks the top 3-5 by composite fit signal (category fit + BANT + audit score + contact certainty), and SMSes Ben the queue. One Claude Sonnet call ranks all candidates in one shot (cheaper than running qualify on each — that's the deep-dive Ben pulls manually on a top pick). Runtime source of truth lives at src/lib/ai-skills/skills/triage.ts.
---

# triage

Day-3 skill of the bj ai layer.

**Cron:** `0 15 * * 1-5` (8am PDT Mon-Fri — fires AFTER brief at 7am)
**Manual invoke:** `bj ai triage` for an on-demand re-rank
**Cost cap:** $0.20/run · Sonnet · 1200 max tokens out
**Side effect:** SMS Ben the summary line via `sendOwnerAlert`

## What gets ranked
- Audits with `status='ready'` AND `generated_at` within last 24h
- AND the prospect doesn't yet have `ai_qualification` cached
- Up to 50 candidates per run (hard cap to bound prompt size)

## Output shape
```
{
  "date": "YYYY-MM-DD",
  "total_audits": N,
  "top_picks": [
    {
      "prospect_id": "<uuid>",
      "business_name": "...",
      "audit_score": 48,
      "category": "...",
      "fit_signal": "...",
      "tier_guess": "$10k_ai_system" | "$997_website" | "free_audit_only",
      "next_action": "<verb-first specific move>"
    }
  ],
  "summary": "🎯 N audits today. Top: <business> ($10k, 48/100). Phone within 1hr."
}
```

## Why one-shot ranking (not N qualify calls)
- Cost: one ranking call ≈ $0.10 vs N×$0.10 for N qualify calls
- Triage = screen. qualify = deep dive. Different jobs.
- Ben/Madie can manually pull `bj ai qualify --prospect-id X` on
  any top pick for the full drafted-message + reasoning

## When you (Claude) might invoke this from chat
- Ben asks "what's in the queue today" / "who should I call first"
- It's morning and the cron hasn't fired yet (e.g., manual catch-up)

## Runtime source of truth
`src/lib/ai-skills/skills/triage.ts` — modify there, not here.
