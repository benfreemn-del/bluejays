# 2FA recovery plan

> Goal: if your phone gets stolen / wiped / drops in the river, you can
> still log into every business-critical account inside 24 hours.
>
> **Fill this template** by going account-by-account through your
> business password manager once. Print the filled version. Put one
> copy in a fire-safe at home, one in your safe-deposit box. Re-print
> annually (set a calendar reminder).

---

## How to actually use this doc

1. For each row below, log into the account, go to **Security / 2FA**,
   and switch from "SMS" to "**authenticator app** (TOTP)" wherever
   possible. SMS 2FA is bypassable via SIM-swap and gives you nothing
   in a phone-loss scenario.
2. When the account shows you the QR code, ALSO save the **recovery
   codes** (10-pack of one-time-use codes). Put them in this doc.
3. Use a single TOTP app (Authy or 1Password's built-in) that has
   **multi-device sync with a master password recovery**. That way a
   replacement phone can re-pair without you needing every recovery
   code.
4. Keep this doc out of your password manager (otherwise losing the
   manager loses both layers).

---

## Account inventory

For each, fill in: 2FA method, where the recovery codes live, and
the email associated.

### Money + tax

| Account | 2FA method | Recovery codes saved? | Account email |
|---|---|---|---|
| Business bank (TBD — see BusinessSetupChecklist) | | | |
| WA DOR (`secureaccess.wa.gov`) | | | |
| IRS (e-services / EFTPS for 941 deposits if applicable) | | | |
| Personal bank (the card you currently use for biz expenses, until business bank lands) | | | |
| Stripe (BlueJays merchant account) | | | |
| Venmo (commission payouts to partners) | | | |
| Zelle (commission payouts) | | | |
| QuickBooks / Wave / whatever bookkeeping tool you pick | | | |
| CPA portal (once retained) | | | |

### Infrastructure (where the money-making code lives)

| Account | 2FA method | Recovery codes saved? | Account email |
|---|---|---|---|
| GitHub (BlueJays repo) | | | |
| Vercel (deploys) | | | |
| Supabase (Postgres) | | | |
| Domain registrar for **bluejayportfolio.com** | | | |
| SendGrid (transactional email) | | | |
| Twilio (SMS, missed-call text-back) | | | |
| Anthropic Console (Claude API key) | | | |
| Cloudflare (if you use it for DNS / CDN) | | | |
| Google Workspace (`ben@bluejayportfolio.com`) | | | |
| Apple ID (if iPhone) | | | |
| Google account (if Android / for Drive backups) | | | |

### Sales + ops

| Account | 2FA method | Recovery codes saved? | Account email |
|---|---|---|---|
| Calendly (Madie's shared link) | | | |
| Apollo / lead source | | | |
| Slack (if used) | | | |
| Notion / Linear / whatever you use for ops | | | |

### Per-client integrations

For each active client, you may have access to **their** Google
Business Profile, **their** Facebook page, **their** website
registrar. Document each one — losing access to a client's GBP can
take weeks to recover.

| Client | What you have access to | 2FA on their account? | Recovery |
|---|---|---|---|
| Hector Landscaping | DNS for hectorlandscaping.com (his registrar?) | | |
| | | | |

---

## Master "phone-lost" runbook

Tape this to the fire-safe lid:

1. **Within 1 hour**: call carrier (Verizon/T-Mobile/etc.) → port
   number to a SIM you control. SIM-swap is the fastest attack vector;
   take the number back before anyone else does.
2. **Within 4 hours**: log into Google / Apple ID from a trusted
   device → mark the lost phone as wiped. Sign out of every active
   session.
3. **Within 24 hours**: rotate the master password on:
   - Password manager
   - Email (the one tied to all the recovery flows)
   - Bank
   - Stripe
   - GitHub
   These are the five accounts that, if compromised, cascade into
   everything else.
4. **Within 7 days**: re-enroll TOTP on every account in the inventory
   above. Keep this doc up to date.

---

## Backup phone strategy (cheap insurance)

Buy a $50 unlocked Android off Amazon. Keep it in the fire-safe with
a charged battery. Pre-install Authy + your password manager. If your
main phone dies, the backup gets you back online in 30 minutes
instead of "wait for replacement to ship."

---

## Annual review

Re-print this doc every January 1. Diff against last year's version —
new accounts go in, dead ones come out. Re-confirm every recovery
code is still valid (most expire after they're consumed; if you ever
used one, re-generate the set).

Last reviewed: **[FILL DATE]**
Next review due: **[FILL DATE — one year out]**
