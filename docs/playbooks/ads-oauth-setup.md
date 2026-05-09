# Ad-platform OAuth setup playbook

The code half is shipped. This doc covers the **manual provisioning**
Ben must do in each platform's console BEFORE owner Connect buttons
work.

## Quick status check

Open `/dashboard` → Settings tab → top panel. Every required env var
is listed with ✓ (set) or ✗ (missing). If you see ✗ on `GOOGLE_ADS_*`
or `META_ADS_*`, the corresponding Connect button on tenants' Ads tab
will fall back to filing a Ben-task instead of opening real OAuth.

## Platform setup (in this order)

### 1. AD_OAUTH_KEY (do this first — every platform needs it)

A 32-byte secret used to encrypt refresh tokens at rest in the
`client_ad_accounts.refresh_token_encrypted` column. Without this,
no OAuth handshake completes.

Generate one and add to Vercel env:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Vercel → bluejays → Settings → Environment Variables → Add:
- Key: `AD_OAUTH_KEY`
- Value: (paste the output)
- Scope: Production + Preview + Development

### 2. Google Ads

1. **Google Cloud Console** → APIs & Services → Library → search
   "Google Ads API" → Enable.
2. **APIs & Services → OAuth consent screen** → External user type.
   Fill app name, user support email, developer contact. Add scopes
   later in step 4.
3. **APIs & Services → Credentials** → Create Credentials → OAuth
   2.0 Client ID → Application type: Web application.
   - Name: `BlueJays`
   - Authorized redirect URI: `https://bluejayportfolio.com/api/oauth/google_ads/callback`
   - Add a second URI for preview deploys if you need: `https://*-bluejays.vercel.app/api/oauth/google_ads/callback`
4. **OAuth consent screen → Edit App** → Add scope:
   `https://www.googleapis.com/auth/adwords`. Save.
5. **Apply for a developer token**:
   - Sign in to a Google Ads account at ads.google.com
   - Tools → API Center → Apply for access. Takes ~3 days for review.
   - Status moves Test Account → Basic Access → Standard Access.
6. **Set Vercel env vars**:
   - `GOOGLE_ADS_CLIENT_ID` = the OAuth client ID
   - `GOOGLE_ADS_CLIENT_SECRET` = the OAuth client secret
   - `GOOGLE_ADS_DEVELOPER_TOKEN` = once approved
7. Redeploy. Verify the EnvStatusPanel shows ✓ on all three.

### 3. Meta Ads (Facebook + Instagram)

1. **developers.facebook.com** → My Apps → Create App → Type: Business.
   Name: `BlueJays`.
2. **Add Product → Marketing API** → Set up.
3. **Settings → Basic** → Copy App ID + App Secret.
4. **App Settings → Add Platform → Website** → Site URL:
   `https://bluejayportfolio.com`.
5. **Marketing API → Tools → Token Generator** → Add OAuth redirect:
   `https://bluejayportfolio.com/api/oauth/meta_ads/callback`.
6. **App Review → Permissions and Features** → Request:
   - `ads_read` (read ad accounts)
   - `ads_management` (modify ads — required for status changes)
   - Submit for review (takes ~1 week, requires screencasts +
     justification).
7. **Set Vercel env vars**:
   - `META_ADS_APP_ID`
   - `META_ADS_APP_SECRET`
8. Redeploy. EnvStatusPanel verifies.

### 4. Lob (direct mail postcards)

Lob doesn't OAuth — single API key.

1. **lob.com** → Sign up / sign in.
2. **Account Settings → API Keys** → Create a Live Production key.
3. **Vercel env**: `LOB_API_KEY` = the live key.
4. Redeploy.

(Test keys won't actually print/mail — they validate the request and
return a fake tracking number. Use them in dev / preview deploys.)

### 5. Twilio (per-tenant numbers)

For OIT specifically — `OIT_TWILIO_NUMBER`:

1. **Twilio Console** → Phone Numbers → Buy a Number.
2. Search for a number in OIT's area code (360 — Olympic Peninsula).
3. **Configure**:
   - Voice → Webhook → `https://bluejayportfolio.com/api/voice/incoming`
   - Messaging → Webhook → `https://bluejayportfolio.com/api/inbound/sms`
4. **Vercel env**: `OIT_TWILIO_NUMBER` = the new number in `+1XXXXXXXXXX` format.
5. Redeploy. OIT funnel SMS steps will start firing immediately.

Same pattern for `ZENITH_TWILIO_NUMBER` when Philip's number is provisioned.

### 6. SendGrid DKIM

Funnel emails currently send from `ben@bluejayportfolio.com` with a
display-name override. To send from `hello@olympicinspections.com`
with proper authentication:

1. **SendGrid → Settings → Sender Authentication** → Authenticate
   Your Domain → `olympicinspections.com`.
2. SendGrid generates 3 CNAME records.
3. **Namecheap → olympicinspections.com → Advanced DNS** → Add the 3
   CNAMEs.
4. Wait ~30 min for DNS propagation, then click Verify in SendGrid.
5. Once verified, change OIT's funnel `from_email` in
   `src/lib/client-funnels/registry.ts` to `hello@olympicinspections.com`.

## After provisioning

Open `/dashboard` → Settings → EnvStatusPanel. Click "Show all" and
verify the previously-missing vars are now ✓. Then have Luke / Philip
hit their Connect button on the Ads tab — they should redirect to
the platform's OAuth screen instead of filing a Ben-task.

## Security notes

- Refresh tokens stored encrypted (pgp_sym_encrypt) in
  `client_ad_accounts.refresh_token_encrypted` using `AD_OAUTH_KEY`.
- The `ad_account_get_token` RPC is `security definer` and granted
  only to `service_role` — never to anon or authenticated SDK clients.
- `state` parameter on every OAuth init is HMAC-signed with
  `AD_OAUTH_KEY` (or fallback `NEXTAUTH_SECRET`) so a replay attack
  with a stolen state value fails verification.
- OAuth callbacks are middleware-whitelisted (third-party redirects
  arrive without our cookie), but the state-signature check is the
  real security boundary.

## When OAuth fails

Owner sees a redirect to `/dashboard?ads_oauth=error&platform=X&msg=Y`
or `/clients/SLUG/portal?tab=ads&ads_oauth=success`. The dashboard +
portal handle the flash params (Phase 2 — currently the params land
but no banner renders. Add a flash banner reading from URL params on
next pass).
