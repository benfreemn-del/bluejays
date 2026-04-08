import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { scrapeWebsite } from "@/lib/scraper";
import { alertOwner } from "@/lib/alerts";
import { logCost, COST_RATES } from "@/lib/cost-logger";
import type { Prospect, Category } from "@/lib/types";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const OWNER_EMAIL = "bluejaycontactme@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER || "+12538863753";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function notifyOwnerEmail(lead: { businessName: string; phone: string; email?: string; category?: string; website?: string; city?: string }) {
  if (!SENDGRID_API_KEY) {
    console.log("[Lead Submit] SendGrid not configured — skipping email notification");
    return;
  }
  try {
    const htmlBody = `
      <h2>New Inbound Lead!</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:4px 12px;font-weight:bold;">Business:</td><td style="padding:4px 12px;">${lead.businessName}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Phone:</td><td style="padding:4px 12px;">${lead.phone}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Email:</td><td style="padding:4px 12px;">${lead.email || "N/A"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Industry:</td><td style="padding:4px 12px;">${lead.category || "Not specified"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">City:</td><td style="padding:4px 12px;">${lead.city || "N/A"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Website:</td><td style="padding:4px 12px;">${lead.website || "None"}</td></tr>
      </table>
      <p style="margin-top:16px;">Check the dashboard for details.</p>
    `;
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: OWNER_EMAIL }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Leads" },
        subject: `New Lead: ${lead.businessName} (${lead.category || "Unknown"})`,
        content: [{ type: "text/html", value: htmlBody }],
      }),
    });

    await logCost({
      service: "sendgrid_email",
      action: "owner_lead_notification",
      costUsd: COST_RATES.sendgrid_email,
      metadata: { businessName: lead.businessName, type: "lead_notification" },
    });
  } catch (err) {
    console.error("[Lead Submit] Email notification failed:", err);
  }
}

async function notifyOwnerSms(lead: { businessName: string; phone: string; category?: string }) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log("[Lead Submit] Twilio not configured — skipping SMS notification");
    return;
  }
  try {
    const msg = `BlueJays: New lead! ${lead.businessName} (${lead.category || "Unknown"}) — ${lead.phone}. Check dashboard.`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const smsRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: OWNER_PHONE,
        From: TWILIO_PHONE_NUMBER,
        Body: msg,
      }),
    });

    if (smsRes.ok) {
      await logCost({
        service: "twilio_sms",
        action: "owner_lead_sms",
        costUsd: COST_RATES.twilio_sms,
        metadata: { businessName: lead.businessName, type: "lead_notification" },
      });
    }
  } catch (err) {
    console.error("[Lead Submit] SMS notification failed:", err);
  }
}

// PUBLIC endpoint — no auth required
// Receives a lead submission from the /get-started form
// Scrapes their info, generates a preview site, notifies owner

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, ownerName, phone, email, website, category, city, state } = body;

  if (!businessName || !phone) {
    return NextResponse.json({ error: "Business name and phone required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  // Create prospect
  const prospect: Prospect = {
    id,
    businessName,
    ownerName: ownerName || undefined,
    phone,
    email: email || undefined,
    address: "",
    city: city || "Unknown",
    state: state || "",
    category: (category as Category) || "general-contractor",
    currentWebsite: website || undefined,
    estimatedRevenueTier: "medium",
    status: "scouted",
    createdAt: now,
    updatedAt: now,
  };

  // Scrape their website if they have one
  if (website) {
    try {
      const scraped = await scrapeWebsite(website);
      prospect.scrapedData = scraped;
      prospect.status = "scraped";

      // Try to detect state from scraped address data if not provided by form
      if (!prospect.state && scraped?.address) {
        const stateMatch = scraped.address.match(/\b([A-Z]{2})\s*\d{5}/);
        if (stateMatch) {
          prospect.state = stateMatch[1];
        }
      }
    } catch {
      // Scrape failed, continue without
    }
  }

  // Save to store
  await addProspect(prospect);

  // Generate preview site
  try {
    await generatePreview(prospect);
  } catch {
    // Generation failed, they're still in the system
  }

  // Alert Ben — new inbound lead!
  await alertOwner({
    type: "high-value-lead",
    message: `🔥 INBOUND LEAD: ${businessName} just submitted the form!\nPhone: ${phone}\nEmail: ${email || "N/A"}\nCategory: ${category || "Unknown"}\nWebsite: ${website || "None"}\n\nSite is being generated — check dashboard.`,
    prospect,
    timestamp: now,
  });

  // Send email + SMS notifications to Ben
  await Promise.allSettled([
    notifyOwnerEmail({ businessName, phone, email, category, website, city }),
    notifyOwnerSms({ businessName, phone, category }),
  ]);

  console.log(`  🎯 New inbound lead: ${businessName} (${phone})`);

  return NextResponse.json({
    success: true,
    message: "Your website is being built! We'll notify you within 48 hours.",
    prospectId: id,
  });
}
