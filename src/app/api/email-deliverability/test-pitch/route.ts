import { NextRequest, NextResponse } from "next/server";
import { getPitchEmail } from "@/lib/email-templates";
import { getProspect } from "@/lib/store";
import type { Prospect } from "@/lib/types";

/**
 * POST /api/email-deliverability/test-pitch
 *
 * Sends a REAL pitch email (subject + multipart HTML body with inline
 * preview screenshot) to a test inbox — same template, same sender
 * identity, same SendGrid multipart shape as production outreach.
 *
 * Does NOT log to the emails table, doesn't increment the warmup counter,
 * doesn't create cost records. Pure preview tool so Ben can verify the
 * new inline-screenshot HTML renders correctly in Gmail/Apple Mail/etc.
 *
 * Body:
 *   {
 *     to:       "ben@bluejayportfolio.com",  // required — where to send
 *     prospectId?: "uuid",                    // optional — a real prospect
 *                                             // whose preview to embed.
 *                                             // defaults to a synthetic
 *                                             // "Ridgewood Plumbing" demo.
 *     domain?:  "bluejayportfolio.com"       // optional — which sender
 *   }
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
    const prospectId = (body.prospectId || "").trim();
    const domain = (body.domain || "bluejayportfolio.com").trim();

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Valid 'to' email address is required" },
        { status: 400 }
      );
    }

    // Build a real Prospect object. If `prospectId` was provided and
    // exists in Supabase, use that — gives an accurate render with a
    // real preview screenshot. Otherwise fall back to a synthetic demo
    // prospect so you can test without needing a specific UUID handy.
    let prospect: Prospect | null = null;
    if (prospectId) {
      prospect = (await getProspect(prospectId)) ?? null;
    }
    if (!prospect) {
      prospect = {
        id: prospectId || "00000000-0000-0000-0000-000000000001",
        businessName: "Ridgewood Plumbing",
        ownerName: "Mike Stevens",
        category: "plumber",
        phone: "(555) 123-4567",
        email: to,
        city: "Sequim",
        state: "WA",
        address: "123 Main St, Sequim, WA 98382",
        googleRating: 4.9,
        reviewCount: 47,
        currentWebsite: null,
        status: "approved",
        estimatedRevenueTier: "medium",
        source: "inbound",
        scrapedData: {},
        paymentStatus: undefined,
      } as unknown as Prospect;
    }

    // Generate the exact pitch template prod uses.
    const pitch = getPitchEmail(prospect);

    const SENDERS: Record<string, { email: string; name: string; replyTo?: string }> = {
      "bluejayportfolio.com": { email: "ben@bluejayportfolio.com", name: "Ben @ BlueJays" },
      "bluejaywebs.com": {
        email: "ben@bluejaywebs.com",
        name: "Ben @ BlueJays",
        replyTo: "bluejaycontactme@gmail.com",
      },
    };
    const from = SENDERS[domain] || SENDERS["bluejayportfolio.com"];

    // Multipart send: text/plain first (fallback), text/html second
    // (rendered by modern clients with the inline screenshot).
    const content: Array<{ type: string; value: string }> = [
      { type: "text/plain", value: pitch.body },
    ];
    if (pitch.htmlBody) {
      content.push({ type: "text/html", value: pitch.htmlBody });
    }

    // NOTE: we previously prefixed the subject with "[TEST] " but Gmail
    // flags "[TEST]" strings aggressively — it landed in Spam/Promotions
    // even for a trusted sender. Send with the REAL pitch subject instead
    // (the recipient is Ben's own inbox anyway — he'll recognize it).
    const payload: Record<string, unknown> = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.email, name: from.name },
      subject: pitch.subject,
      content,
      tracking_settings: {
        click_tracking: { enable: false, enable_text: false },
        open_tracking: { enable: false },
      },
      // Custom SendGrid header so this shows up in SendGrid Activity as a
      // test send (filterable by `category=test-pitch`) without affecting
      // the subject line.
      categories: ["test-pitch"],
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
        { success: false, error: `SendGrid ${response.status}: ${errText.substring(0, 300)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      to,
      from: from.email,
      domain,
      businessName: prospect.businessName,
      subject: pitch.subject,
      sendgridMessageId: response.headers.get("X-Message-Id") || null,
      hasHtml: Boolean(pitch.htmlBody),
      htmlLength: pitch.htmlBody?.length || 0,
      previewShotIncluded: Boolean(pitch.htmlBody?.includes("image.thum.io")),
      nextStep:
        "Open Gmail → find the [TEST] email → confirm the prospect's preview screenshot is embedded above the link + the link still works.",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
