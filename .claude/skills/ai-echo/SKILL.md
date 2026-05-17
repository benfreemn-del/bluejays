---
name: echo
description: Day-1 smoke test for the bj ai skill layer. Takes a message string, calls Claude, returns the message echoed back + uppercased + counted. Validates the entire pipeline (load → gather → guard → call → parse → schema → persist) end-to-end before any real skill ships.
model: claude-haiku-4-5
maxTokensOut: 200
costCapPerRunUsd: 0.01
outputSchema: ./output.schema.json
visibility: ben-only
---

# echo

Smoke-test skill. Takes one arg `--message "<text>"` and returns it
echoed back from Claude in a structured JSON output. Costs roughly
$0.0005 per call (Haiku, ~50 input tokens, ~80 output tokens).

## When to run

- After any change to the runner / cost-guard / registry / claude-call
  to confirm the pipeline still works end-to-end
- During the Day-1 build to validate every component before moving
  to the real skills (brief, qualify, etc.)
- Never on cron — manual-only

## Output shape

See output.schema.json. Top-level `summary` field is used by the
runner as the stdout / dashboard line.
