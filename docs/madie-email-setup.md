# Madie Email Setup — `madie@bluejayportfolio.com`

Last updated: 2026-05-29

## Why this matters

The sales portal already sends emails FROM `madie@bluejayportfolio.com` (via SendGrid senderOverride):

- 📅 Book pill on each lead row → `/api/prospects/[id]/send-booking`
- 🔍 Audit pill on each lead row → `/api/prospects/[id]/send-audit`
- Send Email button on `/lead/[id]` → `/api/email/send/[id]` (Madie's pitch — added 2026-05-29)

SendGrid's DKIM auth is on the whole `bluejayportfolio.com` domain, so these sends pass auth even without a real mailbox. **But replies will fail to land anywhere useful unless the mailbox is set up.**

## Three paths — pick one

### Path A — Real Google Workspace user (recommended, $6/mo)

Madie logs in to her own Gmail at `mail.google.com` as `madie@bluejayportfolio.com`. Best UX, full inbox, mobile app, calendar invites work cleanly.

1. Open https://admin.google.com → **Users** → **Add new user**
2. Email: `madie@bluejayportfolio.com`
3. First / last: Madie / (last name)
4. Password: temporary, force-change on first sign-in
5. License: Business Starter ($6/mo)
6. Send Madie the credentials securely (Bitwarden, 1Password, encrypted text)

### Path B — Alias forwarding to Madie's personal Gmail (free)

`madie@bluejayportfolio.com` is configured as an alias. All inbound mail forwards to her personal address. She replies from her real Gmail using "Send mail as" set up in Gmail Settings.

1. https://admin.google.com → **Domains** → **Manage domains**
2. Pick `bluejayportfolio.com` → **Email aliases**
3. Add `madie@` → forward to `<madie's personal gmail>`
4. Have Madie open Gmail → Settings → **Accounts and Import** → **Send mail as** → Add `madie@bluejayportfolio.com` → verify

Free, but every outbound reply she sends needs the "From:" dropdown set to `madie@bluejayportfolio.com` or it'll show her personal address.

### Path C — Catch-all to Ben's existing inbox (interim)

All `*@bluejayportfolio.com` mail (including madie@) lands in `bluejaycontactme@gmail.com`. Use this only as a stopgap while paths A or B get set up. Replies you send to Madie's prospects will look like they came from `bluejaycontactme@`, not `madie@`, unless you also configure "Send mail as".

## Email signature for Madie (Gmail)

After picking a path, install this HTML signature in Gmail:

**Gmail web** → ⚙ Settings → See all settings → General → Signature → Create new → paste below → Save

```html
<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;font-size:14px;line-height:1.5;">
  <tr>
    <td style="padding-right:14px;border-right:2px solid #f59e0b;">
      <div style="font-weight:700;font-size:15px;color:#0f172a;">Madie</div>
      <div style="color:#475569;font-size:13px;">Sales · BlueJays</div>
    </td>
    <td style="padding-left:14px;">
      <div style="font-size:13px;">
        <a href="mailto:madie@bluejayportfolio.com" style="color:#0ea5e9;text-decoration:none;">madie@bluejayportfolio.com</a><br>
        <a href="https://bluejayportfolio.com" style="color:#0ea5e9;text-decoration:none;">bluejayportfolio.com</a><br>
        <a href="https://bluejayportfolio.com/book-ben" style="color:#f59e0b;text-decoration:none;font-weight:600;">📅 Book a 15-min call with Ben</a>
      </div>
    </td>
  </tr>
</table>
```

Set as default for **New emails** AND **Replies/forwards**.

## Verification checklist after setup

- [ ] Path picked (A, B, or C)
- [ ] Mailbox / alias created
- [ ] Madie can sign in (Path A) or send mail-as (Path B)
- [ ] Signature installed on Gmail web + mobile
- [ ] Test send: from the sales portal, hit a test prospect's `📅 Book` pill → check that the prospect's email-inbox-equivalent shows `Madie @ BlueJays <madie@bluejayportfolio.com>`
- [ ] Test reply: reply to that test send → confirm reply lands in Madie's chosen inbox (Path A) or her personal Gmail (Path B/C)

## Touch log verification

Every system send from Madie's surfaces logs a row to `prospect_touches` with `by_user='madie'`. Verify via the lead drawer:

1. Open `/dashboard/script` as Madie
2. Click any lead's name → drawer opens
3. Pick **📜 Touch history** tab
4. Look for `Emailed · by madie · just now` rows after a test send

If a send didn't log, check Vercel logs for `[send-booking] touch log failed` or `[send-audit] touch log failed`.
