import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/clients/kr-ranches/waitlist
 *
 * Public — no auth. Captures an email for KR's "drop alert" waitlist
 * (someone who saw "When it's gone, it's gone!" on the freezer section).
 *
 * Writes to contact_form_submissions with KR's prospect_id so the entry
 * shows up automatically in the owner admin's Email-list tab.
 *
 * Whitelisted in middleware (PUBLIC_API_PATHS).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// KR Ranches prospect UUID — same constant used in the customers aggregator.
const KR_PROSPECT_ID = "30eec463-5f78-4632-8c4b-aaba9fa3151f";
const KR_BUSINESS_NAME = "KR Ranches";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: CORS },
    );
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400, headers: CORS },
    );
  }

  if (!isSupabaseConfigured()) {
    // Mock mode — always pretend success so dev / preview environments
    // don't render an error to the customer.
    return NextResponse.json(
      { ok: true, mock: true },
      { headers: CORS },
    );
  }

  const supa = getSupabase();

  // Dedupe: if this email is already on the waitlist, return success without
  // creating a duplicate row.
  try {
    const { data: existing } = await supa
      .from("contact_form_submissions")
      .select("id")
      .eq("prospect_id", KR_PROSPECT_ID)
      .eq("customer_email", email)
      .eq("service_requested", "drop-alert-waitlist")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { ok: true, already: true },
        { headers: CORS },
      );
    }
  } catch {
    // Ignore dedupe lookup errors — the insert below will still work.
  }

  // Insert as a contact_form_submissions row so the email shows up in
  // the owner admin's Email-list and Customers tabs automatically.
  const { error } = await supa.from("contact_form_submissions").insert({
    prospect_id: KR_PROSPECT_ID,
    business_name: KR_BUSINESS_NAME,
    customer_name: "Waitlist subscriber",
    customer_phone: null,
    customer_email: email,
    message: "Joined the freezer drop-alert waitlist",
    service_requested: "drop-alert-waitlist",
    sms_sent: false,
    email_sent: false,
  });

  if (error) {
    console.error("[kr-waitlist] insert error:", error.message);
    return NextResponse.json(
      { ok: false, error: "save_failed" },
      { status: 500, headers: CORS },
    );
  }

  return NextResponse.json({ ok: true }, { headers: CORS });
}
