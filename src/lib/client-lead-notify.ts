/**
 * Per-client owner-alert helpers.
 *
 * When a new lead lands in a client's funnel, fire an SMS to the client's
 * owner (NOT Ben — that's what alerts.ts/sendOwnerAlert is for). This is
 * the production "push notification" path that works on every device with
 * no PWA / Web-Push setup required.
 *
 * Idempotent: skips when:
 *   - Twilio creds aren't set (mock mode — logs instead)
 *   - The lead's audience/source is internal/test
 *   - The owner has no phone on file
 *
 * Pattern: see CLAUDE.md "Mobile-First Portal Rules".
 */

import { logCost, COST_RATES } from "./cost-logger";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { ClientLead } from "./client-leads";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function ownerPhoneForSlug(slug: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("client_owners")
    .select("phone")
    .eq("client_slug", slug)
    .limit(1)
    .maybeSingle();
  return (data?.phone as string | null) ?? null;
}

async function clientBrandFor(slug: string): Promise<string> {
  if (!isSupabaseConfigured()) return slug;
  const { data } = await supabase
    .from("clients")
    .select("display_name")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  return (data?.display_name as string | null) ?? slug;
}

function leadHeadline(lead: ClientLead): string {
  const name = lead.name?.trim();
  if (name) return name;
  const phone = lead.phone?.trim();
  if (phone) return phone;
  const email = lead.email?.trim();
  if (email) return email;
  return "Unnamed lead";
}

function portalUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  return `${base}/clients/${slug}/portal`;
}

/**
 * Fires an SMS to the client owner notifying them of a new lead.
 *
 * Skips silently when:
 *   - Twilio creds are unset (dev/mock)
 *   - No owner phone on file
 *   - Lead is from a known test/internal source
 *
 * Always returns; never throws. Lead-creation success is more important
 * than notification delivery — failed notifications log + move on.
 */
export async function notifyOwnerOfNewLead(lead: ClientLead): Promise<void> {
  try {
    // Internal / test sources don't alert.
    if (
      lead.source &&
      ["seed", "test", "internal", "import"].includes(lead.source)
    ) {
      return;
    }

    const ownerPhone = await ownerPhoneForSlug(lead.client_slug);
    if (!ownerPhone) {
      console.log(
        `[lead-notify] No owner phone for ${lead.client_slug} — skipping SMS`,
      );
      return;
    }

    const brand = await clientBrandFor(lead.client_slug);
    const url = portalUrl(lead.client_slug);
    const headline = leadHeadline(lead);
    const audience = lead.audience_segment
      ? ` (${lead.audience_segment})`
      : "";
    const message =
      `🔔 ${brand} · new lead: ${headline}${audience}.\n` +
      `Open the portal: ${url}\n` +
      `Reply STOP to disable lead alerts.`;

    if (
      !TWILIO_ACCOUNT_SID ||
      !TWILIO_AUTH_TOKEN ||
      !TWILIO_PHONE_NUMBER
    ) {
      console.log(
        `[lead-notify] (mock) would SMS ${ownerPhone}:`,
        message.slice(0, 80),
      );
      return;
    }

    const sgRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: ownerPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      },
    );

    if (!sgRes.ok) {
      const err = await sgRes.text().catch(() => "<no body>");
      console.error(
        `[lead-notify] Twilio rejected (status ${sgRes.status}):`,
        err,
      );
      return;
    }

    await logCost({
      service: "twilio_sms",
      action: "client_lead_alert",
      costUsd: COST_RATES.twilio_sms,
      clientSlug: lead.client_slug,
      metadata: { to: ownerPhone, lead_id: lead.id },
    });
  } catch (err) {
    console.error("[lead-notify] threw:", err);
  }
}
