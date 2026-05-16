import { NextRequest, NextResponse } from "next/server";
import { sendOwnerAlert, sendOwnerEmail } from "@/lib/alerts";

/**
 * POST /api/clients/mt-view-landscaping/contact
 *
 * Customer-facing estimate request endpoint for Mountain View Landscape
 * & Design (mtviewlandscaping.com — paying $100/year hosted client).
 *
 * Unlike /api/clients/inquire (which routes leads to Ben for forwarding
 * to client owners), this endpoint sends the email DIRECTLY to Mt View's
 * inbox — they're the audience, since these are their customers.
 *
 * Flow:
 *   - Validate name + (email || phone) + message
 *   - Send a structured plaintext + HTML email to mtviewlandscapeonline@gmail.com
 *     via SendGrid
 *   - Send Ben a short SMS + email so he can verify deliverability
 *     (especially during the first weeks after domain transfer)
 *   - Return { ok: true } / { ok: false, error }
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CLIENT_EMAIL = "mtviewlandscapeonline@gmail.com";
const CLIENT_NAME = "Mountain View Landscape & Design";

// in-memory rate limit — resets on deploy, fine for low-volume contact form
const recentByIp = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (recentByIp.get(ip) ?? []).filter((t) => now - t < LIMIT_WINDOW_MS);
  arr.push(now);
  recentByIp.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendToClient(args: {
  subject: string;
  textBody: string;
  htmlBody: string;
  replyToEmail?: string;
  replyToName?: string;
}): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  // Rule 67 (locked 2026-05-12): hardcode FROM_EMAIL. Env fallback
  // silently 403s on sender-auth failures.
  const FROM_EMAIL = "bluejaycontactme@gmail.com";

  if (!SENDGRID_API_KEY) {
    console.log(
      `  [mt-view contact - would email ${CLIENT_EMAIL}]: ${args.subject}\n${args.textBody}`,
    );
    return false;
  }

  const personalization: {
    to: { email: string; name?: string }[];
  } = {
    to: [{ email: CLIENT_EMAIL, name: CLIENT_NAME }],
  };

  const body: Record<string, unknown> = {
    personalizations: [personalization],
    from: { email: FROM_EMAIL, name: "Mt View Website" },
    subject: args.subject,
    content: [
      { type: "text/plain", value: args.textBody },
      { type: "text/html", value: args.htmlBody },
    ],
  };

  if (args.replyToEmail) {
    body.reply_to = {
      email: args.replyToEmail,
      ...(args.replyToName ? { name: args.replyToName } : {}),
    };
  }

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(
        "[mt-view contact] SendGrid returned",
        res.status,
        await res.text(),
      );
    }
    return res.ok;
  } catch (err) {
    console.error("[mt-view contact] SendGrid failed:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (tooMany(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — please try again in a minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const propertyAddress = String(body.property_address || "").trim();
  const service = String(body.service || "").trim();
  const preferredContact = String(body.preferred_contact || "").trim();
  const message = String(body.message || "").trim();

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Please tell us your name." },
      { status: 400 },
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "Please leave an email or phone number." },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json(
      { ok: false, error: "A few words about your project helps us prepare." },
      { status: 400 },
    );
  }

  const firstName = name.split(/\s+/)[0] || name;
  const subject = `[Mt View Site] New estimate request from ${firstName}`;

  // Plain-text body — what shows up in any email client.
  const textLines = [
    `New estimate request from your website (mtviewlandscaping.com)`,
    ``,
    `Name:       ${name}`,
    `Email:      ${email || "(not provided)"}`,
    `Phone:      ${phone || "(not provided)"}`,
    `Address:    ${propertyAddress || "(not provided)"}`,
    `Service:    ${service || "(not specified)"}`,
    `Prefers:    ${preferredContact || "Either"}`,
    ``,
    `Message:`,
    message,
    ``,
    `— Sent from your Mountain View Landscape & Design website.`,
    `   IP: ${ip}`,
  ];
  const textBody = textLines.join("\n");

  // HTML version — clean, scannable for mobile.
  const htmlBody = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1a1612;max-width:600px">
  <div style="background:#1a2e1a;color:#f8f5ef;padding:20px 24px;font-family:Georgia,serif">
    <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#cfe0a8;margin-bottom:6px">New estimate request</div>
    <div style="font-size:22px;line-height:1.2">${escapeHtml(name)} just contacted you</div>
  </div>
  <div style="border:1px solid #e5e3dc;border-top:none;padding:24px;background:#f8f5ef">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tbody>
        <tr><td style="padding:6px 0;color:#5a6a4f;width:120px;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Name</td><td style="padding:6px 0;color:#1a1612"><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Email</td><td style="padding:6px 0">${email ? `<a href="mailto:${escapeHtml(email)}" style="color:#1a2e1a">${escapeHtml(email)}</a>` : '<span style="color:#999">(not provided)</span>'}</td></tr>
        <tr><td style="padding:6px 0;color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Phone</td><td style="padding:6px 0">${phone ? `<a href="tel:${escapeHtml(phone)}" style="color:#1a2e1a">${escapeHtml(phone)}</a>` : '<span style="color:#999">(not provided)</span>'}</td></tr>
        <tr><td style="padding:6px 0;color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Address</td><td style="padding:6px 0">${propertyAddress ? escapeHtml(propertyAddress) : '<span style="color:#999">(not provided)</span>'}</td></tr>
        <tr><td style="padding:6px 0;color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Service</td><td style="padding:6px 0">${escapeHtml(service || "Not specified")}</td></tr>
        <tr><td style="padding:6px 0;color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px">Prefers</td><td style="padding:6px 0">${escapeHtml(preferredContact || "Either")}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:18px;padding-top:18px;border-top:1px solid #d6d3c8">
      <div style="color:#5a6a4f;text-transform:uppercase;letter-spacing:0.12em;font-size:11px;margin-bottom:8px">Message</div>
      <div style="white-space:pre-wrap;color:#1a1612">${escapeHtml(message)}</div>
    </div>
  </div>
  <div style="padding:16px 0;font-size:12px;color:#8a8a82;text-align:center">
    Sent from mtviewlandscaping.com &middot; Reply directly to this email to respond to ${escapeHtml(firstName)}.
  </div>
</div>
`.trim();

  // 1) Email Mt View directly. Reply-To set to the customer so a simple
  //    "Reply" in Gmail goes back to them, not to the website.
  const clientOk = await sendToClient({
    subject,
    textBody,
    htmlBody,
    replyToEmail: email || undefined,
    replyToName: email ? name : undefined,
  });

  // 2) Quietly notify Ben so he can verify deliverability + watch volume.
  //    Best-effort, don't fail the user request if these flop.
  const benSummary = [
    `Mt View site — new estimate request${clientOk ? "" : " (CLIENT EMAIL FAILED)"}`,
    ``,
    `From: ${name}`,
    `  ${email || "(no email)"}`,
    `  ${phone || "(no phone)"}`,
    ``,
    `Service: ${service || "(unspecified)"}`,
    `Address: ${propertyAddress || "(none)"}`,
    ``,
    `Forwarded to: ${CLIENT_EMAIL}${clientOk ? " ✓" : " ✗"}`,
  ].join("\n");

  await Promise.allSettled([
    sendOwnerAlert(
      `🌲 Mt View — ${name}${clientOk ? "" : " (delivery failed)"}\n${email || phone}`,
    ).catch((err) => console.error("[mt-view contact] owner SMS failed:", err)),
    sendOwnerEmail({
      subject: `[Mt View] Estimate request from ${name}${clientOk ? "" : " — DELIVERY FAILED"}`,
      body: benSummary,
    }).catch((err) => console.error("[mt-view contact] owner email failed:", err)),
  ]);

  // We treat the request as successful even if SendGrid is misconfigured
  // in dev (no API key) — Ben will still see the SMS/email log line. In
  // production, sendToClient returning false is logged for triage.
  return NextResponse.json({ ok: true });
}
