import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Short unsubscribe route — /u/[code] → /unsubscribe/[uuid]
 *
 * The EMAIL_FOOTER in every outreach email used to point at
 * /unsubscribe/<full-uuid> — a 77-char URL that wraps badly in Gmail
 * and looks spammy. This resolves the 8-char short_code back to the
 * prospect UUID and 302s to the real unsubscribe handler, so emails
 * can ship the clean /u/a1b2c3d4 form instead.
 *
 * Public (no auth) — matches the existing /unsubscribe/[id] route.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!/^[a-f0-9]{8}$/i.test(code)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data } = await supabase
    .from("prospects")
    .select("id")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  if (!data?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL(`/unsubscribe/${data.id}`, request.url));
}
