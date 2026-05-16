# Tekky / Zenith Sports — Sunday 2026-05-17 cutover runbook

Going live: **Sunday 2026-05-17, 9:00 AM PT** on **tekky.org**.

This is the minute-by-minute. Print it, screenshot it, keep it open on
a second screen. The goal is zero improvisation between 9am and 10am.

---

## ⏰ Saturday 2026-05-16 — pre-flight (Ben, 30 min total)

### 1. Add tekky.org to the Vercel project (2 min)

Vercel dashboard → bluejays project → Settings → Domains → Add:

```
tekky.org
```

Then click Add again:

```
www.tekky.org
```

Vercel will show "Pending verification" until DNS flips. That's expected.
Once Paul flips nameservers Sunday morning, Vercel auto-verifies in 5-60 min.

### 2. Create the Q1 Stripe Payment Link (5 min)

Stripe dashboard → Payment Links → New:

- **Product:** "TEKKY AI Marketing System — Q1 of 4" (one-time)
- **Price:** $2,500.00 USD, one-time
- **Description on receipt:** "Quarterly installment 1 of 4 — AI Marketing System buildout for Tekky / Zenith Sports."
- **Collect customer info:** name + email
- **After payment:** Custom thank-you message: "Q1 received. Cutover proceeding — Ben will be in touch within the hour."

Copy the resulting link. Save it where you can find it 9am Sunday.
Pattern: `https://buy.stripe.com/xxxxxxxxxxxx`

### 3. Cancel the existing $2,500/mo subscription (3 min)

Stripe dashboard → Customers → search "TEKKY / Zenith Sports" → open
customer `cus_USXWoraJLFr885` → Subscriptions → `sub_1TTcUrRuVfGvONwtu4l9SZY2`
→ Actions → Cancel.

- Cancellation reason: "Pricing restructured to quarterly installments"
- Don't prorate (nothing was paid anyway — $0 lifetime)
- Don't notify customer (we're talking to them Sunday)

### 4. Confirm Paul's reply has the 4 things you asked for (2 min)

Check iMessage for:
- [ ] Exact domain spelling (assume **tekky.org** unless he corrects)
- [ ] Registrar login OR confirmation he'll flip nameservers himself
- [ ] Email routing decision (forwarding to zenithsports.org inbox, OR new Google Workspace)
- [ ] Any final copy/photo changes (or "none, ship it")

If anything's missing, send Saturday reminder text (in chat) at 8 PM PT.

### 5. Smoke-test the live showcase one more time (5 min)

Open in incognito browser:

- https://bluejayportfolio.com/clients/zenith-sports
- https://bluejayportfolio.com/clients/zenith-sports/shop
- https://bluejayportfolio.com/clients/zenith-sports/login

All three render? Shop CTAs link to zenithsports.org Shopify? Login form
shows "Account: Zenith Sports"? If yes, you're good.

### 6. Block the Sunday morning calendar (1 min)

Calendar: 8:30 AM – 10:30 AM PT, "Tekky cutover — DO NOT BOOK OVER".

---

## ⏰ Sunday 2026-05-17 — cutover day

### 8:30 AM PT — pre-call (Ben, 20 min)

