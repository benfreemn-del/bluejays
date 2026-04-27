# CLAUDE.md Drift Audit — 2026-04-26 (C)

Total file size: 5,792 lines.
File audited: `C:\Users\BenFr\OneDrive\Desktop\Bluejay Business\bluejays\CLAUDE.md`.

---

## 🔴 Wrong / contradictory (could mislead future agents into bugs)

- **CLAUDE.md:97-98** — claims footer rule "Built by BlueJays — get your free site audit" is fully rolled out — actual state: `src/components/Footer.tsx:103` still ships `Created by bluejayportfolio.com`. CLAUDE.md says "(3 spots were updated in commit b7c1548 — verify nothing was missed)" — this is the missed spot. — suggest: **fix Footer.tsx**, then keep rule as-is.

- **CLAUDE.md:331-338** — "Every V2 preview template MUST render the BluejayLogo component in the footer". State of code: I verified all 46 V2 preview templates DO contain the BluejayLogo + "Built by BlueJays" string. So this rule is currently honored. (Just calling it out as verified — not a defect.) Suggest: keep.

- **CLAUDE.md:273** — "Current highest templates by category" lists 26 V2 categories and says "Remaining V1 only: general-contractor, catering, pet-services, physical-therapy, tutoring." — actual state: ALL 46 categories now have V2 preview templates AND V2 showcase pages (verified `ls src/components/templates/V2*Preview.tsx` = 46, `ls src/app/v2/` = 46). general-contractor, catering, pet-services, physical-therapy, tutoring ALL have V2. — suggest: **delete the "Remaining V1 only" sentence and replace the whole list with "ALL 46 categories now V2 (see `src/lib/scout.ts::ACTIVE_CATEGORIES` for canonical list)".**

- **CLAUDE.md:1309** — "all 30 categories have V1, 11 have V2" — actual state: 46 V2 templates exist; the V1 generic templates list also has 31 entries (`src/components/templates/{Accounting,AutoRepair,…}Template.tsx`). Numbers 30/11 are stale by ~3-4x. — suggest: **rewrite to reference `ACTIVE_CATEGORIES` from `src/lib/scout.ts` rather than hard-coded counts.**

- **CLAUDE.md:1311** — "Categories with FULL V2 pipeline … ALL 41 categories have V2" with 41-item list — actual state: 46 categories have V2 (the list is missing `med-spa`, `appliance-repair`, `junk-removal`, `carpet-cleaning`, `event-planning`). — suggest: **update list to all 46 from `ACTIVE_CATEGORIES`, or stop hard-coding the list.**

- **CLAUDE.md:1347** — "## Active Template Categories (41 total)" with 41-item list — actual state: 46 in `ACTIVE_CATEGORIES`. Same 5 missing categories as line 1311. — suggest: **delete this section and link to `src/lib/scout.ts` as source of truth.**

- **CLAUDE.md:404, 1523, 2120** — multiple mentions of "46 categories" / "all 46 categories" — actual state: 46 IS correct in code. Just inconsistent with the 30/41 numbers above. — suggest: **standardize on 46.**

