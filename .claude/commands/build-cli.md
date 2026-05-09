---
description: Wrap a service in a CLI (Node for our own API routes, printing-press Go for external/no-API services). CLI > API > MCP for any agent-consumed integration — saves ~35× tokens vs MCP and keeps responses out of the context window.
---

# /build-cli

Codifies the "CLI-first" architecture rule. Use this any time:

- A new external service needs to be agent-callable (LinkedIn, Apollo,
  Stripe, Calendly, etc.)
- An MCP server is eating context budget for a service we use rarely
  (every loaded MCP tool description is in your context every session,
  even if never called)
- An existing `/api/*` route is the kind of thing Claude calls
  10×/session in admin work — we'd burn 5K tokens reading dashboard
  pages that a CLI would deliver in 200 tokens

## The priority order (memorize)

1. **CLI** — fastest, cheapest, agent-native. ~200 tokens clean text
   per call. Local SQLite mirror = no rate limits, no round trips,
   composable with pipes.
2. **API** — when there's no CLI and we control the call site. Wrap
   the API call in a thin CLI script (~30 min) before letting an agent
   call it twice.
3. **MCP** — last resort. Discoverable but bloated. Every loaded MCP
   server eats tokens just for tool descriptions, even when unused.
   Acceptable for one-off interactive tools (preview, supabase admin)
   where flexibility > token cost. Reject for high-volume agent use.

## Two flavors

### Flavor A — internal `bj` CLI (Node, ships in `scripts/bj.mjs`)

For wrapping our own `/api/*` routes (admin ops Claude does 10×/day).

1. **Pick the operation.** Examples: `bj leads list --client X`,
   `bj costs add vercel 220`, `bj signals tail --target daily-digest`,
   `bj impersonate <slug>`, `bj audit run --url X`.
2. **Add a subcommand to `scripts/bj.mjs`.** Each subcommand is one
   function that hits the matching `/api/*` route and prints clean
   stdout (one row per line, no JSON dumps).
3. **Update `scripts/bj.mjs`'s top doc** with the new subcommand.
4. **Test**: `node scripts/bj.mjs <subcommand>` should return < 500
   chars for the typical case.

### Flavor B — external service CLI (Go via printing-press)

For services without a clean API (Skool, Craigslist, LinkedIn) or
where the official CLI is bad (Vercel logs).

1. **Confirm Go is installed**: `go version`. If not, install it once.
2. **Confirm printing-press tooling is installed.** If not:
   ```
   curl -fsSL https://printingpress.dev/install.sh | sh
   ```
3. **Use the printing-press CLI factory** with a natural-language
   request:
   ```
   pp factory build --service vercel-logs \
     --intent "given a project + window, return top 10 referrers by bandwidth"
   ```
4. **Verify the resulting binary** lives in `~/.printing-press/bin/`
   and is invokable as `pp-vercel-logs`.
5. **Add the binary path + a one-line usage example** to this
   project's `CLAUDE.md` under the "Available CLIs" section so future
   sessions discover it without re-research.

## Don't

- **Don't build an MCP server for an agent-consumed integration unless
  you've ruled out CLI.** Every MCP burns context tokens 24/7. If the
  service has an API, it has a CLI you can build in 30 minutes.
- **Don't put API keys / auth tokens in the CLI script.** Read from
  `.env.local` or env vars. Same hygiene as the API routes.
- **Don't skip the stdout cleanup.** A CLI that returns raw JSON is
  just an API call with extra steps. Format output as one-row-per-line
  human-readable text. ~200 tokens per call is the target.
- **Don't ignore quotas.** Wrapping an API in a CLI doesn't bypass
  rate limits. Add caching where it makes sense (local SQLite for
  cold reads).

## The savings, concretely

For Ben's setup (Claude Max $200/mo, 30 bots, ~20 admin ops/day):

- Replacing one MCP-routed admin op (5K tokens read) with a CLI op
  (200 tokens) = **~24× cheaper** per call
- 20 admin ops/day × 24× savings = ~96K tokens/day saved
- Across a 30-day month: ~2.9M tokens, which is meaningful headroom
  on Max session limits even if API cost is sunk

## When this is useful

- Adding a new external integration (default to CLI)
- Auditing context bloat — run `/context` in Claude Code, see which
  MCPs are loaded, replace any that fit the high-volume agent pattern
- After `/optimize-costs` flags a bot that's making lots of agent →
  service calls inefficiently
- When Ben says "build me a CLI for X" / "this service is bleeding
  tokens"
