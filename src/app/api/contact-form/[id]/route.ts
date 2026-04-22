/**
 * POST /api/contact-form/[id]
 *
 * Contact form handler for client business websites.
 * When a visitor fills out the contact/inquiry form on the client's website,
 * this endpoint:
 *   1. Saves the submission to Supabase
 *   2. Sends the visitor an automatic SMS with a booking link
 *   3. Emails the business owner with the lead details
 *
 * Client websites embed this as their form action.
 * Body: { name, phone, email?, message?, service? }
 *
 * Booking link: /book/[prospectId] (existing booking page)
 * Or optionally override with client's own Calendly link.
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
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

async function sendAutoSms(to: string, message: string): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) return false;
  const phone = to.replace(/\D/g, "");
  const formatted = phone.startsWith("1") ? `+${phone}` : `+1${phone}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: formatted, From: TWILIO_PHONE_NUMBER, Body: message }),
  });
  return res.ok;
}

async function sendOwnerEmail(ownerEmail: string, subject: string, body: string): Promise<void> {
  if (!SENDGRID_API_KEY) return;
  await fetch("https://api.sendgrid.com/v3/mail/send", {
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
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { name, phone, email, message, service } = body as {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    service?: string;
  };

  if (!id || !name || !phone) {
    return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const submissionId = uuidv4();
  const submission = {
    id: submissionId,
    prospect_id: id,
    business_name: prospect.businessName,
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    message: message || null,
    service_requested: service || null,
    submitted_at: new Date().toISOString(),
    sms_sent: false,
    email_sent: false,
  };

  // Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("contact_form_submissions").insert(submission);
    } catch {
      // Table may not exist yet
    }
  }

  // Auto-SMS to the person who filled out the form
  // Includes booking link so they can pick a time immediately
  const bookingUrl = `${BASE_URL}/book/${id}`;
  const firstName = name.split(" ")[0];
  const autoSmsText = [
    `Hi ${firstName}! Thanks for reaching out to ${prospect.businessName}.`,
    `We received your message and will be in touch shortly.`,
    `Want to pick a time now? Book here: ${bookingUrl}`,
  ].join(" ");

  const smsSent = await sendAutoSms(phone, autoSmsText).catch(() => false);

  // Email the business owner about the new lead
  if (prospect.email) {
    const emailLines = [
      `New contact form submission for ${prospect.businessName}`,
      ``,
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      service ? `Service requested: ${service}` : null,
      message ? `Message:\n${message}` : null,
      ``,
      `A booking link was automatically texted to the customer.`,
      `Booking page: ${bookingUrl}`,
      ``,
      `— BlueJays Contact System`,
    ].filter(Boolean).join("\n");

    await sendOwnerEmail(
      prospect.email,
      `New inquiry from ${name} — ${prospect.businessName}`,
      emailLines
    ).catch(() => {});
  }

  // Update Supabase with delivery status
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("contact_form_submissions").update({
        sms_sent: smsSent,
        email_sent: !!prospect.email,
      }).eq("id", submissionId);
    } catch { /* best effort */ }
  }

  return NextResponse.json({
    success: true,
    smsSent,
    bookingUrl,
    message: "Thanks! We'll be in touch shortly.",
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
