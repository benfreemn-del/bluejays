# Adversarial Review — 2026-04-26 (A)

## 🔴 Critical (could lose money / data / customers)

- **Watchdog only watches 3 of 17 crons (Rule 66 systemic gap)** — `src/app/api/watchdog/run/route.ts:57-89` lists `hyperloop`, `audit_submissions`, `email_retry_queue`. `vercel.json:1-71` ships **17 crons**. Silent failures in `funnel/run`, `replies/process`, `onboarding-reminders`, `digest`, `referral/send`, `reports/monthly`, `auto-scout`, all 3 `billing/*` crons, `nps/send`, `test-cohort/postcard-cron`, `review-blast/dispatch`, `audit/followup-cron`, `audit/postcard-cron` — none of these can ever fire a heartbeat alert. This violates Rule 66 ("EVERY cron must have a heartbeat alert path") for 14 production crons. Fix: add `WatchedCron` rows for each (most don't even have a runs table — need to add heartbeat tables OR pivot to scanning their work-output tables like `emails`, `cost_logs`, `prospect_status_changes`).

- **Stuck-audit detector only sees first ~1000 rows; PostgREST default cap not set** — `src/app/api/watchdog/run/route.ts:197-201`. The `.in("status", ["pending","generating"]).lt("created_at", stuckCutoff)` query has no `.range()` pagination. Per Rule 2 in CLAUDE.md, Supabase silently caps at 1000 rows. Currently fine (audit volume is tiny) but at 5K-site scale this misses stuck audits beyond the cap. Fix: add `.limit(1000)` explicitly to make the cap visible OR paginate. Defensive fix is one line.

- **`/api/status/health` is publicly readable AND triggers a paid Anthropic call per request** — `src/app/api/status/health/route.ts:26-29` has no auth gate, no rate limiting. The endpoint is NOT in `PUBLIC_API_PATHS` in `src/middleware.ts:102-145` so middleware will protect it... **WAIT** — actually `/api/status/` is also not in `PROTECTED_PATHS` so it falls through `middleware.ts:157` (`if (!isProtected) return NextResponse.next()`). Need to verify by reading PROTECTED_PATHS, but the file comment at line 17-21 explicitly says "Public to GET". Each call burns ~$0.00003 Anthropic + the various other vendor pings. An attacker hitting it 100K times/day = ~$3/day Anthropic + Stripe/SendGrid/OpenAI/Twilio/Lob/Namecheap/Meta/Google rate-limit consumption. Fix: rate-limit per IP (10/hour) AND/OR require Bearer CRON_SECRET like the watchdog. The dashboard can still call it via the same auth as the rest of the dashboard.

- **`request-preview` POST allows status downgrade from any state to `audit_preview_requested`** — `src/app/api/audit/[id]/request-preview/route.ts:97-104`. The route does NOT check `prospect.status` before flipping. A paid customer with a known audit ID could be downgraded back to `audit_preview_requested`, breaking funnel state. Their `manually_managed` flag also gets set true. The idempotency check at line 78 only catches *re-requests* (already requested). Fix: refuse the update if `prospect.status IN ('paid','dismissed','unsubscribed','bounced','contacted','approved')`.

## 🟡 Important (real risk but not on fire)

- **Hyperloop AI prompt override path can persist mock variant IDs into LIVE audits** — `src/lib/site-audit.ts:511-554` (`loadAuditPromptOverride`) reads `hyperloop_variants` rows with `kind='audit_prompt'` and uses their `content.systemPrompt` verbatim. Per Rule 64, mock-mode `hyperloop_variants` rows could land here too, but unlike ad IDs there's no `mock_` prefix sentinel on prompt content. A bad/jailbreak-prone prompt landing in this table (manually inserted, AI-generated, etc.) silently replaces the locked Hormozi prompt for every audit in that category. The `audit_prompt_variant_id` is stamped but no validation runs on the prompt itself. Fix: add a minimum-shape sanity check (must contain "Return STRICT JSON ONLY" or specific banned-words enforcement) before activating.

- **`fetchSiteContext` 10-second timeout per audit; no per-IP submission cap visible** — `src/lib/site-audit.ts:308`. The audit endpoint can be called repeatedly with ad-hoc target URLs, each burning Claude + GPT tokens (~$0.01-0.03/audit). Can't see audit/submit rate-limit from this review but `cta-click` route at `src/app/api/audit/[id]/cta-click/route.ts:30` only rate-limits clicks, not submissions. **[speculation]** A bad actor could submit 10K audits in an hour and burn ~$300 of API credit before anyone notices. Fix: confirm the audit/submit endpoint has IP-level rate limiting (not in this review's scope but worth checking).

- **Hyperloop `loadAuditPromptOverride` swallows ALL errors silently** — `src/lib/site-audit.ts:548-552`. If the Supabase call fails (RLS misconfig, table missing, network blip), the function `console.warn`s and returns null, meaning the audit silently uses the hardcoded prompt. That's safe behavior, but if Hyperloop is supposed to be live and Ben thinks the override is loading, he'll never know it's not. Recommend: log to `cost_logs` or `prospect_status_changes` so visibility exists when override loading fails consistently.

