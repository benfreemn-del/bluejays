#!/usr/bin/env node
// @ts-check

/**
 * bj — BlueJays admin CLI
 *
 * Wraps the most-used admin operations into a 200-token-output CLI so
 * Claude (and Ben from the terminal) can run admin work without
 * burning 5K tokens reading dashboard pages.
 *
 * Architecture rule: CLI > API > MCP for agent-consumed integrations.
 * See .claude/commands/build-cli.md for the why.
 *
 * Subcommands:
 *   bj leads list [--client SLUG] [--limit N]
 *       List recent leads, one per line.
 *
 *   bj clients
 *       List active clients with open task counts.
 *
 *   bj tasks list [--client SLUG] [--status STATUS]
 *       List client tasks, one per line.
 *
 *   bj costs ledger
 *       Print active recurring costs sorted by amount.
 *
 *   bj costs add SERVICE AMOUNT [--note "..."]
 *       Add a one-off cost row to system_costs.
 *
 *   bj signals tail [--target NAME] [--limit N]
 *       Tail the agent_signals event bus (unread first).
 *
 *   bj signals emit SOURCE KIND TITLE [--severity LEVEL] [--target NAME]
 *       Emit a signal. Useful for testing handoffs.
 *
 *   bj impersonate SLUG
 *       Print the URL to open the client portal as that owner.
 *
 *   bj watchdog run
 *       Trigger the customer-watchdog cron once.
 *
 *   bj digest preview
 *       Render today's daily digest without sending the SMS.
 *
 *   bj ai <skill> [--arg value]... [--json]
 *       Invoke a bj ai agentic skill (manual trigger). Skills live at
 *       .claude/skills/ai-<skill>/. Output: skill's `summary` line plus
 *       cost/latency footer. Pass --json to print the full SkillResult.
 *       Added 2026-05-17 (Day 1 of the agentic skill layer).
 *
 *   bj ads checklist
 *       Print the Wave-1 FB Ads pre-launch checklist + manual
 *       steps Ben must do (Meta BM setup, image gen, upload).
 *       Pure stdout — no API calls. Lives in this CLI so Ben can
 *       run it on his phone via terminal-share.
 *
 *   bj ads urls
 *       Print all 12 Wave-1 ad destination URLs (3 audiences ×
 *       4 hooks) ready to paste into Meta Ads Manager. Each URL
 *       includes the correct utm_audience + utm_content tags.
 *
 *   bj outbox list [--limit N]
 *       List pending bj ai draft-touch drafts waiting for approval.
 *       One row per draft: short_code, age, business, subject preview.
 *
 *   bj outbox approve <short_code>
 *       Approve + send a pending draft. Same code path as the
 *       dashboard one-tap button + SMS reply "YES <code>".
 *
 *   bj outbox reject <short_code>
 *       Reject a pending draft. Terminal — can't be un-rejected.
 *
 *   bj meta status
 *       Verify the Meta Marketing API connection end-to-end:
 *       env vars set → token valid → ad account reachable →
 *       last-7d insights pull → pixel resolves. One-line summary
 *       per check. Use after rotating the system user token or
 *       any META_ADS_* env var change.
 *
 *   bj meta launch <wave-name> [--phase skeleton|ads|reset] [--status]
 *       Programmatic Meta Marketing API launcher. Phase 1
 *       (skeleton, default) creates campaign + 3 ad sets in PAUSED
 *       state. Phase 2 (ads) uploads creatives + creates ads — lands
 *       after HyperAgent images are in /public/ad-assets/<wave>/.
 *       --phase reset deletes the campaign + clears the row, useful
 *       when the spec changes objective and Meta locks reuse.
 *       --status reads the meta_launches row without running.
 *       Idempotent — safe to re-run after partial failures.
 *
 * Output convention: short, human-readable, one row per line. No JSON
 * dumps unless --json is passed. Default stays under ~500 chars per
 * invocation so the agent context stays clean.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Env loader (no dep — read .env.local for SUPABASE creds + admin keys) ───
function loadEnv() {
  try {
    const txt = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // optional — env may already be set
  }
}
loadEnv();

const BASE_URL = process.env.BJ_BASE_URL || "http://localhost:3001";
const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || "";

// ─── Supabase REST helper (no SDK dep — fetch direct) ───
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function sb(path, opts = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase env not configured (.env.local)");
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.method === "POST" ? "return=representation" : "",
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`supabase ${r.status}: ${txt.slice(0, 200)}`);
  }
  return r.json();
}

/**
 * Default headers — User-Agent + Accept hint help bypass Vercel's
 * default WAF rules that flag undici/node-fetch UAs as bot traffic.
 * Adds these only if the caller hasn't already set them.
 */
