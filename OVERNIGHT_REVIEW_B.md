# Funnel Inconsistency Audit — 2026-04-26 (B)

## 🔴 Customer-visible (will burn trust today)

- **Voicemail script uses banned phrase "no strings attached"** — `src/lib/voicemail.ts:270` — change `"...completely free, no strings attached. It's mobile-friendly..."` to `"...completely free. It's mobile-friendly..."` (drop banned phrase per CLAUDE.md outreach rules).

- **Get-started page uses banned phrase "no strings attached"** — `src/app/get-started/page.tsx:73` — change `"completely free, no strings attached"` to `"free — your preview goes live within 48 hours"`.

- **Instagram outreach uses TWO banned phrases ("no strings attached" + "just following up")** — `src/lib/instagram-outreach.ts:116,136` and `src/lib/instagram-dm.ts:45` — replace with rule-compliant copy. Line 116: drop "no strings attached"; lines 136 / 45: replace `"just following up"` with `"circling back"` or `"wanted to make sure you saw this"`.

- **SMS fallback in funnel-manager.ts uses banned phrase "free website"** — `src/lib/funnel-manager.ts:245` — banned per CLAUDE.md "Outreach SMS Template Rules" (triggers SMS spam filters). Change `"the free website we built for ${prospect.businessName}"` to `"the site I built for ${prospect.businessName}"`.

- **Voicemail-fallback email uses banned phrase "free website preview"** — `src/lib/funnel-manager.ts:267` — change to `"the site preview we built for ${prospect.businessName}"`.

- **Welcome email contradicts canonical year-2 wording — says "Domain + hosting setup (same day as approval)" implying $997 covers it but never says "first charge year 2"** — `src/lib/email-templates.ts:408-409` — the section "3. Domain + hosting setup" mentions $997 but the welcome email body has zero mention of when the $100/yr starts. Add a line at the close: "Reminder: $100/yr maintenance starts year 2, cancel anytime — first charge is 12 months out, not now."

- **Welcome email footer is missing the canonical $100/yr disclosure** — `src/lib/email-templates.ts:386-430` — the welcome email body mentions $997 but never explains "$100/year covers domain renewal, hosting, ongoing maintenance, and support, starting year 2." This is a Rule 1 of "End-to-End Pipeline Rules" violation (every customer-facing surface must explicitly include the full disclosure).

- **`/welcome/[id]` "What's Included" list is INCONSISTENT with canonical pricing wording** — `src/app/welcome/[id]/page.tsx:127-139` — the list shows 12 items but never names a price or the $100/yr renewal cadence. Add a footer line: "Your $997 covers all of this. After year 1, $100/year covers domain renewal, hosting, ongoing maintenance, and support."

- **`/welcome/[id]` step 4 "Request Changes" links to `/edit/[id]` which is admin-protected** — `src/app/welcome/[id]/page.tsx:105` — `/edit/[id]` is in `PROTECTED_PATHS` per `middleware.ts`, so customers will hit a 401. Either swap to a `mailto:` or wire a public-safe edit-request form.

- **Claim page uses long preview URL `/preview/${prospectId}`, not short URL** — `src/app/claim/[id]/page.tsx:158` — `previewUrl: data.generatedSiteUrl || \`/preview/${prospectId}\`` violates CLAUDE.md "Short URL Rules" Rule 1 ("anywhere you see `/preview/${prospect.id}` should be using `getShortPreviewUrl()`"). The "Preview the site first" + "Re-open your preview site ↗" links both use this. Fetch and prefer `data.shortPreviewUrl` from the claim API, or compute via `deriveShortCode(prospectId)` and emit `/p/[code]`.

- **`/welcome/[id]` "View Your Website" CTA uses long preview URL** — `src/app/welcome/[id]/page.tsx:25` — same Rule 1 violation. Use the short URL.

- **`/compare/[id]` link button uses long preview URL** — `src/app/compare/[id]/page.tsx:282` — change `href={`/preview/${id}`}` → use short URL.