- **`runAllHealthChecks` runs unconditionally on every watchdog tick AND every dashboard view** — `src/app/api/watchdog/run/route.ts:216` (cron, daily) plus `src/app/api/status/health/route.ts:27` (any GET). Vendor pings cost ~$0.00003 (Anthropic) + token use against rate limits for OpenAI/Stripe/SendGrid/etc. Daily watchdog × 30 days = pennies. But if anyone wires the health check into a frequently-polled UI (dashboard tile that refreshes every 30 seconds), this scales linearly. Fix: cache the result for ≥60 seconds in a singleton or DB row.

- **`hyperloop` heartbeat threshold is 8 days; cron runs weekly Mondays** — `src/app/api/watchdog/run/route.ts:65` says `thresholdHours: 24*8`. If the cron runs Monday and is silent the next Monday, alert fires after 8 days = roughly Tue evening. That's only ~1 day late. But if the cron is dormant (most ticks), it still inserts a `dormant` row — so the threshold check passes even when the cron is logically broken (e.g., the dormancy check itself is buggy). Detection is degraded by the dormant-heartbeat shape. Fix: filter `WHERE status != 'dormant'` for the staleness check, OR add a separate "active runs" row.

- **CTA click endpoint logs to `cta_clicks` with no UPSERT — duplicate clicks pollute analytics** — `src/app/api/audit/[id]/cta-click/route.ts:69-78`. Ben's `funnel-conversion/stats` endpoint at `src/app/api/funnel-conversion/stats/route.ts:113-119` deduplicates by `prospect_id` to a Set, so the conversion-rate math is OK. But the `clicks` field at line 124 (`(clicks || []).filter((c) => c.fork === fork).length`) counts every duplicate. A prospect double-clicking the buy button shows 2 clicks. Doesn't break decisions, but inflates "clicks" metric. Fix: dedup by (prospect_id, fork, hour-bucket) at insert time.

- **Health check Anthropic ping uses Sonnet-tier billing not Haiku** — `src/lib/health-checks.ts:134` uses `claude-haiku-4-5-20251001` (correct, cheap). Verified — this is the cheapest.

- **`health-checks.ts` Stripe + SendGrid + OpenAI 200-on-404 risk is non-existent** — every check uses `if (!res.ok) throw` which guards against 200-on-404. ✓ verified.

- **Namecheap check uses XML body inspection for `Status="ERROR"`** — `src/lib/health-checks.ts:225`. Good defense-in-depth (HTTP 200 with API-level error). ✓

- **Lob check uses `/v1/postcards?limit=1` which IS a real read; no risk of accidentally CREATING postcards** — `src/lib/health-checks.ts:195`. ✓

- **Hyperloop weekly cost-cap math reads from `hyperloop_runs.ai_cost_usd`** — `src/app/api/hyperloop/run/route.ts:341-349` only counts AI generation cost. Per Rule 63, the EXPENSIVE thing is platform-side ad spend (Meta + Google). The $50/wk cap protects Anthropic credits but **Meta + Google daily budgets are NOT capped through Hyperloop**. Rule 63 explicitly calls this out: "the cheap input was capped; the expensive output wasn't." Looks like Stage-2 Hyperloop relies on the implicit platform-side daily budget caps Ben configures in the Meta/Google ad accounts, not a Hyperloop-managed weekly cap. **[speculation]** If Ben hasn't tightened the Meta + Google daily budgets manually, the rule's whole point is unenforced. Confirm by checking Meta/Google account daily budgets directly.

- **Audit prompt template interpolation has no escape for `{...}` literals in source HTML** — `src/lib/site-audit.ts:638-656`. If a target site's `<title>` or H1 contains a literal string like `{businessName}` or `{url}`, the regex at line 653 will replace it. Edge case but could produce confusing audit copy. Low priority.

- **`auto-scout` cron at `0 14 * * *` UTC = 6am PT** — `vercel.json:29`. Per Rule 30, **outbound** crons must fire 15:00-19:00 UTC. Auto-scout is *internal* (data fetching, no outbound to prospects), so this is fine. ✓

## 🟢 Nice-to-have / debt

- **Watchdog `WATCHED_CRONS` interface design has dead code path** — `src/app/api/watchdog/run/route.ts:42-43` defines `where: { col, eq }` but no entry uses it. Either add a watched cron that needs filtering or remove the field for clarity.

- **`runAllHealthChecks` returns 5-second-timeout-per-vendor max — `Promise.all` waits for slowest** — `src/lib/health-checks.ts:271-282`. Worst case is 5s if any vendor is slow. With 10 vendors and `maxDuration: 60` on the route, that's plenty of headroom but fast-path dashboards see latency proportional to slowest vendor. Consider a "fast" version that times out at 2s for dashboard polling, keeping the full 5s version for the watchdog.

