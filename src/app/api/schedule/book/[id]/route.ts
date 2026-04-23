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
const FROM_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";

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

async function sendConfirmationEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!SENDGRID_API_KEY) return false;
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Scheduling" },
        subject,
        content: [{ type: "text/plain", value: body }],
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
    const emailBody = [
      `Hi ${firstName},`,
      ``,
      `Your appointment with ${prospect.businessName} has been confirmed.`,
      ``,
      `Date: ${dateFormatted}`,
      `Time: ${timeFormatted} (Pacific Time)`,
      notes ? `Notes: ${notes}` : null,
      ``,
      `If you need to reschedule, please contact us directly.`,
      ``,
      `See you then!`,
      `— ${prospect.businessName}`,
    ].filter((l) => l !== null).join("\n");

    emailSent = await sendConfirmationEmail(
      email,
      `Appointment confirmed — ${prospect.businessName}`,
      emailBody
    );
  }

  // ── Alert business owner ─────────────────────────────────────────────────
  if (prospect.email) {
    const ownerBody = [
      `New appointment booked for ${prospect.businessName}`,
      ``,
      `Customer: ${contactName}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      `Date: ${dateFormatted}`,
      `Time: ${timeFormatted} (Pacific Time)`,
      notes ? `Notes: ${notes}` : null,
    ].filter((l) => l !== null).join("\n");

    await sendConfirmationEmail(
      prospect.email,
      `New booking from ${contactName} — ${prospect.businessName}`,
      ownerBody
    ).catch(() => {});
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
