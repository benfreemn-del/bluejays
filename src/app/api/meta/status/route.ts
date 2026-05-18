/**
 * GET /api/meta/status
 *
 * Verifies the Meta Marketing API connection end-to-end:
 *   1. Token auth works (Graph /me returns the system-user identity)
 *   2. Ad account is reachable (Graph /act_X returns the account name)
 *   3. Insights pull works (last 7d spend + impressions for sanity)
 *
 * Used by:
 *   - `bj meta status` CLI as the canonical "is the connection alive"
 *     check
 *   - Manual smoke test after env vars / token rotation
 *   - Future cron health check (alert Ben if the token expires
 *     near its 60-day boundary)
 *
 * Auth: same Bearer-token pattern as /api/ai-skills/run + /api/ai-activity.
 * Listed under /api/meta/ in PUBLIC_API_PATHS so the middleware passes
 * through to the route's own check.
 *
 * Never returns Meta's raw error responses to the caller (those can
 * leak app secrets / debug info). Errors are bucketed into:
 *   - "missing env: <var>"
 *   - "token rejected" (401/190)
 *   - "ad account not reachable" (100/803)
 *   - "graph api error: <code>"
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidBearer, describeBearerEnv } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH_BASE = "https://graph.facebook.com";

type GraphErrorResponse = {
  error?: { code?: number; message?: string; type?: string };
};

async function graphGet<T>(
  path: string,
  token: string,
  apiVersion: string,
): Promise<{ ok: true; data: T } | { ok: false; error: string; code?: number }> {
  try {
    const url = `${GRAPH_BASE}/${apiVersion}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      const errPayload = (await r.json().catch(() => ({}))) as GraphErrorResponse;
      const code = errPayload.error?.code;
      const msg = errPayload.error?.message || `HTTP ${r.status}`;
      return { ok: false, error: msg, code };
    }
    return { ok: true, data: (await r.json()) as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET(request: NextRequest) {
  if (!isValidBearer(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing or invalid bearer token",
        env_check: describeBearerEnv(),
      },
      { status: 401 },
    );
  }

  // ── Env-var presence check ──
  const token = (process.env.META_ADS_SYSTEM_TOKEN || "").trim();
  const accountId = (process.env.META_ADS_ACCOUNT_ID || "").trim();
  const appId = (process.env.META_ADS_APP_ID || "").trim();
  const apiVersion = (process.env.META_ADS_API_VERSION || "v21.0").trim();
  const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();

  const missing: string[] = [];
  if (!token) missing.push("META_ADS_SYSTEM_TOKEN");
  if (!accountId) missing.push("META_ADS_ACCOUNT_ID");
  if (!appId) missing.push("META_ADS_APP_ID");
  if (!pixelId) missing.push("NEXT_PUBLIC_META_PIXEL_ID");
  if (missing.length > 0) {
    return NextResponse.json({
      ok: false,
      stage: "env_check",
      missing,
      hint: "set on Vercel + redeploy",
    });
  }

  // Ad account must be prefixed with act_ for the Graph API.
  const accountPath = accountId.startsWith("act_")
    ? accountId
    : `act_${accountId}`;

  // ── 1) Token identity check (/me) ──
  type MeResponse = { id: string; name?: string };
  const me = await graphGet<MeResponse>("me?fields=id,name", token, apiVersion);
  if (!me.ok) {
    return NextResponse.json({
      ok: false,
      stage: "token_check",
      error: `token rejected by Graph API: ${me.error}`,
      code: me.code,
    });
  }

  // ── 2) Ad account reachable ──
  type AdAccountResponse = {
    id: string;
    name?: string;
    currency?: string;
    account_status?: number;
    timezone_name?: string;
  };
  const acct = await graphGet<AdAccountResponse>(
    `${accountPath}?fields=id,name,currency,account_status,timezone_name`,
    token,
    apiVersion,
  );
  if (!acct.ok) {
    return NextResponse.json({
      ok: false,
      stage: "account_check",
      error: `ad account ${accountPath} not reachable: ${acct.error}`,
      code: acct.code,
      hint:
        acct.code === 100
          ? "system user may not have access to this ad account — Settings → Ad Accounts → Add People → grant the system user Admin role"
          : undefined,
    });
  }

  // ── 2b) WHICH TASKS does the system user actually have? ──
  // Hits /me/assigned_ad_accounts which returns the list of ad
  // accounts assigned to THIS system user + the per-account task
  // permissions. Definitively answers "can the system user create
  // campaigns" without UI guesswork. Empty tasks array OR missing
  // MANAGE = the create-ads call will fail with subcode 1815066.
  type AssignedAdAccountsResp = {
    data: Array<{
      id: string;
      name?: string;
      tasks?: string[];
      account_status?: number;
    }>;
  };
  const assignments = await graphGet<AssignedAdAccountsResp>(
    "me/assigned_ad_accounts?fields=id,name,tasks,account_status&limit=100",
    token,
    apiVersion,
  );
  let assignedTasks: string[] = [];
  let assignmentFound = false;
  if (assignments.ok) {
    const match = assignments.data.data.find(
      (a) => a.id === acct.data.id || a.id === accountPath,
    );
    if (match) {
      assignmentFound = true;
      assignedTasks = match.tasks || [];
    }
  }
  const canCreateAds = assignedTasks.includes("MANAGE");
  const taskDiagnosis = !assignmentFound
    ? "system user has NO assignment on this ad account — must add via Settings → Ad Accounts → click account → Add People → System Users → BlueJays Hyperloop"
    : assignedTasks.length === 0
      ? "system user is assigned but with EMPTY tasks — edit assignment → tick 'Manage ad account' / 'Manage Campaigns'"
      : canCreateAds
        ? "ad-account tasks include MANAGE — system user can create ads"
        : `ad-account tasks = [${assignedTasks.join(", ")}] — missing MANAGE. Edit assignment → tick 'Manage ad account' (read-only tasks like ADVERTISE/ANALYZE/DRAFT aren't enough to create campaigns).`;

  // ── 3) Insights pull (last 7d spend + impressions) ──
  type InsightsResponse = {
    data: Array<{
      spend?: string;
      impressions?: string;
      clicks?: string;
      date_start?: string;
      date_stop?: string;
    }>;
  };
  const insights = await graphGet<InsightsResponse>(
    `${accountPath}/insights?fields=spend,impressions,clicks&date_preset=last_7d`,
    token,
    apiVersion,
  );
  // Insights endpoint sometimes 200s with empty data when no activity —
  // treat that as "ok, but no recent spend" rather than failure.
  const insightsRow = insights.ok ? insights.data.data[0] : undefined;

  // Pixel sanity — confirm the pixel ID resolves (no spend implied, just
  // "the ID points at a real Adsxxx pixel object on this account").
  type PixelResponse = { id: string; name?: string };
  const pixel = await graphGet<PixelResponse>(
    `${pixelId}?fields=id,name`,
    token,
    apiVersion,
  );

  return NextResponse.json({
    ok: true,
    stage: "ready",
    apiVersion,
    systemUser: { id: me.data.id, name: me.data.name || "—" },
    adAccount: {
      id: acct.data.id,
      name: acct.data.name || "—",
      currency: acct.data.currency || "—",
      status: acct.data.account_status,
      timezone: acct.data.timezone_name || "—",
    },
    assignment: {
      found: assignmentFound,
      tasks: assignedTasks,
      can_create_ads: canCreateAds,
      diagnosis: taskDiagnosis,
    },
    insightsLast7d: insightsRow
      ? {
          spend: insightsRow.spend || "0",
          impressions: insightsRow.impressions || "0",
          clicks: insightsRow.clicks || "0",
          window: `${insightsRow.date_start} → ${insightsRow.date_stop}`,
        }
      : { spend: "0", impressions: "0", clicks: "0", note: "no activity yet" },
    pixel: pixel.ok
      ? { id: pixel.data.id, name: pixel.data.name || "—", reachable: true }
      : { id: pixelId, reachable: false, error: pixel.error },
  });
}
