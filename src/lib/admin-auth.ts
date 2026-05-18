/**
 * Shared bearer-auth helper for agent-facing JSON endpoints.
 *
 * Centralizes the "is this request from Ben (via bj.mjs / Vercel cron /
 * curl) or an unauthorized caller?" check that was previously duplicated
 * (and drifting) across:
 *
 *   - /api/ai-skills/run
 *   - /api/ai-activity/stats
 *   - /api/meta/status
 *   - /api/outbox/[id]/approve + /reject
 *
 * Accepts any of these as a valid Bearer token (in priority order):
 *
 *   1. CRON_SECRET            → Vercel cron jobs
 *   2. ADMIN_PASSWORD_BEN     → owner role (per middleware Q4=A 2026-05-08)
 *   3. ADMIN_PASSWORD         → legacy owner var (kept for backward compat)
 *
 * Does NOT accept ADMIN_PASSWORD_MADIE — these are owner/cron-only
 * surfaces. If we ever need a sales-readable agent endpoint, add a
 * separate helper rather than widening this one.
 *
 * Why a helper instead of inline checks: the middleware was already
 * updated to support the new 2-password setup (src/middleware.ts lines
 * 14-19) but the agent routes weren't. This unifies behavior so a
 * password rotation OR rename on Vercel just works across all routes.
 */

import type { NextRequest } from "next/server";

/** Read all valid Bearer tokens from env. Trimmed, empties filtered. */
function getValidTokens(): string[] {
  return [
    process.env.CRON_SECRET,
    process.env.ADMIN_PASSWORD_BEN,
    process.env.ADMIN_PASSWORD,
  ]
    .map((v) => (v || "").trim())
    .filter((v) => v.length > 0);
}

/** True if the request carries a Bearer header matching any valid token. */
export function isValidBearer(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  if (!bearer) return false;
  return getValidTokens().includes(bearer);
}

/** Diagnostic: which env vars are currently configured? Used by the
 *  bj-side error reporting so Ben can tell which var to update. Does
 *  NOT return the token values themselves — only their presence. */
export function describeBearerEnv(): {
  cron_secret_set: boolean;
  admin_password_ben_set: boolean;
  admin_password_set: boolean;
  any_valid: boolean;
} {
  const cron = (process.env.CRON_SECRET || "").trim().length > 0;
  const ben = (process.env.ADMIN_PASSWORD_BEN || "").trim().length > 0;
  const legacy = (process.env.ADMIN_PASSWORD || "").trim().length > 0;
  return {
    cron_secret_set: cron,
    admin_password_ben_set: ben,
    admin_password_set: legacy,
    any_valid: cron || ben || legacy,
  };
}
