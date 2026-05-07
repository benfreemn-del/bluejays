---
description: Run the three BlueJays ops audits (domain registrar, 2FA recovery, billing) — fills what code knows, asks Ben for the rest.
---

# /audit-business

Refresh the three operational audit docs in `docs/ops/`:

1. `domain-registrar-audit.md`
2. `2fa-recovery-plan.md`
3. `billing-audit-template.md`

## What to do

For each audit:

1. **Read the existing doc.** Note which `[FILL]` rows are still empty
   and which sections have stale dates.
2. **Re-derive the code-known data** from the live codebase:
   - Domain audit: scan `src/middleware.ts` (CLIENT_DOMAIN_MAP) and
     `src/lib/client-site-urls.ts` for current external + internal
     client domains. Diff against the doc — flag any new clients not
     yet documented.
   - 2FA recovery: check `package.json` + `src/lib/` for any new
     third-party services (SendGrid, Twilio, Anthropic, etc.) that
     should be in the inventory.
   - Billing audit: read `recurring_costs` table schema (`src/lib/recurring-costs.ts`)
     and the `system_costs` cost-logger. Surface the row count + any
     `active=true` rows in the inventory.
3. **Update the doc** with code-derived rows. Leave `[FILL]` for
   anything that requires Ben's logins (registrar names, expiries,
   credit-card amounts).
4. **Print a report** of what's still unknown — the leftover `[FILL]`
   list — so Ben can knock it out.

## Don't

- Don't invent registrar names / expiries / dollar amounts. Leave `[FILL]`.
- Don't email anyone or hit external APIs.
- Don't commit changes — print the diff and let Ben review.

## When this is useful

- Quarterly ops review
- Right before tax filing season
- After onboarding 2+ new clients (might have new domains to track)
- Anytime Ben says "audit my SaaS spend" / "what domains am I paying for"
