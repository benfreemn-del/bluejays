# Audit Kick Forensics — 2026-04-26 (D)

## What I found

**Real bug. Found it. Fixed it. FIX APPLIED but UNCOMMITTED — review with `git diff`.**

The audit-kick path in `/api/audit/submit` uses fire-and-forget
`void fetch(...)` AFTER the route's `NextResponse.json(...)` return.
On Vercel serverless, that pattern is unreliable — once the Lambda
invocation returns its response, the runtime is free to freeze or
tear-down before the unawaited fetch's TCP handshake completes. When
that happens, the audit row sits at `status='pending'` forever with
no `failed_reason` because nothing in the kick path ever actually ran.

The 90s auto-retry in `/api/audit/[id]/status` had the EXACT SAME bug
(also `void fetch(...)` after a `NextResponse.json(...)` return). So
the safety net was structurally identical to the original — it would
fire, get cancelled mid-handshake, and stamp nothing.

This explains why audit `0f82f25c-fa9b-43d7-8f85-cb194760cb7e` sat at
`status='pending'`, `audit_content=NULL`, `failed_reason=NULL` for 953
minutes despite being a fresh post-90s-retry-era submission — both
the original kick AND the polling-based retry suffered the same
freeze-before-handshake-completes failure. The conversation summary
noting "0f82f25c was stuck pre-90s-auto-retry era" is consistent
with the same UUID being recycled (it's a deterministic UUID from
the upsert `(prospect_id, target_url)` conflict key + the upsert
re-fetch in submit).

## The failure mode

Step-by-step what happens for an audit that gets stuck:

1. User POSTs `/api/audit/submit`. Validation, rate-limit, prospect
   upsert, audit upsert → `site_audits` row at `status='pending'`.
2. Submit handler executes `void fetch(\`https://bluejayportfolio.com/api/audit/generate/\${id}\`, ...)` —
   this synchronously kicks off a TCP handshake to Vercel's edge.
3. Submit handler immediately calls `return NextResponse.json({...})`
   with the redirect URL.
4. Vercel runtime sees the route handler returned. The Promise
   returned by `fetch(...)` is still pending — the request has not
   yet been transmitted, the edge router has not yet routed it to a
   generate Lambda invocation. Best case there's a few hundred
   milliseconds of grace; worst case the Lambda freezes immediately.
5. Lambda freezes. The pending `fetch` Promise is abandoned. No
   request ever reaches the generate Lambda. No `.catch()` runs
   because the Promise was abandoned before settling.
6. Audit row stays at `status='pending'`, `audit_content=NULL`,
   `failed_reason=NULL`.
7. Client redirects to `/audit/{id}/processing`. The polling page
   begins polling `/api/audit/{id}/status` every 5 seconds.
8. After 90 seconds, the status route's auto-retry kicks in. BUT:
   the auto-retry is `void fetch(...)` followed by
   `return NextResponse.json(...)` — the SAME pattern, same failure
   mode. The retry kick also gets cancelled mid-handshake.
9. Polling continues. Each poll re-triggers the broken auto-retry.
   Each one cancels mid-handshake. The audit stays `pending`.
