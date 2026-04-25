import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect, updateProspect } from "@/lib/store";

/**
 * Short unsubscribe route — /u/[code]
 *
 * GET: redirects to /unsubscribe/[uuid] (the human confirmation page).
 *   The EMAIL_FOOTER in every outreach email points at this clean
 *   /u/a1b2c3d4 form instead of /unsubscribe/<full-uuid>.
 *
 * POST: RFC 8058 one-click unsubscribe. Gmail/Apple POST here with an
 *   empty body when a recipient hits the inline "Unsubscribe" UI in
 *   the message header. We resolve the code → uuid, mark the prospect
 *   unsubscribed, pause the funnel, and return 200. Must accept an
 *   empty body and never redirect — Gmail's verifier requires a 2xx
 *   response from the same URL listed in the List-Unsubscribe header.
 *
 * Public (no auth) — matches the existing /unsubscribe/[id] route.
 */
export const dynamic = "force-dynamic";

async function resolveCodeToId(code: string): Promise<string | null> {
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;
  if (!isSupabaseConfigured()) return null;

  const { data } = await supabase
    .from("prospects")
    .select("id")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  return data?.id || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const id = await resolveCodeToId(code);

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL(`/unsubscribe/${id}`, request.url));
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const id = await resolveCodeToId(code);

  // Always return 200 even on unknown codes — Gmail's RFC 8058 verifier
  // treats any non-2xx as a failed one-click attempt and downgrades
  // the sender's reputation. Don't reveal whether the code exists.
  if (!id) {
    return NextResponse.json({ success: true });
  }

  try {
    const prospect = await getProspect(id);
    if (prospect && prospect.status !== "unsubscribed") {
      await updateProspect(id, {
        status: "unsubscribed",
        funnelPaused: true,
      });
      console.log(
        `[Unsubscribe one-click] ${prospect.businessName} (${id}) unsubscribed via /u/${code}`,
      );
    }
  } catch (error) {
    console.error(`[Unsubscribe one-click] Error: ${(error as Error).message}`);
    // Still return 200 — Gmail re-verifies and we don't want to look broken.
  }

  return NextResponse.json({ success: true });
}
