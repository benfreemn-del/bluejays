/**
 * POST /api/contact-form/[id]
 *
 * Contact form handler for client business websites.
 * When a visitor fills out the contact/inquiry form on the client's website,
 * this endpoint:
 *   1. Saves the submission to Supabase
 *   2. Returns a `scheduleUrl` that the client site opens as a booking modal
 *   3. Emails the business owner with the lead details
 *
 * The response includes a `scheduleUrl` — a white-labeled scheduling page at
 * /schedule/[id]?name=...&phone=...&email=... that opens immediately as a
 * modal or redirect so the customer can pick an appointment time right away.
 * No SMS is sent at this stage — the booking confirmation handles that.
 *
 * Client websites embed this as their form action (CORS-enabled).
 * Body: { name, phone, email?, message?, service? }
 *
 * Embed snippet for client websites (copy-paste into their site):
 * ─────────────────────────────────────────────────────────────────────────
 * <div id="bj-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;">
 *   <div style="position:relative;width:90%;max-width:420px;height:640px;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35);">
 *     <button onclick="document.getElementById('bj-overlay').style.display='none'"
 *       style="position:absolute;top:10px;right:14px;z-index:10;background:rgba(255,255,255,.8);border:none;border-radius:50%;width:28px;height:28px;font-size:16px;cursor:pointer;line-height:1;">×</button>
 *     <iframe id="bj-frame" style="width:100%;height:100%;border:none;border-radius:20px;"></iframe>
 *   </div>
 * </div>
 * <script>
 * window.addEventListener('message', function(e) {
 *   if (e.data && e.data.type === 'bluejays-booking-complete') {
 *     document.getElementById('bj-overlay').style.display = 'none';
 *   }
 * });
 * async function submitContactForm(name, phone, email, message, service) {
 *   const res = await fetch('https://bluejayportfolio.com/api/contact-form/[PROSPECT_ID]', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name, phone, email, message, service })
 *   });
 *   const data = await res.json();
 *   if (data.scheduleUrl) {
 *     document.getElementById('bj-frame').src = data.scheduleUrl;
 *     document.getElementById('bj-overlay').style.display = 'flex';
 *   }
 * }
 * </script>
 * ─────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
// FROM_EMAIL hardcoded per CLAUDE.md Rule 16 — SendGrid was rejecting
// sends with status 400 "Invalid from email address" because
// ben@bluejayportfolio.com isn't authenticated as a verified single
// sender on this SendGrid account (and the bluejayportfolio.com domain
// authentication was reset during the 2026-05-12 billing suspension).
// bluejaycontactme@gmail.com is the verified single sender used across
// the rest of the email pipeline (email-sender.ts, etc.) — keep this
// in lockstep with that file. Don't read from process.env.FROM_EMAIL —
// the env var on Vercel has historically been set to invalid values
// (stale NEXT_PUBLIC_* legacy), so hardcoding is the safety net.
const FROM_EMAIL = "bluejaycontactme@gmail.com";
// Same Rule 16 pattern — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

async function sendOwnerEmail(ownerEmail: string, subject: string, body: string): Promise<void> {
  // Debug logging — surfaces silent SendGrid failures (missing key,
  // suspended account, revoked credentials, etc.) in Vercel function
  // logs. Previously this function ran inside a `.catch(() => {})` at
  // the call site, so every failure mode looked identical to success
  // from the API's perspective. Added 2026-05-12 after SendGrid
  // billing-suspension cascade produced silently-dropped form
  // submissions for Meyer Electric.
  if (!SENDGRID_API_KEY) {
    console.error("[contact-form] SENDGRID_API_KEY missing — email NOT sent to", ownerEmail);
    return;
  }
  console.log("[contact-form] Sending lead email to", ownerEmail, "via SendGrid");
  try {
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: ownerEmail }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Leads" },
        subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    if (!sgRes.ok) {
      const errText = await sgRes.text().catch(() => "<no body>");
      console.error(
        "[contact-form] SendGrid REJECTED send to",
        ownerEmail,
        "→ status",
        sgRes.status,
        "body:",
        errText,
      );
    } else {
      console.log("[contact-form] SendGrid accepted send to", ownerEmail, "(status", sgRes.status + ")");
    }
  } catch (err) {
    console.error("[contact-form] SendGrid fetch THREW:", err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  // Accept BOTH naming conventions:
  //   • short form  → name, phone, email, service           (this route's
  //     original embed-snippet API shape, used by 3rd-party client sites
  //     copy-pasting the snippet from the JSDoc above)
  //   • supabase-ish → customer_name, customer_phone,
  //     customer_email, service_requested                    (internal
  //     showcase forms — Meyer, Masters, etc. — that named their fields
  //     to match the `contact_form_submissions` Supabase columns)
  // Bug fixed 2026-05-12: server only read short-form keys, so the
  // showcase forms (which only send the long-form keys) hit
  // "name is required" even when the customer typed their name.
  const name = String(body.name || body.customer_name || "").trim();
  const phone = String(body.phone || body.customer_phone || "").trim();
  const email = String(body.email || body.customer_email || "").trim();
  const message = String(body.message || "").trim();
  const service = String(body.service || body.service_requested || "").trim();

  if (!id || !name) {
    return NextResponse.json(
      { ok: false, error: "name is required" },
      { status: 400 },
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Save submission to Supabase
  const submissionId = uuidv4();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("contact_form_submissions").insert({
        id: submissionId,
        prospect_id: id,
        business_name: prospect.businessName,
        customer_name: name,
        customer_phone: phone || null,
        customer_email: email || null,
        message: message || null,
        service_requested: service || null,
        submitted_at: new Date().toISOString(),
      });
    } catch {
      // Table may not exist yet
    }
  }

  // Build the schedule URL with prefilled customer info
  const scheduleParams = new URLSearchParams({ embed: "true" });
  if (name) scheduleParams.set("name", name);
  if (phone) scheduleParams.set("phone", phone);
  if (email) scheduleParams.set("email", email);
  const scheduleUrl = `${BASE_URL}/schedule/${id}?${scheduleParams.toString()}`;

  // Email the business owner about the new inquiry
  if (prospect.email) {
    const emailLines = [
      `New contact form submission for ${prospect.businessName}`,
      ``,
      `Name: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      service ? `Service requested: ${service}` : null,
      message ? `Message:\n"${message}"` : null,
      ``,
      `The customer was shown the scheduling calendar to book immediately.`,
      ``,
      `— BlueJays Contact System`,
    ].filter(Boolean).join("\n");

    await sendOwnerEmail(
      prospect.email,
      `New inquiry from ${name} — ${prospect.businessName}`,
      emailLines
    ).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    success: true,
    scheduleUrl,
    message: "Form received. Open scheduleUrl to let the customer book an appointment.",
  });
}

// CORS: Allow client websites hosted elsewhere to post forms here
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
