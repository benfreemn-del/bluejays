---
name: brief
description: Daily morning briefing — pulls last 24h of audit submissions, prospect status changes, open client tasks, and paid prospect transitions. Hands to Claude Sonnet to produce a 5-bullet "what should I focus on today?" with one recommended Hormozi-leverage action. SMS'd to Ben on success. Fires Mon-Fri 7am PT via cron. Runtime source of truth lives at src/lib/ai-skills/skills/brief.ts (this file is a documentation mirror for Claude Code's Skill tool discovery only).
---

# brief

Day-2 skill of the bj ai layer.

**Cron:** `0 14 * * 1-5` (7am PDT Mon-Fri).
**Manual invoke:** `bj ai brief` from the terminal.
**Cost cap:** $0.10/run.
**Model:** claude-sonnet-4-6.
**Output:** structured JSON with `summary` field (≤280 chars) that gets SMS'd to Ben via `sendOwnerAlert`.

## Context the skill gathers
- New audit submissions in last 24h
- Prospect status changes in last 24h (inbound replies, status flips)
- Open client tasks (top 5 by priority)
- Paid prospects today (count)
- Hormozi 30-day ramp day (computed from 2026-04-28 start)

## noWork branch
When zero activity in last 24h (cold weekend, full pause), skill returns `noWork: true` with cost=0. The cron run is still persisted to `ai_skill_runs` so Ben can see it fired.

## Output shape
```
{
  "date": "YYYY-MM-DD",
  "ramp_day": <int>,
  "cash_line": "...",
  "pipeline_line": "...",
  "todays_action": { "action": "...", "why": "..." },
  "alerts": ["..."],
  "summary": "☀️ Day N · ..."
}
```

## When you (Claude) might invoke this from chat
- Ben asks "what should I focus on today" or "give me the brief"
- During a debug session to test the gatherer
- Before a strategic conversation, to load real pipeline state into context

## Runtime source of truth
`src/lib/ai-skills/skills/brief.ts` — modify there, not here. This SKILL.md is just a Skill-tool-discoverable doc mirror per the locked architecture (`bluejays/CLAUDE.md` → "skills are TS modules, not fs-discovered SKILL.md files").
