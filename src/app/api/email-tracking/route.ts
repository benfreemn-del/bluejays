import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { processBounce, recordEmailSent } from "@/lib/email-deliverability";
import { getProspectByEmail } from "@/lib/store";

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
