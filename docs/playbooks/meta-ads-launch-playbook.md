# Meta Ads Launch Playbook

Hard-won knowledge from the wave-1 launch (2026-05-18). Read this BEFORE launching any new wave through the `bj meta launch <wave>` CLI or before adding a new Meta-API integration. Eight specific gotchas in here would have saved ~4 hours of debugging on wave-1; don't relearn them on wave-2.

The orchestrator code lives at `src/lib/meta-ads-launch.ts`. The spec lives at `src/lib/ads-spec/<wave>.ts`. The CLI is wired through `scripts/bj.mjs meta launch <wave>` and the API at `src/app/api/meta/launch/route.ts`.

## Phased architecture (NON-NEGOTIABLE)

Every wave runs in 2 phases, persisted to `meta_launches` table (Supabase) keyed by `wave`:

1. **Phase 1 — Skeleton (`--phase skeleton`):** create campaign + ad sets, all PAUSED. No assets needed. Lands in seconds.
2. **Phase 2 — Ads (`--phase ads`):** upload images + videos to Meta, create creatives, create ads. Takes 5-15 min depending on video processing. Requires images + videos in `public/ad-assets/<wave>/` and `public/audit-assets/`.

Default `bj meta launch <wave>` (no flag) runs both. `--phase reset` deletes the campaign and clears the row for a fresh start. `--phase ads` skips skeleton (errors if no campaign_id yet). Idempotent — re-running skips hooks where `ads_state[hook_id].ad_id` is already set.

## Pre-flight checklist (verify ALL before running `bj meta launch <wave>`)

Eight items. Failing to confirm any one of these is what makes the launch fail in production. Order matters — verify top-to-bottom.

### 1. Vercel env vars (required for Phase 2)

