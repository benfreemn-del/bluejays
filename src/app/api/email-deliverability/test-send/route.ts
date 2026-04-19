import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/email-deliverability/test-send
 *
 * Sends a one-off deliverability test email to the address in the request
 * body, using the exact same From + DKIM + SendGrid config as production
 * outreach. Does NOT touch the warmup tracker, doesn't log to Supabase,
 * doesn't create cost records. Pure DNS/auth verification tool.
 *
 * Body: { to: "your-gmail@gmail.com", domain?: "bluejayportfolio.com" }
 *
 * After the email arrives in Gmail, open it, click the three-dot menu →
 * "Show original" → look for SPF: PASS, DKIM: PASS, DMARC: PASS. All three
 * passing = domain is ready for high-volume sending.
 */
export async function POST(request: NextRequest) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    return NextResponse.json(
      { error: "SENDGRID_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const to = (body.to || "").trim();
    const domain = (body.domain || "bluejayportfolio.com").trim();

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Valid 'to' email address is required" },
        { status: 400 }
      );
    }

    // Use the same per-domain sender identity as production (keeps DKIM
    // alignment consistent between the test and the real sends).
    const SENDERS: Record<string, { email: string; name: string; replyTo?: string }> = {
      "bluejayportfolio.com": {
        email: "ben@bluejayportfolio.com",
        name: "Ben @ BlueJays",
      },
      "bluejaywebs.com": {
        email: "ben@bluejaywebs.com",
        name: "Ben @ BlueJays",
        replyTo: "bluejaycontactme@gmail.com",
      },
    };
    const from = SENDERS[domain] || SENDERS["bluejayportfolio.com"];

    const timestamp = new Date().toISOString();
    const subject = `BlueJays deliverability test — ${timestamp}`;
    const content = [
      `This is an automated deliverability test sent at ${timestamp}.`,
      `Sending domain: ${domain}`,
      `From address: ${from.email}`,
      ``,
      `To verify SPF/DKIM/DMARC alignment:`,
      `1. Open this email in Gmail web`,
      `2. Click the three-dot menu → "Show original"`,
      `3. Confirm all three lines read PASS:`,
      `   SPF:   PASS`,
      `   DKIM:  PASS`,
      `   DMARC: PASS`,
      ``,
      `If any fail, check the DNS records for ${domain} (SPF TXT record, s1/s2 DKIM CNAMEs, DMARC TXT).`,
    ].join("\n");

    const payload: Record<string, unknown> = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.email, name: from.name },
      subject,
      content: [{ type: "text/plain", value: content }],
    };
    if (from.replyTo) payload.reply_to = { email: from.replyTo };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        {
          success: false,
          error: `SendGrid ${response.status}: ${errText.substring(0, 300)}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      to,
      from: from.email,
      domain,
      subject,
      sentAt: timestamp,
      nextStep:
        "Open Gmail → find the test email → three-dot menu → 'Show original' → verify SPF/DKIM/DMARC all PASS.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
