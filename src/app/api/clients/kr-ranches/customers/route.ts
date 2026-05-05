import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/kr-ranches/customers
 *
 * Aggregates 3 data sources for KR's admin "Customers" tab:
 *   1. contact_form_submissions (filtered by KR's prospect_id)
 *   2. missed_call_logs (filtered by KR's prospect_id)
 *   3. Future: dedicated email-signup table (not yet built)
 *
 * Returns each as its own list — admin tab can group + dedupe by phone/email
 * client-side. Auth: client-portal cookie scoped to slug=kr-ranches.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";
// KR Ranches' prospect UUID — used to scope contact_form_submissions +
// missed_call_logs queries (those tables key by prospect_id, not slug).
const KR_PROSPECT_ID = "30eec463-5f78-4632-8c4b-aaba9fa3151f";

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      contactForms: [],
      missedCalls: [],
      emailList: [],
    });
  }

  const supa = getSupabase();

  // 1. contact_form_submissions
  let contactForms: unknown[] = [];
  try {
    const { data, error } = await supa
      .from("contact_form_submissions")
      .select("id, customer_name, customer_phone, customer_email, message, service_requested, submitted_at")
      .eq("prospect_id", KR_PROSPECT_ID)
      .order("submitted_at", { ascending: false })
      .limit(500);
    if (!error && data) contactForms = data;
  } catch (e) {
    console.error("[kr-customers] contact_form_submissions error:", e);
  }

  // 2. missed_call_logs (table may not exist yet — graceful fallback)
  let missedCalls: unknown[] = [];
  try {
    const { data, error } = await supa
      .from("missed_call_logs")
      .select("id, caller_phone, caller_name, duration_seconds, auto_sms_sent, called_at")
      .eq("prospect_id", KR_PROSPECT_ID)
      .order("called_at", { ascending: false })
      .limit(500);
    if (!error && data) missedCalls = data;
  } catch (e) {
    // Silent — table may not exist for KR yet (no Twilio number wired).
  }

  // 3. Email list — derive from contact_form_submissions for now (anyone who
  // shared their email is on the list). Dedupe by lowercased email.
  const emailSet = new Set<string>();
  const emailList: { email: string; name: string | null; lastSeen: string }[] = [];
  for (const row of contactForms as Array<{
    customer_email?: string | null;
    customer_name?: string | null;
    submitted_at?: string;
  }>) {
    const email = (row.customer_email || "").toLowerCase().trim();
    if (!email || !email.includes("@")) continue;
    if (emailSet.has(email)) continue;
    emailSet.add(email);
    emailList.push({
      email,
      name: row.customer_name || null,
      lastSeen: row.submitted_at || "",
    });
  }

  return NextResponse.json({
    ok: true,
    contactForms,
    missedCalls,
    emailList,
    counts: {
      contactForms: contactForms.length,
      missedCalls: missedCalls.length,
      emails: emailList.length,
    },
  });
}