- **Hero homepage CTAs say "Request a Free Website" — direct conflict with banned phrase guidance** — `src/components/Hero.tsx:102, 108, 118, 351, 371` — the homepage hero, mobile nav, and mobile menu all say "Free Website". Banned per CLAUDE.md "Outreach SMS Template Rules" because it triggers spam classifiers AND undercuts the $997 narrative. Recommend "Get a Free Audit" linking to `/audit` (matches the new audit funnel — Hormozi review #10) OR "See Your Free Preview" linking to `/get-started`.

- **Audit page uses jargon "social proof"** — `src/app/audit/page.tsx:126` — Step 2 description says `"hero, copy, CTAs, social proof, mobile, SEO"`. Banned per CLAUDE.md Rule 61 (3rd-grade reading level). Change `"social proof"` to `"trust signals"`. The render-time `stripJargon()` only fixes generated audit content; this is hardcoded UI copy and bypasses it.

- **AuditCTAHub trust-strip says "No retainers, no monthly fees" defensively** — `src/app/audit/[id]/AuditCTAHub.tsx:223` — borderline banned phrase, recommend reframe. Replace with `"$997 once, $100/yr starting year 2"`. Defensive "no fees" framing is on the banned-phrases list per CLAUDE.md outreach rules.

- **`SmartSocialProof.tsx` may still ship hardcoded fake activity strings** — `src/app/claim/[id]/page.tsx:879` mounts `<SmartSocialProof>` — Rule 31 (NPS-Gated Referral & Wave 2 retention) explicitly forbids hardcoded "X hours ago" / "47 sites built" without real data. Verify the component reads real data, or remove the mount entirely. (Read the file to confirm.)

- **Voicemail follow-up script includes the word "leverage"** — `src/lib/voicemail.ts:347` — `"the website I built for you is designed to leverage that social proof"` violates Rule 61 (banned word `leverage` + jargon `social proof`). Change to: `"the site I built for you is designed to use those reviews to bring in more customers"`.

- **Audit page recovery-section language uses jargon "social proof" / "leverage" indirectly through AI output** — `src/app/audit/[id]/page.tsx` — render-time `stripJargon()` strips `"social proof"` → `"trust signals"`. Good. But it doesn't strip `optimize`, `enhance`, `leverage`, `conversion`, etc. Extend the regex list in `stripJargon()` (line 70-78) to cover the full Rule 61 banned-word list so legacy audits don't ship jargon.

- **SmartSocialProof on claim page may double-count fake events** — already flagged. Also verify `ExitIntentModal` (`/claim/[id]/page.tsx:359`) doesn't ship banned scarcity language.

## 🟡 Subtle inconsistency (low blast radius)

- **Claim page sticky-header CTA falls back to "Claim — from $349" without "100% money-back"** — `src/app/claim/[id]/page.tsx:384` — Rule 34 says naked offer-only CTAs are banned. Change to `"Claim — from $349 · 100% money-back"`.

- **Claim page "Claim — 3 × $349" subtitle missing money-back trust badge inside the button** — `src/app/claim/[id]/page.tsx:456` — already says "100% money-back · $116/mo over 3 months", which IS compliant. ✓ Leave as-is.

- **Retargeting clicker email #2 mentions both "$997 one-time" and "$100/year" but doesn't say `starting year 2`** — `src/lib/retargeting-emails.ts:177` — phrase: `"After year one, maintenance is just $100/year"`. Mostly canonical but doesn't match the `starting year 2` phrasing on the audit page (line 495) and Terms page (line 196). Pick one phrasing across surfaces. Recommend `"$100/year starting year 2"` everywhere (matches the locked Terms wording).

- **Retargeting opener email #3 lists pricing with `$997 too much` framing** — `src/lib/retargeting-emails.ts:113` — fine to mention, but the `"unfortunately"` near pricing rule should be checked. Current copy: `"$997 is too much" → I get it."` This is OK because "unfortunately" doesn't appear, but "too much" is loaded. Fine to leave but consider reframing as `"Tight budget?"` for warmer tone.

- **Welcome step 1 says "You fill out a quick onboarding form (10 min)"** — `src/lib/email-templates.ts:401` — the new 3-step onboarding (Rule 41) says step 1 is ~3 min. Update to: `"You fill out a quick 3-step onboarding form (step 1 takes 3 min — you can finish the rest later)"`.

- **Welcome email "30-min reminder" subject uses "I'm ready to start customizing"** — `src/lib/email-templates.ts:444` — soft pitch, no issues, but consider tying to the new 3-step phrasing: `"need just step 1 (~3 min) to start your site"`.

- **Onboarding-reminder Day 5 says "the 3-step form takes about 10 min"** — `src/lib/email-templates.ts:525` — old timing assumption. Should be `"the 3-step form — Step 1 alone is enough to start, takes ~3 min"`. Matches Rule 41.

- **Voicemail follow-up uses jargon "Google rankings"** — `src/lib/voicemail.ts:305` — `"loads a lot faster, which makes a big difference for Google rankings"` — `Google rankings` is borderline jargon; recommend `"makes Google show you higher in searches"`.

- **AI responder objection response mentions "no monthly subscription" defensively** — `src/lib/ai-responder.ts:1193` — `"No hidden fees, and no monthly subscription"` — defensive framing. Reframe to `"$997 once. $100/year starting year 2 covers domain, hosting, maintenance. That's the whole bill."`.

- **`/welcome/[id]` step 1 says "Your custom website is already built and waiting"** — `src/app/welcome/[id]/page.tsx:64-65` — fine wording, but consider adding the canonical timeline: `"...Live in 48 hours after you complete the onboarding form."` — currently the page shows "Usually within 48 hours" only on step 5.

- **Pricing wording on `/welcome/[id]` doesn't mention $100/yr at all** — `src/app/welcome/[id]/page.tsx` — entire page omits the renewal cadence. Add a one-line disclosure near "What's Included" so customers aren't surprised year 2.

- **Welcome email "Need more? See add-ons → upsells/[id]" uses long preview URL pattern** — `src/lib/email-templates.ts:424` — uses `${baseUrl}/upsells/${prospect.id}` which is fine for upsells (always full path), but the welcome and handoff emails should add a short version once that route exists. Low priority.

- **Audit page hero subline says "Find out before your competitor does."** — `src/app/audit/page.tsx:62` — borderline urgency/scarcity; technically fine. Just verify on mobile that the line wraps gracefully.

## 🟢 Polish

- **`/p/[code]` route correctly handles custom-tier redirects** — `src/app/p/[code]/page.tsx:163-169` ✓

- **`getShortPreviewUrl()` is used correctly in all email templates and SMS templates** — `src/lib/email-templates.ts`, `src/lib/sms.ts` ✓

- **Audit `stripJargon()` helper exists but list is short** — `src/app/audit/[id]/page.tsx:70-78` — extend banned-word list to match Rule 61 fully (`optimize`, `enhance`, `streamline`, `maximize`, `utilize`, `facilitate`, `prioritize`, `methodology`, `UX`).

- **Welcome and onboarding-reminder emails could embed a cancel-anytime line** — `src/lib/email-templates.ts:386-535` — most emails skip the canonical cancel-anytime promise. Adding `"Cancel anytime — you keep the site, domain transfers to you."` to the welcome footer matches the claim page (line 516).

- **Move `/welcome/[id]` "What's Included" list closer to canonical wording** — current 12-item list is dev-friendly but not customer-friendly. Change `"1 year site management"` → `"1 year of management & updates included — then $100/year starting year 2"`.

- **Audit hero says "Audit takes ~3-5 minutes to generate"** — `src/app/audit/page.tsx:70` — matches `<Step n="2"...takes ~5 min />` and `metadata.openGraph.description "Takes 60 seconds."`. The "60 seconds" is the form-fill time; the "3-5 min" is generation. Sub-language is OK but a customer reading both will be confused. Make it explicit: `"Form takes ~60 seconds. Audit generates in 3-5 minutes."`

- **`/upsells/[id]` page does not show a price-trust line**: `src/app/upsells/[id]/page.tsx` — the page links to Stripe but doesn't show "100% money-back" or "cancel anytime" near the buy buttons. Add a trust strip below the grid.

## Verified consistent

- **Pricing wording — claim page** ✓ — `/claim/[id]/page.tsx` consistently says `"$997 one-time includes custom website design, domain registration, and hosting setup. After year one, $100/year maintenance covers domain renewal, hosting, ongoing maintenance, and support."` (lines 625, 971, 979, 1165)

- **Pricing wording — Terms page** ✓ — `/terms/page.tsx:196` says the canonical `"$997 one-time + $100/year starting year 2 (cancel anytime)"`. Service Summary table (line 220-225) maps to the same sentence.

- **Pricing wording — Services component** ✓ — `src/components/Services.tsx:158` says `"$997 one-time, then $100/year starting year 2 for domain, hosting, and support. Cancel anytime."`

- **Pricing wording — Stripe webhook welcome HTML** ✓ — `src/app/api/webhooks/stripe/route.ts:713` says `"$100/year maintenance subscription has been created with a 1-year free trial (first charge in 12 months). It covers domain renewal, hosting, ongoing maintenance, and support."`

- **Footer attribution — V2 templates and showcases** ✓ — All 47 V2 preview components and 46 V2 showcase pages contain `"free site audit"` and link to `/audit`. Zero remaining instances of `"Created by bluejayportfolio.com"` in `/src` (only in markdown docs `QC_RULES.md` and `VISUAL_QC_REVIEW_GUIDE.md` which are operator-internal).

- **Short URL usage in core outreach** ✓ — `getPitchEmail`, `getFollowUp1-6`, `getNpsSurveyEmail`, `getReferralEmail`, all SMS templates (`getInitialSms`, `getFollowUpSms1-2`, `getPostVoicemailSms`) all call `getShortPreviewUrl(prospect)`.

- **List-Unsubscribe header alignment** ✓ — `src/lib/email-sender.ts:111-117` sets `List-Unsubscribe: <https://bluejayportfolio.com/u/[code]>` and the body footer (`EMAIL_FOOTER`) uses `getShortUnsubUrl(prospect)` which resolves to the same `/u/[code]` URL. Rule 27 satisfied.

- **`/p/[code]`, `/u/[code]`, `/b/[code]` route handlers exist** ✓ — `src/app/p/[code]/page.tsx`, `src/app/u/[code]/route.ts`, `src/app/b/[code]/route.ts` all present.

- **Inquire route exists** ✓ — `src/app/inquire/[code]/page.tsx`, `src/app/inquire/[code]/InquireClientForm.tsx`, `src/app/api/inquire/[code]/` all present.

- **Review-blast public page exists** ✓ — `src/app/review-blast/[id]/page.tsx`, `src/app/review-blast/[id]/ReviewBlastForm.tsx` present, matching `getReviewBlastWelcomeEmail()` magic-link.

- **`/upsells/[id]` route + 4-SKU catalog** ✓ — page consumes `UPSELL_CATALOG`, gates on `status === "paid"` server-side via `/api/checkout/upsell`.

- **`/client/[id]` portal** ✓ — three tabs (Leads / Reviews / Renewal), pricing line on Renewal tab matches canonical wording (`"$100/yr covers domain renewal, hosting, ongoing maintenance, and support"` — line 651-654).

- **CTA copy with offer (Rule 34)** ✓ — Most claim-page primary CTAs include offer + guarantee: `"Claim — $997 · 100% money-back"`, `"Claim — 3 × $349"` (with money-back subtitle), `"Claim — $100/yr · cancel anytime"`. Only the sticky header uses bare `"Claim — from $349"` which is flagged above.

- **Cold-outreach SMS gate (Rule per A2P 10DLC)** ✓ — `funnel-manager.ts` only builds SMS payloads for `prospect.source === "inbound"`. Cold outreach gets email + voicemail only.

- **Reading-level on AI-generated audit content** ✓ — `buildHeroPrompt()` and `buildTechnicalPrompt()` in `src/lib/site-audit.ts` enforce Rule 61 banned/yes word lists. Static UI copy mostly clean (one `social proof` jargon flagged above).

- **3-CTA Hub on audit page** ✓ — `AuditCTAHub.tsx` implements Buy / Schedule / Get Preview pattern per Rule 57.

- **Money math on audit page is deterministic** ✓ — `recoveryProjection`, `moneyLeak.monthlyEstimate`, per-fix `recoveryMonthly` all derived in `src/lib/sites-audit.ts` via formulas with named constants. Rule 59 satisfied.