const DEFAULT_HEADERS = {
  "user-agent":
    "BlueJaysCLI/1.0 (Node.js; +https://bluejayportfolio.com/dashboard/ai-activity)",
  accept: "application/json",
};

/**
 * Safe JSON fetcher — wraps `await r.json()` in a try/catch so a
 * non-JSON response (Vercel bot-challenge HTML, deploy-in-progress
 * 404 page, gateway 502, etc.) surfaces a clear error instead of an
 * "Unexpected token '<'" JSON-parse exception.
 */
async function fetchJson(url, opts = {}) {
  const headers = { ...DEFAULT_HEADERS, ...(opts.headers || {}) };
  const r = await fetch(url, { ...opts, headers });
  const text = await r.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    const looksLikeHtml = text.trim().startsWith("<");
    const hint = looksLikeHtml
      ? r.status === 404
        ? "endpoint not on this deploy yet — wait 30-60s for Vercel to finish rolling"
        : "looks like Vercel's bot-challenge or a gateway error — retry in 30s"
      : "response wasn't JSON";
    throw new Error(
      `non-JSON response (HTTP ${r.status}) · ${hint} · first 80 chars: ${text.slice(0, 80).replace(/\s+/g, " ")}`,
    );
  }
  return { status: r.status, j };
}

// ─── Subcommands ───
const commands = {
  async "leads:list"(args) {
    const client = args["--client"];
    const limit = args["--limit"] || "10";
    const filter = client ? `&client_slug=eq.${client}` : "";
    const rows = await sb(
      `client_leads?select=id,client_slug,name,email,audience,status,created_at&order=created_at.desc&limit=${limit}${filter}`,
    );
    if (rows.length === 0) return "no leads";
    return rows
      .map(
        (r) =>
          `${r.created_at.slice(0, 10)} · ${r.client_slug} · ${r.name || "(no name)"} <${r.email || "—"}> · ${r.audience || "—"} · ${r.status}`,
      )
      .join("\n");
  },

  async "clients"() {
    const rows = await sb(
      `client_owners?select=client_slug,email,name&order=client_slug.asc`,
    );
    if (rows.length === 0) return "no clients";
    return rows
      .map((r) => `${r.client_slug} · ${r.name || "—"} · ${r.email}`)
      .join("\n");
  },

  async "tasks:list"(args) {
    const client = args["--client"];
    const status = args["--status"] || "pending,in_progress,blocked";
    const filter = client ? `&client_slug=eq.${client}` : "";
    const statusList = status.split(",").map((s) => `"${s}"`).join(",");
    const rows = await sb(
      `client_tasks?select=client_slug,title,owner,priority,status&status=in.(${statusList})&order=priority.desc&limit=30${filter}`,
    );
    if (rows.length === 0) return "no tasks";
    return rows
      .map(
        (r) =>
          `[${r.status}] ${r.priority.toUpperCase().padEnd(7)} ${r.client_slug} · ${r.owner} · ${r.title}`,
      )
      .join("\n");
  },

  async "costs:ledger"() {
    const rows = await sb(
      `recurring_costs?select=service,monthly_cost_usd,active&active=eq.true&order=monthly_cost_usd.desc`,
    );
    if (rows.length === 0) return "no active costs";
    const total = rows.reduce(
      (s, r) => s + parseFloat(r.monthly_cost_usd || 0),
      0,
    );
    const lines = rows.map(
      (r) =>
        `$${parseFloat(r.monthly_cost_usd).toFixed(2).padStart(8)} · ${r.service}`,
    );
    lines.push(`---`);
    lines.push(`$${total.toFixed(2).padStart(8)} · TOTAL MONTHLY BURN`);
    return lines.join("\n");
  },

  async "costs:add"(args, positional) {
    const [service, amount] = positional;
    if (!service || !amount) {
      return "usage: bj costs add SERVICE AMOUNT [--note '...']";
    }
    const note = args["--note"] || "";
    await sb(`system_costs`, {
      method: "POST",
      body: JSON.stringify({
        service,
        cost_usd: parseFloat(amount),
        note,
      }),
    });
    return `logged $${amount} to ${service}`;
  },

  async "signals:tail"(args) {
    const target = args["--target"];
    const limit = args["--limit"] || "10";
    const filter = target ? `&target=eq.${target}` : "";
    const rows = await sb(
      `agent_signals?select=created_at,source,kind,severity,client_slug,title,read_at&order=created_at.desc&limit=${limit}${filter}`,
    );
    if (rows.length === 0) return "no signals";
    return rows
      .map((r) => {
        const flag = r.read_at ? "✓" : "•";
        return `${flag} ${r.created_at.slice(11, 19)} ${r.severity.padEnd(6)} ${r.source} → ${r.title}`;
      })
      .join("\n");
  },

  async "signals:emit"(args, positional) {
    const [source, kind, ...titleParts] = positional;
    const title = titleParts.join(" ");
    if (!source || !kind || !title) {
      return "usage: bj signals emit SOURCE KIND TITLE [--severity LEVEL] [--target NAME]";
    }
    await sb(`agent_signals`, {
      method: "POST",
      body: JSON.stringify({
        source,
        kind,
        title,
        severity: args["--severity"] || "info",
        target: args["--target"] || null,
      }),
    });
    return `emitted ${source}/${kind}: ${title}`;
  },

  async "impersonate"(_args, positional) {
    const [slug] = positional;
    if (!slug) return "usage: bj impersonate SLUG";
    return `${BASE_URL}/api/admin/impersonate-client?slug=${encodeURIComponent(slug)}`;
  },

  async "watchdog:run"() {
    const r = await fetch(`${BASE_URL}/api/cron/customer-watchdog`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET || ""}` },
    });
    const j = await r.json();
    if (j.message) return j.message;
    return `${j.anomalies?.length || 0} anomalies across ${j.clients || 0} clients`;
  },

  async "digest:preview"() {
    const r = await fetch(`${BASE_URL}/api/digest?send=false`);
    const j = await r.json();
    return j.digest || "(empty digest)";
  },

  async "social:list"(args) {
    const filter = args["--filter"] || "open";
    const r = await fetch(`${BASE_URL}/api/social-leads?filter=${filter}`);
    const j = await r.json();
    if (!j.ok || !j.leads || j.leads.length === 0) return "no social leads";
    return j.leads
      .slice(0, 20)
      .map((l) => {
        const flag = l.status === "drafted" ? "•" : l.status === "sent" ? "→" : "✓";
        const summary = (l.classification_summary || l.raw_text).slice(0, 80);
        return `${flag} ${l.platform.padEnd(9)} ${(l.intent || "?").padEnd(18)} ${summary}`;
      })
      .join("\n");
  },

  /**
   * `bj ads checklist` — pure-stdout printout of the FB Ads Wave-1
   * pre-launch checklist + manual steps. No API calls, no auth
   * required. Lives in this CLI so Ben can run it from his phone via
   * terminal-share without opening the doc.
   */
  async "ads:checklist"() {
    return [
      "═══ FB Ads Wave 1 — Launch Checklist ═══",
      "",
      "Manual setup (Ben — must be done in browser, ~30 min):",
      "  1. Meta Business Manager → Add System User 'BlueJays Hyperloop'",
      "     → Generate token w/ ads_read + ads_management scopes",
      "  2. Vercel env vars (Settings → Environment Variables):",
      "       NEXT_PUBLIC_META_PIXEL_ID  = <16-digit pixel id>",
      "       META_ADS_SYSTEM_TOKEN      = <EAAxxxx... from step 1>",
      "       META_ADS_ACCOUNT_ID        = act_<your ad account id>",
      "  3. Trigger a Vercel redeploy after env vars land",
      "",
      "Pre-launch verify (8 items — see docs/templates/cold-traffic-ad-creatives.md):",
      "  1. Pixel set on Vercel              [ ]",
      "  2. PageView fires on /audit         [ ]",
      "  3. Lead fires on form submit        [ ]",
      "  4. Events Manager sees them         [ ]",
      "  5. Campaign optimizes for Lead      [ ]",
      "  6. All 12 ad URLs route correctly   [ ]",
      "  7. utm_audience pre-selects toggle  [ ]",
      "     test: /audit?utm_audience=dtc → 'I run a DTC brand' selected",
      "  8. 24 HyperAgent images ready       [ ] (1:1 + 9:16 per Feed hook)",
      "",
      "Asset prep (Ben + HyperAgent, ~1-2 hrs):",
      "  · Image prompts: see the doc, 8 Feed prompts (4 hooks × 2 ICPs of static)",
      "  · Trim VSL #2 to 15-sec Story version (use ffmpeg cut at 0:00-0:15)",
      "  · VSL #1 (19MB, 9:16) uploads as-is to Reels — already in /public/audit-assets/",
      "",
      "Upload sequence (Meta Ads Manager, ~1 hr):",
      "  · Campaign objective: Conversions",
      "  · Conversion event: Lead",
      "  · Budget: $15/day × 3 audiences = $45/day · 7 days = $315 total",
      "  · 3 ad sets (mfg / dtc / author) — see doc for targeting",
      "  · 4 ads per ad set:",
      "      2 Feed (static image, hook 1 + hook 2)",
      "      1 Reels (VSL #1 + headline overlay)",
      "      1 Stories (VSL #2 15-sec trim)",
      "  · 12 destination URLs: bj ads urls",
      "",
      "Then: submit for review. Meta takes 24-48hr to approve.",
      "Day-by-day post-launch playbook lives in the doc (Days 1-7).",
    ].join("\n");
  },

  // ── Meta launch orchestrator ──────────────────────────────────
  // bj meta launch <wave> [--phase skeleton|ads] [--status]
  // Creates campaign + ad sets (skeleton) or ads + creatives (ads).
  // All resources land in PAUSED state — Ben unpauses in Ads Manager
  // after sanity-checking targeting + creative.
  async "meta:launch"(args, positional) {
    if (!ADMIN_TOKEN) return "error: ADMIN_PASSWORD not set in .env.local";
    const [wave] = positional;
    if (!wave) {
      return "usage: bj meta launch <wave-name> [--phase skeleton|ads] [--status]";
    }

    // --status: read meta_launches row, don't trigger any creates
    if (args["--status"]) {
      const { status, j } = await fetchJson(
        `${BASE_URL}/api/meta/launch?wave=${encodeURIComponent(wave)}`,
        { headers: { authorization: `Bearer ${ADMIN_TOKEN}` } },
      );
      if (!j.ok) return `✗ ${j.error || `HTTP ${status}`}`;
      if (!j.row) return `· no launch row for ${wave} yet — run bj meta launch ${wave}`;
      const lines = [];
      lines.push(`Launch ${j.row.wave} · ${j.row.phase} · ${j.row.status}`);
      if (j.row.campaign_id) {
        lines.push(`  campaign:  ${j.row.campaign_id} · ${j.row.campaign_name || ""}`);
      }
      const adSets = j.row.ad_set_ids || [];
      for (const a of adSets) {
        lines.push(`  ad set:    ${a.id} · ${a.name}`);
      }
      const ads = j.row.ad_ids || [];
      for (const ad of ads) {
        lines.push(`  ad:        ${ad.id} · ${ad.hook_id}`);
      }
      if (j.row.notes) lines.push(`  notes:     ${j.row.notes}`);
      return lines.join("\n");
    }

    const phase = args["--phase"] || "skeleton";

    const { j } = await fetchJson(`${BASE_URL}/api/meta/launch`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ wave, phase }),
    });
    if (!j.ok && j.error) {
      const extra = j.available_waves
        ? `\n  available: ${j.available_waves.join(", ")}`
        : "";
      return `✗ ${j.error}${extra}`;
    }

    if (j.phase === "skeleton") {
      const lines = [];
      const status = j.ok ? "✓" : "⚠";
      lines.push(`${status} Wave ${j.wave} skeleton`);
      lines.push("");
      const c = j.campaign;
      lines.push(
        `  Campaign: ${c.id} · ${c.name}${c.created ? " (CREATED)" : " (existing)"}`,
      );
      for (const a of j.ad_sets) {
        lines.push(
          `  Ad set:   ${a.id} · ${a.name}${a.created ? " (CREATED)" : " (existing)"}`,
        );
      }
      if (j.errors && j.errors.length > 0) {
        lines.push("");
        lines.push("Errors:");
        for (const err of j.errors) lines.push(`  ✗ ${err}`);
      }
      lines.push("");
      lines.push(
        `All resources are PAUSED. Open Ads Manager, refine targeting (Meta autocomplete is better than IDs), then unpause when ready.`,
      );
      return lines.join("\n");
    }
    if (j.phase === "ads") {
      return `· ${j.error || "Phase 2 not implemented yet"}`;
    }
    if (j.phase === "reset") {
      const lines = [];
      if (j.ok) {
        lines.push(`✓ Reset wave ${j.wave}`);
        lines.push(
          `  campaign ${j.campaign_deleted ? "deleted" : "already gone"}${j.campaign_id_was ? ` (was ${j.campaign_id_was})` : ""}`,
        );
        lines.push(
          `  row ${j.row_cleared ? "cleared" : "no row to clear"}`,
        );
        if (j.error) lines.push(`  note: ${j.error}`);
        lines.push("");
        lines.push(`Next: bj meta launch ${j.wave}`);
      } else {
        lines.push(`✗ Reset failed: ${j.error}`);
      }
      return lines.join("\n");
    }
    return JSON.stringify(j, null, 2);
  },

  // ── Meta verification ──────────────────────────────────────────
  // bj meta status — calls /api/meta/status which hits Graph API
  // with the server-side META_ADS_* env vars. Use after a deploy or
  // env-var change to confirm Ben's ads account is actually reachable.

  async "meta:status"() {
    if (!ADMIN_TOKEN) return "error: ADMIN_PASSWORD not set in .env.local";
    const r = await fetch(`${BASE_URL}/api/meta/status`, {
      headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    const j = await r.json();
    if (j.stage === "env_check") {
      return [
        `✗ env vars missing (Vercel → Settings → Environment Variables):`,
        ...j.missing.map((m) => `   · ${m}`),
        ``,
        `Hint: ${j.hint}`,
      ].join("\n");
    }
    if (j.stage === "token_check") {
      return [
        `✗ system user token rejected by Meta Graph API`,
        `   ${j.error}`,
        j.code ? `   code: ${j.code}` : "",
        ``,
        `If code=190: token expired — regenerate in Business Manager → System Users`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    if (j.stage === "account_check") {
      return [
        `✗ ad account not reachable`,
        `   ${j.error}`,
        j.code ? `   code: ${j.code}` : "",
        j.hint ? `` : "",
        j.hint || "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    if (!j.ok) {
      return `✗ ${j.error || `unknown error (stage: ${j.stage})`}`;
    }
    // Success — pretty-print the verification report
    const lines = [];
    lines.push(`✓ Meta Marketing API · v${j.apiVersion}`);
    lines.push("");
    lines.push(`  System user: ${j.systemUser.name} (${j.systemUser.id})`);
    lines.push(
      `  Ad account:  ${j.adAccount.id} · ${j.adAccount.name} (${j.adAccount.currency}, ${j.adAccount.timezone})`,
    );
    if (j.assignment) {
      const flag = j.assignment.can_create_ads ? "✓" : "✗";
      lines.push(
        `  Tasks:       ${flag} [${(j.assignment.tasks || []).join(", ") || "(none)"}]`,
      );
      if (!j.assignment.can_create_ads) {
        lines.push(`               ${j.assignment.diagnosis}`);
      }
    }
    if (j.insightsLast7d) {
      const s = j.insightsLast7d;
      if (s.note) {
        lines.push(`  Last 7d:     ${s.note}`);
      } else {
        lines.push(
          `  Last 7d:     $${s.spend} spent · ${s.impressions} impressions · ${s.clicks} clicks`,
        );
      }
    }
    if (j.pixel) {
      lines.push(
        j.pixel.reachable
          ? `  Pixel:       ${j.pixel.name} (${j.pixel.id}) ✓`
          : `  Pixel:       ${j.pixel.id} ✗ ${j.pixel.error}`,
      );
    }
    return lines.join("\n");
  },

  // ── Outbox subcommands ─────────────────────────────────────────
  // bj ai Day-4 outbox helpers. Hit the public bj-style endpoints
  // (admin-gated via /api/outbox/ in middleware). ADMIN_TOKEN is the
  // cookie-equivalent for CLI access — the dashboard route uses the
  // session cookie set by /api/auth/login.

  async "outbox:list"(args) {
    const limit = args["--limit"] || "20";
    // Use the Supabase REST helper since the dashboard doesn't expose
    // a list endpoint — direct read is faster + tighter.
    const rows = await sb(
      `outbox?select=short_code,prospect_id,channel,subject,body,status,created_at&status=eq.pending&order=created_at.desc&limit=${limit}`,
    );
    if (rows.length === 0) return "no pending drafts";
    return rows
      .map((r) => {
        const age = Math.floor(
          (Date.now() - new Date(r.created_at).getTime()) / 60_000,
        );
        const ageStr = age < 60 ? `${age}m` : `${Math.floor(age / 60)}h`;
        const subj = (r.subject || "").slice(0, 40);
        return `${r.short_code} · ${ageStr.padStart(4)} · ${r.channel.padEnd(5)} · ${subj}`;
      })
      .join("\n");
  },

  async "outbox:approve"(_args, positional) {
    const [code] = positional;
    if (!code) return "usage: bj outbox approve <short_code>";
    const r = await fetch(
      `${BASE_URL}/api/outbox/${encodeURIComponent(code)}/approve`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      },
    );
    const j = await r.json();
    if (j.ok) return `✓ sent ${code} · ${j.row?.sent_via || "ok"}`;
    return `✗ ${j.error || `HTTP ${r.status}`}`;
  },

  async "outbox:reject"(_args, positional) {
    const [code] = positional;
    if (!code) return "usage: bj outbox reject <short_code>";
    const r = await fetch(
      `${BASE_URL}/api/outbox/${encodeURIComponent(code)}/reject`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      },
    );
    const j = await r.json();
    if (j.ok) return `✓ rejected ${code}`;
    return `✗ ${j.error || `HTTP ${r.status}`}`;
  },

  /**
   * `bj ads urls` — print all 12 ad destination URLs ready to paste
   * into Meta Ads Manager. Each URL carries utm_audience +
   * utm_content tags that the dashboard reads for per-hook
   * attribution + the /audit page reads to pre-select the matching
   * audience toggle.
   */
  async "ads:urls"() {
    const base = "https://bluejayportfolio.com/audit";
    const campaign = "wave1-2026-05-17";
    const audiences = /** @type {const} */ (["mfg", "dtc", "author"]);
    const hooks = /** @type {const} */ ([
      { id: "pain", label: "Hook 1 — pain-led (Feed, static)" },
      { id: "distributor", label: "Hook 2 — second pain (Feed, static)" },
      { id: "vsl1", label: "Hook 3 — VSL #1 (Reels)" },
      { id: "vsl2", label: "Hook 4 — VSL #2 (Stories, 15-sec trim)" },
    ]);
    const hookLabelMap = /** @type {Record<string, string>} */ ({
      mfg: "Manufacturer",
      dtc: "DTC Brand",
      author: "Indie Author",
    });
    const lines = [];
    for (const aud of audiences) {
      lines.push(`── ${hookLabelMap[aud]} (utm_audience=${aud}) ─────────`);
      for (const h of hooks) {
        // For author audience, hook 2 ID is "silence" (not "distributor")
        // to match the doc; for dtc, hook 2 is "retarget". Map per-audience.
        const hookId =
          h.id === "distributor" && aud === "dtc"
            ? "retarget"
            : h.id === "distributor" && aud === "author"
              ? "silence"
              : h.id;
        const content = `${aud}-${hookId}`;
        const url = `${base}?utm_source=meta&utm_medium=cpc&utm_campaign=${campaign}&utm_audience=${aud}&utm_content=${content}`;
        lines.push(`  ${h.label}`);
        lines.push(`  ${url}`);
        lines.push("");
      }
    }
    return lines.join("\n").trim();
  },

  async "social:capture"(_args, positional) {
    const text = positional.join(" ");
    if (!text) return "usage: bj social capture <url-or-text>";
    const r = await fetch(`${BASE_URL}/api/social-leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, capturedVia: "cli" }),
    });
    const j = await r.json();
    if (!j.ok) return `error: ${j.error || "unknown"}`;
    return [
      `captured · intent=${j.intent}`,
      j.summary,
      ``,
      `DRAFT:`,
      j.drafted,
    ].join("\n");
  },

  /**
   * bj ai <skill> [--arg value]... [--json]
   *
   * Day 1 of the agentic skill layer (2026-05-17). Posts to
   * /api/ai-skills/run with manual triggeredBy + the parsed args.
   * Skill folder shape + runner behavior documented in
   * src/lib/ai-skills/runner.ts.
   *
   * Output:
   *   - default: skill's `summary` line + 1-line cost/latency footer
   *   - --json:  full SkillResult printed as pretty JSON
   *
   * Auth: uses ADMIN_PASSWORD from .env.local as the Bearer token.
   */
  async "ai"(args, positional) {
    const [skill] = positional;
    if (!skill) {
      return "usage: bj ai <skill> [--arg value]... [--json]\n       bj ai stats [--hours N] [--days N] [--json]";
    }
    if (!ADMIN_TOKEN) {
      return "error: ADMIN_PASSWORD not set in .env.local";
    }

    // ── Special subcommand: `bj ai stats` ──
    if (skill === "stats") {
      return await runAiStats(args);
    }

    // Build the args payload from --flags (skip --json which is a
    // local-only output flag).
    /** @type {Record<string, unknown>} */
    const skillArgs = {};
    for (const [k, v] of Object.entries(args)) {
      if (k === "--json") continue;
      // Strip the leading -- and coerce simple numerics
      const key = k.replace(/^--/, "");
      if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) {
        skillArgs[key] = parseFloat(v);
      } else {
        skillArgs[key] = v;
      }
    }

    const r = await fetch(`${BASE_URL}/api/ai-skills/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        skill,
        triggeredBy: "manual",
        args: skillArgs,
      }),
    });
    const j = await r.json();

    if (args["--json"]) {
      return JSON.stringify(j, null, 2);
    }

    if (!j.ok) {
      return `✗ ${skill} · ${j.error || j.summary || "unknown error"}`;
    }
    if (j.noWork) {
      return `· ${skill} · ${j.summary} (${j.latencyMs}ms)`;
    }
    const footer = `[${j.latencyMs}ms · ${j.tokensIn || 0}+${j.tokensOut || 0}tok · $${(j.costUsd || 0).toFixed(4)}]`;
    return `${j.summary}\n${footer}`;
  },
};

/**
 * `bj ai stats` — terminal-formatted dump of /api/ai-activity/stats.
 *
 * Output stays under ~80 lines so the agent context doesn't bloat
 * when this is called in a loop. Pass --json for the raw payload.
 */
async function runAiStats(args) {
  const hours = args["--hours"] || "24";
  const days = args["--days"] || "14";
  const url = `${BASE_URL}/api/ai-activity/stats?hours=${hours}&days=${days}`;

  const r = await fetch(url, {
    headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  const j = await r.json();
  if (!j.ok) {
    return `error: ${j.error || `HTTP ${r.status}`}`;
  }
  if (args["--json"]) {
    return JSON.stringify(j.stats, null, 2);
  }

  const s = j.stats;
  const $ = (n) => `$${Number(n).toFixed(4).padStart(8)}`;
  const lines = [];

  lines.push(`═══ AI Activity · last ${s.windowHours}h ═══`);
  lines.push("");
  lines.push(
    `Total: ${$(s.totals.grandTotalUsd)} (${s.totals.callCount} calls)`,
  );
  if (s.totals.aiComputeUsd > 0)
    lines.push(`  · AI compute:     ${$(s.totals.aiComputeUsd)}`);
  if (s.totals.infrastructureUsd > 0)
    lines.push(`  · Infrastructure: ${$(s.totals.infrastructureUsd)}`);
  if (s.totals.otherUsd > 0)
    lines.push(`  · Other:          ${$(s.totals.otherUsd)}`);
  lines.push("");

  if (s.byService.length > 0) {
    lines.push(`By service (top 10):`);
    for (const row of s.byService.slice(0, 10)) {
      const tag = row.category === "ai_compute" ? "🤖" : row.category === "infrastructure" ? "🔧" : "  ";
      lines.push(
        `  ${tag} ${$(row.costUsd)} · ${String(row.callCount).padStart(4)}× · ${row.label}`,
      );
    }
    lines.push("");
  }

  if (s.caps.length > 0) {
    lines.push(`Skill caps today:`);
    for (const c of s.caps) {
      const bar =
        "█".repeat(Math.min(20, Math.round(c.pct / 5))).padEnd(20, "·");
      const hitFlag = c.capHitsToday > 0 ? ` ⚠ ${c.capHitsToday} hits` : "";
      lines.push(
        `  ${c.skill.padEnd(18)} ${$(c.spentTodayUsd)} / ${$(c.dailyCapUsd).trim()}  [${bar}] ${c.pct.toFixed(0)}%${hitFlag}`,
      );
    }
    lines.push("");
  }

  if (s.skillStats.successful + s.skillStats.failed + s.skillStats.noWork > 0) {
    lines.push(
      `bj ai runs · ${s.skillStats.successful} ok · ${s.skillStats.failed} failed · ${s.skillStats.noWork} no-work`,
    );
    if (s.skillStats.avgLatencyMs > 0) {
      lines.push(
        `             avg ${s.skillStats.avgLatencyMs}ms · p95 ${s.skillStats.p95LatencyMs}ms`,
      );
    }
    lines.push("");
  }

  // Trend — compact sparkline-style mini-chart
  if (s.trend.length > 0) {
    const max = Math.max(...s.trend.map((d) => d.costUsd), 0.0001);
    const sparkChars = ["·", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    const spark = s.trend
      .map((d) => {
        const ratio = max > 0 ? d.costUsd / max : 0;
        const idx = Math.min(sparkChars.length - 1, Math.floor(ratio * sparkChars.length));
        return sparkChars[idx];
      })
      .join("");
    const totalWindow = s.trend.reduce((a, d) => a + d.costUsd, 0);
    lines.push(`${s.trend.length}-day trend: ${spark}`);
    lines.push(
      `             ${$(totalWindow)} total · avg ${$(totalWindow / s.trend.length).trim()}/day · peak ${$(max).trim()}`,
    );
  }

  return lines.join("\n");
}

// ─── Arg parser (no dep) ───
function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        flags[a] = argv[++i];
      } else {
        flags[a] = "true";
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

// ─── Main ───
async function main() {
  const [, , ...argv] = process.argv;
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help") {
    console.log(`bj — BlueJays admin CLI

  bj leads list [--client SLUG] [--limit N]
  bj clients
  bj tasks list [--client SLUG] [--status pending,in_progress]
  bj costs ledger
  bj costs add SERVICE AMOUNT [--note "..."]
  bj signals tail [--target NAME] [--limit N]
  bj signals emit SOURCE KIND TITLE [--severity LEVEL] [--target NAME]
  bj impersonate SLUG
  bj watchdog run
  bj digest preview
  bj social list [--filter open|all]
  bj social capture <url-or-text>
  bj ai <skill> [--arg value]... [--json]
  bj ads checklist
  bj ads urls
  bj outbox list [--limit N]
  bj outbox approve <short_code>
  bj outbox reject <short_code>
  bj meta status
  bj meta launch <wave-name> [--phase skeleton|ads] [--status]

Set BJ_BASE_URL=https://bluejayportfolio.com to hit prod.`);
    return;
  }

  // Build subcommand key: "leads list" → "leads:list"
  // ai stays a flat subcommand ("ai" + positional skill name) since
  // the skill folders are themselves an enumeration — adding "ai" to
  // groups would force "bj ai:echo" which is uglier and harder to
  // type than "bj ai echo".
  const groups = ["leads", "tasks", "costs", "signals", "watchdog", "digest", "social", "ads", "outbox", "meta"];
  let key, rest;
  if (groups.includes(argv[0])) {
    key = `${argv[0]}:${argv[1]}`;
    rest = argv.slice(2);
  } else {
    key = argv[0];
    rest = argv.slice(1);
  }

  const cmd = commands[key];
  if (!cmd) {
    console.error(`unknown subcommand: ${key}\nrun: bj help`);
    process.exit(1);
  }

  const { positional, flags } = parseArgs(rest);
  try {
    const out = await cmd(flags, positional);
    console.log(out);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
}

main();
