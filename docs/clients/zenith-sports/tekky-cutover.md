# Tekky / Zenith Sports — tekky.org cutover runbook ($997 Phase 1)

**Payment cleared.** $997 + WA tax via Stripe Payment Link
`https://buy.stripe.com/00weVfeAX88G28T3Lq04803` (plink_1TZGSqRuVfGvONwtM9q0yDGo).
Ben has Shopify Web Design access on zenithsports.org as of 2026-05-27.

This runbook covers the **DNS flip → smoke test → handoff** sequence
once Paul is ready to point tekky.org at our Vercel project. Replaces
the prior sunday-cutover.md ($10K AI System runbook — superseded by
the 2026-05-20 downgrade to standard tier).

---

## ⏰ Pre-flight (Ben, ~15 min, do this NOW)

### 1. Add tekky.org to the Vercel project (2 min)

Vercel dashboard → bluejays project → Settings → Domains → Add:

```
tekky.org
```

Click Add again:

```
www.tekky.org
```

Vercel will show "Pending verification" until DNS flips. Expected.
Once Paul switches nameservers, Vercel auto-verifies in 5–60 min and
auto-provisions the SSL cert.

### 2. Verify the latest deploy has the SEO + middleware updates (2 min)

Confirm Vercel's last successful production deploy is from 2026-05-27
or later — that's the commit that ships:

