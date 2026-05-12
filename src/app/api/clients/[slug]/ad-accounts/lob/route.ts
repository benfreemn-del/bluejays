import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { storeRefreshToken } from "@/lib/ad-oauth";

/**
 * POST /api/clients/[slug]/ad-accounts/lob
 *
 * Lob uses API keys, not OAuth, so we can't go through the
 * /api/oauth/lob/start redirect dance. Customer either pastes their
 * own Lob secret key OR types the sentinel "use_bluejays_master" to
 * route their postcards through BlueJays' Lob account at-cost.
 *
 * The key gets encrypted-at-rest via the same pgcrypto pgp_sym_encrypt
 * helper used for OAuth refresh tokens (see ad_account_upsert_token
 * RPC). We never log the plaintext key.
 *
 * Auth: client-portal cookie scoped to this slug.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const apiKey = (body.apiKey ?? "").trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "apiKey required" }, { status: 400 });
  }

  // Validate shape — Lob keys are `live_…` (production) or `test_…`
  // (sandbox). The "use_bluejays_master" sentinel means we use the
  // master LOB_API_KEY env var for this client's postcards.
  const isMaster = apiKey === "use_bluejays_master";
  if (!isMaster && !/^(live|test)_[A-Za-z0-9]+/.test(apiKey)) {
    return NextResponse.json(
      { ok: false, error: "Lob keys start with live_ or test_" },
      { status: 400 },
    );
  }

  // Store in client_ad_accounts via the same encryption path as OAuth
  // refresh tokens. external_account_id captures the masked key so
  // operators can audit which tenant uses which key without exposing
  // the plaintext.
  const masked = isMaster ? "bluejays-master" : `${apiKey.slice(0, 9)}…${apiKey.slice(-4)}`;
  const result = await storeRefreshToken({
    clientSlug: slug,
    platform: "lob",
    refreshToken: apiKey,
    externalAccountId: masked,
    externalAccountName: isMaster ? "BlueJays master Lob account" : "Lob (own key)",
    scopes: isMaster ? ["bluejays_master_passthrough"] : ["lob_api"],
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, masked });
}
