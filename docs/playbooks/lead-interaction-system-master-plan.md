# Lead Interaction System — Hormozi-Lens Master Plan

> **Status:** plan only, awaiting Ben approval. Build sequence: Phase 1 (foundation) lands before wave-1 produces sustained volume. Phase 2 (intelligence) lands within 30 days. Phase 3 (compounding) lands within 90 days.
> **Owner:** Ben · **Authored:** 2026-05-18
> **Why it matters:** today's audit found ZERO logged touches across 75 inbound leads. When wave-1 + Google produce sustained volume, the difference between "we close 30% of audit leads" and "we close 8% of audit leads" is whether every touch is captured, scored, and threaded so the operator walks into each conversation with full context.

## 1. Hormozi-lens diagnosis

### What the current system gets RIGHT

- `prospect_status_changes` is healthy (1,396 rows in 30d) — status flips ARE captured
- `prospects.last_contacted_at` exists as a single-timestamp field
- `prospects.admin_notes` accumulates unstructured text on the "Just called" button
- Status enum covers the full funnel: scouted → audit_lead → contacted → preview → paid → live
- Hot-lead SMS alerts fire to Ben within seconds of audit form submission

### What the current system gets WRONG (Hormozi-framework violations)

| # | Violation | Framework | Cost to BlueJays |
|---|---|---|---|
| 1 | **No 60-second SLA enforcement** — operator gets SMS alert but nothing forces follow-through. | Annie 60-sec lead followup rule | Per Annie's diagnosis: every minute of delay drops close rate ~10%. At $10k AI System, that's $1k of EV per minute. |
| 2 | **Status flip ≠ touch logged** — Madie marks a lead "contacted" but no record of when/how/what was said. | Joel damaging-admissions + Cory "I Owe You" reactivation requires touch history. | Madie & Ben double-touch leads. Reactivation is impossible without history. |
| 3 | **Calls only — no text/email/DM tracking.** | Annie reception funnel concept (every channel funnels to one CRM view). | 95% of customer interactions on Sequim-area small-business audience are SMS, not calls. Most touches happen but are invisible. |
| 4 | **No timeline view per lead** — every touch buried inside one TEXT field. | Hormozi "context-switching kills close rate." | Operator walks into each call without knowing what was discussed last time. Lower close rate. |
| 5 | **No automatic BAM-FAM** — at end of each touch, no forcing function to schedule the NEXT touch. | Annie BAM-FAM (Book a Meeting From a Meeting). | Leads fall through the cracks. The 18 audit_leads with NO contact attempt despite being in the system 8-30 days = direct evidence. |
| 6 | **No lead scoring at opt-in.** | Joel's "lead scoring at opt-in" — auto-rank leads so operator works highest-value first. | Operator works leads in random order. ICP-perfect leads sit cold while low-fit leads get reached. |
| 7 | **No structured loss-reason capture.** | Hormozi obstacles vs objections + 5 obstacle types (time/value/fit/authority/avoidance). | `loss_reasons` table exists but isn't enforced at status='dismissed' transitions. We can't pattern-match WHY deals die. |
| 8 | **No script/sequence integration.** | Hormozi "scripts not stories" — every touch should be a known template. | Operator improvises every touch. Inconsistent quality, no Document-Demonstrate-Duplicate Madie ramp. |
| 9 | **No mobile-first capture.** | Hormozi 6 Horsemen H4 (red dress, friction). | Ben + Madie call from their phones, then never log. Friction kills the data. |
| 10 | **No AI-drafted next-touch suggestion.** | Joel kaleidoscope — multiply the operator's brain across more leads. | Operator brain budget is the cap. Without AI assist, throughput stalls at ~10 calls/hr. |

### What's missing entirely

- Touch-quality scoring (a 30-min call ≠ a 1-line text)
- Conversational threading (group all touches into one "deal" thread)
- Attribution back to wave/audience/utm_content for closed deals
- Auto-credit to Madie's commission tier at time of touch
- Damaging-admission auto-fire on Day 0
- Voice memo / dictation capture (so Ben can log a call by talking 30 seconds, not typing)
- Workflow auto-routing (new audit lead → Madie, low-response → escalate to Ben)
- Front-loaded loss reason capture at dismiss-time