- JSON-LD blocks on `/clients/zenith-sports` (Organization + WebSite + 3 Product)
- Dedicated `/clients/zenith-sports/sitemap.xml` + `/robots.txt` routes
- Middleware multi-page support for tekky.org (rewrites /shop, /llms.txt,
  /sitemap.xml, /robots.txt, etc. to the matching Zenith subpaths
  instead of 301'ing to /)
- Shop page footer fixed ("Built by BlueJays" → bluejayportfolio.com)

Quick check on bluejayportfolio.com (Vercel canonical) BEFORE DNS flip:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://bluejayportfolio.com/clients/zenith-sports/sitemap.xml
curl -s -o /dev/null -w "%{http_code}\n" https://bluejayportfolio.com/clients/zenith-sports/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" https://bluejayportfolio.com/clients/zenith-sports/llms.txt
```

All three should return `200`.

### 3. Smoke-test the showcase in incognito (5 min)

```
https://bluejayportfolio.com/clients/zenith-sports
https://bluejayportfolio.com/clients/zenith-sports/shop
https://bluejayportfolio.com/clients/zenith-sports/training-guide
https://bluejayportfolio.com/clients/zenith-sports/build-your-player
https://bluejayportfolio.com/clients/zenith-sports/camps
https://bluejayportfolio.com/clients/zenith-sports/partners
https://bluejayportfolio.com/clients/zenith-sports/login
```

All render? Shop CTAs hit zenithsports.org? Inquiry form submits?
Footer credit reads "Built by BlueJays" linking to bluejayportfolio.com?
If yes — green light to flip DNS.

### 4. (Optional) Wire express checkout (5 min)

We now have Shopify Web Design access. To upgrade the 3 product Buy
buttons from "open product page" → "open Apple Pay / Shop Pay /
Google Pay directly" (1-click checkout — biggest single click-reduction
to buy):

1. zenithsports.org Shopify Admin → Products → click each product
2. Scroll to Variants, click the variant — URL ends in `/variants/VARIANT_ID`
3. Copy the variant ID. Build the URL:
   `https://zenithsports.org/cart/VARIANT_ID:1/checkout`
4. Set on Vercel (Production):
   ```
   NEXT_PUBLIC_ZENITH_SHOPIFY_BALL_CHECKOUT_URL  = https://zenithsports.org/cart/<BALL_VARIANT_ID>:1/checkout
   NEXT_PUBLIC_ZENITH_SHOPIFY_SOCKS_CHECKOUT_URL = https://zenithsports.org/cart/<SOCKS_VARIANT_ID>:1/checkout
   NEXT_PUBLIC_ZENITH_SHOPIFY_SHIRT_CHECKOUT_URL = https://zenithsports.org/cart/<SHIRT_VARIANT_ID>:1/checkout
   ```
5. Redeploy. Buttons auto-upgrade — no code change needed (resolver in
   `src/lib/shopify-express-checkout.ts` reads these on render).

---

## ⏰ Go-live (Ben + Paul, ~30 min start-to-finish)

### Step 1 — DNS flip (Paul, with Ben on the line, ~5 min)

Two paths:

**Path A — Paul does it himself:** Paul logs into his registrar
(Namecheap / GoDaddy / wherever tekky.org lives) and changes the
nameservers to:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Walk through on screen-share. Most registrars have a "Manage DNS" or
"Nameservers" section right on the domain page.

**Path B — Ben does it with Paul's login:** same steps, Ben drives.

After saving:

> "DNS propagation usually takes 5–30 minutes. Sometimes faster.
> Let's use that window to walk through the site one more time and
> I'll refresh tekky.org every couple minutes."

### Step 2 — Wait for propagation (Ben, 5–30 min)

Open tekky.org in incognito every 2–3 min. Check status from the
terminal:

```bash
nslookup tekky.org 8.8.8.8
```

Looking for the answer to include Vercel IPs (typically
`76.76.21.21` or similar 76.76.x.x range). Until then, tekky.org
still hits the old registrar.

In parallel: watch Vercel dashboard → Domains → tekky.org status
flip from "Pending" → "Valid Configuration". That's the green light.

### Step 3 — 12-point smoke test on tekky.org (~10 min)

Open in **incognito** so no cookies poison results:

1. **`https://tekky.org`** loads the Zenith showcase (NOT the BlueJays
   portfolio homepage). ✓
2. **`https://www.tekky.org`** also loads the showcase (Vercel handles
   www → apex redirect at the edge). ✓
3. **SSL certificate is valid** — green padlock, no "Not Secure"
   warning. ✓
4. **Hero CTA "SHOP THE TEKKY"** routes correctly. ✓
5. **`https://tekky.org/shop`** loads the shop page natively (not a
   301 to /, not a /clients/zenith-sports/shop URL in the address bar). ✓
6. **`https://tekky.org/training-guide`**, **`/build-your-player`**,
   **`/camps`**, **`/partners`** all load natively. ✓
7. **Shop "BUY ON ZENITH SPORTS" CTAs** route to zenithsports.org
   product (or express-checkout URL if env vars set) — NOT broken. ✓
8. **Inquiry form** posts successfully (test with a fake submission,
   confirm "thanks" state appears + Ben gets the email alert via
   sendEmailToWithAlert). ✓
9. **All product photos load** (no broken images, no alt text where
   photos should be). ✓
10. **Footer credit** says "Built by BlueJays" → bluejayportfolio.com
    (NOT bluejaywebdesign.com — old bug). ✓
11. **`https://tekky.org/llms.txt`** returns the Zenith llms.txt body
    (NOT a 301 to /, NOT the BlueJays-wide llms.txt). View source —
    should start `# Zenith Sports / TEKKY®`. ✓
12. **`https://tekky.org/sitemap.xml`** + **`/robots.txt`** return
    Zenith-only content (sitemap lists tekky.org URLs, robots
    references `Sitemap: https://tekky.org/sitemap.xml`). ✓

Bonus: **View page source on `https://tekky.org`** — should contain
3 `<script type="application/ld+json">` blocks for Organization +
WebSite + Products.

Any failure → screenshot the URL, note it, fix in real-time if small
(typos) or schedule a same-day patch.

### Step 4 — Confirm with Paul + Philip

> "You're live. Three things before we wrap:
>
> 1. Bookmark tekky.org and try it from your phone.
> 2. The owner portal lives at tekky.org/login if you ever want to
>    check leads from the contact form.
> 3. I'll have your full Phase 1 SEO audit + Google Search Console
>    setup link to you by end of week. Phase 2 (the AI Marketing
>    System) stays open at $10k whenever your inbound flow justifies
>    it — same scope we discussed."

---

## ⏰ Post-cutover admin (Ben, ~10 min)

1. **Memory update.** Open
   `~/.claude/projects/.../memory/project_zenith_tekky.md`. Set
   `status_updated: 2026-05-27` (or whatever day cutover lands).
   Replace pre-payment notes with the $997 payment confirmation +
   "LIVE on tekky.org as of <date> <time>".
2. **`memory/recent_locked_decisions.md`** — log the cutover entry.
3. **`memory/active_commitments.md`** — strike any Tekky cutover-prep
   items. Add Phase 1 follow-ups: Google Search Console setup,
   Google Analytics 4 property, ongoing SEO content cadence (if
   subscribed).
4. **`CLAUDE.md` Client Tenant Status table** — update zenith-sports
   row notes to add "LIVE tekky.org <date>".
5. **Submit tekky.org/sitemap.xml to Google Search Console** + Bing
   Webmaster Tools (5 min each).

---

## Anytime — troubleshooting

| Symptom | Fix |
|---|---|
| tekky.org still hits old registrar after 30 min | Confirm with Paul the nameservers were actually saved on the registrar side. Most failures here = "Paul changed it but didn't click Save." |
| tekky.org loads but shows BlueJays portfolio homepage instead of Zenith | Middleware rewrite isn't firing. Check `src/middleware.ts` — `tekky.org` entry uncommented? Deployed? Hard-refresh + clear cache. |
| tekky.org/shop 301s to tekky.org/ | The new multi-page subpath support didn't deploy. Check `src/middleware.ts` `CLIENT_DOMAIN_MAP["tekky.org"]` is the object form with `base` + `subpaths`. |
| tekky.org shows "Invalid Configuration" in Vercel | Nameservers set wrong. Double-check Paul typed `ns1.vercel-dns.com` + `ns2.vercel-dns.com` exactly. |
| SSL cert error | Let Vercel finish provisioning — auto-issues within 30 min of nameservers propagating. If still failing after 1 hour, Vercel domain settings → request new cert. |
| tekky.org/llms.txt serves the BlueJays portfolio body | Middleware allowlist missing /llms.txt. Verify `subpaths` array in middleware. |
| Inquiry form submits but Ben never gets the email | Check `src/app/api/clients/inquire/route.ts` SLUG_CONFIG entry → `clientEmail` = `info@zenithsports.org`. Verify SendGrid hasn't suppressed the address (per Rule 42). |

---

## Materials checklist (pre-flight EOD)

- [ ] tekky.org + www.tekky.org added to Vercel project domains
- [ ] Latest production deploy includes JSON-LD + middleware + footer fix
- [ ] Pre-DNS smoke test passed on bluejayportfolio.com/clients/zenith-sports/*
- [ ] Paul confirmed when he can flip DNS
- [ ] (Optional) Express checkout variant IDs grabbed from Shopify admin
- [ ] Calendar blocked for the go-live window
- [ ] This runbook + smoke-test URLs open on a second screen

If all 7 are checked, you're ready to flip whenever Paul says go.

---

Last updated: 2026-05-27 — superseded the prior sunday-cutover.md.
Maintained at: `bluejays/docs/clients/zenith-sports/tekky-cutover.md`
