/**
 * POST /api/schedule/book/[id]
 *
 * Creates a booking for a client's business and sends confirmation
 * to the customer via SMS and/or email, depending on what's available.
 *
 * Body: { slotIso, slotLabel, date, contactName, phone?, email?, notes? }
 *
 * If Calendly is configured, also creates a real Calendly invitee.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
// Rule 67 (locked 2026-05-12): hardcode FROM_EMAIL.
const FROM_EMAIL = "bluejaycontactme@gmail.com";

// Default appointment duration in minutes
const APPT_DURATION_MIN = 60;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
  });
}

/** Convert ISO string to ICS datetime format: YYYYMMDDTHHMMSSZ */
function toIcsDateTime(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Build an .ics file string for the appointment. */
function buildIcsContent(args: {
  uid: string;
  startIso: string;
  endIso: string;
  summary: string;
  description: string;
  organizerEmail: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BlueJays//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${args.uid}@bluejayportfolio.com`,
    `DTSTAMP:${toIcsDateTime(new Date().toISOString())}`,
    `DTSTART:${toIcsDateTime(args.startIso)}`,
    `DTEND:${toIcsDateTime(args.endIso)}`,
    `SUMMARY:${args.summary}`,
    `DESCRIPTION:${args.description.replace(/\n/g, "\\n")}`,
    `ORGANIZER:mailto:${args.organizerEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Build a one-click Google Calendar URL for the appointment. */
function buildGoogleCalUrl(args: {
  title: string;
  startIso: string;
  endIso: string;
  details: string;
}): string {
  const fmt = (s: string) => new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: args.title,
    dates: `${fmt(args.startIso)}/${fmt(args.endIso)}`,
    details: args.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendConfirmationSms(to: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) return false;
  const phone = to.replace(/\D/g, "");
  const formatted = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: formatted, From: TWILIO_PHONE_NUMBER, Body: message }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function sendConfirmationEmail(args: {
  to: string;
  subject: string;
  plainText: string;
  htmlBody: string;
  icsContent: string;
  icsFilename: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) return false;
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.to }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Scheduling" },
        subject: args.subject,
        content: [
          { type: "text/plain", value: args.plainText },
          { type: "text/html", value: args.htmlBody },
        ],
        attachments: [
          {
            content: Buffer.from(args.icsContent).toString("base64"),
            filename: args.icsFilename,
            type: "text/calendar; method=REQUEST",
            disposition: "attachment",
          },
        ],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function createCalendlyInvitee(
  calendlyUrl: string,
  name: string,
  email: string,
  slotIso: string
): Promise<void> {
  const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
  if (!token || !email) return;
  try {
    // Resolve event type URI from URL
    const urlParts = calendlyUrl.replace(/\/$/, "").split("/");
    const userSlug = urlParts[urlParts.length - 2];
    const eventSlug = urlParts[urlParts.length - 1];

    const etRes = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(`https://api.calendly.com/users/${userSlug}`)}&slug=${eventSlug}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!etRes.ok) return;
    const etData = await etRes.json();
    const eventTypeUri = etData.collection?.[0]?.uri;
    if (!eventTypeUri) return;

    // Create invitee
    await fetch("https://api.calendly.com/scheduled_events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventTypeUri,
        start_time: slotIso,
        invitees: [{ email, name }],
      }),
    });
  } catch {
    // Non-blocking — booking is saved regardless
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const {
    slotIso,
    slotLabel,
    date,
    contactName,
    phone,
    email,
    notes,
  } = body as {
    slotIso: string;
    slotLabel: string;
    date: string;
    contactName: string;
    phone?: string;
    email?: string;
    notes?: string;
  };

  if (!slotIso || !contactName || (!phone && !email)) {
    return NextResponse.json(
      { error: "slotIso, contactName, and phone or email are required" },
      { status: 400 }
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const bookingId = uuidv4();
  const booking = {
    id: bookingId,
    prospect_id: id,
    business_name: prospect.businessName,
    contact_name: contactName,
    phone: phone || null,
    email: email || null,
    slot_iso: slotIso,
    slot_label: slotLabel,
    date,
    notes: notes || null,
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  // Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("schedule_bookings").insert(booking);
    } catch {
      // Table may not exist yet — best effort
    }
  }

  // Also mirror into the existing calendar_bookings table for backwards compat
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("calendar_bookings").insert({
        id: bookingId,
        prospect_id: id,
        business_name: prospect.businessName,
        contact_name: contactName,
        email: email || "",
        phone: phone || null,
        slot_iso: slotIso,
        timezone: "America/Los_Angeles",
        notes: notes || null,
        created_at: new Date().toISOString(),
      });
    } catch { /* ignore */ }
  }

  const dateFormatted = formatDate(slotIso);
  const timeFormatted = formatTime(slotIso);
  const firstName = contactName.split(" ")[0];

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const endIso = new Date(new Date(slotIso).getTime() + APPT_DURATION_MIN * 60 * 1000).toISOString();
  const apptDescription = [
    `Appointment with ${prospect.businessName}`,
    `Date: ${dateFormatted}`,
    `Time: ${timeFormatted} (Pacific Time)`,
    notes ? `Notes: ${notes}` : null,
  ].filter(Boolean).join("\n");
  const icsFile = buildIcsContent({
    uid: bookingId,
    startIso: slotIso,
    endIso,
    summary: `Appointment at ${prospect.businessName}`,
    description: apptDescription,
    organizerEmail: prospect.email || FROM_EMAIL,
  });
  const googleCalUrl = buildGoogleCalUrl({
    title: `Appointment at ${prospect.businessName}`,
    startIso: slotIso,
    endIso,
    details: apptDescription,
  });

  // ── Confirmation SMS ──────────────────────────────────────────────────────
  let smsSent = false;
  if (phone) {
    const smsBody = [
      `Hi ${firstName}! Your appointment with ${prospect.businessName} is confirmed.`,
      `📅 ${dateFormatted}`,
      `🕐 ${timeFormatted} (Pacific Time)`,
      `We'll see you then! Reply to this number if you need to reschedule.`,
    ].join("\n");
    smsSent = await sendConfirmationSms(phone, smsBody);
  }

  // ── Confirmation Email ────────────────────────────────────────────────────
  let emailSent = false;
  if (email) {
    const plainText = [
      `Hi ${firstName},`,
      ``,
      `Your appointment with ${prospect.businessName} has been confirmed.`,
      ``,
      `Date: ${dateFormatted}`,
      `Time: ${timeFormatted} (Pacific Time)`,
      notes ? `Notes: ${notes}` : null,
      ``,
      `Add to Google Calendar: ${googleCalUrl}`,
      `Or open the attached .ics file to add to Apple Calendar or Outlook.`,
      ``,
      `If you need to reschedule, please contact us directly.`,
      ``,
      `See you then!`,
      `— ${prospect.businessName}`,
    ].filter((l) => l !== null).join("\n");

    const htmlBody = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#1e40af;margin-bottom:16px;">Appointment Confirmed ✓</h2>
<p>Hi ${firstName},</p>
<p>Your appointment with <strong>${prospect.businessName}</strong> has been confirmed.</p>
<table style="margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Date</td><td style="padding:4px 0;"><strong>${dateFormatted}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Time</td><td style="padding:4px 0;"><strong>${timeFormatted} (Pacific Time)</strong></td></tr>
${notes ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Notes</td><td style="padding:4px 0;">${notes}</td></tr>` : ""}
</table>
<div style="margin:24px 0;">
<a href="${googleCalUrl}" target="_blank" style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">+ Add to Google Calendar</a>
</div>
<p style="color:#6b7280;font-size:13px;">Or open the attached .ics file to add to Apple Calendar, Outlook, or any other calendar app.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
<p style="color:#6b7280;font-size:13px;">If you need to reschedule, please contact us directly.</p>
<p>See you then!<br><strong>— ${prospect.businessName}</strong></p>
</div>`;

    emailSent = await sendConfirmationEmail({
      to: email,
      subject: `Appointment confirmed — ${prospect.businessName}`,
      plainText,
      htmlBody,
      icsContent: icsFile,
      icsFilename: "appointment.ics",
    });
  }

  // ── Alert business owner ─────────────────────────────────────────────────
  if (prospect.email) {
    const ownerPlain = [
      `New appointment booked for ${prospect.businessName}`,
      ``,
      `Customer: ${contactName}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      `Date: ${dateFormatted}`,
      `Time: ${timeFormatted} (Pacific Time)`,
      notes ? `Notes: ${notes}` : null,
      ``,
      `Add to calendar: ${googleCalUrl}`,
    ].filter((l) => l !== null).join("\n");

    const ownerHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#1e40af;margin-bottom:16px;">New Booking — ${prospect.businessName}</h2>
<table style="margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Customer</td><td style="padding:4px 0;"><strong>${contactName}</strong></td></tr>
${phone ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Phone</td><td style="padding:4px 0;">${phone}</td></tr>` : ""}
${email ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Email</td><td style="padding:4px 0;">${email}</td></tr>` : ""}
<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Date</td><td style="padding:4px 0;"><strong>${dateFormatted}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Time</td><td style="padding:4px 0;"><strong>${timeFormatted} (Pacific Time)</strong></td></tr>
${notes ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-weight:600;">Notes</td><td style="padding:4px 0;">${notes}</td></tr>` : ""}
</table>
<div style="margin:24px 0;">
<a href="${googleCalUrl}" target="_blank" style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">+ Add to Google Calendar</a>
</div>
<p style="color:#6b7280;font-size:13px;">Or open the attached .ics file for Apple Calendar / Outlook.</p>
</div>`;

    await sendConfirmationEmail({
      to: prospect.email,
      subject: `New booking from ${contactName} — ${prospect.businessName}`,
      plainText: ownerPlain,
      htmlBody: ownerHtml,
      icsContent: icsFile,
      icsFilename: "appointment.ics",
    }).catch(() => {});
  }

  // ── Calendly sync (if configured) ────────────────────────────────────────
  const calendlyUrl = (prospect as { calendlyUrl?: string }).calendlyUrl ||
    (prospect.scrapedData?.calendlyUrl as string | undefined);
  if (calendlyUrl && email) {
    await createCalendlyInvitee(calendlyUrl, contactName, email, slotIso);
  }

  return NextResponse.json({
    success: true,
    bookingId,
    dateFormatted,
    timeFormatted,
    businessName: prospect.businessName,
    smsSent,
    emailSent,
  });
}