## 2. The BlueJays-specific goal

BlueJays sells at three price points: $997 website, $10k AI System, $500/mo management. Each has a different touch cadence:

| Tier | Expected touches to close | First-touch SLA | Decision-maker pattern |
|---|---|---|---|
| $997 site | 1-3 (often single-call close) | 60 sec | Owner-operator, single decision-maker |
| $10k AI System | 5-12 over 7-21 days | 2 min | Owner + sometimes spouse/partner |
| $500/mo mgmt | Post-purchase, multi-touch retention | N/A (existing relationship) | Already a customer |

The system needs to handle ALL THREE with the same fundamental UI but different defaults. Phase 1 ships the foundation. Phases 2-3 layer the intelligence per tier.

The single biggest leverage point: **the difference between a 60-sec response and a 30-min response on the audit funnel is ~3-4x the close rate.** That's the #1 line in Annie's diagnosis and Luis's 1-year-validated playbook. Everything else in this plan is downstream of that one rule.

## 3. The full target architecture

### Layer 1 — Foundation (Phase 1, ~3 hr build)

The touch-logging table + components from the earlier build plan, plus three Hormozi-required additions:

**Table: `prospect_touches`** (from the earlier plan, with these new fields):

```sql
CREATE TABLE prospect_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,

  -- WHAT: call / voicemail / text / email / dm / in_person / note
  kind TEXT NOT NULL CHECK (kind IN ('call','voicemail','text','email','dm','in_person','note')),

  -- WHICH WAY: outbound (we reached out) or inbound (they reached us)
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound','inbound')),

  -- OUTCOME: structured for analytics
  outcome TEXT CHECK (outcome IN (
    'connected','no_answer','left_voicemail','declined',
    'replied','no_reply','sent','received',
    'meeting_booked','meeting_held','meeting_no_show'
  )),

  -- HORMOZI ADD #1: CLOSER stage attempted (per Hormozi's sales framework)
  -- C-L-O-S-E-R = Clarify why · Label problem · Overview pain · Sell vision · Explain away · Reinforce
  closer_stage TEXT CHECK (closer_stage IN ('clarify','label','overview','sell','explain','reinforce','none')),

  -- HORMOZI ADD #2: damaging-admission fired? (Joel's lead-qualifying technique)
  -- "This won't work for you if X" — frontloaded so unfit leads self-disqualify
  damaging_admission_fired BOOLEAN NOT NULL DEFAULT false,

  -- HORMOZI ADD #3: next-touch scheduled (BAM-FAM forcing function)
  next_touch_kind TEXT CHECK (next_touch_kind IN ('call','text','email','meeting','followup_note')),
  next_touch_at TIMESTAMPTZ,
  next_touch_note TEXT,

  notes TEXT,
  by_user TEXT NOT NULL DEFAULT 'ben',
  external_id TEXT,
  duration_seconds INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX prospect_touches_prospect_idx ON prospect_touches (prospect_id, occurred_at DESC);
CREATE INDEX prospect_touches_next_touch_idx ON prospect_touches (next_touch_at) WHERE next_touch_at IS NOT NULL;
CREATE INDEX prospect_touches_by_user_idx ON prospect_touches (by_user, occurred_at DESC);
```