1. **Reboot/clear browser caches.** Open a fresh incognito window for testing.
2. **Test both temp passwords** at https://bluejayportfolio.com/clients/zenith-sports/login:
   - `tekky-walkthrough-paul-2026`
   - `tekky-walkthrough-philip-2026`
   - If either fails, run the emergency reset block in [walkthrough-2026-05-13.md](walkthrough-2026-05-13.md#-emergency-password-reset-if-login-fails)
3. **Verify Vercel "Pending" status** for tekky.org. If verified already, even better.
4. **Confirm Stripe Payment Link works** — open in incognito, run a $0.50 test charge on your own card (refund after). Confirms the link, button, success page, and webhook are all live.
5. **Have these tabs open and ready** before the call:
   - Stripe dashboard (Customers view, filtered to Tekky)
   - Vercel dashboard (Domains view)
   - Supabase SQL editor (in case of emergency reset)
   - The handoff doc (markdown preview)
   - This runbook

### 9:00 AM PT — open the call (Ben, ~5 min)

> "Morning Paul, morning Philip. Few things to land before we flip the
> domain. First thing — final walkthrough. Second — payment for Q1.
> Third — DNS flip and we watch it go live together. Sound good?"

### 9:05 AM PT — final walkthrough (Ben, ~10 min)

Screen-share. Walk through, in order:
1. **Public showcase** — `/clients/zenith-sports` — emphasize what
   tekky.org will serve.
2. **Shop page** — `/clients/zenith-sports/shop` — confirm CTAs route
   to their Shopify (zenithsports.org).
3. **Portal login** — `/clients/zenith-sports/login` — remind them to
   change passwords on first login.
4. **Portal Leads tab** — 986 leads, audience color-coded, search,
   bulk actions. The cockpit.

End the walkthrough with: *"Any final tweaks before we lock it?"*

### 9:15 AM PT — collect Q1 payment (Ben, ~5 min)

> "Quick housekeeping. First quarterly installment is $2,500. I'm
> sending you the payment link right now — takes 30 seconds. Once
> that clears I'll flip the domain and we watch it go live together."

Paste the Stripe Payment Link into Signal/iMessage/email. **Wait for
"Succeeded" in Stripe dashboard before next step.**

If they balk:
> "I get it. Look — the work is done, the site is sitting on a server
> right now waiting. We agreed $10,000 in 4 quarterly installments
> back in May. Q1 is what unlocks the DNS flip. Worst case we
> reschedule to Tuesday after the card lands. What feels right?"

**Hard rule: no payment = no DNS flip. Reschedule if needed.**

### 9:20 AM PT — DNS flip (Paul, with Ben on the line, ~5 min)

Two paths depending on what Paul said Saturday:

**Path A — Paul does it himself:** Paul logs into his registrar
(Namecheap/GoDaddy/wherever tekky.org lives) and changes the
nameservers to:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Walk him through it on screen-share. Most registrars have a "Manage DNS"
or "Nameservers" section right on the domain page.

**Path B — Ben does it with Paul's login:** same steps, Ben drives.

After saving:

> "DNS propagation usually takes 5-30 minutes. Sometimes faster. Let's
> use that window to walk through the portal one more time, and I'll
> refresh tekky.org every couple minutes."

### 9:25 AM PT — wait for propagation (Ben, 5-30 min)

Open tekky.org in incognito every 2-3 min. Use this to check status:

```
nslookup tekky.org 8.8.8.8
```

You're looking for the answer to include Vercel's IPs (typically
`76.76.21.21` or similar 76.76.x.x range). Until then, it's still
hitting their old registrar.

While waiting:
- Open Vercel dashboard, watch the tekky.org status flip from "Pending"
  to "Valid Configuration" — that's the green light.
- Talk through the Leads tab again with Paul + Philip. Audience colors,
  Cmd-K search, bulk actions.

### 9:45 AM PT (or whenever Vercel says "Valid") — go-live smoke test

The moment Vercel shows "Valid Configuration", run this 10-point smoke
test on tekky.org IN INCOGNITO (so no cookies poison the result):

1. **`https://tekky.org`** loads the Zenith Sports showcase — NOT the
   BlueJays portfolio homepage. ✓
2. **`https://www.tekky.org`** also loads the showcase (Vercel handles
   www → apex redirect). ✓
3. **SSL certificate is valid** — green padlock, no "Not Secure"
   warning. ✓
4. **Hero CTA "SHOP THE TEKKY"** routes to `/clients/zenith-sports/shop`
   on tekky.org. ✓
5. **Shop page "BUY ON ZENITH SPORTS" CTAs** route to zenithsports.org
   Shopify product pages (NOT broken). ✓
6. **Email capture form** posts successfully (test with a fake email,
   confirm "thanks" state appears). ✓
7. **All 6 product photos load** on showcase (no broken images, no alt
   text where photos should be). ✓
8. **Footer credit links** to bluejayportfolio.com/audit. ✓
9. **`https://tekky.org/clients/zenith-sports/login`** loads the portal
   sign-in (this URL still works since middleware doesn't rewrite the
   /clients prefix path). ✓
10. **`https://bluejayportfolio.com/clients/zenith-sports/login`**
    still works as before (no regression on the canonical portal URL). ✓

Any failure → screenshot, note the URL, and either fix in real-time
(small things like typos) or schedule a Tuesday morning patch (anything
needing a deploy).

### 10:00 AM PT — close the call (Ben, ~10 min)

Once smoke test passes:

> "You're live. Three things before we wrap:
>
> 1. Bookmark the portal URL — bluejayportfolio.com slash clients slash
>    zenith-sports slash login.
> 2. Change your passwords first thing. Avatar menu, top right.
> 3. I'm emailing you the onboarding handoff doc right now — covers
>    every tab, the brand voice, what's on autopilot, what's on you.
>    Print it or bookmark it.
>
> Phase A kicks off Monday. I'll have a check-in with you Friday."

Hit send on the handoff email while you're still on the call. Confirm
they got it before ending.

### 10:15 AM PT — post-call admin (Ben, ~15 min)

1. **Memory update.** Open
   `~/.claude/projects/.../memory/project_zenith_tekky.md`. Set
   `status_updated: 2026-05-17`. Replace the $0-collected note with
   the Q1 payment confirmation + new sub structure. Add a line:
   "LIVE on tekky.org as of 2026-05-17 9:45am PT".
2. **`memory/active_commitments.md`** — strike the Tekky-walkthrough
   migration line. Add Phase A kickoff items if you've got specifics.
3. **`memory/recent_locked_decisions.md`** — log "Tekky LIVE
   2026-05-17, Q1 $2,500 collected, switched from $2,500/mo to
   $2,500 quarterly".
4. **CLAUDE.md "Client Tenant Status" table** — update Zenith Sports
   row notes: change "4-qtr $10K AI plan" to "LIVE 2026-05-17 ·
   $2,500/qtr × 4".
5. **LinkedIn post + IG post** — Day 19 of the ramp. Tekky launch is
   your content for the day. Write it before you do anything else
   non-essential.

### Anytime Sunday — if something blows up

| Symptom | Fix |
|---|---|
| tekky.org still hits old registrar after 30 min | Confirm with Paul that nameservers were actually saved on the registrar side. Most failures here are "Paul changed it but didn't click Save." |
| tekky.org loads but shows BlueJays homepage instead of Zenith showcase | Middleware rewrite isn't firing. Check `src/middleware.ts:244` — `tekky.org` line uncommented? Deployed? Otherwise: hard-refresh + clear cache. |
| tekky.org shows "Invalid Configuration" in Vercel | Nameservers set wrong. Double-check Paul typed `ns1.vercel-dns.com` + `ns2.vercel-dns.com` exactly. |
| SSL cert error | Let Vercel finish provisioning — auto-issues within 30 min of nameservers propagating. If still failing after 1 hour, check Vercel domain settings → request new cert. |
| Stripe Q1 link returns "Price not found" | The product was archived in Stripe. Create a fresh link, send again. |
| Portal login fails for Paul or Philip | Run the emergency reset block in [walkthrough-2026-05-13.md](walkthrough-2026-05-13.md#-emergency-password-reset-if-login-fails). |

---

## Materials checklist (Saturday EOD)

- [ ] tekky.org + www.tekky.org added to Vercel project domains
- [ ] Q1 Stripe Payment Link created + tested + saved
- [ ] $2,500/mo subscription cancelled in Stripe
- [ ] Paul's 4 replies received (domain, access, email routing, copy)
- [ ] Saturday reminder text sent to Paul (8 PM PT)
- [ ] Calendar blocked Sunday 8:30 AM – 10:30 AM PT
- [ ] Handoff doc PDF generated OR markdown copied to compose drafts
- [ ] This runbook + walkthrough-2026-05-13.md printed/open on 2nd screen

If all 8 are checked, you sleep well Saturday night.

---

Last updated: 2026-05-15.
Maintained at: `bluejays/docs/clients/zenith-sports/sunday-cutover.md`
