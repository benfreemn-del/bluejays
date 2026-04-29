import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentPartner } from "@/lib/partner-auth";

/** POST /api/partners/work/agreement — stamp agreement_accepted_at. */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const partner = await getCurrentPartner();
  if (!partner) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { error } = await supabase
    .from("partners")
    .update({ agreement_accepted_at: new Date().toISOString() })
    .eq("id", partner.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
