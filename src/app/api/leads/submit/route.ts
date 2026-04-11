import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { scrapeWebsite } from "@/lib/scraper";
import { alertOwner } from "@/lib/alerts";
import { logCost, COST_RATES } from "@/lib/cost-logger";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import { canonicalizeCity, normalizeAddress } from "@/lib/address-normalizer";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const OWNER_EMAIL = "bluejaycontactme@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER || "+12538863753";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/* ─── Helpers ─── */

const validCategories = new Set(Object.keys(CATEGORY_CONFIG));

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.trim();
}

/* ─── Notifications ─── */

async function notifyOwnerEmail(lead: {
  businessName: string;
  phone: string;
  email?: string;
  category?: string;
  website?: string;
  city?: string;
  state?: string;
  ownerName?: string;
}) {
  if (!SENDGRID_API_KEY) {
    console.log("[Lead Submit] SendGrid not configured — skipping email notification");
    return;
  }
  try {
    const htmlBody = `
      <h2 style="color:#f59e0b;">&#x1F525; New Inbound Lead!</h2>
      <p style="color:#666;font-size:14px;">This lead submitted themselves via the website — warm inbound, prioritize review.</p>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:4px 12px;font-weight:bold;">Business:</td><td style="padding:4px 12px;">${lead.businessName}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Owner:</td><td style="padding:4px 12px;">${lead.ownerName || "N/A"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Phone:</td><td style="padding:4px 12px;">${lead.phone}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Email:</td><td style="padding:4px 12px;">${lead.email || "N/A"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Industry:</td><td style="padding:4px 12px;">${lead.category || "Not specified"}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Location:</td><td style="padding:4px 12px;">${lead.city || "N/A"}${lead.state ? `, ${lead.state}` : ""}</td></tr>
        <tr><td style="padding:4px 12px;font-weight:bold;">Website:</td><td style="padding:4px 12px;">${lead.website || "None"}</td></tr>
      </table>
      <p style="margin-top:16px;">Check the dashboard for details — look for the <b style="color:#f59e0b;">Inbound</b> badge.</p>
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
        subject: `🔥 INBOUND LEAD: ${lead.businessName} (${lead.category || "Unknown"})`,
        content: [{ type: "text/html", value: htmlBody }],
      }),
    });

    await logCost({
      service: "sendgrid_email",
      action: "owner_lead_notification",
      costUsd: COST_RATES.sendgrid_email,
      metadata: { businessName: lead.businessName, type: "inbound_lead_notification" },
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
    const msg = `🔥 BlueJays INBOUND: ${lead.businessName} (${lead.category || "Unknown"}) just submitted the form! Phone: ${lead.phone}. Check dashboard — prioritize this one!`;
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
        metadata: { businessName: lead.businessName, type: "inbound_lead_notification" },
      });
    }
  } catch (err) {
    console.error("[Lead Submit] SMS notification failed:", err);
  }
}

/* ─── PUBLIC endpoint — no auth required ─── */
// Receives an inbound lead submission from the /get-started form
// Sets source = "inbound" so dashboard can prioritize these leads
// Scrapes their info, generates a preview site, notifies owner

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, ownerName, phone, email, website, category, city, state } = body;

  /* ── Validation ── */
  if (!businessName || typeof businessName !== "string" || !businessName.trim()) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (email && typeof email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  // Resolve category — use the submitted value if valid, otherwise default
  const resolvedCategory: Category = (category && validCategories.has(category))
    ? (category as Category)
    : "general-contractor";

  const now = new Date().toISOString();
  const id = uuidv4();

  /* ── Create prospect with source = "inbound" ── */
  const prospect: Prospect = {
    id,
    businessName: businessName.trim(),
    ownerName: ownerName?.trim() || undefined,
    phone: normalizePhone(phone),
    email: email?.trim() || undefined,
    address: "",
    city: canonicalizeCity(city?.trim()) || city?.trim() || "Unknown",
    state: state?.trim() || "",
    category: resolvedCategory,
    currentWebsite: website?.trim() || undefined,
    estimatedRevenueTier: "medium",
    status: "scouted",        // starts in scouted, will advance through pipeline
    source: "inbound",        // KEY: marks this as a self-submitted inbound lead
    createdAt: now,
    updatedAt: now,
  };

  /* ── Scrape their website if they have one ── */
  if (website) {
    try {
      const scraped = await scrapeWebsite(website);
      prospect.scrapedData = scraped;
      prospect.status = "scraped";

      if (scraped?.address) {
        prospect.address = normalizeAddress(scraped.address) || "";
      }
      const resolvedCity = canonicalizeCity(scraped?.city, scraped?.address);
      if (resolvedCity) {
        prospect.city = resolvedCity;
      }

      // Try to detect state from scraped address data if not provided by form
      if (!prospect.state && scraped?.address) {
        const stateMatch = scraped.address.match(/\b([A-Z]{2})\s*\d{5}/);
        if (stateMatch) {
          prospect.state = stateMatch[1];
        }
      }
    } catch {
      // Scrape failed, continue without scraped data
    }
  }

  /* ── Save to store ── */
  await addProspect(prospect);

  /* ── Generate preview site (async — don't block response) ── */
  try {
    await generatePreview(prospect);
  } catch {
    // Generation failed — prospect is still in the system for manual review
  }

  /* ── Alert Ben — inbound lead! ── */
  await alertOwner({
    type: "high-value-lead",
    message: `🔥 INBOUND LEAD: ${businessName} just submitted the form!\nPhone: ${normalizePhone(phone)}\nEmail: ${email || "N/A"}\nOwner: ${ownerName || "N/A"}\nCategory: ${resolvedCategory}\nLocation: ${city || "N/A"}${state ? `, ${state}` : ""}\nWebsite: ${website || "None"}\n\nThis is a warm lead — they came to us! Site is being generated — check dashboard.`,
    prospect,
    timestamp: now,
  });

  /* ── Send email + SMS notifications to Ben ── */
  await Promise.allSettled([
    notifyOwnerEmail({ businessName, phone: normalizePhone(phone), email, category: resolvedCategory, website, city, state, ownerName }),
    notifyOwnerSms({ businessName, phone: normalizePhone(phone), category: resolvedCategory }),
  ]);

  console.log(`  🎯 New INBOUND lead: ${businessName} (${normalizePhone(phone)}) [${resolvedCategory}]`);

  return NextResponse.json({
    success: true,
    message: "Your website is being built! We'll notify you within 48 hours.",
    prospectId: id,
  });
}
