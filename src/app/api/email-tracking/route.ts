import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { processBounce, recordEmailSent } from "@/lib/email-deliverability";
import { getProspectByEmail } from "@/lib/store";
import { sendOwnerAlert } from "@/lib/alerts";

// Auto-pause thresholds — industry standard safety limits
const BOUNCE_RATE_PAUSE = 2.0;  // % — pause funnel above this
const SPAM_RATE_PAUSE   = 0.1;  // % — pause funnel above this
const MIN_SAMPLE_SIZE   = 20;   // don't trigger on first few sends

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

/**
 * SendGrid Event Webhook — receives open, click, delivered, bounce events.
 *
 * Setup: In SendGrid → Settings → Mail Settings → Event Webhook
 * URL: https://bluejayportfolio.com/api/email-tracking
 * Events: Delivered, Opened, Clicked, Bounced, Spam Report, Unsubscribe
 *
 * Now integrates with the deliverability engine for:
 * - Automatic bounce handling (hard bounce removal, soft bounce retry)
 * - Warm-up volume tracking
 * - Open rate monitoring
 */

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: "delivered" | "open" | "click" | "bounce" | "spamreport" | "unsubscribe" | "dropped" | "deferred";
  sg_message_id?: string;
  url?: string;
  useragent?: string;
  ip?: string;
  category?: string[];
  type?: string; // For bounces: "bounce" or "blocked"
  reason?: string; // Bounce reason
  status?: string; // SMTP status code like "550"
}

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json();

    console.log(`[Email Tracking] Received ${events.length} events`);

    for (const event of events) {
      console.log(`  ${event.event.toUpperCase()} — ${event.email} ${event.url ? "-> " + event.url : ""}`);

      // Store in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from("email_events").insert({
            email: event.email,
            event_type: event.event,
            timestamp: new Date(event.timestamp * 1000).toISOString(),
            message_id: event.sg_message_id || null,
            url: event.url || null,
            user_agent: event.useragent || null,
            ip: event.ip || null,
          });
        } catch {
          // Table might not exist yet
        }
      }

      // Handle bounce events through the deliverability engine
      if (event.event === "bounce" || event.event === "dropped") {
        try {
          const prospect = await getProspectByEmail(event.email);
          if (prospect) {
            // Determine bounce type from SMTP status code
            // 5xx = hard bounce (permanent), 4xx = soft bounce (temporary)
            const isHardBounce =
              event.event === "dropped" ||
              (event.status && event.status.startsWith("5")) ||
              (event.reason && (
                event.reason.includes("does not exist") ||
                event.reason.includes("invalid") ||
                event.reason.includes("unknown user") ||
                event.reason.includes("no such user")
              ));

            await processBounce(
              event.email,
              prospect.id,
              isHardBounce ? "hard" : "soft",
              event.reason || event.event
            );
            console.log(`  [Deliverability] Processed ${isHardBounce ? "hard" : "soft"} bounce for ${event.email}`);
          }
        } catch (err) {
          console.error(`  [Deliverability] Bounce processing failed:`, err);
        }
      }

      // Update prospect status on opens and clicks
      if (event.event === "open" || event.event === "click") {
        try {
          const prospect = await getProspectByEmail(event.email);
          if (prospect) {
            const { updateProspect } = await import("@/lib/store");
            const statusPriority: Record<string, number> = {
              scouted: 1, scraped: 2, generated: 3, "pending-review": 4,
              "ready_to_review": 5, approved: 6, contacted: 7,
              email_opened: 8, link_clicked: 9, engaged: 10,
              interested: 11, responded: 12, claimed: 13, paid: 14,
            };
            const currentPriority = statusPriority[prospect.status] || 0;
            const newStatus = event.event === "click" ? "link_clicked" : "email_opened";
            const newPriority = statusPriority[newStatus] || 0;

            if (newPriority > currentPriority) {
              await updateProspect(prospect.id, { status: newStatus as never });
              console.log(`  ✅ ${prospect.businessName}: ${prospect.status} → ${newStatus}`);
            }

            // 🔥 Hot lead alert on FIRST email open — text Ben immediately
            if (event.event === "open" && prospect.status === "contacted") {
              const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`;
              const callLink = prospect.phone ? `tel:${prospect.phone.replace(/\D/g, "")}` : null;
              const msg = [
                `👁 ${prospect.businessName} just opened your email!`,
                `📍 ${prospect.city || ""}${prospect.city && prospect.category ? " · " : ""}${prospect.category || ""}`,
                callLink ? `📞 Call now: ${prospect.phone}` : "",
                `🌐 Preview: ${previewUrl}`,
                `📋 Dashboard: ${BASE_URL}/dashboard`,
              ].filter(Boolean).join("\n");
              await sendOwnerAlert(msg).catch(() => {});
            }
          }
        } catch { /* don't break webhook */ }
      }

      // 🚨 Deliverability tripwire — check bounce/spam rates after each bad event
      if (event.event === "bounce" || event.event === "spamreport") {
        try {
          await checkDeliverabilityTripwire();
        } catch { /* non-critical */ }
      }

      // Track delivered emails for warm-up monitoring
      if (event.event === "delivered") {
        try {
          const domain = event.email.split("@")[1];
          if (domain) {
            recordEmailSent(domain);
          }
        } catch {
          // Non-critical
        }
      }
    }

    return NextResponse.json({ received: events.length });
  } catch (error) {
    console.error("Email tracking webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Also handle GET for webhook validation
export async function GET() {
  return NextResponse.json({ status: "Email tracking webhook active — with deliverability engine" });
}

/**
 * Deliverability tripwire — checks bounce/spam rates and auto-pauses
 * the funnel + texts Ben if thresholds are exceeded.
 */
async function checkDeliverabilityTripwire(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Get last 500 email events for rate calculation
  const { data: events } = await supabase
    .from("email_events")
    .select("event_type")
    .order("timestamp", { ascending: false })
    .limit(500);

  if (!events || events.length < MIN_SAMPLE_SIZE) return;

  const delivered = events.filter((e) => e.event_type === "delivered").length;
  if (delivered === 0) return;

  const bounced = events.filter((e) => e.event_type === "bounce").length;
  const spammed = events.filter((e) => e.event_type === "spamreport").length;

  const bounceRate = (bounced / delivered) * 100;
  const spamRate = (spammed / delivered) * 100;

  const breached = bounceRate >= BOUNCE_RATE_PAUSE || spamRate >= SPAM_RATE_PAUSE;
  if (!breached) return;

  // Auto-pause domain warming
  try {
    const { updateWarmingConfig } = await import("@/lib/domain-warming");
    await updateWarmingConfig({ enabled: false });
  } catch { /* continue to alert even if pause fails */ }

  const reason = bounceRate >= BOUNCE_RATE_PAUSE
    ? `bounce rate ${bounceRate.toFixed(1)}% (limit: ${BOUNCE_RATE_PAUSE}%)`
    : `spam rate ${spamRate.toFixed(2)}% (limit: ${SPAM_RATE_PAUSE}%)`;

  await sendOwnerAlert(
    `🚨 FUNNEL AUTO-PAUSED\n` +
    `Deliverability tripwire triggered: ${reason}\n` +
    `Bounces: ${bounced}/${delivered} | Spam: ${spammed}/${delivered}\n` +
    `Action needed: check SendGrid → fix issue → re-enable warming from dashboard.\n` +
    `${BASE_URL}/deliverability`
  ).catch(() => {});

  console.warn(`[Deliverability Tripwire] PAUSED — ${reason}`);
}
