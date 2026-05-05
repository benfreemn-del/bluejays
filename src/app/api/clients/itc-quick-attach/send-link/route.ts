import { NextRequest, NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/partner-auth";

/**
 * POST /api/clients/itc-quick-attach/send-link
 *
 * STUB — wired up by ITCCallWorkspace's send-config / send-brochure
 * buttons so the UI can fire-and-forget. Real Twilio + SendGrid
 * dispatch happens in a separate hardening pass; today this just
 * validates the request and returns ok so the workspace UX (sent
 * pill, timestamp stamp on the call record) works end-to-end.
 *
 * Body: {
 *   leadId?,
 *   kind: "config" | "brochure" | "catalog",
 *   phone?,    // tel: target if texting
 *   email?,    // email target if emailing
 *   url        // the link to send
 * }
 *
 * Returns: { ok: true, kind, channels: { sms?: boolean, email?: boolean } }
 */

const ALLOWED_KINDS = new Set(["config", "brochure", "catalog"]);

export async function POST(request: NextRequest) {
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
  }

  let body: {
    leadId?: string;
    kind?: string;
    phone?: string;
    email?: string;
    url?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const kind = (body.kind || "").trim();
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ ok: false, error: "Unknown kind" }, { status: 400 });
  }

  const url = (body.url || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { status: 400 });
  }

  const phone = (body.phone || "").trim();
  const email = (body.email || "").trim();
  if (!phone && !email) {
    return NextResponse.json(
      { ok: false, error: "phone or email required" },
      { status: 400 },
    );
  }

  // STUB: real dispatch is a hardening pass. Today we just acknowledge
  // so the UI can stamp config_link_sent_at / brochure_sent_at via the
  // log-call endpoint. Once Twilio + SendGrid are wired for ITC, this
  // route fires the actual SMS + email and returns the message IDs.
  console.log("[itc send-link] STUB", {
    partner: partner.code,
    kind,
    leadId: body.leadId,
    hasPhone: !!phone,
    hasEmail: !!email,
    url,
  });

  return NextResponse.json({
    ok: true,
    kind,
    channels: {
      sms: !!phone,
      email: !!email,
    },
    note: "stub — real dispatch lands in the next hardening pass",
  });
}