**Companion table: `prospect_lead_score`** (Hormozi ADD: Joel's lead scoring at opt-in):

```sql
CREATE TABLE prospect_lead_score (
  prospect_id UUID PRIMARY KEY REFERENCES prospects(id) ON DELETE CASCADE,

  -- 0-100 composite, computed once at intake then on every status change
  fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),

  -- Component sub-scores (so we can audit the composite)
  audit_score INTEGER,                 -- 0-100, from the AI audit result
  bant_score INTEGER,                  -- 0-100, from BANT form answers
  icp_score INTEGER,                   -- 0-100, ICP fit (mfg / DTC / author bonus)
  contact_certainty INTEGER,           -- 0-100, "do we have valid email + phone"

  -- Tier recommendation
  recommended_tier TEXT CHECK (recommended_tier IN ('fullsystem','standard','custom','free','disqualify')),

  -- Workflow routing
  recommended_owner TEXT CHECK (recommended_owner IN ('madie','ben','ai-only','disqualify')),

  -- Cached AI rationale (so operator sees "why is this rated 87")
  rationale TEXT,

  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### UI Components (Phase 1)

**`<TouchButtons prospectId size />`** — one-tap, mobile-first:
- [📞 Called] [💬 Texted] [✉️ Emailed] [📝 Note] [🎤 Voice memo]
- Each opens a 3-second-fill popover: outcome dropdown + 1-line note + next-touch suggestion
- Voice memo records 30 sec → auto-transcribed via Whisper → fills the note field

**`<TouchTimeline prospectId />`** — vertical scroll, newest first:
- Each row: emoji icon · who · when · outcome chip · 1-line note · "edit/delete" hover
- Color-coded by direction (outbound = blue, inbound = green)
- Auto-grouped into "threads" by 24-hour conversation windows

**`<NextTouchBadge />`** — red badge on prospect cards in `/dashboard/leads`:
- "⚠️ no touch in 47 min" if audit_lead status with no touches
- "⏰ 1 hr overdue" if next_touch_at has passed
- "✓ Madie touched 12 min ago" so Ben knows not to double-touch

**`<60SecondSLAChip />`** — top-of-page telemetry chip:
- "Today: 4/5 audit leads touched within 60s (80%)"
- Powers Annie's reception-funnel SLA enforcement

### API Routes (Phase 1)

- `POST /api/prospects/[id]/touches` — record a touch
- `GET /api/prospects/[id]/touches?limit=50` — fetch timeline
- `POST /api/touches/voice-transcribe` — upload audio, return Whisper transcript
- `GET /api/touches/today` — operator dashboard view: every touch today by every user
- `GET /api/touches/overdue` — leads with `next_touch_at < NOW()` or audit_lead + no touch
- `POST /api/prospects/[id]/score` — re-compute lead score (used by AI on first intake + status changes)

### Surfaces to mount (Phase 1)

1. `/dashboard/leads` — every row gets `<TouchButtons size=sm />` + `<NextTouchBadge />`
2. `/dashboard/clients/[slug]` — full `<TouchTimeline />` + buttons
3. `/lead/[id]` — operator deep-link page with full history
4. `/dashboard/script` — existing "Just called" routes through new API + still works (legacy compat)
5. New: `/dashboard/queue` — Hormozi-style call queue. Lead-scored prospects in priority order, one-tap-dial button per row, auto-records call duration

### Layer 2 — Intelligence (Phase 2, ~5 hr build, lands within 30 days)

Once the foundation is captured, the AI layer makes operator brain budget go further.

**AI-drafted next-touch suggestion** — when operator opens a prospect:
- Reads touch history + audit result + prospect details
- Generates: "Here's what to send right now: <pre-drafted text>"
- One-tap "Send as me" via existing SMS/email pipes
- Logs the touch automatically with `by_user='ben'` (if Ben sent) or `by_user='ai-assist'` (if AI drafted but human approved)

**Auto-fire damaging admission on Day 0** — Joel's qualification technique:
- New audit lead lands → check ICP score
- If fit_score < 50 → auto-text damaging admission "Hey, this probably won't be a fit if you're under $50k/yr revenue. Reply YES if you'd like to chat anyway."
- High-fit (>70) gets the warm welcome instead
- Both log a touch with `damaging_admission_fired=true` so we can A/B the close rates

**5-step pre-built outreach sequences** — Hormozi "scripts not stories":
- Operator picks a sequence template (e.g. "Audit Lead Day 0-14 Sequence")
- System fires Day 0 / Day 1 / Day 3 / Day 7 / Day 14 touches automatically
- Each touch is editable BEFORE send (humans-in-the-loop)
- Cancellation: any inbound reply pauses the sequence

**Workflow auto-routing** — Hormozi "Workflows not Roles":
- New audit lead → Madie's queue if fit_score < 80
- New audit lead → Ben's queue if fit_score ≥ 80 (high-value goes to closer)
- Madie's lead with no response after 3 touches → auto-escalate to Ben
- Repeat customer or referral → bypass Madie, go straight to Ben

**Voice transcript auto-summary** — when Twilio records a call:
- Whisper transcribes
- GPT-4.1-mini summarizes into 1-paragraph debrief
- Auto-fills the touch's `notes` field with the summary
- Surfaces in timeline so operator sees "you called for 28 min, here's the gist"

**Loss-reason forcing function** — at any `status='dismissed'` or `status='wont-do'` transition:
- Modal opens with the 5 obstacle types: too expensive · wrong time · not a fit · no authority · ghosted
- Operator MUST pick one before status changes
- Writes to existing `loss_reasons` table
- Quarterly review = patch the friction the 5 reveal

### Layer 3 — Compounding (Phase 3, ~3 hr build, lands within 90 days)

Once data accumulates, the system gets smarter automatically.

**Touch-pattern learning** — every closed $10k AI System deal:
- System records the touch sequence (kind/timing/length) that led to close
- After 10 closes, GPT-4 generates "the BlueJays winning sequence" recommendation
- Update the default outreach template based on what's working

**Madie commission auto-credit** — every closed deal:
- System reads touches by_user, identifies "who logged the deciding touch"
- Auto-credits commission per Madie's current tier ($200 setter / $400 closer per $997, $1k setter / $2k closer per $10k)
- Surfaces on her dashboard: "you earned $1,200 this month from 3 closes"

**Wave / audience attribution to close** — for each closed deal:
- Read utm_audience + utm_content from intake
- Tag the close with which wave-1 / wave-2 hook drove it
- Quarterly: "wave-1 mfg-pain hook produced 4 closes at $40k revenue, CAC $185, ROAS 21x"

**60-sec SLA telemetry chip** (already in Phase 1 stub, fully wired in Phase 3):
- Real-time rolling 24-hour window
- "Today's 60-sec hit rate: 87% (13/15)"
- Per-operator breakdown so Madie's accountability is visible
- Embedded on the dashboard home

## 4. Phase-by-phase build sequence

### Phase 1 — Foundation (TARGET: tomorrow, ~3 hr)

1. Migration: `prospect_touches` + `prospect_lead_score` tables (10 min)
2. Lib: `src/lib/prospect-touches.ts` + `src/lib/prospect-lead-score.ts` (30 min)
3. API: `/api/prospects/[id]/touches` POST + GET + `/api/touches/overdue` (30 min)
4. Components: `<TouchButtons>`, `<TouchTimeline>`, `<NextTouchBadge>`, `<60SecondSLAChip>` (60 min)
5. Mount on `/dashboard/leads` + prospect detail + `/lead/[id]` + `/dashboard/script` legacy bridge (30 min)
6. Backfill: parse `admin_notes` for old `[Date call]` entries, seed new table (20 min)
7. Voice transcribe stub (returns 501 not-implemented for now; UI is hidden until Phase 2) (10 min)
8. tsc + commit + push (10 min)

### Phase 2 — Intelligence (within 30 days, ~5 hr)

1. AI-drafted next-touch (uses Claude Sonnet, cached via prompt-cache for 90% savings)
2. Auto-fire damaging admission on Day 0
3. 5-step outreach sequences (Day 0/1/3/7/14)
4. Workflow auto-routing rules
5. Voice transcript auto-summary
6. Loss-reason forcing function modal

### Phase 3 — Compounding (within 90 days, ~3 hr)

1. Touch-pattern learning ("the winning sequence")
2. Madie commission auto-credit
3. Wave/audience attribution to close
4. Real-time 60-sec SLA telemetry rollup
5. Quarterly attribution audit auto-generation

## 5. Reusable AIOS skill — `lead_interaction_orchestrator`

Per AIOS pattern, the Phase 2 + 3 work crystallizes into a reusable skill at `aios/.claude/skills/lead_interaction_orchestrator/` that handles:

- Per-prospect "what's the next best action" recommendation
- Per-operator "what should I work first this hour" queue
- Per-tenant "how is the lead funnel performing this week" digest
- Per-tenant "should we kill or scale this audience" attribution audit

This is the skill BlueJays Pro tier-3 clients will eventually inherit. Build it for BlueJays internal first → productize for Pro tier later. Captured note appended to `aios/PRO_SYNTHESIS.md` once Phase 1 ships.

## 6. Ben's decisions — LOCKED 2026-05-18

All 5 decisions confirmed. Phase 1 spec is execute-only.

1. **`kind` enum:** ✅ Approved as-is — `call / voicemail / text / email / dm / in_person / note`
2. **`outcome` enum:** ✅ Approved as-is — `connected / no_answer / left_voicemail / declined / replied / no_reply / sent / received / meeting_booked / meeting_held / meeting_no_show`
3. **Voice memo (Whisper) in Phase 1:** ✅ YES — biggest mobile UX win, removes the #1 friction (typing after calls)
4. **Backfill from `admin_notes`:** ✅ YES — parse `[Date call]` entries, seed touches table so the 75 inbound leads have at-least-partial history on day 1
5. **Phase 2 first piece:** ✅ AI-drafted next-touch suggestion — Claude reads history, drafts next text/email, operator taps Send-as-me. 3x brain budget. Lands ~7 days post-Phase-1.

## 7. Why this is the right move now (Hormozi case in 4 lines)

- **Annie diagnosis line:** "Every minute of delay drops close rate ~10%." Wave-1 leads will start landing within 48h. Without this, every minute of delay is invisible and uncorrected.
- **Cory case study line:** $1.25M → $2.4M came from optimizing existing customer reactivation. Reactivation is impossible without touch history.
- **Joel diagnosis line:** "Lead scoring at opt-in" lets one operator handle 3x the leads. BlueJays has one operator + Madie. We don't have headcount; we have to multiply via system.
- **Hormozi mindset line:** "Patient with outputs, impatient with inputs." The output is closed $10k deals. The input is touch instrumentation. Sharpen the input, the output compounds.

## 8. What I'm NOT building (to keep scope honest)

- Twilio call recording / playback (Phase 3 if at all)
- AI auto-responding to inbound replies (already exists in `src/lib/ai-responder.ts`; we wire its output as a touch in Phase 2 not Phase 1)
- Multi-tenant per-client touch logging (Tekky/ITC clients have their own `client_lead_messages` table; that's separate)
- Email open / click pixel tracking (Phase 2 if at all)
- Per-touch SLA timing aggregations (Phase 3)
- Predictive AI close-probability scoring (Phase 3 if at all)

## Reference

- Annie diagnosis: `aios/.claude/skills/morning_brief/` + `aios/memory/reference_hormozi_annie_frameworks.md` (60-sec lead followup, BAM-FAM, reception funnel)
- Joel diagnosis: `aios/memory/reference_hormozi_joel_frameworks.md` (damaging admissions, lead scoring at opt-in, parallel dialer math)
- Cory 1-year case: `aios/memory/reference_hormozi_cory_frameworks.md` (I-Owe-You reactivation, 65% close-rate floor math)
- Luis 1-year case: `aios/memory/reference_hormozi_luis_frameworks.md` (BANT pre-call SMS, custom-order funnel)
- 5-Clog Framework decision: `aios/decisions/2026-05-07_5-clog-framework.md`
- Existing system: `src/app/api/prospects/[id]/log-call/route.ts` + `src/app/dashboard/script/LeadPicker.client.tsx`
