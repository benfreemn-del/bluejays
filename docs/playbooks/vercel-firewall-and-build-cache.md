# Vercel Firewall + Build-Cache Playbook

Two Vercel operational gotchas that bit us on the wave-1 launch (2026-05-18). Both are infrastructure-level — they make code seem broken when it isn't. Read this when an API call fails with non-JSON response, a 403, or stale function behavior.

## 1. Vercel WAF / Firewall — auto-challenge of your own traffic

Vercel ships a default "System Rule" firewall layer (DDoS Mitigation + Bot Protection) that can challenge YOUR OWN home IP if you hit any single path more than ~300 times in 15 minutes. We tripped it once with 516 hits to `/clients/bloodlines` in a 15-min window — Vercel started serving the JS-based Security Checkpoint challenge to every request from our IP, including legitimate API calls from `bj` CLI.

### Detection

If you see:

```
error: non-JSON response (HTTP 403) ... <!DOCTYPE html ... Vercel Security Checkpoint
```

Or curl returns:

```
HTTP/1.1 403 Forbidden
X-Vercel-Mitigated: challenge
```

Vercel's WAF has decided your traffic looks suspicious. Verify with:

```bash
curl -sI "https://bluejayportfolio.com/" | grep -i x-vercel-mitig
```

If `X-Vercel-Mitigated: challenge` appears, you're being WAF-blocked.

### Diagnosis

Dashboard → bluejays project → **Firewall** → **Logs** (or **Observability**). Filter to the last 30 min. Each entry shows:
- **Action**: `challenge` / `block` / `allow`
- **Action Type**: `System Rule` (Vercel's built-in) vs `Custom Rule` (yours)
- **Top Request Paths**: which URLs got hit and how many times — surfaces what tripped the rule

System Rule firings cannot be disabled directly. The fix is to add a Custom Rule that runs BEFORE the System Rule and allows your traffic.

### Permanent fix — custom allow rules (NON-NEGOTIABLE setup)

Two rules. Both must be at the TOP of the rule list — Vercel evaluates top-down and stops at the first match.

**Rule 1 — IP allowlist (operator's home IP):**
- Name: `Allow Ben home IP`
- If: `IP Address` `is` `<your.public.ip>` (find with `curl ifconfig.me`)
- Then: `Allow`

**Rule 2 — CLI User-Agent bypass (durable across IP changes):**
- Name: `Allow BlueJaysCLI`
- If: `User Agent` `contains` `BlueJaysCLI`
- Then: `Allow`

Rule 2 is the durable one — `scripts/bj.mjs` sets `User-Agent: BlueJaysCLI/1.0 (Node.js; +https://bluejayportfolio.com/dashboard/ai-activity)` on every API request. Even if your home IP changes (dynamic IPs rotate), the UA stays constant.

### Rules going forward

- **Never raise a non-IP-bound rule above an IP-bound rule.** Rule priority is everything; broader-scope rules below narrower-scope rules cause confusing partial mitigation.
- **When in doubt about why a CLI fails with 403 + HTML response: check the Firewall Logs FIRST.** Don't waste cycles debugging the API code if the request never reached the function.
- **System rules can re-escalate.** If you push >300 hits/15min to a single path again (e.g., a tab auto-refreshing, a polling component you forgot to clean up), the System rule will challenge again — but your Custom Allow rule will short-circuit for legit traffic. Investigate the source of the spike and clean up before the noise pollutes your firewall stats.

## 2. Vercel build cache — serving stale function code after a deploy

The default Vercel deploy pipeline reuses incremental build cache. Normally that's fine and saves 60-90 seconds. But occasionally the cache returns stale compiled output for a module even though the source changed.

We hit this on the wave-1 launch: after fixing the `readAssetBytes()` function from `fs.readFile` to `fetch()`, the deploy showed Ready + Current, but the runtime function kept throwing the OLD `fs.readFile` error format. Pushing additional commits didn't help — the cache stayed stuck.

### Detection

The smoking gun is when error messages don't match the current source code. Example: source uses `fetch()` and throws `asset fetch https://...: HTTP XXX`, but the production response says `read public/...: ENOENT`. That's the OLD code path running. The source on master is correct, the deploy is "successful", and yet the live function is stale.

### Fix — force a clean rebuild

1. Vercel Dashboard → bluejays project → **Deployments** tab
2. Click the current production deploy
3. Top-right `...` menu → **Redeploy**
4. **UNCHECK** the box that says **"Use existing Build Cache"**
5. Click **Redeploy**

A no-cache rebuild takes 3-10 minutes (vs 90 seconds with cache) because it re-installs `node_modules`, recompiles every TypeScript file, and re-builds every Next.js route from scratch. Necessary occasionally.

### Backup workaround — content-changing empty commit

If you can't access the Vercel dashboard quickly, push an empty commit AND a small comment change to a file in the affected module. The file-level hash change forces Next.js to invalidate its module cache for that file. Just `--allow-empty` alone doesn't always trigger module-cache invalidation — change a line.

### Prevention going forward

- **Don't push 5 commits in 30 seconds.** Vercel's deploy queue can skip-build commits in favor of newer ones, which sometimes correlates with cache wedging. Push fixes in a single logical commit.
- **When debugging "the fix isn't live": look at the production error format vs the current source code FIRST.** If they don't match, you're chasing the wrong target — the issue is the deploy, not the code.

## Related rules already in CLAUDE.md

- **"Exclude /public from Vercel function trace"** rule (in CLAUDE.md "Deployment Rules" section) — `next.config.ts` `outputFileTracingExcludes["*"]` includes `"./public/**"`. This is why `fs.readFile` on `/public/...` paths from a serverless function fails — those files are NEVER bundled with the function. Always fetch over HTTPS from the deployed CDN URL instead.
- **"NEXT_PUBLIC env unreliability"** rule — hardcode the production base URL as the literal fallback. Vercel preview deploys have unreliable `NEXT_PUBLIC_*` resolution; using a hardcoded `https://bluejayportfolio.com` is more reliable than `process.env.NEXT_PUBLIC_BASE_URL`.
