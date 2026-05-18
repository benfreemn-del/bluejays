---
name: qualify
description: Per-prospect deep qualification. Reads the prospect record + most recent completed audit + BANT form answers + scraped data. Returns fit_score (0-100), recommended tier ($10k AI System / $997 website / free audit only / disqualify), specific next action, recommended channel, and a ready-to-send first-touch message in Ben's voice. Result is cached on prospects.ai_qualification (JSONB) for the future Madie pipeline UI + triage de-duplication. Runtime source of truth lives at src/lib/ai-skills/skills/qualify.ts.
---

# qualify

Day-3 skill of the bj ai layer.

**Manual invoke:** `bj ai qualify --prospect-id <uuid>`
**Indirect:** triage's morning queue tells Ben who to qualify manually
**Cost cap:** $0.10/run · Sonnet · 900 max tokens out
**Persists:** `prospects.ai_qualification` JSONB column

## Output shape
```
{
  "fit_score": 0-100,
  "recommended_tier": "free_audit_only" | "$997_website" | "$10k_ai_system" | "disqualify",
  "recommended_action": "...",
  "recommended_channel": "email" | "sms" | "phone" | "wait",
  "drafted_message": "...",
  "reasoning": "...",
  "summary": "<≤140 chars>"
}
```

## When you (Claude) might invoke this from chat
- Ben asks "qualify <business name>" or "deep dive on prospect <id>"
- Triage surfaced a top pick — Ben wants the deep score + drafted message
- Madie is about to call a prospect and needs the recommended angle

## Tier rules (locked)
- **$10k_ai_system**: manufacturer/DTC/author + (50+ orders/mo OR running ads OR audit < 60)
- **$997_website**: service business OR product brand under 50 orders/mo, audit 40-70
- **free_audit_only**: low intent / decent existing site (audit 80+) / unclear BANT
- **disqualify**: spam / fake email / out-of-ICP

## Runtime source of truth
`src/lib/ai-skills/skills/qualify.ts` — modify there, not here.