- [ ] `META_ADS_SYSTEM_TOKEN` — long-lived system user access token from Business Settings → System Users → Generate New Token. Scopes: `ads_read` + `ads_management` + `pages_manage_ads` + `instagram_basic` + `instagram_content_publish`. Expires every 60 days — set a calendar reminder.
- [ ] `META_ADS_ACCOUNT_ID` — `act_XXX` format (or raw numeric — code prepends `act_` if missing).
- [ ] `META_ADS_PAGE_ID` — numeric FB Page ID. Find via Meta Business Suite → Settings → Accounts → Pages → click the page → "Page ID" is shown there. **Phase 2 will fail with a clear error if missing.**
- [ ] `META_ADS_INSTAGRAM_ACTOR_ID` — recommended but optional. Without it, IG placements render as cross-posts from FB rather than native IG. Find via Meta Business Suite → Settings → Accounts → Instagram accounts → click account → "Instagram account ID".
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — the Pixel ID, used for `optimization_goal: OFFSITE_CONVERSIONS` on ad sets. Without it, ad sets won't optimize for Lead events.
- [ ] `META_CAPI_ACCESS_TOKEN` — for server-side Conversions API. Generate via Events Manager → Data Sources → click the Pixel → Settings → Conversions API → Generate Access Token. Without it, CAPI calls no-op with a console.warn (won't break anything, just falls back to client-Pixel-only attribution, which loses ~30% of conversions).

### 2. Meta App in LIVE mode

Phase 2 fails on every ad-creative create with `code=100 / subcode=1885183`:
> "Ads creative post was created by an app that is in development mode. It must be in public to create this ad."

**Fix:** https://developers.facebook.com/apps/ → pick the app tied to the system user → top toolbar `App Mode: Development` → flip to **Live** (green toggle).

Meta gates this on: Privacy Policy URL (`https://bluejayportfolio.com/privacy`), Terms URL (`https://bluejayportfolio.com/terms`), App Icon (1024×1024 PNG), Category. Have all four ready before clicking.

### 3. System user has Page + IG asset permissions

Phase 2 fails with `code=10 / subcode=1341012`:
> "Application does not have permission for this action / You don't have required permission to access this profile."

**Fix:** https://business.facebook.com/settings/ → Users → System Users → click the system user (e.g. "BlueJays Hyperloop") → right-side **Add Assets** button. Repeat for each asset:
1. **Pages tab** → check the Page → permission level: **Full control** (or at minimum `Create content` + `Manage Page`)
2. **Instagram accounts tab** → check the IG account → **Full control** (or `Create content`)
3. **Ad accounts tab** → confirm the ad account is listed with `Manage campaigns`

### 4. `targeting_automation.advantage_audience` set on every ad set

Phase 1 fails on every ad-set create with `code=100 / subcode=1870227`:
> "To create your ad set, you need to enable or disable the Advantage audience feature. This can be done by setting the advantage_audience flag to either 1 or 0 within the targeting_automation field in the targeting spec."

The orchestrator now injects `targeting_automation: { advantage_audience: 0 }` automatically into every ad set targeting payload. **Default to 0** (disabled) because the workflow is: skeleton lands with seed interests, you refine targeting manually in Ads Manager, then unpause. Auto-expansion would override the hand-tuned interests.

If a future wave wants Advantage+ enabled by default for that audience, override per-ad-set in the spec; otherwise leave it at 0.

### 5. Video creatives need a thumbnail (`image_url` or `image_hash`)

Phase 2 fails on every video ad with `code=100 / subcode=1443226`:
> "Please specify one of image_hash or image_url in the video_data field of object_story_spec."

The orchestrator auto-fetches Meta-generated thumbnails after the video processes via `GET /{video_id}/thumbnails?fields=uri,is_preferred`, picks the preferred one, and passes its `uri` as `image_url`. Helper: `getVideoThumbnailUrl(cfg, videoId)` in `meta-ads-launch.ts`. **Do not remove this call** — Meta's API rejects video creatives without it as of May 2025.

### 6. Static assets must be fetchable from `https://bluejayportfolio.com/<path>`

Phase 2 fails on every image/video upload with `ENOENT: no such file or directory, open '/var/task/public/...'`.

**Root cause:** `next.config.ts` excludes `public/**` from the function trace (per CLAUDE.md's "Exclude /public from Vercel function trace" rule — keeps the deploy under 250MB). At function runtime, `/var/task/public/...` doesn't exist — assets are served by Vercel CDN, not bundled.

**Fix in code:** `readAssetBytes()` in `meta-ads-launch.ts` fetches over HTTPS from `https://bluejayportfolio.com/<path>` instead of `fs.readFile`. Base URL is hardcoded (per the NEXT_PUBLIC env unreliability rule).

**Operational requirement:** confirm every asset_path in your wave spec is accessible on production BEFORE running `--phase ads`:

```powershell
curl -sI "https://bluejayportfolio.com/ad-assets/wave-N/mfg-pain-1x1.jpg"
# Expect: HTTP/1.1 200 OK
# If 404: the file was never committed/pushed, or path is wrong.
```

### 7. Vercel deploy must be COMPLETED for the latest commit

The error message can mislead you here. If the function code on Vercel is stale, Phase 2 throws errors that look like local bugs.

**The tell:** when the orchestrator runs an OLD version of the code, the error messages match an older code path. Example: after the disk-read → HTTPS-fetch fix, an old-code response would say `read public/...: ENOENT` (Node fs.readFile error), while new-code response says `asset fetch https://...: HTTP XXX`. Always glance at the error format — does it match the current source code?

If the function is stale even after the deploy shows Ready: force a clean rebuild via Vercel Dashboard → Deployments → top deploy → `...` menu → **Redeploy** → **UNCHECK** "Use existing Build Cache". Takes 3-10 min for a no-cache rebuild (vs 90s cached) but bypasses any stale-compile issues.

### 8. Vercel firewall allowlist for the CLI

When running the CLI from your own machine, Vercel's WAF (System Rule: DDoS Mitigation, Bot Protection) can challenge your traffic. The bj.mjs CLI sets `User-Agent: BlueJaysCLI/1.0` to identify itself.

**Firewall rule (one-time setup, durable):**
1. Vercel Dashboard → bluejays project → **Firewall** → **Rules** → **Add Rule** (or **Custom Rules** → New)
2. Rule: Name=`Allow BlueJaysCLI`, If=`User Agent` `contains` `BlueJaysCLI`, Then=`Allow`
3. Drag the rule to the TOP of the list — system rules evaluate after custom rules

Add a backup IP allowlist for your home IP too (`Allow Ben home IP`, condition `IP Address is <your.ip>`, action Allow). UA-based rule is durable across IP changes; IP rule is the belt-and-suspenders.

**Detection:** if `bj` returns `error: non-JSON response (HTTP 403) ... <!DOCTYPE html ... Vercel Security Checkpoint`, the firewall is mitigating your traffic. Verify with: `curl -sI "https://bluejayportfolio.com/" | grep -i x-vercel-mitig`. If `X-Vercel-Mitigated: challenge` shows, fix the firewall rule.

## CLI commands

```powershell
$env:BJ_BASE_URL="https://bluejayportfolio.com"

# Default — runs Phase 1 then Phase 2 sequentially
node scripts/bj.mjs meta launch wave-N

# Phase 1 only — campaign + ad sets, no assets needed
node scripts/bj.mjs meta launch wave-N --phase skeleton

# Phase 2 only — uploads + creatives + ads (errors if campaign_id missing)
node scripts/bj.mjs meta launch wave-N --phase ads

# Reset — deletes campaign, clears the row, lets you start over
node scripts/bj.mjs meta launch wave-N --phase reset

# Status — confirms env wiring + system user permissions + Pixel binding
node scripts/bj.mjs meta status wave-N
```

## Post-launch — verify Meta ↔ BlueJays integration

After ads go LIVE:

1. **Pixel verification:** Open `https://bluejayportfolio.com/audit?utm_audience=mfg&utm_content=mfg-pain` in incognito. Install Meta Pixel Helper extension. Confirm `PageView` fires immediately and `Lead` fires after form submit.
2. **CAPI verification:** Events Manager → Data Sources → Pixel → Test Events tab → enter test event code → submit the form → confirm both client + server events arrive within 30s.
3. **UTM capture:** check the submitted prospect's `scraped_data` in Supabase — should contain `utm_audience`, `utm_content`, `utm_campaign`, `fbclid`.
4. **Madie surfacing:** confirm the lead appears in Madie's queue with proper attribution chips.

## Iteration cadence (after wave goes live)

- **Day 1-2:** DO NOT touch the ads. Meta needs ~24-48h to exit learning phase. Killing early breaks the algorithm.
- **Day 3:** Ads Manager → sort by Cost per Lead ascending. Pause the bottom 2-3 (keep, don't delete — preserves data).
- **Day 4-5:** Kaleidoscope the top winners. 20 HyperAgent variants of the winning hook (per Hormozi: `reference_hormozi_joel_frameworks.md`).
- **Day 7:** Compare CPL by audience. Double budget on lowest-CPL audience. Drop the others.

## Reference assets — wave-1 launch artifacts

Don't change these without re-reading; they're the source of truth for the validated launch shape.

- `src/lib/ads-spec/wave-1.ts` — the wave-1 spec (3 audiences × 4 hooks each = 12 ads)
- `src/lib/meta-ads-launch.ts` — orchestrator (~1200 lines, Phase 1 + Phase 2)
- `src/lib/meta-ads-client.ts` — insights pull client (Hyperloop reads back ad performance)
- `src/lib/server-conversions.ts` — `fireMetaCapi()` helper for server-side Lead/Purchase/Schedule events
- `src/app/api/meta/launch/route.ts` — API route the CLI hits
- `src/app/api/audit/submit/route.ts` — where audit Lead events fire (client Pixel + server CAPI)
- `supabase/migrations/20260518_meta_launches.sql` + `20260518_meta_launches_ads_state.sql` — state-tracking schema
