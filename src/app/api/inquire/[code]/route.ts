import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Public inquiry endpoint — /api/inquire/[code]
 *
 * Receives form submissions from /inquire/[code] (a visitor on a
 * preview clicked a program like "Thrive Kids" and filled in the
 * learn-more form). Emails the prospect's contact email directly via
 * SendGrid so the visitor hears from the actual church/business, not
 * from BlueJays.
 *
 * Public route — no auth. Basic rate-limit by prospect (3 per minute).
 */

export const dynamic = "force-dynamic";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = "bluejaycontactme@gmail.com"; // per CLAUDE.md, hardcoded sender

// in-memory rate-limit bucket (resets on deploy — fine for an MVP)
const recentByProspect = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function tooMany(prospectId: string): boolean {
  const now = Date.now();
  const arr = (recentByProspect.get(prospectId) ?? []).filter((t) => now - t < LIMIT_WINDOW_MS);
  arr.push(now);
  recentByProspect.set(prospectId, arr);
  return arr.length > MAX_PER_WINDOW;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!/^[a-f0-9]{8}$/i.test(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, email, phone, message, programSlug, programLabel } = body as Record<string, string>;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, business_name, email, phone")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tooMany(prospect.id as string)) {
    return NextResponse.json({ error: "Too many messages — please wait a minute" }, { status: 429 });
  }

  const toEmail = (prospect.email as string) || "";
  if (!toEmail) {
    return NextResponse.json({ error: "This business doesn't have a contact email on file" }, { status: 400 });
  }

  const businessName = prospect.business_name as string;
  const programLine = programLabel ? `about ${programLabel}` : "";
  const subject = `New inquiry ${programLine ? programLine + " " : ""}from ${name.trim()}`;
  const text = [
    `You received a new inquiry from the ${businessName} website:`,
    ``,
    `Name:     ${name.trim()}`,
    `Email:    ${email.trim()}`,
    phone?.trim() ? `Phone:    ${phone.trim()}` : "",
    programLabel ? `Program:  ${programLabel}` : "",
    ``,
    `Message:`,
    message?.trim() || "(no message provided)",
    ``,
    `— Reply directly to this email to reach ${name.trim()}.`,
  ].filter(Boolean).join("\n");

  if (!SENDGRID_API_KEY) {
    // Dev / misconfigured environment — log so it's obvious, return success
    // so the form UX doesn't break for the visitor. The missing key is Ben's
    // problem to fix on Vercel, not a reason to 500 at the user.
    console.warn("[inquire] SENDGRID_API_KEY not set — would have emailed:", { toEmail, subject });
    return NextResponse.json({ ok: true, dev: true });
  }

  const payload = {
    personalizations: [
      {
        to: [{ email: toEmail, name: businessName }],
        // CC Ben so he can see inquiry volume per prospect. Adjust or
        // remove if privacy becomes a concern.
        cc: [{ email: "bluejaycontactme@gmail.com", name: "BlueJays" }],
      },
    ],
    from: { email: FROM_EMAIL, name: `${name.trim()} via BlueJays` },
    reply_to: { email: email.trim(), name: name.trim() },
    subject,
    content: [{ type: "text/plain", value: text }],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[inquire] SendGrid failed:", res.status, detail);
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
