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

Set BJ_BASE_URL=https://bluejayportfolio.com to hit prod.`);
    return;
  }

  // Build subcommand key: "leads list" → "leads:list"
  // ai stays a flat subcommand ("ai" + positional skill name) since
  // the skill folders are themselves an enumeration — adding "ai" to
  // groups would force "bj ai:echo" which is uglier and harder to
  // type than "bj ai echo".
  const groups = ["leads", "tasks", "costs", "signals", "watchdog", "digest", "social"];
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
