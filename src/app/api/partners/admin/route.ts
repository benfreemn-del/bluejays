import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/partners/admin
 *
 * Body: { action, partnerId, referralId?, method? }
 *
 * Actions:
 *   - approve         — set partner.status='approved', stamp approved_at
 *   - decline         — set partner.status='declined'
 *   - pause           — set partner.status='paused'
 *   - mark_paid       — set referral.payout_status='paid', stamp paid_at + method
 *   - void_referral   — set referral.payout_status='void'
 *
 * No auth gate yet — relies on /dashboard URL-as-secret. Add real auth
 * before exposing this beyond Ben.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let body: {
    action?: string;
    partnerId?: string;
    referralId?: string;
    method?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { action, partnerId, referralId, method } = body;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  switch (action) {
    case "approve": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "decline": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "declined" })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "pause": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "paused" })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "mark_paid": {
      if (!referralId) return NextResponse.json({ error: "Missing referralId" }, { status: 400 });
      const { error } = await supabase
        .from("partner_referrals")
        .update({
          payout_status: "paid",
          paid_at: new Date().toISOString(),
          payout_method: (method || "manual").slice(0, 30),
        })
        .eq("id", referralId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "void_referral": {
      if (!referralId) return NextResponse.json({ error: "Missing referralId" }, { status: 400 });
      const { error } = await supabase
        .from("partner_referrals")
        .update({ payout_status: "void" })
        .eq("id", referralId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
