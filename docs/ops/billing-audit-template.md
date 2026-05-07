# Billing audit template

> **Goal:** every dollar leaving the BlueJays card goes to something
> that earns more than a dollar back. Run this audit **monthly** for
> the first 6 months of operation, then quarterly. Most businesses
> die from **silent SaaS bloat** — $20/mo here, $50/mo there, none
> deleted, all on auto-renew, none ever audited.
>
> **Use this template** alongside the live data in `recurring_costs`
> (the dashboard at `/spending` already shows monthly burn). This doc
> is the human-readable companion that captures the **decision** for
> each line — keep, kill, downgrade, or watch.

---

## How to run the audit (30 minutes, monthly)

1. Open `/spending` in the dashboard (sums `recurring_costs` +
   `system_costs`).
2. Open your bank/credit-card statement for the last 30 days. Filter
   for recurring charges.
3. For every charge — does it appear in the table below? If not, add
   it. If a row in the table no longer shows on the statement, mark
   it ended.
4. For each row, ask the four-column decision (keep / downgrade / kill
   / watch).
5. Update `recurring_costs` in Supabase to match (`active=false` for
   killed services, `monthly_cost_usd` for downgrades).
6. File the filled audit under `docs/ops/billing-audits/YYYY-MM.md`.

---

## Audit run: **[YYYY-MM-DD]**

### Infrastructure (the things that, if cancelled, take BlueJays down)

| Service | $/mo | Used in last 30d? | Decision | Notes |
|---|---|---|---|---|
| Vercel Pro (hosting) | | | keep / kill / watch | Hosts the entire app — deploys, edge fn, SSR. Killing this kills BlueJays. |
| Supabase (database + auth) | | | | Postgres for prospects, partners, client tenants. Free tier sufficient until ~50K rows; we may already be past that. |
| Domain — `bluejayportfolio.com` | | (annual, prorated) | | See `domain-registrar-audit.md`. |
| SendGrid (transactional email) | | | | Used by audit-result emails, partner alerts, weekly digest. |
| Twilio (SMS + missed-call text-back) | | | | $1.15/mo phone-number rental + per-message. Tiny. |
| Anthropic API (Claude usage) | | | | Variable, not fixed. Track in `system_costs` not `recurring_costs`. |
| OpenAI API (if used) | | | | Same — variable. |
| Google Workspace (`ben@bluejayportfolio.com`) | | | | $7/mo per user. |

### Tools you might be paying for and forgot

| Service | $/mo | Used in last 30d? | Decision | Notes |
|---|---|---|---|---|
| GitHub (paid plan?) | | | | Free tier covers private repos for solo. Only pay if you need Copilot Business or Actions minutes. |
| Linear / Notion / Asana | | | | Pick one. Cancel the other two. |
| Figma | | | | Free tier fine for solo design. |
| Adobe Creative Cloud | | | | $60/mo single-app — biggest "I-forgot-this-was-on" charge. |
| Apollo / lead-source tool | | | | Required for the partner workspace lead pool. Confirm tier matches actual usage. |
| Calendly Pro | | | | Madie + Ben share the link — Pro tier may be needed for round-robin. |
| Zapier / n8n | | | | Are these actually wired into anything in the codebase? If not, kill. |
| Slack Standard | | | | Solo / 2-person — the free tier (90-day message history) is fine. |
| LinkedIn Premium / Sales Navigator | | | | $80/mo — only justify if doing active outbound on LI. |

### Subscriptions outside SaaS

| Service | $/mo | Decision | Notes |
|---|---|---|---|
| Phone (business number, if separate) | | | |
| E&O / business insurance (once retained) | | | See BusinessSetupChecklist · `eo-insurance`. |
| Bookkeeper / Wave / QuickBooks | | | See BusinessSetupChecklist · `bookkeeping-system`. |
| CPA retainer (once retained) | | | See BusinessSetupChecklist · `cpa-retainer`. |

---

## Decision criteria (so future-you doesn't second-guess)

For each line, the decision is one of:

- **Keep** — confirmed used in the last 30 days, generating measurable
  value (revenue, time-saved, mandatory compliance). Document **why**
  in the Notes column so a future audit doesn't re-litigate.
- **Downgrade** — used, but the current tier is overprovisioned. Move
  to a lower plan. (Vercel Pro → Hobby is the canonical example. Don't
  do this if you have client traffic on the same project.)
- **Kill** — not used in 30 days, or used but the value is < the cost.
  Cancel today. Do not "wait one more month" — that's how bloat wins.
- **Watch** — borderline. Set a 30-day reminder + revisit. If still
  borderline next month, default to kill.

---

## Red-flag list (things that should NEVER be on a recurring charge)

- Anything you set up "to test it" and never logged into again
- Annual plans paid monthly (always pay annual upfront if you commit)
- "Premium" tiers of free-tier-sufficient tools (GitHub Pro, Notion
  Personal Pro for a solo user, Figma Professional when free-tier
  works)
- Multiple tools that do the same job (Asana + Linear + Notion +
  Trello — pick ONE)
- Domains you don't recognize (see `domain-registrar-audit.md` §5)

---

## "Forced kill" trigger

If monthly recurring spend ever exceeds **$X** (set a number you're
comfortable with — e.g., $300/mo today) without a corresponding
revenue increase the same quarter, force-kill 20% of the lowest-value
lines. The pain of cancelling is always less than the pain of
discovering a year later that you've burned $5K on tools that
weren't moving the needle.

Current ceiling: **$[FILL]/mo**.

---

## History log

Append-only — never edit past entries. The diff between months is the
single most useful artifact this whole template produces.

| Date | Recurring total | Killed this month | New this month | Net change |
|---|---|---|---|---|
| | | | | |

---

## Related docs

- `domain-registrar-audit.md` — domain renewals & DNS ownership
- `2fa-recovery-plan.md` — login recovery for every account in this audit
- `BusinessSetupChecklist.tsx` — the home-dashboard task list this
  audit feeds into