10. User eventually closes the tab. The polling loop dies. The audit
    is now invisible to all retry mechanisms (only the daily watchdog
    sees it, and that just alerts, doesn't retry).
11. 953 minutes later, you manually mark it `failed`.

Why the original `0f82f25c` reference held: the audit row's UUID is
chosen by the `uuidv4()` in submit, but the upsert key is
`(prospect_id, target_url)`. Re-submitting the same URL by the same
email RE-uses the same row (per the upsert with
`ignoreDuplicates: false`), and the re-fetch returns the same UUID.
So the same prospect re-submitting yourbluejayportfolio.com today got
the same audit ID as a previous attempt — making it look like the
"original" audit was still hanging around. It's not — it's a new
attempt at the same row, hitting the same bug class.

## Fix

**FIX APPLIED but UNCOMMITTED — review with `git diff`.**

Three files changed. Pattern: wrap every `void fetch(...)` of the
audit-kick form in Next.js 16's `after()` from `next/server`. `after()`
schedules work to run after the response is finished and uses Vercel's
`waitUntil` under the hood to extend the Lambda invocation lifetime
until the callback resolves. This is the documented Next 16 primitive
for "post-response background work that must complete" — it's
specifically designed to replace the broken `void fetch(...)` pattern.

Each kick is bounded with `AbortSignal.timeout(8000)` so the submit/
status/watchdog Lambda doesn't pin itself alive longer than necessary
— 8 seconds is plenty for the request to reach Vercel's edge router
and hand off to a fresh generate Lambda invocation (which then runs
on its own 300s budget per `vercel.json`). Timeouts are treated as
the EXPECTED happy path (the generate Lambda is taking minutes to
respond, by design — we don't need to wait for it). Non-timeout
errors are logged.

### File 1: `src/app/api/audit/submit/route.ts`

- Added `after` to the `next/server` import.
- Replaced `void fetch(...)` with an `after(async () => { ... })` block
  that does an awaited fetch with an 8-second AbortSignal.
- On non-2xx HTTP from the kick (auth fail, route 404, etc.), the
  block flips the audit to `failed` with a descriptive `failed_reason`
  — `kick_failed_http_401`, `kick_failed_http_500`, etc. — instead of
  letting the row sit pending. Only flips if `status='pending'` (won't
  clobber a generating/ready audit).
- On non-timeout exceptions (DNS, network), same — flip to failed
  with `kick_threw:...` reason.
- Timeouts (8s AbortSignal firing) are silent — the request reached
  the edge, the generate Lambda is just taking its time, this is fine.

### File 2: `src/app/api/audit/[id]/status/route.ts`

- Added `after` to the `next/server` import.
- Wrapped the 90s auto-retry kick in `after(async () => {...})` with
  an 8-second AbortSignal.
- Generate route is idempotent on `status='generating'`/`'ready'` so
  the duplicate kick (status-route + submit-route both firing) is
  safe.

### File 3: `src/app/api/watchdog/run/route.ts`

- Upgraded the daily stuck-audit detector from "alert only" to
  "alert AND self-heal." Previously it just appended to `alerts[]`
  and SMS'd Ben — the audit stayed stuck.
- New behavior: for every audit in `status='pending'` past the 10-min
  threshold, fire a fresh kick at the generate route inside `after()`.
- Restricted to `pending` only — `generating` rows might be mid-run
  on another Lambda, don't disturb them.
- This means even if both the submit-route AND status-route kicks
  fail (network outage during submit, then user closes tab so polling
  doesn't fire), the audit gets a third recovery attempt within 24
  hours. Layered safety net.

### Verification

- `npx tsc --noEmit` returns 0 new errors. The 3 errors visible in
  output are all pre-existing in `scripts/recover-broken-link-sends.ts`
  and `src/app/api/prospects/[id]/linkedin-discover/route.ts` (untouched
  files).
- All three changes are minimal and self-contained — no shared lib
  changes.
- `after()` was confirmed as the canonical Next 16 primitive by reading
  `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`.
  Stable since Next 15.1.0; this codebase is on Next 16. Documented as
  the replacement for serverless fire-and-forget patterns.

### What's still untested

- I did NOT run an end-to-end submit-then-poll cycle on the dev
  server. The fix is structural and the docs explicitly cover this
  pattern, but a smoke test would confirm. Suggested: submit a real
  audit against a low-cost target URL (e.g.
  `https://example.com`) on the next deploy and watch the audit row
  flip from `pending` → `generating` → `ready` within ~5 minutes.
- The watchdog self-heal path was not exercised — it'd take a stuck
  audit to verify. The code is straightforward and follows the same
  `after()` pattern as the other two, so the risk is low.
- The `failed_reason` stamping in the submit-route's after block has
  not been triggered in test. It's defensive coverage for cases where
  the kick fetch returns a non-2xx synchronously (e.g. CRON_SECRET
  drift), which is now visible to the operator dashboard instead of
  silent.

## What I ruled out

- **bluejayportfolio.com self-audit recursive issue** — checked
  `fetchSiteContext` in `src/lib/site-audit.ts`. It does a single
  `fetch(targetUrl)` with `AbortSignal.timeout(10000)` and a
  custom User-Agent. bluejayportfolio.com is a Next.js app served
  by Vercel — should respond in well under 10s with valid HTML.
  Even if the fetch errored, `fetchSiteContext` catches the error
  and returns a `SiteContext` with `fetchError` set, allowing the
  audit to proceed using just the screenshot URL. So a slow/buggy
  self-fetch wouldn't strand the audit at `pending` — it'd run
  through to `ready` (with a degraded analysis). Not the bug.

- **Mock-mode silent no-op** — checked `runHeroAnalysis` and
  `runTechnicalAnalysis`. When `ANTHROPIC_API_KEY` or
  `OPENAI_API_KEY` is absent they return mock data. The audit
  completes with `status='ready'` populated by mock content. Mock
  mode does NOT leave audits at `pending`. Not the bug.

- **Vercel maxDuration timeout on the generate route** — vercel.json
  sets `maxDuration: 300, memory: 1024` for the generate route. A
  full Claude + GPT pass typically completes in 30-90 seconds on a
  small business homepage. Even a worst-case 200-second run is well
  inside the 300s budget. If the route DID time out, the inner
  `runAudit` try/catch would have caught the partial state — but the
  catch flips the row to `failed`, not leaves it `pending`. The
  symptom (`pending` not `failed`) rules this out.

- **Generate route auth rejection (401)** — submit and status both
  send `Bearer ${CRON_SECRET || "dev"}`. Generate route checks
  `if (cronSecret && auth !== Bearer ${cronSecret})` and falls
  through to `if (auth !== "Bearer dev")`. If `CRON_SECRET` is set
  on Vercel, both sides use the same value, no mismatch. If
  `CRON_SECRET` is unset, both fall through to "Bearer dev", which
  the generate route accepts. No auth-mismatch path produces a
  silently-pending row — a 401 from generate would be returned to
  the kick caller as a non-2xx, but in the original `void fetch`
  pattern that response was abandoned anyway, so it'd look identical
  to the network-cancelled case. The new fix's `kick_failed_http_401`
  stamp would surface this for future debugging.

- **Rate-limit short-circuit before row creation** — checked: the
  rate limiter returns 429 BEFORE the supabase upsert runs, so
  rate-limited submissions do not produce a stuck row at all.
  Different failure mode entirely (user sees a 429, no row exists).
  Not the bug.

- **Supabase upsert returning the wrong row ID** — possible but
  unrelated. The submit code re-fetches the row by
  `(prospect_id, target_url)` after the upsert specifically because
  the upsert may have returned an existing row. This is the
  mechanism by which the same audit UUID gets re-used across
  resubmissions of the same URL — which explains the
  `0f82f25c-...` ID showing up "again" rather than being a fresh
  failure. The mechanism is intentional (idempotent submit), not a
  bug.

- **Vercel Deployment Protection blocking server-to-self fetches**
  — submit's comment block flags this as a previously-fixed bug
  (using `process.env.VERCEL_URL` got 401-redirected to Vercel SSO).
  The fix was to hardcode `https://bluejayportfolio.com`, which IS
  publicly reachable and not gated by deployment protection. Verified
  the hardcode is in place. Not the bug.

- **Followup-cron mis-stamping** — checked: the followup cron only
  reads `ready` audits and only sends emails 2-5. It can't strand a
  `pending` row. Tangential issue noticed: the generate route does
  NOT explicitly stamp `audit_email_step=1` after sending email #1,
  so the followup cron's `step ?? 1` default kicks in. Works in
  practice (email #1 was sent at email_sent_at, step defaults to 1,
  cron sends email #2 at Day 1+). Not the bug, but worth a follow-up
  cleanup commit.

- **Next.js 16 dynamic route param API drift** — checked: both
  submit and generate routes correctly use
  `{ params: Promise<{ id: string }> }` and `await params`. Next 16
  param-as-Promise contract is honored. Not the bug.

## What data would let us confirm the fix

After deploy, watch:

1. **Vercel function logs** for `/api/audit/submit` invocations.
   Pre-fix: log line `[audit/submit] kick-off failed (will need
   manual retry):` would never appear (the catch was abandoned with
   the Promise). Post-fix: any kick failure now logs to
   `[audit/submit] kick HTTP NNN ...` or `[audit/submit] kick threw
   for audit ...` and stamps `failed_reason` on the row.

2. **`site_audits` rows** at `status='pending'` past 5 minutes — the
   count should drop to ~0 (or to a visible `failed` state with a
   meaningful `failed_reason` for the post-fix failure modes).

3. **`failed_reason` distribution** on newly-failed audits — pre-fix
   it was always NULL (route never ran). Post-fix, expect a mix of
   `runAudit` errors (Anthropic/OpenAI rate limits, fetch failures)
   and the new `kick_failed_http_*` / `kick_threw:*` stamps.

4. **Watchdog SMS volume** — the daily watchdog stuck-audit alert
   should drop to near-zero because most stuck-pending cases now
   self-heal.