- **`audit/[id]/cta-click` uses `navigator.sendBeacon` with JSON Blob — content-type might be ignored** — `src/app/audit/[id]/AuditCTAHub.tsx:46-49`. Some browsers treat sendBeacon Blob bodies as `text/plain` regardless of the Blob's type. If an issue surfaces it'd manifest as 400 Bad Request from the route. Currently the route's `try { body = await req.json() }` falls back to `{}` and rejects with 400 on the fork validation. **[speculation]** Worth checking real-world delivery by running a short tail of `cta_clicks` after a few real-prospect audits.

- **`PUBLIC_API_PATHS` allows `/api/audit/` (broad prefix) but cta-click + request-preview both nest under it** — `src/middleware.ts:139`. Fine today (everything under /api/audit/ should be public), but a future protected admin-audit endpoint would need to live elsewhere or the prefix tightened.

- **`audit/postcard-cron` at `0 19 * * *` is the latest outbound cron of the day** — `vercel.json:62`. 19:00 UTC = 11am PT — still inside the Rule 30 window. ✓

- **Stuck-audit IDs in alert message are first-8-chars only** — `src/app/api/watchdog/run/route.ts:205`. Useful for SMS char limits but Ben needs the full UUID to check the row in Supabase. Consider including a clickable dashboard URL (`https://bluejayportfolio.com/admin/audits/stuck`) instead.

- **Vendor health check log row in `watchdog_runs.metadata.vendorChecks` could be huge** — `src/app/api/watchdog/run/route.ts:249`. 10 vendor check objects with `detail` strings — hundreds of bytes. JSONB column so fine, but the watchdog dashboard view could become slow as `watchdog_runs` grows. Consider truncating `detail` to 200 chars.

- **`hyperloop_runs.gate_reason` for empty-adset detection isn't surfaced in watchdog summary** — Stage-2 Hyperloop fires `sendOwnerAlert` on empty adsets at `src/app/api/hyperloop/run/route.ts:546-551` but the watchdog has no way to detect that the alert failed to send (Twilio outage, env var missing). A double-belt approach would have watchdog re-check empty adsets. Current setup is fine but documented for later.

- **`STRIPE_LIVE_ENABLED` kill-switch (Rule 52) does NOT gate `/api/status/health` Stripe ping** — `src/lib/health-checks.ts:81-97`. Even when the kill-switch is OFF (incident in progress), the watchdog will keep pinging Stripe daily and reporting "ok". That's actually correct behavior — the kill-switch is for new transactions; in-flight webhooks must keep working. ✓ no change needed.

- **`scrapedData.auditPreviewRequested` is the only state-tracking flag for the preview-request fork** — `src/app/api/audit/[id]/request-preview/route.ts:78,88`. Storing this inside the JSONB `scraped_data` means it's harder to query ("who requested previews this week?") than a top-level column would be. Fine for now; refactor when funnel-conversion stats need it.

## Considered but not flagged

- **Health-check vendor calls returning HTTP 200 from a 404 page** — Every check (`stripe`, `sendgrid`, `openai`, `twilio`, `lob`, `namecheap`) inspects `res.ok` first OR (for namecheap) parses the XML for `Status="ERROR"`. Stripe `/v1/balance` returns 200 only with a valid auth header. SendGrid `/v3/user/profile` returns 401 for bad keys. OpenAI `/v1/models` returns 401 for bad keys. None of these have a known "200 on 404" failure mode. ✓ verified safe.

- **`request-preview` SMS-on-success vs. persist-on-failure ordering** — Rule 43 says persist-before-touch. Code at lines 96-126 persists the prospect update FIRST, then fires `sendOwnerAlert` fire-and-forget. ✓ rule satisfied.

- **`CRON_SECRET` is gated only when present** — `src/app/api/watchdog/run/route.ts:104-108` and similar in hyperloop. If `CRON_SECRET` is absent in env (dev), endpoints fall open. This is intentional for dev/CI per the codebase convention. Production must have the env var set, which is monitored elsewhere. ✓ as designed.

- **Hyperloop dormancy gate logs heartbeats** — Rule 60 requires this; verified at `src/app/api/hyperloop/run/route.ts:155-167`. ✓

- **`isSafeAdId()` mock-pollution guard** — `src/app/api/hyperloop/run/route.ts:75-81`. Correctly refuses to write `mock_*` IDs when LIVE platform creds are configured. ✓ Rule 64 satisfied.

- **`/api/audit/[id]/cta-click` does NOT mark the prospect manually_managed** — Buy + Schedule clicks shouldn't trigger manual-tag; only `request-preview` does. ✓ correct separation.

- **Network-effect footer / annual-renewal verbiage / bird-icon footer** — these are static copy/UI changes. Reviewed via the commit list at top; nothing dynamic to break. Skipping detailed inspection per "skip generic" guidance.

---

### Top 3 to act on before bed

1. **Add the missing 14 crons to `WATCHED_CRONS`** — Rule 66 systemic violation, biggest blast radius.
2. **Lock down `/api/status/health`** — public endpoint that triggers paid vendor calls per request.
3. **Guard `request-preview` against status downgrades** — paid customers could be flipped back to lead state.
