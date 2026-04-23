import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Short booking route — /b/[code] → /book/[uuid]
 *
 * Retargeting-email clicker templates include a "book a call" link
 * that used to be /book/<full-uuid> (63 chars). Short form is cleaner
 * in email text.
 *
 * Public (no auth).
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

  return NextResponse.redirect(new URL(`/book/${data.id}`, request.url));
}
