import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/clients/[slug]/ad-accounts
 *
 * Returns the connection status for each external ad platform tied to
 * this client. Used by the Ads tab to render Connect / Connected pills
 * next to each platform card.
 *
 * Returns only safe-to-display columns — never the encrypted refresh
 * token. Client portal-cookie auth, slug-scoped.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RowOut {
  platform: string;
  external_account_id: string | null;
  external_account_name: string | null;
  status: string;
  scopes: string[] | null;
  last_used_at: string | null;
  last_refreshed_at: string | null;
  consecutive_failures: number;
  last_error: string | null;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("client_ad_accounts")
    .select(
      "platform, external_account_id, external_account_name, status, scopes, last_used_at, last_refreshed_at, consecutive_failures, last_error, created_at",
    )
    .eq("client_slug", slug);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rows: (data ?? []) as RowOut[] });
}