- **CLAUDE.md:1327** — "FROM_EMAIL must be hardcoded… Hardcoded to `bluejaycontactme@gmail.com` in email-sender.ts" — actual state: `src/lib/email-sender.ts:30` hardcodes `email: "ben@bluejayportfolio.com"` (the SENDERS map's `bluejayportfolio.com` row). `bluejaycontactme@gmail.com` is now only used as `replyTo` for the secondary `bluejaywebs.com` domain (line 37). — suggest: **update to "Hardcoded to `ben@bluejayportfolio.com` (primary) + `ben@bluejaywebs.com` (secondary), with `replyTo: bluejaycontactme@gmail.com` on the secondary."**

- **CLAUDE.md:1888-1915 (FUNNEL_STEPS table)** — claims SMS only on Day 0 + Day 12, with "Day 5 email" / "Day 21 email" — actual code (`src/lib/funnel-manager.ts:69-84`) has SMS on Days 0, 5, 12, 21 (every email step except Day 30/45/60). Inbound-only gate makes this immaterial in practice, but the documentation is wrong. ALSO the actual array now extends to Day 45 (`graceful_goodbye`) and Day 60 (`final_seasonal_hook`) — totally undocumented in the "Funnel schedule" table. — suggest: **rewrite the table to match the current 9-step funnel and explicitly note the inbound gate at runtime.**

- **CLAUDE.md:2163** — "Vercel cron: `/api/funnel/run` daily at 08:00 UTC" — actual state: `vercel.json:5` shows `0 16 * * *` (16:00 UTC). CLAUDE.md Rule 30 (line 3399) correctly states 16:00 UTC. The 08:00 UTC mention contradicts itself. — suggest: **change 2163 to 16:00 UTC.**

- **CLAUDE.md:5532-5538 (Rule 60)** — references constants `MIN_READY_AUDITS_TO_WAKE = 100` and `MIN_PAID_CUSTOMERS_TO_WAKE = 5` "at top of file" — actual state: the constants in `src/app/api/hyperloop/run/route.ts:56-57` are named `FALLBACK_MIN_AUDITS = 100` and `FALLBACK_MIN_PAID = 5`. The runtime values are read from a `hyperloop_config` table; constants are only fallbacks. — suggest: **rename references to `FALLBACK_MIN_AUDITS` / `FALLBACK_MIN_PAID` and explain that live values come from `hyperloop_config`.**

- **CLAUDE.md:5751-5790 (Rule 66 watchdog)** — says "Reference (in progress): the watchdog pattern hasn't been built yet … Adding the watchdog itself is a follow-up task" — actual state: `src/app/api/watchdog/run/route.ts` exists, contains `WATCHED_CRONS` array, calls `runAllHealthChecks()`, and is wired in `vercel.json:68-70` as `0 13 * * *`. The watchdog IS built. — suggest: **rewrite the "in progress" paragraph to describe the existing implementation; remove the TODO.**

- **CLAUDE.md:46, 49, 97, 1488** — state "footer credit always says 'Built by BlueJays' / 'Never use BlueJay Business Solutions or any other footer variation'" — actual state: `BlueJay Business Solutions` literal string appears in `src/app/get-started/page.tsx:269` and `src/components/preview/TextMeBackWidget.tsx:23` (TCPA consent copy). It also appears in CLAUDE.md:2496-2498 as the prescribed HELP-reply for A2P 10DLC. The contradiction: the legal/TCR copy depends on a wording that the brand rules ban. — suggest: **add an explicit carve-out in the "footer rule" sentence: "applies to footer/credit text only — TCPA consent copy uses the legal entity name 'BlueJay Business Solutions' as required by TCR."**

- **CLAUDE.md:2334** — "[x] **Stripe LIVE flip — DONE 2026-04-25**" but BLOCK 1 below still shows `[ ]` for `BEN_PHONE` env var, the email-patch script, SendGrid setup, etc. — these BLOCK 1 items were marked as "MUST DO BEFORE FIRST EMAIL GOES OUT" but emails have been going out for weeks (per Stripe LIVE entry). Either emails went out without these or these items have been silently completed. — suggest: **scan + close these checkboxes, or move to a "completed" archive section.**

- **CLAUDE.md:2310-2316 (BLOCK 1, "Run the email patch script")** — Tells Ben to run a one-off backfill script. The script (`scripts/patch-prospect-emails.ts`) exists but its purpose is to add emails to "8 prospects" and move "Meyer Electric back to generated". This is a one-shot task; it's been months. — suggest: **delete from CLAUDE.md TODO list. Optionally move script to `scripts/_archive/` or delete altogether.**

- **CLAUDE.md:2356-2357 (BLOCK 2)** — "Text or call Steadfast Plumbing: (360) 797-2979" / "Text or call Sequim Valley Electric: (360) 681-3330" — these are individual prospect handoffs that don't belong in a system-of-record. — suggest: **delete from CLAUDE.md (move to a private todo).**

- **CLAUDE.md:5169-5223 (Rule 51)** — placed AFTER Rule 55 in line order. Rule numbering is wildly out of order: 30, 31, 32, 33, 35, 36, 37, 34, 38, 40, 41, 42, 46-50, 52-55, 51, 56-66. — suggest: **renumber chronologically OR introduce a sub-heading "Numbered for back-reference; see commit history for chronology."**

---

## 🟡 Stale (refers to things that no longer exist)

- **CLAUDE.md:411-413 (Auto-Scout Files)** — lists `src/lib/auto-scout.ts`, `src/app/api/auto-scout/route.ts`, `src/app/api/auto-scout/config/route.ts`. The first two exist; need to verify the third. (`/api/auto-scout/config/route.ts` not found in current ls of `src/app/api/auto-scout/` — only `/api/auto-scout/route.ts` exists.) — suggest: **drop the config sub-route line OR add the file.**

- **CLAUDE.md:1283-1289 (CRITICAL BUILD NOTE — color variable names)** — Lists "Real Estate: GOLD" but check `V2RealEstatePreview.tsx` actually uses `GOLD`. The list also mixes V2 templates and showcases without distinction (showcases are at `src/app/v2/[category]/page.tsx`, previews are at `src/components/templates/V2[Category]Preview.tsx`, and they have DIFFERENT color variables). — suggest: **clarify which variable names belong to showcase vs preview file, since both share the same template name.**

- **CLAUDE.md:2128-2133 (Video Generation Status)** — claims video gen "does not work on Vercel's Hobby/Pro serverless functions" because `@sparticuz/chromium` exceeds bundle size. Says "Auto-generation is wired into `enrollInFunnel()` and will fire silently on every enrollment, but currently always fails". Then 2543-2606 says Browserless was provisioned + `BROWSERLESS_API_KEY` detected → `launchCaptureBrowser()` uses it. The 2128 paragraph is stale relative to 2543. — suggest: **delete the older 2128-2133 paragraph; 2543+ has the current truth.**

- **CLAUDE.md:2148** — "Current count: 0 errors. If you see tsc errors after editing, fix them immediately." — Ben should re-verify; not auditable from this report. — suggest: re-run `pnpm tsc --noEmit` and update count.

- **CLAUDE.md:2300-2435 (BEN'S HOME TODO LIST + BLOCKS 1-4)** — Contains ~30 checklist items, the only one marked done is Stripe LIVE. Many are stale:
  - L2310-L2316: email patch script (one-off, months old)
  - L2318-L2326: SendGrid domain auth (must already be done — emails are sending; L2107 confirms `bluejayportfolio.com` is "domain authenticated")
  - L2327-L2330: SendGrid Event Webhook (likely done)
  - L2336-L2337: Namecheap live + Lob live flip (mentioned as still pending)
  - L2344-L2358: BLOCK 2 credibility tasks (Google Business Profile, About Ben section, Steadfast Plumbing, Sequim Valley Electric) — pre-launch tasks
  - L2363-L2425: BLOCK 3 — most items reference SQL tables that should already be created (client_reviews, client_feature_configs, contact_form_submissions, schedule_bookings)
  - L2429-L2437: BLOCK 4 — long-tail futures
  — suggest: **archive done items, keep only ones Ben actually wants visible to future agents. Or move BEN'S HOME TODO LIST to a separate file outside CLAUDE.md.**

- **CLAUDE.md:2543-2592 (Personalized video walkthrough)** — Status says "PARKED 2026-04-20 — post-launch", with detailed OOM-debug notes. Today's date is 2026-04-26. Either the OOM is still parked or something happened — is this current? — suggest: **add a 2026-04-26 status line confirming still parked (or remove if shipped).**

- **CLAUDE.md:2308 (`BEN_PHONE` env var)** — "Add `BEN_PHONE` env var on Vercel: `BEN_PHONE=(253) 886-3753`" appears TWICE (line 2307-2308 and 2363). — suggest: **dedupe.**

- **CLAUDE.md:2697-3169 (Locked-In Rules — Session 2026-04-23)** — these are session-specific bug-class fixes from a single day. Rule numbers 1-25. They're useful as "war stories" but contribute most of the 5,000-line bloat. The lessons are real but the SESSION DATE label keeps growing. Future agents read them as "permanent rules", not "session learnings". — suggest: **keep the rule content but strip the date headers (just "Image-mapper save preserves pool extras" not "Locked-In Rule 12 of session 2026-04-23"). Or split into a separate `LESSONS.md`.**

- **CLAUDE.md:3318-3601 (Session 2026-04-24 evening)** — same pattern as above; Rules 26-38 are session-tagged. — suggest: **same fix.**

- **CLAUDE.md:5353+ (Session 2026-04-26 evening, Rules 56-62)** — These are recent so they're load-bearing right now. Suggest: **keep but plan to age out.**

- **CLAUDE.md:5637-5790 (Session 2026-04-27, Rules 63-66)** — DATE IS IN THE FUTURE (today is 2026-04-26). Either a typo or the file was edited from a session in a different timezone. — suggest: **fix the section header date.**

- **CLAUDE.md:4592 ("`/templates` footer link was a 404 for months")** — `/src/app/templates/` directory exists with 31 entries (one per V1 category). Bug claim is stale, fix is in. — suggest: **delete from "Image Context Rules" since it's not load-bearing anymore (or move to a "fixed" log).**

- **CLAUDE.md:1311 + 1347 + 1349-1351 ("Gallery-Heavy Categories")** — list 8 categories: tattoo, photography, interior-design, florist, landscaping, salon, catering, pet-services. CLAUDE.md:162-163 lists the same 8. Both lists are consistent so no defect there. (Verified, not stale.)

- **CLAUDE.md:1338-1339 (Auth)** — "Password: set via ADMIN_PASSWORD env var (default: bluejay2026)" — defaults shouldn't be documented in CLAUDE.md (security smell). — suggest: **drop the default value mention.**

- **CLAUDE.md:1112-1141 (Before/After Image Rules)** — lists local /public/images/ files. All 9 file references verified to exist (dental-before-after.png, roofing-before-after.jpg, vet-before-after.png, carpet-before-after.png, interior-design-before-after.jpg, landscaping-before-after.png, medspa-before-after-{1,2,3}.png). Verified not stale. — suggest: keep.

- **CLAUDE.md:1140 ("Categories that SHOULD have before/after")** — Lists pressure-washing as one of them. Verified `V2PressureWashingPreview.tsx` exists. (Not stale.)

---

## 🟢 Cleanup candidates (low value, take up space)

- **CLAUDE.md:8-41 (AI Cost Optimization Rules)** — 34 lines of "use cheaper models, prompt caching, batch API". Useful but very verbose; could be 10 lines. — suggest: **compress to a 6-bullet summary; link to a separate doc for examples.**

- **CLAUDE.md:55-87 (Premium Preview Overhaul Rules)** — Repeats "Quality Rules" section above. Several rules duplicated 2-3 times (e.g., "extract brand colors from website" is in both Quality Rules and Premium Preview Overhaul). — suggest: **dedupe.**

- **CLAUDE.md:225-231 (Customization Rules)** — heavy overlap with "Premium Preview Overhaul Rules" (55-87). Same point about brand colors, photos, real services made 3 times. — suggest: **merge.**

- **CLAUDE.md:482-1230 (Mandatory Premium Features Per V2 Template + Beast Mode Showcase Registry + Hero Layout Registry + Testimonial Layout Registry + Typography Pairing Guide)** — ~750 lines of "marketing memory" about each individual showcase. Useful for understanding what's been built but mostly NOT load-bearing for future code agents. Each showcase entry is described in 8-10 lines. — suggest: **move to a separate `SHOWCASE_INVENTORY.md` or similar; CLAUDE.md keeps only the principles (Hero/Testimonial registries flag "ALL 31 NOW USED — invent new ones for future" which IS load-bearing).**

- **CLAUDE.md:608-645 (DENTAL/ROOFING/VETERINARY/MOVING/PEST CONTROL feature lists)** — 35 lines of "category X has features 1-10". Same as above; future code agents don't need to read this every time. — suggest: **move out.**

- **CLAUDE.md:1180-1227 (Typography Pairing Guide table)** — 47 rows mapping category → font pair. Load-bearing for site generation, but the rationale column ("Warm serif says we care") could be trimmed. — suggest: **keep table, drop rationale column.**

- **CLAUDE.md:4385-4513 (North Star: 5,000 Paying Sites — failure-is-not-an-option plan)** — 130 lines of business strategy (ARR projections, hiring plans, channel mix, milestones). Aspirational + motivational, not load-bearing for code. — suggest: **move to a `BUSINESS_PLAN.md`.**

- **CLAUDE.md:4515-4527 (Rule 46)** — "Failure-Is-Not-An-Option Decision Framework" is one-paragraph philosophy. — suggest: **fold into the North Star section if kept, otherwise drop.**

- **CLAUDE.md:5224-5350 (Mobile / Phone Session Rules)** — 125 lines about chunked Python writes when Ben is on his phone. Highly specific edge-case. Most agents won't hit this. — suggest: **move to a separate `PHONE_SESSION.md`.**

- **CLAUDE.md:1036-1085 (Lessons Learned — Speed & Quality Checklist)** — 50 lines of build tips. — suggest: **compress to a 10-bullet checklist.**

- **CLAUDE.md:340-396 (Sales & Outreach Rules)** — useful but contains dated language ("Other [category] businesses in your area have already upgraded this month"). — suggest: keep but spot-check that the suggested phrases align with current email/SMS templates.

- **CLAUDE.md:108 (`@AGENTS.md` reference at top)** — AGENTS.md is included as a system reminder. Confirmed exists. — keep.

---

## Verified accurate (spot-checked, no defect)

- **CLAUDE.md:411-413 (auto-scout files)** — `src/lib/auto-scout.ts`, `src/app/api/auto-scout/route.ts` exist. Confirmed.
- **CLAUDE.md:415 ("100 leads/day default")** — verified: `src/lib/auto-scout.ts:79` `dailyLimit: 100`.
- **CLAUDE.md:2109 ("10/day → 100/day over 14 days")** — verified: `src/lib/domain-warming.ts:52-53` `currentDailyLimit: 10, maxDailyLimit: 100`.
- **CLAUDE.md:128 (`pickFromPool`/`pickGallery`/`getPreviewImages` from stock-image-picker)** — verified all 3 export from `src/lib/stock-image-picker.ts:95, 101, 197`.
- **CLAUDE.md:1718, 1762 (`EFFORT_PHRASES`, `getPitchEmail()`, `getFollowUpSms*` etc)** — verified all symbols exist in `src/lib/email-templates.ts` and `src/lib/sms.ts`.
- **CLAUDE.md:1530, 1568, 1604 (`CATEGORY_VOICE`, `getCategoryVoice`, `isGenericTagline`, `isGenericAbout`, `GENERIC_TAGLINE_PATTERNS`, `GENERIC_ABOUT_PATTERNS`)** — verified all in `src/lib/content-brief.ts`.
- **CLAUDE.md:5494 (`recoveryProjection`, `estimateMoneyLeak`, `RECOVERY_CAP_PERCENT`, `DEFAULT_CLOSE_RATE` in site-audit.ts)** — verified all in `src/lib/site-audit.ts`.
- **CLAUDE.md:264 (`runAllHealthChecks`, `WATCHED_CRONS`)** — verified: `src/lib/health-checks.ts:264` exports `runAllHealthChecks`; `src/app/api/watchdog/run/route.ts:57` declares `WATCHED_CRONS`.
- **CLAUDE.md:4286, 4360 (`LOSS_PROBE_PHRASINGS`)** — verified at `src/lib/ai-responder.ts:193`.
- **CLAUDE.md:3567 (`HIGH_INTENT_BYPASS`)** — verified at `src/lib/delayed-replies.ts:22`.
- **Env vars STRIPE_LIVE_ENABLED, AI_AUTO_REPLY_ENABLED, ENABLE_HTML_PITCH_EMAIL, BROWSERLESS_API_KEY, LOB_API_KEY, NAMECHEAP_API_KEY, VERCEL_API_TOKEN** — all referenced in `src/app/api/admin/env-check/route.ts:37-58` AND used in actual code paths. Live.
- **CLAUDE.md:4528-4541 (Rule 47 auto-enroll cron)** — verified. `src/app/api/funnel/run/route.ts:32-100` does the auto-enroll Step 0 exactly as Rule 47 promises, including the Rule 49 `manually_managed = false` filter.
- **CLAUDE.md:4598-4648 (Rule 49 manually_managed)** — verified column added in `supabase/migrations/20260425_manually_managed.sql`; type added in `src/lib/types.ts`; filter present in funnel/run.
- **CLAUDE.md:4707-4752 (Rule 52 STRIPE_LIVE_ENABLED kill-switch)** — verified used in `src/app/api/checkout/create/route.ts` and `src/app/api/checkout/upsell/route.ts`.
- **CLAUDE.md:5125-5167 (Rule 55 `price_*` IDs)** — verified `src/app/api/admin/env-check/route.ts` reports `stripePricePrefixes`.
- **CLAUDE.md:331-338 (BluejayLogo in V2 footer)** — verified across all 46 V2 preview templates (grep shows BluejayLogo + "Built by BlueJays" in each).
- **CLAUDE.md:2098-2101 (wave-2 LTV crons in vercel.json)** — verified: `check-upcoming-renewals` at 16:00, `retry-failed-sends` at 17:00, `check-domain-renewals` at 18:00.
- **CLAUDE.md:2117-2123 (Image Audit Tool)** — verified: `src/app/image-mapper/[id]/page.tsx` AND `src/lib/image-mapper-library.ts` both reference `THEME_LIBRARY` (5 vs 2 occurrences respectively, so duplication-in-sync claim is accurate but worth noting).
- **CLAUDE.md:3284 ("Hand-rolled 30/min throttle (2-second sleep)")** — verified: `src/app/api/billing/check-domain-renewals/route.ts:72` `THROTTLE_MS = 2000`.
- **CLAUDE.md:413-415 (auto-scout cost ~$2/day at 100 leads)** — not verified, but plausible.
- **CLAUDE.md:474-480 (V2_RENDERERS map at `src/app/preview/[id]/page.tsx`)** — claim is **WRONG**: V2_RENDERERS is actually defined in `src/components/preview/PreviewContent.tsx:64`, not in the page. Suggest: **fix the file path.**
- **CLAUDE.md:2207 ("Powered by bluejayportfolio.com" in review page footer)** — verified: `src/app/review/[id]/ReviewClient.tsx:187`.
- **CLAUDE.md:2261 (`/api/contact-form/[id]`)** — verified directory `src/app/api/contact-form/[id]/` exists.
- **CLAUDE.md:5616 (`/api/audit/postcard-cron`)** — verified file + cron schedule (`vercel.json:60-62` `0 19 * * *`).

---

## Top recommendations (ranked by impact)

1. **Fix Footer.tsx still saying "Created by"** — single-line code fix, high-visibility brand impact.
2. **Replace all hardcoded category-count lists** with a reference to `src/lib/scout.ts::ACTIVE_CATEGORIES`. Stops drift permanently.
3. **Reconcile FUNNEL_STEPS table at line 1888** with the actual 9-step array (current code has Days 0/2/5/12/18/21/30/45/60).
4. **Fix file path for V2_RENDERERS** (line 474 → `src/components/preview/PreviewContent.tsx`).
5. **Remove or migrate BEN'S HOME TODO LIST** (lines 2300-2437). Either close completed items or move to a separate file. It's been the biggest source of drift.
6. **Fix the watchdog "in-progress" note** in Rule 66 — watchdog is built and live.
7. **Consider extracting `SHOWCASE_INVENTORY.md`, `BUSINESS_PLAN.md`, `PHONE_SESSION.md`** — would shrink CLAUDE.md by ~1,500 lines (≈26%).
8. **Standardize date headers** in "Locked-In Rules — Session 2026-04-XX" — Rule 63-66 are dated 2026-04-27 (one day in the future).
9. **Renumber Rule 51** so it sits between 50 and 52.
10. **Update line 1327's `bluejaycontactme@gmail.com` claim** — From-email is now `ben@bluejayportfolio.com`.
