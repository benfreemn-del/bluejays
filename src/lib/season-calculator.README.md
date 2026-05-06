# Season Calculator · soccer in-season logic

**Owner:** This is the calendar-aware "is this lead in-season?" engine
that drives the green/grey badge on every lead card.

**Source of truth:** Philip + Paul · Saturday 2026-05-10 close meeting

---

## How it works

Each lead has 5 nullable context fields (added in migration
`20260515_lead_context_fields.sql`):

| Field | Allowed values |
|---|---|
| `competition_tier` | `mls-next` · `ecnl` · `rcl-select` · `rec-youth` · `rec-adult` · `high-school` · `college` · `pro` · `unknown` · null |
| `age_group` | `U8`–`U19` · `high-school` · `college` · `adult` · `unknown` · null |
| `gender` | `boys` · `girls` · `men` · `women` · `mixed` · `unknown` · null |
| `state_override` | 2-letter state · null (falls back to scraped state in `raw_payload.state`) |
| `in_season_override` | `in-season` · `off-season` · null (manual override always wins) |

The calculator at `src/lib/season-calculator.ts` takes those fields plus
the current date and returns `{ inSeason, reason, confidence }`.

---

## State-specific rules

### Washington (the unusual one — Philip + Paul flagged this directly)

WIAA (Washington Interscholastic Athletic Association) runs HS soccer:
- **Boys = Spring** (Mar–May)
- **Girls = Fall** (Aug–Oct)

Club soccer = year-round MINUS the gender's HS season for HS-overlapping
ages (U16+).

So in WA:
- **Boys U17 lead, today is April** → off-season (boy is playing HS, club paused)
- **Girls U17 lead, today is September** → off-season (girl is playing HS)
- **Boys U17 lead, today is November** → in-season (HS over, club back on)

### Other states (default)

HS = Fall for both genders. So Aug–Oct is HS-affected for U16+.

### MLS NEXT — special case (any state)

Year-round, no HS overlap allowed (MLS NEXT bylaws). Off only Jun–Jul
(summer break).

### College / Pro — separate calendars

NCAA D1 = Fall (Aug–Nov). Pro leagues mostly Apr–Oct.

### Adult Rec — always in-season

Rec leagues run year-round across indoor + outdoor cycles.

---

## Confidence levels

- **HIGH** — All 4 inputs present (state + gender + age + tier)
- **MEDIUM** — Partial signal (e.g. state + tier only)
- **LOW** — State + tier missing → fallback to standard club calendar

The calculator never refuses to compute — it always returns a value, but
the confidence flag tells the owner how much to trust it.

---

## How to extend to a new state

When a new tenant lands in CA / TX / etc. with reverse seasons or special
state HS rules:

1. Add a state branch to `season-calculator.ts` (mirror the WA branch)
2. Document the WIAA-equivalent calendar at the top of this README
3. Add test cases (see below)

---

## Manual override workflow

Per Philip + Paul's spec — every lead card has an "⚙️ Edit context"
button that opens `LeadContextEditor`. The owner sets the 5 fields,
sees a live preview of what the calculator says, then either:
- Trusts the calc → leaves `in_season_override` empty
- Overrides → picks "Force in-season" or "Force off-season"

Save button is required-with-confirm. Empty fields → null in DB →
calculator falls back to defaults.

---

## Reference data set used by the calculator

The calculator does NOT cross-reference club rosters. It infers from the
lead's tags. RCL Select roster + ECNL roster + MLS NEXT roster + NCAA
schools live in `src/data/us-*.json` for the map layer, but the
calculator itself just trusts what's tagged on the lead.

If a lead's club is "Crossfire Premier" and ECNL Boys, the owner sets
`competition_tier=ecnl`, `gender=boys`, `age_group=U17` — the calculator
runs from there.

Future enhancement (not built): cross-reference scraped business names
against the club rosters to auto-tag tier on inbound scout leads. Queued.

---

## Test cases (mental table — run these to verify)

| State | Gender | Age | Tier | Today | Expected |
|---|---|---|---|---|---|
| WA | boys | U17 | ecnl | 2026-04-15 | OFF (HS spring) |
| WA | girls | U17 | ecnl | 2026-09-15 | OFF (HS fall) |
| WA | boys | U17 | ecnl | 2026-11-15 | IN |
| WA | boys | U14 | rcl-select | 2026-04-15 | IN (U14 not HS-overlap) |
| WA | mixed | adult | rec-adult | any | IN |
| CA | boys | U17 | ecnl | 2026-09-15 | OFF (standard fall HS) |
| any | any | any | mls-next | 2026-07-15 | OFF (summer break) |
| any | any | any | mls-next | 2026-04-15 | IN |
| WA | unknown | unknown | unknown | 2026-07-15 | OFF (summer break, low confidence) |
