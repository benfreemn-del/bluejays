import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
const OWNER_EMAIL = process.env.ADMIN_EMAIL || "ben@bluejayportfolio.com";
// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";
const FALLBACK_PATH = path.join(process.cwd(), "data", "change-requests.json");

type ChangeRequestPayload = {
  prospectId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  requestText?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChangeRequestPayload;
    const prospectId = body.prospectId?.trim();
    const requestText = body.requestText?.trim();
    const customerName = body.customerName?.trim() || "";
    const customerEmail = body.customerEmail?.trim() || "";
    const customerPhone = body.customerPhone?.trim() || "";

    if (!prospectId) {
      return NextResponse.json({ error: "Missing prospectId" }, { status: 400 });
    }

    if (!requestText) {
      return NextResponse.json({ error: "Please describe the requested changes" }, { status: 400 });
    }

    if (!customerEmail && !customerPhone) {
      return NextResponse.json(
        { error: "Please provide an email address or phone number" },
        { status: 400 }
      );
    }

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const createdAt = new Date().toISOString();
    const changeRequestRecord = {
      prospect_id: prospectId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      request_text: requestText,
      status: "pending",
      created_at: createdAt,
      updated_at: createdAt,
    };

    let storedRecord: Record<string, unknown> = changeRequestRecord;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("change_requests")
        .insert(changeRequestRecord)
        .select()
        .single();

      if (error) {
        console.error("[Change Requests] Supabase insert failed:", error);
        return NextResponse.json(
          { error: "Unable to save the change request right now" },
          { status: 500 }
        );
      }

      storedRecord = data as Record<string, unknown>;
    } else {
      await saveFallbackChangeRequest(storedRecord);
    }

    await notifyOwnerChangeRequest({
      businessName: prospect.businessName,
      prospectId,
      customerName,
      customerEmail,
      customerPhone,
      requestText,
    });

    return NextResponse.json({ success: true, changeRequest: storedRecord });
  } catch (error) {
    console.error("[Change Requests] POST failed:", error);
    return NextResponse.json(
      { error: "Unable to submit the change request" },
      { status: 500 }
    );
  }
}

async function saveFallbackChangeRequest(record: Record<string, unknown>) {
  await fs.mkdir(path.dirname(FALLBACK_PATH), { recursive: true });

  let existing: Record<string, unknown>[] = [];
  try {
    const raw = await fs.readFile(FALLBACK_PATH, "utf8");
    existing = JSON.parse(raw) as Record<string, unknown>[];
  } catch {
    existing = [];
  }

  existing.push(record);
  await fs.writeFile(FALLBACK_PATH, JSON.stringify(existing, null, 2));
}

async function notifyOwnerChangeRequest({
  businessName,
  prospectId,
  customerName,
  customerEmail,
  customerPhone,
  requestText,
}: {
  businessName: string;
  prospectId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestText: string;
}) {
  if (!SENDGRID_API_KEY) {
    console.log("[Change Requests] SendGrid not configured — skipping owner email");
    return;
  }

  const adminUrl = `${BASE_URL}/lead/${prospectId}`;
  const escapedBusinessName = escapeHtml(businessName);
  const escapedCustomerName = escapeHtml(customerName || "Not provided");
  const escapedCustomerEmail = escapeHtml(customerEmail || "Not provided");
  const escapedCustomerPhone = escapeHtml(customerPhone || "Not provided");
  const escapedRequestText = escapeHtml(requestText).replace(/\n/g, "<br />");

  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: OWNER_EMAIL }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Change Requests" },
        subject: `Customer change request: ${businessName}`,
        content: [
          {
            type: "text/html",
            value: `
              <h2>Customer requested changes</h2>
              <table style="border-collapse:collapse;font-family:sans-serif;">
                <tr><td style="padding:4px 12px;font-weight:bold;">Business:</td><td style="padding:4px 12px;">${escapedBusinessName}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Customer name:</td><td style="padding:4px 12px;">${escapedCustomerName}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Customer email:</td><td style="padding:4px 12px;">${escapedCustomerEmail}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Customer phone:</td><td style="padding:4px 12px;">${escapedCustomerPhone}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;vertical-align:top;">Requested changes:</td><td style="padding:4px 12px;">${escapedRequestText}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Admin link:</td><td style="padding:4px 12px;"><a href="${adminUrl}">${adminUrl}</a></td></tr>
              </table>
            `,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("[Change Requests] Failed to send owner email:", error);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
